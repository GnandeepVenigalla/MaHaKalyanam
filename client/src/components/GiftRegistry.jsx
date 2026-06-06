import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useSiteData } from '../context/SiteContext';

const defaultGifts = [
  { id: 1, title: 'Bless with a Gift', description: 'Your presence is our greatest gift. However, if you wish to bless us, monetary gifts are welcome.', type: 'money', icon: '🎁', details: 'UPI: harsha@upi', link: '' },
  { id: 2, title: 'Gift Card', description: 'Send a gift card from Amazon or Flipkart for our new home.', type: 'link', icon: '🛍️', link: 'https://www.amazon.in/gift-cards', details: '' },
  { id: 3, title: 'Home Appliances', description: 'Help us set up our new home with kitchen and home appliances.', type: 'item', icon: '🏠', link: '', details: '' },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function GiftRegistry() {
  const { gifts } = useSiteData();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });
  const displayGifts = gifts && gifts.length > 0 ? gifts : defaultGifts;

  return (
    <section className="gifts section" id="gifts" ref={sectionRef}>
      <div className="section__container">
        <div className="section__header">
          <h2 className="section__title">Gift Registry</h2>
          <p className="section__subtitle">Your love is the greatest gift of all</p>
          <div className="section__ornament">
            <span className="section__ornament-dot" />
          </div>
        </div>

        <div className="gifts__grid">
          {displayGifts.map((gift, i) => (
            <motion.div
              key={gift.id || i}
              className="gifts__card glass-card gold-border"
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
            >
              <div className="gifts__icon">{gift.icon || '🎁'}</div>
              <h3 className="gifts__card-title">{gift.title}</h3>
              {gift.description && (
                <p className="gifts__card-desc">{gift.description}</p>
              )}
              {gift.details && (
                <div className="gifts__details">
                  <span className="gifts__details-label">{gift.details}</span>
                </div>
              )}
              {gift.link && (
                <a
                  href={gift.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gifts__link btn btn--outline btn--sm"
                >
                  View Gift Options →
                </a>
              )}
            </motion.div>
          ))}
        </div>

        <motion.p
          className="gifts__note"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          Your presence at our wedding is the most cherished gift. Please do not feel obligated. 💛
        </motion.p>
      </div>

      <style>{`
        .gifts {
          background: var(--color-burgundy-deep);
        }

        .gifts__grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: var(--space-xl);
          max-width: 960px;
          margin: 0 auto;
        }

        .gifts__card {
          padding: var(--space-2xl) var(--space-xl);
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-md);
        }

        .gifts__icon {
          font-size: 3rem;
          line-height: 1;
          margin-bottom: var(--space-sm);
          filter: drop-shadow(0 0 12px rgba(212, 168, 83, 0.3));
        }

        .gifts__card-title {
          font-family: var(--font-heading);
          font-size: 1.4rem;
          font-weight: 600;
          color: var(--color-gold);
          letter-spacing: 0.02em;
        }

        .gifts__card-desc {
          font-size: 0.95rem;
          color: var(--text-secondary);
          line-height: 1.7;
          text-align: center;
          max-width: none;
        }

        .gifts__details {
          background: rgba(212, 168, 83, 0.08);
          border: 1px solid rgba(212, 168, 83, 0.2);
          border-radius: var(--radius-md);
          padding: var(--space-sm) var(--space-lg);
          margin-top: var(--space-xs);
        }

        .gifts__details-label {
          font-family: var(--font-body);
          font-size: 0.9rem;
          color: var(--color-gold-light);
          font-weight: 500;
          letter-spacing: 0.03em;
        }

        .gifts__link {
          margin-top: var(--space-sm);
        }

        .gifts__note {
          text-align: center;
          font-family: var(--font-heading);
          font-size: 1.05rem;
          font-style: italic;
          color: var(--text-tertiary);
          margin-top: var(--space-3xl);
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
        }

        @media (max-width: 600px) {
          .gifts__grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
