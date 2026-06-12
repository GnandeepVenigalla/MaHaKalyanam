import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

export default function EnvelopeIntro({ onOpen, groomName, brideName }) {
  const { language, setLanguage, t } = useLanguage();
  // States: idle -> opening -> done
  const [animState, setAnimState] = useState('idle');

  // Respect user's reduced motion preference
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const handleOpen = () => {
    if (animState !== 'idle') return;
    if (prefersReduced) {
      // Skip animation for reduced-motion users
      setAnimState('done');
      onOpen();
      return;
    }

    setAnimState('opening');

    // petals + curtain timing (curtain slides up while petals fall)
    const TOTAL_MS = 900;
    setTimeout(() => {
      setAnimState('done');
      onOpen();
    }, TOTAL_MS);
  };

  useEffect(() => {
    const h = (e) => { if (e.key === 'Enter' || e.key === ' ') handleOpen(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [animState]);

  const isIntroSolid = animState !== 'done';
  const showContent = animState === 'idle';

  return (
    <AnimatePresence>
      {animState !== 'done' && (
        <motion.div
          className={`intro ${animState === 'opening' ? 'opening' : ''}`}
          style={{ background: isIntroSolid ? '#FDFAF6' : 'transparent' }}
          exit={{ opacity: 0 }}
        >

          {/* TOP-CURTAIN + PETALS OVERLAY (covers until opened) */}
          <div className={`reveal-overlay ${animState}`} aria-hidden={animState === 'done' ? 'true' : 'false'}>
            <div className="curtain" />
            <div className="petals">
              {useMemo(() => {
                const rosePalettes = [
                  ['#F7D3D9', '#F1A7B8'], // blush -> rose
                  ['#F6C4D1', '#E88AA6'],
                  ['#F2B8C9', '#DE6B93'],
                  ['#F0A1BA', '#D65A8E'],
                  ['#F9D6DC', '#F2A6BB']
                ];

                const arr = [];
                for (let i = 0; i < 28; i++) {
                  const left = Math.round(Math.random() * 92);
                  const drift = Math.round((Math.random() * 360) - 180);
                  const delay = Math.round(Math.random() * 600);
                  const duration = 900 + Math.round(Math.random() * 1000);
                  const startRot = Math.round((Math.random() * 60) - 30);
                  const endRot = Math.round(120 + Math.random() * 360);
                  const scale = (0.8 + Math.random() * 0.9).toFixed(2);
                  const palette = rosePalettes[Math.floor(Math.random() * rosePalettes.length)];
                  arr.push({ left, drift, delay, duration, startRot, endRot, scale, idx: i, pc1: palette[0], pc2: palette[1] });
                }
                return arr;
              }, []).map((p) => (
                <svg
                  key={p.idx}
                  className={`petal petal--${(p.idx % 12) + 1}`}
                  viewBox="0 0 20 40"
                  width="20"
                  height="40"
                  style={{
                    left: `${p.left}%`,
                    animationDelay: `${p.delay}ms`,
                    animationDuration: `${p.duration}ms`,
                    ['--drift']: `${p.drift}px`,
                    ['--start-rot']: `${p.startRot}deg`,
                    ['--end-rot']: `${p.endRot}deg`,
                    ['--scale']: p.scale,
                    ['--pc1']: p.pc1,
                    ['--pc2']: p.pc2,
                  }}
                >
                  <defs>
                    <linearGradient id={`g${p.idx}`} x1="0" x2="1" y1="0" y2="1">
                      <stop offset="0%" stopColor={p.pc1} stopOpacity="1" />
                      <stop offset="100%" stopColor={p.pc2} stopOpacity="1" />
                    </linearGradient>
                  </defs>
                  <path d="M10 1 C16 6,18 14,12 26 C8 32,4 30,3 25 C1 16,4 6,10 1 Z" fill={`url(#g${p.idx})`} stroke="rgba(0,0,0,0.06)" strokeWidth="0.4" />
                </svg>
              ))}
            </div>
          </div>

          {/* CONTENT (visible initially; fades when animation starts) */}
          <AnimatePresence>
            {showContent && (
              <motion.div
                className="intro__content-wrap"
                initial={{ opacity: 1 }}
                animate={{ opacity: animState === 'folding' ? 0 : 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                {/* Corner lines */}
                <div className="intro__corner intro__corner--tl" />
                <div className="intro__corner intro__corner--tr" />
                <div className="intro__corner intro__corner--bl" />
                <div className="intro__corner intro__corner--br" />

                <div className="intro__content">
                  <div className="intro__ganesh" />

                  <p className="intro__label">
                    {t('intro.invited')}
                  </p>

                  <h1 className="intro__names">
                    <span className={animState === 'opening' ? 'shimmer' : ''}>{groomName || 'Ranjith'}</span>
                    <em>&</em>
                    <span className={animState === 'opening' ? 'shimmer' : ''}>{brideName || 'Nithya'}</span>
                  </h1>

                  <div className="intro__line" />

                  <button className="intro__btn" onClick={handleOpen}>
                    {t('intro.open')}
                  </button>

                  <div className="intro__lang-toggle">
                    <button
                      className={`intro__lang-btn ${language === 'en' ? 'intro__lang-btn--active' : ''}`}
                      onClick={() => setLanguage('en')}
                    >
                      English
                    </button>
                    <span className="intro__lang-divider">|</span>
                    <button
                      className={`intro__lang-btn ${language === 'te' ? 'intro__lang-btn--active' : ''}`}
                      onClick={() => setLanguage('te')}
                    >
                      తెలుగు
                    </button>
                  </div>
                </div>

                <p className="intro__hashtag">#NIRA</p>
              </motion.div>
            )}
          </AnimatePresence>

          <style>{`
            .intro {
              position: fixed;
              inset: 0;
              z-index: 9999;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
            }

            .intro__content-wrap {
              position: absolute;
              inset: 0;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            /* Soft Fade + Gold Shimmer styles */
            .intro.opening .intro__content-wrap { filter: blur(0.2px); }
            .intro__content-wrap { transition: opacity 0.45s ease, transform 0.45s ease; }

            .intro.opening .intro__content-wrap { opacity: 0; transform: scale(0.98); }

            /* Gold shimmer for the names */
            .intro__names { position: relative; overflow: visible; }
            .intro__names .shimmer {
              display: block;
              background: linear-gradient(90deg, rgba(212,168,83,0) 0%, rgba(212,168,83,0.65) 50%, rgba(212,168,83,0) 100%);
              background-size: 200% 100%;
              -webkit-background-clip: text;
              background-clip: text;
              color: transparent;
              animation: goldShimmer 0.9s ease forwards;
            }

            @keyframes goldShimmer {
              0% { background-position: -100% 0; }
              100% { background-position: 200% 0; }
            }

            /* Reveal overlay: top curtain that slides up + falling petals */
            /* overlay hidden by default so it doesn't cover content until opening */
            .reveal-overlay { position: absolute; inset: 0; z-index: 9998; pointer-events: none; opacity: 0; visibility: hidden; transition: opacity 0.25s ease; }
            .reveal-overlay .curtain {
              position: absolute; left: 0; right: 0; top: 0; height: 56%; background: linear-gradient(180deg,#f6f1ea 0%, #f3eee6 60%); box-shadow: 0 18px 40px rgba(0,0,0,0.08); transition: transform 0.85s cubic-bezier(.22,.9,.36,1);
              transform: translateY(0%);
            }
            .intro.opening .reveal-overlay { pointer-events: auto; opacity: 1; visibility: visible; }
            .intro.opening .reveal-overlay .curtain { transform: translateY(-110%); }

            .petals { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
            .petal {
              position: absolute;
              top: -10%;
              width: 20px;
              height: 40px;
              transform-origin: center;
              transform: translateZ(0) rotate(var(--start-rot,0deg)) scale(var(--scale,1));
              opacity: 0;
              animation-name: petalFall;
              animation-timing-function: cubic-bezier(.22,.8,.18,1);
              animation-fill-mode: forwards;
              animation-play-state: paused;
              filter: drop-shadow(0 6px 12px rgba(120,40,60,0.08));
            }
            .intro.opening .petal { animation-play-state: running; }

            /* small variations for visual depth */
            .petal--1 { transform: rotate(-10deg) scale(1.05); }
            .petal--2 { transform: rotate(8deg) scale(0.95); }
            .petal--3 { transform: rotate(-20deg) scale(1.1); }
            .petal--4 { transform: rotate(4deg) scale(0.9); }
            .petal--5 { transform: rotate(12deg) scale(1.0); }
            .petal--6 { transform: rotate(-6deg) scale(0.95); }
            .petal--7 { transform: rotate(16deg) scale(1.05); }
            .petal--8 { transform: rotate(-4deg) scale(0.9); }
            .petal--9 { transform: rotate(20deg) scale(1.08); }
            .petal--10{ transform: rotate(-12deg) scale(0.92); }
            .petal--11{ transform: rotate(6deg) scale(1.02); }
            .petal--12{ transform: rotate(-8deg) scale(0.94); }

            @keyframes petalFall {
              0% { transform: translateY(-8vh) translateX(0px) rotate(var(--start-rot, 0deg)) scale(var(--scale, 1)); opacity: 1; }
              40% { transform: translateY(30vh) translateX(calc(var(--drift) * 0.35)) rotate(calc(var(--start-rot,0deg) + var(--end-rot,0deg) * 0.35)) scale(calc(var(--scale,1) * 0.98)); opacity: 1; }
              70% { transform: translateY(56vh) translateX(calc(var(--drift) * 0.7)) rotate(calc(var(--start-rot,0deg) + var(--end-rot,0deg) * 0.75)) scale(calc(var(--scale,1) * 0.9)); opacity: 0.95; }
              100% { transform: translateY(100vh) translateX(var(--drift)) rotate(calc(var(--start-rot,0deg) + var(--end-rot,0deg))) scale(calc(var(--scale,1) * 0.82)); opacity: 0; }
            }

            @media (prefers-reduced-motion: reduce) {
              .petal, .intro__names .shimmer { animation: none !important; }
              .intro.opening .reveal-overlay .curtain { transition: none !important; transform: translateY(-110%) !important; }
            }

            /* CORNERS AND CONTENT STYLES */
            .intro__corner {
              position: absolute;
              width: 60px;
              height: 60px;
              border-color: var(--cream-dark, #E0D5C7);
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
              width: 48px; height: 48px;
              margin: 0 auto 28px;
              background-color: #8C8C8C; 
              -webkit-mask-image: url('/ganesha.png');
              mask-image: url('/ganesha.png');
              -webkit-mask-size: contain; mask-size: contain;
              -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat;
              -webkit-mask-position: center; mask-position: center;
              opacity: 0.5;
            }

            .intro__label {
              font-family: var(--font-body, 'Sora', sans-serif);
              font-size: 0.75rem;
              font-weight: 500;
              color: #A69260; 
              letter-spacing: 0.25em;
              text-transform: uppercase;
              margin-bottom: 20px;
            }

            .intro__names {
              font-family: var(--font-heading, 'Cormorant Garamond', serif);
              font-style: italic;
              font-size: clamp(3rem, 8vw, 5rem);
              font-weight: 400;
              color: var(--charcoal, #2C2C2C);
              line-height: 1.15;
              margin-bottom: 24px;
            }

            .intro__names span { display: block; }
            .intro__names em {
              display: block;
              font-family: var(--font-display, 'Fraunces', serif);
              font-style: normal;
              font-size: 0.5em;
              color: var(--copper, #B87D4B);
              margin: 20px 0;
            }

            .intro__line {
              width: 50px;
              height: 1px;
              background: var(--copper, #B87D4B);
              margin: 0 auto 32px;
            }

            .intro__btn {
              font-family: var(--font-body, 'Sora', sans-serif);
              font-size: 0.7rem;
              font-weight: 600;
              letter-spacing: 0.3em;
              text-transform: uppercase;
              color: var(--white, #FDFAF6);
              background: #5C6851; /* Olive green */
              padding: 16px 40px;
              border: none;
              border-radius: 100px;
              cursor: pointer;
              transition: background 0.3s ease, transform 0.2s ease;
            }
            .intro__btn:hover { background: #454E41; transform: translateY(-2px); }

            .intro__lang-toggle {
              display: flex;
              align-items: center;
              gap: 12px;
              margin-top: 28px;
            }

            .intro__lang-btn {
              font-family: var(--font-body, 'Sora', sans-serif);
              font-size: 0.75rem;
              font-weight: 500;
              letter-spacing: 0.15em;
              color: rgba(44, 44, 44, 0.4);
              background: none;
              border: none;
              cursor: pointer;
              padding: 6px 12px;
              border-radius: 20px;
              transition: all 0.3s ease;
            }

            .intro__lang-btn--active {
              color: #5C6851;
              background: rgba(92, 104, 81, 0.1);
              font-weight: 600;
            }

            .intro__lang-btn:hover {
              color: #5C6851;
            }

            .intro__lang-divider {
              color: rgba(44, 44, 44, 0.2);
              font-size: 0.8rem;
              font-weight: 300;
            }

            .intro__hashtag {
              position: absolute;
              bottom: 40px;
              left: 50%;
              transform: translateX(-50%);
              font-family: var(--font-body, 'Sora', sans-serif);
              font-size: 0.6rem;
              letter-spacing: 0.3em;
              color: var(--text-tertiary, rgba(44,44,44,0.38));
              text-transform: uppercase;
            }

            /* remove folded-paper remnants */


            @media (max-width: 480px) {
              .intro__corner { width: 30px; height: 30px; }
              .intro__corner--tl, .intro__corner--tr { top: 16px; }
              .intro__corner--bl, .intro__corner--br { bottom: 16px; }
              .intro__corner--tl, .intro__corner--bl { left: 16px; }
              .intro__corner--tr, .intro__corner--br { right: 16px; }
              .intro__names { font-size: 2.8rem; }
              .intro__btn { padding: 14px 32px; font-size: 0.6rem; }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
