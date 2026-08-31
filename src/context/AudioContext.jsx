import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { STATIONS, DEFAULT_STATION_ID, getStationById, getStationBySlug } from '../data/stationsData';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useWakeLock } from '../hooks/useWakeLock';
import { useRealtimePresence } from '../hooks/useRealtimePresence';
import { useAudioVisualizer } from '../hooks/useAudioVisualizer';
import { useFloatingMiniPlayer } from '../hooks/useFloatingMiniPlayer';
import { useSecurityShield } from '../hooks/useSecurityShield';
import { useAmbientSoundscapes } from '../hooks/useAmbientSoundscapes';
import { useStudioEqualizer } from '../hooks/useStudioEqualizer';
import { useAdManager } from '../hooks/useAdManager';
import { AUDIO_SOURCES } from '../components/AudioSourceModal';
import { copyShareLink } from '../utils/formatters';

const AudioContext = createContext(null);

export function AudioProvider({ children }) {
  // Read initial station from URL or fallback
  const [currentStation, setCurrentStation] = useState(() => {
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const stationParam = params.get('station');
    if (stationParam) {
      return getStationBySlug(stationParam);
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
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [isPluginsOpen, setIsPluginsOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(() => {
    try {
      return localStorage.getItem('viberr_onboarded') !== 'true';
    } catch (e) {
      return false;
    }
  });
  const [isRainVisualEnabled, setIsRainVisualEnabled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMinimalMode, setIsMinimalMode] = useState(() => {
    if (typeof window === 'undefined') return false;
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
    playDirectTrack,
    audioElement
  } = useAudioPlayer(currentStation?.songs || []);

  // Real-time Visualizer Frequency Spectrum Hook
  const { frequencies, audioLevel } = useAudioVisualizer(audioElement, isPlaying);

  // Real-time Active Listeners Counter
  const { onlineCount } = useRealtimePresence(currentStation?.id);

  // Pro Studio 10-Band Parametric Equalizer Hook
  const {
    selectedPreset: eqPreset,
    bandGains: eqBandGains,
    preampGain: eqPreampGain,
    isEqEnabled,
    selectPreset: handleSelectEqPreset,
    setBandGain: handleSetBandGain,
    setPreampGain: handleSetPreampGain,
    resetEq: handleResetEq
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

  const value = {
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
    playDirectTrack,
    frequencies,
    audioLevel,
    onlineCount,
    eqPreset,
    eqBandGains,
    eqPreampGain,
    isEqEnabled,
    handleSelectEqPreset,
    handleSetBandGain,
    handleSetPreampGain,
    handleResetEq,
    handleSelectStation,
    handleSelectAudioSource,
    handleShareStation,
    handleToggleFullscreen,
    handleToggleMinimalMode
  };

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
