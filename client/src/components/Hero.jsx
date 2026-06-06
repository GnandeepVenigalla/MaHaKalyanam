import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSiteData } from '../context/SiteContext';

// Format date string like '2026-08-24' to 'August 24, 2026'
function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

// ─── Animation Variants ─────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.25, delayChildren: 0.3 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
};

const scaleFade = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1, transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] } },
};

// ─── Flower Petal Particle System ────────────────────────────
// Indian wedding flowers: rose, marigold, jasmine, lotus
const PETAL_TYPES = [
  // Rose petals (various pinks/reds)
  { color: '#FF6B8A', shadow: '#FF3366', shape: 'rose' },
  { color: '#FF8FAB', shadow: '#FF5C85', shape: 'rose' },
  { color: '#E84D6E', shadow: '#CC3355', shape: 'rose' },
  // Marigold (orange/yellow - auspicious)
  { color: '#FFA500', shadow: '#FF8C00', shape: 'marigold' },
  { color: '#FFB833', shadow: '#E69500', shape: 'marigold' },
  { color: '#FFD700', shadow: '#DAA520', shape: 'marigold' },
  // Jasmine (white/cream)
  { color: '#FFFAED', shadow: '#F5E6CC', shape: 'jasmine' },
  { color: '#FFF5DC', shadow: '#EEE0C0', shape: 'jasmine' },
  // Lotus (pink/magenta)
  { color: '#FF69B4', shadow: '#DB3E8C', shape: 'lotus' },
  { color: '#FF85C2', shadow: '#E660A0', shape: 'lotus' },
];

function createPetal(canvasWidth, canvasHeight) {
  const type = PETAL_TYPES[Math.floor(Math.random() * PETAL_TYPES.length)];
  return {
    x: Math.random() * canvasWidth,
    y: -20 - Math.random() * 100,
    vx: (Math.random() - 0.5) * 1.5,
    vy: 0.5 + Math.random() * 1.5,
    size: 6 + Math.random() * 10,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 4,
    swayAmp: 0.8 + Math.random() * 1.5,
    swayFreq: 0.01 + Math.random() * 0.02,
    time: Math.random() * 200,
    opacity: 0.6 + Math.random() * 0.4,
    color: type.color,
    shadow: type.shadow,
    shape: type.shape,
    gravity: 0.01 + Math.random() * 0.015,
    life: 0,
    maxLife: 400 + Math.random() * 300,
  };
}

function drawPetal(ctx, petal) {
  ctx.save();
  ctx.translate(petal.x, petal.y);
  ctx.rotate((petal.rotation * Math.PI) / 180);
  ctx.globalAlpha = petal.opacity;

  const s = petal.size;

  // Soft glow
  ctx.shadowColor = petal.shadow;
  ctx.shadowBlur = 6;

  ctx.fillStyle = petal.color;

  if (petal.shape === 'rose') {
    // Rose petal — teardrop shape
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.6);
    ctx.bezierCurveTo(s * 0.5, -s * 0.4, s * 0.5, s * 0.3, 0, s * 0.6);
    ctx.bezierCurveTo(-s * 0.5, s * 0.3, -s * 0.5, -s * 0.4, 0, -s * 0.6);
    ctx.fill();
    // Vein
    ctx.strokeStyle = petal.shadow;
    ctx.lineWidth = 0.3;
    ctx.globalAlpha = petal.opacity * 0.3;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.4);
    ctx.lineTo(0, s * 0.4);
    ctx.stroke();
  } else if (petal.shape === 'marigold') {
    // Marigold — small round petal
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.35, s * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Inner detail
    ctx.fillStyle = petal.shadow;
    ctx.globalAlpha = petal.opacity * 0.25;
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.15, s * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (petal.shape === 'jasmine') {
    // Jasmine — small 5-petal star flower
    const petals = 5;
    ctx.beginPath();
    for (let i = 0; i < petals; i++) {
      const angle = (i * 2 * Math.PI) / petals - Math.PI / 2;
      const px = Math.cos(angle) * s * 0.35;
      const py = Math.sin(angle) * s * 0.35;
      ctx.moveTo(0, 0);
      ctx.arc(px, py, s * 0.2, 0, Math.PI * 2);
    }
    ctx.fill();
    // Yellow center
    ctx.fillStyle = '#FFD700';
    ctx.globalAlpha = petal.opacity * 0.6;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.1, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Lotus — pointed petal
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.7);
    ctx.quadraticCurveTo(s * 0.4, -s * 0.2, s * 0.3, s * 0.3);
    ctx.quadraticCurveTo(0, s * 0.5, -s * 0.3, s * 0.3);
    ctx.quadraticCurveTo(-s * 0.4, -s * 0.2, 0, -s * 0.7);
    ctx.fill();
  }

  ctx.restore();
}

