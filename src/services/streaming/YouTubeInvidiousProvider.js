/**
 * YouTubeInvidiousProvider
 * Implements Nuclear-style two-phase stream resolution for YouTube:
 * 1. search(query): Queries open Invidious/Piped mirrors to find matching videos.
 * 2. getAudioStream(videoId): Resolves high-quality audio streams without API keys.
 */

const PIPED_INSTANCES = [
  'https://api.piped.private.coffee',
  'https://pipedapi.kavin.rocks',
  'https://inv.nadeko.net',
  'https://invidious.nerdvpn.de',
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

    // Try Piped first
    try {
      const res = await fetch(`https://api.piped.private.coffee/search?q=${cleanQuery}&filter=music_songs`);
      if (res.ok) {
        const data = await res.json();
        if (data.items && Array.isArray(data.items)) {
          return data.items.slice(0, limit).map((item) => {
            const videoId = item.url ? item.url.replace('/watch?v=', '') : '';
            return {
              id: `yt_${videoId}`,
              videoId: videoId,
              title: item.title || 'Unknown Track',
              artist: item.uploaderName || 'YouTube Artist',
              duration: item.duration || 0,
              thumbnail: item.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
              source: 'youtube',
              sourceLabel: 'YouTube Stream'
            };
          });
        }
      }
    } catch (e) {}

    // Fallback to Invidious instances
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
          return data.slice(0, limit).map((item) => ({
            id: `yt_${item.videoId}`,
            videoId: item.videoId,
            title: item.title || 'Unknown Track',
            artist: item.author || 'YouTube Audio',
            duration: item.lengthSeconds ? parseInt(item.lengthSeconds, 10) : 0,
            thumbnail: item.videoThumbnails?.find((t) => t.quality === 'medium' || t.quality === 'high')?.url ||
                       `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`,
            source: 'youtube',
            sourceLabel: 'YouTube HD'
          }));
        }
      } catch (err) {
        this.rotateInstance();
      }
    }

    return [];
  }

  /**
   * Phase 2: Stream Resolution
   * Resolves direct playable audio URL from videoId
   */
  async resolveAudioStream(videoId) {
    if (!videoId) return null;
    const cleanId = videoId.replace(/^yt_/, '');

    for (let attempt = 0; attempt < INVIDIOUS_INSTANCES.length; attempt++) {
      const instance = this.getActiveInstance();
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        // Fetch video stream metadata
        const res = await fetch(`${instance}/api/v1/videos/${cleanId}`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
          this.rotateInstance();
          continue;
        }

        const data = await res.json();
        
        // Find best audio stream format (e.g. audio/mp4 or audio/webm)
        if (data.adaptiveFormats && Array.isArray(data.adaptiveFormats)) {
          const audioFormats = data.adaptiveFormats.filter((f) => f.type && f.type.startsWith('audio/'));
          
          // Sort by highest bitrate / quality
          audioFormats.sort((a, b) => (parseInt(b.bitrate || '0', 10) - parseInt(a.bitrate || '0', 10)));

          if (audioFormats.length > 0 && audioFormats[0].url) {
            return {
              url: audioFormats[0].url,
              bitrate: audioFormats[0].bitrate || '160k',
              format: audioFormats[0].container || 'm4a',
              duration: data.lengthSeconds ? parseInt(data.lengthSeconds, 10) : 0,
              title: data.title,
              artist: data.author,
              thumbnail: `https://i.ytimg.com/vi/${cleanId}/hqdefault.jpg`
            };
          }
        }

        // Direct stream fallback
        const fallbackUrl = `${instance}/latest_version?id=${cleanId}&itag=140`;
        return {
          url: fallbackUrl,
          bitrate: '140k',
          format: 'm4a',
          duration: data.lengthSeconds ? parseInt(data.lengthSeconds, 10) : 0,
          title: data.title,
          artist: data.author,
          thumbnail: `https://i.ytimg.com/vi/${cleanId}/hqdefault.jpg`
        };
      } catch (err) {
        this.rotateInstance();
      }
    }

    // Direct proxy fallback
    return {
      url: `https://invidious.nerdvpn.de/latest_version?id=${cleanId}&itag=140`,
      bitrate: '140k',
      format: 'm4a',
      duration: 0,
      title: 'YouTube Audio Stream',
      artist: 'YouTube',
      thumbnail: `https://i.ytimg.com/vi/${cleanId}/hqdefault.jpg`
    };
  }
}

export const youtubeProvider = new YouTubeInvidiousProvider();
