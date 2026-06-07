import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useSiteData } from '../context/SiteContext';

const GRAIN_COLORS = ['#8A9A78', '#B87D4B', '#D4A373', '#5E6B52', '#C9956A'];

function RiceGrain({ id, onDone }) {
  const x = Math.random() * 100;
  const color = GRAIN_COLORS[Math.floor(Math.random() * GRAIN_COLORS.length)];
  const size = 4 + Math.random() * 4;
  const dur = 2 + Math.random() * 2;

  return (
    <motion.div
      initial={{ y: -10, x: `${x}vw`, opacity: 1, rotate: 0 }}
      animate={{ y: '100vh', opacity: 0, rotate: 360 + Math.random() * 360 }}
      transition={{ duration: dur, ease: 'linear' }}
      onAnimationComplete={() => onDone(id)}
      style={{
        position: 'fixed', top: 0, left: 0, zIndex: 9999, pointerEvents: 'none',
        width: size, height: size * 2.2,
        borderRadius: '50% / 40%',
        background: color,
        boxShadow: `0 1px 3px rgba(0,0,0,0.1)`,
      }}
    />
  );
}

export default function Akshintalu() {
  const { content } = useSiteData();
  const [grains, setGrains] = useState([]);
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  const shower = useCallback(() => {
    const newGrains = Array.from({ length: 20 }, (_, i) => ({
      id: Date.now() + i,
    }));
    setGrains(prev => [...prev, ...newGrains]);
    setCount(prev => prev + 1);
  }, []);

  const removeGrain = useCallback((id) => {
    setGrains(prev => prev.filter(g => g.id !== id));
  }, []);

  return (
    <section className="aksh section" id="blessings" ref={ref}>
      <div className="section__container">
        <motion.div
          className="section__header"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <span className="section__label">Sacred Tradition</span>
          <h2 className="section__title">Akshintalu</h2>
        </motion.div>

        <motion.p
          className="aksh__desc"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.7 }}
        >
          In Telugu weddings, <em>Akshintalu</em> (అక్షింతలు) — sacred rice grains mixed
          with turmeric — are showered on the couple as a divine blessing. Each
          grain carries wishes of prosperity, love, and eternal togetherness.
        </motion.p>

        <motion.p
          className="aksh__cta-text"
          initial={{ opacity: 0, y: 15 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.35, duration: 0.7 }}
        >
          Shower your blessings upon us and be a part of this sacred tradition.
        </motion.p>

        <motion.button
          className="aksh__btn"
          onClick={shower}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          🌾 Shower Your Blessings
        </motion.button>

        <AnimatePresence>
          {count > 0 && (
            <motion.div
              className="aksh__counter"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              key="counter"
            >
              <span className="aksh__counter-num">{count}</span>
              <span className="aksh__counter-label">{count === 1 ? 'blessing' : 'blessings'} showered</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {grains.map(g => (
        <RiceGrain key={g.id} id={g.id} onDone={removeGrain} />
      ))}

      <style>{`
        .aksh {
          background: var(--white, #FDFAF6);
          text-align: center;
        }
        .aksh__desc {
          font-family: var(--font-body);
          font-size: 1rem;
          color: var(--charcoal-soft, #4A4A4A);
          line-height: 1.9;
          max-width: 560px;
          margin: 0 auto 12px;
          text-align: center;
        }
        .aksh__desc em {
          color: var(--copper, #B87D4B);
          font-style: italic;
          font-weight: 500;
        }
        .aksh__cta-text {
          font-family: var(--font-heading);
          font-size: 0.95rem;
          font-style: italic;
          color: var(--charcoal-soft, #4A4A4A);
          opacity: 0.7;
          margin-bottom: 32px;
          text-align: center;
        }
        .aksh__btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 40px;
          font-family: var(--font-body);
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--white, #FDFAF6);
          background: var(--sage, #5E6B52);
          border: none;
          border-radius: 100px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px rgba(94,107,82,0.2);
        }
        .aksh__btn:hover {
          background: var(--sage-deep, #3D4636);
          box-shadow: 0 6px 24px rgba(94,107,82,0.3);
        }
        .aksh__counter {
          margin-top: 28px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        .aksh__counter-num {
          font-family: var(--font-heading);
          font-size: 2.5rem;
          color: var(--sage, #5E6B52);
          line-height: 1;
        }
        .aksh__counter-label {
          font-family: var(--font-body);
          font-size: 0.7rem;
          color: var(--charcoal-soft, #4A4A4A);
          opacity: 0.5;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }
      `}</style>
    </section>
  );
}
