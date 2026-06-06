import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WEDDING_DATE = new Date('2026-06-24T09:00:00');

function getTimeLeft() {
  const now = new Date();
  const diff = WEDDING_DATE - now;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function CountdownBox({ value, label }) {
  return (
    <div className="countdown__box glass-card gold-border">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          className="countdown__number"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {String(value).padStart(2, '0')}
        </motion.span>
      </AnimatePresence>
      <span className="countdown__label">{label}</span>
    </div>
  );
}

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="countdown section" id="countdown">
      <div className="section__container">
        <div className="section__header">
          <h2 className="section__title">Counting Down To Our Special Day</h2>
          <div className="section__ornament">
            <span className="section__ornament-dot" />
          </div>
        </div>

        <div className="countdown__grid">
          <CountdownBox value={timeLeft.days} label="Days" />
          <CountdownBox value={timeLeft.hours} label="Hours" />
          <CountdownBox value={timeLeft.minutes} label="Minutes" />
          <CountdownBox value={timeLeft.seconds} label="Seconds" />
        </div>
      </div>

      <style>{`
        .countdown {
          background: var(--color-burgundy-deep);
        }

        .countdown__grid {
          display: flex;
          justify-content: center;
          gap: var(--space-xl);
          flex-wrap: wrap;
        }

        .countdown__box {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 140px;
          height: 140px;
          padding: var(--space-lg);
          text-align: center;
          overflow: hidden;
        }

        .countdown__number {
          font-family: var(--font-display);
          font-size: 3rem;
          font-weight: 700;
          color: var(--color-gold);
          line-height: 1;
          display: block;
          text-shadow: 0 0 20px rgba(212, 168, 83, 0.3);
        }

        .countdown__label {
          font-family: var(--font-body);
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.2em;
          margin-top: var(--space-sm);
        }

        @media (max-width: 600px) {
          .countdown__grid {
            gap: var(--space-md);
          }
          .countdown__box {
            width: 75px;
            height: 90px;
            padding: var(--space-md);
          }
          .countdown__number {
            font-size: 2rem;
          }
          .countdown__label {
            font-size: 0.6rem;
          }
        }
      `}</style>
    </section>
  );
}
