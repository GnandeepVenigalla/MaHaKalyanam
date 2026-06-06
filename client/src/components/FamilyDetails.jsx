import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useSiteData } from '../context/SiteContext';

export default function FamilyDetails() {
  const { content } = useSiteData();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const brideParents = content.bride_parents || 'Mr. & Mrs. Bride\'s Parents';
  const groomParents = content.groom_parents || 'Mr. & Mrs. Groom\'s Parents';

  return (
    <section className="family section" id="family" ref={ref}>
      <div className="section__container">
        <div className="section__header">
          <h2 className="section__title">Our Families</h2>
          <p className="section__subtitle">With the blessings of our beloved families</p>
          <div className="section__ornament">
            <span className="section__ornament-dot" />
          </div>
        </div>

        <div className="family__grid">
          {/* Groom's Family */}
          <motion.div
            className="family__card glass-card"
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="family__card-border" />
            <span className="family__label">Groom's Family</span>
            <h3 className="family__name">{content.groom_name || 'Ranjith'}</h3>
            <div className="family__divider" />
            <p className="family__subtitle">Son of</p>
            <p className="family__parents">{groomParents}</p>
          </motion.div>

          {/* Center ornament */}
          <motion.div
            className="family__center"
            initial={{ opacity: 0, scale: 0 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="family__center-symbol">💍</div>
          </motion.div>

          {/* Bride's Family */}
          <motion.div
            className="family__card glass-card"
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          >
            <div className="family__card-border" />
            <span className="family__label">Bride's Family</span>
            <h3 className="family__name">{content.bride_name || 'Nithaya'}</h3>
            <div className="family__divider" />
            <p className="family__subtitle">Daughter of</p>
            <p className="family__parents">{brideParents}</p>
          </motion.div>
        </div>
      </div>

      <style>{`
        .family {
          background: var(--gradient-section);
        }

        .family__grid {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: var(--space-xl);
          align-items: center;
          max-width: 900px;
          margin: 0 auto;
        }

        .family__card {
          padding: var(--space-3xl) var(--space-2xl);
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .family__card-border {
          position: absolute;
          top: 10px;
          left: 10px;
          right: 10px;
          bottom: 10px;
          border: 1px solid rgba(212, 168, 83, 0.15);
          border-radius: var(--radius-md);
          pointer-events: none;
        }

        .family__label {
          font-family: var(--font-body);
          font-size: 0.75rem;
          color: var(--color-gold);
          text-transform: uppercase;
          letter-spacing: 0.2em;
          font-weight: 600;
          display: block;
          margin-bottom: var(--space-md);
        }

        .family__name {
          font-family: var(--font-cursive);
          font-size: 2.5rem;
          color: var(--text-primary);
          margin-bottom: var(--space-lg);
        }

        .family__divider {
          width: 40px;
          height: 1px;
          background: var(--gradient-gold);
          margin: 0 auto var(--space-lg);
          opacity: 0.5;
        }

        .family__subtitle {
          font-family: var(--font-heading);
          font-size: 0.95rem;
          color: var(--text-tertiary);
          font-style: italic;
          margin-bottom: var(--space-sm);
        }

        .family__parents {
          font-family: var(--font-heading);
          font-size: 1.15rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .family__center {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .family__center-symbol {
          font-size: 2rem;
          filter: drop-shadow(0 0 8px rgba(212, 168, 83, 0.4));
        }

        @media (max-width: 768px) {
          .family__grid {
            grid-template-columns: 1fr;
            gap: var(--space-lg);
          }
          .family__center {
            order: -1;
          }
          .family__card {
            padding: var(--space-2xl) var(--space-xl);
          }
          .family__name {
            font-size: 2rem;
          }
        }
      `}</style>
    </section>
  );
}
