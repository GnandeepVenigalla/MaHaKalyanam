import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

/* ═══════════════════════════════════════════════════════════════
   Sparkle Particle System
   ═══════════════════════════════════════════════════════════════ */
function useSparkles(canvasRef, active) {
  const particles = useRef([]);
  const frameRef = useRef(null);

  const animate = useCallback(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    const w = cvs.offsetWidth;
    const h = cvs.offsetHeight;
    ctx.clearRect(0, 0, cvs.width, cvs.height);

    if (particles.current.length < 40 && Math.random() < 0.15) {
      particles.current.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: 1 + Math.random() * 2,
        life: 0,
        maxLife: 150 + Math.random() * 200,
        vx: (Math.random() - 0.5) * 0.2,
        vy: -0.1 - Math.random() * 0.2,
        hue: 38 + Math.random() * 12,
      });
    }

    for (let i = particles.current.length - 1; i >= 0; i--) {
      const p = particles.current[i];
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      const progress = p.life / p.maxLife;
      const alpha = progress < 0.2 ? progress / 0.2 : progress > 0.7 ? (1 - progress) / 0.3 : 1;

      if (p.life > p.maxLife) {
        particles.current.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = alpha * 0.5;
      ctx.fillStyle = `hsl(${p.hue}, 65%, 68%)`;
      ctx.shadowColor = `hsl(${p.hue}, 75%, 55%)`;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    frameRef.current = requestAnimationFrame(animate);
  }, [canvasRef]);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs || !active) return;
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      cvs.width = cvs.offsetWidth * dpr;
      cvs.height = cvs.offsetHeight * dpr;
      const ctx = cvs.getContext('2d');
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);
    animate();
    return () => {
      window.removeEventListener('resize', resize);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [active, animate, canvasRef]);
}

/* ═══════════════════════════════════════════════════════════════
   Greenvelope-Style Envelope Intro
   ═══════════════════════════════════════════════════════════════ */
