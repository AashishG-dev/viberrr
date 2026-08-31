import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Blocks, Search, RotateCw, Trash2, Download, Check, Zap, Radio, FileText, Disc, Flame, Activity, Sparkles } from 'lucide-react';
import { pluginManager } from '../services/plugins/PluginManager';

const SpotifyBrandIcon = ({ className = 'w-5 h-5 text-emerald-400' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.485 17.306c-.215.353-.674.464-1.026.25-2.809-1.716-6.345-2.104-10.51-1.152-.403.092-.808-.163-.9-.566-.092-.403.163-.808.566-.9 4.568-1.044 8.497-.601 11.62 1.342.352.215.464.674.25 1.026zm1.464-3.257c-.27.44-.848.58-1.288.31-3.216-1.977-8.118-2.548-11.921-1.393-.497.15-1.029-.133-1.18-.63-.15-.497.133-1.03.63-1.18 4.348-1.32 9.754-.68 13.449 1.595.44.27.58.848.31 1.288zm.126-3.41c-3.856-2.29-10.222-2.5-13.896-1.385-.592.18-1.222-.154-1.402-.746-.18-.592.154-1.222.746-1.402 4.227-1.283 11.26-1.038 15.69 1.593.533.316.708 1.011.392 1.544-.316.533-1.011.708-1.544.392z"/>
  </svg>
);

const YouTubeBrandIcon = ({ className = 'w-5 h-5 text-red-400' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.377.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export default function PluginsPage() {
  const [activeTab, setActiveTab] = useState('installed');
  const [storeCategory, setStoreCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [plugins, setPlugins] = useState(() => pluginManager.getPlugins());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const unsub = pluginManager.subscribe((newPlugins) => {
      setPlugins([...newPlugins]);
    });
    pluginManager.measureAllLatencies();
    return unsub;
  }, []);

  const installedList = plugins.filter((p) => p.installed);
  const storeList = plugins.filter((p) => {
    const matchesCat = storeCategory === 'all' || p.category === storeCategory;
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleRefreshLatency = async (id) => {
    setIsRefreshing(true);
    await pluginManager.measureLatency(id);
    setIsRefreshing(false);
  };

  const renderIcon = (iconKey) => {
    switch (iconKey) {
      case 'spotify':
        return <SpotifyBrandIcon />;
      case 'youtube':
        return <YouTubeBrandIcon />;
      case 'zap':
        return <Zap className="w-5 h-5 text-cyan-400" />;
      case 'soundcloud':
        return <Flame className="w-5 h-5 text-amber-500" />;
      case 'bandcamp':
        return <Radio className="w-5 h-5 text-teal-400" />;
      case 'lyrics':
        return <FileText className="w-5 h-5 text-purple-400" />;
      case 'discogs':
        return <Disc className="w-5 h-5 text-orange-400" />;
      default:
        return <Blocks className="w-5 h-5 text-white/70" />;
    }
  };

  return (
    <div className="w-full flex-1 overflow-y-auto px-3 sm:px-8 py-6 pb-28 custom-scroll max-w-[1720px] mx-auto text-white">
      {/* Header */}
      <div className="relative rounded-3xl p-6 sm:p-10 mb-8 overflow-hidden glass-panel-neon border border-white/20 bg-gradient-to-r from-pink-950/60 via-purple-950/40 to-black/80 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 border border-pink-400/40 text-pink-300 text-xs font-mono mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>NUCLEAR-STYLE STREAMING & METADATA ARCHITECTURE</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black font-syne text-white tracking-tight leading-tight">
            Universal Plugin Center
          </h2>
          <p className="text-xs sm:text-sm text-white/60 font-space mt-2 leading-relaxed">
            Manage multi-source streaming providers, real-time metadata resolution, lyrics syncing, and connection latencies.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setActiveTab('installed')}
          className={`px-5 py-2 rounded-2xl text-xs font-mono font-bold transition-all cursor-pointer ${
            activeTab === 'installed'
              ? 'bg-pink-600/30 border border-pink-500/60 text-pink-200 shadow-lg'
              : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
          }`}
        >
          Installed Plugins ({installedList.length})
        </button>
        <button
          onClick={() => setActiveTab('store')}
          className={`px-5 py-2 rounded-2xl text-xs font-mono font-bold transition-all cursor-pointer ${
            activeTab === 'store'
              ? 'bg-pink-600/30 border border-pink-500/60 text-pink-200 shadow-lg'
              : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
          }`}
        >
          Plugin Store ({plugins.length})
        </button>
      </div>

      {/* Store Filters */}
      {activeTab === 'store' && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-4 text-white/40 pointer-events-none top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search plugins by name, feature, or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 text-white placeholder-white/40 text-xs sm:text-sm rounded-2xl pl-11 pr-4 py-2.5 outline-none border border-white/10 focus:border-pink-400/60 transition-all font-space"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto custom-scroll text-xs font-mono">
            {['all', 'streaming', 'metadata', 'lyrics', 'discovery'].map((cat) => (
              <button
                key={cat}
                onClick={() => setStoreCategory(cat)}
                className={`px-3 py-2 rounded-xl capitalize whitespace-nowrap transition-all cursor-pointer ${
                  storeCategory === cat
                    ? 'bg-pink-500/30 border border-pink-400/50 text-pink-200 font-bold'
                    : 'bg-white/5 border border-white/10 text-white/50 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {(activeTab === 'installed' ? installedList : storeList).map((plugin) => (
          <div
            key={plugin.id}
            className="p-4 sm:p-5 rounded-3xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="w-12 h-12 rounded-2xl bg-black/40 border border-white/15 flex items-center justify-center flex-shrink-0 shadow-inner">
                {renderIcon(plugin.icon)}
              </div>
              <div className="min-w-0 flex-1 truncate">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-base font-bold font-syne text-white">{plugin.name}</h4>
                  <span className="text-xs text-white/40 font-mono">by {plugin.author}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 uppercase">
                    {plugin.category}
                  </span>
                </div>
                <p className="text-xs text-white/60 font-space truncate mt-1">{plugin.description}</p>
              </div>
            </div>

            {/* Metrics & Actions */}
            <div className="flex items-center gap-3 self-end sm:self-center flex-shrink-0">
              {plugin.latencyMs !== undefined && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-white/80">
                  <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
                  <span>{plugin.latencyMs}ms</span>
                </div>
              )}

              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-white/10 text-white/60">
                {plugin.version}
              </span>

              {activeTab === 'installed' ? (
                <>
                  <button
                    onClick={() => pluginManager.togglePluginEnabled(plugin.id)}
                    className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer relative ${
                      plugin.enabled ? 'bg-pink-600' : 'bg-white/20'
                    }`}
                    title={plugin.enabled ? 'Disable Plugin' : 'Enable Plugin'}
                  >
                    <motion.div
                      animate={{ x: plugin.enabled ? 24 : 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="w-5 h-5 rounded-full bg-white shadow-md"
                    />
                  </button>

                  <button
                    onClick={() => handleRefreshLatency(plugin.id)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition-all cursor-pointer"
                    title="Measure Ping Latency"
                  >
                    <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </button>

                  {plugin.id !== 'lossless-cdn' && (
                    <button
                      onClick={() => pluginManager.uninstallPlugin(plugin.id)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-300 transition-all cursor-pointer"
                      title="Uninstall Plugin"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </>
              ) : plugin.installed ? (
                <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 text-white/60 text-xs font-mono">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Installed</span>
                </div>
              ) : (
                <button
                  onClick={() => pluginManager.installPlugin(plugin.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-600/40 hover:bg-pink-600 border border-pink-500/50 text-white text-xs font-mono font-bold transition-all cursor-pointer shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Install</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
