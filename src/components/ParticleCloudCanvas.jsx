import React, { useRef, useEffect } from 'react';

/**
 * ParticleCloudCanvas
 * Replicates the Atlantic.vc signature particle-cloud / constellation visualizer:
 * Renders thousands of subtle points (champagne / cyan) in organic wave formations
 * on the dark canvas, reacting smoothly to audio play status and cursor position.
 */
export default function ParticleCloudCanvas({ isPlaying = false, accentColor = '#cfc6b0', className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = canvas.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.offsetHeight || window.innerHeight);
    let rect = canvas.getBoundingClientRect();

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || window.innerWidth;
      height = canvas.height = canvas.offsetHeight || window.innerHeight;
      rect = canvas.getBoundingClientRect();
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('scroll', handleResize, { passive: true });

    // Optimal particle count for smooth 60+ FPS with zero main-thread lag
    const PARTICLE_COUNT = Math.min(50, Math.max(25, Math.floor(width / 24)));
    const particles = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        baseY: Math.random() * height,
        radius: Math.random() * 1.2 + 0.6,
        speed: (Math.random() * 0.35 + 0.1) * (isPlaying ? 1.3 : 0.6),
        phase: Math.random() * Math.PI * 2,
        amplitude: Math.random() * 20 + 8,
        alpha: Math.random() * 0.35 + 0.15,
        isAccent: Math.random() > 0.8
      });
    }

    let time = 0;
    let mouseX = width / 2;
    let mouseY = height / 2;

    // Cache rect and avoid getBoundingClientRect on every mouse move (prevents forced reflow)
    const handleMouseMove = (e) => {
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const render = () => {
      time += isPlaying ? 0.012 : 0.005;
      ctx.clearRect(0, 0, width, height);

      // Single batched path for lines
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(207, 198, 176, 0.06)';
      ctx.lineWidth = 0.8;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.speed;
        if (p.x > width + 20) p.x = -20;
        p.y = p.baseY + Math.sin(time + p.phase + p.x * 0.004) * p.amplitude;

        // Proximity repulsion
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const distSq = dx * dx + dy * dy;
        if (distSq < 6400) { // 80px distance
          const dist = Math.sqrt(distSq);
          const force = (80 - dist) / 80;
          p.x += (dx / dist) * force * 1.2;
          p.y += (dy / dist) * force * 1.2;
        }

        // Connect close neighbor particles in batched single stroke
        if (p.x >= 0 && p.x <= width && p.y >= 0 && p.y <= height) {
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            if (p2.x >= 0 && p2.x <= width && p2.y >= 0 && p2.y <= height) {
              const dX = p.x - p2.x;
              const dY = p.y - p2.y;
              if (Math.abs(dX) < 45 && Math.abs(dY) < 45) {
                const dist2 = Math.hypot(dX, dY);
                if (dist2 < 45) {
                  ctx.moveTo(p.x, p.y);
                  ctx.lineTo(p2.x, p2.y);
                }
              }
            }
          }
        }
      }
      ctx.stroke();

      // Render particles in 2 clean passes (regular + accent) to minimize draw calls
      ctx.beginPath();
      ctx.fillStyle = 'rgba(250, 248, 245, 0.3)';
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (!p.isAccent) {
          ctx.moveTo(p.x + p.radius, p.y);
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        }
      }
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = isPlaying ? 'rgba(0, 240, 255, 0.65)' : 'rgba(207, 198, 176, 0.5)';
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.isAccent) {
          ctx.moveTo(p.x + p.radius * 1.3, p.y);
          ctx.arc(p.x, p.y, p.radius * 1.3, 0, Math.PI * 2);
        }
      }
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isPlaying, accentColor]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 w-full h-full ${className}`}
      style={{ opacity: 0.8 }}
    />
  );
}
