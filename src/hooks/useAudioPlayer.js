import { useState, useEffect, useRef, useCallback } from 'react';
import { shuffleArray } from '../utils/formatters';
import { useYouTubeAudioEngine } from './useYouTubeAudioEngine';
import { streamResolver } from '../services/streaming/StreamResolver';
import { useAudioKeepAlive } from './useAudioKeepAlive';

export function useAudioPlayer(initialTracks = []) {
  const audioRef = useRef(null);
  const preloadAudioRef = useRef(null);
  const preloadedTrackRef = useRef(null);
  const isPreloadingRef = useRef(false);

  const [tracks, setTracks] = useState(initialTracks);
  const [originalTracks, setOriginalTracks] = useState(initialTracks);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(() => {
    return initialTracks.length > 1 ? Math.floor(Math.random() * initialTracks.length) : 0;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(() => {
    try {
      const saved = localStorage.getItem('viberr_volume');
      return saved !== null ? parseFloat(saved) : 0.8;
    } catch (e) {
      return 0.8;
    }
  });
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveStream, setIsLiveStream] = useState(false);
  const [userQueue, setUserQueue] = useState([]);

  // Maintain continuous Android audio wake lock to prevent background tab death
  useAudioKeepAlive(isPlaying);

  const currentTrack = tracks[currentTrackIndex] || null;
  const isCurrentTrackYouTube = Boolean(
    currentTrack?.isYouTubeEngine || 
    (currentTrack?.videoId && (!currentTrack?.url || currentTrack.url.includes('youtube.com') || currentTrack.url.includes('youtu.be')))
  );

  const handleNextTrackRef = useRef(null);
  const playActionRef = useRef(null);
  const pauseActionRef = useRef(null);
  const nextActionRef = useRef(null);
  const prevActionRef = useRef(null);
  const seekActionRef = useRef(null);

  // Seamless YouTube Headless Audio Engine Bridge
  const ytEngine = useYouTubeAudioEngine({
    onTrackEnded: () => {
      handleNextTrackRef.current?.();
    },
    onTimeUpdate: (t) => {
      setCurrentTime(t);
      if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession && duration > 0) {
        try {
          navigator.mediaSession.setPositionState({
            duration: Math.max(t, duration),
            playbackRate: 1,
            position: Math.min(t, duration)
          });
        } catch (e) {}
      }
    },
    onStateChange: (playing) => {
      setIsPlaying(playing);
    }
  });

  // Sync YouTube duration and state if active
  useEffect(() => {
    if (isCurrentTrackYouTube) {
      if (ytEngine.ytDuration > 0) {
        setDuration(ytEngine.ytDuration);
      } else if (currentTrack?.duration > 0) {
        setDuration(currentTrack.duration);
      }
      setBuffered(1);
    }
  }, [isCurrentTrackYouTube, ytEngine.ytDuration, currentTrack?.duration]);

  // Initialize single audio element
  if (!audioRef.current && typeof Audio !== 'undefined') {
    const audio = new Audio();
    audio.preload = 'auto';
    const initIdx = initialTracks.length > 1 ? Math.floor(Math.random() * initialTracks.length) : 0;
    if (initialTracks[initIdx]?.url) {
      audio.src = initialTracks[initIdx].url;
    }
    audioRef.current = audio;
  }

  // Sync initial track source on mount if needed
  useEffect(() => {
    if (audioRef.current && currentTrack?.url && (!audioRef.current.src || audioRef.current.src === window.location.href)) {
      audioRef.current.src = currentTrack.url;
    }
  }, [currentTrack]);

  // Sync volume with audio element and YouTube
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
    ytEngine.setVolume(volume);
    ytEngine.setMuted(isMuted);
  }, [volume, isMuted, ytEngine]);

  // Audio Event Listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (isCurrentTrackYouTube) return;
      const cur = audio.currentTime || 0;
      setCurrentTime(cur);
      updateBuffered();

      // Next-Track Pre-Resolution & Pre-Buffering: 15-20s before end for 0ms Android switch
      if (!isPreloadingRef.current && tracks.length > 1 && !isLiveStream && audio.duration > 15) {
        if (cur >= audio.duration - 20 || (cur / audio.duration > 0.8)) {
          const nextIdx = (currentTrackIndex + 1) % tracks.length;
          const nextCandidate = tracks[nextIdx];
          if (nextCandidate && (!preloadedTrackRef.current || preloadedTrackRef.current.targetIndex !== nextIdx)) {
            isPreloadingRef.current = true;
            streamResolver.resolvePlayableTrack(nextCandidate).then((resolved) => {
              if (resolved) {
                preloadedTrackRef.current = { ...resolved, targetIndex: nextIdx };
                if (resolved.url && !resolved.isYouTubeEngine) {
                  if (!preloadAudioRef.current && typeof Audio !== 'undefined') {
                    preloadAudioRef.current = new Audio();
                    preloadAudioRef.current.preload = 'auto';
                  }
                  if (preloadAudioRef.current) {
                    preloadAudioRef.current.src = resolved.url;
                    preloadAudioRef.current.load();
                  }
                }
              }
            }).catch(() => {}).finally(() => {
              isPreloadingRef.current = false;
            });
          }
        }
      }

      if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession && audio.duration > 0) {
        try {
          navigator.mediaSession.setPositionState({
            duration: audio.duration,
            playbackRate: 1,
            position: Math.min(cur, audio.duration)
          });
        } catch (e) {}
      }
    };

    const updateBuffered = () => {
      if (isCurrentTrackYouTube) {
        setBuffered(1);
        return;
      }
      if (audio.buffered.length > 0 && audio.duration > 0) {
        setBuffered(audio.buffered.end(audio.buffered.length - 1) / audio.duration);
      }
    };

    const handleDurationChange = () => {
      if (!isCurrentTrackYouTube && audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
    };

    const handleEnded = () => {
      // Keep isPlaying alive across track switches so Android OS never drops the notification
      handleNextTrackRef.current?.();
    };

    const handleError = () => {
      setIsLoading(false);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('progress', updateBuffered);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('progress', updateBuffered);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [isCurrentTrackYouTube, currentTrackIndex, tracks, isLiveStream]);

  // MediaSession integration with high-res absolute PNG artwork for Android OS Lockscreen
  useEffect(() => {
    if ('mediaSession' in navigator && currentTrack) {
      try {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const fallbackPng = `${origin}/android-chrome-512x512.png`;
        const artworkSrc = currentTrack.thumbnail && currentTrack.thumbnail.startsWith('http') && !currentTrack.thumbnail.includes('.svg')
          ? currentTrack.thumbnail
          : fallbackPng;

        navigator.mediaSession.metadata = new MediaMetadata({
          title: currentTrack.title || 'Viberr Radio',
          artist: currentTrack.artist || 'Viberr Live Stream',
          album: isLiveStream ? '24/7 Global Web Stream' : (currentTrack.album || 'Viberr Lossless Sessions'),
          artwork: [
            { src: artworkSrc, sizes: '512x512', type: 'image/png' },
            { src: `${origin}/android-chrome-192x192.png`, sizes: '192x192', type: 'image/png' },
            { src: artworkSrc, sizes: '256x256', type: 'image/png' },
            { src: artworkSrc, sizes: '128x128', type: 'image/png' },
            { src: artworkSrc, sizes: '96x96', type: 'image/png' }
          ]
        });

        navigator.mediaSession.setActionHandler('play', () => playActionRef.current?.());
        navigator.mediaSession.setActionHandler('pause', () => pauseActionRef.current?.());
        navigator.mediaSession.setActionHandler('stop', () => pauseActionRef.current?.());
        navigator.mediaSession.setActionHandler('previoustrack', () => prevActionRef.current?.());
        navigator.mediaSession.setActionHandler('nexttrack', () => nextActionRef.current?.());
        navigator.mediaSession.setActionHandler('seekto', (details) => {
          if (details.seekTime !== undefined) seekActionRef.current?.(details.seekTime);
        });
        navigator.mediaSession.setActionHandler('seekbackward', (details) => {
          const skipTime = details?.seekOffset || 10;
          const cur = audioRef.current?.currentTime || currentTime;
          seekActionRef.current?.(Math.max(0, cur - skipTime));
        });
        navigator.mediaSession.setActionHandler('seekforward', (details) => {
          const skipTime = details?.seekOffset || 10;
          const cur = audioRef.current?.currentTime || currentTime;
          seekActionRef.current?.(Math.min(duration, cur + skipTime));
        });
      } catch (e) {
        console.warn('MediaSession metadata error:', e);
      }
    }
  }, [currentTrack, isLiveStream, duration, currentTime]);

  // Keep OS Lockscreen / Notification PlaybackState in lockstep
  useEffect(() => {
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
      } catch (e) {}
    }
  }, [isPlaying]);

  // Station Switching Handler
  const setStationTracks = useCallback((newTracks, shouldAutoPlay = false) => {
    setIsLiveStream(false);
    ytEngine.pauseVideo();
    setTracks(newTracks);
    setOriginalTracks(newTracks);
    setCurrentTrackIndex(0);
    setCurrentTime(0);

    if (newTracks.length > 0 && newTracks[0]?.url && audioRef.current) {
      const audio = audioRef.current;
      audio.src = newTracks[0].url;
      audio.load();
      if (shouldAutoPlay) {
        setIsLoading(true);
        audio.play()
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
          })
          .catch(() => {
            setIsPlaying(false);
            setIsLoading(false);
          });
      }
    }
  }, [ytEngine]);

  // Handle switching audio stream sources
  const setLiveStreamSource = useCallback((streamConfig) => {
    if (!streamConfig || !streamConfig.url) return;
    ytEngine.pauseVideo();

    const liveTrack = {
      id: `live_${streamConfig.id}`,
      title: streamConfig.name || 'Live Stream',
      artist: streamConfig.tagline || '24/7 Global Stream',
      thumbnail: streamConfig.thumbnail || '/favicon.svg',
      duration: 0,
      url: streamConfig.url,
      isLive: true
    };

    setIsLiveStream(true);
    setTracks([liveTrack]);
    setOriginalTracks([liveTrack]);
    setCurrentTrackIndex(0);
    setCurrentTime(0);

    if (audioRef.current) {
      const audio = audioRef.current;
      audio.src = streamConfig.url;
      audio.load();
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [ytEngine]);

  // Unified track player that resolves 100% full-length songs
  const playTrackAtIndex = useCallback(async (idx) => {
    if (idx < 0 || idx >= tracks.length || isLiveStream) return;
    setCurrentTrackIndex(idx);
    setCurrentTime(0);

    const rawTrack = tracks[idx];
    if (!rawTrack) return;

    setIsLoading(true);
    let targetTrack = rawTrack;

    // Fast path: use pre-resolved track if available for instant 0ms transition
    if (preloadedTrackRef.current && preloadedTrackRef.current.targetIndex === idx) {
      targetTrack = preloadedTrackRef.current;
      preloadedTrackRef.current = null;
    } else {
      const hasValidYtId = Boolean(rawTrack.videoId && /^[a-zA-Z0-9_-]{11}$/.test(rawTrack.videoId));
      const isDirectR2 = Boolean(rawTrack.url && rawTrack.url.includes('r2.dev'));

      if (!hasValidYtId && !isDirectR2) {
        try {
          const resolved = await streamResolver.resolvePlayableTrack(rawTrack);
          if (resolved) {
            targetTrack = resolved;
          }
        } catch (e) {
          console.warn('Failed to resolve full-length track:', e);
        }
      }
    }

    // Direct audio URLs have top priority for stable Android background playback
    const isYt = Boolean(targetTrack.isYouTubeEngine && !targetTrack.url);

    setTracks((prev) => {
      if (!prev[idx]) return prev;
      const copy = [...prev];
      copy[idx] = {
        ...copy[idx],
        ...targetTrack,
        isYouTubeEngine: isYt,
        videoId: isYt ? targetTrack.videoId : (copy[idx].videoId || '')
      };
      return copy;
    });

    if (isYt) {
      if (audioRef.current) audioRef.current.pause();
      ytEngine.loadVideo(targetTrack.videoId, true, targetTrack.duration || 210);
      setIsPlaying(true);
      setIsLoading(false);
      if (targetTrack.duration) setDuration(targetTrack.duration);
    } else if (targetTrack.url) {
      ytEngine.pauseVideo();
      const audio = audioRef.current;
      if (audio) {
        audio.src = targetTrack.url;
        audio.volume = isMuted ? 0 : volume;
        audio.load();
        audio.play().then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        }).catch((err) => {
          console.warn('Playback error:', err);
          setIsLoading(false);
        });
      }
    } else {
      setIsLoading(false);
    }

    // Infinite Autoplay
    if (idx >= tracks.length - 3) {
      streamResolver.getRelatedTracks(targetTrack).then((more) => {
        if (more && more.length > 0) {
          setTracks((prev) => {
            const existingIds = new Set(prev.map((t) => t.id));
            const newItems = more.filter((t) => !existingIds.has(t.id));
            return [...prev, ...newItems];
          });
        }
      });
    }
  }, [tracks, isLiveStream, ytEngine, isMuted, volume]);

  // Handle playing any track directly from search or plugins with 100% Full-Length Songs
  const playDirectTrack = useCallback(async (trackItem, initialQueue = []) => {
    if (!trackItem) return;

    setIsLiveStream(false);
    setIsLoading(true);

    let targetTrack = trackItem;
    const hasValidYtId = Boolean(trackItem.videoId && /^[a-zA-Z0-9_-]{11}$/.test(trackItem.videoId));
    const isDirectR2 = Boolean(trackItem.url && trackItem.url.includes('r2.dev'));

    if (!hasValidYtId && !isDirectR2) {
      try {
        const resolved = await streamResolver.resolvePlayableTrack(trackItem);
        if (resolved) {
          targetTrack = resolved;
        }
      } catch (e) {
        console.warn('Full-length resolution error:', e);
      }
    }

    const isYt = Boolean(targetTrack.isYouTubeEngine && !targetTrack.url);
    const safeTrack = {
      ...targetTrack,
      id: targetTrack.id || `track_${Date.now()}`,
      title: targetTrack.title || 'Unknown Track',
      artist: targetTrack.artist || 'Viberr Artist',
      thumbnail: targetTrack.thumbnail || '/android-chrome-512x512.png',
      duration: targetTrack.duration || 210,
      videoId: isYt ? targetTrack.videoId : '',
      isYouTubeEngine: isYt,
      isFullTrack: true,
      url: isYt ? '' : (targetTrack.url || '')
    };

    const restQueue = Array.isArray(initialQueue)
      ? initialQueue.filter((t) => t && t.id !== safeTrack.id)
      : [];

    const fullQueue = [safeTrack, ...restQueue];
    setTracks(fullQueue);
    setOriginalTracks(fullQueue);
    setCurrentTrackIndex(0);
    setCurrentTime(0);

    if (isYt) {
      if (audioRef.current) audioRef.current.pause();
      ytEngine.loadVideo(safeTrack.videoId, true, safeTrack.duration || 210);
      setIsPlaying(true);
      setIsLoading(false);
      if (safeTrack.duration) setDuration(safeTrack.duration);
    } else if (safeTrack.url) {
      ytEngine.pauseVideo();
      const audio = audioRef.current;
      if (audio) {
        audio.src = safeTrack.url;
        audio.volume = isMuted ? 0 : volume;
        audio.load();
        audio.play().then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        }).catch((err) => {
          console.warn('Playback error:', err);
          setIsLoading(false);
        });
      }
    } else {
      setIsLoading(false);
    }

    if (fullQueue.length < 8) {
      streamResolver.getRelatedTracks(safeTrack).then((more) => {
        if (more && more.length > 0) {
          setTracks((prev) => {
            const existingIds = new Set(prev.map((t) => t.id));
            const newItems = more.filter((t) => !existingIds.has(t.id));
            return [...prev, ...newItems];
          });
        }
      });
    }
  }, [ytEngine, isMuted, volume]);

  const lastActionTimeRef = useRef(0);

  const pause = useCallback(() => {
    if (isCurrentTrackYouTube) {
      ytEngine.pauseVideo();
      setIsPlaying(false);
      return;
    }
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
  }, [isCurrentTrackYouTube, ytEngine]);

  const play = useCallback(() => {
    if (isCurrentTrackYouTube) {
      ytEngine.playVideo();
      setIsPlaying(true);
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    if (currentTrack?.url) {
      audio.volume = isMuted ? 0 : volume;
      if (!audio.src || audio.src === window.location.href || !audio.src.endsWith(currentTrack.url.slice(-15))) {
        audio.src = currentTrack.url;
        audio.load();
      }
      setIsLoading(true);
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
          })
          .catch((err) => {
            console.warn('Audio play error:', err);
            setIsLoading(false);
            setIsPlaying(false);
          });
      }
    } else if (currentTrack) {
      // If current track doesn't have a direct URL, resolve and play full-length song!
      playDirectTrack(currentTrack, tracks);
    }
  }, [isCurrentTrackYouTube, ytEngine, currentTrack, isMuted, volume, playDirectTrack, tracks]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  // Keep action refs updated
  playActionRef.current = play;
  pauseActionRef.current = pause;

  const addToUserQueue = useCallback((track) => {
    if (!track) return;
    setUserQueue((prev) => [...prev, track]);
  }, []);

  const playNextInUserQueue = useCallback((track) => {
    if (!track) return;
    setUserQueue((prev) => [track, ...prev]);
  }, []);

  const removeFromUserQueue = useCallback((index) => {
    setUserQueue((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearUserQueue = useCallback(() => {
    setUserQueue([]);
  }, []);

  const handleNextTrack = useCallback(() => {
    const now = Date.now();
    if (now - lastActionTimeRef.current < 200) return;
    lastActionTimeRef.current = now;

    if (userQueue.length > 0) {
      const nextTrack = userQueue[0];
      setUserQueue((prev) => prev.slice(1));
      playDirectTrack(nextTrack, tracks);
      return;
    }

    if (tracks.length === 0 || isLiveStream) return;
    const nextIdx = (currentTrackIndex + 1) % tracks.length;
    playTrackAtIndex(nextIdx);
  }, [userQueue, tracks, isLiveStream, currentTrackIndex, playDirectTrack, playTrackAtIndex]);

  handleNextTrackRef.current = handleNextTrack;
  nextActionRef.current = handleNextTrack;

  const handlePrevTrack = useCallback(() => {
    if (tracks.length === 0 || isLiveStream) return;
    const audio = audioRef.current;

    if (currentTime > 3) {
      if (isCurrentTrackYouTube) {
        ytEngine.seekTo(0);
      } else if (audio) {
        audio.currentTime = 0;
      }
      setCurrentTime(0);
      return;
    }

    const prevIdx = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    playTrackAtIndex(prevIdx);
  }, [tracks, currentTrackIndex, isLiveStream, currentTime, isCurrentTrackYouTube, ytEngine, playTrackAtIndex]);

  prevActionRef.current = handlePrevTrack;

  const selectTrack = useCallback((index) => {
    playTrackAtIndex(index);
  }, [playTrackAtIndex]);

  const seek = useCallback((time) => {
    setCurrentTime(time);
    if (isCurrentTrackYouTube) {
      ytEngine.seekTo(time);
      return;
    }

    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = time;
    }
  }, [isCurrentTrackYouTube, ytEngine]);

  seekActionRef.current = seek;

  const changeVolume = useCallback((val) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolume(clamped);
    if (isMuted && clamped > 0) {
      setIsMuted(false);
    }
    try {
      localStorage.setItem('viberr_volume', clamped.toString());
    } catch (e) {}
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffled((prev) => {
      const next = !prev;
      if (next) {
        if (currentTrack) {
          const remaining = originalTracks.filter((t) => t.id !== currentTrack.id);
          const shuffled = shuffleArray(remaining);
          setTracks([currentTrack, ...shuffled]);
          setCurrentTrackIndex(0);
        }
      } else {
        setTracks(originalTracks);
        if (currentTrack) {
          const origIdx = originalTracks.findIndex((t) => t.id === currentTrack.id);
          setCurrentTrackIndex(origIdx !== -1 ? origIdx : 0);
        }
      }
      return next;
    });
  }, [currentTrack, originalTracks]);

  return {
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
    isCurrentTrackYouTube,
    togglePlay,
    play,
    pause,
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
    userQueue,
    addToUserQueue,
    playNextInUserQueue,
    removeFromUserQueue,
    clearUserQueue,
    audioElement: audioRef.current
  };
}
