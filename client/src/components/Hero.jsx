import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSiteData } from '../context/SiteContext';
import { useLanguage } from '../context/LanguageContext';

/* ─── Petal palette ─── */
const PALETTES = [
  ['#FFB3C9', '#E8607A'],
  ['#FFC8D8', '#F0809A'],
  ['#F9A0C0', '#DC5080'],
  ['#FAD0DC', '#F5A0BB'],
  ['#FFA8C0', '#E06888'],
  ['#FFBFD5', '#E87898'],
  ['#F7C8D8', '#D85878'],
  ['#FFD8E8', '#F0A0C0'],
];

/* ─── Draw a realistic teardrop petal ─── */
function drawPetal(ctx, x, y, w, h, rotation, color1, color2, opacity) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.translate(x, y);
  ctx.rotate(rotation);

  const grad = ctx.createLinearGradient(-w * 0.3, -h * 0.5, w * 0.4, h * 0.5);
  grad.addColorStop(0, color1);
  grad.addColorStop(0.6, color2);
  grad.addColorStop(1, color2 + 'bb');

  ctx.beginPath();
  ctx.moveTo(0, -h / 2);
  ctx.bezierCurveTo( w * 0.72, -h * 0.35,  w * 0.65, h * 0.12, 0, h / 2);
  ctx.bezierCurveTo(-w * 0.65, h * 0.12, -w * 0.72, -h * 0.35, 0, -h / 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // Center vein
  ctx.beginPath();
  ctx.moveTo(0, -h * 0.44);
  ctx.quadraticCurveTo(w * 0.05, 0, 0, h * 0.44);
  ctx.strokeStyle = 'rgba(255,255,255,0.28)';
  ctx.lineWidth = w * 0.06;
  ctx.stroke();

  // Highlight
  const hl = ctx.createRadialGradient(-w * 0.2, -h * 0.22, 0, -w * 0.2, -h * 0.22, w * 0.52);
  hl.addColorStop(0, 'rgba(255,255,255,0.32)');
  hl.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.beginPath();
  ctx.moveTo(0, -h / 2);
  ctx.bezierCurveTo( w * 0.72, -h * 0.35,  w * 0.65, h * 0.12, 0, h / 2);
  ctx.bezierCurveTo(-w * 0.65, h * 0.12, -w * 0.72, -h * 0.35, 0, -h / 2);
  ctx.fillStyle = hl;
  ctx.fill();

  ctx.restore();
}

function formatDateParts(dateStr) {
  if (!dateStr) return { day: '24', month: 'August', year: '2026', weekday: 'Monday' };
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return {
      day: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'long' }),
      year: d.getFullYear(),
      weekday: d.toLocaleDateString('en-US', { weekday: 'long' }),
    };
  } catch { return { day: '24', month: 'August', year: '2026', weekday: 'Monday' }; }
}

/* Reveal: text slides UP into view from behind a clip mask */
const revealContainer = {
  overflow: 'hidden',
  display: 'block',
};

const reveal = (delay = 0, duration = 1.0) => ({
  initial: { y: '110%', opacity: 0 },
  animate: { y: '0%', opacity: 1 },
  transition: { delay, duration, ease: [0.22, 1, 0.36, 1] },
});

/* Subtle fade for supporting elements (lines, dividers) */
const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { delay, duration: 0.8, ease: 'easeOut' },
});

