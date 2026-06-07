import React from 'react';
import { useSiteData } from '../context/SiteContext';

export default function Footer() {
  const { content } = useSiteData();
  const groom = content.groom_name || 'Ranjith';
  const bride = content.bride_name || 'Nithya';

  return (
    <footer className="footer">
      <div className="footer__inner">
        <p className="footer__names">{groom} <span className="footer__amp">&</span> {bride}</p>
        <div className="footer__line" />
        <p className="footer__date">
          {content.wedding_date
            ? new Date(content.wedding_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()
            : 'AUGUST 24, 2026'
          }
        </p>
        <p className="footer__tag">#NIRA</p>
        <p className="footer__copy">{content.footer_message || 'Made with ♡ for a beautiful beginning'}</p>
      </div>

      <style>{`
        .footer {
          background: #444E41; /* Dark olive green matching the screenshot */
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
          font-family: var(--font-cursive);
          font-size: 3.5rem;
          color: #F8F8F8;
          margin-bottom: 24px;
          font-weight: 300;
          letter-spacing: 0.05em;
        }
        .footer__amp {
          font-family: var(--font-cursive);
          font-size: 2.5rem;
          margin: 0 8px;
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

        @media (max-width: 768px) {
          .footer__names { font-size: 2.5rem; }
          .footer__amp { font-size: 2rem; }
        }
      `}</style>
    </footer>
  );
}
