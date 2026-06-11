import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useSiteData } from '../context/SiteContext';
import { useLanguage } from '../context/LanguageContext';

const InfinitySymbol = () => (
  <svg viewBox="0 0 64 64" width="56" height="56" fill="none" stroke="var(--theme-accent, #D4A853)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M 22 24 C 8 24, 8 40, 22 40 C 32 40, 32 24, 42 24 C 56 24, 56 40, 42 40 C 32 40, 32 24, 22 24 Z" />
  </svg>
);

export default function FamilyDetails() {
  const { content } = useSiteData();
  const ref = useRef(null);
  const { t, language } = useLanguage();
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const brideParents = language === 'te' ? t('family.brideParents') : (content.bride_parents || "Venkata Ramana & Revathi");
  const groomParents = language === 'te' ? t('family.groomParents') : (content.groom_parents || "Siva Gajapathi Raju & Kalpana");
  const welcomeMessage = language === 'te' ? t('family.welcome') : (content.welcome_message || t('family.welcome'));

  return (
    <section className="fam" id="family" ref={ref}>
      <div className="fam__container">
        
        {/* Top Decoration */}
        <div className="fam__decor">
          <div className="fam__decor-line" />
          <span className="fam__decor-icon">❦</span>
          <div className="fam__decor-line" />
        </div>

        <motion.div 
          className="fam__header"
          initial={{ opacity: 0, y: 30 }} 
          animate={inView ? { opacity: 1, y: 0 } : {}} 
          transition={{ duration: 0.7 }}
        >
          <span className="fam__label">{t('family.together')}</span>
          
          <div className="fam__invite-text">
            {welcomeMessage.split('\\n').map((line, i) => (
              <React.Fragment key={i}>
                {line}
                <br />
              </React.Fragment>
            ))}
          </div>
        </motion.div>

        <div className="fam__grid">
          <motion.div 
            className="fam__card" 
            initial={{ opacity: 0, y: 20 }} 
            animate={inView ? { opacity: 1, y: 0 } : {}} 
            transition={{ duration: 0.7, ease: [0.22,1,0.36,1], delay: 0.2 }}
          >
            <h3 className="fam__name">{language === 'te' ? t('family.groomName') : (content.groom_name || 'Harsha')}</h3>
            <p className="fam__role">{t('family.sonOf')}</p>
            <p className="fam__parents">{groomParents}</p>
          </motion.div>

          <motion.div 
            className="fam__center"
            initial={{ opacity: 0, scale: 0 }} 
            animate={inView ? { opacity: 1, scale: 1 } : {}} 
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <InfinitySymbol />
          </motion.div>

          <motion.div 
            className="fam__card" 
            initial={{ opacity: 0, y: 20 }} 
            animate={inView ? { opacity: 1, y: 0 } : {}} 
            transition={{ duration: 0.7, ease: [0.22,1,0.36,1], delay: 0.4 }}
          >
            <h3 className="fam__name">{language === 'te' ? t('family.brideName') : (content.bride_name || 'Manasa')}</h3>
            <p className="fam__role">{t('family.daughterOf')}</p>
            <p className="fam__parents">{brideParents}</p>
          </motion.div>
        </div>

        {/* Bottom Decoration */}
        <div className="fam__decor fam__decor--bottom">
          <div className="fam__decor-line" />
          <span className="fam__decor-icon">❦</span>
          <div className="fam__decor-line" />
        </div>

      </div>

      <style>{`
        .fam { 
          background: #EFE9D9; /* Very light beige/ivory matching screenshot */
          padding: 80px 24px;
        }
        
        .fam__container {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .fam__decor {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 40px;
          width: 100%;
          justify-content: center;
        }

        .fam__decor--bottom {
          margin-bottom: 0;
          margin-top: 60px;
        }

        .fam__decor-line {
          width: 100px;
          height: 1px;
          background: #C4B59D;
        }

        .fam__decor-icon {
          color: #A38072;
          font-size: 0.9rem;
        }

        .fam__header {
          text-align: center;
          margin-bottom: 50px;
          width: 100%;
        }

        .fam__label {
          font-family: var(--font-body);
          font-size: 0.7rem;
          font-weight: 600;
          color: #B28B47; /* Gold */
          text-transform: uppercase;
          letter-spacing: 0.35em;
          display: block;
          margin-bottom: 30px;
        }

        .fam__invite-text {
          font-family: var(--font-heading);
          font-size: 1.25rem;
          line-height: 1.8;
          font-style: italic;
          color: #2D2D2D;
          max-width: 600px;
          margin: 0 auto;
        }

        .fam__grid {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 40px;
          width: 100%;
        }

        .fam__center {
          font-size: 2rem;
          text-align: center;
        }

        .fam__card {
          background: transparent;
          border: 1px solid #D8CEB3;
          padding: 50px 30px;
          text-align: center;
          background: #FDFBF7; /* Slightly lighter than the background for contrast */
        }

        .fam__name {
          font-family: var(--font-names, var(--font-heading));
          font-size: calc(3.5rem * var(--font-names-scale, 1));
          font-style: italic;
          color: #702632; /* Burgundy text for names */
          margin-bottom: 24px;
          font-weight: 400;
        }

        .fam__role {
          font-family: var(--font-body);
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.25em;
          color: #A68B61; /* Gold */
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .fam__parents {
          font-family: var(--font-heading);
          font-size: 1.15rem;
          font-style: italic;
          color: #2D2D2D;
        }

        @media (max-width: 768px) {
          .fam__grid { grid-template-columns: 1fr; gap: 20px; }
          .fam__grid .fam__card:first-child { order: -1; }
          .fam__center { order: 0; margin: 10px 0; justify-self: center; display: flex; justify-content: center; width: 100%; }
          .fam__grid .fam__card:last-child { order: 1; }
          .fam__card { padding: 40px 20px; }
          .fam__name { font-size: calc(2.8rem * var(--font-names-scale, 1)); }
          .fam__invite-text { font-size: 1.1rem; }
          .fam__decor-line { width: 60px; }
        }
      `}</style>
    </section>
  );
}
