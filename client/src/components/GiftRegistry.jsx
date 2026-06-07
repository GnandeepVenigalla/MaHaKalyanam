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
              className="gifts__card"
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
              
              <a
                href={gift.link || `https://www.amazon.com/s?k=${encodeURIComponent(gift.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="gifts__link"
              >
                {gift.link ? 'View Gift Options →' : 'Search on Amazon →'}
              </a>
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
          background: #EFE9D9; /* Matching the Families section background */
          padding: 80px 24px;
        }

        .section__header {
          text-align: center;
          margin-bottom: 60px;
        }

        .section__title {
          font-family: var(--font-heading);
          font-size: 3.5rem;
          font-style: italic;
          color: #702632; /* Burgundy */
          font-weight: 400;
          margin-bottom: 16px;
        }

        .section__subtitle {
          font-family: var(--font-body);
          font-size: 0.75rem;
          font-weight: 600;
          color: #A68B61; /* Gold */
          letter-spacing: 0.3em;
          text-transform: uppercase;
        }

        .gifts__grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 40px;
          max-width: 960px;
          margin: 0 auto;
        }

        .gifts__card {
          background: #FDFBF7; /* Slightly lighter than the background for contrast */
          border: 1px solid #D8CEB3;
          padding: 50px 30px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          transition: transform 0.3s ease;
        }

        .gifts__card:hover {
          transform: translateY(-5px);
        }

        .gifts__icon {
          font-size: 3rem;
          line-height: 1;
          margin-bottom: 10px;
        }

        .gifts__card-title {
          font-family: var(--font-heading);
          font-size: 2rem;
          font-style: italic;
          font-weight: 400;
          color: #702632; /* Burgundy */
        }

        .gifts__card-desc {
          font-family: var(--font-heading);
          font-size: 1.15rem;
          color: #2D2D2D;
          line-height: 1.6;
          text-align: center;
        }

        .gifts__details {
          background: #EFE9D9;
          border: 1px dashed #D8CEB3;
          padding: 10px 20px;
          margin-top: 5px;
        }

        .gifts__details-label {
          font-family: var(--font-body);
          font-size: 0.85rem;
          color: #2D2D2D;
          font-weight: 500;
          letter-spacing: 0.05em;
        }

        .gifts__link {
          margin-top: 15px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-body);
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.2em;
          color: #A68B61;
          text-transform: uppercase;
          transition: all 0.3s;
          border: 1px solid #C4B59D;
          padding: 12px 24px;
          border-radius: 50px;
          text-decoration: none;
        }
        
        .gifts__link:hover {
          background: #A68B61;
          color: #FFFFFF;
          border-color: #A68B61;
        }

        .gifts__note {
          text-align: center;
          font-family: var(--font-heading);
          font-size: 1.25rem;
          font-style: italic;
          color: #702632;
          margin-top: 60px;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
          opacity: 0.8;
        }

        @media (max-width: 600px) {
          .gifts__grid {
            grid-template-columns: 1fr;
          }
          .section__title {
            font-size: 2.8rem;
          }
        }
      `}</style>
    </section>
  );
}