function usePetalShower() {
  const canvasRef = useRef(null);
  const petalsRef = useRef([]);
  const animFrameRef = useRef(null);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;

    ctx.clearRect(0, 0, w * window.devicePixelRatio, h * window.devicePixelRatio);

    const petals = petalsRef.current;

    // Continuously add petals (gentle shower)
    if (petals.length < 50 && Math.random() < 0.15) {
      petals.push(createPetal(w, h));
    }

    for (let i = petals.length - 1; i >= 0; i--) {
      const p = petals[i];

      // Physics
      p.vy += p.gravity;
      p.x += p.vx + Math.sin(p.time * p.swayFreq) * p.swayAmp;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      p.time += 1;
      p.life += 1;

      // Fade near bottom
      if (p.y > h * 0.8) {
        p.opacity -= 0.008;
      }

      // Remove if out of bounds or faded
      if (p.y > h + 30 || p.opacity <= 0 || p.life > p.maxLife) {
        petals.splice(i, 1);
        continue;
      }

      drawPetal(ctx, p);
    }

    animFrameRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // Start animation after hero loads
    const timer = setTimeout(() => {
      animate();
    }, 1500);

    return () => {
      window.removeEventListener('resize', resize);
      clearTimeout(timer);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [animate]);

  return canvasRef;
}

