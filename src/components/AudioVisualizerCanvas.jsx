import React, { useEffect, useRef } from 'react';

/**
 * Organic Beat-Reactive Particle & Dynamic Waveform Canvas
 * Physics model:
 *  - Calm, tranquil stardust drift & serene breathing wave when idle/before play.
 *  - On music transients & rhythm beats, waves accelerate & particles scatter dynamically.
 */
export default function AudioVisualizerCanvas({
  isPlaying,
  color = '#00f0ff',
  frequencies = [],
  audioLevel = 0
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);

    const handleResize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    window.addEventListener('resize', handleResize);

    const w = window.innerWidth;
    const h = window.innerHeight;
    const particleCount = w < 768 ? 32 : 55;

    // Initialize particles with calm drift
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      baseVx: (Math.random() - 0.5) * 0.18,
      baseVy: (Math.random() - 0.5) * 0.18,
      scatterVx: 0,
      scatterVy: 0,
      radius: Math.random() * 1.8 + 1.0,
      opacity: Math.random() * 0.35 + 0.15,
      pulsePhase: Math.random() * Math.PI * 2
    }));

    let lastKickTime = 0;
    let wavePhase = 0;

    const render = () => {
      const curW = window.innerWidth;
      const curH = window.innerHeight;
      ctx.clearRect(0, 0, curW, curH);

      const now = Date.now();
      // Detect beat kick / audio energy peak when music is active
      const isPeak = isPlaying && audioLevel > 120 && now - lastKickTime > 400;
      if (isPeak) {
        lastKickTime = now;
        // Scatter particles in random radial directions on beat kick
        particles.forEach((p) => {
          const angle = Math.random() * Math.PI * 2;
          const force = (Math.random() * 3.0 + 1.2) * (audioLevel / 150);
          p.scatterVx = Math.cos(angle) * force;
          p.scatterVy = Math.sin(angle) * force;
        });
      }

      // Render Particles with organic physics & damping
      particles.forEach((p) => {
        // Friction damping brings velocity back to calm
        p.scatterVx *= 0.93;
        p.scatterVy *= 0.93;

        // Position update - calm slow drift when idle, energetic when playing
        p.x += p.baseVx + p.scatterVx;
        p.y += p.baseVy + p.scatterVy;
        p.pulsePhase += isPlaying ? 0.02 + (audioLevel / 4000) : 0.006;

        // Toroidal screen wrap
        if (p.x < 0) p.x = curW;
        if (p.x > curW) p.x = 0;
        if (p.y < 0) p.y = curH;
        if (p.y > curH) p.y = 0;

        const currentOpacity = Math.max(
          0.08,
          Math.min(0.85, p.opacity + Math.sin(p.pulsePhase) * 0.2 + (isPlaying ? audioLevel / 450 : 0))
        );

        const currentRadius = p.radius + (Math.abs(p.scatterVx) + Math.abs(p.scatterVy)) * 0.35;

        ctx.beginPath();
        ctx.arc(p.x, p.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = currentOpacity;
        ctx.shadowBlur = isPlaying ? 8 + (audioLevel / 22) : 3;
        ctx.shadowColor = color;
        ctx.fill();
      });

      // Render Harmonic Waveform (Serene calm wave when idle, beat-synchronized when playing)
      const waveSpeed = isPlaying ? 0.018 + (audioLevel / 3500) : 0.005;
      wavePhase += waveSpeed;
      const freqLen = frequencies.length || 32;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, curH - 120);

      const step = curW < 768 ? 20 : 14;
      for (let x = 0; x <= curW; x += step) {
        const freqIndex = Math.floor((x / curW) * freqLen) % freqLen;
        const freqValue = isPlaying ? (frequencies[freqIndex] || 0) / 255 : 0.05;

        // Wave amplitude adapts to music energy; calm minimal 6px wave when idle
        const ampPrimary = isPlaying ? 16 + freqValue * 40 : 6;
        const ampSecondary = isPlaying ? 10 + freqValue * 22 : 4;

        const y =
          curH - 120 +
          Math.sin(x * 0.005 + wavePhase) * ampPrimary +
          Math.cos(x * 0.01 - wavePhase * 0.8) * ampSecondary;

        ctx.lineTo(x, y);
      }

      ctx.strokeStyle = color;
      ctx.globalAlpha = isPlaying ? 0.35 : 0.18;
      ctx.lineWidth = isPlaying ? 2.2 : 1.4;
      ctx.shadowBlur = isPlaying ? 16 : 6;
      ctx.shadowColor = color;
      ctx.stroke();
      ctx.restore();

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, color, frequencies, audioLevel]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10 w-full h-full"
    />
  );
}
