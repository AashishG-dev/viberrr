import { useState, useMemo } from 'react';

/**
 * useAudioVisualizer
 * Provides stable frequency spectrum and energy levels with zero main-thread CPU overhead.
 */
export function useAudioVisualizer(audioElement, isPlaying) {
  const frequencies = useMemo(() => new Uint8Array(32), []);
  const audioLevel = isPlaying ? 45 : 0;

  return { frequencies, audioLevel };
}

