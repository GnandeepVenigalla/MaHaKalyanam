import React from 'react';
import { motion } from 'framer-motion';
import { useSiteData } from '../context/SiteContext';
import { useLanguage } from '../context/LanguageContext';

function formatDateParts(dateStr) {
  if (!dateStr) return { day: '24', month: 'August', year: '2026', weekday: 'Monday' };
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return {
      day: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'long' }),
      year: d.getFullYear(),
      weekday: d.toLocaleDateString('en-US', { weekday: 'long' }),
    };
  } catch { return { day: '24', month: 'August', year: '2026', weekday: 'Monday' }; }
}

const fadeUp = (delay = 0, duration = 1.2) => ({
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration, ease: [0.16, 1, 0.3, 1] },
});

export default function Hero() {
  const { content } = useSiteData();
  const { t, language } = useLanguage();
  const dp = formatDateParts(content.wedding_date);

  return (
    <section className="hero" id="home">
      <div className="hero__content">
        
        {/* Divine Blessings Section */}
        <motion.div className="hero__divine" {...fadeUp(0.1)}>
          <img src="/ganesha.png" alt="Lord Ganesha" className="hero__ganesha" />
          <div className="hero__sloka">
            వక్రతుండ మహాకాయ సూర్యకోటి సమప్రభ<br/>
            నిర్విఘ్నం కురుమేదేవ సర్వకార్యేషు సర్వదా
          </div>
        </motion.div>

        <motion.div className="hero__hashtag" {...fadeUp(0.25)}>
          <span>#NIRA</span>
        </motion.div>

        <motion.div className="hero__elders" {...fadeUp(0.3)}>
          <span className="hero__line"></span>
          <span>{t('hero.blessings')}</span>
          <span className="hero__line"></span>
        </motion.div>

        <div className="hero__names-wrap">
          <motion.h1 className="hero__name" {...fadeUp(0.5)}>
            {language === 'te' ? t('hero.groomName') : (content.groom_name || 'Ranjith')}
          </motion.h1>
          <motion.div className="hero__ampersand-wrap" {...fadeUp(0.8)}>
            <span className="hero__ampersand">&</span>
          </motion.div>
          <motion.h1 className="hero__name" {...fadeUp(0.7)}>
            {language === 'te' ? t('hero.brideName') : (content.bride_name || 'Nithya')}
          </motion.h1>
        </div>

        <motion.div className="hero__date-box" {...fadeUp(1.0)}>
          <div className="hero__date-pill">
            <span className="hero__date-day">{dp.weekday}</span>
            <span className="hero__date-divider">|</span>
            <span className="hero__date-main">{dp.month} {dp.day}, {dp.year}</span>
          </div>
        </motion.div>

      </div>

      <style>{`
        .hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #FDFBF7; /* Very clean cream/ivory background */
          overflow: hidden;
          padding: 120px 24px 60px;
        }

        .hero__content {
          text-align: center;
          z-index: 10;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          max-width: 900px;
        }

        .hero__divine {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 50px;
        }

        .hero__ganesha {
          width: 60px;
          height: auto;
          margin-bottom: 24px;
          filter: brightness(0) saturate(100%) invert(10%) sepia(5%) saturate(10%) hue-rotate(314deg) brightness(96%) contrast(90%); /* Dark color */
        }

        .hero__sloka {
          font-family: 'Tiro Telugu', serif;
          font-size: 1rem;
          line-height: 1.8;
          color: rgba(0, 0, 0, 0.65); /* Readable dark grey */
          text-align: center;
        }

        .hero__hashtag {
          margin-bottom: 24px;
        }

        .hero__hashtag span {
          font-family: var(--font-body);
          font-size: 2rem;
          font-weight: 800;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          background: linear-gradient(135deg, #D4AF37 0%, #F5E28B 35%, #D4AF37 55%, #B8941F 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 0 12px rgba(212, 175, 55, 0.5));
        }

        .hero__elders {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 40px;
        }

        .hero__elders span:not(.hero__line) {
          font-family: var(--font-body);
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: #B29B69; /* Gold color */
        }

        .hero__line {
          width: 30px;
          height: 1px;
          background: #D8CEB3;
        }

        .hero__names-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 60px;
          position: relative;
        }

        .hero__name {
          font-family: var(--font-names, var(--font-heading, 'Cormorant Garamond', serif));
          font-style: italic;
          font-size: calc(clamp(4.5rem, 12vw, 8rem) * var(--font-names-scale, 1));
          font-weight: 400;
          line-height: 0.95;
          color: #1A1C1A; /* Very dark text */
        }

        .hero__ampersand-wrap {
          margin: 10px 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
        }

        .hero__ampersand {
          font-family: var(--font-display, 'Fraunces', serif);
          font-size: clamp(2rem, 4vw, 3rem);
          color: #C0A868; /* Gold */
          font-weight: 400;
        }

        .hero__date-box {
          margin-top: 20px;
        }

        .hero__date-pill {
          display: inline-flex;
          align-items: center;
          gap: 20px;
          padding: 16px 48px;
          background: transparent;
          border: 1px solid #E6DDC4;
          border-radius: 50px;
        }

        .hero__date-day {
          font-family: var(--font-body);
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #A69260;
        }

        .hero__date-divider {
          color: #E6DDC4;
          font-weight: 300;
          font-size: 1.2rem;
        }

        .hero__date-main {
          font-family: var(--font-heading);
          font-size: 1.1rem;
          color: #2D2D2D;
          letter-spacing: 0.05em;
        }

        @media (max-width: 768px) {
          .hero { padding: 60px 24px 40px; }
          .hero__divine { margin-bottom: 30px; }
          .hero__date-pill { padding: 14px 32px; gap: 16px; }
          .hero__date-day { font-size: 0.65rem; }
          .hero__date-main { font-size: 1rem; }
          .hero__elders { margin-bottom: 20px; }
          .hero__ganesha { width: 50px; margin-bottom: 16px; }
          .hero__names-wrap { margin-bottom: 30px; }
        }
      `}</style>
    </section>
  );
}
