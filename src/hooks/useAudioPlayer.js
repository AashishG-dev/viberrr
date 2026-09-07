import { useState, useEffect, useRef, useCallback } from 'react';
import { shuffleArray } from '../utils/formatters';
import { useYouTubeAudioEngine } from './useYouTubeAudioEngine';
import { streamResolver } from '../services/streaming/StreamResolver';

export function useAudioPlayer(initialTracks = []) {
  const audioRef = useRef(null);
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

  const currentTrack = tracks[currentTrackIndex] || null;
  const isCurrentTrackYouTube = Boolean(
    currentTrack?.isYouTubeEngine || 
    (currentTrack?.videoId && (!currentTrack?.url || currentTrack.url.includes('youtube.com') || currentTrack.url.includes('youtu.be')))
  );

  const handleNextTrackRef = useRef(null);

  // Seamless YouTube Headless Audio Engine Bridge
  const ytEngine = useYouTubeAudioEngine({
    onTrackEnded: () => {
      handleNextTrackRef.current?.();
    },
    onTimeUpdate: (t) => {
      setCurrentTime(t);
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
      setIsPlaying(false);
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
  }, [isCurrentTrackYouTube]);

  // MediaSession integration
  useEffect(() => {
    if ('mediaSession' in navigator && currentTrack) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title || 'Viberr Radio',
        artist: currentTrack.artist || 'Viberr Live Stream',
        album: isLiveStream ? '24/7 Global Web Stream' : (currentTrack.album || 'Viberr Lossless Sessions'),
        artwork: [
          { src: currentTrack.thumbnail || '/favicon.svg', sizes: '512x512', type: 'image/png' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => togglePlay());
      navigator.mediaSession.setActionHandler('pause', () => togglePlay());
      navigator.mediaSession.setActionHandler('previoustrack', () => handlePrevTrack());
      navigator.mediaSession.setActionHandler('nexttrack', () => handleNextTrack());
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) seek(details.seekTime);
      });
    }
  }, [currentTrack, isLiveStream]);

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

    const isYt = Boolean(targetTrack.videoId && /^[a-zA-Z0-9_-]{11}$/.test(targetTrack.videoId));

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

    const isYt = Boolean(targetTrack.videoId && /^[a-zA-Z0-9_-]{11}$/.test(targetTrack.videoId));
    const safeTrack = {
      ...targetTrack,
      id: targetTrack.id || `track_${Date.now()}`,
      title: targetTrack.title || 'Unknown Track',
      artist: targetTrack.artist || 'Viberr Artist',
      thumbnail: targetTrack.thumbnail || '/favicon.svg',
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

  const togglePlay = useCallback(() => {
    if (isCurrentTrackYouTube) {
      if (isPlaying) {
        ytEngine.pauseVideo();
        setIsPlaying(false);
      } else {
        ytEngine.playVideo();
        setIsPlaying(true);
      }
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
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
    }
  }, [isPlaying, currentTrack, isCurrentTrackYouTube, ytEngine, isMuted, volume, playDirectTrack, tracks]);

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