export default function EnvelopeIntro({ onOpen, groomName, brideName }) {
  const [stage, setStage] = useState('closed'); 
  const sparkleCanvas = useRef(null);

  const gInitial = (groomName || 'Ranjith').charAt(0).toUpperCase();
  const bInitial = (brideName || 'Nithaya').charAt(0).toUpperCase();

  useSparkles(sparkleCanvas, true);

  const handleOpen = () => {
    if (stage !== 'closed') return;
    setStage('opening');      // Seal shrinks, flap opens
    setTimeout(() => setStage('revealing'), 600);    // Card slides UP
    setTimeout(() => setStage('done'), 2400);        // Fade out overlay
    setTimeout(() => onOpen(), 2900);                // Complete
  };

  useEffect(() => {
    const handler = (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && stage === 'closed') handleOpen();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [stage]);

  const isOpened = stage !== 'closed';

  return (
    <motion.div
      className="ei"
      animate={stage === 'done' ? { opacity: 0 } : {}}
      transition={{ duration: 0.5 }}
      style={{ pointerEvents: stage === 'done' ? 'none' : 'auto' }}
    >
      <canvas ref={sparkleCanvas} className="ei-canvas" />

      <div className="ei-bg-text">
        <p className="ei-bg-text__line">You're Invited</p>
      </div>

      <div className="ei-envelope">
        <div className="ei-shadow" />
        
        {/* Z=1: Back Wall */}
        <div className="ei-envelope-back" />

        {/* Z=3: The Card */}
        <motion.div
          className="ei-card"
          initial={{ y: '0%' }}
          animate={
            stage === 'revealing' ? { y: '-45%' } :
            stage === 'done' ? { y: '-55%', opacity: 0 } :
            { y: '0%' }
          }
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="ei-card__body">
            <span className="ei-card__c ei-card__c--tl" />
            <span className="ei-card__c ei-card__c--tr" />
            <span className="ei-card__c ei-card__c--bl" />
            <span className="ei-card__c ei-card__c--br" />
            <div className="ei-card__ganesh" />
            <p className="ei-card__pre">Together with their families</p>
            <h2 className="ei-card__names">
              {groomName || 'Ranjith'}
              <span>&</span>
              {brideName || 'Nithaya'}
            </h2>
            <p className="ei-card__sub">
              Request the pleasure of your company<br />at their wedding celebration
            </p>
            <div className="ei-card__divider"><hr /><i>◆</i><hr /></div>
            <p className="ei-card__tag">#MaHaKalyanam</p>
          </div>
        </motion.div>

        {/* Z=4: Side Flaps */}
        <div className="ei-flap-left" />
        <div className="ei-flap-right" />

        {/* Z=5: Bottom Flap */}
        <div className="ei-flap-bottom" />

        {/* Z=6 (closed) -> Z=2 (open): Top Flap */}
        <motion.div
          className="ei-flap-top"
          initial={{ rotateX: 0, zIndex: 6 }}
          animate={isOpened ? { rotateX: 180, zIndex: 2 } : { rotateX: 0, zIndex: 6 }}
          transition={{
            rotateX: { duration: 0.6, ease: "easeInOut" },
            zIndex: { delay: 0.3, duration: 0 } // Swap z-index halfway through rotation!
          }}
        >
          <div className="ei-flap-top__front" />
          <div className="ei-flap-top__back" />
        </motion.div>

        {/* Z=7: Wax Seal */}
        <motion.div
          className="ei-seal"
          onClick={handleOpen}
          role="button"
          tabIndex={0}
          aria-label="Open invitation"
          initial={{ x: "-50%", y: "-50%", scale: 1, opacity: 1 }}
          animate={isOpened ? { x: "-50%", y: "-50%", scale: 0, opacity: 0 } : { x: "-50%", y: "-50%", scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          whileHover={stage === 'closed' ? { scale: 1.08 } : {}}
          whileTap={stage === 'closed' ? { scale: 0.93 } : {}}
        >
          <div className="ei-seal__ring" />
          <span className="ei-seal__txt">{gInitial}<i>&</i>{bInitial}</span>
        </motion.div>
      </div>

      <motion.p
        className="ei-hint"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: stage === 'closed' ? 1 : 0, y: stage === 'closed' ? 0 : 10 }}
        transition={{ delay: 1, duration: 0.8 }}
        onClick={handleOpen}
      >
        ✦ Tap the seal to open ✦
      </motion.p>

      <style>{`
        /* ═══════════════════════════════════
           ROOT OVERLAY
           ═══════════════════════════════════ */
        .ei {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: radial-gradient(
            ellipse at 50% 40%,
            #4A0E1B 0%,
            #3A0B15 30%,
            #2D0A12 60%,
            #1A0509 100%
          );
          overflow: hidden;
        }

        .ei-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .ei-bg-text {
          position: absolute;
          top: 8%;
          left: 50%;
          transform: translateX(-50%);
          z-index: 2;
          text-align: center;
          pointer-events: none;
        }

        .ei-bg-text__line {
          font-family: var(--font-cursive, 'Great Vibes', cursive);
          font-size: clamp(1.8rem, 5vw, 3.5rem);
          color: rgba(212, 168, 83, 0.12);
          letter-spacing: 0.05em;
          white-space: nowrap;
        }

        /* ═══════════════════════════════════
           ENVELOPE CONTAINER
           ═══════════════════════════════════ */
        .ei-envelope {
          position: relative;
          z-index: 10;
          width: clamp(300px, 85vw, 540px);
          aspect-ratio: 1.55 / 1;
          perspective: 1500px;
        }

        .ei-shadow {
          position: absolute;
          bottom: -18px;
          left: 10%;
          right: 10%;
          height: 30px;
          background: radial-gradient(ellipse, rgba(0,0,0,0.4) 0%, transparent 70%);
          filter: blur(12px);
          z-index: 0;
        }

        /* ═══════════════════════════════════
           Z=1: ENVELOPE BACK (Interior)
           ═══════════════════════════════════ */
        .ei-envelope-back {
          position: absolute;
          inset: 0;
          z-index: 1;
          background: linear-gradient(180deg, #2D0A12 0%, #1A0509 100%);
          border-radius: 4px;
        }

        /* ═══════════════════════════════════
           Z=3: CARD
           ═══════════════════════════════════ */
        .ei-card {
          position: absolute;
          top: 4%; left: 3%; right: 3%; bottom: 4%;
          z-index: 3;
        }

        .ei-card__body {
          width: 100%;
          height: 100%;
          background: linear-gradient(170deg, #FFFDF8 0%, #F5EACC 100%);
          border-radius: 6px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: clamp(4px, 1.2vw, 10px);
          padding: clamp(16px, 3vw, 32px) clamp(12px, 2.5vw, 24px);
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          border: 1px solid rgba(212,168,83,0.3);
          position: relative;
        }

        .ei-card__c {
          position: absolute;
          width: 12px; height: 12px;
          border-color: #B8922F;
          border-style: solid;
          opacity: 0.3;
        }
        .ei-card__c--tl { top: 8px; left: 8px; border-width: 1.5px 0 0 1.5px; }
        .ei-card__c--tr { top: 8px; right: 8px; border-width: 1.5px 1.5px 0 0; }
        .ei-card__c--bl { bottom: 8px; left: 8px; border-width: 0 0 1.5px 1.5px; }
        .ei-card__c--br { bottom: 8px; right: 8px; border-width: 0 1.5px 1.5px 0; }

        .ei-card__ganesh {
          width: clamp(32px, 5.5vw, 48px);
          height: clamp(32px, 5.5vw, 48px);
          background-color: #4A0E1B;
          -webkit-mask-image: url('/ganesha.png');
          mask-image: url('/ganesha.png');
          -webkit-mask-size: contain; mask-size: contain;
          -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat;
          -webkit-mask-position: center; mask-position: center;
          flex-shrink: 0;
        }

        .ei-card__pre {
          font-family: var(--font-heading, 'Cormorant Garamond', serif);
          font-size: clamp(0.45rem, 1.2vw, 0.72rem);
          color: #8B7030;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          text-align: center;
        }

        .ei-card__names {
          font-family: var(--font-cursive, 'Great Vibes', cursive);
          font-size: clamp(1.8rem, 5vw, 3rem);
          color: #4A0E1B;
          font-weight: 400;
          text-align: center;
          line-height: 1.15;
        }

        .ei-card__names span {
          display: block;
          font-family: var(--font-heading, 'Cormorant Garamond', serif);
          font-size: 0.28em;
          color: #B8922F;
          font-style: italic;
          margin: 2px 0;
        }

        .ei-card__sub {
          font-family: var(--font-heading, 'Cormorant Garamond', serif);
          font-size: clamp(0.42rem, 1.1vw, 0.65rem);
          color: #8B7030;
          font-style: italic;
          text-align: center;
          line-height: 1.5;
        }

        .ei-card__divider {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 4px 0;
          color: #B8922F;
          font-size: 0.35rem;
          opacity: 0.5;
          width: 45%;
        }
        .ei-card__divider hr {
          flex: 1;
          border: none;
          height: 1px;
          background: linear-gradient(90deg, transparent, #B8922F, transparent);
        }

        .ei-card__tag {
          font-family: var(--font-body, 'Inter', sans-serif);
          font-size: clamp(0.4rem, 1vw, 0.6rem);
          color: #B8922F;
          letter-spacing: 0.2em;
        }

        /* ═══════════════════════════════════
           Z=4,5,6: ENVELOPE FLAPS (The Pocket)
           ═══════════════════════════════════ */
        .ei-flap-left, .ei-flap-right, .ei-flap-bottom, .ei-flap-top {
          position: absolute;
          inset: 0;
        }

        .ei-flap-left {
          z-index: 4;
          clip-path: polygon(0 0, 50.5% 50.5%, 0 100%);
          background: linear-gradient(to right, #4A0E1B 0%, #300912 100%);
        }

        .ei-flap-right {
          z-index: 4;
          clip-path: polygon(100% 0, 49.5% 50.5%, 100% 100%);
          background: linear-gradient(to left, #4A0E1B 0%, #300912 100%);
        }

        .ei-flap-bottom {
          z-index: 5;
          clip-path: polygon(-1% 101%, 50% 49.5%, 101% 101%);
          background: linear-gradient(to top, #5A1525 0%, #3A0B15 100%);
          filter: drop-shadow(0 -2px 4px rgba(0,0,0,0.3));
        }

        /* TOP FLAP */
        .ei-flap-top {
          transform-origin: top center;
          transform-style: preserve-3d;
        }

        .ei-flap-top__front, .ei-flap-top__back {
          position: absolute;
          inset: 0;
          backface-visibility: hidden;
          clip-path: polygon(-1% -1%, 101% -1%, 50% 50.5%);
        }

        .ei-flap-top__front {
          background: linear-gradient(to bottom, #6B1D30 0%, #4A0E1B 100%);
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));
        }

        .ei-flap-top__back {
          background: linear-gradient(to top, #2D0A12 0%, #4A0E1B 100%);
          transform: rotateY(180deg);
        }

        /* ═══════════════════════════════════
           Z=7: WAX SEAL
           ═══════════════════════════════════ */
        .ei-seal {
          position: absolute;
          left: 50%;
          top: 50%;
          z-index: 7;
          width: clamp(56px, 12vw, 80px);
          height: clamp(56px, 12vw, 80px);
          border-radius: 50%;
          background: radial-gradient(circle at 38% 32%,
            #E8C87A 0%,
            #D4A853 25%,
            #B8922F 50%,
            #9A7820 75%,
            #7D6218 100%
          );
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          outline: none;
          box-shadow:
            0 4px 25px rgba(0,0,0,0.5),
            0 0 40px rgba(212,168,83,0.1),
            inset 0 2px 4px rgba(255,255,255,0.3),
            inset 0 -3px 6px rgba(0,0,0,0.3);
          border: 2px solid rgba(240,215,140,0.3);
          animation: sealGlow 3s ease-in-out infinite;
        }

        @keyframes sealGlow {
          0%, 100% {
            box-shadow:
              0 4px 25px rgba(0,0,0,0.5),
              0 0 30px rgba(212,168,83,0.08),
              inset 0 2px 4px rgba(255,255,255,0.3),
              inset 0 -3px 6px rgba(0,0,0,0.3);
          }
          50% {
            box-shadow:
              0 4px 25px rgba(0,0,0,0.5),
              0 0 50px rgba(212,168,83,0.2),
              0 0 80px rgba(212,168,83,0.06),
              inset 0 2px 4px rgba(255,255,255,0.3),
              inset 0 -3px 6px rgba(0,0,0,0.3);
          }
        }

        .ei-seal__ring {
          position: absolute;
          inset: 5px;
          border-radius: 50%;
          border: 1px solid rgba(255,248,240,0.2);
          pointer-events: none;
        }

        .ei-seal__txt {
          font-family: var(--font-cursive, 'Great Vibes', cursive);
          font-size: clamp(1.1rem, 2.8vw, 1.7rem);
          color: #FFF8F0;
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
          line-height: 1;
        }

        .ei-seal__txt i {
          font-family: var(--font-heading, serif);
          font-size: 0.4em;
          font-style: italic;
          margin: 0 1px;
          opacity: 0.65;
        }

        /* ═══════════════════════════════════
           TAP HINT (below the envelope)
           ═══════════════════════════════════ */
        .ei-hint {
          position: relative;
          z-index: 10;
          margin-top: clamp(20px, 4vh, 40px);
          font-family: var(--font-heading, 'Cormorant Garamond', serif);
          font-size: clamp(0.7rem, 1.8vw, 0.95rem);
          color: rgba(212, 168, 83, 0.55);
          letter-spacing: 0.2em;
          text-transform: uppercase;
          animation: hintPulse 2.5s ease-in-out infinite;
          cursor: pointer;
          text-align: center;
          white-space: nowrap;
        }

        @keyframes hintPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.85; }
        }

        /* ═══════════════════════════════════
           RESPONSIVE
           ═══════════════════════════════════ */

        /* Phones */
        @media (max-width: 480px) {
          .ei-envelope {
            width: clamp(280px, 90vw, 400px);
          }
          .ei-card__body {
            padding: 14px 10px;
            gap: 3px;
          }
          .ei-seal {
            width: 60px;
            height: 60px;
          }
          .ei-seal__txt { font-size: 1.2rem; }
          .ei-seal__ring { inset: 4px; border-width: 0.8px; }
          .ei-hint {
            margin-top: 16px;
            font-size: 0.65rem;
            letter-spacing: 0.15em;
          }
          .ei-bg-text__line {
            font-size: 1.6rem;
          }
        }

        /* Small phones */
        @media (max-width: 360px) {
          .ei-envelope {
            width: 94vw;
          }
          .ei-card__body {
            padding: 10px 8px;
            gap: 2px;
          }
          .ei-card__names { font-size: 1.6rem; }
          .ei-card__ganesh { width: 28px; height: 28px; }
          .ei-seal { width: 54px; height: 54px; }
          .ei-seal__txt { font-size: 1.1rem; }
        }

        /* Landscape phones */
        @media (max-height: 500px) {
          .ei-envelope {
            width: clamp(280px, 55vw, 420px);
          }
          .ei-bg-text { top: 3%; }
          .ei-bg-text__line { font-size: 1.4rem; }
          .ei-hint { margin-top: 10px; font-size: 0.6rem; }
          .ei-card__body { padding: 8px 6px; gap: 2px; }
          .ei-card__names { font-size: 1.4rem; }
          .ei-card__ganesh { width: 24px; height: 24px; }
          .ei-card__pre { font-size: 0.4rem; }
          .ei-card__sub { font-size: 0.38rem; }
          .ei-seal { width: 48px; height: 48px; }
          .ei-seal__txt { font-size: 1rem; }
        }

        /* Tall phones (Pro Max) */
        @media (min-height: 750px) and (max-width: 480px) {
          .ei-envelope {
            width: 88vw;
          }
          .ei-hint { margin-top: 28px; }
        }
      `}</style>
    </motion.div>
  );
}
