import React from 'react';
import { motion } from 'framer-motion';
import { Sliders, RotateCcw, Sparkles, Zap, Volume2, Music } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { EQ_FREQUENCIES, EQ_PRESETS } from '../hooks/useStudioEqualizer';

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
    frequencies
  } = useAudio();

  const getFreqLabel = (freq) => {
    return freq >= 1000 ? `${freq / 1000}k` : `${freq}`;
  };

  return (
    <div className="w-full flex-1 overflow-y-auto px-3 sm:px-8 py-6 pb-28 custom-scroll max-w-[1720px] mx-auto text-white">
      {/* Header */}
      <div className="relative rounded-3xl p-6 sm:p-10 mb-8 overflow-hidden glass-panel-neon border border-white/20 bg-gradient-to-r from-teal-950/60 via-cyan-950/40 to-black/80 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/40 text-teal-300 text-xs font-mono mb-3">
            <Sliders className="w-3.5 h-3.5" />
            <span>10-BAND PARAMETRIC MASTERING CONSOLE</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black font-syne text-white tracking-tight leading-tight">
            Pro Audio Equalizer
          </h2>
          <p className="text-xs sm:text-sm text-white/60 font-space mt-2 leading-relaxed">
            Fine-tune low bass frequencies, vocal punch, stereo acoustics, and treble clarity with lossless DSP filtering.
          </p>
        </div>
      </div>

      {/* Preset Selector */}
      <div className="rounded-3xl p-5 sm:p-7 border border-white/10 bg-white/[0.03] mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white/70">
            Acoustic Master Presets
          </h3>
          <button
            onClick={handleResetEq}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-mono transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Flat</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {Object.entries(EQ_PRESETS).map(([key, p]) => (
            <button
              key={key}
              onClick={() => handleSelectEqPreset(key)}
              className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                eqPreset === key
                  ? 'bg-teal-500/30 border-teal-400/70 text-teal-200 shadow-lg font-bold'
                  : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <div className="text-xs font-syne font-bold truncate">{p.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 10-Band Sliders Console */}
      <div className="rounded-3xl p-6 sm:p-10 border border-white/10 bg-white/[0.03] relative overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 text-xs font-mono text-white/50">
            <span>+12 dB</span>
            <span>•</span>
            <span>0 dB (FLAT)</span>
            <span>•</span>
            <span>-12 dB</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-teal-400">
            <Zap className="w-3.5 h-3.5" />
            <span>Biquad DSP Active</span>
          </div>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-10 gap-4 sm:gap-6 items-end justify-items-center h-64 sm:h-72">
          {EQ_FREQUENCIES.map((freq, idx) => {
            const gain = eqBandGains[idx] || 0;
            return (
              <div key={freq} className="flex flex-col items-center gap-3 h-full justify-between w-full">
                {/* dB Value Badge */}
                <span className={`text-[11px] font-mono font-bold ${gain > 0 ? 'text-teal-300' : gain < 0 ? 'text-red-300' : 'text-white/40'}`}>
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
                    className="w-44 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer -rotate-90 origin-center accent-teal-400"
                    aria-label={`Frequency ${freq}Hz gain`}
                  />
                </div>

                {/* Frequency Label */}
                <div className="text-center">
                  <span className="text-xs font-mono font-bold text-white/80">
                    {getFreqLabel(freq)}
                  </span>
                  <span className="block text-[9px] font-mono text-white/40">Hz</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
