import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';

const navLinks = [
  { id: 'home', label: 'Home', path: '/' },
  { id: 'events', label: 'Events', path: '/#events' },
  { id: 'videos', label: 'Our Story', path: '/videos' },
  { id: 'rsvp', label: 'RSVP', path: '/#rsvp' },
];

export default function Navigation() {
  const [visible, setVisible] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState('home');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.15 || location.pathname !== '/');
      if (location.pathname === '/') {
        const sections = navLinks.map(l => document.getElementById(l.id)).filter(Boolean);
        let cur = 'home';
        for (const s of sections) { if (s.getBoundingClientRect().top <= 120) cur = s.id; }
        setActive(cur);
      } else {
        const curLink = navLinks.find(l => l.path === location.pathname);
        if (curLink) setActive(curLink.id);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // initial check
    return () => window.removeEventListener('scroll', onScroll);
  }, [location.pathname]);

  const go = useCallback((link) => {
    if (link.path === '/') {
      if (location.pathname === '/') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        navigate('/');
      }
    } else if (link.path.startsWith('/#')) {
      if (location.pathname === '/') {
        document.getElementById(link.id)?.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate(link.path);
        // Add a slight delay to allow page render before scroll
        setTimeout(() => {
          document.getElementById(link.id)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      navigate(link.path);
      window.scrollTo(0, 0);
    }
    setMobileOpen(false);
  }, [location.pathname, navigate]);

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.nav 
            className="nav" 
            initial={{ y: -100, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            exit={{ y: -100, opacity: 0 }} 
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="nav__inner">
              <button className="nav__logo" onClick={() => go(navLinks[0])}>#NIRA</button>
              <div className="nav__links">
                {navLinks.map(l => (
                  <button key={l.id} className={`nav__link ${active === l.id ? 'nav__link--on' : ''}`} onClick={() => go(l)}>
                    {l.label}
                  </button>
                ))}
              </div>
              <button className="nav__toggle" onClick={() => setMobileOpen(true)} aria-label="Menu">
                <FiMenu />
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div className="nav__overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} />
            <motion.div className="nav__drawer" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
              <div className="nav__drawer-top">
                <span className="nav__drawer-logo">#NIRA</span>
                <button onClick={() => setMobileOpen(false)}><FiX size={24} /></button>
              </div>
              <div className="nav__drawer-links">
                {navLinks.map((l, i) => (
                  <motion.button 
                    key={l.id} 
                    className={`nav__drawer-link ${active === l.id ? 'active' : ''}`} 
                    onClick={() => go(l)} 
                    initial={{ opacity: 0, x: 30 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: 0.1 * i, duration: 0.4 }}
                  >
                    {l.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .nav {
          position: fixed; top: 0; left: 0; right: 0;
          z-index: var(--z-fixed);
          background: rgba(var(--text-primary-rgb), 0.02);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--color-champagne);
        }
        .nav__inner {
          max-width: var(--container-max);
          margin: 0 auto;
          padding: 20px 32px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .nav__logo {
          font-family: var(--font-display, 'Fraunces', serif);
          font-size: 1.5rem;
          font-weight: 500;
          color: var(--color-gold-dark);
        }
        .nav__links { display: flex; gap: 40px; }
        .nav__link {
          font-family: var(--font-body);
          font-size: 0.75rem; font-weight: 500;
          letter-spacing: 0.15em; text-transform: uppercase;
          color: var(--text-secondary);
          position: relative;
          transition: color 0.3s ease;
          padding: 8px 0;
        }
        .nav__link::after {
          content: ''; position: absolute;
          bottom: 0; left: 50%; transform: translateX(-50%); width: 0; height: 1.5px;
          background: var(--color-burgundy); transition: width 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .nav__link:hover { color: var(--color-burgundy); }
        .nav__link:hover::after { width: 100%; }
        .nav__link--on { color: var(--color-burgundy); }
        .nav__link--on::after { width: 100%; }

        .nav__toggle { display: none; font-size: 1.5rem; color: var(--color-burgundy); }
        .nav__overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.2); z-index: calc(var(--z-fixed)+1); backdrop-filter: blur(4px); }
        
        .nav__drawer {
          position: fixed; top: 0; right: 0; bottom: 0;
          width: 320px; max-width: 100vw;
          background: var(--color-ivory);
          z-index: calc(var(--z-fixed)+2);
          padding: 32px;
          display: flex; flex-direction: column;
          box-shadow: -20px 0 60px rgba(0,0,0,0.05);
        }
        .nav__drawer-top {
          display: flex; justify-content: space-between; align-items: center;
          padding-bottom: 40px;
        }
        .nav__drawer-logo { font-family: var(--font-display, 'Fraunces', serif); font-size: 1.4rem; font-weight: 500; color: var(--color-gold-dark); }
        .nav__drawer-top button { color: var(--color-burgundy); transition: transform 0.3s; }
        .nav__drawer-top button:hover { transform: rotate(90deg); color: var(--color-burgundy-deep); }
        
        .nav__drawer-links {
          display: flex; flex-direction: column; gap: 24px;
          margin-top: 20px;
        }
        .nav__drawer-link {
          font-family: var(--font-heading); font-size: 2.2rem;
          color: var(--text-tertiary); text-align: left;
          transition: all 0.3s ease;
          position: relative;
          width: fit-content;
        }
        .nav__drawer-link:hover { color: var(--color-burgundy); transform: translateX(10px); }
        .nav__drawer-link.active { color: var(--color-gold-dark); }

        @media (max-width: 768px) {
          .nav__inner { padding: 16px 24px; }
          .nav__links { display: none; }
          .nav__toggle { display: flex; }
          .nav__drawer { padding: 24px; }
        }
      `}</style>
    </>
  );
}
