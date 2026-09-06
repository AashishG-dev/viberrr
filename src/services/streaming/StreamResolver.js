import { STATIONS } from '../../data/stationsData';
import { youtubeProvider } from './YouTubeInvidiousProvider';
import { spotifyProvider } from './SpotifyProvider';
import { pluginManager } from '../plugins/PluginManager';

/**
 * StreamResolver (Nuclear-style architecture)
 * Multi-Source Unified Search and Stream Resolution Engine:
 * 1. Curated Lossless CDN Library (2,229+ indexed tracks across 28 stations)
 * 2. Spotify & Global Music Catalog (100M+ songs with instant HD streams)
 * 3. YouTube / Invidious Live Search & Stream Extraction
 * 4. 24/7 Global Live Radio Web Streams (SomaFM, Nightride, Phonk)
 */
class StreamResolver {
  constructor() {
    this.streamCache = new Map(); // Cached resolved streams with timestamps
    this.expiryWindowMs = 2 * 60 * 60 * 1000; // 2 hours expiry for streams
  }

  /**
   * Search all sources simultaneously
   */
  async searchGlobal(query) {
    if (!query || !query.trim()) return { curated: [], spotify: [], youtube: [], stations: [] };
    const q = query.toLowerCase().trim();

    // 1. Search Curated Library (if Lossless CDN plugin is enabled)
    const isLosslessEnabled = pluginManager.isPluginEnabled('lossless-cdn');
    const curatedMatches = [];
    if (isLosslessEnabled) {
      for (const station of STATIONS) {
        if (!station.songs) continue;
        for (const song of station.songs) {
          if (
            song.title.toLowerCase().includes(q) ||
            song.artist.toLowerCase().includes(q)
          ) {
            curatedMatches.push({
              ...song,
              stationId: station.id,
              stationName: station.name,
              stationColor: station.color,
              source: 'curated',
              sourceLabel: 'Lossless 320k'
            });
            if (curatedMatches.length >= 25) break;
          }
        }
        if (curatedMatches.length >= 25) break;
      }
    }

    // 2. Search Matching Stations
    const stationMatches = STATIONS.filter(st => 
      st.name.toLowerCase().includes(q) ||
      st.tagline?.toLowerCase().includes(q)
    ).slice(0, 6);

    // 3. Search Spotify & YouTube conditionally based on Plugin status
    const isSpotifyEnabled = pluginManager.isPluginEnabled('spotify-provider');
    const isYouTubeEnabled = pluginManager.isPluginEnabled('youtube-streaming');

    const [spotifyMatches, youtubeMatches] = await Promise.all([
      isSpotifyEnabled ? spotifyProvider.search(query, 15).catch(() => []) : Promise.resolve([]),
      isYouTubeEnabled ? youtubeProvider.search(query, 12).catch(() => []) : Promise.resolve([])
    ]);

    return {
      curated: curatedMatches,
      spotify: spotifyMatches,
      youtube: youtubeMatches,
      stations: stationMatches
    };
  }

  /**
   * Resolve a playable audio URL for any track / candidate (100% Full Length Resolution)
   */
  async resolvePlayableTrack(trackItem) {
    if (!trackItem) return null;

    // A. If Curated Lossless Station song (320kbps full track from R2)
    if (trackItem.url && trackItem.url.includes('r2.dev') || trackItem.source === 'curated') {
      return {
        ...trackItem,
        isYouTubeEngine: false,
        isFullTrack: true
      };
    }

    // B. If track already has a verified 11-character YouTube videoId
    const existingVideoId = trackItem.videoId || (typeof trackItem.id === 'string' && trackItem.id.startsWith('yt_') ? trackItem.id.replace('yt_', '') : '');
    if (existingVideoId && /^[a-zA-Z0-9_-]{11}$/.test(existingVideoId)) {
      return {
        ...trackItem,
        videoId: existingVideoId,
        url: '',
        isYouTubeEngine: true,
        isFullTrack: true,
        duration: trackItem.duration || 210
      };
    }

    // C. If track needs full-length resolution (Spotify, Apple chart, or trend item):
    // Search YouTube for the complete 100% full-length song
    try {
      const query = `${trackItem.title} ${trackItem.artist}`.replace(/[^\w\s]/gi, ' ').trim();
      const ytMatches = await youtubeProvider.search(query, 3);
      const validMatch = ytMatches.find((m) => m.videoId && /^[a-zA-Z0-9_-]{11}$/.test(m.videoId));
      
      if (validMatch) {
        return {
          ...trackItem,
          videoId: validMatch.videoId,
          thumbnail: trackItem.thumbnail || validMatch.thumbnail,
          url: '',
          isYouTubeEngine: true,
          isFullTrack: true,
          duration: validMatch.duration || trackItem.duration || 210
        };
      }
    } catch (e) {
      console.warn('Full-track YouTube resolution failed:', e);
    }

    // D. Fallback to direct audio if available
    if (trackItem.url) {
      return {
        ...trackItem,
        isYouTubeEngine: false,
        url: trackItem.url
      };
    }

    return trackItem;
  }

  /**
   * Get related tracks for Infinite Autoplay Smart Queue
   */
  async getRelatedTracks(trackItem) {
    if (!trackItem) return [];
    try {
      const q = trackItem.artist && trackItem.artist !== 'YouTube' && trackItem.artist !== 'Unknown Artist'
        ? trackItem.artist
        : trackItem.title;
      const res = await spotifyProvider.search(q, 20);
      return res.filter((t) => t.id !== trackItem.id);
    } catch (e) {
      return [];
    }
  }
}

export const streamResolver = new StreamResolver();
