import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useSiteData } from '../context/SiteContext';

export default function CoupleStory() {
  const { content } = useSiteData();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const story = content.couple_story || 
    `Every love story is beautiful, but ours is our favorite. What started as a chance meeting blossomed into a bond that grows stronger with each passing day. Together, we've laughed, dreamed, and built a future filled with love and joy. Now, we invite you to be a part of the next beautiful chapter of our journey — as we become one.`;

  return (
    <section className="couple-story section" id="our-story" ref={ref}>
      <div className="section__container">
        <div className="section__header">
          <h2 className="section__title">Our Story</h2>
          <p className="section__subtitle">A tale written in the stars</p>
          <div className="section__ornament">
            <span className="section__ornament-dot" />
          </div>
        </div>

        <motion.div
          className="couple-story__content"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        >
          <div className="couple-story__quote-mark">"</div>
          
          <div className="couple-story__text-wrapper">
            {story.split('\n').filter(p => p.trim()).map((paragraph, i) => (
              <motion.p
                key={i}
                className="couple-story__text"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 + i * 0.15 }}
              >
                {paragraph}
              </motion.p>
            ))}
          </div>

          <div className="couple-story__quote-mark couple-story__quote-mark--end">"</div>
        </motion.div>

        <motion.div
          className="couple-story__signature"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <span className="couple-story__sig-text">{content.groom_name || 'Ranjith'} & {content.bride_name || 'Nithaya'}</span>
        </motion.div>
      </div>

      <style>{`
        .couple-story {
          background: var(--color-burgundy-deep);
        }

        .couple-story__content {
          max-width: 700px;
          margin: 0 auto;
          position: relative;
          padding: var(--space-3xl) var(--space-2xl);
        }

        .couple-story__quote-mark {
          font-family: var(--font-cursive);
          font-size: 6rem;
          color: var(--color-gold);
          opacity: 0.2;
          line-height: 0.5;
          position: absolute;
          top: 0;
          left: -10px;
        }

        .couple-story__quote-mark--end {
          top: auto;
          left: auto;
          bottom: 0;
          right: -10px;
        }

        .couple-story__text-wrapper {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }

        .couple-story__text {
          font-family: var(--font-heading);
          font-size: 1.2rem;
          color: var(--text-secondary);
          line-height: 1.9;
          text-align: center;
          font-style: italic;
          font-weight: 300;
          max-width: none;
        }

        .couple-story__signature {
          text-align: center;
          margin-top: var(--space-2xl);
        }

        .couple-story__sig-text {
          font-family: var(--font-cursive);
          font-size: 1.8rem;
          color: var(--color-gold);
        }

        @media (max-width: 768px) {
          .couple-story__content {
            padding: var(--space-2xl) var(--space-md);
          }
          .couple-story__quote-mark {
            font-size: 4rem;
            left: 0;
          }
          .couple-story__quote-mark--end {
            right: 0;
          }
          .couple-story__text {
            font-size: 1.05rem;
          }
        }
      `}</style>
    </section>
  );
}
