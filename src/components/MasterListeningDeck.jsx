import React, { useMemo } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Sliders, Settings, Radio, Sparkles, Heart, Plus } from 'lucide-react';
import { formatTime } from '../utils/formatters';
import { useAudio } from '../context/AudioContext';

export default function MasterListeningDeck({
  currentStation,
  currentTrack,
  isPlaying,
  isLoading,
  currentTime,
  duration,
  buffered,
  volume,
  isMuted,
  onlineCount,
  onTogglePlay,
  onNextTrack,
  onPrevTrack,
  onSeek,
  onChangeVolume,
  onToggleMute,
  onOpenAudioSource
}) {
  const { isLiked, handleToggleLike, spawnRadioFeed } = useAudio();
  const liked = isLiked(currentTrack?.id || currentTrack?.title);

  const progressPct = useMemo(() => {
    if (!duration || duration <= 0) return 0;
    return Math.min(100, Math.max(0, (currentTime / duration) * 100));
  }, [currentTime, duration]);

  const bufferPct = useMemo(() => {
    if (!duration || duration <= 0) return 100;
    return Math.min(100, Math.max(0, (buffered / duration) * 100));
  }, [buffered, duration]);

  const channelMeta = useMemo(() => {
    const id = (currentStation?.id || '').toLowerCase();
    if (id.includes('dhh') || id.includes('hip-hop')) return { code: 'CH 01 // DELHI', tag: 'STATION 01 // UNDERGROUND MASTER ARCHIVE', carrier: 'Lossless 24-Bit Carrier' };
    if (id.includes('phonk') || id.includes('drift')) return { code: 'CH 02 // MEMPHIS', tag: 'STATION 02 // NIGHT DRIVE & PHONK RADAR', carrier: 'Analog Precision Matrix' };
    if (id.includes('bollywood') || id.includes('dil-ke-paas')) return { code: 'CH 03 // BOMBAY', tag: 'STATION 03 // ARCHIVAL OPTICAL VINYL', carrier: 'Optical Archival Relay' };
    if (id.includes('lofi') || id.includes('soft')) return { code: 'CH 04 // KYOTO', tag: 'STATION 04 // BINAURAL TEA HOUSE FEED', carrier: 'Binaural Studer Reel' };
    if (id.includes('synth') || id.includes('slowed')) return { code: 'CH 05 // BERLIN', tag: 'STATION 05 // CINEMA NOCTURNE MATRIX', carrier: 'Analog Juno 106 Relay' };
    return { code: 'CH 06 // SOVEREIGN', tag: 'STATION 06 // LOSSLESS ARCHIVAL FEED', carrier: 'Direct Studio Master' };
  }, [currentStation]);

  const coverArt = currentTrack?.thumbnail || currentStation?.desktopBgs?.[0] || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80';

  const handleTimelineClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    if (duration > 0) {
      onSeek(pct * duration);
    }
  };

  const handleVolumeClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newVol = Math.max(0, Math.min(1, clickX / rect.width));
    onChangeVolume(newVol);
  };

  // Title rendering with single-word tracer highlight (Atlantic.vc style)
  const trackTitle = currentTrack?.title || currentStation?.name || 'Sovereign Lossless Stream';
  const titleWords = trackTitle.split(' ');
  const firstWord = titleWords[0] || '';
  const remainingWords = titleWords.slice(1).join(' ');

  return (
    <section className="pt-8 pb-16 border-b border-[#2b2f33]/60 relative" id="live-deck">
      
      {/* Minimal Top Telemetry Ribbon */}
      <div className="flex items-center justify-between gap-4 mb-6 pb-2 border-b border-[#2b2f33]/40 font-mono text-[10px] tracking-[0.16em] uppercase">
        <div className="flex items-center gap-2 text-[#cfc6b0]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-pulse" />
          <span>LIVE // {channelMeta.code}</span>
        </div>

        <div className="flex items-center gap-3 text-[#8f918c]">
          <span>24-BIT / 96 kHz</span>
          <span className="text-[#8f918c]/40 hidden sm:inline">•</span>
          <span className="hidden sm:inline">{onlineCount?.toLocaleString() || '3,482'} NODES</span>
        </div>
      </div>

      {/* Wireframe Deck Container */}
      <div className="relative w-full rounded-[16px] bg-[#121316]/95 border border-[#cfc6b0]/20 p-5 sm:p-8 lg:p-10 transition-all duration-300 hover:border-[#cfc6b0]/35 backdrop-blur-md">
        
        {/* CAD Corner Crosshairs */}
        <span className="cad-corner cad-tl" />
        <span className="cad-corner cad-tr" />
        <span className="cad-corner cad-bl" />
        <span className="cad-corner cad-br" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
          
          {/* Left: Viewport Frame */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-start">
            <div className="relative aspect-square w-full max-w-[360px] rounded-[12px] overflow-hidden bg-[#0d0e11] border border-[#cfc6b0]/25 group">
              <img
                src={coverArt}
                alt={trackTitle}
                className="w-full h-full object-cover grayscale-[25%] contrast-[1.05] transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80';
                }}
              />

              {/* Viewport Overlay */}
              <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.16em] text-[#cfc6b0] px-2.5 py-1.5 rounded-[6px] bg-[#0d0e11]/85 backdrop-blur-md border border-white/10">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-pulse" />
                  <span>{channelMeta.code}</span>
                </div>
                <span className="text-[#8f918c]">{isPlaying ? 'TRANSMITTING' : 'STANDBY'}</span>
              </div>

              {/* Lower Track Metadata Slate */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 p-2.5 rounded-[8px] bg-[#0d0e11]/90 backdrop-blur-md border border-white/10 flex items-center justify-between">
                <div className="flex flex-col truncate pr-2">
                  <span className="text-[9px] font-mono text-[#8f918c] uppercase tracking-[0.16em]">
                    RELAY // MASTER
                  </span>
                  <span className="font-space text-sm text-[#FAF8F5] truncate mt-0.5">
                    {trackTitle}
                  </span>
                </div>
                
                {/* Equalizer indicator */}
                <div className="w-7 h-7 rounded-[6px] border border-[#cfc6b0]/30 bg-[#1b1b1f] flex items-center justify-center text-[#00f0ff] flex-shrink-0">
                  {isPlaying ? (
                    <div className="flex items-end gap-1 h-3">
                      <span className="w-0.5 bg-[#00f0ff] animate-[pulse_0.7s_ease-in-out_infinite] h-full" />
                      <span className="w-0.5 bg-[#cfc6b0] animate-[pulse_0.5s_ease-in-out_infinite_0.15s] h-2/3" />
                      <span className="w-0.5 bg-[#00f0ff] animate-[pulse_0.9s_ease-in-out_infinite_0.3s] h-4/5" />
                    </div>
                  ) : (
                    <Radio className="w-3 h-3 text-[#8f918c]" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Editorial Statement & Controls */}
          <div className="lg:col-span-7 flex flex-col justify-between h-full gap-6">
            
            {/* Monument Typography */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#cfc6b0]">
                  ✦ {channelMeta.tag}
                </span>
              </div>

              <h1 className="display-monument text-2xl sm:text-4xl lg:text-5xl text-[#FAF8F5] mb-3">
                <span className="word-tracer">{firstWord}</span> {remainingWords}
              </h1>

              <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-[#8f918c] tracking-wide">
                <span className="text-[#FAF8F5] font-medium">{currentTrack?.artist || 'Viberr Radio'}</span>
                <span>•</span>
                <span className="text-[#00f0ff]">24-BIT FLAC</span>
                <span>•</span>
                <button
                  onClick={() => handleToggleLike(currentTrack)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] border text-[11px] font-mono transition-all cursor-pointer ${
                    liked
                      ? 'border-[#cfc6b0] bg-[#cfc6b0]/20 text-[#FAF8F5]'
                      : 'border-[#2b2f33] hover:border-[#cfc6b0]/50 text-[#8f918c] hover:text-[#FAF8F5] bg-transparent'
                  }`}
                  title={liked ? 'Remove from My Vault' : 'Save to My Vault'}
                >
                  <Heart className={`w-3 h-3 ${liked ? 'fill-[#cfc6b0] text-[#cfc6b0]' : ''}`} />
                  <span>{liked ? 'SAVED TO VAULT' : 'SAVE TO VAULT'}</span>
                </button>
                <button
                  onClick={() => spawnRadioFeed(currentTrack)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] border border-[#2b2f33] hover:border-[#cfc6b0]/50 text-[11px] font-mono text-[#8f918c] hover:text-[#FAF8F5] transition-all cursor-pointer"
                  title="Generate dynamic intelligent radio feed from this song"
                >
                  <Sparkles className="w-3 h-3 text-[#00f0ff]" />
                  <span>SPAWN RADIO</span>
                </button>
              </div>
            </div>

            {/* Audio Timeline & Scrubber */}
            <div className="p-3.5 rounded-[12px] bg-[#0d0e11]/80 border border-[#2b2f33] flex flex-col gap-2">
              <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.14em] text-[#8f918c]">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-amber-400 animate-pulse' : 'bg-[#00f0ff]'}`} />
                  <span className="text-[#cfc6b0]">
                    {isLoading ? 'BUFFERING CARRIER...' : isPlaying ? 'DIRECT FEED' : 'STANDBY'}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-[#FAF8F5] font-medium">
                    {formatTime(currentTime)}
                  </span>
                  <span>/</span>
                  <span className="text-[#8f918c]">{duration > 0 ? formatTime(duration) : 'LIVE'}</span>
                </div>
              </div>

              {/* Scrubber slider */}
              <div
                className="relative w-full h-1.5 bg-[#232529] rounded-full cursor-pointer group flex items-center"
                onClick={handleTimelineClick}
                title="Seek position"
              >
                <div
                  className="h-full bg-[#cfc6b0] rounded-full transition-all"
                  style={{ width: `${progressPct}%` }}
                />
                <div
                  className="absolute w-3.5 h-3.5 rounded-full bg-[#FAF8F5] border border-[#00f0ff] shadow-sm transform -translate-x-1/2 group-hover:scale-125 transition-transform"
                  style={{ left: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Tactile Outlined Action Controls (Atlantic.vc Action Pattern) */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              
              {/* Main Audio Buttons */}
              <div className="flex items-center gap-4">
                {/* Outlined Precision Play/Pause Button */}
                <button
                  onClick={onTogglePlay}
                  className="w-14 h-14 rounded-[12px] border border-[#cfc6b0] hover:border-[#FAF8F5] bg-[#1b1b1f] hover:bg-[#cfc6b0]/15 text-[#FAF8F5] flex items-center justify-center transition-all duration-200 active:translate-y-px cursor-pointer group relative"
                  title={isPlaying ? 'Pause Broadcast (Space)' : 'Start Broadcast (Space)'}
                  aria-label={isPlaying ? 'Pause Broadcast' : 'Start Broadcast'}
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 fill-current text-[#cfc6b0] group-hover:text-[#FAF8F5]" />
                  ) : (
                    <Play className="w-6 h-6 fill-current ml-0.5 text-[#cfc6b0] group-hover:text-[#FAF8F5]" />
                  )}
                  {isLoading && (
                    <span className="absolute -inset-[2px] rounded-[14px] border-2 border-[#00f0ff] border-t-transparent animate-spin pointer-events-none" />
                  )}
                </button>

                {/* Track Hops */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={onPrevTrack}
                    className="w-9 h-9 rounded-[8px] border border-[#2b2f33] hover:border-[#cfc6b0]/50 bg-transparent flex items-center justify-center text-[#8f918c] hover:text-[#FAF8F5] transition-all cursor-pointer"
                    title="Previous Track (P)"
                    aria-label="Previous Track"
                  >
                    <SkipBack className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={onNextTrack}
                    className="w-9 h-9 rounded-[8px] border border-[#2b2f33] hover:border-[#cfc6b0]/50 bg-transparent flex items-center justify-center text-[#8f918c] hover:text-[#FAF8F5] transition-all cursor-pointer"
                    title="Next Track (N)"
                    aria-label="Next Track"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                  </button>

                  <div className="ml-2 flex flex-col font-mono text-[10px]">
                    <span className="text-[#FAF8F5] tracking-[0.14em]">CHANNEL {channelMeta.code}</span>
                    <span className="text-[#8f918c]">SOVEREIGN DIRECT FEED</span>
                  </div>
                </div>
              </div>

              {/* Volume & Acoustic DSP Quick Links */}
              <div className="flex items-center gap-4">
                {/* Volume Slider Control */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={onToggleMute}
                    className="text-[#8f918c] hover:text-[#FAF8F5] transition-colors cursor-pointer p-1"
                    title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <div
                    className="relative w-20 h-1 bg-[#232529] rounded-full cursor-pointer group"
                    onClick={handleVolumeClick}
                    title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
                  >
                    <div
                      className="h-full bg-[#cfc6b0] rounded-full"
                      style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-[#8f918c] w-8 text-right">
                    {Math.round((isMuted ? 0 : volume) * 100)}%
                  </span>
                </div>

                {/* Jump to Acoustic Matrix */}
                <a
                  href="#acoustic-room"
                  className="wireframe-btn !py-1.5 !px-3"
                >
                  <Sliders className="w-3 h-3 text-[#cfc6b0]" />
                  <span>DSP MATRIX</span>
                </a>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

