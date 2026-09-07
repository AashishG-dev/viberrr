import React, { useState, useEffect } from 'react';
import { Blocks, Search, RotateCw, Trash2, Download, Check, Zap, Radio, FileText, Disc, Flame, Activity, Waves } from 'lucide-react';
import { pluginManager } from '../services/plugins/PluginManager';
import { useAudio } from '../context/AudioContext';
import SiteFooter from '../components/SiteFooter';

export default function PluginsPage() {
  const [activeTab, setActiveTab] = useState('installed');
  const [storeCategory, setStoreCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [plugins, setPlugins] = useState(() => pluginManager.getPlugins());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { showToast } = useAudio();

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
    if (showToast) showToast('Driver Latency Verified');
  };

  const renderIcon = (iconKey) => {
    switch (iconKey) {
      case 'spotify':
        return <Activity className="w-5 h-5 text-[#00f0ff]" />;
      case 'youtube':
        return <Waves className="w-5 h-5 text-[#cfc6b0]" />;
      case 'zap':
        return <Zap className="w-5 h-5 text-[#00f0ff]" />;
      case 'soundcloud':
        return <Flame className="w-5 h-5 text-[#cfc6b0]" />;
      case 'bandcamp':
        return <Radio className="w-5 h-5 text-[#cfc6b0]" />;
      case 'lyrics':
        return <FileText className="w-5 h-5 text-[#cfc6b0]" />;
      case 'discogs':
        return <Disc className="w-5 h-5 text-[#cfc6b0]" />;
      default:
        return <Blocks className="w-5 h-5 text-[#cfc6b0]" />;
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#0d0e11] text-[#FAF8F5] pt-24 pb-36 px-4 sm:px-8">
      <div className="max-w-[1320px] mx-auto flex flex-col">

        {/* Header */}
        <header className="mb-10 pb-8 border-b border-[#cfc6b0]/20">
          <div className="flex items-center gap-3 mb-4">
            <span className="telemetry-tag">
              CAD // 04 AUDIO DRIVER ARCHITECTURE
            </span>
            <span className="text-[10px] font-mono text-[#FAF8F5]/40 tracking-wider">
              MULTI-NODE TELEMETRY MESH
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-5xl font-serif text-[#FAF8F5] tracking-tight">
                Universal Audio Drivers
              </h1>
              <p className="font-mono text-[#FAF8F5]/60 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
                Configure headless multi-node acoustic streaming drivers, high-density metadata resolvers, sub-millisecond phonetic synchronization, and low-latency endpoints.
              </p>
            </div>

            {/* Tab Controls */}
            <div className="flex items-center gap-2 font-mono text-xs">
              <button
                onClick={() => setActiveTab('installed')}
                className={`px-4 py-2 uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === 'installed'
                    ? 'wireframe-btn-accent font-bold'
                    : 'wireframe-btn opacity-60 hover:opacity-100'
                }`}
              >
                01 Installed ({installedList.length})
              </button>
              <button
                onClick={() => setActiveTab('store')}
                className={`px-4 py-2 uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === 'store'
                    ? 'wireframe-btn-accent font-bold'
                    : 'wireframe-btn opacity-60 hover:opacity-100'
                }`}
              >
                02 Driver Registry ({plugins.length})
              </button>
            </div>
          </div>

          {/* Store Filters */}
          {activeTab === 'store' && (
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <div className="relative flex-1">
                <div className="relative flex items-center p-1 bg-[#18191d] border border-[#cfc6b0]/25 focus-within:border-[#cfc6b0] transition-colors">
                  <Search className="w-4 h-4 ml-3 text-[#cfc6b0]" />
                  <input
                    type="text"
                    placeholder="Search drivers by name, node, or provider..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-none text-[#FAF8F5] placeholder-[#FAF8F5]/40 text-xs px-3 py-1.5 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 font-mono text-xs">
                {['all', 'streaming', 'metadata', 'lyrics', 'discovery'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setStoreCategory(cat)}
                    className={`px-3 py-1.5 uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
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
        </header>

        {/* Plugins List */}
        <div className="space-y-3">
          {(activeTab === 'installed' ? installedList : storeList).map((plugin) => (
            <div
              key={plugin.id}
              className="p-4 sm:p-5 bg-[#18191d]/90 hover:bg-[#232529] border border-[#cfc6b0]/15 hover:border-[#cfc6b0]/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative"
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="w-12 h-12 border border-[#cfc6b0]/30 bg-[#0d0e11] flex items-center justify-center flex-shrink-0">
                  {renderIcon(plugin.icon)}
                </div>

                <div className="min-w-0 flex-1 truncate">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-serif text-base text-[#FAF8F5]">{plugin.name}</h4>
                    <span className="text-xs text-[#FAF8F5]/40 font-mono">v{plugin.version} // {plugin.author}</span>
                    <span className="telemetry-tag text-[9px] py-0.2 px-1 uppercase">
                      {plugin.category}
                    </span>
                  </div>
                  <p className="text-xs text-[#FAF8F5]/60 mt-1 line-clamp-1 font-mono">
                    {plugin.description}
                  </p>
                </div>
              </div>

              {/* Status, Latency & Actions */}
              <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-[#cfc6b0]/20">
                {plugin.installed && (
                  <button
                    onClick={() => handleRefreshLatency(plugin.id)}
                    className="flex items-center gap-1.5 px-2.5 py-1 border border-[#cfc6b0]/20 text-[10px] font-mono text-[#cfc6b0] hover:text-[#FAF8F5] cursor-pointer"
                    title="Measure Ping Latency"
                  >
                    <span className={`w-1.5 h-1.5 ${plugin.latency ? 'bg-[#00f0ff]' : 'bg-[#FAF8F5]/40'}`} />
                    <span>{plugin.latency ? `${plugin.latency}ms` : 'Ping'}</span>
                    <RotateCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </button>
                )}

                {plugin.installed ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        pluginManager.togglePlugin(plugin.id);
                        if (showToast) showToast(`${plugin.name} ${plugin.enabled ? 'Disabled' : 'Enabled'}`);
                      }}
                      className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                        plugin.enabled
                          ? 'wireframe-btn-accent font-bold'
                          : 'wireframe-btn opacity-50'
                      }`}
                    >
                      {plugin.enabled ? 'ACTIVE' : 'STANDBY'}
                    </button>

                    <button
                      onClick={() => {
                        pluginManager.uninstallPlugin(plugin.id);
                        if (showToast) showToast(`Detached: ${plugin.name}`);
                      }}
                      className="p-1.5 border border-[#cfc6b0]/20 text-[#FAF8F5]/40 hover:text-red-400 hover:border-red-400/40 transition-colors cursor-pointer"
                      title="Uninstall Driver"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      pluginManager.installPlugin(plugin.id);
                      if (showToast) showToast(`Attached: ${plugin.name}`);
                    }}
                    className="px-4 py-1.5 wireframe-btn-cyan text-xs font-mono uppercase tracking-wider font-bold cursor-pointer flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>ATTACH DRIVER</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Site Footer with Watermark */}
        <SiteFooter />
      </div>
    </div>
  );
}
