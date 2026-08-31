import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, SkipBack, SkipForward, 
  Shuffle, Share2, Zap, Minimize, Maximize,
  PictureInPicture2, ExternalLink, Sliders
} from 'lucide-react';
import { formatTime } from '../utils/formatters';

/**
 * Unique Futuristic Cyber-Orbital Loader
 */
function CyberOrbitalLoader({ color = '#00f0ff' }) {
  return (
    <div className="relative w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center pointer-events-none">
      {/* Outer spinning dash ring */}
      <span
        className="absolute inset-0 rounded-full border-2 border-dashed animate-spin"
        style={{ borderColor: `${color}88`, borderTopColor: 'transparent', animationDuration: '1.2s' }}
      />
      {/* Inner pulsating radar core */}
      <span
        className="w-2.5 h-2.5 rounded-full animate-ping"
        style={{ backgroundColor: color }}
      />
      {/* Center glowing dot */}
      <span
        className="absolute w-2 h-2 rounded-full shadow-[0_0_10px_currentColor]"
        style={{ backgroundColor: color, color }}
      />
    </div>
  );
}

export default function PlayerBar({
  currentTrack,
  isPlaying,
  isLoading,
  currentTime,
  duration,
  buffered = 0,
  isShuffled,
  onTogglePlay,
  onNextTrack,
  onPrevTrack,
  onToggleShuffle,
  onSeek,
  onOpenPlaylist,
  onOpenAudioSource,
  onShareStation,
  currentAudioSource,
  frequencies = [],
  isMinimalMode = false,
  onToggleMinimalMode,
  onOpenFloatingMiniPlayer,
  isPipActive = false,
  onOpenAmbientFx
}) {
  const [hoverPosition, setHoverPosition] = useState(null);
  const [hoverTime, setHoverTime] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const scrubBarRef = useRef(null);

  const safeDuration = duration > 0 ? duration : 100;
  const progressPercent = Math.min(100, Math.max(0, (currentTime / safeDuration) * 100));
  const bufferPercent = Math.min(100, Math.max(0, (buffered / safeDuration) * 100));

  // Compute real FFT heights for the 4 equalizer bars
  const eq1 = frequencies[0] ? Math.max(15, (frequencies[0] / 255) * 100) : 40;
  const eq2 = frequencies[2] ? Math.max(15, (frequencies[2] / 255) * 100) : 85;
  const eq3 = frequencies[4] ? Math.max(15, (frequencies[4] / 255) * 100) : 60;
  const eq4 = frequencies[6] ? Math.max(15, (frequencies[6] / 255) * 100) : 95;

  const handleMouseMove = (e) => {
    if (!scrubBarRef.current || duration <= 0) return;
    const rect = scrubBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverPosition(pos * 100);
    setHoverTime(pos * duration);
  };

  const handleMouseLeave = () => {
    if (!isScrubbing) {
      setHoverPosition(null);
    }
  };

  const handleScrubClick = (e) => {
    if (!scrubBarRef.current || duration <= 0) return;
    const rect = scrubBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onSeek(pos * duration);
  };

  // ----------------------------------------------------
  // ZEN MINIMAL MODE COMPACT FLOATING BAR
  // ----------------------------------------------------
  if (isMinimalMode) {
    return (
      <div className="w-full flex flex-col items-center pointer-events-auto select-none relative z-40 px-3 pb-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className="glass-panel px-4 py-2.5 rounded-full flex items-center gap-3 sm:gap-4 shadow-2xl border border-white/20 hover:border-white/40 max-w-lg w-full justify-between backdrop-blur-3xl bg-black/80"
        >
          {/* Left: Mini Disc & Title */}
          <div 
            onClick={onOpenPlaylist}
            className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer group"
          >
            <div className={`w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-white/20 ${isPlaying ? 'animate-spin-slow' : ''}`}>
              <img 
                src={currentTrack?.thumbnail || '/favicon.svg'} 
                alt="" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="truncate min-w-0 flex-1">
              <div className="text-xs font-bold font-syne text-white truncate group-hover:text-cyan-300 transition-colors">
                {currentTrack?.title || 'Viberr Radio'}
              </div>
              <div className="text-[10px] font-space text-white/50 truncate">
                {formatTime(currentTime)} / {duration > 0 ? formatTime(duration) : 'LIVE'}
              </div>
            </div>
          </div>

          {/* Center: Mini Controls */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={onPrevTrack}
              className="p-1.5 text-white/80 hover:text-white cursor-pointer"
              title="Previous Track (P)"
            >
              <SkipBack className="w-3.5 h-3.5 fill-current" />
            </button>

            <button
              onClick={onTogglePlay}
              className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer"
              title="Play / Pause (Space)"
            >
              {isLoading ? (
                <CyberOrbitalLoader color="#000000" />
              ) : isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current translate-x-0.5" />
              )}
            </button>

            <button
              onClick={onNextTrack}
              className="p-1.5 text-white/80 hover:text-white cursor-pointer"
              title="Next Track (N)"
            >
              <SkipForward className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>

          {/* Right: Actions (PiP + Expand) */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {onOpenFloatingMiniPlayer && (
              <button
                onClick={onOpenFloatingMiniPlayer}
                className="glass-button p-1.5 rounded-full text-cyan-300 hover:text-white cursor-pointer"
                title="Always-On-Top Floating Player (X)"
              >
                <PictureInPicture2 className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={onToggleMinimalMode}
              className="glass-button p-1.5 rounded-full text-white/70 hover:text-white cursor-pointer"
              title="Expand Full Studio View (Z)"
            >
              <Maximize className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ----------------------------------------------------
  // FULL STUDIO DYNAMIC PLAYER BAR
  // ----------------------------------------------------
  return (
    <div className="w-full flex flex-col items-center pointer-events-auto select-none relative z-40 px-2 sm:px-4">
      
      {/* Floating Action Chips Above Player (Shuffle & Engine & Zen & Pop-up PiP) */}
      <div className="flex items-center gap-2 sm:gap-2.5 mb-2.5 flex-wrap justify-center">
        
        {/* Shuffle Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleShuffle}
          className={`glass-button px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-mono font-medium flex items-center gap-1.5 shadow-xl transition-all cursor-pointer ${
            isShuffled 
              ? 'text-white border-white/50 bg-white/20 shadow-[0_0_12px_rgba(255,255,255,0.2)]' 
              : 'text-white/70 hover:text-white border-white/15 bg-white/[0.06]'
          }`}
          title="Shuffle Station Tracks (S)"
          aria-label="Shuffle Playlist"
        >
          <Shuffle className={`w-3.5 h-3.5 ${isShuffled ? 'text-white' : 'text-white/60'}`} />
          <span>{isShuffled ? '[ SHUFFLE: ON ]' : 'SHUFFLE'}</span>
        </motion.button>

        {/* Audio Source Quick Switcher */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenAudioSource}
          className="glass-button px-3.5 py-1.5 rounded-full text-xs font-mono font-medium flex items-center gap-1.5 shadow-xl text-white/80 hover:text-white transition-all cursor-pointer border border-white/15 bg-white/[0.06] hover:bg-white/10"
          title="Change Music Engine / Stream Source"
        >
          <Zap className="w-3.5 h-3.5 text-white/70" />
          <span className="text-white/85">
            ENGINE: {currentAudioSource?.name ? currentAudioSource.name.split(' ')[0] : 'CDN 320k'}
          </span>
        </motion.button>

        {/* Always-On-Top Floating Mini Window (Picture-in-Picture) */}
        {onOpenFloatingMiniPlayer && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenFloatingMiniPlayer}
            className={`glass-button px-3 py-1.5 rounded-full text-xs font-mono font-medium flex items-center gap-1.5 shadow-xl transition-all cursor-pointer border ${
              isPipActive
                ? 'text-white border-white/50 bg-white/20 shadow-[0_0_12px_rgba(255,255,255,0.2)]'
                : 'text-white/70 hover:text-white border-white/15 bg-white/[0.06] hover:bg-white/10'
            }`}
            title="Always-on-top Floating Window for Multitasking (X)"
          >
            <PictureInPicture2 className="w-3.5 h-3.5 text-white/70" />
            <span className="hidden sm:inline">FLOATING PIP</span>
          </motion.button>
        )}

        {/* Ambient Soundscapes & Atmospheric FX */}
        {onOpenAmbientFx && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenAmbientFx}
            className="glass-button px-3 py-1.5 rounded-full text-xs font-mono font-medium text-white/70 hover:text-white flex items-center gap-1.5 shadow-xl transition-all cursor-pointer border border-white/15 bg-white/[0.06] hover:bg-white/10"
            title="Procedural Ambient FX & Weather Shaders (A)"
          >
            <Sliders className="w-3.5 h-3.5 text-white/70" />
            <span className="hidden sm:inline text-white/85">AMBIENT FX</span>
          </motion.button>
        )}

        {/* Minimal Mode Toggle Chip */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleMinimalMode}
          className="glass-button px-3 py-1.5 rounded-full text-xs font-mono font-medium text-white/70 hover:text-white flex items-center gap-1.5 shadow-xl transition-all cursor-pointer border border-white/15 bg-white/[0.06] hover:bg-white/10"
          title="Toggle Zen Minimal Island View (Z)"
        >
          <Minimize className="w-3.5 h-3.5 text-white/70" />
          <span className="hidden sm:inline text-white/85">ZEN MODE</span>
        </motion.button>
      </div>

      {/* Saloon Floating Player Bar */}
      <motion.div
        id="saloon-player-bar"
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-2xl glass-panel rounded-3xl p-3 sm:p-4 flex flex-col gap-2.5 sm:gap-3 shadow-2xl transition-all duration-300 border border-white/25 hover:border-white/40"
      >
        {/* Top Row: Vinyl Disc & Track Info (Left), Playback Controls (Right) */}
        <div className="flex items-center justify-between gap-3 sm:gap-4 min-w-0 w-full">
          
          {/* Left Section: Turntable Disc & Track Info */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            
            {/* Spinning CD/Vinyl Record with Active Glow */}
            <motion.div
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenPlaylist}
              className="relative flex-shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400/50 rounded-full group"
              tabIndex={0}
              title="Click to open playlist"
              role="button"
              aria-label="View Playlist"
            >
              <div
                className={`vinyl-disk group-hover:scale-105 transition-transform ${
                  isPlaying ? 'animate-spin-slow' : ''
                }`}
                style={{
                  animationPlayState: isPlaying ? 'running' : 'paused'
                }}
              >
                {currentTrack?.thumbnail && (
                  <img
                    src={currentTrack.thumbnail}
                    alt={currentTrack.title}
                    className="absolute inset-2.5 rounded-full object-cover opacity-90 pointer-events-none"
                  />
                )}
                <div className="vinyl-sheen" />
              </div>
            </motion.div>

            {/* Track Details */}
            <div
              onClick={onOpenPlaylist}
              className="cursor-pointer group flex flex-col focus:outline-none rounded-lg min-w-0 flex-1 overflow-hidden"
              tabIndex={0}
              title="Click to view full playlist"
              role="button"
              aria-label="Open Playlist Drawer"
            >
              <div className="flex items-center gap-2.5 min-w-0 w-full">
                <h2 className="text-xs sm:text-sm font-bold font-syne text-white truncate min-w-0 group-hover:text-white/90 transition-colors">
                  {currentTrack?.title || 'Selecting track...'}
                </h2>

                {/* Real-time Web Audio API Equalizer Bars */}
                {isPlaying && (
                  <div className="eq-container flex-shrink-0">
                    <span className="eq-bar" style={{ height: `${eq1}%` }} />
                    <span className="eq-bar" style={{ height: `${eq2}%` }} />
                    <span className="eq-bar" style={{ height: `${eq3}%` }} />
                    <span className="eq-bar" style={{ height: `${eq4}%` }} />
                  </div>
                )}

                <span className="hidden md:inline-flex items-center whitespace-nowrap flex-shrink-0 text-[10px] font-mono font-medium text-white/60 border border-white/15 px-2 py-0.5 rounded-md group-hover:border-white/30 group-hover:text-white transition-colors">
                  PLAYLIST
                </span>
              </div>

              <p className="text-[11px] sm:text-xs font-space text-white/60 truncate min-w-0 w-full mt-0.5 font-normal">
                {currentTrack?.artist || 'Viberr Radio'}
              </p>
            </div>
          </div>

          {/* Right Section: Audio Playback Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
            
            {/* Previous Track */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onPrevTrack}
              className="glass-button p-2.5 sm:p-3 rounded-full text-white/90 hover:text-white cursor-pointer"
              title="Previous Track (P)"
              aria-label="Previous Track"
            >
              <SkipBack className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            </motion.button>

            {/* Main Play / Pause Button with Unique Cyber-Loader */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={onTogglePlay}
              className={`bg-white text-black hover:bg-neutral-100 p-3 sm:p-3.5 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.7)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/60 cursor-pointer ${
                !isPlaying && !isLoading ? 'animate-pulse' : ''
              }`}
              title="Play / Pause (Space)"
              aria-label="Play / Pause"
            >
              {isLoading ? (
                <CyberOrbitalLoader color="#050508" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
              ) : (
                <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current translate-x-0.5" />
              )}
            </motion.button>

            {/* Next Track */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onNextTrack}
              className="glass-button p-2.5 sm:p-3 rounded-full text-white/90 hover:text-white cursor-pointer"
              title="Next Track (N)"
              aria-label="Next Track"
            >
              <SkipForward className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            </motion.button>

            {/* Share Button (Desktop) */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onShareStation}
              className="hidden sm:flex glass-button p-2.5 sm:p-3 rounded-full text-white/90 hover:text-white ml-0.5 transition-all cursor-pointer"
              title="Share Station"
              aria-label="Share Station"
            >
              <Share2 className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Bottom Row: Dynamic Luminous Buffer Bar & Scrub Tooltip */}
        <div className="flex items-center gap-3 w-full pt-2 border-t border-white/10">
          
          {/* Elapsed Time */}
          <span className="text-[11px] font-mono font-medium text-white/80 flex-shrink-0 min-w-[72px]">
            {formatTime(currentTime)} / {duration > 0 ? formatTime(duration) : 'LIVE'}
          </span>

          {/* Interactive Multi-layer Scrubber with Buffer Visualizer */}
          <div 
            ref={scrubBarRef}
            onClick={handleScrubClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative flex-1 flex items-center h-6 cursor-pointer group"
          >
            {/* Track Rail Background */}
            <div className="w-full h-1.5 sm:h-2 rounded-full bg-white/15 overflow-hidden relative backdrop-blur-md">
              
              {/* 1. Audio Buffer Loaded Progress Layer */}
              <div
                className="absolute top-0 left-0 h-full rounded-full bg-white/30 transition-all duration-300"
                style={{ width: `${bufferPercent}%` }}
                title={`Buffered: ${Math.round(bufferPercent)}%`}
              />

              {/* 2. Played Audio Progress Gradient */}
              <div
                className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-[var(--st-color,#00f0ff)] to-cyan-300 transition-all duration-75 shadow-[0_0_12px_var(--st-color,#00f0ff)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Glowing Scrubber Head Needle */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.9),0_0_16px_var(--st-color)] scale-0 group-hover:scale-100 transition-transform pointer-events-none"
              style={{ left: `${progressPercent}%` }}
            />

            {/* Hover Time Tooltip */}
            <AnimatePresence>
              {hoverPosition !== null && duration > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full mb-1.5 -translate-x-1/2 px-2 py-0.5 rounded-md bg-black/90 border border-white/20 text-[10px] font-mono text-cyan-300 shadow-xl pointer-events-none"
                  style={{ left: `${hoverPosition}%` }}
                >
                  {formatTime(hoverTime)}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Buffer percentage indicator */}
          {duration > 0 && bufferPercent < 100 && (
            <span className="hidden md:inline-block text-[10px] font-mono text-white/40 flex-shrink-0">
              [BUF {Math.round(bufferPercent)}%]
            </span>
          )}
        </div>
      </motion.div>

      {/* Bottom Subtitle Keyboard Hint */}
      <div className="hidden sm:flex items-center justify-center w-full max-w-2xl px-2 mt-2">
        <span className="text-[11px] font-mono text-white/45">
          [ Space: Play • S: Shuffle • Z: Zen Mode • F: Screensaver • ?: Shortcuts ]
        </span>
      </div>
    </div>
  );
}
