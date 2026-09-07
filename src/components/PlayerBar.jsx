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
    <aside className="fixed bottom-0 left-0 right-0 z-40 bg-[#0d0e11]/95 backdrop-blur-2xl border-t border-[#2b2f33] select-none font-mono">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 h-18 flex items-center justify-between gap-6">
        
        {/* Left: Active Track Meta in Precision Wireframe Cell */}
        <div className="flex items-center gap-3 min-w-[200px] max-w-[340px]">
          <div className="w-10 h-10 rounded-[6px] bg-[#121316] border border-[#cfc6b0]/30 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
            <img
              src={currentTrack?.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&q=80'}
              alt={currentTrack?.title || 'Archive Thumbnail'}
              className="w-full h-full object-cover grayscale-[15%]"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&q=80';
              }}
            />
          </div>

          <div className="flex flex-col truncate flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-amber-400' : 'bg-[#00f0ff]'} animate-pulse`} />
              <span className="text-[9px] font-mono text-[#00f0ff] uppercase tracking-[0.16em] truncate">
                {isLoading ? 'BUFFERING...' : 'FLAC 96kHz'}
              </span>
            </div>
            <span className="font-space text-xs text-[#FAF8F5] truncate leading-tight mt-0.5 font-normal">
              {currentTrack?.title || 'No Stream Loaded'}
            </span>
            <span className="text-[10px] text-[#8f918c] truncate">
              {currentTrack?.artist || 'Viberr Radio'}
            </span>
          </div>

          {currentTrack && (
            <button
              onClick={() => handleToggleLike(currentTrack)}
              className={`p-1.5 rounded-[6px] border transition-all cursor-pointer flex-shrink-0 ${
                liked
                  ? 'border-[#cfc6b0] text-[#cfc6b0] bg-[#cfc6b0]/15'
                  : 'border-[#2b2f33] text-[#8f918c] hover:text-[#FAF8F5] hover:border-[#cfc6b0]/40'
              }`}
              title={liked ? 'Remove from My Vault' : 'Save to My Vault'}
            >
              <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>

        {/* Center: Controls & Audio Timeline Bar */}
        <div className="flex-1 max-w-xl flex flex-col items-center gap-2">
          <div className="flex items-center gap-4 sm:gap-5">
            <button
              onClick={onToggleShuffle}
              className={`text-xs transition-colors cursor-pointer hidden sm:block p-1 ${
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
              className="w-9 h-9 rounded-[8px] border border-[#cfc6b0] hover:border-[#FAF8F5] bg-[#1b1b1f] hover:bg-[#cfc6b0]/15 text-[#FAF8F5] flex items-center justify-center transition-all active:translate-y-px cursor-pointer group relative"
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

          {/* Hairline Timeline Scrubber */}
          <div className="w-full flex items-center gap-3 max-w-md">
            <span className="text-[#8f918c] text-[10px] w-10 text-right">
              {formatTime(currentTime)}
            </span>

            <div
              ref={scrubBarRef}
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

        {/* Right: Direct Level & Queue Affordances */}
        <div className="flex items-center justify-end gap-3 sm:gap-4 min-w-[200px]">
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
              className={`p-1.5 rounded-[6px] border border-[#2b2f33] transition-colors cursor-pointer hidden md:block ${
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
              className="text-[#8f918c] hover:text-[#FAF8F5] transition-colors cursor-pointer"
              title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
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


