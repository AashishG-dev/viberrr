import React, { useState, useEffect, useCallback, useRef } from 'react';
import { STATIONS, DEFAULT_STATION_ID, getStationById, getStationBySlug } from './data/stationsData';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { useWakeLock } from './hooks/useWakeLock';
import { useRealtimePresence } from './hooks/useRealtimePresence';
import { useAudioVisualizer } from './hooks/useAudioVisualizer';
import { useFloatingMiniPlayer } from './hooks/useFloatingMiniPlayer';
import { useSecurityShield } from './hooks/useSecurityShield';
import { useAmbientSoundscapes } from './hooks/useAmbientSoundscapes';
import { useStudioEqualizer } from './hooks/useStudioEqualizer';
import { useAdManager } from './hooks/useAdManager';
import BackgroundStage from './components/BackgroundStage';
import TopHeader from './components/TopHeader';
import StationHero from './components/StationHero';
import PlayerBar from './components/PlayerBar';
import FloatingMiniPlayer from './components/FloatingMiniPlayer';
import PlaylistModal from './components/PlaylistModal';
import ShortcutsModal from './components/ShortcutsModal';
import SupporterModal from './components/SupporterModal';
import AudioSourceModal, { AUDIO_SOURCES } from './components/AudioSourceModal';
import AmbientEffectsModal from './components/AmbientEffectsModal';
import AtmosphericOverlay from './components/AtmosphericOverlay';
import AdBanner from './components/AdBanner';
import OnboardingModal from './components/OnboardingModal';
import Toast from './components/Toast';
import { copyShareLink } from './utils/formatters';
import { ShieldAlert } from 'lucide-react';

