import React from 'react';
import { useAudio } from '../context/AudioContext';
import BackgroundStage from '../components/BackgroundStage';
import StationHero from '../components/StationHero';

export default function HomePage() {
  const {
    currentStation,
    currentTrack,
    isPlaying,
    frequencies,
    audioLevel,
    isFullscreen,
    isMinimalMode
  } = useAudio();

  return (
    <BackgroundStage
      station={currentStation}
      currentTrack={currentTrack}
      isFullscreen={isFullscreen}
      isPlaying={isPlaying}
      frequencies={frequencies}
      audioLevel={audioLevel}
    >
      {/* Center Station Hero Graphics & Luxury Syne Typography */}
      {!isMinimalMode && (
        <StationHero
          station={currentStation}
          isPlaying={isPlaying}
        />
      )}

      {/* Minimal Mode spacer when hero is hidden */}
      {isMinimalMode && <div className="flex-1" />}
    </BackgroundStage>
  );
}
