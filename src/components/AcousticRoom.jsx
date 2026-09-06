import React from 'react';
import { Sliders, Sparkles, Radio, CloudRain, Disc, Waves, RotateCcw } from 'lucide-react';
import { EQ_FREQUENCIES } from '../hooks/useStudioEqualizer';

// 5 Key Bands corresponding to Stitch UI display
const STITCH_BANDS = [
  { label: '40 Hz', sub: 'SUB-BASS', index: 0, min: -12, max: 12 },
  { label: '250 Hz', sub: 'WARMTH', index: 3, min: -12, max: 12 },
  { label: '1.5 kHz', sub: 'PRESENCE', index: 6, min: -12, max: 12 },
  { label: '8 kHz', sub: 'AIR', index: 8, min: -12, max: 12 },
  { label: '16 kHz', sub: 'SILK', index: 9, min: -12, max: 12 }
];

export default function AcousticRoom({
  bandGains = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  onSetBandGain,
  onResetEq,
  activeEffects,
  onToggleEffect
}) {
  const handleFaderChange = (bandIndex, e) => {
    const val = parseFloat(e.target.value);
    if (onSetBandGain) {
      onSetBandGain(bandIndex, val);
    }
  };

  return (
    <section className="py-14 border-b border-[#343538]/40" id="acoustic-room">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Section Intro & Philosophy */}
        <div className="lg:col-span-4 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1b1b1f] border border-[#343538]/50 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#cfc6b0]" />
              <span className="font-label-telemetry uppercase text-[#cfc6b0] tracking-widest text-[11px]">
                DSP CONVOLUTION ENGINE
              </span>
            </div>
            <h2 className="font-headline-lg text-[#FAF8F5] tracking-tight mb-4">
              The Acoustic Room
            </h2>
            <p className="font-body-md text-[#c5c7c1] leading-relaxed mb-6 text-sm">
              Direct your personal playback stage while the radio streams. Tailor the master audio chain with calibrated analog curves, then layer organic physical textures underneath.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0d0e11] border border-[#343538]/50 font-label-telemetry text-[#8f918c] flex items-center gap-3 text-xs shadow-sm">
            <Sparkles className="w-5 h-5 text-[#cfc6b0] flex-shrink-0" />
            <span>ZERO LATENCY HARDWARE-ACCELERATED BROWSER CONVOLUTION</span>
          </div>
        </div>

        {/* DSP Hardware Console */}
        <div className="lg:col-span-8 p-6 md:p-8 rounded-2xl bg-[#1b1b1f] border border-[#343538]/60 shadow-xl flex flex-col gap-8">
          
          {/* 5-Band Equalizer Sliders */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-[#FAF8F5]">5-Band Analog Tone Contour</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#343538] text-[#cfc6b0] font-mono">
                  STUDER CURVE
                </span>
              </div>
              <button
                onClick={onResetEq}
                className="font-label-telemetry text-[#8f918c] hover:text-[#FAF8F5] uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer"
                title="Reset all EQ bands to 0.0 dB"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Flat (0.0 dB)</span>
              </button>
            </div>

            {/* Faders Grid */}
            <div className="grid grid-cols-5 gap-3 sm:gap-6 pt-6 pb-3 bg-[#0d0e11] rounded-xl p-4 sm:p-6 border border-[#343538]/50">
              {STITCH_BANDS.map((band) => {
                const gain = bandGains[band.index] !== undefined ? bandGains[band.index] : 0;
                const displayDb = (gain >= 0 ? `+${gain.toFixed(1)}` : gain.toFixed(1)) + ' dB';
                const pct = Math.min(100, Math.max(0, ((gain + 12) / 24) * 100));

                return (
                  <div key={band.label} className="flex flex-col items-center gap-4">
                    <span className={`font-label-telemetry font-mono text-xs ${gain !== 0 ? 'text-[#cfc6b0] font-bold' : 'text-[#8f918c]'}`}>
                      {displayDb}
                    </span>

                    {/* Vertical slider track */}
                    <div className="relative w-3 sm:w-4 h-36 bg-[#292a2d] rounded-full flex justify-center items-center group">
                      {/* Active fill */}
                      <div
                        className="absolute bottom-0 w-full bg-[#cfc6b0] rounded-full transition-all"
                        style={{ height: `${pct}%` }}
                      />
                      {/* Thumb */}
                      <div
                        className="absolute w-5 h-5 rounded-full bg-[#FAF8F5] shadow-md transform -translate-y-1/2 pointer-events-none group-hover:scale-110 transition-transform"
                        style={{ bottom: `calc(${pct}% - 10px)` }}
                      />
                      {/* Invisible vertical range input overlay */}
                      <input
                        type="range"
                        min="-12"
                        max="12"
                        step="0.5"
                        value={gain}
                        onChange={(e) => handleFaderChange(band.index, e)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                        aria-label={`${band.label} gain`}
                      />
                    </div>

                    <div className="text-center">
                      <span className="font-label-telemetry text-[#FAF8F5] block text-xs">
                        {band.label}
                      </span>
                      <span className="text-[10px] text-[#8f918c] uppercase font-mono">
                        {band.sub}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tactile Soundscape Layers (Toggle Bank) */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-headline-sm text-[#FAF8F5]">Analog Environmental Texture Layering</span>
              <span className="font-label-telemetry text-[#8f918c] font-mono uppercase text-xs">
                REAL-TIME MIX BUS
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Toggle 1: Vinyl Surface Crackle */}
              <label className="flex items-center justify-between p-4 rounded-xl bg-[#0d0e11] border border-[#343538]/50 cursor-pointer hover:bg-[#1f1f23] transition-colors">
                <div className="flex items-center gap-3">
                  <Disc className="w-5 h-5 text-[#cfc6b0]" />
                  <div className="flex flex-col">
                    <span className="font-body-md text-[#FAF8F5] font-medium text-sm">Vinyl Surface Crackle</span>
                    <span className="font-label-telemetry text-[#8f918c] uppercase text-[10px]">1968 Columbia Pressing</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={!!activeEffects?.vinyl?.enabled}
                  onChange={() => onToggleEffect('vinyl')}
                  className="w-4 h-4 accent-[#cfc6b0] rounded cursor-pointer"
                />
              </label>

              {/* Toggle 2: Procedural Rain */}
              <label className="flex items-center justify-between p-4 rounded-xl bg-[#0d0e11] border border-[#343538]/50 cursor-pointer hover:bg-[#1f1f23] transition-colors">
                <div className="flex items-center gap-3">
                  <CloudRain className="w-5 h-5 text-[#cfc6b0]" />
                  <div className="flex flex-col">
                    <span className="font-body-md text-[#FAF8F5] font-medium text-sm">Procedural Rain</span>
                    <span className="font-label-telemetry text-[#8f918c] uppercase text-[10px]">432Hz Binaural Roof Drift</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={!!activeEffects?.rain?.enabled}
                  onChange={() => onToggleEffect('rain')}
                  className="w-4 h-4 accent-[#cfc6b0] rounded cursor-pointer"
                />
              </label>

              {/* Toggle 3: Studer Tape Hiss */}
              <label className="flex items-center justify-between p-4 rounded-xl bg-[#0d0e11] border border-[#343538]/50 cursor-pointer hover:bg-[#1f1f23] transition-colors">
                <div className="flex items-center gap-3">
                  <Waves className="w-5 h-5 text-[#cfc6b0]" />
                  <div className="flex flex-col">
                    <span className="font-body-md text-[#FAF8F5] font-medium text-sm">Subtle Tape Hiss</span>
                    <span className="font-label-telemetry text-[#8f918c] uppercase text-[10px]">Studer A80 1/4" Reel</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={!!activeEffects?.wind?.enabled}
                  onChange={() => onToggleEffect('wind')}
                  className="w-4 h-4 accent-[#cfc6b0] rounded cursor-pointer"
                />
              </label>

              {/* Toggle 4: Mullard Tube Saturation */}
              <label className="flex items-center justify-between p-4 rounded-xl bg-[#0d0e11] border border-[#343538]/50 cursor-pointer hover:bg-[#1f1f23] transition-colors">
                <div className="flex items-center gap-3">
                  <Radio className="w-5 h-5 text-[#cfc6b0]" />
                  <div className="flex flex-col">
                    <span className="font-body-md text-[#FAF8F5] font-medium text-sm">Warm Tube Saturation</span>
                    <span className="font-label-telemetry text-[#8f918c] uppercase text-[10px]">Mullard 12AX7 Class-A Stage</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={!!activeEffects?.binaural?.enabled}
                  onChange={() => onToggleEffect('binaural')}
                  className="w-4 h-4 accent-[#cfc6b0] rounded cursor-pointer"
                />
              </label>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
