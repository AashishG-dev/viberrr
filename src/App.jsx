import React, { useState, lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { AudioProvider, useAudio } from './context/AudioContext';
import TopHeader from './components/TopHeader';
import PlayerBar from './components/PlayerBar';
import FloatingMiniPlayer from './components/FloatingMiniPlayer';
import PlaylistModal from './components/PlaylistModal';
import ShortcutsModal from './components/ShortcutsModal';
import SupporterModal from './components/SupporterModal';
import AudioSourceModal from './components/AudioSourceModal';
import AmbientEffectsModal from './components/AmbientEffectsModal';
import AtmosphericOverlay from './components/AtmosphericOverlay';
import AdBanner from './components/AdBanner';
import OnboardingModal from './components/OnboardingModal';
import GlobalSearchModal from './components/GlobalSearchModal';
import PluginsModal from './components/PluginsModal';
import RightQueueSidebar from './components/RightQueueSidebar';
import Toast from './components/Toast';
import { ShieldAlert, Loader2 } from 'lucide-react';

// Code-split multi-page routes for peak performance
const HomePage = lazy(() => import('./pages/HomePage'));
const ExplorePage = lazy(() => import('./pages/ExplorePage'));
const PluginsPage = lazy(() => import('./pages/PluginsPage'));
const LibraryPage = lazy(() => import('./pages/LibraryPage'));
const EqualizerPage = lazy(() => import('./pages/EqualizerPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));

function AppContent() {
  const [isQueueSidebarOpen, setIsQueueSidebarOpen] = useState(false);
  const {
    currentStation,
    currentAudioSource,
    audioQuality,
    setAudioQuality,
    isPlaylistOpen,
    setIsPlaylistOpen,
    isShortcutsOpen,
    setIsShortcutsOpen,
    isSupportOpen,
    setIsSupportOpen,
    isAudioSourceOpen,
    setIsAudioSourceOpen,
    isAmbientOpen,
    setIsAmbientOpen,
    isGlobalSearchOpen,
    setIsGlobalSearchOpen,
    isPluginsOpen,
    setIsPluginsOpen,
    isOnboardingOpen,
    setIsOnboardingOpen,
    isRainVisualEnabled,
    setIsRainVisualEnabled,
    isFullscreen,
    isMinimalMode,
    pipContainer,
    setPipContainer,
    activeEffects,
    toggleEffect,
    setEffectVolume,
    isAdVisible,
    adCycleId,
    dismissAd,
    toastMsg,
    isToastVisible,
    showToast,
    isPipActive,
    handleOpenPip,
    closePip,
    currentTrack,
    currentTrackIndex,
    tracks,
    isPlaying,
    currentTime,
    duration,
    buffered,
    volume,
    isMuted,
    isShuffled,
    isLoading,
    togglePlay,
    handleNextTrack,
    handlePrevTrack,
    selectTrack,
    seek,
    changeVolume,
    toggleMute,
    toggleShuffle,
    playDirectTrack,
    frequencies,
    onlineCount,
    handleSelectStation,
    handleSelectAudioSource,
    handleShareStation,
    handleToggleFullscreen,
    handleToggleMinimalMode
  } = useAudio();

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        if (e.key === 'Escape') {
          e.target.blur();
          setIsPlaylistOpen(false);
          setIsShortcutsOpen(false);
          setIsSupportOpen(false);
          setIsAudioSourceOpen(false);
          setIsGlobalSearchOpen(false);
          setIsPluginsOpen(false);
          setIsQueueSidebarOpen(false);
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen((prev) => !prev);
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case '/':
          e.preventDefault();
          setIsGlobalSearchOpen(true);
          break;
        case 'q':
          e.preventDefault();
          setIsQueueSidebarOpen((prev) => !prev);
          break;
        case 's':
          e.preventDefault();
          toggleShuffle();
          showToast(!isShuffled ? 'Shuffle Enabled' : 'Shuffle Disabled');
          break;
        case 'a':
          e.preventDefault();
          setIsAmbientOpen((prev) => !prev);
          break;
        case 'z':
          e.preventDefault();
          handleToggleMinimalMode();
          break;
        case 'x':
          e.preventDefault();
          handleOpenPip();
          break;
        case 'n':
          e.preventDefault();
          handleNextTrack();
          break;
        case 'p':
          e.preventDefault();
          handlePrevTrack();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          showToast(!isMuted ? 'Audio Muted' : 'Audio Unmuted');
          break;
        case 'f':
          e.preventDefault();
          handleToggleFullscreen();
          break;
        case '?':
          e.preventDefault();
          setIsShortcutsOpen(true);
          break;
        case 'escape':
          setIsPlaylistOpen(false);
          setIsShortcutsOpen(false);
          setIsSupportOpen(false);
          setIsAudioSourceOpen(false);
          setIsAmbientOpen(false);
          setIsGlobalSearchOpen(false);
          setIsPluginsOpen(false);
          setIsQueueSidebarOpen(false);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    togglePlay,
    toggleShuffle,
    isShuffled,
    handleToggleMinimalMode,
    handleOpenPip,
    handleNextTrack,
    handlePrevTrack,
    toggleMute,
    isMuted,
    handleToggleFullscreen,
    showToast
  ]);

  return (
    <main
      className={`w-screen h-screen overflow-hidden flex flex-col justify-between relative bg-black select-none ${
        isFullscreen ? 'cursor-none' : ''
      }`}
      role="application"
      aria-label="Viberr Lossless Live Radio & Streaming Platform"
    >
      {/* Visual Effects & Weather Layer */}
      <AtmosphericOverlay
        activeEffects={activeEffects}
        isRainVisualEnabled={isRainVisualEnabled}
      />

      {/* Top Header Navigation */}
      {!isMinimalMode && (
        <TopHeader
          currentStation={currentStation}
          onSelectStation={handleSelectStation}
          volume={volume}
          isMuted={isMuted}
          onChangeVolume={changeVolume}
          onToggleMute={toggleMute}
          isFullscreen={isFullscreen}
          onToggleFullscreen={handleToggleFullscreen}
          onOpenSupport={() => setIsSupportOpen(true)}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
          onOpenAudioSource={() => setIsAudioSourceOpen(true)}
          onOpenAmbientFx={() => setIsAmbientOpen(true)}
          onOpenGlobalSearch={() => setIsGlobalSearchOpen(true)}
          onShareStation={handleShareStation}
          currentAudioSource={currentAudioSource}
          onlineCount={onlineCount}
        />
      )}

      {/* Multi-Page Routes with Suspense Fallback */}
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center text-white/50 text-xs font-mono">
            <Loader2 className="w-5 h-5 animate-spin text-cyan-400 mr-2" />
            <span>[ LOADING VIBERR EXPERIENCE... ]</span>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/plugins" element={<PluginsPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/equalizer" element={<EqualizerPage />} />
          <Route path="/about" element={<AboutPage />} />
          {/* Fallback to Home */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </Suspense>

      {/* Floating Bottom Player Bar */}
      <PlayerBar
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        isLoading={isLoading}
        currentTime={currentTime}
        duration={duration}
        buffered={buffered}
        isShuffled={isShuffled}
        onTogglePlay={togglePlay}
        onNextTrack={handleNextTrack}
        onPrevTrack={handlePrevTrack}
        onToggleShuffle={toggleShuffle}
        onSeek={seek}
        onOpenPlaylist={() => setIsPlaylistOpen(true)}
        onOpenAudioSource={() => setIsAudioSourceOpen(true)}
        onOpenAmbientFx={() => setIsAmbientOpen(true)}
        onShareStation={handleShareStation}
        currentAudioSource={currentAudioSource}
        frequencies={frequencies}
        isMinimalMode={isMinimalMode}
        onToggleMinimalMode={handleToggleMinimalMode}
        onOpenFloatingMiniPlayer={handleOpenPip}
        isPipActive={isPipActive}
      />

      {/* Monetization Adsterra Sponsor Banner */}
      {!isFullscreen && !isMinimalMode && (
        <AdBanner
          isVisible={isAdVisible}
          onClose={dismissAd}
          cycleId={adCycleId}
        />
      )}

      {/* Modals & Dialogs */}
      <PlaylistModal
        isOpen={isPlaylistOpen}
        onClose={() => setIsPlaylistOpen(false)}
        station={currentStation}
        tracks={tracks}
        currentTrack={currentTrack}
        currentTrackIndex={currentTrackIndex}
        isPlaying={isPlaying}
        onSelectTrack={selectTrack}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <SupporterModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />

      <AudioSourceModal
        isOpen={isAudioSourceOpen}
        onClose={() => setIsAudioSourceOpen(false)}
        currentSourceId={currentAudioSource.id}
        onSelectSource={handleSelectAudioSource}
        currentQuality={audioQuality}
        onChangeQuality={(q) => {
          setAudioQuality(q);
          showToast(`Bitrate set to ${q.toUpperCase()}`);
        }}
      />

      <AmbientEffectsModal
        isOpen={isAmbientOpen}
        onClose={() => setIsAmbientOpen(false)}
        activeEffects={activeEffects}
        onToggleEffect={toggleEffect}
        onSetEffectVolume={setEffectVolume}
        isRainVisualEnabled={isRainVisualEnabled}
        onToggleRainVisual={() => setIsRainVisualEnabled((prev) => !prev)}
      />

      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        onPlayTrack={(track) => {
          playDirectTrack(track);
          showToast(`Now Playing: ${track.title}`);
        }}
        onSelectStation={handleSelectStation}
      />

      <PluginsModal
        isOpen={isPluginsOpen}
        onClose={() => setIsPluginsOpen(false)}
      />

      {/* Right Side Queue & Playlist Slide-out Drawer */}
      <RightQueueSidebar
        isOpen={isQueueSidebarOpen}
        onToggle={() => setIsQueueSidebarOpen((prev) => !prev)}
        onClose={() => setIsQueueSidebarOpen(false)}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onStartPlayback={() => {
          if (!isPlaying) togglePlay();
        }}
      />

      {/* Bottom Corner 18+ & Sponsored Ads Notice Badge */}
      {!isFullscreen && !isMinimalMode && (
        <button
          onClick={() => setIsOnboardingOpen(true)}
          className="fixed bottom-3 left-3 z-30 pointer-events-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-md border border-white/10 hover:border-amber-400/40 text-[10px] font-mono text-white/50 hover:text-white transition-all cursor-pointer shadow-lg group"
          title="18+ Disclaimer & Sponsored Content Notice"
          aria-label="18+ & Sponsored Ads Disclaimer"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
          <span className="tracking-tight">18+ / Sponsored Ads</span>
        </button>
      )}

      {/* Action Toast Feedback */}
      <Toast
        message={toastMsg}
        isVisible={isToastVisible}
      />
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AudioProvider>
        <AppContent />
      </AudioProvider>
    </BrowserRouter>
  );
}
