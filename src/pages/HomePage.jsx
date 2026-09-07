import React from 'react';
import { useAudio } from '../context/AudioContext';
import MasterListeningDeck from '../components/MasterListeningDeck';
import SongTrendsSection from '../components/SongTrendsSection';
import AcousticRoom from '../components/AcousticRoom';
import ManifestoSection from '../components/ManifestoSection';
import TactileShortcutsBar from '../components/TactileShortcutsBar';
import SiteFooter from '../components/SiteFooter';
import ParticleCloudCanvas from '../components/ParticleCloudCanvas';

export default function HomePage() {
  const {
    currentStation,
    currentTrack,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    buffered,
    volume,
    isMuted,
    onlineCount,
    togglePlay,
    handleNextTrack,
    handlePrevTrack,
    seek,
    changeVolume,
    toggleMute,
    handleSelectStation,
    setIsAudioSourceOpen,
    setIsGlobalSearchOpen,
    setIsShortcutsOpen,
    eqBandGains,
    handleSetBandGain,
    handleResetEq,
    activeEffects,
    toggleEffect,
    playDirectTrack,
    showToast
  } = useAudio();

  return (
    <div className="w-full min-h-screen bg-[#0d0e11] text-[#FAF8F5] pt-18 pb-28 relative overflow-hidden">
      {/* Atlantic.vc Signature Wave Particle Cloud Background */}
      <ParticleCloudCanvas isPlaying={isPlaying} />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 flex flex-col w-full relative z-10">
        
        {/* Section 1: Master Listening Deck */}
        <MasterListeningDeck
          currentStation={currentStation}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          isLoading={isLoading}
          currentTime={currentTime}
          duration={duration}
          buffered={buffered}
          volume={volume}
          isMuted={isMuted}
          onlineCount={onlineCount}
          onTogglePlay={togglePlay}
          onNextTrack={handleNextTrack}
          onPrevTrack={handlePrevTrack}
          onSeek={seek}
          onChangeVolume={changeVolume}
          onToggleMute={toggleMute}
          onOpenAudioSource={() => setIsAudioSourceOpen(true)}
        />

        {/* Sections 2 & 3: Acoustic Repertory & Global Frequencies */}
        <SongTrendsSection
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onPlayTrack={playDirectTrack}
          onSelectStation={handleSelectStation}
          showToast={showToast}
        />

        {/* Section 4: The Acoustic Room (Physical DSP & Texture Layering) */}
        <AcousticRoom
          bandGains={eqBandGains}
          onSetBandGain={handleSetBandGain}
          onResetEq={handleResetEq}
          activeEffects={activeEffects}
          onToggleEffect={toggleEffect}
        />

        {/* Section 5: The Anti-Algorithm Manifesto */}
        <ManifestoSection />

        {/* Tactile Keyboard Navigation Shortcuts Bar */}
        <TactileShortcutsBar
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
        />

        {/* Editorial Footer with Watermark */}
        <SiteFooter />

      </div>
    </div>
  );
}
