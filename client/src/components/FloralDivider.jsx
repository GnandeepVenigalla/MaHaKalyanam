import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export default function FloralDivider() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <div className="floral-divider" ref={ref}>
      <motion.div
        className="floral-divider__inner"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={isInView ? { opacity: 1, scaleX: 1 } : {}}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        <svg
          className="floral-divider__svg"
          viewBox="0 0 600 60"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Left wing */}
          <path
            d="M50,30 Q100,10 150,30 Q120,25 150,15 Q130,22 100,20 Q80,25 50,30"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
            opacity="0.7"
          />
          <path
            d="M70,30 Q110,18 150,30"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            opacity="0.4"
          />

          {/* Left line */}
          <line x1="150" y1="30" x2="260" y2="30" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />

          {/* Center mandala */}
          <circle cx="300" cy="30" r="12" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
          <circle cx="300" cy="30" r="7" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
          <circle cx="300" cy="30" r="3" fill="currentColor" opacity="0.7" />
          
          {/* Mandala petals */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <line
              key={angle}
              x1={300 + 7 * Math.cos((angle * Math.PI) / 180)}
              y1={30 + 7 * Math.sin((angle * Math.PI) / 180)}
              x2={300 + 12 * Math.cos((angle * Math.PI) / 180)}
              y2={30 + 12 * Math.sin((angle * Math.PI) / 180)}
              stroke="currentColor"
              strokeWidth="0.5"
              opacity="0.4"
            />
          ))}

          {/* Small decorative dots */}
          <circle cx="270" cy="30" r="2" fill="currentColor" opacity="0.5" />
          <circle cx="330" cy="30" r="2" fill="currentColor" opacity="0.5" />
          <circle cx="255" cy="30" r="1" fill="currentColor" opacity="0.3" />
          <circle cx="345" cy="30" r="1" fill="currentColor" opacity="0.3" />

          {/* Right line */}
          <line x1="340" y1="30" x2="450" y2="30" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />

          {/* Right wing (mirrored) */}
          <path
            d="M550,30 Q500,10 450,30 Q480,25 450,15 Q470,22 500,20 Q520,25 550,30"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
            opacity="0.7"
          />
          <path
            d="M530,30 Q490,18 450,30"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            opacity="0.4"
          />
        </svg>
      </motion.div>

      <style>{`
        .floral-divider {
          padding: var(--space-xl) 0;
          display: flex;
          justify-content: center;
          overflow: hidden;
        }

        .floral-divider__inner {
          width: 100%;
          max-width: 500px;
          transform-origin: center;
        }

        .floral-divider__svg {
          width: 100%;
          height: auto;
          color: var(--color-gold);
          filter: drop-shadow(0 0 4px rgba(212, 168, 83, 0.2));
        }

        @media (max-width: 768px) {
          .floral-divider__inner {
            max-width: 300px;
          }
        }
      `}</style>
    </div>
  );
}
