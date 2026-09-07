import React from 'react';
import { Sliders, Sparkles, Radio, CloudRain, Disc, Waves, RotateCcw } from 'lucide-react';

const STITCH_BANDS = [
  { label: '40 Hz', sub: 'SUB-BASS', index: 0, min: -12, max: 12 },
  { label: '250 Hz', sub: 'WARMTH', index: 3, min: -12, max: 12 },
  { label: '1.5 kHz', sub: 'PRESENCE', index: 6, min: -12, max: 12 },
  { label: '8 kHz', sub: 'AIR', index: 8, min: -12, max: 12 },
  { label: '16 kHz', sub: 'SILK', index: 9, min: -12, max: 12 }
];

function AcousticRoom({
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
    <section className="py-16 border-b border-[#2b2f33]/60 relative" id="acoustic-room">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Section Intro */}
        <div className="lg:col-span-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 font-mono text-[10px] tracking-[0.18em] uppercase text-[#cfc6b0]">
              <span>✦ DSP STAGE</span>
            </div>
            <h2 className="display-monument text-2xl sm:text-3xl lg:text-4xl text-[#FAF8F5] mb-3">
              Acoustic <span className="word-tracer">Matrix</span>
            </h2>
            <p className="font-mono text-xs text-[#8f918c] mb-6 tracking-wide">
              Real-time master frequency contouring and analog tape warmth.
            </p>
          </div>

          <div className="p-3 rounded-[10px] bg-[#0d0e11] border border-[#2b2f33] font-mono text-[10px] tracking-[0.14em] text-[#8f918c] flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-pulse flex-shrink-0" />
            <span>0ms BROWSER DSP CONVOLUTION</span>
          </div>
        </div>

        {/* DSP Hardware Console - Stepped Charcoal Frame with Hairline Border */}
        <div className="lg:col-span-8 p-6 md:p-8 rounded-[16px] bg-[#121316] border border-[#cfc6b0]/20 flex flex-col gap-8 relative">
          <span className="cad-corner cad-tl" />
          <span className="cad-corner cad-tr" />
          <span className="cad-corner cad-bl" />
          <span className="cad-corner cad-br" />

          {/* 5-Band Equalizer Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 font-mono">
                <span className="text-xs uppercase tracking-[0.16em] text-[#FAF8F5]">5-BAND ANALOG CONTOUR</span>
                <span className="text-[9px] px-2 py-0.5 rounded-[4px] bg-[#1b1b1f] text-[#cfc6b0] border border-[#2b2f33] tracking-widest">
                  CALIBRATED
                </span>
              </div>

              <button
                onClick={onResetEq}
                className="wireframe-btn !py-1 !px-2.5"
                title="Reset all EQ bands to 0.0 dB"
              >
                <RotateCcw className="w-3 h-3 text-[#cfc6b0]" />
                <span>RESET FLAT (0.0 dB)</span>
              </button>
            </div>

            {/* Faders Grid */}
            <div className="grid grid-cols-5 gap-3 sm:gap-6 pt-6 pb-4 bg-[#0d0e11] rounded-[12px] p-4 sm:p-6 border border-[#2b2f33]">
              {STITCH_BANDS.map((band) => {
                const gain = bandGains[band.index] !== undefined ? bandGains[band.index] : 0;
                const displayDb = (gain >= 0 ? `+${gain.toFixed(1)}` : gain.toFixed(1)) + ' dB';
                const pct = Math.min(100, Math.max(0, ((gain + 12) / 24) * 100));

                return (
                  <div key={band.label} className="flex flex-col items-center gap-4">
                    <span className={`font-mono text-[10px] tracking-wider ${gain !== 0 ? 'text-[#00f0ff] font-semibold' : 'text-[#8f918c]'}`}>
                      {displayDb}
                    </span>

                    {/* Vertical slider track */}
                    <div className="relative w-2 sm:w-2.5 h-36 bg-[#232529] rounded-full flex justify-center items-center group">
                      <div
                        className="absolute bottom-0 w-full bg-[#cfc6b0] rounded-full transition-all"
                        style={{ height: `${pct}%` }}
                      />
                      <div
                        className="absolute w-4 h-4 rounded-full bg-[#FAF8F5] border border-[#00f0ff] shadow-sm transform -translate-y-1/2 pointer-events-none group-hover:scale-125 transition-transform"
                        style={{ bottom: `calc(${pct}% - 8px)` }}
                      />
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

                    <div className="text-center font-mono">
                      <span className="text-[#FAF8F5] block text-xs tracking-wider">
                        {band.label}
                      </span>
                      <span className="text-[9px] text-[#8f918c] uppercase tracking-widest block mt-0.5">
                        {band.sub}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tactile Soundscape Layers (Outlined Wireframe Toggle Bank) */}
          <div>
            <div className="flex items-center justify-between mb-4 font-mono text-[10px] tracking-[0.16em] uppercase">
              <span className="text-[#FAF8F5]">PHYSICAL NOISE CONVOLUTION</span>
              <span className="text-[#8f918c]">4 CHANNELS DOCKED</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
              
              {/* Toggle 1: Vinyl Surface Crackle */}
              <div 
                onClick={() => onToggleEffect('vinyl')}
                className={`flex items-center justify-between p-3.5 rounded-[10px] border transition-all cursor-pointer ${
                  activeEffects?.vinyl?.enabled
                    ? 'bg-[#1b1b1f] border-[#00f0ff] text-[#FAF8F5]'
                    : 'bg-[#0d0e11] border-[#2b2f33] text-[#8f918c] hover:border-[#cfc6b0]/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Disc className="w-4 h-4 text-[#cfc6b0]" />
                  <div className="flex flex-col">
                    <span className="text-xs text-[#FAF8F5]">Vinyl Surface Crackle</span>
                    <span className="text-[9px] text-[#8f918c] tracking-wider uppercase">1968 Optical Pressing</span>
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-[3px] border ${
                  activeEffects?.vinyl?.enabled ? 'bg-[#00f0ff] border-[#00f0ff]' : 'border-[#2b2f33]'
                }`} />
              </div>

              {/* Toggle 2: Procedural Rain */}
              <div 
                onClick={() => onToggleEffect('rain')}
                className={`flex items-center justify-between p-3.5 rounded-[10px] border transition-all cursor-pointer ${
                  activeEffects?.rain?.enabled
                    ? 'bg-[#1b1b1f] border-[#00f0ff] text-[#FAF8F5]'
                    : 'bg-[#0d0e11] border-[#2b2f33] text-[#8f918c] hover:border-[#cfc6b0]/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CloudRain className="w-4 h-4 text-[#cfc6b0]" />
                  <div className="flex flex-col">
                    <span className="text-xs text-[#FAF8F5]">Procedural Rain</span>
                    <span className="text-[9px] text-[#8f918c] tracking-wider uppercase">432Hz Binaural Roof</span>
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-[3px] border ${
                  activeEffects?.rain?.enabled ? 'bg-[#00f0ff] border-[#00f0ff]' : 'border-[#2b2f33]'
                }`} />
              </div>

              {/* Toggle 3: Studer Tape Hiss */}
              <div 
                onClick={() => onToggleEffect('wind')}
                className={`flex items-center justify-between p-3.5 rounded-[10px] border transition-all cursor-pointer ${
                  activeEffects?.wind?.enabled
                    ? 'bg-[#1b1b1f] border-[#00f0ff] text-[#FAF8F5]'
                    : 'bg-[#0d0e11] border-[#2b2f33] text-[#8f918c] hover:border-[#cfc6b0]/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Waves className="w-4 h-4 text-[#cfc6b0]" />
                  <div className="flex flex-col">
                    <span className="text-xs text-[#FAF8F5]">Studer Tape Hiss</span>
                    <span className="text-[9px] text-[#8f918c] tracking-wider uppercase">Studer A80 1/4" Reel</span>
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-[3px] border ${
                  activeEffects?.wind?.enabled ? 'bg-[#00f0ff] border-[#00f0ff]' : 'border-[#2b2f33]'
                }`} />
              </div>

              {/* Toggle 4: Warm Tube Saturation */}
              <div 
                onClick={() => onToggleEffect('binaural')}
                className={`flex items-center justify-between p-3.5 rounded-[10px] border transition-all cursor-pointer ${
                  activeEffects?.binaural?.enabled
                    ? 'bg-[#1b1b1f] border-[#00f0ff] text-[#FAF8F5]'
                    : 'bg-[#0d0e11] border-[#2b2f33] text-[#8f918c] hover:border-[#cfc6b0]/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Radio className="w-4 h-4 text-[#cfc6b0]" />
                  <div className="flex flex-col">
                    <span className="text-xs text-[#FAF8F5]">Tube Saturation</span>
                    <span className="text-[9px] text-[#8f918c] tracking-wider uppercase">Class-A Triode Stage</span>
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-[3px] border ${
                  activeEffects?.binaural?.enabled ? 'bg-[#00f0ff] border-[#00f0ff]' : 'border-[#2b2f33]'
                }`} />
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default React.memo(AcousticRoom);


