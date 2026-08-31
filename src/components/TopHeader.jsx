import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Volume2, VolumeX, Maximize2, Minimize2, 
  Radio, Coffee, HelpCircle, ChevronDown, Check, Share2, Headphones, Zap, Search, Blocks, Compass, Heart, Sliders, Info
} from 'lucide-react';
import { STATIONS } from '../data/stationsData';
import { Link, useLocation } from 'react-router-dom';

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
  onOpenGlobalSearch,
  onShareStation,
  currentAudioSource,
  onlineCount = 52
}) {
  const [timeString, setTimeString] = useState('');
  const [isStationMenuOpen, setIsStationMenuOpen] = useState(false);
  const [stationSearch, setStationSearch] = useState('');
  const dropdownRef = useRef(null);
  const location = useLocation();

  // Live Clock Updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsStationMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredStations = STATIONS.filter(st => 
    st.name.toLowerCase().includes(stationSearch.toLowerCase()) ||
    st.tagline?.toLowerCase().includes(stationSearch.toLowerCase())
  );

  const navLinks = [
    { path: '/', label: 'Studio', icon: Radio },
    { path: '/explore', label: 'Explore', icon: Compass },
    { path: '/plugins', label: 'Plugins', icon: Blocks },
    { path: '/library', label: 'Library', icon: Heart },
    { path: '/equalizer', label: 'Equalizer', icon: Sliders },
    { path: '/about', label: 'About', icon: Info }
  ];

  return (
    <header className="w-full flex items-center justify-between pointer-events-auto select-none relative z-40 gap-2 sm:gap-4 px-2 sm:px-6 py-2.5 max-w-[1760px] mx-auto">
      {/* Left Section: Brand Logo & Navigation Links */}
      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        <Link 
          to="/"
          className="glass-pill px-3.5 sm:px-4 py-1.5 rounded-full flex items-center gap-2 shadow-xl border border-white/20 hover:border-cyan-400/50 transition-all bg-black/70 cursor-pointer group"
        >
          <Headphones className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform flex-shrink-0" />
          <span className="font-black font-syne tracking-wider text-xs sm:text-base text-white drop-shadow-sm">
            VIBERR
          </span>
        </Link>

        {/* Multi-Page Navigation Bar */}
        <nav className="hidden lg:flex items-center gap-1 bg-black/40 backdrop-blur-xl p-1 rounded-full border border-white/10 shadow-lg">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/40 shadow-sm font-bold'
                    : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-white/50'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Center: Global Search Bar Button & Listeners */}
      <div className="flex items-center gap-2 flex-1 justify-center max-w-sm">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenGlobalSearch}
          className="glass-pill h-8 sm:h-9 px-3 sm:px-4 rounded-full text-xs font-mono text-white/70 hover:text-white flex items-center gap-2 shadow-xl border border-white/15 bg-white/[0.06] hover:bg-white/[0.12] hover:border-cyan-400/50 transition-all cursor-pointer w-full justify-between"
          title="Global Search across Spotify, YouTube & 28+ stations (Ctrl + K)"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span className="truncate font-space text-[11px] sm:text-xs text-white/80">Search Spotify, YouTube...</span>
          </div>
          <kbd className="hidden sm:inline-block px-1.5 py-0.2 text-[9px] font-mono bg-white/10 rounded text-white/50 border border-white/10">
            Ctrl K
          </kbd>
        </motion.button>

        {/* Live Listeners Pill */}
        <div
          id="live-online-pill"
          className="hidden xl:flex glass-pill px-3 py-1.5 rounded-full text-[11px] text-white/80 items-center gap-2 shadow-xl border border-white/15 bg-white/[0.06] flex-shrink-0"
          title="Live Active Listeners"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-mono font-medium tracking-tight text-white/90">{onlineCount} VIBING</span>
        </div>
      </div>

      {/* Right Section: Volume, Station Selector, Fullscreen */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0" ref={dropdownRef}>
        
        {/* Mobile Navigation Dropdown Button */}
        <div className="lg:hidden flex items-center gap-1">
          {navLinks.slice(1, 4).map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`p-2 rounded-full transition-all ${
                  isActive
                    ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/40'
                    : 'text-white/60 hover:text-white bg-white/5'
                }`}
                title={link.label}
              >
                <Icon className="w-3.5 h-3.5" />
              </Link>
            );
          })}
        </div>

        {/* Shortcuts Quick Button */}
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={onOpenShortcuts}
          className="hidden xl:flex glass-button h-8 sm:h-9 px-3 rounded-full text-xs font-semibold text-white/85 items-center gap-1.5 hover:text-white cursor-pointer"
          title="Keyboard Shortcuts (?)"
        >
          <HelpCircle className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
          <span className="font-space">Shortcuts</span>
        </motion.button>

        {/* Volume Slider (Desktop) */}
        <div className="hidden md:flex items-center gap-2 bg-black/60 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/15 group hover:bg-black/80 transition-colors shadow-lg">
          <button
            onClick={onToggleMute}
            className="text-white/80 hover:text-white transition-transform hover:scale-110 p-0.5 focus:outline-none cursor-pointer"
            title="Mute / Unmute (M)"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-red-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            )}
          </button>
          <div className="relative flex items-center w-16 sm:w-20">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
              className="custom-range"
              aria-label="Volume slider"
            />
          </div>
        </div>

        {/* Support Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenSupport}
          className="glass-button h-8 sm:h-9 w-8 sm:w-auto px-0 sm:px-3.5 rounded-full text-xs font-semibold text-white flex items-center justify-center gap-1.5 shadow-xl hover:border-amber-400/50 cursor-pointer"
          title="Support Viberr"
        >
          <Coffee className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
          <span className="hidden lg:inline whitespace-nowrap font-space font-medium">Support</span>
        </motion.button>

        {/* Station Selector Dropdown Trigger */}
        <div className="relative">
          <div className="scanner-border">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsStationMenuOpen(!isStationMenuOpen)}
              className="glass-pill h-8 sm:h-9 px-2.5 sm:px-3.5 rounded-full text-xs font-semibold text-white flex items-center gap-2 shadow-xl border border-white/20 hover:border-cyan-400/60 transition-all cursor-pointer bg-black/60"
              title="Select Radio Station"
            >
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: currentStation?.color || '#00f0ff',
                  boxShadow: `0 0 10px ${currentStation?.color || '#00f0ff'}`
                }}
              />
              <span className="truncate max-w-[80px] sm:max-w-[120px] font-syne font-bold">
                {currentStation?.name}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-white/60 transition-transform duration-300 ${
                  isStationMenuOpen ? 'rotate-180 text-cyan-400' : ''
                }`}
              />
            </motion.button>
          </div>

          {/* Station Menu Dropdown */}
          <AnimatePresence>
            {isStationMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-3xl glass-panel-neon border border-white/20 shadow-2xl p-3 z-50 overflow-hidden bg-black/90 text-white"
              >
                {/* Search Box inside dropdown */}
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search 28+ stations..."
                    value={stationSearch}
                    onChange={(e) => setStationSearch(e.target.value)}
                    className="w-full bg-white/10 text-white placeholder-white/40 text-xs rounded-xl pl-8 pr-3 py-2 outline-none border border-white/10 focus:border-cyan-400/60 font-space"
                  />
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1 pr-1 custom-scroll">
                  {filteredStations.map((st) => (
                    <button
                      key={st.id}
                      onClick={() => {
                        onSelectStation(st);
                        setIsStationMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer ${
                        currentStation?.id === st.id
                          ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/30'
                          : 'hover:bg-white/10 text-white/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: st.color || '#00f0ff' }}
                        />
                        <span className="text-xs font-syne truncate">{st.name}</span>
                      </div>
                      {currentStation?.id === st.id && (
                        <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 ml-2" />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Fullscreen Toggle */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={onToggleFullscreen}
          className="glass-button p-2 rounded-full text-white/80 hover:text-white cursor-pointer"
          title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen Mode (F)'}
        >
          {isFullscreen ? (
            <Minimize2 className="w-3.5 h-3.5 text-cyan-300" />
          ) : (
            <Maximize2 className="w-3.5 h-3.5" />
          )}
        </motion.button>
      </div>
    </header>
  );
}
