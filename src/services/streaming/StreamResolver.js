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
   * Calculate smart relevancy score for a track against a query
   */
  scoreRelevance(track, query) {
    if (!track || !query) return 0;
    const q = query.toLowerCase().trim();
    const title = (track.title || '').toLowerCase().trim();
    const artist = (track.artist || '').toLowerCase().trim();

    let score = 0;

    // Exact matches
    if (title === q) score += 120;
    else if (title.startsWith(q)) score += 85;
    else if (title.includes(q)) score += 50;

    if (artist === q) score += 60;
    else if (artist.startsWith(q)) score += 40;
    else if (artist.includes(q)) score += 25;

    // Token matches for multi-word queries like "Let her go", "Never fold"
    const qTokens = q.split(/\s+/).filter(Boolean);
    let matchedTokens = 0;
    for (const token of qTokens) {
      if (title.includes(token)) {
        score += 20;
        matchedTokens++;
      }
      if (artist.includes(token)) {
        score += 12;
        matchedTokens++;
      }
    }

    if (qTokens.length > 1 && matchedTokens >= qTokens.length) {
      score += 35;
    }

    // High quality stream bonuses
    if (track.source === 'curated' || (track.url && track.url.includes('r2.dev'))) {
      score += 15;
    }
    if (track.videoId) {
      score += 10;
    }

    return score;
  }

  /**
   * Search all sources simultaneously with Smart Unified Relevancy
   */
  async searchGlobal(query) {
    if (!query || !query.trim()) {
      return { curated: [], spotify: [], youtube: [], stations: [], allRanked: [], topMatch: null };
    }
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

    // 3. Search Spotify & YouTube concurrently with resilient Promise.allSettled
    const isSpotifyEnabled = pluginManager.isPluginEnabled('spotify-provider');
    const isYouTubeEnabled = pluginManager.isPluginEnabled('youtube-streaming');

    const results = await Promise.allSettled([
      isSpotifyEnabled ? spotifyProvider.search(query, 16) : Promise.resolve([]),
      isYouTubeEnabled ? youtubeProvider.search(query, 14) : Promise.resolve([])
    ]);

    const spotifyMatches = results[0].status === 'fulfilled' && Array.isArray(results[0].value) ? results[0].value : [];
    const youtubeMatches = results[1].status === 'fulfilled' && Array.isArray(results[1].value) ? results[1].value : [];

    // 4. Unified Relevancy Ranking & Deduplication
    const rawPool = [...curatedMatches, ...spotifyMatches, ...youtubeMatches];
    const scoredMap = new Map();

    for (const item of rawPool) {
      if (!item || !item.title) continue;
      const score = this.scoreRelevance(item, q);
      const cleanTitle = item.title.toLowerCase().replace(/[^\w]/g, '').slice(0, 15);
      const cleanArtist = (item.artist || '').toLowerCase().replace(/[^\w]/g, '').slice(0, 8);
      const dedupKey = `${cleanTitle}_${cleanArtist}`;

      if (!scoredMap.has(dedupKey) || score > scoredMap.get(dedupKey).relevanceScore) {
        scoredMap.set(dedupKey, { ...item, relevanceScore: score });
      }
    }

    const allRanked = Array.from(scoredMap.values()).sort(
      (a, b) => b.relevanceScore - a.relevanceScore
    );

    const topMatch = allRanked.length > 0 && allRanked[0].relevanceScore > 40 ? allRanked[0] : (allRanked[0] || null);

    return {
      curated: curatedMatches,
      spotify: spotifyMatches,
      youtube: youtubeMatches,
      stations: stationMatches,
      allRanked,
      topMatch
    };
  }

  /**
   * Resolve a playable audio URL for any track / candidate (100% Full Length Resolution)
   */
  async resolvePlayableTrack(trackItem) {
    if (!trackItem) return null;

    const cacheKey = trackItem.id || `${trackItem.title}_${trackItem.artist}`;
    const cached = this.streamCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < this.expiryWindowMs)) {
      return cached.data;
    }

    // A. If Curated Lossless Station song (320kbps full track from R2)
    if ((trackItem.url && trackItem.url.includes('r2.dev')) || trackItem.source === 'curated') {
      const result = {
        ...trackItem,
        isYouTubeEngine: false,
        isFullTrack: true
      };
      this.streamCache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    }

    // B. If track already has a verified 11-character YouTube videoId
    const existingVideoId = trackItem.videoId || (typeof trackItem.id === 'string' && trackItem.id.startsWith('yt_') ? trackItem.id.replace('yt_', '') : '');
    if (existingVideoId && /^[a-zA-Z0-9_-]{11}$/.test(existingVideoId)) {
      // Try resolving direct audio stream first for mobile background stability
      try {
        const directAudio = await youtubeProvider.resolveAudioStream(existingVideoId);
        if (directAudio && directAudio.url) {
          const result = {
            ...trackItem,
            videoId: existingVideoId,
            url: directAudio.url,
            isYouTubeEngine: false,
            isFullTrack: true,
            duration: directAudio.duration || trackItem.duration || 210,
            thumbnail: directAudio.thumbnail || trackItem.thumbnail
          };
          this.streamCache.set(cacheKey, { data: result, timestamp: Date.now() });
          return result;
        }
      } catch (e) {
        // Fall back to YouTube headless engine
      }

      const result = {
        ...trackItem,
        videoId: existingVideoId,
        url: '',
        isYouTubeEngine: true,
        isFullTrack: true,
        duration: trackItem.duration || 210
      };
      this.streamCache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    }

    // C. If track needs full-length resolution (Spotify, Apple chart, or trend item):
    // Search YouTube for the complete 100% full-length song
    try {
      const query = `${trackItem.title} ${trackItem.artist}`.replace(/[^\w\s]/gi, ' ').trim();
      const ytMatches = await youtubeProvider.search(query, 3);
      const validMatch = ytMatches.find((m) => m.videoId && /^[a-zA-Z0-9_-]{11}$/.test(m.videoId));
      
      if (validMatch) {
        // Try extracting direct audio stream from the match
        try {
          const directAudio = await youtubeProvider.resolveAudioStream(validMatch.videoId);
          if (directAudio && directAudio.url) {
            const result = {
              ...trackItem,
              videoId: validMatch.videoId,
              thumbnail: trackItem.thumbnail || directAudio.thumbnail || validMatch.thumbnail,
              url: directAudio.url,
              isYouTubeEngine: false,
              isFullTrack: true,
              duration: directAudio.duration || validMatch.duration || trackItem.duration || 210
            };
            this.streamCache.set(cacheKey, { data: result, timestamp: Date.now() });
            return result;
          }
        } catch (e) {}

        const result = {
          ...trackItem,
          videoId: validMatch.videoId,
          thumbnail: trackItem.thumbnail || validMatch.thumbnail,
          url: '',
          isYouTubeEngine: true,
          isFullTrack: true,
          duration: validMatch.duration || trackItem.duration || 210
        };
        this.streamCache.set(cacheKey, { data: result, timestamp: Date.now() });
        return result;
      }
    } catch (e) {
      console.warn('Full-track YouTube resolution failed:', e);
    }

    // D. Fallback to direct audio if available
    if (trackItem.url) {
      const result = {
        ...trackItem,
        isYouTubeEngine: false,
        url: trackItem.url
      };
      this.streamCache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
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
