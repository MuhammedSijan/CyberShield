import React, { useEffect, useRef } from 'react';

export const CyberBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Keep track of theme (read from classList on body/document)
    let isDark = document.documentElement.classList.contains('dark');

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };

    window.addEventListener('resize', handleResize);

    // Monitor dark class modifications
    const observer = new MutationObserver(() => {
      isDark = document.documentElement.classList.contains('dark');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      pulse: number;
      pulseDir: number;
    }

    interface Packet {
      from: number;
      to: number;
      progress: number;
      speed: number;
    }

    interface AmbientLight {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }

    let particles: Particle[] = [];
    let packets: Packet[] = [];
    let lights: AmbientLight[] = [];
    let gridOffset = 0;
    let frameCount = 0;

    // Load configs from local storage
    let drawParticlesSetting = localStorage.getItem('cfg_bg_particle') !== 'false';
    let drawGridSetting = localStorage.getItem('cfg_bg_grid') !== 'false';
    let isPerfSetting = localStorage.getItem('cfg_perf') === 'true';

    const maxParticles = Math.min(isPerfSetting ? 30 : 60, Math.floor((width * height) / 28000));

    const initParticles = () => {
      particles = [];
      packets = [];
      lights = [];

      // Initialize nodes
      for (let i = 0; i < maxParticles; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * (isPerfSetting ? 0.08 : 0.16),
          vy: (Math.random() - 0.5) * (isPerfSetting ? 0.08 : 0.16),
          radius: Math.random() * 1.5 + 1.2,
          pulse: 0.9 + Math.random() * 0.2,
          pulseDir: Math.random() > 0.5 ? 0.01 : -0.01
        });
      }

      // Initialize Ambient Lights
      for (let j = 0; j < 3; j++) {
        lights.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          radius: Math.random() * 120 + 180
        });
      }
    };

    initParticles();

    const handleSettingsUpdate = () => {
      drawParticlesSetting = localStorage.getItem('cfg_bg_particle') !== 'false';
      drawGridSetting = localStorage.getItem('cfg_bg_grid') !== 'false';
      isPerfSetting = localStorage.getItem('cfg_perf') === 'true';
    };
    window.addEventListener('settings-update', handleSettingsUpdate);
    window.addEventListener('storage', handleSettingsUpdate);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Read config update triggers periodically (every 1 second)
      frameCount++;
      if (frameCount % 60 === 0) {
        drawParticlesSetting = localStorage.getItem('cfg_bg_particle') !== 'false';
        drawGridSetting = localStorage.getItem('cfg_bg_grid') !== 'false';
        isPerfSetting = localStorage.getItem('cfg_perf') === 'true';
      }

      // 2. Draw Soft Ambient Glow Spots (Dark mode only)
      if (isDark && !isPerfSetting) {
        lights.forEach(l => {
          l.x += l.vx;
          l.y += l.vy;

          if (l.x < 0 || l.x > width) l.vx *= -1;
          if (l.y < 0 || l.y > height) l.vy *= -1;

          const glowGrad = ctx.createRadialGradient(l.x, l.y, 10, l.x, l.y, l.radius);
          glowGrad.addColorStop(0, 'rgba(37, 99, 235, 0.02)');
          glowGrad.addColorStop(1, 'rgba(37, 99, 235, 0)');

          ctx.beginPath();
          ctx.arc(l.x, l.y, l.radius, 0, Math.PI * 2);
          ctx.fillStyle = glowGrad;
          ctx.fill();
        });
      }

      // 3. Draw Faint Grid Lines (Dark mode vs Light mode offsets)
      if (drawGridSetting) {
        gridOffset += isPerfSetting ? 0.08 : 0.15;
        ctx.strokeStyle = isDark ? 'rgba(37, 99, 235, 0.015)' : 'rgba(37, 99, 235, 0.008)';
        ctx.lineWidth = 0.5;

        const gridSize = 65;
        const offsetX = gridOffset % gridSize;
        const offsetY = gridOffset % gridSize;

        for (let x = offsetX; x < width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = offsetY; y < height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
      }

      // 4. Update and Draw Particles Network
      if (drawParticlesSetting) {
        const dotColorBase = isDark ? 'rgba(37, 99, 235, 0.2)' : 'rgba(37, 99, 235, 0.08)';

        particles.forEach((p, index) => {
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;

          // Pulse dot size (safe)
          p.pulse += p.pulseDir;

          if (p.pulse > 1.2) {
            p.pulse = 1.2;
            p.pulseDir = -Math.abs(p.pulseDir);
          }

          if (p.pulse < 0.8) {
            p.pulse = 0.8;
            p.pulseDir = Math.abs(p.pulseDir);
          }

          // Render Particle (safe radius)
          const particleRadius = Math.max(0.5, p.radius * p.pulse);

          ctx.beginPath();
          ctx.arc(p.x, p.y, particleRadius, 0, Math.PI * 2);
          ctx.fillStyle = dotColorBase;
          ctx.fill();

          // Connect Network Lines with distance-based alpha opacity
          for (let j = index + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 140) {
              const alphaFactor = (1 - dist / 140) * (isDark ? 0.05 : 0.025);
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(37, 99, 235, ${alphaFactor})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();

              // Spawn packets randomly between connected nodes
              if (!isPerfSetting && packets.length < 5 && Math.random() < 0.00015) {
                packets.push({
                  from: index,
                  to: j,
                  progress: 0,
                  speed: Math.random() * 0.008 + 0.004
                });
              }
            }
          }
        });

        // 5. Draw Sliding Data Packets
        if (!isPerfSetting) {
          packets = packets.filter(pkt => {
            pkt.progress += pkt.speed;

            const start = particles[pkt.from];
            const end = particles[pkt.to];

            if (start && end && pkt.progress < 1) {
              const px = start.x + (end.x - start.x) * pkt.progress;
              const py = start.y + (end.y - start.y) * pkt.progress;

              ctx.beginPath();
              ctx.arc(px, py, 1.8, 0, Math.PI * 2);
              ctx.fillStyle = isDark ? 'rgba(96, 165, 250, 0.65)' : 'rgba(37, 99, 235, 0.45)';
              ctx.fill();
              return true;
            }
            return false;
          });
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('settings-update', handleSettingsUpdate);
      window.removeEventListener('storage', handleSettingsUpdate);
      observer.disconnect();
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 bg-transparent transition-opacity duration-500"
    />
  );
};
export default CyberBackground;