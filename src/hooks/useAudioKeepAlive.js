import { useEffect, useRef } from 'react';

/**
 * useAudioKeepAlive
 * Maintains an uninterrupted low-power Web Audio API anchor while playback is active.
 * 
 * Why this is needed on Android:
 * When an HTML5 <audio> tag changes songs or buffers, audio hardware output drops to 0.
 * In Android Doze Mode (screen off), the OS revokes Chrome's wake lock and puts the
 * CPU/renderer to sleep immediately.
 * 
 * By maintaining a microscopic sub-audible gain loop in the Web Audio context while `isPlaying`
 * is true, Android Chromium keeps its internal audio wake lock engaged, allowing gapless track
 * transitions and preventing the browser tab from dying in the background.
 */
export function useAudioKeepAlive(isPlaying) {
  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);
  const oscRef = useRef(null);

  useEffect(() => {
    // Only initialize in browser environment
    if (typeof window === 'undefined') return;

    if (isPlaying) {
      try {
        if (!audioCtxRef.current) {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (!AudioContextClass) return;
          audioCtxRef.current = new AudioContextClass();
        }

        const ctx = audioCtxRef.current;

        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }

        if (!oscRef.current && ctx.state !== 'closed') {
          // Micro-oscillator at 1Hz with gain 0.00001 (completely inaudible, zero battery impact)
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(1, ctx.currentTime);
          gain.gain.setValueAtTime(0.00001, ctx.currentTime);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();

          oscRef.current = osc;
          gainNodeRef.current = gain;
        }
      } catch (e) {
        // Silently handle if Web Audio is restricted by browser policy
      }
    } else {
      // Suspend context when user explicitly pauses to conserve power
      if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
        audioCtxRef.current.suspend().catch(() => {});
      }
    }

    return () => {
      // Cleanup on unmount
      if (oscRef.current) {
        try {
          oscRef.current.stop();
          oscRef.current.disconnect();
        } catch (e) {}
        oscRef.current = null;
      }
    };
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        try {
          audioCtxRef.current.close();
        } catch (e) {}
        audioCtxRef.current = null;
      }
    };
  }, []);
}
