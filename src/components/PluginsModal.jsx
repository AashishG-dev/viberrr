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
  Activity,
  Waves
} from 'lucide-react';
import { pluginManager } from '../services/plugins/PluginManager';

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
        return <Activity className="w-4 h-4 text-[#00f0ff]" />;
      case 'youtube':
        return <Waves className="w-4 h-4 text-[#cfc6b0]" />;
      case 'zap':
        return <Zap className="w-4 h-4 text-[#00f0ff]" />;
      case 'soundcloud':
        return <Flame className="w-4 h-4 text-[#cfc6b0]" />;
      case 'bandcamp':
        return <Radio className="w-4 h-4 text-[#cfc6b0]" />;
      case 'lyrics':
        return <FileText className="w-4 h-4 text-[#cfc6b0]" />;
      case 'discogs':
        return <Disc className="w-4 h-4 text-[#cfc6b0]" />;
      default:
        return <Blocks className="w-4 h-4 text-[#cfc6b0]" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0d0e11]/85 backdrop-blur-md pointer-events-auto transition-all"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-3xl max-h-[85vh] bg-[#121316] border border-[#cfc6b0]/35 shadow-2xl p-5 sm:p-7 overflow-hidden flex flex-col relative text-[#FAF8F5] pointer-events-auto z-50 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Corner Crosshairs */}
            <span className="cad-corner cad-tl" />
            <span className="cad-corner cad-tr" />
            <span className="cad-corner cad-bl" />
            <span className="cad-corner cad-br" />

            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#cfc6b0]/20 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 border border-[#cfc6b0]/30 flex items-center justify-center text-[#cfc6b0] bg-[#18191d]">
                <Blocks className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="telemetry-tag">
                    CAD // 04 AUDIO DRIVER MATRIX
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-serif text-[#FAF8F5] uppercase tracking-wider mt-0.5">
                  Audio Driver & Relay Architecture
                </h3>
                <p className="text-[10px] font-mono text-[#FAF8F5]/40">
                  Observatory Multi-Node Audio Engine & Telemetry Mesh
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 border border-[#cfc6b0]/30 text-[#FAF8F5]/70 hover:text-[#121316] hover:bg-[#FAF8F5] transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Tabs (Installed / Store) */}
          <div className="flex items-center gap-2 pt-4 pb-2 flex-shrink-0 font-mono text-xs">
            <button
              onClick={() => setActiveTab('installed')}
              className={`px-3.5 py-1.5 uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'installed'
                  ? 'wireframe-btn-accent font-bold'
                  : 'wireframe-btn opacity-60 hover:opacity-100'
              }`}
            >
              01 INSTALLED DRIVERS ({installedList.length})
            </button>
            <button
              onClick={() => setActiveTab('store')}
              className={`px-3.5 py-1.5 uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'store'
                  ? 'wireframe-btn-accent font-bold'
                  : 'wireframe-btn opacity-60 hover:opacity-100'
              }`}
            >
              02 DRIVER REGISTRY ({plugins.length})
            </button>
          </div>

          {/* Store Search & Category Filter */}
          {activeTab === 'store' && (
            <div className="pt-2 pb-3 space-y-2 flex-shrink-0">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 absolute left-3.5 text-[#cfc6b0] pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter driver matrix by keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#18191d] text-[#FAF8F5] placeholder-[#FAF8F5]/40 text-xs pl-9 pr-4 py-2 outline-none border border-[#cfc6b0]/25 focus:border-[#cfc6b0] font-mono"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto custom-scroll pb-1 text-[10px] font-mono">
                {['all', 'streaming', 'metadata', 'lyrics', 'discovery'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setStoreCategory(cat)}
                    className={`px-2.5 py-1 uppercase tracking-wider transition-all cursor-pointer ${
                      storeCategory === cat
                        ? 'wireframe-btn-cyan font-bold'
                        : 'wireframe-btn opacity-60 hover:opacity-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Content List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 mt-2 custom-scroll min-h-[300px]">
            {activeTab === 'installed' ? (
              installedList.length === 0 ? (
                <div className="py-16 text-center text-[#FAF8F5]/40 text-xs font-mono">
                  [ NO AUDIO DRIVERS INSTALLED. LOAD FROM REGISTRY. ]
                </div>
              ) : (
                installedList.map((plugin) => (
                  <div
                    key={plugin.id}
                    className="p-3 sm:p-3.5 bg-[#18191d]/90 hover:bg-[#232529] border border-[#cfc6b0]/15 hover:border-[#cfc6b0]/40 transition-all flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className="w-9 h-9 border border-[#cfc6b0]/25 bg-[#0d0e11] flex items-center justify-center flex-shrink-0">
                        {renderIcon(plugin.icon)}
                      </div>
                      <div className="min-w-0 flex-1 truncate">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-serif text-[#FAF8F5]">
                            {plugin.name}
                          </h4>
                          <span className="text-[9px] text-[#FAF8F5]/40 font-mono">
                            // {plugin.author}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#FAF8F5]/50 font-mono truncate mt-0.5">
                          {plugin.description}
                        </p>
                      </div>
                    </div>

                    {/* Actions & Metrics */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                      {/* Latency Pill */}
                      {plugin.latencyMs !== undefined && (
                        <div className="flex items-center gap-1 px-2 py-0.5 border border-[#cfc6b0]/20 text-[10px] font-mono text-[#cfc6b0]">
                          <Activity className="w-2.5 h-2.5 text-[#00f0ff] animate-pulse" />
                          <span>{plugin.latencyMs}ms</span>
                        </div>
                      )}

                      {/* Version Pill */}
                      <span className="text-[9px] font-mono px-2 py-0.5 border border-[#cfc6b0]/20 text-[#FAF8F5]/50">
                        {plugin.version}
                      </span>

                      {/* Toggle Switch */}
                      <button
                        onClick={() => pluginManager.togglePluginEnabled(plugin.id)}
                        className={`w-10 h-5 border transition-colors cursor-pointer relative p-0.5 ${
                          plugin.enabled 
                            ? 'bg-[#cfc6b0] border-[#cfc6b0]' 
                            : 'bg-transparent border-[#cfc6b0]/30'
                        }`}
                        title={plugin.enabled ? 'Deactivate Driver' : 'Activate Driver'}
                      >
                        <div
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            plugin.enabled 
                              ? 'translate-x-5 bg-[#121316]' 
                              : 'translate-x-0 bg-[#cfc6b0]/40'
                          }`}
                        />
                      </button>

                      {/* Reload Latency */}
                      <button
                        onClick={() => handleRefreshLatency(plugin.id)}
                        className="p-1.5 border border-[#cfc6b0]/25 text-[#FAF8F5]/50 hover:text-[#FAF8F5] transition-all cursor-pointer"
                        title="Measure Connection Latency"
                      >
                        <RotateCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                      </button>

                      {/* Uninstall Button (if not core) */}
                      {plugin.id !== 'lossless-cdn' && (
                        <button
                          onClick={() => pluginManager.uninstallPlugin(plugin.id)}
                          className="p-1.5 border border-[#cfc6b0]/25 text-[#FAF8F5]/40 hover:text-red-400 hover:border-red-400/40 transition-all cursor-pointer"
                          title="Uninstall Driver"
                        >
                          <Trash2 className="w-3 h-3" />
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
                  className="p-3 sm:p-3.5 bg-[#18191d]/90 hover:bg-[#232529] border border-[#cfc6b0]/15 hover:border-[#cfc6b0]/40 transition-all flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="w-9 h-9 border border-[#cfc6b0]/25 bg-[#0d0e11] flex items-center justify-center flex-shrink-0">
                      {renderIcon(plugin.icon)}
                    </div>
                    <div className="min-w-0 flex-1 truncate">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-serif text-[#FAF8F5]">
                          {plugin.name}
                        </h4>
                        <span className="text-[9px] text-[#FAF8F5]/40 font-mono">
                          // {plugin.author}
                        </span>
                        <span className="telemetry-tag text-[8px] py-0.2 px-1 uppercase">
                          {plugin.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#FAF8F5]/50 font-mono truncate mt-0.5">
                        {plugin.description}
                      </p>
                    </div>
                  </div>

                  {/* Install Action */}
                  <div className="flex-shrink-0">
                    {plugin.installed ? (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 border border-[#cfc6b0]/30 text-[#cfc6b0] text-[10px] font-mono">
                        <Check className="w-3 h-3 text-[#00f0ff]" />
                        <span>ACTIVE</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => pluginManager.installPlugin(plugin.id)}
                        className="flex items-center gap-1.5 px-3 py-1 wireframe-btn-cyan text-[10px] font-mono font-bold cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        <span>ATTACH</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
}
