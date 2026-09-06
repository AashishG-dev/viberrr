import React, { useState, useEffect } from 'react';
import { Blocks, Search, RotateCw, Trash2, Download, Check, Zap, Radio, FileText, Disc, Flame, Activity, Sparkles } from 'lucide-react';
import { pluginManager } from '../services/plugins/PluginManager';
import { useAudio } from '../context/AudioContext';
import SiteFooter from '../components/SiteFooter';

const SpotifyBrandIcon = ({ className = 'w-5 h-5 text-[#1db954]' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.485 17.306c-.215.353-.674.464-1.026.25-2.809-1.716-6.345-2.104-10.51-1.152-.403.092-.808-.163-.9-.566-.092-.403.163-.808.566-.9 4.568-1.044 8.497-.601 11.62 1.342.352.215.464.674.25 1.026zm1.464-3.257c-.27.44-.848.58-1.288.31-3.216-1.977-8.118-2.548-11.921-1.393-.497.15-1.029-.133-1.18-.63-.15-.497.133-1.03.63-1.18 4.348-1.32 9.754-.68 13.449 1.595.44.27.58.848.31 1.288zm.126-3.41c-3.856-2.29-10.222-2.5-13.896-1.385-.592.18-1.222-.154-1.402-.746-.18-.592.154-1.222.746-1.402 4.227-1.283 11.26-1.038 15.69 1.593.533.316.708 1.011.392 1.544-.316.533-1.011.708-1.544.392z"/>
  </svg>
);

const YouTubeBrandIcon = ({ className = 'w-5 h-5 text-[#ff4444]' }) => (
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
    if (showToast) showToast('Plugin Latency Measured');
  };

  const renderIcon = (iconKey) => {
    switch (iconKey) {
      case 'spotify':
        return <SpotifyBrandIcon />;
      case 'youtube':
        return <YouTubeBrandIcon />;
      case 'zap':
        return <Zap className="w-5 h-5 text-[#cfc6b0]" />;
      case 'soundcloud':
        return <Flame className="w-5 h-5 text-[#cfc6b0]" />;
      case 'bandcamp':
        return <Radio className="w-5 h-5 text-[#cfc6b0]" />;
      case 'lyrics':
        return <FileText className="w-5 h-5 text-[#cfc6b0]" />;
      case 'discogs':
        return <Disc className="w-5 h-5 text-[#cfc6b0]" />;
      default:
        return <Blocks className="w-5 h-5 text-[#8f918c]" />;
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#121316] text-[#e3e2e6] pt-24 pb-36 px-4 sm:px-8">
      <div className="max-w-[1280px] mx-auto flex flex-col">

        {/* Header */}
        <header className="mb-10 pb-8 border-b border-[#343538]/50">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1b1b1f] border border-[#343538]/60 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#cfc6b0] tape-pulse" />
            <span className="font-label-telemetry uppercase text-[#cfc6b0] tracking-widest text-[10px]">
              MODULAR AUDIO DRIVER ARCHITECTURE
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-headline-lg text-3xl sm:text-5xl font-serif text-[#FAF8F5] tracking-tight">
                Universal Plugin Center
              </h1>
              <p className="font-body-md text-[#c5c7c1] text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
                Configure headless multi-source streaming providers, audio metadata resolvers, real-time lyrics synchronization, and low-latency endpoints.
              </p>
            </div>

            {/* Tab Controls */}
            <div className="flex items-center p-1 rounded-full bg-[#1b1b1f] border border-[#343538]/70">
              <button
                onClick={() => setActiveTab('installed')}
                className={`px-4 py-2 rounded-full font-label-pill text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === 'installed'
                    ? 'bg-[#FAF8F5] text-[#121316] font-bold shadow-sm'
                    : 'text-[#8f918c] hover:text-[#FAF8F5]'
                }`}
              >
                Installed ({installedList.length})
              </button>
              <button
                onClick={() => setActiveTab('store')}
                className={`px-4 py-2 rounded-full font-label-pill text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === 'store'
                    ? 'bg-[#FAF8F5] text-[#121316] font-bold shadow-sm'
                    : 'text-[#8f918c] hover:text-[#FAF8F5]'
                }`}
              >
                Plugin Store ({plugins.length})
              </button>
            </div>
          </div>

          {/* Store Filters */}
          {activeTab === 'store' && (
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <div className="relative flex-1">
                <div className="relative flex items-center p-1 rounded-xl bg-[#0d0e11] border border-[#343538]/70 focus-within:border-[#cfc6b0] transition-colors">
                  <Search className="w-4 h-4 ml-3 text-[#8f918c]" />
                  <input
                    type="text"
                    placeholder="Search plugins by name, engine, or author..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-none text-[#FAF8F5] placeholder-[#8f918c] text-xs px-3 py-1.5 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {['all', 'streaming', 'metadata', 'lyrics', 'discovery'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setStoreCategory(cat)}
                    className={`px-3 py-1.5 rounded-full font-label-pill text-xs capitalize transition-all cursor-pointer whitespace-nowrap ${
                      storeCategory === cat
                        ? 'bg-[#FAF8F5] text-[#121316] font-bold'
                        : 'bg-[#1b1b1f] hover:bg-[#292a2d] text-[#c5c7c1] border border-[#343538]/50'
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
              className="p-4 sm:p-5 rounded-2xl bg-[#1b1b1f] hover:bg-[#222227] border border-[#343538]/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="w-12 h-12 rounded-xl bg-[#0d0e11] border border-[#343538]/60 flex items-center justify-center flex-shrink-0">
                  {renderIcon(plugin.icon)}
                </div>

                <div className="min-w-0 flex-1 truncate">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-headline-sm text-base text-[#FAF8F5]">{plugin.name}</h4>
                    <span className="text-xs text-[#8f918c] font-mono">v{plugin.version} by {plugin.author}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#292a2d] text-[#cfc6b0] uppercase border border-[#343538]/60">
                      {plugin.category}
                    </span>
                  </div>
                  <p className="font-body-sm text-xs text-[#c5c7c1] mt-1 line-clamp-1">
                    {plugin.description}
                  </p>
                </div>
              </div>

              {/* Status, Latency & Actions */}
              <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-[#343538]/40">
                {plugin.installed && (
                  <button
                    onClick={() => handleRefreshLatency(plugin.id)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0d0e11] border border-[#343538]/60 text-[11px] font-mono text-[#8f918c] hover:text-[#FAF8F5] cursor-pointer"
                    title="Measure Ping Latency"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${plugin.latency ? 'bg-[#1db954]' : 'bg-[#8f918c]'}`} />
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
                      className={`px-3 py-1.5 rounded-full font-label-pill text-xs uppercase tracking-wider transition-all cursor-pointer ${
                        plugin.enabled
                          ? 'bg-[#1db954]/20 text-[#1db954] border border-[#1db954]/40 font-bold'
                          : 'bg-[#292a2d] text-[#8f918c] border border-[#343538]/60'
                      }`}
                    >
                      {plugin.enabled ? 'ACTIVE' : 'DISABLED'}
                    </button>

                    <button
                      onClick={() => {
                        pluginManager.uninstallPlugin(plugin.id);
                        if (showToast) showToast(`Uninstalled: ${plugin.name}`);
                      }}
                      className="p-1.5 rounded-lg text-[#8f918c] hover:text-[#e57373] hover:bg-white/5 transition-colors cursor-pointer"
                      title="Uninstall Plugin"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      pluginManager.installPlugin(plugin.id);
                      if (showToast) showToast(`Installed: ${plugin.name}`);
                    }}
                    className="px-4 py-1.5 rounded-full bg-[#FAF8F5] text-[#121316] font-label-pill text-xs uppercase tracking-wider font-bold hover:bg-[#eae6df] transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>INSTALL</span>
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
