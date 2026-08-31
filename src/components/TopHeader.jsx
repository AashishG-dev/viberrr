import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Volume2, VolumeX, Maximize2, Minimize2, 
  Radio, Coffee, HelpCircle, ChevronDown, Check, Share2, Headphones, Zap
} from 'lucide-react';
import { STATIONS } from '../data/stationsData';

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
  onShareStation,
  currentAudioSource,
  onlineCount = 52
}) {
  const [timeString, setTimeString] = useState('');
  const [isStationMenuOpen, setIsStationMenuOpen] = useState(false);
  const [stationSearch, setStationSearch] = useState('');
  const dropdownRef = useRef(null);

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

  return (
    <header className="w-full flex items-center justify-between pointer-events-auto select-none relative z-40 gap-2 sm:gap-4">
      {/* Left Section: Brand + Source + Live Clock */}
      <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
        
        {/* Viberr Brand Pill */}
        <motion.div 
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="glass-pill px-3.5 sm:px-4 py-1.5 rounded-full flex items-center gap-2 shadow-xl border border-white/20 cursor-default bg-black/60"
        >
          <Headphones className="w-4 h-4 text-white flex-shrink-0" />
          <span className="font-black font-syne tracking-wider text-xs sm:text-base text-white drop-shadow-sm">
            VIBERR
          </span>
        </motion.div>

        {/* Audio Source Switcher Button */}
        <motion.button
          whileHover={{ scale: 1.05, y: -1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenAudioSource}
          className="glass-button h-8 sm:h-9 px-2.5 sm:px-3.5 rounded-full text-xs font-mono font-medium text-white/80 flex items-center gap-1.5 hover:text-white border border-white/15 hover:border-white/30 transition-all cursor-pointer shadow-lg bg-white/[0.06] hover:bg-white/[0.12]"
          title="Switch Audio Stream Source"
        >
          <Zap className="w-3.5 h-3.5 text-white/70 flex-shrink-0" />
          <span className="hidden md:inline whitespace-nowrap text-white/90">
            SRC: {currentAudioSource?.name ? currentAudioSource.name.split(' ')[0] : 'CDN 320k'}
          </span>
        </motion.button>

        {/* Live Clock */}
        <div
          id="live-clock"
          className="hidden xl:flex glass-pill px-3 py-1.5 rounded-full text-xs font-mono font-medium text-white/80 items-center gap-2 shadow-sm border border-white/10"
        >
          <span className="w-2 h-2 rounded-full bg-white/60 shadow-sm" />
          <span>{timeString || '--:--'}</span>
        </div>
      </div>

      {/* Center: Live Listeners Pill */}
      <div
        id="live-online-pill"
        className="hidden sm:flex glass-pill px-3 sm:px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs text-white/80 items-center gap-2 shadow-xl border border-white/15 bg-white/[0.06] flex-shrink-0"
        title="Live Active Listeners"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        <span className="font-mono font-medium tracking-tight text-white/90">{onlineCount} VIBING</span>
      </div>

      {/* Right Section: Volume, Support, Station Selector, Fullscreen */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0" ref={dropdownRef}>
        
        {/* Shortcuts Quick Button */}
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={onOpenShortcuts}
          className="hidden xl:flex glass-button h-8 sm:h-9 px-3 rounded-full text-xs font-semibold text-white/85 items-center gap-1.5 hover:text-white cursor-pointer"
          title="Keyboard Shortcuts (?)"
        >
          <HelpCircle className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
          <span>Shortcuts</span>
        </motion.button>

        {/* Volume Slider (Desktop) */}
        <div className="hidden lg:flex items-center gap-2 bg-black/60 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/15 group hover:bg-black/80 transition-colors shadow-lg">
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
            className="glass-button h-9 w-9 lg:h-10 lg:w-auto px-0 lg:px-4 py-0 lg:py-2 rounded-full text-xs sm:text-sm font-semibold text-white flex items-center justify-center lg:justify-start gap-1.5 shadow-xl hover:border-amber-400/50 cursor-pointer"
            title="Support Viberr"
          >
            <Coffee className="w-4 h-4 text-amber-300 flex-shrink-0" />
            <span className="hidden lg:inline whitespace-nowrap font-space font-medium">Support</span>
          </motion.button>

          {/* Station Selector Dropdown Trigger */}
          <div className="relative">
            <div className="scanner-border">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsStationMenuOpen(!isStationMenuOpen)}
                className="relative h-9 lg:h-10 px-3 sm:px-4 py-1.5 rounded-full flex items-center justify-center lg:justify-start gap-2 text-xs sm:text-sm font-medium text-white bg-black/90 backdrop-blur-2xl shadow-2xl cursor-pointer hover:bg-black transition-all duration-200"
                aria-expanded={isStationMenuOpen}
                title="Switch Station / Genre"
              >
                <span
                  className="inline-flex items-center justify-center flex-shrink-0 w-4 h-4"
                  style={{ color: currentStation?.color || '#00f0ff' }}
                >
                  <Radio className="w-full h-full" />
                </span>
                <span className="hidden sm:inline max-w-[140px] md:max-w-[180px] truncate font-space font-bold text-white/95">
                  {currentStation?.name}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-white/70 transition-transform duration-200 ${isStationMenuOpen ? 'rotate-180' : ''}`} />
              </motion.button>
            </div>

            {/* Dropdown Menu Modal Card with AnimatePresence */}
            <AnimatePresence>
              {isStationMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.94, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94, y: 8 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="absolute right-0 top-full mt-2 w-[calc(100vw-32px)] sm:w-[340px] max-w-[360px] rounded-3xl glass-panel p-3 shadow-2xl z-50 border border-white/25 max-h-[72vh] flex flex-col overflow-hidden"
                >
                  {/* Search Bar */}
                  <div className="mb-2 px-0.5 flex-shrink-0">
                    <input
                      type="text"
                      placeholder="Search 28+ stations, phonk, lo-fi..."
                      value={stationSearch}
                      onChange={(e) => setStationSearch(e.target.value)}
                      className="w-full bg-white/10 text-white placeholder-white/40 text-xs rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-white/40 border border-white/15"
                      autoFocus
                    />
                  </div>

                  {/* Station List Scroll Area */}
                  <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scroll max-h-[50vh]">
                    {filteredStations.map((st) => {
                      const isSelected = st.id === currentStation?.id;
                      return (
                        <button
                          key={st.id}
                          onClick={() => {
                            onSelectStation(st);
                            setIsStationMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs sm:text-sm font-medium transition-all text-left group cursor-pointer ${
                            isSelected
                              ? 'bg-white/20 text-white font-bold border border-white/30 shadow-lg'
                              : 'text-neutral-300 hover:bg-white/10 hover:text-white border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3 truncate flex-1 min-w-0">
                            <span
                              className="inline-flex items-center justify-center flex-shrink-0 w-3.5 h-3.5"
                              style={{ color: st.color }}
                            >
                              <Radio className="w-full h-full" />
                            </span>
                            <div className="truncate">
                              <div className="truncate text-white font-medium font-space text-xs">{st.name}</div>
                              <div className="text-[10px] text-white/50 truncate">{st.songs?.length || 0} curated tracks</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                            {st.isNew && (
                              <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase rounded-md bg-pink-600 text-white shadow-sm">
                                NEW
                              </span>
                            )}
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-white" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Fullscreen / Screensaver Toggle Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggleFullscreen}
            className="hidden sm:block p-2 text-white/80 hover:text-white transition-all duration-200 focus:outline-none cursor-pointer"
            title="Toggle Screensaver Mode (F)"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </motion.button>
        </div>
    </header>
  );
}
