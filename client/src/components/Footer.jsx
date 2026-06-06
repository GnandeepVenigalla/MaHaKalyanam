import React from 'react';
import { useSiteData } from '../context/SiteContext';

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  } catch { return dateStr; }
}

export default function Footer() {
  const { content } = useSiteData();
  const groomName = content.groom_name || 'Ranjith';
  const brideName = content.bride_name || 'Nithaya';
  const weddingDate = formatDate(content.wedding_date);
  const tagline = content.tagline || '#MaHaKalyanam';
  return (
    <footer className="footer">
      <div className="footer__gold-line" />
      <div className="footer__content">
        <div className="footer__names">
          <span className="footer__name-text">{groomName}</span>
          <span className="footer__amp">&</span>
          <span className="footer__name-text">{brideName}</span>
        </div>

        <p className="footer__hashtag">{tagline}</p>

        <p className="footer__date">{weddingDate}</p>

        <div className="footer__divider" />

        <p className="footer__made">
          Made with <span className="footer__heart">❤️</span> for our special day
        </p>

        <p className="footer__copy">
          © 2026 • All rights reserved to GD Enterprises
        </p>
      </div>

      <style>{`
        .footer {
          position: relative;
          background: var(--color-wine-dark);
          padding: 0;
        }

        .footer__gold-line {
          height: 2px;
          background: var(--gradient-gold);
          opacity: 0.5;
        }

        .footer__content {
          padding: var(--space-4xl) var(--space-xl) var(--space-2xl);
          text-align: center;
        }

        .footer__names {
          font-family: var(--font-cursive);
          font-size: 2.5rem;
          color: var(--text-primary);
          margin-bottom: var(--space-md);
        }

        .footer__name-text {
          color: var(--text-primary);
        }

        .footer__amp {
          font-family: var(--font-heading);
          font-size: 1rem;
          color: var(--color-gold);
          margin: 0 var(--space-md);
          font-style: italic;
        }

        .footer__hashtag {
          font-family: var(--font-heading);
          font-size: 1.1rem;
          color: var(--color-gold);
          letter-spacing: 0.15em;
          margin-bottom: var(--space-sm);
        }

        .footer__date {
          font-family: var(--font-body);
          font-size: 0.9rem;
          color: var(--text-tertiary);
          letter-spacing: 0.1em;
        }

        .footer__divider {
          width: 60px;
          height: 1px;
          background: rgba(212, 168, 83, 0.3);
          margin: var(--space-2xl) auto;
        }

        .footer__made {
          font-family: var(--font-body);
          font-size: 0.85rem;
          color: var(--text-tertiary);
          margin-bottom: var(--space-sm);
        }

        .footer__heart {
          display: inline-block;
          animation: float 3s ease-in-out infinite;
        }

        .footer__copy {
          font-family: var(--font-body);
          font-size: 0.75rem;
          color: var(--text-tertiary);
          opacity: 0.5;
        }
      `}</style>
    </footer>
  );
}
