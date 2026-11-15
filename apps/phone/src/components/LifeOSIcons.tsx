import React, { useEffect, useRef } from 'react';

export const DottedOrbIcon: React.FC<{ className?: string; size?: number; spinning?: boolean }> = ({
  className = '',
  size = 18,
  spinning = false,
}) => {
  const dots = Array.from({ length: 8 }, (_, idx) => {
    const angle = (idx * Math.PI * 2) / 8 - Math.PI / 2;
    const r = 6.2;
    const cx = 10 + r * Math.cos(angle);
    const cy = 10 + r * Math.sin(angle);
    const radius = idx % 2 === 0 ? 1.55 : 1.15;
    return <circle key={idx} cx={cx} cy={cy} r={radius} fill="currentColor" />;
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      className={`${spinning ? 'animate-spin-slow' : ''} ${className}`}
      aria-hidden="true"
    >
      {dots}
    </svg>
  );
};

export const SwirlRingIcon: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 24,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 28 28"
    fill="none"
    className={className}
    aria-hidden="true"
  >
    <ellipse
      cx="14"
      cy="14"
      rx="9.5"
      ry="5.2"
      transform="rotate(-24 14 14)"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeOpacity="0.5"
    />
    <ellipse
      cx="14.5"
      cy="13.5"
      rx="7.5"
      ry="4.8"
      transform="rotate(14 14.5 13.5)"
      stroke="currentColor"
      strokeWidth="1.15"
      strokeOpacity="0.35"
    />
    <circle cx="19.5" cy="10" r="1.4" fill="currentColor" fillOpacity="0.55" />
  </svg>
);

export const DualDotAgentIcon: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 16,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 18 18"
    fill="none"
    className={className}
    aria-hidden="true"
  >
    <circle cx="7.5" cy="8.5" r="4.3" fill="currentColor" />
    <circle cx="13.2" cy="12.2" r="2.1" fill="currentColor" />
  </svg>
);

export const ParticleCloudCanvas: React.FC<{ active?: boolean }> = ({ active = true }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = 90;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    // Pre-generate spherical Fibonacci-like constellation points
    const count = 110;
    const particles = Array.from({ length: count }, (_, i) => {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      return {
        phi,
        theta,
        jitter: (i % 7) * 0.14,
        radius: 0.65 + (i % 4) * 0.28,
      };
    });

    let animId = 0;
    let t = 0;

    const render = () => {
      t += active ? 0.018 : 0.005;
      ctx.clearRect(0, 0, size, size);

      const cx = size / 2;
      const cy = size / 2;
      const R = 30;

      for (const p of particles) {
        const theta = p.theta + t;
        const rPulse = R * (0.9 + 0.1 * Math.sin(t * 2 + p.jitter));
        const x3 = rPulse * Math.sin(p.phi) * Math.cos(theta);
        const y3 = rPulse * Math.cos(p.phi) * 0.88;
        const z3 = rPulse * Math.sin(p.phi) * Math.sin(theta);

        const depth = (z3 + R) / (2 * R); // 0..1
        const alpha = 0.12 + depth * 0.78;
        ctx.beginPath();
        ctx.arc(cx + x3, cy + y3, p.radius * (0.6 + depth * 0.55), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(2)})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [active]);

  return <canvas ref={canvasRef} className="h-[68px] w-[68px]" />;
};
