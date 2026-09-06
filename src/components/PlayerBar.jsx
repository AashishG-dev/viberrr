import React, { useState, useRef } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, 
  Volume2, VolumeX, Shuffle, Radio, Sliders,
  ListMusic, PictureInPicture2
} from 'lucide-react';
import { formatTime } from '../utils/formatters';

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
  onOpenAmbientFx,
  volume = 0.8,
  isMuted = false,
  onChangeVolume,
  onToggleMute
}) {
  const scrubBarRef = useRef(null);
  const safeDuration = duration > 0 ? duration : 100;
  const progressPercent = Math.min(100, Math.max(0, (currentTime / safeDuration) * 100));

  const handleScrubClick = (e) => {
    if (!scrubBarRef.current || duration <= 0) return;
    const rect = scrubBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onSeek(pos * duration);
  };

  const handleVolumeClick = (e) => {
    if (!onChangeVolume) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newVol = Math.max(0, Math.min(1, clickX / rect.width));
    onChangeVolume(newVol);
  };

  const currentVol = isMuted ? 0 : (volume !== undefined ? volume : 0.8);

  return (
    <aside className="fixed bottom-0 left-0 right-0 z-40 bg-[#121316]/95 backdrop-blur-2xl border-t border-[#343538]/60 shadow-[0_-8px_32px_rgba(13,14,17,0.95)] select-none">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Left: Active Track Meta */}
        <div className="flex items-center gap-3.5 min-w-[200px] max-w-[340px]">
          <div className="w-11 h-11 rounded-lg bg-[#292a2d] border border-[#343538]/80 flex items-center justify-center flex-shrink-0 relative overflow-hidden shadow-md">
            <img
              src={currentTrack?.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&q=80'}
              alt={currentTrack?.title || 'Active Station Thumbnail'}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&q=80';
              }}
            />
          </div>

          <div className="flex flex-col truncate">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#cfc6b0] tape-pulse" />
              <span className="text-[10px] font-mono text-[#cfc6b0] uppercase truncate">
                {currentAudioSource?.name || 'LOSSLESS TRANSMISSION'}
              </span>
            </div>
            <span className="font-headline-sm text-sm text-[#FAF8F5] truncate leading-tight mt-0.5">
              {currentTrack?.title || 'No Track Loaded'}
            </span>
            <span className="text-[11px] text-[#8f918c] truncate">
              {currentTrack?.artist || 'Viberr Sovereign Archive'}
            </span>
          </div>
        </div>

        {/* Center: Controls & Quick Transport */}
        <div className="flex-1 max-w-xl flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={onToggleShuffle}
              className={`text-xs transition-colors cursor-pointer hidden sm:block p-1 ${
                isShuffled ? 'text-[#cfc6b0]' : 'text-[#8f918c] hover:text-[#FAF8F5]'
              }`}
              title={isShuffled ? 'Shuffle Enabled' : 'Shuffle Disabled'}
              aria-label="Toggle Shuffle"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={onPrevTrack}
              className="text-[#c5c7c1] hover:text-[#FAF8F5] transition-colors cursor-pointer p-1"
              title="Previous Track (P)"
              aria-label="Previous Track"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={onTogglePlay}
              className="w-10 h-10 rounded-full bg-[#FAF8F5] hover:bg-[#eae6df] text-[#121316] flex items-center justify-center transition-transform active:scale-95 shadow-[0_2px_12px_rgba(0,0,0,0.7)] cursor-pointer"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-[#121316] border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={onNextTrack}
              className="text-[#c5c7c1] hover:text-[#FAF8F5] transition-colors cursor-pointer p-1"
              title="Next Track (N)"
              aria-label="Next Track"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Strip Indicator */}
          <div className="w-full flex items-center gap-3 max-w-md">
            <span className="font-label-telemetry text-[#8f918c] font-mono text-[10px]">
              {formatTime(currentTime)}
            </span>

            <div
              ref={scrubBarRef}
              onClick={handleScrubClick}
              className="relative flex-1 h-[3px] bg-[#343538] hover:h-[5px] rounded-full cursor-pointer transition-all group"
              title="Seek Position"
            >
              <div
                className="absolute left-0 top-0 bottom-0 bg-[#cfc6b0] rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <span className="font-label-telemetry text-[#8f918c] font-mono text-[10px]">
              {duration > 0 ? formatTime(duration) : '96k FLAC'}
            </span>
          </div>
        </div>

        {/* Right: Direct Level & Switch Affordances */}
        <div className="flex items-center justify-end gap-3 sm:gap-4 min-w-[200px]">
          {/* Switch Queue Drawer */}
          <button
            onClick={onOpenPlaylist}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1b1b1f] hover:bg-[#292a2d] text-[#c5c7c1] hover:text-[#FAF8F5] text-[10px] font-label-telemetry uppercase tracking-wider border border-[#343538]/60 transition-colors cursor-pointer shadow-sm"
            title="Open Playlist / Queue Drawer (Q)"
          >
            <ListMusic className="w-3.5 h-3.5 text-[#cfc6b0]" />
            <span>QUEUE</span>
          </button>

          {/* Floating PiP Mini Player */}
          {onOpenFloatingMiniPlayer && (
            <button
              onClick={onOpenFloatingMiniPlayer}
              className={`p-1.5 rounded-full transition-colors cursor-pointer hidden md:block ${
                isPipActive
                  ? 'text-[#cfc6b0] bg-[#292a2d]'
                  : 'text-[#8f918c] hover:text-[#FAF8F5]'
              }`}
              title="Always-on-Top Mini Player (X)"
            >
              <PictureInPicture2 className="w-4 h-4" />
            </button>
          )}

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleMute}
              className="text-[#8f918c] hover:text-[#FAF8F5] transition-colors cursor-pointer"
              title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
            >
              {isMuted || currentVol === 0 ? (
                <VolumeX className="w-4 h-4 text-amber-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            <div
              className="relative w-16 sm:w-20 h-[3px] bg-[#343538] hover:h-[5px] rounded-full cursor-pointer transition-all"
              onClick={handleVolumeClick}
              title={`Volume: ${Math.round(currentVol * 100)}%`}
            >
              <div
                className="absolute left-0 top-0 bottom-0 bg-[#cfc6b0] rounded-full"
                style={{ width: `${currentVol * 100}%` }}
              />
            </div>
          </div>
        </div>

      </div>
    </aside>
  );
}
