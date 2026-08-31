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

    // A. If Curated Lossless Station song (320kbps full track)
    if (trackItem.source === 'curated') {
      return {
        ...trackItem,
        isYouTubeEngine: false
      };
    }

    // B. If YouTube track: play 100% full length YouTube audio
    if (trackItem.source === 'youtube' || trackItem.videoId) {
      const videoId = trackItem.videoId || trackItem.id.replace(/^yt_/, '');
      return {
        ...trackItem,
        videoId,
        url: '',
        isYouTubeEngine: true,
        isFullTrack: true,
        duration: trackItem.duration || 240
      };
    }

    // C. If Spotify track: resolve full-length YouTube candidate for complete 3-5min song
    if (trackItem.source === 'spotify') {
      try {
        const query = `${trackItem.title} ${trackItem.artist}`.replace(/[^\w\s]/gi, ' ').trim();
        const ytMatches = await youtubeProvider.search(query, 1);
        if (ytMatches.length > 0 && ytMatches[0].videoId) {
          return {
            ...trackItem,
            videoId: ytMatches[0].videoId,
            url: '',
            isYouTubeEngine: true,
            isFullTrack: true,
            duration: ytMatches[0].duration || trackItem.duration || 240
          };
        }
      } catch (e) {}

      return {
        ...trackItem,
        isYouTubeEngine: false
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
