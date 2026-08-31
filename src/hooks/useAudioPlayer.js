import { useState, useEffect, useRef, useCallback } from 'react';
import { shuffleArray } from '../utils/formatters';

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

  const currentTrack = tracks[currentTrackIndex] || null;

  // Sync initial track source on mount if needed
  useEffect(() => {
    if (audioRef.current && currentTrack?.url && (!audioRef.current.src || audioRef.current.src === window.location.href)) {
      audioRef.current.src = currentTrack.url;
    }
  }, [currentTrack]);

  // Sync volume with audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Audio Event Listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      const cur = audio.currentTime || 0;
      setCurrentTime(cur);
      updateBuffered();

      // Sync position with mobile/OS lockscreen
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
      if (audio.buffered.length > 0 && audio.duration > 0) {
        let maxBuf = 0;
        for (let i = 0; i < audio.buffered.length; i++) {
          if (audio.buffered.end(i) > maxBuf) {
            maxBuf = audio.buffered.end(i);
          }
        }
        setBuffered(Math.min(audio.duration, maxBuf));
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || currentTrack?.duration || 0);
      updateBuffered();
      setIsLoading(false);
    };

    const handleEnded = () => {
      if (!isLiveStream) {
        handleNextTrack();
      }
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    const handlePlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
      }
    };

    const handlePause = () => {
      setIsPlaying(false);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
    };

    const handleError = (e) => {
      console.warn('Audio playback error / stream reconnecting:', e);
      setIsLoading(false);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('progress', updateBuffered);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('progress', updateBuffered);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
    };
  }, [tracks, currentTrackIndex, isLiveStream, currentTrack]);

  // Track switching effect
  useEffect(() => {
    if (!currentTrack || !audioRef.current) return;
    const audio = audioRef.current;

    if (!audio.src || !audio.src.endsWith(currentTrack.url)) {
      audio.src = currentTrack.url;
      audio.load();
      if (isPlaying) {
        audio.play().then(() => {
          setIsPlaying(true);
        }).catch((err) => {
          console.warn('Auto-play after track switch prevented:', err);
          setIsPlaying(false);
        });
      }
    }

    // Media Session Setup for OS notification & lockscreen controls
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title || 'Viberr Track',
        artist: currentTrack.artist || 'Viberr Radio',
        album: 'Viberr Live Radio',
        artwork: [
          { src: currentTrack.thumbnail || '/favicon.svg', sizes: '512x512', type: 'image/svg+xml' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => togglePlay());
      navigator.mediaSession.setActionHandler('pause', () => togglePlay());
      navigator.mediaSession.setActionHandler('nexttrack', () => handleNextTrack());
      navigator.mediaSession.setActionHandler('previoustrack', () => handlePrevTrack());
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) seek(details.seekTime);
      });
    }
  }, [currentTrackIndex, tracks]);

  // Handle station track change
  const setStationTracks = useCallback((newTracks, autoPlay = true, startRandom = true) => {
    setIsLiveStream(false);
    setOriginalTracks(newTracks);
    const selectedList = isShuffled ? shuffleArray(newTracks) : newTracks;
    setTracks(selectedList);
    
    // Pick random song from station pool on tune-in
    const startIdx = (startRandom && selectedList.length > 1)
      ? Math.floor(Math.random() * selectedList.length)
      : 0;

    setCurrentTrackIndex(startIdx);
    setCurrentTime(0);

    if (selectedList.length > 0 && audioRef.current) {
      const audio = audioRef.current;
      audio.src = selectedList[startIdx].url;
      audio.load();
      if (autoPlay) {
        audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      }
    }
  }, [isShuffled]);

  // Handle live stream source switch
  const setLiveStreamSource = useCallback((streamConfig) => {
    setIsLiveStream(true);
    const liveTrack = {
      id: streamConfig.id,
      title: streamConfig.name,
      artist: streamConfig.desc || '24/7 Global Web Radio',
      thumbnail: '/favicon.svg',
      duration: 0,
      url: streamConfig.url
    };
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
  }, []);

  const lastActionTimeRef = useRef(0);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      if (currentTrack?.url) {
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
      }
    }
  }, [isPlaying, currentTrack]);

  const handleNextTrack = useCallback(() => {
    const now = Date.now();
    if (now - lastActionTimeRef.current < 150) return;
    lastActionTimeRef.current = now;

    if (tracks.length === 0 || isLiveStream) return;
    const nextIdx = (currentTrackIndex + 1) % tracks.length;
    setCurrentTrackIndex(nextIdx);
    setCurrentTime(0);

    const audio = audioRef.current;
    if (audio && tracks[nextIdx]) {
      audio.src = tracks[nextIdx].url;
      audio.load();
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [tracks, currentTrackIndex, isLiveStream]);

  const handlePrevTrack = useCallback(() => {
    if (tracks.length === 0 || isLiveStream) return;
    const audio = audioRef.current;

    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    const prevIdx = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    setCurrentTrackIndex(prevIdx);
    setCurrentTime(0);

    if (audio && tracks[prevIdx]) {
      audio.src = tracks[prevIdx].url;
      audio.load();
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [tracks, currentTrackIndex, isLiveStream]);

  const selectTrack = useCallback((index) => {
    if (index >= 0 && index < tracks.length) {
      setCurrentTrackIndex(index);
      setCurrentTime(0);
      const audio = audioRef.current;
      if (audio) {
        audio.src = tracks[index].url;
        audio.load();
        audio.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }
  }, [tracks]);

  const seek = useCallback((time) => {
    const audio = audioRef.current;
    if (audio && !isLiveStream) {
      audio.currentTime = time;
      setCurrentTime(time);
    }
  }, [isLiveStream]);

  const changeVolume = useCallback((val) => {
    const num = Math.max(0, Math.min(1, val));
    setVolume(num);
    setIsMuted(num === 0);
    if (audioRef.current) {
      audioRef.current.volume = num;
    }
    try {
      localStorage.setItem('viberr_volume', num.toString());
    } catch (e) {}
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (audioRef.current) {
        audioRef.current.volume = next ? 0 : volume;
      }
      return next;
    });
  }, [volume]);

  const toggleShuffle = useCallback(() => {
    if (isLiveStream) return;
    setIsShuffled((prev) => {
      const next = !prev;
      if (next) {
        const curr = tracks[currentTrackIndex];
        const shuffled = shuffleArray(originalTracks);
        if (curr) {
          const idx = shuffled.findIndex((t) => t.id === curr.id);
          if (idx !== -1) {
            shuffled.splice(idx, 1);
            shuffled.unshift(curr);
          }
        }
        setTracks(shuffled);
        setCurrentTrackIndex(0);
      } else {
        const curr = tracks[currentTrackIndex];
        setTracks(originalTracks);
        if (curr) {
          const idx = originalTracks.findIndex((t) => t.id === curr.id);
          setCurrentTrackIndex(idx !== -1 ? idx : 0);
        }
      }
      return next;
    });
  }, [tracks, currentTrackIndex, originalTracks, isLiveStream]);

  return {
    currentTrack,
    currentTrackIndex,
    tracks,
    isPlaying,
    currentTime,
    duration: duration || currentTrack?.duration || 0,
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
    audioElement: audioRef.current
  };
}
