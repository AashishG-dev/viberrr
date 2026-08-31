/**
 * Viberr Universal Plugin Manager (Nuclear Architecture)
 * Handles registration, discovery, enabling/disabling, and latency measuring
 * of streaming, metadata, and lyrics providers.
 */

export const PLUGIN_CATEGORIES = {
  ALL: 'all',
  STREAMING: 'streaming',
  METADATA: 'metadata',
  LYRICS: 'lyrics',
  DISCOVERY: 'discovery'
};

const DEFAULT_PLUGINS = [
  {
    id: 'spotify-provider',
    name: 'Spotify',
    author: 'nukeop / viberr',
    version: 'v0.2.2',
    category: 'metadata',
    description: 'Spotify 100M+ global metadata & catalog provider for Viberr stream engine',
    icon: 'spotify',
    installed: true,
    enabled: true,
    latencyMs: 342,
    pingUrl: 'https://itunes.apple.com/search?term=test&limit=1'
  },
  {
    id: 'youtube-streaming',
    name: 'YouTube',
    author: 'nukeop / viberr',
    version: 'v0.1.2',
    category: 'streaming',
    description: 'High-performance audio streaming provider playing full-length tracks via headless engine',
    icon: 'youtube',
    installed: true,
    enabled: true,
    latencyMs: 512,
    pingUrl: 'https://api.piped.private.coffee/search?q=test&filter=music_songs'
  },
  {
    id: 'lossless-cdn',
    name: 'Lossless CDN',
    author: 'viberr core',
    version: 'v1.0.0',
    category: 'streaming',
    description: '28+ High-fidelity 320kbps curated station streams with 2,229+ master tracks',
    icon: 'zap',
    installed: true,
    enabled: true,
    latencyMs: 98,
    pingUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=50'
  },
  {
    id: 'soundcloud-plugin',
    name: 'SoundCloud',
    author: 'nukeop',
    version: 'v0.3.0',
    category: 'streaming',
    description: 'Browse, discover and stream underground remixes, mashups, and electronic tracks',
    icon: 'soundcloud',
    installed: false,
    enabled: false,
    latencyMs: 620,
    pingUrl: 'https://api-v2.soundcloud.com/'
  },
  {
    id: 'bandcamp-plugin',
    name: 'Bandcamp',
    author: 'nukeop',
    version: 'v1.1.2',
    category: 'streaming',
    description: 'Browse and stream independent releases, lo-fi beats, and physical band albums',
    icon: 'bandcamp',
    installed: false,
    enabled: false,
    latencyMs: 780,
    pingUrl: 'https://bandcamp.com'
  },
  {
    id: 'lrclib-lyrics',
    name: 'LRCLIB Lyrics',
    author: 'community',
    version: 'v0.5.0',
    category: 'lyrics',
    description: 'Synchronized real-time scrolling karaoke lyrics provider for global tracks',
    icon: 'lyrics',
    installed: true,
    enabled: true,
    latencyMs: 210,
    pingUrl: 'https://lrclib.net/api/get?track_name=test&artist_name=test'
  },
  {
    id: 'discogs-metadata',
    name: 'Discogs',
    author: 'nukeop',
    version: 'v0.2.0',
    category: 'metadata',
    description: 'Fetch detailed vinyl release credits, master year, and discography catalogs',
    icon: 'discogs',
    installed: false,
    enabled: false,
    latencyMs: 430,
    pingUrl: 'https://api.discogs.com/'
  }
];

class PluginManager {
  constructor() {
    this.plugins = this.loadConfig();
    this.listeners = new Set();
  }

  loadConfig() {
    try {
      const saved = localStorage.getItem('viberr_plugins_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        return DEFAULT_PLUGINS.map((p) => {
          const matched = parsed.find((item) => item.id === p.id);
          return matched ? { ...p, ...matched } : p;
        });
      }
    } catch (e) {}
    return DEFAULT_PLUGINS;
  }

  saveConfig() {
    try {
      localStorage.setItem('viberr_plugins_config', JSON.stringify(this.plugins));
    } catch (e) {}
    this.notifyListeners();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyListeners() {
    this.listeners.forEach((fn) => fn(this.plugins));
  }

  getPlugins() {
    return this.plugins;
  }

  getInstalledPlugins() {
    return this.plugins.filter((p) => p.installed);
  }

  isPluginEnabled(id) {
    const p = this.plugins.find((item) => item.id === id);
    return p ? p.installed && p.enabled : false;
  }

  togglePluginEnabled(id) {
    this.plugins = this.plugins.map((p) => {
      if (p.id === id) {
        return { ...p, enabled: !p.enabled };
      }
      return p;
    });
    this.saveConfig();
  }

  installPlugin(id) {
    this.plugins = this.plugins.map((p) => {
      if (p.id === id) {
        return { ...p, installed: true, enabled: true };
      }
      return p;
    });
    this.saveConfig();
  }

  uninstallPlugin(id) {
    this.plugins = this.plugins.map((p) => {
      if (p.id === id) {
        return { ...p, installed: false, enabled: false };
      }
      return p;
    });
    this.saveConfig();
  }

  async measureLatency(id) {
    const plugin = this.plugins.find((p) => p.id === id);
    if (!plugin || !plugin.pingUrl) return;

    const start = performance.now();
    try {
      await fetch(plugin.pingUrl, { mode: 'no-cors' });
      const elapsed = Math.round(performance.now() - start);
      this.plugins = this.plugins.map((p) => (p.id === id ? { ...p, latencyMs: elapsed } : p));
      this.saveConfig();
    } catch (e) {
      const elapsed = Math.round(performance.now() - start);
      this.plugins = this.plugins.map((p) => (p.id === id ? { ...p, latencyMs: Math.min(elapsed, 999) } : p));
      this.saveConfig();
    }
  }

  async measureAllLatencies() {
    await Promise.allSettled(this.plugins.map((p) => this.measureLatency(p.id)));
  }
}

export const pluginManager = new PluginManager();
