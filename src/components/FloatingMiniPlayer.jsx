import React from 'react';
import { createPortal } from 'react-dom';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Volume2, VolumeX, X, Radio } from 'lucide-react';
import { formatTime } from '../utils/formatters';

export default function FloatingMiniPlayer({
  container,
  currentTrack,
  isPlaying,
  isLoading,
  currentTime,
  duration,
  buffered,
  isShuffled,
  volume,
  isMuted,
  frequencies = [],
  currentStation,
  onTogglePlay,
  onNextTrack,
  onPrevTrack,
  onToggleShuffle,
  onSeek,
  onToggleMute,
  onClose
}) {
  if (!container) return null;

  const safeDuration = duration > 0 ? duration : 100;
  const progressPercent = Math.min(100, Math.max(0, (currentTime / safeDuration) * 100));
  const bufferPercent = Math.min(100, Math.max(0, (buffered / safeDuration) * 100));

  // FFT bars
  const eq1 = frequencies[0] ? Math.max(15, (frequencies[0] / 255) * 100) : 40;
  const eq2 = frequencies[2] ? Math.max(15, (frequencies[2] / 255) * 100) : 85;
  const eq3 = frequencies[4] ? Math.max(15, (frequencies[4] / 255) * 100) : 60;
  const eq4 = frequencies[6] ? Math.max(15, (frequencies[6] / 255) * 100) : 95;

  const content = (
    <div 
      className="w-full h-full min-h-[460px] flex flex-col justify-between p-4 bg-[#07070a] text-white relative overflow-hidden select-none"
      style={{
        '--st-color': currentStation?.color || '#00f0ff',
        '--st-glow': `${currentStation?.color || '#00f0ff'}55`
      }}
    >
      {/* Background Ambient Glow */}
      <div 
        className="absolute -top-20 -left-20 w-60 h-60 rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{ backgroundColor: currentStation?.color || '#00f0ff' }}
      />

      {/* Top Bar: Station Pill + Close */}
      <div className="flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="truncate max-w-[180px] font-bold text-white/90">
            {currentStation?.name || 'Viberr'}
          </span>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer"
            title="Close Floating Window"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Center: Spinning Disc & Track Info */}
      <div className="flex flex-col items-center justify-center my-auto text-center z-10 relative py-2">
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 mb-3">
          <div
            className={`w-full h-full rounded-full overflow-hidden border-2 border-white/20 shadow-2xl ${
              isPlaying ? 'animate-spin-slow' : ''
            }`}
          >
            <img
              src={currentTrack?.thumbnail || '/favicon.svg'}
              alt={currentTrack?.title || 'Album Art'}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 rounded-full border border-white/30 pointer-events-none" />
        </div>

        <h3 className="text-sm sm:text-base font-bold font-syne text-white truncate max-w-[260px]">
          {currentTrack?.title || 'Selecting Track...'}
        </h3>
        <p className="text-xs text-white/60 font-space truncate max-w-[240px] mt-0.5">
          {currentTrack?.artist || 'Viberr Live Radio'}
        </p>

        {/* Live Mini FFT Equalizer */}
        {isPlaying && (
          <div className="flex items-end gap-1 h-4 mt-2">
            <span className="w-1 bg-[var(--st-color,#00f0ff)] rounded-full transition-all duration-75" style={{ height: `${eq1}%` }} />
            <span className="w-1 bg-[var(--st-color,#00f0ff)] rounded-full transition-all duration-75" style={{ height: `${eq2}%` }} />
            <span className="w-1 bg-[var(--st-color,#00f0ff)] rounded-full transition-all duration-75" style={{ height: `${eq3}%` }} />
            <span className="w-1 bg-[var(--st-color,#00f0ff)] rounded-full transition-all duration-75" style={{ height: `${eq4}%` }} />
          </div>
        )}
      </div>

      {/* Bottom: Scrubber & Playback Controls */}
      <div className="flex flex-col gap-2.5 z-10 relative pt-2 border-t border-white/10">
        
        {/* Scrubber with Live Buffer */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-white/60 min-w-[55px]">
            {formatTime(currentTime)} / {duration > 0 ? formatTime(duration) : 'LIVE'}
          </span>
          <div 
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              if (duration > 0) onSeek(pos * duration);
            }}
            className="relative flex-1 h-2 rounded-full bg-white/15 cursor-pointer overflow-hidden"
          >
            <div
              className="absolute top-0 left-0 h-full bg-white/30"
              style={{ width: `${bufferPercent}%` }}
            />
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-[var(--st-color,#00f0ff)] to-cyan-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between px-2">
          {/* Shuffle Toggle */}
          <button
            onClick={onToggleShuffle}
            className={`p-2 rounded-full cursor-pointer transition-colors ${
              isShuffled ? 'text-emerald-400 bg-emerald-500/20' : 'text-white/60 hover:text-white'
            }`}
            title="Toggle Shuffle"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          {/* Core Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={onPrevTrack}
              className="p-2 text-white/80 hover:text-white cursor-pointer active:scale-90 transition-transform"
              title="Previous Track"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>

            <button
              onClick={onTogglePlay}
              className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Play / Pause"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current translate-x-0.5" />
              )}
            </button>

            <button
              onClick={onNextTrack}
              className="p-2 text-white/80 hover:text-white cursor-pointer active:scale-90 transition-transform"
              title="Next Track"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>
          </div>

          {/* Mute Toggle */}
          <button
            onClick={onToggleMute}
            className="p-2 text-white/60 hover:text-white cursor-pointer transition-colors"
            title="Mute / Unmute"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, container);
}
