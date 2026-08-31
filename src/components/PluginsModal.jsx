import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Blocks,
  X,
  Search,
  RotateCw,
  Trash2,
  Download,
  Check,
  Zap,
  Radio,
  FileText,
  Disc,
  Flame,
  Activity
} from 'lucide-react';
import { pluginManager } from '../services/plugins/PluginManager';

// Custom Brand Icons
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

const SoundCloudBrandIcon = ({ className = 'w-5 h-5 text-amber-500' }) => (
  <Flame className={className} />
);

export default function PluginsModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('installed'); // 'installed' | 'store'
  const [storeCategory, setStoreCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [plugins, setPlugins] = useState(() => pluginManager.getPlugins());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const unsub = pluginManager.subscribe((newPlugins) => {
      setPlugins([...newPlugins]);
    });
    return unsub;
  }, []);

  // Measure latency on open
  useEffect(() => {
    if (isOpen) {
      pluginManager.measureAllLatencies();
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
        return <SoundCloudBrandIcon />;
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
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-2xl pointer-events-auto transition-all"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 25 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-3xl max-h-[85vh] rounded-3xl glass-panel-neon border border-white/20 shadow-2xl p-5 sm:p-7 overflow-hidden flex flex-col relative bg-[#130911]/95 text-white"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 shadow-inner">
                <Blocks className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold font-syne text-white leading-tight">
                  Plugins
                </h3>
                <p className="text-xs font-mono text-white/50">
                  Nuclear-Style Multi-Source Streaming & Metadata Engine
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="glass-button p-2.5 rounded-full text-white/70 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Tabs (Installed / Store) */}
          <div className="flex items-center gap-2 pt-4 pb-2 flex-shrink-0">
            <button
              onClick={() => setActiveTab('installed')}
              className={`px-4 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                activeTab === 'installed'
                  ? 'bg-pink-600/30 border border-pink-500/60 text-pink-200 shadow-lg'
                  : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
              }`}
            >
              Installed ({installedList.length})
            </button>
            <button
              onClick={() => setActiveTab('store')}
              className={`px-4 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                activeTab === 'store'
                  ? 'bg-pink-600/30 border border-pink-500/60 text-pink-200 shadow-lg'
                  : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
              }`}
            >
              Store ({plugins.length})
            </button>
          </div>

          {/* Store Search & Category Filter */}
          {activeTab === 'store' && (
            <div className="pt-2 pb-3 space-y-2 flex-shrink-0">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 absolute left-3.5 text-white/40 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search plugins..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 text-white placeholder-white/40 text-xs rounded-xl pl-10 pr-4 py-2 outline-none border border-white/10 focus:border-pink-400/60 transition-all font-space"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto custom-scroll pb-1 text-[11px] font-mono">
                {['all', 'streaming', 'metadata', 'lyrics', 'discovery'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setStoreCategory(cat)}
                    className={`px-2.5 py-0.8 rounded-lg capitalize transition-all cursor-pointer ${
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

          {/* Content List */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 mt-2 custom-scroll min-h-[300px]">
            {activeTab === 'installed' ? (
              installedList.length === 0 ? (
                <div className="py-16 text-center text-white/40 text-xs font-mono">
                  [ NO PLUGINS INSTALLED. GO TO STORE TO INSTALL. ]
                </div>
              ) : (
                installedList.map((plugin) => (
                  <div
                    key={plugin.id}
                    className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 transition-all flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center flex-shrink-0">
                        {renderIcon(plugin.icon)}
                      </div>
                      <div className="min-w-0 flex-1 truncate">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold font-syne text-white">
                            {plugin.name}
                          </h4>
                          <span className="text-[10px] text-white/40 font-mono">
                            by {plugin.author}
                          </span>
                        </div>
                        <p className="text-xs text-white/60 font-space truncate mt-0.5">
                          {plugin.description}
                        </p>
                      </div>
                    </div>

                    {/* Actions & Metrics */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                      {/* Latency Pill */}
                      {plugin.latencyMs !== undefined && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-white/70">
                          <Activity className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
                          <span>{plugin.latencyMs}ms</span>
                        </div>
                      )}

                      {/* Version Pill */}
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                        {plugin.version}
                      </span>

                      {/* Toggle Switch */}
                      <button
                        onClick={() => pluginManager.togglePluginEnabled(plugin.id)}
                        className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer relative ${
                          plugin.enabled ? 'bg-pink-600' : 'bg-white/20'
                        }`}
                        title={plugin.enabled ? 'Disable Plugin' : 'Enable Plugin'}
                      >
                        <motion.div
                          animate={{ x: plugin.enabled ? 20 : 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="w-5 h-5 rounded-full bg-white shadow-md"
                        />
                      </button>

                      {/* Reload Latency */}
                      <button
                        onClick={() => handleRefreshLatency(plugin.id)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition-all cursor-pointer"
                        title="Measure Connection Latency"
                      >
                        <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                      </button>

                      {/* Uninstall Button (if not core) */}
                      {plugin.id !== 'lossless-cdn' && (
                        <button
                          onClick={() => pluginManager.uninstallPlugin(plugin.id)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-300 transition-all cursor-pointer"
                          title="Uninstall Plugin"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )
            ) : (
              storeList.map((plugin) => (
                <div
                  key={plugin.id}
                  className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 transition-all flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center flex-shrink-0">
                      {renderIcon(plugin.icon)}
                    </div>
                    <div className="min-w-0 flex-1 truncate">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold font-syne text-white">
                          {plugin.name}
                        </h4>
                        <span className="text-[10px] text-white/40 font-mono">
                          by {plugin.author}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-300 uppercase">
                          {plugin.category}
                        </span>
                      </div>
                      <p className="text-xs text-white/60 font-space truncate mt-0.5">
                        {plugin.description}
                      </p>
                    </div>
                  </div>

                  {/* Install Action */}
                  <div className="flex-shrink-0">
                    {plugin.installed ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 text-white/60 text-xs font-mono">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Installed</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => pluginManager.installPlugin(plugin.id)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-pink-600/40 hover:bg-pink-600 border border-pink-500/50 text-white text-xs font-mono font-bold transition-all cursor-pointer hover:scale-105 shadow-md"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Install</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
