import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import { incrementAkshintalu, getAkshintalu } from '../utils/api';

/* ─── Rice Grain Particle System ─────────────────────────────── */
const GRAIN_COLORS = ['#D4A853', '#E8B930', '#F5E6CC', '#FF9933', '#F0D78C', '#C9952A'];
const GRAIN_COUNT = 80;

function createGrain(canvasWidth) {
  return {
    x: Math.random() * canvasWidth,
    y: -10 - Math.random() * 60,
    vx: (Math.random() - 0.5) * 2,
    vy: 1 + Math.random() * 2,
    width: 2 + Math.random() * 3,
    height: 5 + Math.random() * 6,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 8,
    color: GRAIN_COLORS[Math.floor(Math.random() * GRAIN_COLORS.length)],
    opacity: 0.7 + Math.random() * 0.3,
    gravity: 0.04 + Math.random() * 0.03,
    swayAmp: 0.3 + Math.random() * 0.5,
    swaySpeed: 0.02 + Math.random() * 0.03,
    time: Math.random() * 100,
  };
}

function useRiceShower() {
  const canvasRef = useRef(null);
  const grainsRef = useRef([]);
  const animFrameRef = useRef(null);
  const isAnimating = useRef(false);

  const startShower = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const w = canvas.offsetWidth;

    // Add new grains
    for (let i = 0; i < GRAIN_COUNT; i++) {
      grainsRef.current.push(createGrain(w));
    }

    if (isAnimating.current) return;
    isAnimating.current = true;

    function animate() {
      const grains = grainsRef.current;
      if (grains.length === 0) {
        isAnimating.current = false;
        ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
        return;
      }

      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      for (let i = grains.length - 1; i >= 0; i--) {
        const g = grains[i];

        // Physics
        g.vy += g.gravity;
        g.x += g.vx + Math.sin(g.time * g.swaySpeed) * g.swayAmp;
        g.y += g.vy;
        g.rotation += g.rotationSpeed;
        g.time += 1;

        // Fade out near bottom
        const canvasH = canvas.offsetHeight;
        if (g.y > canvasH * 0.75) {
          g.opacity -= 0.015;
        }

        // Remove off-screen or invisible
        if (g.y > canvasH + 20 || g.opacity <= 0) {
          grains.splice(i, 1);
          continue;
        }

        // Draw grain (oval shape)
        ctx.save();
        ctx.translate(g.x, g.y);
        ctx.rotate((g.rotation * Math.PI) / 180);
        ctx.globalAlpha = g.opacity;
        ctx.fillStyle = g.color;
        ctx.shadowColor = g.color;
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.ellipse(0, 0, g.width / 2, g.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(animate);
    }

    animate();
  }, []);

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return { canvasRef, startShower };
}

