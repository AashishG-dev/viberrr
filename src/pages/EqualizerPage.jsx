import React from 'react';
import { Sliders, RotateCcw, Zap, Volume2, ShieldCheck, Activity } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { EQ_FREQUENCIES, EQ_PRESETS } from '../hooks/useStudioEqualizer';
import SiteFooter from '../components/SiteFooter';

export default function EqualizerPage() {
  const {
    eqPreset,
    eqBandGains,
    eqPreampGain,
    isEqEnabled,
    handleSelectEqPreset,
    handleSetBandGain,
    handleSetPreampGain,
    handleResetEq,
    currentStation,
    showToast
  } = useAudio();

  const getFreqLabel = (freq) => {
    return freq >= 1000 ? `${freq / 1000}k` : `${freq}`;
  };

  const onReset = () => {
    handleResetEq();
    if (showToast) {
      showToast('Equalizer Reset to 0.0dB Flat');
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#121316] text-[#e3e2e6] pt-24 pb-36 px-4 sm:px-8 flex flex-col items-center">
      <div className="w-full max-w-[1440px] 2xl:max-w-[1720px] mx-auto flex flex-col">

        {/* Console Header */}
        <header className="mb-10 pb-8 border-b border-[#343538]/50">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1b1b1f] border border-[#343538]/60 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#cfc6b0] tape-pulse" />
            <span className="font-label-telemetry uppercase text-[#cfc6b0] tracking-widest text-[10px]">
              DSP CONVOLUTION ENGINE // 10-BAND PARAMETRIC MASTERING
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-headline-lg text-3xl sm:text-5xl font-serif text-[#FAF8F5] tracking-tight">
                Studio Equalizer & DSP
              </h1>
              <p className="font-body-md text-[#c5c7c1] text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
                Hardware-grade tone shaping via high-precision Web Audio BiquadFilterNodes. Sculpt deep sub-bass resonance, midrange vocal warmth, and high-frequency silk.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={onReset}
                className="px-4 py-2 rounded-full bg-[#1b1b1f] hover:bg-[#292a2d] text-[#FAF8F5] border border-[#343538]/70 font-label-pill text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#cfc6b0]" />
                <span>Reset Flat (0dB)</span>
              </button>
            </div>
          </div>
        </header>

        {/* Acoustic Preset Strip */}
        <section className="mb-8 p-6 rounded-2xl bg-[#1b1b1f] border border-[#343538]/50 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="font-label-telemetry uppercase text-xs text-[#cfc6b0] tracking-wider font-mono">
              ACOUSTIC MASTER PRESETS
            </span>
            <span className="text-[10px] font-mono text-[#8f918c]">
              REAL-TIME BIQUAD CALIBRATION
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            {Object.entries(EQ_PRESETS).map(([key, p]) => {
              const isActive = eqPreset === key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    handleSelectEqPreset(key);
                    if (showToast) showToast(`Preset Loaded: ${p.name}`);
                  }}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#FAF8F5] text-[#121316] font-bold border-[#FAF8F5] shadow-sm'
                      : 'bg-[#121316] hover:bg-[#292a2d] text-[#c5c7c1] hover:text-[#FAF8F5] border-[#343538]/60'
                  }`}
                >
                  <div className="text-xs font-mono truncate">{p.name}</div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 10-Band Vertical Faders Console */}
        <section className="p-6 sm:p-10 rounded-2xl bg-[#1b1b1f] border border-[#343538]/50 shadow-sm">
          <div className="flex items-center justify-between pb-6 mb-8 border-b border-[#343538]/40">
            <div className="flex items-center gap-3 text-xs font-mono text-[#8f918c]">
              <span>+12 dB BOOST</span>
              <span>•</span>
              <span>0 dB FLAT</span>
              <span>•</span>
              <span>-12 dB CUT</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#0d0e11] border border-[#343538]/60">
              <span className="w-1.5 h-1.5 rounded-full bg-[#cfc6b0] tape-pulse" />
              <span className="text-[10px] font-mono text-[#cfc6b0] uppercase">
                24-BIT / 96kHz HARDWARE DSP ACTIVE
              </span>
            </div>
          </div>

          {/* Vertical Sliders Grid */}
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-3 sm:gap-6 items-end justify-items-center h-64 sm:h-72">
            {EQ_FREQUENCIES.map((freq, idx) => {
              const gain = eqBandGains[idx] || 0;
              return (
                <div key={freq} className="flex flex-col items-center gap-3 h-full justify-between w-full">
                  {/* dB Value Badge */}
                  <span
                    className={`text-[11px] font-mono font-bold ${
                      gain > 0
                        ? 'text-[#cfc6b0]'
                        : gain < 0
                        ? 'text-[#e57373]'
                        : 'text-[#8f918c]'
                    }`}
                  >
                    {gain > 0 ? `+${gain}` : gain}dB
                  </span>

                  {/* Vertical Slider */}
                  <div className="relative flex items-center justify-center flex-1 w-8">
                    <input
                      type="range"
                      min="-12"
                      max="12"
                      step="1"
                      value={gain}
                      onChange={(e) => handleSetBandGain(idx, parseFloat(e.target.value))}
                      className="w-44 h-2 bg-[#0d0e11] rounded-lg appearance-none cursor-pointer -rotate-90 origin-center accent-[#cfc6b0]"
                      aria-label={`Frequency ${freq}Hz gain`}
                    />
                  </div>

                  {/* Frequency Label */}
                  <div className="text-center pt-2">
                    <span className="text-xs font-mono font-bold text-[#FAF8F5]">
                      {getFreqLabel(freq)}
                    </span>
                    <span className="block text-[9px] font-mono text-[#8f918c]">Hz</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Site Footer with Watermark */}
        <SiteFooter />

      </div>
    </div>
  );
}
