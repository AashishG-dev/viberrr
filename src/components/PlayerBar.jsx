import React, { useState, useRef } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, 
  Volume2, VolumeX, Shuffle, Radio, Sliders,
  ListMusic, PictureInPicture2, Heart
} from 'lucide-react';
import { formatTime } from '../utils/formatters';
import { useAudio } from '../context/AudioContext';

function PlayerBar({
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
  const { isLiked, handleToggleLike, userQueue } = useAudio();
  const liked = isLiked(currentTrack?.id || currentTrack?.title);

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
    <aside className="fixed bottom-0 left-0 right-0 z-40 w-full bg-[#0d0e12]/95 backdrop-blur-2xl border-t border-[#262830] select-none font-mono pb-[calc(env(safe-area-inset-bottom,0px)+3px)] shadow-[0_-8px_32px_rgba(0,0,0,0.8)] flex justify-center">
      {/* Top Edge-to-Edge Hairline Progress / Scrubber Bar */}
      <div
        ref={scrubBarRef}
        onClick={handleScrubClick}
        className="absolute top-0 left-0 right-0 h-[3px] sm:h-[2px] bg-[#1d1f24] hover:h-[5px] cursor-pointer transition-all z-50 group"
        title="Seek Position"
      >
        <div
          className="h-full bg-gradient-to-r from-[#00f0ff] via-[#cfc6b0] to-[#FAF8F5] transition-all relative"
          style={{ width: `${progressPercent}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#FAF8F5] opacity-0 group-hover:opacity-100 shadow-[0_0_8px_#00f0ff] transition-opacity" />
        </div>
      </div>

      <div className="w-full max-w-[1440px] 2xl:max-w-[1720px] mx-auto px-3 sm:px-6 md:px-8 h-16 sm:h-18 flex items-center justify-between gap-2.5 sm:gap-6">
        
        {/* Left: Active Track Meta (Compact on mobile, full on desktop) */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 md:flex-initial md:min-w-[200px] md:max-w-[340px]">
          <div className="w-10 h-10 rounded-[8px] bg-[#15161a] border border-[#cfc6b0]/25 flex items-center justify-center flex-shrink-0 relative overflow-hidden shadow-md">
            <img
              src={currentTrack?.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&q=80'}
              alt={currentTrack?.title || 'Archive Thumbnail'}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&q=80';
              }}
            />
          </div>

          <div className="flex flex-col truncate flex-1 min-w-0 pr-1">
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-amber-400' : 'bg-[#00f0ff]'} animate-pulse flex-shrink-0`} />
              <span className="text-[9px] font-mono text-[#00f0ff] uppercase tracking-[0.14em] truncate">
                {isLoading ? 'BUFFERING' : 'LOSSLESS'}
              </span>
            </div>
            <span className="font-space text-xs sm:text-sm text-[#FAF8F5] truncate leading-tight mt-0.5 font-medium">
              {currentTrack?.title || 'No Stream Loaded'}
            </span>
            <span className="text-[10px] text-[#9ca0a8] truncate">
              {currentTrack?.artist || 'Viberr Radio'}
            </span>
          </div>

          {currentTrack && (
            <button
              onClick={() => handleToggleLike(currentTrack)}
              className={`p-1.5 rounded-[6px] border transition-all cursor-pointer flex-shrink-0 ${
                liked
                  ? 'border-[#cfc6b0] text-[#cfc6b0] bg-[#cfc6b0]/15'
                  : 'border-[#262830] text-[#8f918c] hover:text-[#FAF8F5] hover:border-[#cfc6b0]/40'
              }`}
              title={liked ? 'Remove from My Vault' : 'Save to My Vault'}
              aria-label={liked ? 'Liked' : 'Like'}
            >
              <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>

        {/* Center: Desktop Audio Controls & Timeline Bar */}
        <div className="hidden md:flex flex-1 max-w-xl flex-col items-center gap-1.5">
          <div className="flex items-center gap-4 sm:gap-5">
            <button
              onClick={onToggleShuffle}
              className={`text-xs transition-colors cursor-pointer p-1 ${
                isShuffled ? 'text-[#00f0ff]' : 'text-[#8f918c] hover:text-[#FAF8F5]'
              }`}
              title={isShuffled ? 'Shuffle Enabled' : 'Shuffle Disabled'}
              aria-label="Toggle Shuffle"
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onPrevTrack}
              className="text-[#8f918c] hover:text-[#FAF8F5] transition-colors cursor-pointer p-1"
              title="Previous Track (P)"
              aria-label="Previous Track"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            {/* Outlined Play/Pause Action Button */}
            <button
              onClick={onTogglePlay}
              className="w-9 h-9 rounded-[8px] border border-[#cfc6b0] hover:border-[#FAF8F5] bg-[#18191e] hover:bg-[#cfc6b0]/20 text-[#FAF8F5] flex items-center justify-center transition-all active:scale-95 cursor-pointer group relative shadow-sm"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current text-[#cfc6b0] group-hover:text-[#FAF8F5]" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5 text-[#cfc6b0] group-hover:text-[#FAF8F5]" />
              )}
              {isLoading && (
                <span className="absolute -inset-[2px] rounded-[10px] border border-[#00f0ff] border-t-transparent animate-spin pointer-events-none" />
              )}
            </button>

            <button
              onClick={onNextTrack}
              className="text-[#8f918c] hover:text-[#FAF8F5] transition-colors cursor-pointer p-1"
              title="Next Track (N)"
              aria-label="Next Track"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Desktop Hairline Timeline Scrubber */}
          <div className="w-full flex items-center gap-3 max-w-md">
            <span className="text-[#8f918c] text-[10px] w-10 text-right">
              {formatTime(currentTime)}
            </span>

            <div
              onClick={handleScrubClick}
              className="relative flex-1 h-[2px] bg-[#232529] hover:h-[4px] rounded-full cursor-pointer transition-all group flex items-center"
              title="Seek Position"
            >
              <div
                className="absolute left-0 top-0 bottom-0 bg-[#cfc6b0] rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <span className="text-[#8f918c] text-[10px] w-10">
              {duration > 0 ? formatTime(duration) : 'LIVE'}
            </span>
          </div>
        </div>

        {/* Mobile Quick Playback Controls (< 768px) */}
        <div className="flex md:hidden items-center gap-1 sm:gap-2 flex-shrink-0">
          <button
            onClick={onPrevTrack}
            className="w-8 h-8 rounded-[6px] text-[#9ca0a8] active:text-[#FAF8F5] flex items-center justify-center cursor-pointer"
            aria-label="Previous Track"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={onTogglePlay}
            className="w-10 h-10 rounded-[10px] border border-[#cfc6b0] bg-[#1a1b20] active:scale-95 text-[#FAF8F5] flex items-center justify-center transition-transform cursor-pointer relative shadow-[0_0_12px_rgba(207,198,176,0.15)]"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current text-[#cfc6b0]" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5 text-[#cfc6b0]" />
            )}
            {isLoading && (
              <span className="absolute -inset-[2px] rounded-[12px] border border-[#00f0ff] border-t-transparent animate-spin pointer-events-none" />
            )}
          </button>

          <button
            onClick={onNextTrack}
            className="w-8 h-8 rounded-[6px] text-[#9ca0a8] active:text-[#FAF8F5] flex items-center justify-center cursor-pointer"
            aria-label="Next Track"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenPlaylist}
            className="p-1.5 ml-1 rounded-[6px] text-[#cfc6b0] border border-[#262830] active:border-[#cfc6b0]/50 cursor-pointer"
            title="Queue"
            aria-label="Queue"
          >
            <ListMusic className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Desktop Controls (Volume, PiP, Queue) */}
        <div className="hidden md:flex items-center justify-end gap-3 sm:gap-4 min-w-[200px]">
          {/* Queue Drawer Button */}
          <button
            onClick={onOpenPlaylist}
            className="wireframe-btn !py-1 !px-2.5 text-[10px]"
            title="Open Playlist / Queue Drawer (Q)"
          >
            <ListMusic className="w-3 h-3 text-[#cfc6b0]" />
            <span>QUEUE {userQueue?.length > 0 ? `(${userQueue.length})` : ''}</span>
          </button>

          {/* Floating PiP Mini Player */}
          {onOpenFloatingMiniPlayer && (
            <button
              onClick={onOpenFloatingMiniPlayer}
              className={`p-1.5 rounded-[6px] border border-[#2b2f33] transition-colors cursor-pointer ${
                isPipActive
                  ? 'text-[#00f0ff] border-[#00f0ff]'
                  : 'text-[#8f918c] hover:text-[#FAF8F5]'
              }`}
              title="Always-on-Top Mini Player (X)"
            >
              <PictureInPicture2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleMute}
              className="text-[#8f918c] hover:text-[#FAF8F5] transition-colors cursor-pointer p-1"
              title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || currentVol === 0 ? (
                <VolumeX className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>

            <div
              className="relative w-16 sm:w-20 h-[2px] bg-[#232529] hover:h-[4px] rounded-full cursor-pointer transition-all"
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

export default React.memo(PlayerBar);


