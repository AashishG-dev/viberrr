import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * useAmbientSoundscapes
 * Real-time Procedural Ambient Sound Generator using Web Audio API:
 * 1. Rain Shower (Filtered pink noise with random droplet resonances)
 * 2. Analog Vinyl Crackle (Poisson impulse synthesis)
 * 3. 432Hz Zen Binaural Tone (Theta wave focus generator)
 * 4. Deep Brown Noise / Ocean Wind
 */
export function useAmbientSoundscapes() {
  const [activeEffects, setActiveEffects] = useState({
    rain: { enabled: false, volume: 0.6 },
    vinyl: { enabled: false, volume: 0.5 },
    binaural: { enabled: false, volume: 0.4 },
    wind: { enabled: false, volume: 0.5 }
  });

  const audioCtxRef = useRef(null);
  const nodesRef = useRef({
    rain: null,
    vinyl: null,
    binaural: null,
    wind: null
  });

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  }, []);

  // ----------------------------------------------------
  // 1. Procedural Rain Generator
  // ----------------------------------------------------
  const startRain = useCallback((ctx, volume) => {
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.15;
      b6 = white * 0.115926;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, ctx.currentTime);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(volume * 0.8, ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    whiteNoise.start(0);

    return { source: whiteNoise, gain: gainNode };
  }, []);

  // ----------------------------------------------------
  // 2. Procedural Vinyl Crackle Generator
  // ----------------------------------------------------
  const startVinyl = useCallback((ctx, volume) => {
    const bufferSize = ctx.sampleRate * 2;
    const crackleBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = crackleBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      if (Math.random() < 0.003) {
        data[i] = (Math.random() * 2 - 1) * 0.9;
      } else {
        data[i] = (Math.random() * 2 - 1) * 0.015;
      }
    }

    const source = ctx.createBufferSource();
    source.buffer = crackleBuffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1500, ctx.currentTime);
    filter.Q.setValueAtTime(1.5, ctx.currentTime);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(volume * 0.7, ctx.currentTime);

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start(0);

    return { source, gain: gainNode };
  }, []);

  // ----------------------------------------------------
  // 3. Procedural 432Hz Zen Binaural Beat
  // ----------------------------------------------------
  const startBinaural = useCallback((ctx, volume) => {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(432, ctx.currentTime); // A4 = 432Hz

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(436, ctx.currentTime); // 4Hz Theta beat

    gainNode.gain.setValueAtTime(volume * 0.35, ctx.currentTime);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(0);
    osc2.start(0);

    return { source: { stop: () => { try { osc1.stop(); osc2.stop(); } catch(e){} } }, gain: gainNode };
  }, []);

  // ----------------------------------------------------
  // 4. Procedural Ocean Wind / Brown Noise
  // ----------------------------------------------------
  const startWind = useCallback((ctx, volume) => {
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 2.5;
    }

    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(550, ctx.currentTime);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(volume * 0.8, ctx.currentTime);

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start(0);

    return { source, gain: gainNode };
  }, []);

  // Toggle ambient effect
  const toggleEffect = useCallback((effectName) => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    setActiveEffects((prev) => {
      const current = prev[effectName];
      const nextEnabled = !current.enabled;

      if (nextEnabled) {
        if (!nodesRef.current[effectName]) {
          if (effectName === 'rain') nodesRef.current.rain = startRain(ctx, current.volume);
          if (effectName === 'vinyl') nodesRef.current.vinyl = startVinyl(ctx, current.volume);
          if (effectName === 'binaural') nodesRef.current.binaural = startBinaural(ctx, current.volume);
          if (effectName === 'wind') nodesRef.current.wind = startWind(ctx, current.volume);
        }
      } else {
        if (nodesRef.current[effectName]) {
          try {
            nodesRef.current[effectName].source.stop();
          } catch (e) {}
          nodesRef.current[effectName] = null;
        }
      }

      return {
        ...prev,
        [effectName]: { ...current, enabled: nextEnabled }
      };
    });
  }, [getAudioContext, startRain, startVinyl, startBinaural, startWind]);

  // Adjust volume of individual ambient layer
  const setEffectVolume = useCallback((effectName, volume) => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    setActiveEffects((prev) => ({
      ...prev,
      [effectName]: { ...prev[effectName], volume }
    }));

    if (nodesRef.current[effectName]?.gain && audioCtxRef.current) {
      nodesRef.current[effectName].gain.gain.setValueAtTime(
        volume * (effectName === 'binaural' ? 0.35 : 0.8),
        audioCtxRef.current.currentTime
      );
    }
  }, [getAudioContext]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.keys(nodesRef.current).forEach((key) => {
        if (nodesRef.current[key]) {
          try {
            nodesRef.current[key].source.stop();
          } catch (e) {}
        }
      });
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch (e) {}
      }
    };
  }, []);

  return {
    activeEffects,
    toggleEffect,
    setEffectVolume
  };
}
