import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

/* ─── Draw a realistic flower petal on canvas ─── */
function drawPetal(ctx, x, y, w, h, rotation, color1, color2, opacity) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.translate(x, y);
  ctx.rotate(rotation);

  // Gradient fill for 3D petal look
  const grad = ctx.createLinearGradient(-w * 0.3, -h * 0.5, w * 0.4, h * 0.5);
  grad.addColorStop(0, color1);
  grad.addColorStop(0.6, color2);
  grad.addColorStop(1, color2 + 'cc');

  // Draw teardrop / petal shape using bezier curves
  ctx.beginPath();
  ctx.moveTo(0, -h / 2);                               // tip (top)
  ctx.bezierCurveTo(
    w * 0.7, -h * 0.35,                               // right ctrl 1
    w * 0.65, h * 0.1,                                // right ctrl 2
    0, h / 2                                           // bottom
  );
  ctx.bezierCurveTo(
    -w * 0.65, h * 0.1,                               // left ctrl 1
    -w * 0.7, -h * 0.35,                              // left ctrl 2
    0, -h / 2                                          // back to tip
  );
  ctx.fillStyle = grad;
  ctx.fill();

  // Subtle center vein
  ctx.beginPath();
  ctx.moveTo(0, -h * 0.45);
  ctx.quadraticCurveTo(w * 0.05, 0, 0, h * 0.45);
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = w * 0.06;
  ctx.stroke();

  // Slight highlight near top
  const highlight = ctx.createRadialGradient(-w * 0.2, -h * 0.25, 0, -w * 0.2, -h * 0.25, w * 0.5);
  highlight.addColorStop(0, 'rgba(255,255,255,0.28)');
  highlight.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.beginPath();
  ctx.moveTo(0, -h / 2);
  ctx.bezierCurveTo(w * 0.7, -h * 0.35, w * 0.65, h * 0.1, 0, h / 2);
  ctx.bezierCurveTo(-w * 0.65, h * 0.1, -w * 0.7, -h * 0.35, 0, -h / 2);
  ctx.fillStyle = highlight;
  ctx.fill();

  ctx.restore();
}

/* ─── Petal color palettes ─── */
const PALETTES = [
  ['#FFB3C9', '#E8607A'],
  ['#FFC8D8', '#F0809A'],
  ['#F9A0C0', '#DC5080'],
  ['#FFD0E0', '#F09EB8'],
  ['#FFA8C0', '#E06888'],
  ['#FFBFD5', '#E87898'],
  ['#F7C8D8', '#D85878'],
  ['#FFD8E8', '#F0A0C0'],
];

