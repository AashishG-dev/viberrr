/**
 * YouTubeInvidiousProvider
 * Implements Nuclear-style two-phase stream resolution for YouTube:
 * 1. search(query): Queries open Invidious/Piped mirrors to find matching videos.
 * 2. resolveAudioStream(videoId): Resolves high-quality audio streams without API keys.
 */

const PIPED_INSTANCES = [
  'https://api.piped.private.coffee',
  'https://pipedapi.tokhmi.xyz',
  'https://inv.nadeko.net',
  'https://yewtu.be'
];

export class YouTubeInvidiousProvider {
  constructor() {
    this.name = 'YouTube / Invidious Engine';
    this.id = 'youtube-invidious';
    this.activeInstanceIndex = 0;
  }

  getActiveInstance() {
    return PIPED_INSTANCES[this.activeInstanceIndex % PIPED_INSTANCES.length];
  }

  rotateInstance() {
    this.activeInstanceIndex = (this.activeInstanceIndex + 1) % PIPED_INSTANCES.length;
  }

  /**
   * Phase 1: Candidate Search
   * Searches YouTube for video candidates matching title / artist / query
   */
  async search(query, limit = 12) {
    if (!query || !query.trim()) return [];
    const cleanQuery = encodeURIComponent(query.trim());

    // Try Piped first (CORS: * open mirror)
    try {
      const res = await fetch(`https://api.piped.private.coffee/search?q=${cleanQuery}&filter=music_songs`);
      if (res.ok) {
        const data = await res.json();
        if (data.items && Array.isArray(data.items)) {
          const results = [];
          for (const item of data.items) {
            const rawId = item.url ? (item.url.split('v=')[1] || item.url.replace('/watch?v=', '')) : '';
            if (rawId && /^[a-zA-Z0-9_-]{11}$/.test(rawId)) {
              results.push({
                id: `yt_${rawId}`,
                videoId: rawId,
                title: item.title || 'Unknown Track',
                artist: item.uploaderName || 'YouTube Artist',
                duration: item.duration || 210,
                thumbnail: item.thumbnail || `https://i.ytimg.com/vi/${rawId}/hqdefault.jpg`,
                source: 'youtube',
                sourceLabel: 'YouTube Full Track'
              });
            }
            if (results.length >= limit) break;
          }
          if (results.length > 0) return results;
        }
      }
    } catch (e) {}

    // Fallback across mirrors
    for (let attempt = 0; attempt < PIPED_INSTANCES.length; attempt++) {
      const instance = this.getActiveInstance();
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const res = await fetch(`${instance}/api/v1/search?q=${cleanQuery}&type=video`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
          this.rotateInstance();
          continue;
        }

        const data = await res.json();
        if (Array.isArray(data)) {
          const results = [];
          for (const item of data) {
            const rawId = item.videoId;
            if (rawId && /^[a-zA-Z0-9_-]{11}$/.test(rawId)) {
              results.push({
                id: `yt_${rawId}`,
                videoId: rawId,
                title: item.title || 'Unknown Track',
                artist: item.author || 'YouTube Audio',
                duration: item.lengthSeconds ? parseInt(item.lengthSeconds, 10) : 210,
                thumbnail: item.videoThumbnails?.find((t) => t.quality === 'medium' || t.quality === 'high')?.url ||
                           `https://i.ytimg.com/vi/${rawId}/hqdefault.jpg`,
                source: 'youtube',
                sourceLabel: 'YouTube HD'
              });
            }
            if (results.length >= limit) break;
          }
          if (results.length > 0) return results;
        }
      } catch (err) {
        this.rotateInstance();
      }
    }

    return [];
  }

  /**
   * Phase 2: Stream Resolution
   */
  async resolveAudioStream(videoId) {
    if (!videoId) return null;
    const cleanId = videoId.replace(/^yt_/, '');

    for (let attempt = 0; attempt < PIPED_INSTANCES.length; attempt++) {
      const instance = this.getActiveInstance();
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const res = await fetch(`${instance}/api/v1/videos/${cleanId}`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
          this.rotateInstance();
          continue;
        }

        const data = await res.json();
        if (data.adaptiveFormats && Array.isArray(data.adaptiveFormats)) {
          const audioFormats = data.adaptiveFormats.filter((f) => f.type && f.type.startsWith('audio/'));
          audioFormats.sort((a, b) => (parseInt(b.bitrate || '0', 10) - parseInt(a.bitrate || '0', 10)));

          if (audioFormats.length > 0 && audioFormats[0].url) {
            return {
              url: audioFormats[0].url,
              bitrate: audioFormats[0].bitrate || '160k',
              format: audioFormats[0].container || 'm4a',
              duration: data.lengthSeconds ? parseInt(data.lengthSeconds, 10) : 210,
              title: data.title,
              artist: data.author,
              thumbnail: `https://i.ytimg.com/vi/${cleanId}/hqdefault.jpg`
            };
          }
        }
      } catch (err) {
        this.rotateInstance();
      }
    }

    return null;
  }
}

export const youtubeProvider = new YouTubeInvidiousProvider();
