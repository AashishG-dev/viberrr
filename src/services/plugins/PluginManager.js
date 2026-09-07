/*
 * Viberr Universal Plugin Manager ( Architecture)
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
    name: 'Neural Spectral Index',
    author: 'Observatory Protocol',
    version: 'v0.2.2',
    category: 'metadata',
    description: 'High-density acoustic metadata resolver and global discography index',
    icon: 'spotify',
    installed: true,
    enabled: true,
    latencyMs: 342,
    pingUrl: 'https://itunes.apple.com/search?term=test&limit=1'
  },
  {
    id: 'youtube-streaming',
    name: 'Sovereign Airplay Dispatch',
    author: 'Observatory Protocol',
    version: 'v0.1.2',
    category: 'streaming',
    description: 'Headless continuous wave carrier resolving low-latency acoustic feeds',
    icon: 'youtube',
    installed: true,
    enabled: true,
    latencyMs: 512,
    pingUrl: 'https://api.piped.private.coffee/search?q=test&filter=music_songs'
  },
  {
    id: 'lossless-cdn',
    name: 'Lossless Matrix Core',
    author: 'Viberr Engineering',
    version: 'v1.0.0',
    category: 'streaming',
    description: 'High-fidelity 24-bit 96kHz curated acoustic station channels & uncompressed cuts',
    icon: 'zap',
    installed: true,
    enabled: true,
    latencyMs: 98,
    pingUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=50'
  },
  {
    id: 'soundcloud-plugin',
    name: 'Acoustic Underground Node',
    author: 'Observatory Protocol',
    version: 'v0.3.0',
    category: 'streaming',
    description: 'Autonomous frequency discovery, live sets, and unreleased master stems',
    icon: 'soundcloud',
    installed: false,
    enabled: false,
    latencyMs: 620,
    pingUrl: 'https://api-v2.soundcloud.com/'
  },
  {
    id: 'bandcamp-plugin',
    name: 'Master Press Archive',
    author: 'Observatory Protocol',
    version: 'v1.1.2',
    category: 'streaming',
    description: 'Direct studio session tape transfers, lo-fi cuts, and physical archive matrices',
    icon: 'bandcamp',
    installed: false,
    enabled: false,
    latencyMs: 780,
    pingUrl: 'https://bandcamp.com'
  },
  {
    id: 'lrclib-lyrics',
    name: 'Realtime Phonetic Synchronizer',
    author: 'Acoustic Labs',
    version: 'v0.5.0',
    category: 'lyrics',
    description: 'Sub-millisecond karaoke lyric alignment and phonetic wave tracking',
    icon: 'lyrics',
    installed: true,
    enabled: true,
    latencyMs: 210,
    pingUrl: 'https://lrclib.net/api/get?track_name=test&artist_name=test'
  },
  {
    id: 'discogs-metadata',
    name: 'Analog Pressing Registry',
    author: 'Observatory Protocol',
    version: 'v0.2.0',
    category: 'metadata',
    description: 'Deep vinyl release credits, master recording dates, and archive press data',
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
          return matched 
            ? { ...p, installed: matched.installed, enabled: matched.enabled, latencyMs: matched.latencyMs || p.latencyMs } 
            : p;
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
