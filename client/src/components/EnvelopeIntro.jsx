import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

export default function EnvelopeIntro({ onOpen, groomName, brideName }) {
  const { language, setLanguage, t } = useLanguage();
  // States: idle -> closing -> flying -> transparent_pause -> expanding -> done
  const [animState, setAnimState] = useState('idle');

  const handleOpen = () => {
    if (animState !== 'idle') return;
    setAnimState('closing');

    // 1. Content fades out
    setTimeout(() => {
      setAnimState('flying');

      // 2. Ring flies in and scales to 1
      setTimeout(() => {
        setAnimState('transparent_pause');

        // 3. Brief pause with transparent background to reveal hero through the hole
        setTimeout(() => {
          setAnimState('expanding');

          // 4. Ring expands massively to reveal full page
          setTimeout(() => {
            setAnimState('done');
            onOpen();
          }, 1200);
        }, 400);
      }, 800);
    }, 500);
  };

  useEffect(() => {
    const h = (e) => { if (e.key === 'Enter' || e.key === ' ') handleOpen(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [animState]);

  const isIntroSolid = ['idle', 'closing', 'flying'].includes(animState);
  const showContent = ['idle', 'closing'].includes(animState);
  const showRing = ['flying', 'transparent_pause', 'expanding'].includes(animState);

  return (
    <AnimatePresence>
      {animState !== 'done' && (
        <motion.div
          className="intro"
          style={{ background: isIntroSolid ? '#FDFAF6' : 'transparent' }}
          exit={{ opacity: 0 }}
        >
          
          {/* THE MAGIC RING */}
          {showRing && (
            <motion.div
              className="magic-ring"
              initial={{ scale: 0, y: 300 }}
              animate={{ 
                scale: animState === 'expanding' ? 80 : 1, 
                y: 0 
              }}
              transition={{ 
                duration: animState === 'flying' ? 0.8 : (animState === 'expanding' ? 1.2 : 0),
                ease: animState === 'flying' ? [0.22, 1, 0.36, 1] : [0.6, 0.05, 0.01, 0.99] // Smooth fly in, sharp exponential expand
              }}
            />
          )}

          {/* CONTENT (Fades out first) */}
          <AnimatePresence>
            {showContent && (
              <motion.div
                className="intro__content-wrap"
                initial={{ opacity: 1 }}
                animate={{ opacity: animState === 'closing' ? 0 : 1 }}
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
                    <span>{groomName || 'Ranjith'}</span>
                    <em>&</em>
                    <span>{brideName || 'Nithya'}</span>
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

            /* THE MAGIC RING STYLES */
            .magic-ring {
              position: absolute;
              top: 50%; left: 50%;
              width: 120px; height: 120px;
              margin-top: -60px; margin-left: -60px;
              border: 5px solid #D4AF37; /* More metallic gold */
              border-radius: 50%;
              /* The 400vw box-shadow creates a solid background around the ring once the container becomes transparent */
              box-shadow: 0 0 0 400vw #FDFAF6, 
                          inset 0 4px 6px rgba(255,255,255,0.4), /* 3D highlight */
                          inset 0 -4px 6px rgba(100,70,10,0.4), /* 3D shadow */
                          0 4px 6px rgba(100,70,10,0.4),
                          0 0 30px rgba(212,175,55,0.5);
              z-index: 10;
            }

            /* THE DIAMOND */
            .magic-ring::after {
              content: '';
              position: absolute;
              top: -14px;
              left: 50%;
              transform: translateX(-50%) rotate(45deg);
              width: 22px;
              height: 22px;
              background: linear-gradient(135deg, #ffffff 0%, #e0f7fa 50%, #ffffff 100%);
              border: 1px solid #b2ebf2;
              border-radius: 3px;
              box-shadow: 0 0 15px rgba(255,255,255,0.9), 
                          inset 0 0 8px rgba(255,255,255,1);
              z-index: 11;
            }

            /* DIAMOND SPARKLE */
            .magic-ring::before {
              content: '✨';
              position: absolute;
              top: -26px;
              left: 50%;
              transform: translateX(-50%);
              font-size: 14px;
              color: white;
              z-index: 12;
              animation: sparkle 1s infinite alternate;
            }

            @keyframes sparkle {
              0% { opacity: 0.5; transform: translateX(-50%) scale(0.8); }
              100% { opacity: 1; transform: translateX(-50%) scale(1.2); }
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
