import React, { useMemo } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Sliders, Settings } from 'lucide-react';
import { formatTime } from '../utils/formatters';

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
  // Format progress and buffer
  const progressPct = useMemo(() => {
    if (!duration || duration <= 0) return 0;
    return Math.min(100, Math.max(0, (currentTime / duration) * 100));
  }, [currentTime, duration]);

  const bufferPct = useMemo(() => {
    if (!duration || duration <= 0) return 100;
    return Math.min(100, Math.max(0, (buffered / duration) * 100));
  }, [buffered, duration]);

  // Station channel code & city mapping
  const channelMeta = useMemo(() => {
    const id = (currentStation?.id || '').toLowerCase();
    if (id.includes('dhh') || id.includes('hip-hop')) return { code: 'CH 01 // DELHI', tag: 'STATION 01 // RAW GULLY TAPE & DESI HIP HOP', reel: 'Ampex 456 Master Tape' };
    if (id.includes('phonk') || id.includes('drift')) return { code: 'CH 02 // MEMPHIS', tag: 'STATION 02 // NIGHT DRIVE & PHONK ARCHIVE', reel: 'Studer A80 1/4" Reel' };
    if (id.includes('bollywood') || id.includes('dil-ke-paas')) return { code: 'CH 03 // BOMBAY', tag: 'STATION 03 // RETRO BOLLYWOOD ARCHIVE', reel: '1971 Optical Vinyl Pickup' };
    if (id.includes('lofi') || id.includes('soft')) return { code: 'CH 04 // KYOTO', tag: 'STATION 04 // KYOTO RAIN & TEA HOUSE', reel: 'Binaural Studer Reel' };
    if (id.includes('synth') || id.includes('slowed')) return { code: 'CH 05 // BERLIN', tag: 'STATION 05 // CINEMA NOCTURNE & JUNO', reel: 'Roland Juno 106 Master' };
    return { code: 'CH 06 // SOVEREIGN', tag: 'STATION 06 // LOSSLESS ARCHIVAL FEED', reel: 'Direct Studio Master' };
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

  return (
    <section className="pt-6 pb-12 border-b border-[#343538]/40" id="live-deck">
      {/* Live Status Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1b1b1f] border border-[#343538]/50 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#cfc6b0] tape-pulse" />
          <span className="font-label-telemetry uppercase text-[#cfc6b0] tracking-widest">
            NOW BROADCASTING // PRIMARY DISPATCH
          </span>
        </div>

        <div className="flex items-center gap-3 text-[#8f918c] font-label-telemetry uppercase">
          <span>BIT DEPTH: <strong className="text-[#FAF8F5] font-mono">24-BIT / 96.0 kHz</strong></span>
          <span className="hidden md:inline text-[#8f918c]/50">•</span>
          <span className="hidden md:inline">LATENCY: <strong className="text-[#FAF8F5] font-mono">0.18s SOVEREIGN</strong></span>
          <span className="text-[#8f918c]/50">•</span>
          <span>BUFFER: <span className="text-[#cfc6b0]">{duration > 0 ? `${Math.round(bufferPct)}%` : 'PRIMED 100%'}</span></span>
        </div>
      </div>

      {/* Master Direct Player Deck Stage */}
      <div className="relative w-full rounded-2xl bg-[#1b1b1f]/95 border border-[#343538]/60 p-6 md:p-8 lg:p-10 shadow-2xl backdrop-blur-md">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left: Curated Station Sleeved Cover */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-start">
            <div className="relative aspect-square w-full max-w-[360px] rounded-xl overflow-hidden bg-[#0d0e11] border border-[#343538]/70 group shadow-xl">
              <img
                src={coverArt}
                alt={currentTrack?.title || currentStation?.name || 'Active Station Vinyl Art'}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80';
                }}
              />

              {/* Live Visualizer Overlay Tag */}
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#0d0e11]/85 backdrop-blur-md border border-white/10 flex items-center gap-1.5 font-label-telemetry text-[#cfc6b0] shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-[#cfc6b0] tape-pulse" />
                <span>{channelMeta.code}</span>
              </div>

              {/* On-Artwork Recessed Track Slate */}
              <div className="absolute bottom-3 left-3 right-3 p-3 rounded-lg bg-[#0d0e11]/90 backdrop-blur-md border border-white/10 flex items-center justify-between shadow-lg">
                <div className="flex flex-col truncate pr-2">
                  <span className="text-[10px] font-mono text-[#8f918c] uppercase tracking-wider">ARCHIVE MASTER TAPE</span>
                  <span className="font-headline-sm text-sm text-[#FAF8F5] truncate">
                    {currentTrack?.title || currentStation?.name || 'VIBERR Lossless Stream'}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#292a2d] flex items-center justify-center text-[#cfc6b0] flex-shrink-0">
                  {isPlaying ? (
                    <div className="flex items-end gap-0.5 h-3">
                      <span className="w-0.5 bg-[#cfc6b0] animate-[pulse_0.8s_ease-in-out_infinite] h-full" />
                      <span className="w-0.5 bg-[#cfc6b0] animate-[pulse_0.6s_ease-in-out_infinite_0.2s] h-2/3" />
                      <span className="w-0.5 bg-[#cfc6b0] animate-[pulse_0.9s_ease-in-out_infinite_0.4s] h-4/5" />
                    </div>
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-[#8f918c]" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Direct Playback Controls & Station Headliner */}
          <div className="lg:col-span-7 flex flex-col justify-between h-full gap-6">
            {/* Station Name & Track Title */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-label-telemetry uppercase text-[#cfc6b0] tracking-widest">
                  {channelMeta.tag}
                </span>
                <span className="font-label-telemetry text-[#8f918c]">
                  <span className="text-[#FAF8F5] font-mono font-bold">{onlineCount?.toLocaleString() || '3,482'}</span> TUNED IN
                </span>
              </div>

              <h1 className="font-headline-lg text-[#FAF8F5] tracking-tight leading-tight mb-2">
                {currentTrack?.title || currentStation?.name || 'Continuous Master Stream'}
              </h1>

              <p className="font-body-md text-[#c5c7c1] font-light flex flex-wrap items-center gap-2">
                <span className="font-medium text-[#FAF8F5]">{currentTrack?.artist || 'Viberr Sovereign Archival Collective'}</span>
                <span className="text-[#8f918c]">•</span>
                <span className="text-[#8f918c]">{channelMeta.reel}</span>
              </p>
            </div>

            {/* Live Audio Scrubber & Time Telemetry */}
            <div className="p-4 rounded-xl bg-[#0d0e11]/85 border border-[#343538]/50 flex flex-col gap-2 shadow-inner">
              <div className="flex items-center justify-between font-label-telemetry text-[#8f918c]">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#cfc6b0] tape-pulse" />
                  <span className="text-[#cfc6b0] font-mono">{isPlaying ? 'LIVE FEED SYNCED' : 'STREAM STANDBY'}</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-[#FAF8F5] font-semibold">{formatTime(currentTime)}</span>
                  <span>/</span>
                  <span className="text-[#8f918c]">{duration > 0 ? formatTime(duration) : 'CONTINUOUS'}</span>
                </div>
              </div>

              {/* Interactive timeline slider */}
              <div
                className="relative w-full h-2.5 bg-[#343538] rounded-full cursor-pointer group flex items-center"
                onClick={handleTimelineClick}
                title="Click to seek stream position"
              >
                <div
                  className="h-full bg-[#cfc6b0] rounded-full transition-all"
                  style={{ width: `${progressPct}%` }}
                />
                <div
                  className="absolute w-4 h-4 rounded-full bg-[#FAF8F5] shadow-md transform -translate-x-1/2 group-hover:scale-125 transition-transform"
                  style={{ left: `${progressPct}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-[#8f918c] pt-1">
                <span>INPUT: REEL TAPE A</span>
                <span>CONVOLUTION: VINTAGE NEVE 8048</span>
                <span>OUTPUT: LOSSLESS DIRECT FLAC</span>
              </div>
            </div>

            {/* Tactile Master Controls Deck */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
              {/* Main Action Buttons */}
              <div className="flex items-center gap-4">
                {/* Large Play/Pause Tactile Circle */}
                <button
                  onClick={onTogglePlay}
                  className="w-16 h-16 rounded-full bg-[#FAF8F5] hover:bg-[#eae6df] text-[#121316] flex items-center justify-center transition-all active:scale-95 shadow-[0_4px_24px_rgba(0,0,0,0.8)] cursor-pointer"
                  title={isPlaying ? 'Pause Broadcast (Space)' : 'Start Broadcast (Space)'}
                  aria-label={isPlaying ? 'Pause Broadcast' : 'Start Broadcast'}
                >
                  {isLoading ? (
                    <div className="w-7 h-7 border-2 border-[#121316] border-t-transparent rounded-full animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-8 h-8 fill-current" />
                  ) : (
                    <Play className="w-8 h-8 fill-current ml-1" />
                  )}
                </button>

                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={onPrevTrack}
                      className="w-9 h-9 rounded-full bg-[#1f1f23] hover:bg-[#292a2d] border border-[#343538]/60 flex items-center justify-center text-[#e3e2e6] hover:text-[#FAF8F5] transition-colors cursor-pointer"
                      title="Previous Track (P)"
                      aria-label="Previous Track"
                    >
                      <SkipBack className="w-4 h-4" />
                    </button>
                    <button
                      onClick={onNextTrack}
                      className="w-9 h-9 rounded-full bg-[#1f1f23] hover:bg-[#292a2d] border border-[#343538]/60 flex items-center justify-center text-[#e3e2e6] hover:text-[#FAF8F5] transition-colors cursor-pointer"
                      title="Next Track (N)"
                      aria-label="Next Track"
                    >
                      <SkipForward className="w-4 h-4" />
                    </button>
                    <span className="font-label-telemetry text-[#8f918c] ml-2 uppercase">HOP STATION</span>
                  </div>
                  <span className={`text-[11px] font-mono mt-1 ${isPlaying ? 'text-[#FAF8F5]' : 'text-[#cfc6b0]'}`}>
                    {isPlaying ? `LIVE STREAMING ${channelMeta.code} // FLAC 96kHz` : 'STREAM PRIMED • CLICK TO PLAY'}
                  </span>
                </div>
              </div>

              {/* Live Volume & DSP Quick Access */}
              <div className="flex items-center gap-4">
                {/* Volume Slider Control */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={onToggleMute}
                    className="text-[#8f918c] hover:text-[#FAF8F5] transition-colors cursor-pointer p-1"
                    title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>

                  <div
                    className="relative w-24 h-1.5 bg-[#343538] rounded-full cursor-pointer group"
                    onClick={handleVolumeClick}
                    title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
                  >
                    <div
                      className="h-full bg-[#cfc6b0] rounded-full"
                      style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                    />
                  </div>
                  <span className="font-mono text-[11px] text-[#8f918c] w-9 text-right">
                    {Math.round((isMuted ? 0 : volume) * 100)}%
                  </span>
                </div>

                {/* Jump to DSP Acoustic Room */}
                <a
                  href="#acoustic-room"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#343538]/60 hover:bg-[#343538] text-[#e3e2e6] hover:text-[#FAF8F5] font-label-pill uppercase border border-[#343538]/80 transition-colors shadow-sm"
                >
                  <Sliders className="w-3.5 h-3.5 text-[#cfc6b0]" />
                  <span>ROOM DSP</span>
                </a>

                {/* Settings / Config Button */}
                <button
                  onClick={onOpenAudioSource}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#1b1b1f] hover:bg-[#292a2d] text-[#c5c7c1] hover:text-[#FAF8F5] font-label-pill uppercase border border-[#343538]/60 transition-colors cursor-pointer"
                  title="Audio Engine & Device Settings"
                >
                  <Settings className="w-3.5 h-3.5 text-[#8f918c]" />
                  <span className="hidden sm:inline font-mono text-[11px]">SETTINGS</span>
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
