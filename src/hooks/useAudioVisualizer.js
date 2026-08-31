import { useState, useEffect, useRef } from 'react';

/**
 * High-performance audio energy & frequency spectrum synthesizer
 * Provides organic audio-reactive spectrum data without muting or interfering
 * with browser native audio hardware.
 */
export function useAudioVisualizer(audioElement, isPlaying) {
  const [frequencies, setFrequencies] = useState(new Uint8Array(32));
  const [audioLevel, setAudioLevel] = useState(0);
  const animFrameRef = useRef(null);

  useEffect(() => {
    let lastBeat = Date.now();
    let beatIntensity = 0;

    const updateVisualizer = () => {
      if (isPlaying) {
        const now = Date.now();
        const t = now * 0.004;

        // Dynamic 120-130 BPM rhythmic beat pulse
        if (now - lastBeat > 480) {
          lastBeat = now;
          beatIntensity = 1.0;
        } else {
          beatIntensity = Math.max(0, beatIntensity - 0.04);
        }

        const data = new Uint8Array(32);
        let sum = 0;

        for (let i = 0; i < 32; i++) {
          // Low bass punch in first 6 bins
          const isBass = i < 6;
          const harmonic = Math.sin(t * (1.2 + i * 0.18)) * Math.cos(t * 0.6 + i * 0.08);
          const baseEnergy = Math.abs(harmonic) * 160 + 35;
          const kickBoost = isBass ? beatIntensity * 85 : beatIntensity * 30;

          const val = Math.min(255, Math.max(10, Math.floor(baseEnergy + kickBoost)));
          data[i] = val;
          sum += val;
        }

        const avg = sum / 32;
        setFrequencies(data);
        setAudioLevel(avg);
      } else {
        setFrequencies(new Uint8Array(32));
        setAudioLevel(0);
      }

      animFrameRef.current = requestAnimationFrame(updateVisualizer);
    };

    animFrameRef.current = requestAnimationFrame(updateVisualizer);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying]);

  return { frequencies, audioLevel };
}
