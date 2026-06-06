import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX } from 'react-icons/fi';

const navLinks = [
  { id: 'home', label: 'Home' },
  { id: 'events', label: 'Events' },
  { id: 'menu', label: 'Menu' },
  { id: 'rsvp', label: 'RSVP' },
  { id: 'blessings', label: 'Blessings' },
];

export default function Navigation() {
  const [visible, setVisible] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  // Show nav after scrolling past hero
  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.5);

      // Determine active section
      const sections = navLinks.map(l => document.getElementById(l.id)).filter(Boolean);
      let current = 'home';
      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 150) {
          current = section.id;
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setMobileOpen(false);
    }
  }, []);

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.nav
            className="nav"
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="nav__inner">
              <button
                className="nav__logo"
                onClick={() => scrollTo('home')}
              >
                #MaHaKalyanam
              </button>

              {/* Desktop links */}
              <div className="nav__links">
                {navLinks.map(link => (
                  <button
                    key={link.id}
                    className={`nav__link ${activeSection === link.id ? 'nav__link--active' : ''}`}
                    onClick={() => scrollTo(link.id)}
                  >
                    {link.label}
                  </button>
                ))}
              </div>

              {/* Mobile toggle */}
              <button
                className="nav__toggle"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <FiX /> : <FiMenu />}
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="nav__overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="nav__drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="nav__drawer-header">
                <span className="nav__drawer-title">#MaHaKalyanam</span>
                <button
                  className="nav__drawer-close"
                  onClick={() => setMobileOpen(false)}
                >
                  <FiX />
                </button>
              </div>
              <div className="nav__drawer-links">
                {navLinks.map((link, i) => (
                  <motion.button
                    key={link.id}
                    className={`nav__drawer-link ${activeSection === link.id ? 'nav__drawer-link--active' : ''}`}
                    onClick={() => scrollTo(link.id)}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                  >
                    {link.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: var(--z-fixed);
          background: rgba(45, 10, 18, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(212, 168, 83, 0.1);
        }

        .nav__inner {
          max-width: var(--container-max);
          margin: 0 auto;
          padding: var(--space-md) var(--space-xl);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .nav__logo {
          font-family: var(--font-cursive);
          font-size: 1.4rem;
          color: var(--color-gold);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          text-shadow: 0 0 10px rgba(212, 168, 83, 0.3);
        }

        .nav__links {
          display: flex;
          gap: var(--space-lg);
        }

        .nav__link {
          font-family: var(--font-body);
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-secondary);
          background: none;
          border: none;
          cursor: pointer;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: var(--space-xs) var(--space-sm);
          position: relative;
          transition: color var(--transition-base);
        }

        .nav__link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 50%;
          width: 0;
          height: 1px;
          background: var(--color-gold);
          transition: all var(--transition-base);
          transform: translateX(-50%);
        }

        .nav__link:hover {
          color: var(--text-primary);
        }

        .nav__link:hover::after {
          width: 100%;
        }

        .nav__link--active {
          color: var(--color-gold);
        }

        .nav__link--active::after {
          width: 100%;
        }

        /* Mobile toggle */
        .nav__toggle {
          display: none;
          font-size: 1.5rem;
          color: var(--color-gold);
          cursor: pointer;
          background: none;
          border: none;
          padding: var(--space-xs);
        }

        /* Overlay */
        .nav__overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: calc(var(--z-fixed) + 1);
        }

        /* Drawer */
        .nav__drawer {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 280px;
          background: var(--color-burgundy-deep);
          border-left: 1px solid rgba(212, 168, 83, 0.15);
          z-index: calc(var(--z-fixed) + 2);
          display: flex;
          flex-direction: column;
        }

        .nav__drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-xl);
          border-bottom: 1px solid rgba(212, 168, 83, 0.1);
        }

        .nav__drawer-title {
          font-family: var(--font-cursive);
          font-size: 1.3rem;
          color: var(--color-gold);
        }

        .nav__drawer-close {
          font-size: 1.3rem;
          color: var(--text-secondary);
          cursor: pointer;
          background: none;
          border: none;
          padding: var(--space-xs);
        }

        .nav__drawer-links {
          padding: var(--space-xl);
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .nav__drawer-link {
          font-family: var(--font-heading);
          font-size: 1.2rem;
          font-weight: 500;
          color: var(--text-secondary);
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          padding: var(--space-md);
          border-radius: var(--radius-md);
          transition: all var(--transition-base);
          letter-spacing: 0.05em;
        }

        .nav__drawer-link:hover {
          background: rgba(212, 168, 83, 0.1);
          color: var(--text-primary);
        }

        .nav__drawer-link--active {
          color: var(--color-gold);
          background: rgba(212, 168, 83, 0.08);
        }

        @media (max-width: 768px) {
          .nav__links {
            display: none;
          }
          .nav__toggle {
            display: flex;
          }
        }
      `}</style>
    </>
  );
}
