import { useState, useEffect, useRef, useCallback } from 'react';

export const EQ_FREQUENCIES = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

export const EQ_PRESETS = {
  auto: {
    name: 'Auto Genre Sync',
    desc: 'Automatically tunes EQ curves to match the current station & mood',
    gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  flat: {
    name: 'Flat / Studio Reference',
    desc: 'Zero coloration, pure original master sound',
    gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  bassBoost: {
    name: '808 Bass & Sub Punch',
    desc: 'Heavy sub-bass boost for Phonk, Trap & Desi Hip-Hop',
    gains: [8, 7, 5, 2, 0, 0, 1, 2, 3, 2]
  },
  lofiWarmth: {
    name: 'Lo-Fi Warmth & Vinyl',
    desc: 'Rolled-off ultra-highs with boosted warm low-mids',
    gains: [4, 5, 6, 3, 1, -1, -2, -4, -6, -8]
  },
  vocalCrisp: {
    name: 'Vocal Clarity & Presence',
    desc: 'Enhanced mid-range vocals for Bollywood, Indie & Pop',
    gains: [-2, -1, 0, 1, 3, 5, 5, 4, 2, 1]
  },
  synthwave: {
    name: 'Cyberpunk & Synthwave',
    desc: 'Punchy kick drum and sparkling neon highs',
    gains: [6, 5, 2, -1, 0, 2, 3, 5, 6, 5]
  },
  clubEdm: {
    name: 'Club & Festival Punch',
    desc: 'Smiley curve with explosive bass and crisp top end',
    gains: [7, 6, 3, 0, -2, 1, 3, 5, 7, 6]
  },
  deepFocus: {
    name: 'Deep Focus & Study',
    desc: 'Fatigue-free listening with smooth mellow frequencies',
    gains: [2, 3, 3, 1, 0, -1, -2, -2, -3, -4]
  }
};

/**
 * Returns optimal EQ curve according to station genre / id
 */
export function getAutoEqForStation(stationId = '') {
  const id = (stationId || '').toLowerCase();
  if (id.includes('phonk') || id.includes('trap') || id.includes('dhh') || id.includes('hip-hop') || id.includes('drill')) {
    return EQ_PRESETS.bassBoost.gains;
  }
  if (id.includes('lofi') || id.includes('lo-fi') || id.includes('sleep') || id.includes('ambient') || id.includes('calm')) {
    return EQ_PRESETS.lofiWarmth.gains;
  }
  if (id.includes('bollywood') || id.includes('indie') || id.includes('pop') || id.includes('romantic') || id.includes('acoustic') || id.includes('dil')) {
    return EQ_PRESETS.vocalCrisp.gains;
  }
  if (id.includes('synth') || id.includes('cyber') || id.includes('vapor') || id.includes('nightride')) {
    return EQ_PRESETS.synthwave.gains;
  }
  return EQ_PRESETS.flat.gains;
}

export function useStudioEqualizer(audioElement, currentStation) {
  const [selectedPreset, setSelectedPreset] = useState('auto');
  const [bandGains, setBandGains] = useState(() => getAutoEqForStation(currentStation?.id));
  const [preampGain, setPreampGain] = useState(0); // in dB (-6 to +6)
  const [isEqEnabled, setIsEqEnabled] = useState(true);

  // Auto-tune preset whenever current station changes if in 'auto' mode
  useEffect(() => {
    if (selectedPreset === 'auto') {
      const newGains = getAutoEqForStation(currentStation?.id);
      setBandGains(newGains);
    }
  }, [currentStation?.id, selectedPreset]);

  // Change Preset Mode
  const selectPreset = useCallback((presetKey) => {
    setSelectedPreset(presetKey);
    let targetGains;
    if (presetKey === 'auto') {
      targetGains = getAutoEqForStation(currentStation?.id);
    } else if (EQ_PRESETS[presetKey]) {
      targetGains = [...EQ_PRESETS[presetKey].gains];
    } else {
      return;
    }
    setBandGains(targetGains);
  }, [currentStation?.id]);

  // Manual Band Slider Adjustment
  const setBandGain = useCallback((bandIndex, value) => {
    setSelectedPreset('manual');
    setBandGains((prev) => {
      const updated = [...prev];
      updated[bandIndex] = value;
      return updated;
    });
  }, []);

  // Preamp Volume adjustment
  const handleSetPreamp = useCallback((db) => {
    setPreampGain(db);
  }, []);

  // Toggle EQ On/Off
  const toggleEq = useCallback(() => {
    setIsEqEnabled((prev) => !prev);
  }, []);

  return {
    selectedPreset,
    bandGains,
    preampGain,
    isEqEnabled,
    selectPreset,
    setBandGain,
    setPreampGain: handleSetPreamp,
    toggleEq,
    frequencies: EQ_FREQUENCIES
  };
}
