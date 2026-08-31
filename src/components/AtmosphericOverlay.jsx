import React, { useEffect, useRef } from 'react';

/**
 * AtmosphericOverlay
 * Live Open-Source Canvas Visual Effects:
 * 1. Procedural Falling Raindrops with velocity reacting to the beat
 * 2. 35mm Analog Film Grain & Retro Vignette Shader
 */
export default function AtmosphericOverlay({ 
  isRainEnabled, 
  isFilmGrainEnabled,
  isPlaying = false,
  audioLevel = 0
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!isRainEnabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const drops = [];
    const count = Math.min(90, Math.floor(window.innerWidth / 16));

    for (let i = 0; i < count; i++) {
      drops.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        len: 10 + Math.random() * 16,
        baseSpeed: 5 + Math.random() * 8,
        opacity: 0.12 + Math.random() * 0.25
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 1.2;

      // Speed multiplier: calm slow rainfall when idle, accelerating on beat energy
      const speedMultiplier = isPlaying ? 1.0 + (audioLevel / 200) : 0.6;

      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        ctx.beginPath();
        const currentOp = isPlaying ? Math.min(0.6, d.opacity + (audioLevel / 500)) : d.opacity;
        ctx.strokeStyle = `rgba(220, 240, 255, ${currentOp})`;
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - 2, d.y + d.len * (isPlaying ? 1.2 : 0.9));
        ctx.stroke();

        d.y += d.baseSpeed * speedMultiplier;
        d.x -= 0.6 * speedMultiplier;

        if (d.y > canvas.height) {
          d.y = -d.len;
          d.x = Math.random() * (canvas.width + 50);
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [isRainEnabled, isPlaying, audioLevel]);

  return (
    <>
      {/* Procedural Rain Canvas */}
      {isRainEnabled && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 pointer-events-none z-20 w-full h-full"
        />
      )}

      {/* 35mm Analog Film Grain Overlay */}
      {isFilmGrainEnabled && (
        <div 
          className="fixed inset-0 pointer-events-none z-20 opacity-30 mix-blend-overlay transition-opacity duration-300"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.7'/%3E%3C/svg%3E")`
          }}
        />
      )}
    </>
  );
}