export default function App() {
  // Read initial station from URL or fallback
  const [currentStation, setCurrentStation] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const stationParam = params.get('station');
    if (stationParam) {
      return getStationBySlug(stationParam);
    }
    const path = window.location.pathname.replace(/^\//, '');
    if (path) {
      return getStationBySlug(path);
    }
    return getStationById(DEFAULT_STATION_ID);
  });

  // Audio Stream Source State
  const [currentAudioSource, setCurrentAudioSource] = useState(AUDIO_SOURCES[0]);
  const [audioQuality, setAudioQuality] = useState('320k');

  // Modal & View States
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isAudioSourceOpen, setIsAudioSourceOpen] = useState(false);
  const [isAmbientOpen, setIsAmbientOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(() => {
    try {
      return localStorage.getItem('viberr_onboarded') !== 'true';
    } catch (e) {
      return false;
    }
  });
  const [isRainVisualEnabled, setIsRainVisualEnabled] = useState(false);
  const [isFilmGrainEnabled, setIsFilmGrainEnabled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMinimalMode, setIsMinimalMode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('mode') === 'mini' || params.get('mode') === 'popup';
  });
  const [pipContainer, setPipContainer] = useState(null);

  // Ambient Procedural Soundscapes Hook
  const { activeEffects, toggleEffect, setEffectVolume } = useAmbientSoundscapes();

  // Dynamic Smart Ad Lifecycle Manager
  const { isAdVisible, adCycleId, dismissAd } = useAdManager();

  // Toast Notification State
  const [toastMsg, setToastMsg] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);
  const toastTimerRef = useRef(null);

  // Floating Mini Player (PiP) Hook
  const { isPipActive, openFloatingMiniPlayer, closePip } = useFloatingMiniPlayer();

  // Audio Playback Hook
  const {
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
    isLiveStream,
    togglePlay,
    handleNextTrack,
    handlePrevTrack,
    selectTrack,
    seek,
    changeVolume,
    toggleMute,
    toggleShuffle,
    setStationTracks,
    setLiveStreamSource,
    audioElement
  } = useAudioPlayer(currentStation.songs || []);

  // Real-time Production Listener Presence Hook
  const { onlineCount, stationListenerCount } = useRealtimePresence(currentStation.id);

  // Real-time Web Audio API Spectrum FFT Visualizer Hook
  const { frequencies, audioLevel } = useAudioVisualizer(audioElement, isPlaying);

  // Pro Studio 10-Band Parametric Equalizer Hook
  const {
    selectedPreset: eqPreset,
    bandGains: eqBandGains,
    preampGain: eqPreampGain,
    isEqEnabled,
    selectPreset: handleSelectEqPreset,
    setBandGain: handleSetBandGain,
    setPreampGain: handleSetPreampGain,
    toggleEq: handleToggleEq
  } = useStudioEqualizer(audioElement, currentStation);

  // Screen WakeLock Hook
  useWakeLock(isPlaying || isFullscreen);

  // Enterprise Anti-Scraping & Anti-Inspection Security Shield
  useSecurityShield();

  const showToast = useCallback((msg) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMsg(msg);
    setIsToastVisible(true);
    toastTimerRef.current = setTimeout(() => {
      setIsToastVisible(false);
    }, 2800);
  }, []);

  const handleToggleMinimalMode = useCallback(() => {
    setIsMinimalMode((prev) => {
      const next = !prev;
      showToast(next ? 'Zen Minimal Mode Active' : 'Full Studio View Restored');
      return next;
    });
  }, [showToast]);

  // Handle Opening Always-On-Top Floating Mini Player (PiP)
  const handleOpenPip = useCallback(async () => {
    if (isPipActive) {
      closePip();
      setPipContainer(null);
      showToast('Floating Player Closed');
      return;
    }

    const root = await openFloatingMiniPlayer({
      currentTrack,
      currentStation,
      isPlaying
    });
    if (root) {
      setPipContainer(root);
      showToast('Always-On-Top Floating Player Active');
    } else {
      showToast('Mini Player Opened');
    }
  }, [isPipActive, closePip, openFloatingMiniPlayer, currentTrack, currentStation, isPlaying, showToast]);

  // Handle station switching
  const handleSelectStation = useCallback((newStation) => {
    setCurrentStation(newStation);
    setCurrentAudioSource(AUDIO_SOURCES[0]);
    setStationTracks(newStation.songs || [], true);
    
    // Update URL without reload
    const newUrl = newStation.slug ? `/?station=${newStation.slug}` : '/';
    window.history.pushState({}, '', newUrl);
    showToast(`Tuned into ${newStation.name}`);
  }, [setStationTracks, showToast]);

  // Handle Audio Source Switching
  const handleSelectAudioSource = useCallback((source) => {
    setCurrentAudioSource(source);
    if (source.id === 'viberr-cdn') {
      setStationTracks(currentStation.songs || [], true);
      showToast('Switched to Viberr Lossless 320k CDN');
    } else {
      setLiveStreamSource(source);
      showToast(`Tuned into ${source.name}`);
    }
  }, [currentStation, setStationTracks, setLiveStreamSource, showToast]);

  // Handle Station Sharing
  const handleShareStation = useCallback(async () => {
    const success = await copyShareLink(currentStation.slug);
    if (success) {
      showToast('Viberr link copied to clipboard');
    }
  }, [currentStation, showToast]);

  // Fullscreen Screensaver Handler
  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {
        setIsFullscreen(true);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        }).catch(() => {
          setIsFullscreen(false);
        });
      }
    }
  }, []);

  // Listen for native fullscreen changes
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        if (e.key === 'Escape') {
          e.target.blur();
          setIsPlaylistOpen(false);
          setIsShortcutsOpen(false);
          setIsSupportOpen(false);
          setIsAudioSourceOpen(false);
        }
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          togglePlay();
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
          setIsShortcutsOpen((prev) => !prev);
          break;
        case 'escape':
          setIsPlaylistOpen(false);
          setIsShortcutsOpen(false);
          setIsSupportOpen(false);
          setIsAudioSourceOpen(false);
          setIsAmbientOpen(false);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, toggleShuffle, handleToggleMinimalMode, handleOpenPip, handleNextTrack, handlePrevTrack, toggleMute, isMuted, isShuffled, handleToggleFullscreen, showToast]);

  return (
    <main
      className="relative w-full h-full min-h-dvh overflow-hidden select-none bg-[#050508]"
      style={{
        '--st-color': currentStation?.color || '#00f0ff',
        '--st-glow': `${currentStation?.color || '#00f0ff'}55`
      }}
    >
      {/* Live Atmospheric Shaders (Rainfall & 35mm Film Grain) */}
      <AtmosphericOverlay
        isRainEnabled={isRainVisualEnabled}
        isFilmGrainEnabled={isFilmGrainEnabled}
        isPlaying={isPlaying}
        audioLevel={audioLevel}
      />

      {/* Non-Intrusive Dismissible Dynamic Adsterra Ad Unit */}
      <AdBanner
        isVisible={isAdVisible && !isMinimalMode && !isFullscreen}
        onDismiss={dismissAd}
        adCycleId={adCycleId}
        adsterraKey={import.meta.env.VITE_ADSTERRA_KEY || ''}
      />

      {/* Dynamic Background Stage with Real FFT Audio Visualizer Canvas */}
      <BackgroundStage
        station={currentStation}
        currentAudioSource={currentAudioSource}
        currentTrack={currentTrack}
        isFullscreen={isFullscreen}
        isPlaying={isPlaying}
        frequencies={frequencies}
        audioLevel={audioLevel}
      >
        {/* Top Header with Real-time Presence Count */}
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
            onShareStation={handleShareStation}
            currentAudioSource={currentAudioSource}
            onlineCount={onlineCount}
          />
        )}

        {/* Center Station Hero Graphics & Luxury Syne Typography */}
        {!isMinimalMode && (
          <StationHero
            station={currentStation}
            isPlaying={isPlaying}
          />
        )}

        {/* Minimal Mode spacer when hero is hidden */}
        {isMinimalMode && <div className="flex-1" />}

        {/* Saloon Floating Player Bar with Dynamic Buffer & Cyber Loader */}
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
      </BackgroundStage>

      {/* Always-On-Top Floating Mini Player Window Portal */}
      {isPipActive && pipContainer && (
        <FloatingMiniPlayer
          container={pipContainer}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          isLoading={isLoading}
          currentTime={currentTime}
          duration={duration}
          buffered={buffered}
          isShuffled={isShuffled}
          volume={volume}
          isMuted={isMuted}
          frequencies={frequencies}
          currentStation={currentStation}
          onTogglePlay={togglePlay}
          onNextTrack={handleNextTrack}
          onPrevTrack={handlePrevTrack}
          onToggleShuffle={toggleShuffle}
          onSeek={seek}
          onToggleMute={toggleMute}
          onClose={() => {
            closePip();
            setPipContainer(null);
          }}
        />
      )}

      {/* Ambient Procedural Soundscapes & Visual FX Modal */}
      <AmbientEffectsModal
        isOpen={isAmbientOpen}
        onClose={() => setIsAmbientOpen(false)}
        activeEffects={activeEffects}
        onToggleEffect={toggleEffect}
        onSetEffectVolume={setEffectVolume}
        isRainVisualEnabled={isRainVisualEnabled}
        onToggleRainVisual={() => setIsRainVisualEnabled((prev) => !prev)}
        isFilmGrainEnabled={isFilmGrainEnabled}
        onToggleFilmGrain={() => setIsFilmGrainEnabled((prev) => !prev)}
        selectedPreset={eqPreset}
        bandGains={eqBandGains}
        preampGain={eqPreampGain}
        isEqEnabled={isEqEnabled}
        onSelectPreset={handleSelectEqPreset}
        onSetBandGain={handleSetBandGain}
        onSetPreampGain={handleSetPreampGain}
        onToggleEq={handleToggleEq}
        currentStation={currentStation}
      />

      {/* Playlist Drawer Modal */}
      <PlaylistModal
        isOpen={isPlaylistOpen}
        onClose={() => setIsPlaylistOpen(false)}
        station={currentStation}
        tracks={tracks}
        currentTrack={currentTrack}
        currentTrackIndex={currentTrackIndex}
        isPlaying={isPlaying}
        onSelectTrack={(idx) => {
          selectTrack(idx);
          setIsPlaylistOpen(false);
        }}
      />

      {/* Shortcuts Guide Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Supporter VIP Modal */}
      <SupporterModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />

      {/* Audio Stream Source & Engine Switcher Modal */}
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

      {/* Onboarding Welcome Modal */}
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
