import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Play, Pause, Settings, Search, Radio, ChevronDown, Check, Share2, Sparkles } from 'lucide-react';
import { STATIONS } from '../data/stationsData';

const NAV_ITEMS = [
  { id: 'deck', label: 'DECK', path: '/', hash: '#live-deck' },
  { id: 'trends', label: 'TRENDS', path: '/', hash: '#frequency-directory' },
  { id: 'explore', label: 'EXPLORE', path: '/explore' },
  { id: 'equalizer', label: 'EQUALIZER', path: '/equalizer' },
  { id: 'library', label: 'LIBRARY', path: '/library' },
  { id: 'plugins', label: 'PLUGINS', path: '/plugins' },
  { id: 'about', label: 'ABOUT', path: '/about' }
];

export default function TopHeader({
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

  // Close dropdown on click outside
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#121316]/90 backdrop-blur-xl border-b border-[#343538]/50 select-none">
      <div className="h-20 max-w-[1280px] mx-auto px-4 sm:px-8 flex items-center justify-between gap-4">
        
        {/* Left: Brand & Identity */}
        <div className="flex items-center gap-3.5 relative" ref={dropdownRef}>
          <button
            onClick={() => setIsStationMenuOpen((prev) => !prev)}
            className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center bg-[#0d0e11] border border-[#343538]/80 hover:border-[#cfc6b0] transition-colors flex-shrink-0 cursor-pointer group shadow-sm"
            title="Switch Radio Channel"
          >
            <span className="font-serif text-base font-bold text-[#cfc6b0] group-hover:scale-110 transition-transform">
              V
            </span>
          </button>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-headline-sm text-lg tracking-tight text-[#FAF8F5] leading-none">
                VIBERR
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#292a2d] text-[#cfc6b0] uppercase font-mono font-medium">
                LIVE
              </span>
              <button
                onClick={() => setIsStationMenuOpen((prev) => !prev)}
                className="text-[#8f918c] hover:text-[#FAF8F5] transition-colors cursor-pointer flex items-center text-xs font-mono"
                title="Channel Selector"
              >
                <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>
            <span className="font-label-telemetry text-[#8f918c] uppercase tracking-widest mt-0.5 hidden sm:block text-[10px]">
              LOSSLESS 24-BIT AUDIOPHILE ARCHIVE
            </span>
          </div>

          {/* Station Quick Dropdown Menu */}
          {isStationMenuOpen && (
            <div className="absolute top-14 left-0 w-80 max-h-96 bg-[#1b1b1f] border border-[#343538] rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col backdrop-blur-2xl">
              <div className="p-3 border-b border-[#343538]/60 bg-[#0d0e11]/80">
                <input
                  type="text"
                  value={stationSearch}
                  onChange={(e) => setStationSearch(e.target.value)}
                  placeholder="Filter 28 sovereign vaults..."
                  className="w-full px-3 py-1.5 rounded-lg bg-[#1f1f23] border border-[#343538] text-xs text-[#FAF8F5] placeholder-[#8f918c] focus:outline-none font-mono"
                  autoFocus
                />
              </div>
              <div className="overflow-y-auto flex-1 p-2 space-y-1 custom-scroll">
                {filteredStations.map((station) => {
                  const isSelected = currentStation?.id === station.id;
                  return (
                    <button
                      key={station.id}
                      onClick={() => {
                        onSelectStation(station);
                        setIsStationMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#FAF8F5] text-[#121316] font-semibold'
                          : 'text-[#FAF8F5] hover:bg-[#292a2d]'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="truncate">{station.name}</div>
                        <div className={`text-[10px] truncate ${isSelected ? 'text-[#121316]/70' : 'text-[#8f918c]'}`}>
                          {station.tagline || `${station.songs?.length || 0} tracks`}
                        </div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Center: Multi-Page & Section Anchor Navigation */}
        <nav className="hidden md:flex items-center gap-1 px-1.5 py-1 bg-[#1b1b1f]/90 rounded-full border border-[#343538]/60 shadow-inner overflow-x-auto scrollbar-none">
          {NAV_ITEMS.map((item) => {
            const isActive = isItemActive(item);
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`px-3 py-1.5 rounded-full font-label-pill text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#FAF8F5] text-[#121316] font-bold shadow-sm'
                    : 'text-[#c5c7c1] hover:text-[#FAF8F5] hover:bg-[#292a2d]/60'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Header Actions */}
        <div className="flex items-center gap-3">
          {/* FLAC Telemetry Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0d0e11] border border-[#343538]/60 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#cfc6b0] tape-pulse" />
            <span className="font-label-telemetry text-[#cfc6b0] uppercase text-[10px]">
              FLAC 96kHz DIRECT
            </span>
          </div>

          {/* Search Trigger (⌘K) */}
          <button
            onClick={onOpenGlobalSearch}
            className="p-2 rounded-full bg-[#1b1b1f] hover:bg-[#292a2d] text-[#c5c7c1] hover:text-[#FAF8F5] border border-[#343538]/60 transition-colors cursor-pointer"
            title="Global Search (⌘K)"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Audio Output & DSP Configuration */}
          <button
            onClick={onOpenAudioSource}
            className="px-3 py-2 rounded-full bg-[#1b1b1f] hover:bg-[#292a2d] text-[#FAF8F5] border border-[#343538]/60 font-label-pill text-xs transition-colors uppercase tracking-wider flex items-center gap-1.5 shadow-sm group cursor-pointer"
            title="Audio Output & DSP Configuration"
          >
            <Settings className="w-3.5 h-3.5 text-[#cfc6b0] group-hover:rotate-45 transition-transform" />
            <span className="hidden sm:inline font-mono text-[11px]">CONFIG</span>
          </button>

          {/* Primary Quick Play/Pause Stream Button */}
          <button
            onClick={onTogglePlay}
            className="px-4 py-2 rounded-full bg-[#FAF8F5] text-[#121316] hover:bg-[#eae6df] font-label-pill text-xs transition-all uppercase tracking-wider flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer font-bold"
            title={isPlaying ? 'Pause Stream (Space)' : 'Play Stream (Space)'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>PAUSE STREAM</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>PLAY STREAM</span>
              </>
            )}
          </button>
        </div>

      </div>
    </header>
  );
}
