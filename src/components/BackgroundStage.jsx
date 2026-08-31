import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import AudioVisualizerCanvas from './AudioVisualizerCanvas';

export default function BackgroundStage({
  station,
  currentAudioSource,
  currentTrack,
  isFullscreen,
  isPlaying,
  frequencies,
  audioLevel,
  children
}) {
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  // Dynamic priority: Live Stream Engine wallpapers override default station if active
  const activeVisuals = 
    currentAudioSource && currentAudioSource.id !== 'viberr-cdn' && currentAudioSource.desktopBgs?.length
      ? currentAudioSource
      : station;

  const desktopImages = activeVisuals?.desktopBgs || station?.desktopBgs || [];
  const activeColor = activeVisuals?.color || station?.color || '#00f0ff';
  const timerRef = useRef(null);

  const maxDesktop = desktopImages.length;

  // Eagerly preload all images in the active set for instant transitions
  useEffect(() => {
    desktopImages.forEach((url) => {
      if (url && typeof Image !== 'undefined') {
        const img = new Image();
        img.src = url;
      }
    });
  }, [desktopImages]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (maxDesktop > 1) {
      timerRef.current = setInterval(() => {
        setCurrentBgIndex((prev) => (prev + 1) % maxDesktop);
      }, 25000);
    }
  }, [maxDesktop]);

  // Dynamically rotate background when track changes
  useEffect(() => {
    if (maxDesktop > 1 && currentTrack?.id) {
      setCurrentBgIndex((prev) => (prev + 1) % maxDesktop);
      resetTimer();
    }
  }, [currentTrack?.id, maxDesktop, resetTimer]);

  // Reset bg index and timer whenever station or audio source changes
  useEffect(() => {
    setCurrentBgIndex(0);
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeVisuals?.id, resetTimer]);

  const handleNextBg = (e) => {
    e?.stopPropagation();
    if (maxDesktop <= 1) return;
    setCurrentBgIndex((prev) => (prev + 1) % maxDesktop);
    resetTimer();
  };

  const handlePrevBg = (e) => {
    e?.stopPropagation();
    if (maxDesktop <= 1) return;
    setCurrentBgIndex((prev) => (prev - 1 + maxDesktop) % maxDesktop);
    resetTimer();
  };

  return (
    <div
      id="stage-container"
      className="relative w-full flex-1 flex flex-col justify-between overflow-hidden select-none min-h-0"
      style={{
        '--st-color': activeColor,
        '--st-glow': `${activeColor}55`
      }}
    >
      {/* Dynamic Song Artwork Ambient Backdrop */}
      {currentTrack?.thumbnail && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none transition-opacity duration-1000">
          <motion.img
            key={currentTrack.id || currentTrack.thumbnail}
            initial={{ opacity: 0, scale: 1.15 }}
            animate={{ opacity: 0.45, scale: 1.05 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            src={currentTrack.thumbnail}
            alt=""
            className="w-full h-full object-cover filter blur-2xl saturate-150 transform scale-110"
          />
        </div>
      )}

      {/* Desktop & Tablet Background Layer with Smooth Crossfade & Zoom */}
      <div id="desktop-bg-layer" className="hidden sm:block absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {desktopImages.map((imgUrl, index) => {
          const isActive = index === currentBgIndex;
          return (
            <img
              key={`${activeVisuals?.id || 'st'}-${index}`}
              src={imgUrl}
              alt={`${activeVisuals?.name || 'Viberr'} Scene ${index + 1}`}
              className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-all duration-1000 ease-in-out ${
                isActive
                  ? 'opacity-100 scale-100 filter-none'
                  : 'opacity-0 scale-105 filter blur-lg'
              }`}
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          );
        })}
      </div>

      {/* Mobile Background Layer */}
      <div id="mobile-bg-layer" className="block sm:hidden absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={currentTrack?.thumbnail || activeVisuals?.mobileBg || desktopImages[0] || '/backgrounds/retro_bollywood_lounge.jpg'}
          alt={activeVisuals?.name || 'Viberr'}
          className="w-full h-full object-cover pointer-events-none"
          loading="eager"
        />
      </div>

      {/* Atmospheric Scrim & Neon Ambient Mesh */}
      <div className="scrim-overlay z-10 pointer-events-none" />

      {/* Live Neon Particle & Waveform Audio Visualizer Canvas */}
      <AudioVisualizerCanvas
        isPlaying={isPlaying}
        color={activeColor}
        frequencies={frequencies}
        audioLevel={audioLevel}
      />

      {/* Left Navigation Zone (Desktop) */}
      {maxDesktop > 1 && (
        <div
          id="bg-nav-left"
          onClick={handlePrevBg}
          className="hidden sm:flex absolute top-0 left-0 w-[10vw] min-w-[70px] h-full z-20 items-center justify-start pl-6 cursor-pointer group transition-colors hover:bg-black/10 pointer-events-auto"
          title="Previous Scene (←)"
          aria-label="Previous Scene"
        >
          <motion.div 
            whileHover={{ scale: 1.15, x: -3 }}
            whileTap={{ scale: 0.9 }}
            className="relative flex items-center justify-center w-11 h-11 rounded-full text-white bg-black/40 backdrop-blur-xl border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-2xl hover:border-cyan-400/60"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </motion.div>
        </div>
      )}

      {/* Right Navigation Zone (Desktop) */}
      {maxDesktop > 1 && (
        <div
          id="bg-nav-right"
          onClick={handleNextBg}
          className="hidden sm:flex absolute top-0 right-0 w-[10vw] min-w-[70px] h-full z-20 items-center justify-end pr-6 cursor-pointer group transition-colors hover:bg-black/10 pointer-events-auto"
          title="Next Scene (→)"
          aria-label="Next Scene"
        >
          <motion.div 
            whileHover={{ scale: 1.15, x: 3 }}
            whileTap={{ scale: 0.9 }}
            className="relative flex items-center justify-center w-11 h-11 rounded-full text-white bg-black/40 backdrop-blur-xl border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-2xl hover:border-cyan-400/60"
          >
            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
          </motion.div>
        </div>
      )}

      {/* Foreground Content */}
      <div className="relative z-30 w-full flex-1 flex flex-col justify-center items-center p-2 sm:p-4 pointer-events-auto min-h-0">
        {children}
      </div>
    </div>
  );
}
