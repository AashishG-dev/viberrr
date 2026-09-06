import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * useYouTubeAudioEngine
 * Production-Grade YouTube Full-Length Audio Engine:
 * - Uses official YouTube IFrame Player API (window.YT) with real event hooks
 * - Live real-time currentTime & duration synchronization from player hardware
 * - Visible floating video dock so browsers (Chrome/Safari) never block autoplay audio
 * - Accurate state handling: PLAYING, PAUSED, ENDED, and ERROR fallbacks
 */
export function useYouTubeAudioEngine({
  onTrackEnded,
  onTimeUpdate,
  onStateChange,
  onError
}) {
  const hostRef = useRef(null);
  const playerRef = useRef(null);
  const timeIntervalRef = useRef(null);
  const currentVideoIdRef = useRef('');
  const volumeRef = useRef(0.8);
  const isMutedRef = useRef(false);

  const onTimeUpdateRef = useRef(onTimeUpdate);
  const onTrackEndedRef = useRef(onTrackEnded);
  const onStateChangeRef = useRef(onStateChange);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onTimeUpdateRef.current = onTimeUpdate;
  }, [onTimeUpdate]);

  useEffect(() => {
    onTrackEndedRef.current = onTrackEnded;
  }, [onTrackEnded]);

  useEffect(() => {
    onStateChangeRef.current = onStateChange;
  }, [onStateChange]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const [isYtPlaying, setIsYtPlaying] = useState(false);
  const [ytDuration, setYtDuration] = useState(240);
  const [ytCurrentTime, setYtCurrentTime] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  // Create or get the docked YouTube host element
  const getOrCreateHost = useCallback(() => {
    if (typeof document === 'undefined') return null;
    let host = document.getElementById('viberr-yt-host');
    if (!host) {
      host = document.createElement('div');
      host.id = 'viberr-yt-host';
      host.style.cssText = [
        'position: fixed',
        'bottom: 84px',
        'right: 16px',
        'width: 280px',
        'height: 160px',
        'z-index: 45',
        'border-radius: 12px',
        'overflow: hidden',
        'box-shadow: 0 12px 36px rgba(0,0,0,0.85)',
        'border: 1px solid #343538',
        'background: #0d0e11',
        'display: none',
        'transition: transform 0.3s ease, opacity 0.3s ease'
      ].join(';');

      // Inner header with close/minimize button
      const header = document.createElement('div');
      header.id = 'viberr-yt-header';
      header.style.cssText = [
        'height: 24px',
        'background: #1b1b1f',
        'display: flex',
        'align-items: center',
        'justify-content: space-between',
        'padding: 0 8px',
        'font-family: monospace',
        'font-size: 9px',
        'color: #cfc6b0',
        'border-bottom: 1px solid #343538',
        'user-select: none'
      ].join(';');
      header.innerHTML = `
        <span style="font-weight:bold;letter-spacing:0.5px">▶ YOUTUBE FULL ENGINE</span>
        <button id="viberr-yt-toggle-btn" style="background:none;border:none;color:#8f918c;cursor:pointer;font-size:11px;font-family:monospace">✕</button>
      `;
      host.appendChild(header);

      const frameContainer = document.createElement('div');
      frameContainer.id = 'viberr-yt-frame-container';
      frameContainer.style.cssText = 'width:100%;height:calc(100% - 24px);position:relative;background:#000;';
      host.appendChild(frameContainer);

      document.body.appendChild(host);

      // Handle close/dock toggle
      const btn = header.querySelector('#viberr-yt-toggle-btn');
      if (btn) {
        btn.onclick = () => {
          host.style.display = 'none';
        };
      }
    }
    hostRef.current = host;
    return host;
  }, []);

  const stopTimeSync = useCallback(() => {
    if (timeIntervalRef.current) {
      clearInterval(timeIntervalRef.current);
      timeIntervalRef.current = null;
    }
  }, []);

  // Poll actual time from YouTube player hardware
  const startTimeSync = useCallback(() => {
    stopTimeSync();
    timeIntervalRef.current = setInterval(() => {
      try {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
          const cur = playerRef.current.getCurrentTime();
          const dur = playerRef.current.getDuration();
          if (typeof cur === 'number' && !isNaN(cur)) {
            setYtCurrentTime(cur);
            onTimeUpdateRef.current?.(cur);
          }
          if (typeof dur === 'number' && dur > 0) {
            setYtDuration(dur);
          }
        }
      } catch (e) {}
    }, 500);
  }, [stopTimeSync]);

  const loadVideo = useCallback((videoId, autoPlay = true, duration = 240) => {
    if (!videoId) return;
    const cleanId = videoId.replace(/^yt_/, '').trim();
    currentVideoIdRef.current = cleanId;

    const host = getOrCreateHost();
    if (host) {
      host.style.display = 'block';
    }

    setYtDuration(duration || 240);
    setYtCurrentTime(0);

    const initPlayer = () => {
      const container = document.getElementById('viberr-yt-frame-container');
      if (!container) return;

      // If player already exists, simply load the new video ID
      if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
        try {
          playerRef.current.loadVideoById({
            videoId: cleanId,
            startSeconds: 0
          });
          playerRef.current.setVolume(Math.round(volumeRef.current * 100));
          if (isMutedRef.current) playerRef.current.mute();
          else playerRef.current.unMute();
          if (autoPlay) {
            playerRef.current.playVideo();
          }
          return;
        } catch (e) {
          console.warn('loadVideoById failed, re-instantiating player:', e);
        }
      }

      // Re-create frame container to clean up any stuck iframe
      container.innerHTML = '<div id="viberr-yt-embed-slot"></div>';

      if (window.YT && window.YT.Player) {
        playerRef.current = new window.YT.Player('viberr-yt-embed-slot', {
          videoId: cleanId,
          width: '100%',
          height: '100%',
          playerVars: {
            autoplay: autoPlay ? 1 : 0,
            controls: 1,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
            origin: typeof window !== 'undefined' ? window.location.origin : ''
          },
          events: {
            onReady: (event) => {
              event.target.setVolume(Math.round(volumeRef.current * 100));
              if (isMutedRef.current) event.target.mute();
              else event.target.unMute();
              if (autoPlay) {
                event.target.playVideo();
              }
            },
            onStateChange: (event) => {
              // 1 = PLAYING
              if (event.data === 1) {
                setIsYtPlaying(true);
                onStateChangeRef.current?.(true);
                startTimeSync();
              } else if (event.data === 2) {
                // 2 = PAUSED
                setIsYtPlaying(false);
                onStateChangeRef.current?.(false);
                stopTimeSync();
              } else if (event.data === 0) {
                // 0 = ENDED
                setIsYtPlaying(false);
                onStateChangeRef.current?.(false);
                stopTimeSync();
                onTrackEndedRef.current?.();
              }
            },
            onError: (event) => {
              console.warn('YouTube Player Event Error:', event.data);
              setIsYtPlaying(false);
              onStateChangeRef.current?.(false);
              stopTimeSync();
              onErrorRef.current?.(event.data);
            }
          }
        });
      } else {
        // Fallback: direct iframe if window.YT is still downloading
        const iframe = document.createElement('iframe');
        iframe.id = 'viberr-yt-active-frame';
        iframe.width = '100%';
        iframe.height = '100%';
        iframe.src = `https://www.youtube.com/embed/${cleanId}?autoplay=1&enablejsapi=1&origin=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}`;
        iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
        iframe.style.border = 'none';
        container.appendChild(iframe);

        setIsYtPlaying(true);
        onStateChangeRef.current?.(true);
      }
    };

    // If window.YT is ready
    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      // Wait for YouTube Iframe API
      const prevOnReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prevOnReady === 'function') prevOnReady();
        initPlayer();
      };
      // Timeout fallback in case callback already fired
      setTimeout(initPlayer, 400);
    }
  }, [getOrCreateHost, startTimeSync, stopTimeSync]);

  const playVideo = useCallback(() => {
    if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
      playerRef.current.playVideo();
    }
    const host = getOrCreateHost();
    if (host) host.style.display = 'block';
    setIsYtPlaying(true);
    onStateChangeRef.current?.(true);
    startTimeSync();
  }, [getOrCreateHost, startTimeSync]);

  const pauseVideo = useCallback(() => {
    if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
      playerRef.current.pauseVideo();
    }
    setIsYtPlaying(false);
    onStateChangeRef.current?.(false);
    stopTimeSync();
  }, [stopTimeSync]);

  const seekTo = useCallback((seconds) => {
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      playerRef.current.seekTo(seconds, true);
    }
    setYtCurrentTime(seconds);
    onTimeUpdateRef.current?.(seconds);
  }, []);

  const setVolume = useCallback((volPercent) => {
    volumeRef.current = volPercent;
    if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
      playerRef.current.setVolume(Math.round(volPercent * 100));
    }
  }, []);

  const setMuted = useCallback((muted) => {
    isMutedRef.current = muted;
    if (playerRef.current) {
      if (muted && typeof playerRef.current.mute === 'function') {
        playerRef.current.mute();
      } else if (!muted && typeof playerRef.current.unMute === 'function') {
        playerRef.current.unMute();
      }
    }
  }, []);

  const closeVideo = useCallback(() => {
    pauseVideo();
    if (hostRef.current) {
      hostRef.current.style.display = 'none';
    }
  }, [pauseVideo]);

  useEffect(() => {
    return () => {
      stopTimeSync();
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch (e) {}
      }
    };
  }, [stopTimeSync]);

  return {
    isYtPlaying,
    ytDuration,
    ytCurrentTime,
    loadVideo,
    playVideo,
    pauseVideo,
    seekTo,
    setVolume,
    setMuted,
    closeVideo
  };
}