export default function Akshintalu() {
  const [count, setCount] = useState(0);
  const [showBurst, setShowBurst] = useState(false);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const { canvasRef, startShower } = useRiceShower();

  // Fetch initial count
  useEffect(() => {
    getAkshintalu()
      .then(data => setCount(data.count || 0))
      .catch(() => {});
  }, []);

  const handleShower = async () => {
    startShower();
    setShowBurst(true);
    setTimeout(() => setShowBurst(false), 600);

    try {
      const data = await incrementAkshintalu();
      setCount(data.count || count + 1);
    } catch {
      setCount(prev => prev + 1);
    }
  };

  return (
    <section className="akshintalu section" id="blessings" ref={sectionRef}>
      {/* Canvas overlay for rice particles */}
      <canvas
        ref={canvasRef}
        className="akshintalu__canvas"
      />

      <motion.div
        className="section__container akshintalu__content"
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="section__header">
          <h2 className="section__title">Akshintalu</h2>
          <p className="section__subtitle">Sacred Rice Blessings</p>
          <div className="section__ornament">
            <span className="section__ornament-dot" />
          </div>
        </div>

        <div className="akshintalu__description">
          <p>
            In Telugu weddings, <em>Akshintalu</em> (అక్షింతలు) — sacred rice grains mixed with
            turmeric — are showered on the couple as a divine blessing. Each grain carries
            wishes of prosperity, love, and eternal togetherness.
          </p>
          <p style={{ marginTop: 'var(--space-md)' }}>
            Shower your blessings upon us and be a part of this sacred tradition.
          </p>
        </div>

        {/* Shower button */}
        <div className="akshintalu__action">
          <motion.button
            className="akshintalu__btn"
            onClick={handleShower}
            whileTap={{ scale: 0.95 }}
            animate={showBurst ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <span className="akshintalu__btn-glow" />
            <span className="akshintalu__btn-content">
              <span className="akshintalu__btn-emoji">🌾</span>
              <span className="akshintalu__btn-text">Shower Your Blessings</span>
            </span>
          </motion.button>
        </div>

        {/* Counter */}
        <motion.div
          className="akshintalu__counter"
          key={count}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <span className="akshintalu__count">{count.toLocaleString()}</span>
          <span className="akshintalu__count-label">blessings showered so far</span>
        </motion.div>

        {/* Decorative mandala */}
        <div className="akshintalu__mandala">
          <svg viewBox="0 0 120 120" className="akshintalu__mandala-svg">
            <circle cx="60" cy="60" r="55" fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.2" />
            <circle cx="60" cy="60" r="45" fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.15" />
            <circle cx="60" cy="60" r="35" fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.1" />
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(angle => (
              <line
                key={angle}
                x1={60 + 35 * Math.cos((angle * Math.PI) / 180)}
                y1={60 + 35 * Math.sin((angle * Math.PI) / 180)}
                x2={60 + 55 * Math.cos((angle * Math.PI) / 180)}
                y2={60 + 55 * Math.sin((angle * Math.PI) / 180)}
                stroke="currentColor"
                strokeWidth="0.3"
                opacity="0.15"
              />
            ))}
          </svg>
        </div>
      </motion.div>

      <style>{`
        .akshintalu {
          position: relative;
          background: var(--gradient-hero);
          min-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .akshintalu__canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 10;
        }

        .akshintalu__content {
          text-align: center;
          position: relative;
          z-index: 5;
        }

        .akshintalu__description {
          max-width: 550px;
          margin: 0 auto var(--space-3xl);
        }

        .akshintalu__description p {
          font-family: var(--font-heading);
          font-size: 1.1rem;
          color: var(--text-secondary);
          line-height: 1.8;
          text-align: center;
          max-width: none;
        }

        .akshintalu__description em {
          color: var(--color-gold);
          font-style: italic;
        }

        /* ─── The Magic Button ─── */
        .akshintalu__action {
          margin-bottom: var(--space-3xl);
        }

        .akshintalu__btn {
          position: relative;
          padding: var(--space-xl) var(--space-4xl);
          background: var(--gradient-gold);
          border: none;
          border-radius: var(--radius-full);
          cursor: pointer;
          overflow: hidden;
          transition: all var(--transition-base);
          animation: glow-pulse 3s ease-in-out infinite;
        }

        .akshintalu__btn:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 0 50px rgba(212, 168, 83, 0.4), 0 0 100px rgba(212, 168, 83, 0.2);
        }

        .akshintalu__btn:active {
          transform: translateY(-1px) scale(0.98);
        }

        .akshintalu__btn-glow {
          position: absolute;
          inset: -2px;
          border-radius: inherit;
          background: var(--gradient-gold);
          filter: blur(15px);
          opacity: 0.4;
          z-index: 0;
        }

        .akshintalu__btn-content {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .akshintalu__btn-emoji {
          font-size: 1.8rem;
          line-height: 1;
        }

        .akshintalu__btn-text {
          font-family: var(--font-heading);
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--text-on-gold);
          letter-spacing: 0.05em;
        }

        /* Counter */
        .akshintalu__counter {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-sm);
        }

        .akshintalu__count {
          font-family: var(--font-display);
          font-size: 3rem;
          font-weight: 700;
          color: var(--color-gold);
          text-shadow: 0 0 30px rgba(212, 168, 83, 0.3);
          line-height: 1;
        }

        .akshintalu__count-label {
          font-family: var(--font-heading);
          font-size: 1rem;
          color: var(--text-tertiary);
          font-style: italic;
          letter-spacing: 0.1em;
        }

        /* Background mandala */
        .akshintalu__mandala {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 400px;
          height: 400px;
          pointer-events: none;
          z-index: 0;
          animation: rotate 60s linear infinite;
        }

        .akshintalu__mandala-svg {
          width: 100%;
          height: 100%;
          color: var(--color-gold);
          opacity: 0.3;
        }

        @media (max-width: 768px) {
          .akshintalu__btn {
            padding: var(--space-lg) var(--space-2xl);
          }
          .akshintalu__btn-text {
            font-size: 1rem;
          }
          .akshintalu__count {
            font-size: 2.5rem;
          }
          .akshintalu__mandala {
            width: 280px;
            height: 280px;
          }
        }
      `}</style>
    </section>
  );
}
