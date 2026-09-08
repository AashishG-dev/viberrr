import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Play, Pause, Settings, Search, Radio, ChevronDown, Check, Sparkles, Activity } from 'lucide-react';
import { STATIONS } from '../data/stationsData';

const NAV_ITEMS = [
  { id: 'deck', code: '01', label: 'DECK', path: '/', hash: '#live-deck' },
  { id: 'trends', code: '02', label: 'RADAR', path: '/', hash: '#frequency-directory' },
  { id: 'explore', code: '03', label: 'EXPLORE', path: '/explore' },
  { id: 'equalizer', code: '04', label: 'DSP MATRIX', path: '/equalizer' },
  { id: 'library', code: '05', label: 'ARCHIVE', path: '/library' },
  { id: 'plugins', code: '06', label: 'MODULES', path: '/plugins' },
  { id: 'about', code: '07', label: 'DISPATCH', path: '/about' }
];

function TopHeader({
  currentStation,
  onSelectStation,
  volume,
  isMuted,
  onChangeVolume,
  onToggleMute,
  isFullscreen,
  onToggleFullscreen,
  onOpenSupport,
  onOpenShortcuts,
  onOpenAudioSource,
  onOpenAmbientFx,
  onOpenGlobalSearch,
  onShareStation,
  currentAudioSource,
  onlineCount = 3482,
  isPlaying,
  onTogglePlay
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isStationMenuOpen, setIsStationMenuOpen] = useState(false);
  const [stationSearch, setStationSearch] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsStationMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredStations = STATIONS.filter(
    (st) =>
      st.name.toLowerCase().includes(stationSearch.toLowerCase()) ||
      st.tagline?.toLowerCase().includes(stationSearch.toLowerCase())
  );

  const handleNavClick = (item) => {
    if (item.path === '/') {
      if (location.pathname === '/') {
        if (item.hash) {
          const el = document.querySelector(item.hash);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else {
        navigate(item.path + (item.hash || ''));
      }
    } else {
      navigate(item.path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isItemActive = (item) => {
    if (item.path === '/') {
      return location.pathname === '/' && (!location.hash || location.hash === item.hash);
    }
    return location.pathname === item.path;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-[#0d0e11]/92 backdrop-blur-xl border-b border-[#2b2f33]/80 select-none flex justify-center">
      <div className="h-16 w-full max-w-[1440px] 2xl:max-w-[1720px] mx-auto px-3 sm:px-6 md:px-8 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left: Brand Identity with Geometric Cad Glyph */}
        <div className="flex items-center gap-2 sm:gap-4 relative flex-shrink-0" ref={dropdownRef}>
          <button
            onClick={() => setIsStationMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 text-left cursor-pointer group focus-visible:outline-none flex-shrink-0"
            title="Sovereign Channels Matrix"
          >
            {/* Geometric brand mark */}
            <div className="w-7 h-7 rounded-[7px] overflow-hidden border border-[#cfc6b0]/40 group-hover:border-[#FAF8F5] transition-colors relative flex items-center justify-center bg-[#0D0D11] flex-shrink-0">
              <img src="/viberr-icon.svg" alt="Viberr" className="w-full h-full object-cover" />
            </div>

            <div className="flex items-baseline gap-1.5 sm:gap-2 whitespace-nowrap">
              <span className="font-space text-sm sm:text-base tracking-[-0.03em] font-normal text-[#FAF8F5]">
                viberr<span className="text-[#00f0ff]">.</span>matrix
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#cfc6b0]/80 border border-[#2b2f33] px-1.5 py-0.5 rounded-[4px] whitespace-nowrap hidden xs:inline-block">
                CH // {currentStation?.id ? currentStation.id.slice(0, 3).toUpperCase() : '01'}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-[#cfc6b0]/60 group-hover:text-[#FAF8F5] transition-transform duration-200 flex-shrink-0" />
          </button>

          {/* Stepped Charcoal Channel Dropdown with Wireframe Border */}
          {isStationMenuOpen && (
            <div className="absolute top-12 left-0 w-84 bg-[#121316] border border-[#cfc6b0]/25 rounded-[12px] shadow-2xl overflow-hidden z-50 flex flex-col backdrop-blur-2xl">
              <div className="p-3 border-b border-[#2b2f33] bg-[#0d0e11]/90 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#cfc6b0]">
                  ARCHIVAL CARRIER NODES
                </span>
                <span className="font-mono text-[9px] text-[#8f918c]">[ 28 CHANNELS ]</span>
              </div>
              <div className="p-2 border-b border-[#2b2f33]/60">
                <input
                  type="text"
                  value={stationSearch}
                  onChange={(e) => setStationSearch(e.target.value)}
                  placeholder="Filter sovereign channels..."
                  className="w-full px-3 py-1.5 rounded-[6px] bg-[#1b1b1f] border border-[#2b2f33] text-xs text-[#FAF8F5] placeholder-[#8f918c] focus:outline-none focus:border-[#cfc6b0]/60 font-mono"
                  autoFocus
                />
              </div>
              <div className="overflow-y-auto max-h-72 p-1.5 space-y-1 custom-scroll">
                {filteredStations.map((station) => {
                  const isSelected = currentStation?.id === station.id;
                  return (
                    <button
                      key={station.id}
                      onClick={() => {
                        onSelectStation(station);
                        setIsStationMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-[8px] text-left text-xs transition-all cursor-pointer font-mono ${
                        isSelected
                          ? 'bg-[#232529] text-[#FAF8F5] border border-[#cfc6b0]/50'
                          : 'text-[#8f918c] hover:text-[#FAF8F5] hover:bg-[#1b1b1f]'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="text-[#FAF8F5] text-[12px] truncate">{station.name}</div>
                        <div className="text-[10px] text-[#8f918c] tracking-wide truncate">
                          {station.tagline || 'Lossless Direct Carrier'}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] shadow-[0_0_8px_#00f0ff]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Center: Observatory Monospaced Telemetry Navigation */}
        <nav className="hidden xl:flex items-center gap-5 xl:gap-6">
          {NAV_ITEMS.map((item) => {
            const isActive = isItemActive(item);
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`font-mono text-[11px] uppercase tracking-[0.16em] transition-all cursor-pointer relative py-1 flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'text-[#FAF8F5] font-semibold'
                    : 'text-[#8f918c] hover:text-[#FAF8F5]'
                }`}
              >
                <span className="text-[9px] text-[#cfc6b0]/60">{item.code}</span>
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute -bottom-1 left-0 right-0 h-[1.5px] bg-[#cfc6b0]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Technical Readout & Outlined Action Triggers */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Signal Status Telemetry Badge */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-[6px] border border-[#2b2f33] bg-[#121316] font-mono text-[10px] tracking-[0.14em] uppercase text-[#cfc6b0] whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-pulse" />
            <span>24-BIT // 96kHz</span>
          </div>

          {/* Search Trigger (⌘K) */}
          <button
            onClick={onOpenGlobalSearch}
            className="w-8 h-8 rounded-[8px] border border-[#2b2f33] hover:border-[#cfc6b0]/50 bg-transparent flex items-center justify-center text-[#8f918c] hover:text-[#FAF8F5] transition-all cursor-pointer flex-shrink-0"
            title="Global Search (⌘K / /)"
            aria-label="Search"
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          {/* DSP & Matrix Config Trigger */}
          <button
            onClick={onOpenAudioSource}
            className="wireframe-btn !py-1.5 !px-2.5 sm:!px-3 hidden md:inline-flex flex-shrink-0"
            title="Audio Matrix & DSP Configuration"
          >
            <Settings className="w-3 h-3 text-[#cfc6b0]" />
            <span>MATRIX</span>
          </button>

          {/* Primary Outlined Action Trigger */}
          <button
            onClick={onTogglePlay}
            className="wireframe-btn-accent !py-1.5 !px-2.5 sm:!px-4 flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap"
            title={isPlaying ? 'Pause Broadcast (Space)' : 'Start Broadcast (Space)'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3 h-3 fill-current" />
                <span className="hidden sm:inline">DISPATCH ACTIVE</span>
                <span className="sm:hidden text-[10px] font-mono">PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span className="hidden sm:inline">INITIALIZE AIRPLAY</span>
                <span className="sm:hidden text-[10px] font-mono">PLAY</span>
              </>
            )}
          </button>
        </div>

      </div>
    </header>
  );
}

export default React.memo(TopHeader);