export default function Hero() {
  const { content } = useSiteData();
  const { t, language } = useLanguage();
  const dp = formatDateParts(content.wedding_date);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Spawn 50 petals staggered across the hero height
    const petals = Array.from({ length: 50 }, (_, i) => {
      const p = PALETTES[i % PALETTES.length];
      return {
        x: Math.random() * canvas.width,
        y: -40 - Math.random() * canvas.height * 0.7,
        w: 14 + Math.random() * 16,
        h: 22 + Math.random() * 24,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.04,
        fallSpeed: 0.8 + Math.random() * 1.4,
        swayOffset: Math.random() * Math.PI * 2,
        swaySpeed: 0.016 + Math.random() * 0.022,
        swayAmp: 0.5 + Math.random() * 1.1,
        color1: p[0],
        color2: p[1],
        opacity: 0.75 + Math.random() * 0.25,
        t: 0,
      };
    });

    let alive = true;
    const render = () => {
      if (!alive) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      petals.forEach(p => {
        p.t++;
        p.x += Math.sin(p.swayOffset + p.t * p.swaySpeed) * p.swayAmp;
        p.y += p.fallSpeed;
        p.rotation += p.rotSpeed;

        const fadeStart = canvas.height * 0.82;
        const alpha = p.y > fadeStart
          ? p.opacity * Math.max(0, 1 - (p.y - fadeStart) / (canvas.height * 0.18 + 30))
          : p.opacity;

        if (alpha > 0.01) {
          drawPetal(ctx, p.x, p.y, p.w, p.h, p.rotation, p.color1, p.color2, alpha);
        }

        if (p.y > canvas.height + 40) {
          p.y = -50;
          p.x = Math.random() * canvas.width;
          p.swayOffset = Math.random() * Math.PI * 2;
        }
      });

      rafRef.current = requestAnimationFrame(render);
    };
    render();

    return () => {
      alive = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <section className="hero" id="home">

      {/* Petal canvas — sits behind content */}
      <canvas ref={canvasRef} className="hero__petals" aria-hidden="true" />

      <div className="hero__content">

        {/* Ganesha — reveal from below */}
        <motion.div className="hero__divine" {...fadeIn(0.2)}>
          <div style={revealContainer}>
            <motion.div {...reveal(0.3, 0.9)}>
              <img src="/ganesha.png" alt="Lord Ganesha" className="hero__ganesha" />
            </motion.div>
          </div>
          <div style={revealContainer}>
            <motion.div className="hero__sloka" {...reveal(0.5, 0.9)}>
              వక్రతుండ మహాకాయ సూర్యకోటి సమప్రభ<br/>
              నిర్విఘ్నం కురుమేదేవ సర్వకార్యేషు సర్వదా
            </motion.div>
          </div>
        </motion.div>

        {/* Hashtag */}
        <div style={revealContainer}>
          <motion.div className="hero__hashtag" {...reveal(0.65, 0.85)}>
            <span>#NIRA</span>
          </motion.div>
        </div>

        {/* Blessings line */}
        <motion.div className="hero__elders" {...fadeIn(0.8)}>
          <span className="hero__line"></span>
          <span>{t('hero.blessings')}</span>
          <span className="hero__line"></span>
        </motion.div>

        {/* Names — each line reveals independently */}
        <div className="hero__names-wrap">
          <div style={revealContainer}>
            <motion.h1 className="hero__name" {...reveal(0.9, 1.1)}>
              {language === 'te' ? t('hero.groomName') : (content.groom_name || 'Ranjith')}
            </motion.h1>
          </div>
          <div style={revealContainer}>
            <motion.div className="hero__ampersand-wrap" {...reveal(1.15, 0.9)}>
              <span className="hero__ampersand">&</span>
            </motion.div>
          </div>
          <div style={revealContainer}>
            <motion.h1 className="hero__name" {...reveal(1.05, 1.1)}>
              {language === 'te' ? t('hero.brideName') : (content.bride_name || 'Nithya')}
            </motion.h1>
          </div>
        </div>

        {/* Date pill */}
        <div style={revealContainer}>
          <motion.div className="hero__date-box" {...reveal(1.35, 0.9)}>
            <div className="hero__date-pill">
              <span className="hero__date-day">{dp.weekday}</span>
              <span className="hero__date-divider">|</span>
              <span className="hero__date-main">{dp.month} {dp.day}, {dp.year}</span>
            </div>
          </motion.div>
        </div>

      </div>

      <style>{`
        .hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #FDFBF7;
          overflow: hidden;
          padding: 120px 24px 60px;
        }

        /* Petal canvas fills the whole hero */
        .hero__petals {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .hero__content {
          text-align: center;
          z-index: 10;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          max-width: 900px;
          position: relative;
        }

        .hero__divine {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 50px;
        }

        .hero__ganesha {
          width: 60px;
          height: auto;
          margin-bottom: 24px;
          filter: brightness(0) saturate(100%) invert(10%) sepia(5%) saturate(10%) hue-rotate(314deg) brightness(96%) contrast(90%);
        }

        .hero__sloka {
          font-family: 'Tiro Telugu', serif;
          font-size: 1rem;
          line-height: 1.8;
          color: rgba(0, 0, 0, 0.65);
          text-align: center;
        }

        .hero__hashtag {
          margin-bottom: 24px;
        }

        .hero__hashtag span {
          font-family: var(--font-body);
          font-size: 2rem;
          font-weight: 800;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          background: linear-gradient(135deg, #D4AF37 0%, #F5E28B 35%, #D4AF37 55%, #B8941F 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 0 12px rgba(212, 175, 55, 0.5));
        }

        .hero__elders {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 40px;
        }

        .hero__elders span:not(.hero__line) {
          font-family: var(--font-body);
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: #B29B69;
        }

        .hero__line {
          width: 30px;
          height: 1px;
          background: #D8CEB3;
        }

        .hero__names-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 60px;
          position: relative;
        }

        .hero__name {
          font-family: var(--font-names, var(--font-heading, 'Cormorant Garamond', serif));
          font-style: italic;
          font-size: calc(clamp(4.5rem, 12vw, 8rem) * var(--font-names-scale, 1));
          font-weight: 400;
          line-height: 0.95;
          color: #1A1C1A;
        }

        .hero__ampersand-wrap {
          margin: 10px 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
        }

        .hero__ampersand {
          font-family: var(--font-display, 'Fraunces', serif);
          font-size: clamp(2rem, 4vw, 3rem);
          color: #C0A868;
          font-weight: 400;
        }

        .hero__date-box {
          margin-top: 20px;
        }

        .hero__date-pill {
          display: inline-flex;
          align-items: center;
          gap: 20px;
          padding: 16px 48px;
          background: transparent;
          border: 1px solid #E6DDC4;
          border-radius: 50px;
        }

        .hero__date-day {
          font-family: var(--font-body);
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #A69260;
        }

        .hero__date-divider {
          color: #E6DDC4;
          font-weight: 300;
          font-size: 1.2rem;
        }

        .hero__date-main {
          font-family: var(--font-heading);
          font-size: 1.1rem;
          color: #2D2D2D;
          letter-spacing: 0.05em;
        }

        @media (max-width: 768px) {
          .hero { padding: 60px 24px 40px; }
          .hero__divine { margin-bottom: 30px; }
          .hero__date-pill { padding: 14px 32px; gap: 16px; }
          .hero__date-day { font-size: 0.65rem; }
          .hero__date-main { font-size: 1rem; }
          .hero__elders { margin-bottom: 20px; }
          .hero__ganesha { width: 50px; margin-bottom: 16px; }
          .hero__names-wrap { margin-bottom: 30px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero__petals { display: none; }
        }
      `}</style>
    </section>
  );
}
