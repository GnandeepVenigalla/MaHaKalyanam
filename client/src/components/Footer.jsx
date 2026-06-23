import React from 'react';
import { useSiteData } from '../context/SiteContext';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { content } = useSiteData();
  const { t, language } = useLanguage();
  const groom = language === 'te' ? t('hero.groomName') : (content.groom_name || 'Ranjith');
  const bride = language === 'te' ? t('hero.brideName') : (content.bride_name || 'Nithya');

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__names">
          <span className="footer__name">{groom}</span>
          <span className="footer__amp">&</span>
          <span className="footer__name">{bride}</span>
        </div>
        <div className="footer__line" />
        <p className="footer__date">
          {content.wedding_date
            ? new Date(content.wedding_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()
            : 'AUGUST 24, 2026'
          }
        </p>
        <p className="footer__tag">#NIRA</p>
        <p className="footer__copy">{content.footer_message || t('footer.madeWith')}</p>
      </div>

      <style>{`
        .footer {
          background: #444E41;
          padding: 80px 24px 60px;
          text-align: center;
        }
        .footer__inner {
          max-width: 600px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .footer__names {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          margin-bottom: 24px;
        }
        .footer__name {
          font-family: var(--font-cursive);
          font-size: 3.5rem;
          color: #F8F8F8;
          font-weight: 300;
          letter-spacing: 0.05em;
          display: block;
          text-align: center;
          line-height: 1.15;
        }
        .footer__amp {
          font-family: var(--font-cursive);
          font-size: 2rem;
          color: #D4A373;
          display: block;
          text-align: center;
          line-height: 1.4;
          margin: 2px 0;
        }
        .footer__line {
          width: 60px;
          height: 1px;
          background: rgba(255, 255, 255, 0.3);
          margin: 0 auto 32px;
        }
        .footer__date {
          font-family: var(--font-body);
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.7);
          letter-spacing: 0.25em;
          margin-bottom: 16px;
        }
        .footer__tag {
          font-family: var(--font-body);
          font-size: 0.8rem;
          font-weight: 500;
          color: #D4A373; /* Copper/Gold */
          letter-spacing: 0.15em;
          margin-bottom: 40px;
        }
        .footer__copy {
          font-family: var(--font-body);
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.4);
        }
        .footer__copyright {
          font-family: var(--font-body);
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.3);
          margin-top: 12px;
          letter-spacing: 0.1em;
        }

        @media (max-width: 768px) {
          .footer__name { font-size: 2.5rem; }
          .footer__amp { font-size: 1.8rem; }
        }
      `}</style>
    </footer>
  );
}