// ─── Hero Component ──────────────────────────────────────────
export default function Hero() {
  const petalCanvasRef = usePetalShower();
  const { content } = useSiteData();
  const weddingDate = formatDate(content.wedding_date);

  return (
    <section className="hero" id="home">
      {/* Divine petal shower canvas */}
      <canvas
        ref={petalCanvasRef}
        className="hero__petals-canvas"
      />

      {/* Sparkle particles */}
      <div className="hero__particles">
        {Array.from({ length: 20 }).map((_, i) => (
          <span
            key={i}
            className="hero__sparkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Floating divine blessing emojis */}
      <div className="hero__blessings">
        {['🪷', '🌸', '🌺', '💐', '🌼', '🪻'].map((emoji, i) => (
          <span
            key={i}
            className="hero__blessing-flower"
            style={{
              left: `${10 + i * 15}%`,
              animationDelay: `${i * 0.8 + 1.5}s`,
              animationDuration: `${6 + Math.random() * 4}s`,
            }}
          >
            {emoji}
          </span>
        ))}
      </div>

      <motion.div
        className="hero__content"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Sacred invocation */}
        <motion.div className="hero__sacred" variants={fadeUp}>
          <span className="hero__om">ॐ</span>
          <p className="hero__invocation">Sri Ganeshaya Namaha</p>
        </motion.div>

        {/* Decorative flourish */}
        <motion.div className="hero__flourish" variants={fadeUp}>
          <svg viewBox="0 0 200 20" className="hero__flourish-svg">
            <path d="M0,10 Q50,0 100,10 Q150,20 200,10" stroke="currentColor" fill="none" strokeWidth="0.5" />
            <circle cx="100" cy="10" r="3" fill="currentColor" />
            <circle cx="80" cy="8" r="1.5" fill="currentColor" opacity="0.6" />
            <circle cx="120" cy="12" r="1.5" fill="currentColor" opacity="0.6" />
          </svg>
        </motion.div>

        {/* Blessing text */}
        <motion.p className="hero__blessing-text" variants={fadeUp}>
          ✦ Divine Blessings ✦
        </motion.p>

        {/* Couple names — petals fall around these */}
        <motion.h1 className="hero__names" variants={scaleFade}>
          <span className="hero__name">{content.groom_name || 'Ranjith'}</span>
          <span className="hero__ampersand">&</span>
          <span className="hero__name">{content.bride_name || 'Nithaya'}</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p className="hero__subtitle" variants={fadeUp}>
          are getting married
        </motion.p>

        {/* Date */}
        <motion.div className="hero__date-wrapper" variants={fadeUp}>
          <div className="hero__date-line" />
          <p className="hero__date">{weddingDate}</p>
          <div className="hero__date-line" />
        </motion.div>

        {/* Hashtag */}
        <motion.p className="hero__hashtag" variants={fadeUp}>
          #MaHaKalyanam
        </motion.p>

        {/* Bottom flourish */}
        <motion.div className="hero__flourish hero__flourish--bottom" variants={fadeUp}>
          <svg viewBox="0 0 200 20" className="hero__flourish-svg">
            <path d="M0,10 Q50,20 100,10 Q150,0 200,10" stroke="currentColor" fill="none" strokeWidth="0.5" />
            <circle cx="100" cy="10" r="3" fill="currentColor" />
          </svg>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="hero__scroll"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 1 }}
      >
        <span className="hero__scroll-text">Scroll</span>
        <div className="hero__scroll-line">
          <div className="hero__scroll-dot" />
        </div>
      </motion.div>

      <style>{`
        .hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: var(--gradient-hero);
          overflow: hidden;
          padding: var(--space-2xl);
        }

        .hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(1px 1px at 20% 30%, rgba(212,168,83,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 80% 70%, rgba(212,168,83,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 50% 50%, rgba(212,168,83,0.2) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 10% 80%, rgba(212,168,83,0.3) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 90% 20%, rgba(212,168,83,0.3) 0%, transparent 100%);
          pointer-events: none;
        }

        /* ─── Divine Petal Shower Canvas ─── */
        .hero__petals-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 3;
        }

        /* ─── Floating Blessing Flowers ─── */
        .hero__blessings {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 4;
          overflow: hidden;
        }

        .hero__blessing-flower {
          position: absolute;
          top: -40px;
          font-size: 1.8rem;
          opacity: 0;
          animation: blessingFloat ease-in-out infinite;
          filter: drop-shadow(0 0 8px rgba(255, 105, 180, 0.4));
        }

        @keyframes blessingFloat {
          0% {
            opacity: 0;
            transform: translateY(-20px) rotate(0deg) scale(0.6);
          }
          10% {
            opacity: 0.8;
            transform: translateY(0) scale(1);
          }
          50% {
            opacity: 0.6;
            transform: translateY(40vh) rotate(180deg) translateX(30px) scale(0.9);
          }
          80% {
            opacity: 0.3;
            transform: translateY(70vh) rotate(300deg) translateX(-20px) scale(0.7);
          }
          100% {
            opacity: 0;
            transform: translateY(95vh) rotate(360deg) scale(0.4);
          }
        }

        /* ─── Sparkle particles ─── */
        .hero__particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .hero__sparkle {
          position: absolute;
          width: 3px;
          height: 3px;
          background: var(--color-gold);
          border-radius: 50%;
          animation: sparkle 4s ease-in-out infinite;
          box-shadow: 0 0 6px rgba(212, 168, 83, 0.6);
        }

        /* ─── Content ─── */
        .hero__content {
          text-align: center;
          position: relative;
          z-index: 5;
          max-width: 700px;
        }

        /* Sacred text */
        .hero__sacred {
          margin-bottom: var(--space-xl);
        }

        .hero__om {
          display: block;
          font-size: 3rem;
          color: var(--color-gold);
          line-height: 1;
          text-shadow: 0 0 20px rgba(212, 168, 83, 0.4);
          margin-bottom: var(--space-sm);
        }

        .hero__invocation {
          font-family: var(--font-heading);
          font-size: 1.1rem;
          color: var(--color-gold);
          font-style: italic;
          letter-spacing: 0.15em;
          opacity: 0.8;
        }

        /* Blessing text */
        .hero__blessing-text {
          font-family: var(--font-heading);
          font-size: 0.85rem;
          color: var(--color-gold-light);
          letter-spacing: 0.3em;
          text-transform: uppercase;
          opacity: 0.6;
          margin-bottom: var(--space-sm);
          text-shadow: 0 0 15px rgba(212, 168, 83, 0.3);
        }

        /* Flourish */
        .hero__flourish {
          display: flex;
          justify-content: center;
          margin: var(--space-lg) 0;
        }

        .hero__flourish-svg {
          width: 200px;
          height: 20px;
          color: var(--color-gold);
          opacity: 0.6;
        }

        /* Names */
        .hero__names {
          font-family: var(--font-cursive);
          font-size: clamp(3.5rem, 10vw, 7rem);
          font-weight: 400;
          color: var(--text-primary);
          line-height: 1.1;
          margin: var(--space-lg) 0;
          text-shadow:
            0 0 40px rgba(212, 168, 83, 0.15),
            0 0 80px rgba(255, 105, 180, 0.08);
          position: relative;
        }

        .hero__name {
          display: inline;
          position: relative;
        }

        /* Golden shimmer on names */
        .hero__name::after {
          content: '';
          position: absolute;
          left: -10%;
          top: 0;
          width: 120%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(212, 168, 83, 0.15) 40%,
            rgba(255, 215, 0, 0.25) 50%,
            rgba(212, 168, 83, 0.15) 60%,
            transparent 100%
          );
          animation: nameShimmer 4s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes nameShimmer {
          0%, 100% { transform: translateX(-100%); opacity: 0; }
          50% { transform: translateX(100%); opacity: 1; }
        }

        .hero__ampersand {
          display: block;
          font-family: var(--font-heading);
          font-size: 0.3em;
          color: var(--color-gold);
          font-style: italic;
          margin: var(--space-xs) 0;
        }

        /* Subtitle */
        .hero__subtitle {
          font-family: var(--font-heading);
          font-size: clamp(1.1rem, 2.5vw, 1.5rem);
          color: var(--text-secondary);
          font-style: italic;
          font-weight: 300;
          letter-spacing: 0.15em;
          margin-bottom: var(--space-xl);
        }

        /* Date */
        .hero__date-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-xl);
          margin: var(--space-xl) 0;
        }

        .hero__date-line {
          width: 60px;
          height: 1px;
          background: var(--gradient-gold);
          opacity: 0.5;
        }

        .hero__date {
          font-family: var(--font-display);
          font-size: clamp(1.2rem, 3vw, 1.8rem);
          color: var(--color-gold);
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }

        /* Hashtag */
        .hero__hashtag {
          font-family: var(--font-heading);
          font-size: clamp(1rem, 2vw, 1.3rem);
          color: var(--color-gold);
          letter-spacing: 0.2em;
          opacity: 0.7;
          margin-top: var(--space-lg);
        }

        /* Scroll indicator */
        .hero__scroll {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-sm);
          z-index: 5;
        }

        .hero__scroll-text {
          font-family: var(--font-body);
          font-size: 0.7rem;
          color: var(--text-tertiary);
          letter-spacing: 0.3em;
          text-transform: uppercase;
        }

        .hero__scroll-line {
          width: 1px;
          height: 40px;
          background: rgba(212, 168, 83, 0.2);
          position: relative;
          overflow: hidden;
        }

        .hero__scroll-dot {
          width: 3px;
          height: 10px;
          background: var(--color-gold);
          border-radius: var(--radius-full);
          position: absolute;
          left: -1px;
          animation: scroll-indicator 2s ease-in-out infinite;
        }

        @media (max-width: 768px) {
          .hero__names {
            font-size: clamp(2.8rem, 12vw, 4.5rem);
          }
          .hero__date-line {
            width: 30px;
          }
          .hero__blessing-flower {
            font-size: 1.3rem;
          }
        }
      `}</style>
    </section>
  );
}
