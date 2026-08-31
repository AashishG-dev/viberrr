import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * useFloatingMiniPlayer
 * Cross-platform Multitasking & Floating Player:
 * - Desktop: Document Picture-in-Picture API (Interactive always-on-top window with buttons & seekbar)
 * - Mobile / Fallback: Canvas Video Picture-in-Picture API (Native floating overlay over other mobile apps)
 * - Window Fallback: Compact standalone pop-up window
 */
export function useFloatingMiniPlayer() {
  const [isPipActive, setIsPipActive] = useState(false);
  const pipWindowRef = useRef(null);
  const videoPipRef = useRef(null);

  // Check feature support
  const isDocumentPipSupported = typeof window !== 'undefined' && 'documentPictureInPicture' in window;
  const isVideoPipSupported = typeof document !== 'undefined' && 'pictureInPictureEnabled' in document;

  const closePip = useCallback(async () => {
    if (pipWindowRef.current) {
      try {
        pipWindowRef.current.close();
      } catch (e) {}
      pipWindowRef.current = null;
    }
    if (document.pictureInPictureElement) {
      try {
        await document.exitPictureInPicture();
      } catch (e) {}
    }
    setIsPipActive(false);
  }, []);

  const openFloatingMiniPlayer = useCallback(async ({ currentTrack, currentStation, isPlaying } = {}) => {
    // 1. Desktop: Document Picture-in-Picture API (Interactive Window)
    if (isDocumentPipSupported) {
      try {
        if (pipWindowRef.current) {
          closePip();
          return null;
        }

        const pipWindow = await window.documentPictureInPicture.requestWindow({
          width: 360,
          height: 480,
          disallowReturnToOpener: false
        });

        pipWindowRef.current = pipWindow;
        setIsPipActive(true);

        // Copy stylesheets to PiP window
        [...document.styleSheets].forEach((styleSheet) => {
          try {
            if (styleSheet.href) {
              const link = document.createElement('link');
              link.rel = 'stylesheet';
              link.type = styleSheet.type;
              link.media = styleSheet.media;
              link.href = styleSheet.href;
              pipWindow.document.head.appendChild(link);
            } else if (styleSheet.cssRules) {
              const style = document.createElement('style');
              for (const rule of styleSheet.cssRules) {
                style.appendChild(document.createTextNode(rule.cssText));
              }
              pipWindow.document.head.appendChild(style);
            }
          } catch (err) {}
        });

        // Copy font links
        document.querySelectorAll('link[rel="stylesheet"], link[rel="preconnect"]').forEach((link) => {
          pipWindow.document.head.appendChild(link.cloneNode(true));
        });

        pipWindow.document.body.className = 'bg-[#050508] text-white overflow-hidden select-none m-0 p-0 font-sans';
        pipWindow.document.title = 'Viberr Floating Player';

        const pipRoot = pipWindow.document.createElement('div');
        pipRoot.id = 'pip-root';
        pipRoot.className = 'w-full h-full';
        pipWindow.document.body.appendChild(pipRoot);

        pipWindow.addEventListener('pagehide', () => {
          pipWindowRef.current = null;
          setIsPipActive(false);
        });

        return pipRoot;
      } catch (error) {
        console.warn('Document PiP failed, attempting mobile canvas video PiP:', error);
      }
    }

    // 2. Mobile & Tablet: Canvas Video Picture-in-Picture Bridge
    if (isVideoPipSupported) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Draw album art & track title on canvas
        const drawFrame = () => {
          ctx.fillStyle = '#07070a';
          ctx.fillRect(0, 0, 512, 512);

          // Glowing border
          ctx.strokeStyle = currentStation?.color || '#00f0ff';
          ctx.lineWidth = 8;
          ctx.strokeRect(10, 10, 492, 492);

          // Title
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 30px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(currentTrack?.title || 'Viberr Live Radio', 256, 240);

          // Artist
          ctx.fillStyle = currentStation?.color || '#00f0ff';
          ctx.font = '22px sans-serif';
          ctx.fillText(currentTrack?.artist || 'Viberr Radio', 256, 290);

          // Station
          ctx.fillStyle = 'rgba(255,255,255,0.6)';
          ctx.font = '16px monospace';
          ctx.fillText(`[ ${currentStation?.name || 'Viberr'} ]`, 256, 340);
        };

        drawFrame();
        const stream = canvas.captureStream ? canvas.captureStream(30) : null;

        if (stream) {
          let video = videoPipRef.current;
          if (!video) {
            video = document.createElement('video');
            video.muted = true;
            video.playsInline = true;
            video.autoplay = true;
            videoPipRef.current = video;
          }

          video.srcObject = stream;
          await video.play();
          await video.requestPictureInPicture();
          setIsPipActive(true);

          video.addEventListener('leavepictureinpicture', () => {
            setIsPipActive(false);
          }, { once: true });

          return null;
        }
      } catch (videoError) {
        console.warn('Mobile video PiP failed, trying popup window:', videoError);
      }
    }

    // 3. Fallback: Compact standalone popup window
    const width = 380;
    const height = 520;
    const left = window.screen.width - width - 40;
    const top = 60;

    const popupUrl = new URL(window.location.href);
    popupUrl.searchParams.set('mode', 'mini');

    const popup = window.open(
      popupUrl.toString(),
      'ViberrMiniPlayer',
      `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no,resizable=yes`
    );

    if (popup) {
      popup.focus();
    }
    return null;
  }, [isDocumentPipSupported, isVideoPipSupported, closePip]);

  useEffect(() => {
    return () => {
      if (pipWindowRef.current) {
        try {
          pipWindowRef.current.close();
        } catch (e) {}
      }
    };
  }, []);

  return {
    isPipActive,
    isDocumentPipSupported,
    isVideoPipSupported,
    openFloatingMiniPlayer,
    closePip,
    pipWindow: pipWindowRef.current
  };
}
