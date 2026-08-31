import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

export default function StationHero({ station, isPlaying }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center my-auto py-2 text-center max-w-4xl px-3 pointer-events-none transition-all duration-700">
      <motion.div
        key={station.id}
        initial={{ opacity: 0, y: 12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.98 }}
        transition={{ 
          type: 'spring',
          damping: 24,
          stiffness: 260,
          mass: 0.8
        }}
        className="relative w-full max-w-[92vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl px-2 flex flex-col items-center justify-center pointer-events-none"
      >
        {/* Cyberpunk Telemetry Top Pill */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mb-2 sm:mb-3 inline-flex items-center gap-2 sm:gap-2.5 px-3.5 sm:px-4 py-1 rounded-full glass-pill border border-white/20 shadow-xl"
        >
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full animate-ping"
              style={{ backgroundColor: station?.color || '#00f0ff' }}
            />
            <span
              className="w-2 h-2 rounded-full -ml-3.5"
              style={{ backgroundColor: station?.color || '#00f0ff' }}
            />
          </div>

          <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-widest text-white/90 uppercase truncate max-w-[220px] sm:max-w-none">
            [ ON AIR // {station?.name} ]
          </span>

          <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-white/45 pl-2 border-l border-white/15">
            <span className="flex items-center gap-1 text-emerald-400">
              <Activity className="w-3 h-3 animate-pulse" />
              <span>320 KBPS</span>
            </span>
            <span>•</span>
            <span>48.0 KHZ</span>
          </div>
        </motion.div>

        {/* Hero Station Title / Graphic */}
        {station?.heroLogo && !imgError ? (
          <motion.img
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            src={station.heroLogo}
            alt={station.name}
            onError={() => setImgError(true)}
            className="w-auto max-h-[110px] sm:max-h-[160px] md:max-h-[200px] lg:max-h-[240px] object-contain drop-shadow-[0_18px_40px_rgba(0,0,0,0.95)] select-none transition-transform duration-700"
            loading="eager"
          />
        ) : (
          <div className="flex flex-col items-center gap-1.5 w-full">
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-syne tracking-normal neon-title-glow leading-normal text-white drop-shadow-[0_10px_35px_rgba(0,0,0,0.85)] py-1 max-w-full px-2"
            >
              {station?.heroTitle || station?.name}
            </motion.h1>
            {station?.tagline && (
              <motion.p 
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="text-xs sm:text-sm md:text-base text-white/80 font-space font-normal tracking-wide drop-shadow-xl max-w-xl"
              >
                {station.tagline}
              </motion.p>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