export default function EnvelopeIntro({ onOpen, groomName, brideName }) {
  const { t } = useLanguage();
  const [animState, setAnimState] = useState('idle');
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const petalsRef = useRef([]);

  const handleOpen = () => {
    if (animState !== 'idle') return;
    setAnimState('opening');
    setTimeout(() => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setAnimState('done');
      onOpen();
    }, 4000);
  };

  useEffect(() => {
    const h = (e) => { if (e.key === 'Enter' || e.key === ' ') handleOpen(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [animState]);

  useEffect(() => {
    if (animState !== 'opening') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Spawn petals — staggered so they don't all appear at once
    const palette = PALETTES;
    petalsRef.current = Array.from({ length: 48 }, (_, i) => {
      const p = palette[i % palette.length];
      return {
        x: Math.random() * canvas.width,
        y: -40 - Math.random() * canvas.height * 0.6, // staggered start heights
        w: 14 + Math.random() * 16,
        h: 22 + Math.random() * 24,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.045,
        fallSpeed: 1.2 + Math.random() * 1.8,
        swayOffset: Math.random() * Math.PI * 2,
        swaySpeed: 0.018 + Math.random() * 0.022,
        swayAmp: 0.6 + Math.random() * 1.0,
        color1: p[0],
        color2: p[1],
        opacity: 0.78 + Math.random() * 0.22,
        t: 0,
      };
    });

    let alive = true;
    const render = () => {
      if (!alive) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      petalsRef.current.forEach(p => {
        p.t += 1;
        // Sinusoidal horizontal sway — makes it look like gentle breeze
        p.x += Math.sin(p.swayOffset + p.t * p.swaySpeed) * p.swayAmp;
        p.y += p.fallSpeed;
        p.rotation += p.rotSpeed;

        // Fade out near bottom
        const fadeStart = canvas.height * 0.8;
        const fadeEnd = canvas.height + 20;
        const fadeOpacity = p.y > fadeStart
          ? p.opacity * (1 - (p.y - fadeStart) / (fadeEnd - fadeStart))
          : p.opacity;

        if (fadeOpacity > 0) {
          drawPetal(ctx, p.x, p.y, p.w, p.h, p.rotation, p.color1, p.color2, Math.max(0, fadeOpacity));
        }

        // Recycle petal when it exits screen
        if (p.y > canvas.height + 40) {
          p.y = -40;
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
  }, [animState]);

  return (
    <AnimatePresence>
      {animState !== 'done' && (
        <motion.div
          className="intro"
          exit={{ opacity: 0, transition: { duration: 0.6 } }}
        >
          {/* Canvas for petal rain — only visible during animation */}
          <canvas
            ref={canvasRef}
            className="petal-canvas"
            style={{ opacity: animState === 'opening' ? 1 : 0 }}
          />

          {/* Main invitation content */}
          <motion.div
            className="intro__content-wrap"
            animate={{
              opacity: animState === 'opening' ? 0 : 1,
              scale: animState === 'opening' ? 1.04 : 1,
            }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
          >
            {/* Corner decorations */}
            <div className="intro__corner intro__corner--tl" />
            <div className="intro__corner intro__corner--tr" />
            <div className="intro__corner intro__corner--bl" />
            <div className="intro__corner intro__corner--br" />

            <div className="intro__content">
              <div className="intro__ganesh" />

              <p className="intro__label">{t('intro.invited')}</p>

              <h1 className="intro__names">
                <span>{groomName || 'Ranjith'}</span>
                <em>&</em>
                <span>{brideName || 'Nithya'}</span>
              </h1>

              <div className="intro__line" />

              <button className="intro__btn" onClick={handleOpen}>
                {t('intro.open')}
              </button>
            </div>

            <p className="intro__hashtag">#NIRA</p>
          </motion.div>

          <style>{`
            .intro {
              position: fixed;
              inset: 0;
              z-index: 9999;
              background: #FDFAF6;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
            }

            .petal-canvas {
              position: absolute;
              inset: 0;
              pointer-events: none;
              transition: opacity 0.4s ease;
              z-index: 1;
            }

            .intro__content-wrap {
              position: relative;
              z-index: 10;
              display: flex;
              flex-direction: column;
              align-items: center;
              width: 100%;
            }

            /* Corner ornaments */
            .intro__corner {
              position: absolute;
              width: 60px;
              height: 60px;
              border-color: #E0D5C7;
              border-style: solid;
            }
            .intro__corner--tl { top: 32px; left: 32px; border-width: 1px 0 0 1px; }
            .intro__corner--tr { top: 32px; right: 32px; border-width: 1px 1px 0 0; }
            .intro__corner--bl { bottom: 32px; left: 32px; border-width: 0 0 1px 1px; }
            .intro__corner--br { bottom: 32px; right: 32px; border-width: 0 1px 1px 0; }

            .intro__content {
              text-align: center;
              max-width: 500px;
              padding: 0 24px;
              display: flex;
              flex-direction: column;
              align-items: center;
            }

            .intro__ganesh {
              width: 48px;
              height: 48px;
              margin: 0 auto 28px;
              background-color: #8C8C8C;
              -webkit-mask-image: url('/ganesha.png');
              mask-image: url('/ganesha.png');
              -webkit-mask-size: contain;
              mask-size: contain;
              -webkit-mask-repeat: no-repeat;
              mask-repeat: no-repeat;
              -webkit-mask-position: center;
              mask-position: center;
              opacity: 0.5;
            }

            .intro__label {
              font-family: var(--font-body, 'Sora', sans-serif);
              font-size: 0.72rem;
              font-weight: 500;
              color: #A69260;
              letter-spacing: 0.28em;
              text-transform: uppercase;
              margin-bottom: 20px;
            }

            .intro__names {
              font-family: var(--font-heading, 'Cormorant Garamond', serif);
              font-style: italic;
              font-size: clamp(3rem, 8vw, 5rem);
              font-weight: 400;
              color: #2C2C2C;
              line-height: 1.15;
              margin-bottom: 24px;
            }

            .intro__names span { display: block; }
            .intro__names em {
              display: block;
              font-family: var(--font-display, 'Fraunces', serif);
              font-style: normal;
              font-size: 0.5em;
              color: #B87D4B;
              margin: 16px 0;
            }

            .intro__line {
              width: 50px;
              height: 1px;
              background: #B87D4B;
              margin: 0 auto 32px;
            }

            .intro__btn {
              font-family: var(--font-body, 'Sora', sans-serif);
              font-size: 0.7rem;
              font-weight: 600;
              letter-spacing: 0.3em;
              text-transform: uppercase;
              color: #FDFAF6;
              background: #5C6851;
              padding: 16px 40px;
              border: none;
              border-radius: 100px;
              cursor: pointer;
              transition: background 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
              box-shadow: 0 4px 20px rgba(92, 104, 81, 0.3);
            }
            .intro__btn:hover {
              background: #454E41;
              transform: translateY(-2px);
              box-shadow: 0 6px 24px rgba(92, 104, 81, 0.4);
            }

            .intro__hashtag {
              position: absolute;
              bottom: 40px;
              left: 50%;
              transform: translateX(-50%);
              font-family: var(--font-body, 'Sora', sans-serif);
              font-size: 0.6rem;
              letter-spacing: 0.3em;
              color: rgba(44, 44, 44, 0.38);
              text-transform: uppercase;
              white-space: nowrap;
            }

            @media (max-width: 480px) {
              .intro__corner { width: 30px; height: 30px; }
              .intro__corner--tl, .intro__corner--tr { top: 16px; }
              .intro__corner--bl, .intro__corner--br { bottom: 16px; }
              .intro__corner--tl, .intro__corner--bl { left: 16px; }
              .intro__corner--tr, .intro__corner--br { right: 16px; }
              .intro__names { font-size: 2.8rem; }
              .intro__btn { padding: 14px 32px; font-size: 0.6rem; }
            }

            @media (prefers-reduced-motion: reduce) {
              .petal-canvas { display: none !important; }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
