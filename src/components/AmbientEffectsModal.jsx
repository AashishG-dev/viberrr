import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, CloudRain, Disc, Radio, Wind, Sparkles, Sliders, Eye,
  Activity, Zap, Volume2, Power, RotateCcw, Flame
} from 'lucide-react';
import { EQ_FREQUENCIES, EQ_PRESETS } from '../hooks/useStudioEqualizer';

export default function AmbientEffectsModal({
  isOpen,
  onClose,
  activeEffects,
  onToggleEffect,
  onSetEffectVolume,
  isRainVisualEnabled,
  onToggleRainVisual,
  isFilmGrainEnabled,
  onToggleFilmGrain,
  // Studio Equalizer Props
  selectedPreset = 'auto',
  bandGains = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  preampGain = 0,
  isEqEnabled = true,
  onSelectPreset,
  onSetBandGain,
  onSetPreampGain,
  onToggleEq,
  currentStation
}) {
  const [activeTab, setActiveTab] = useState('eq'); // 'eq' | 'ambient' | 'visual'

  if (!isOpen) return null;

  const audioFxList = [
    {
      id: 'rain',
      name: 'Rain Shower',
      desc: 'Gentle soothing rainfall and window resonance',
      icon: CloudRain
    },
    {
      id: 'vinyl',
      name: 'Vinyl Crackle',
      desc: 'Warm analog turntable crackle & needle noise',
      icon: Disc
    },
    {
      id: 'binaural',
      name: '432Hz Zen Tone',
      desc: 'Binaural theta wave focus beat for deep study',
      icon: Radio
    },
    {
      id: 'wind',
      name: 'Ocean Wind',
      desc: 'Low-frequency brown noise & cosmic airflow',
      icon: Wind
    }
  ];

  const formatFreqLabel = (freq) => {
    return freq >= 1000 ? `${freq / 1000}k` : `${freq}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-2xl pointer-events-auto transition-all"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-2xl rounded-3xl glass-panel border border-white/20 shadow-2xl p-4 sm:p-6 overflow-hidden flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-inner">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold font-syne text-white tracking-tight">
                  Pro Studio Equalizer & Audio FX
                </h3>
                <p className="text-[11px] font-mono text-white/50">
                  [ 10-BAND PARAMETRIC DSP + AUTO GENRE SYNC + AMBIENT RACK ]
                </p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="glass-button p-2 rounded-full text-white/70 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Navigation Tab Bar */}
          <div className="flex items-center gap-2 mt-3 mb-3 p-1 bg-white/[0.04] rounded-2xl border border-white/10 flex-shrink-0">
            <button
              onClick={() => setActiveTab('eq')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'eq'
                  ? 'bg-white/20 text-white shadow-md border border-white/30'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>10-BAND EQUALIZER</span>
            </button>

            <button
              onClick={() => setActiveTab('ambient')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'ambient'
                  ? 'bg-white/20 text-white shadow-md border border-white/30'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <CloudRain className="w-3.5 h-3.5" />
              <span>AMBIENT SOUNDSCAPES</span>
            </button>

            <button
              onClick={() => setActiveTab('visual')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'visual'
                  ? 'bg-white/20 text-white shadow-md border border-white/30'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>SHADERS</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto pr-1 custom-scroll space-y-4">
            
            {/* TAB 1: 10-BAND EQUALIZER */}
            {activeTab === 'eq' && (
              <div className="space-y-4">
                
                {/* EQ Controls Header (Power + Auto Station Pill) */}
                <div className="flex items-center justify-between gap-2 flex-wrap bg-white/[0.04] p-3 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onToggleEq}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isEqEnabled 
                          ? 'bg-white text-black shadow-md' 
                          : 'bg-white/10 text-white/50 border border-white/15'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{isEqEnabled ? 'EQ: ACTIVE' : 'EQ: BYPASSED'}</span>
                    </button>

                    {selectedPreset === 'auto' && (
                      <span className="text-[11px] font-mono text-white/80 bg-white/10 px-2.5 py-1 rounded-lg border border-white/15">
                        MATCHED: {currentStation?.name || 'Studio'}
                      </span>
                    )}
                  </div>

                  {/* Preamp Booster */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-white/60">PREAMP:</span>
                    <input
                      type="range"
                      min="-6"
                      max="6"
                      step="0.5"
                      value={preampGain}
                      onChange={(e) => onSetPreampGain && onSetPreampGain(parseFloat(e.target.value))}
                      className="custom-range w-20 sm:w-24"
                    />
                    <span className="text-[11px] font-mono text-white font-bold w-10 text-right">
                      {preampGain > 0 ? `+${preampGain}` : preampGain}dB
                    </span>
                  </div>
                </div>

                {/* EQ Presets Chips */}
                <div>
                  <span className="text-[11px] font-mono text-white/40 tracking-wider uppercase block mb-2">
                    // Intelligent Presets & Tuning Modes
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.keys(EQ_PRESETS).map((key) => {
                      const preset = EQ_PRESETS[key];
                      const isSelected = selectedPreset === key;
                      return (
                        <button
                          key={key}
                          onClick={() => onSelectPreset && onSelectPreset(key)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-white text-black font-bold shadow-lg scale-105 border border-white'
                              : 'bg-white/[0.05] hover:bg-white/10 text-white/70 border border-white/10'
                          }`}
                          title={preset.desc}
                        >
                          {preset.name}
                        </button>
                      );
                    })}

                    {/* Manual Mode indicator */}
                    <button
                      onClick={() => onSelectPreset && onSelectPreset('manual')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                        selectedPreset === 'manual'
                          ? 'bg-white text-black font-bold shadow-lg scale-105 border border-white'
                          : 'bg-white/[0.05] hover:bg-white/10 text-white/70 border border-white/10'
                      }`}
                    >
                      Manual / Custom
                    </button>
                  </div>
                </div>

                {/* 10-Band Graphic Equalizer Faders */}
                <div className="bg-black/40 p-4 rounded-2xl border border-white/15">
                  
                  {/* Frequency Response Visual Curve */}
                  <div className="h-14 w-full mb-3 flex items-end justify-between px-2 relative border-b border-white/10 overflow-hidden">
                    {/* Zero dB reference center line */}
                    <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/20 border-dashed pointer-events-none" />
                    
                    {bandGains.map((gain, i) => {
                      const heightPercent = Math.min(100, Math.max(10, ((gain + 12) / 24) * 100));
                      return (
                        <div
                          key={i}
                          className="w-1.5 sm:w-2 rounded-t-full bg-white/70 transition-all duration-150"
                          style={{ height: `${heightPercent}%` }}
                        />
                      );
                    })}
                  </div>

                  {/* 10 Draggable Fader Columns */}
                  <div className="grid grid-cols-10 gap-1 sm:gap-2">
                    {EQ_FREQUENCIES.map((freq, idx) => {
                      const gain = bandGains[idx] || 0;
                      return (
                        <div key={freq} className="flex flex-col items-center gap-2">
                          <span className="text-[10px] font-mono text-white font-medium">
                            {gain > 0 ? `+${gain}` : gain}
                          </span>

                          <div className="h-28 sm:h-32 flex items-center justify-center relative py-1">
                            <input
                              type="range"
                              min="-12"
                              max="12"
                              step="1"
                              value={gain}
                              onChange={(e) => onSetBandGain && onSetBandGain(idx, parseFloat(e.target.value))}
                              className="custom-range-vertical h-24 sm:h-28 cursor-pointer"
                              style={{
                                transform: 'rotate(-90deg)',
                                width: '100px'
                              }}
                            />
                          </div>

                          <span className="text-[10px] sm:text-[11px] font-mono text-white/50 font-bold">
                            {formatFreqLabel(freq)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: AMBIENT PROCEDURAL SOUNDSCAPES */}
            {activeTab === 'ambient' && (
              <div className="space-y-3">
                <span className="text-[11px] font-mono text-white/40 tracking-wider uppercase block">
                  // Live Procedural Audio Generators (Layer Over Music)
                </span>

                <div className="space-y-2.5">
                  {audioFxList.map((fx) => {
                    const state = activeEffects[fx.id] || { enabled: false, volume: 0.5 };
                    const Icon = fx.icon;

                    return (
                      <div
                        key={fx.id}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          state.enabled
                            ? 'bg-white/15 border-white/40 shadow-lg'
                            : 'bg-white/[0.04] border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              state.enabled ? 'bg-white text-black font-bold' : 'bg-white/10 text-white/60'
                            }`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="truncate">
                              <div className="text-xs sm:text-sm font-bold font-syne text-white truncate">
                                {fx.name}
                              </div>
                              <div className="text-[10px] font-space text-white/50 truncate">
                                {fx.desc}
                              </div>
                            </div>
                          </div>

                          {/* Power Toggle Button */}
                          <button
                            onClick={() => onToggleEffect(fx.id)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex-shrink-0 ${
                              state.enabled
                                ? 'bg-white text-black shadow-md'
                                : 'bg-white/10 hover:bg-white/20 text-white/70 border border-white/15'
                            }`}
                          >
                            {state.enabled ? 'ON' : 'OFF'}
                          </button>
                        </div>

                        {/* Volume Slider (Always accessible when enabled) */}
                        {state.enabled && (
                          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center gap-3">
                            <span className="text-[10px] font-mono text-white/60 min-w-[55px]">
                              VOL: {Math.round(state.volume * 100)}%
                            </span>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.02"
                              value={state.volume}
                              onChange={(e) => onSetEffectVolume(fx.id, parseFloat(e.target.value))}
                              className="custom-range flex-1"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: ATMOSPHERIC SHADERS */}
            {activeTab === 'visual' && (
              <div className="space-y-3">
                <span className="text-[11px] font-mono text-white/40 tracking-wider uppercase block">
                  // Atmospheric Screen & Weather Overlays
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Raindrop Shader Toggle */}
                  <button
                    onClick={onToggleRainVisual}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isRainVisualEnabled
                        ? 'bg-white/15 border-white/40 text-white shadow-lg'
                        : 'bg-white/[0.04] border-white/10 hover:border-white/20 text-white/70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CloudRain className="w-5 h-5 text-white" />
                      <div>
                        <div className="text-sm font-bold font-syne">Rainfall Glass</div>
                        <div className="text-[10px] text-white/50">Live procedural raindrops</div>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                      isRainVisualEnabled ? 'bg-white text-black' : 'bg-white/10 text-white/50'
                    }`}>
                      {isRainVisualEnabled ? 'ACTIVE' : 'OFF'}
                    </span>
                  </button>

                  {/* Film Grain / Scanline Toggle */}
                  <button
                    onClick={onToggleFilmGrain}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isFilmGrainEnabled
                        ? 'bg-white/15 border-white/40 text-white shadow-lg'
                        : 'bg-white/[0.04] border-white/10 hover:border-white/20 text-white/70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Eye className="w-5 h-5 text-white" />
                      <div>
                        <div className="text-sm font-bold font-syne">Analog Film Grain</div>
                        <div className="text-[10px] text-white/50">35mm cinematic texture</div>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                      isFilmGrainEnabled ? 'bg-white text-black' : 'bg-white/10 text-white/50'
                    }`}>
                      {isFilmGrainEnabled ? 'ACTIVE' : 'OFF'}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
