import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchContent, fetchEvents, fetchMenu, fetchMedia, fetchGifts, fetchTheme } from '../utils/api';

const SiteContext = createContext(null);

// Maps theme DB keys → CSS custom property names
const THEME_CSS_MAP = {
  theme_primary:        '--color-burgundy',
  theme_primary_deep:   '--color-burgundy-deep',
  theme_primary_light:  '--color-burgundy-light',
  theme_secondary:      '--color-wine',
  theme_secondary_dark: '--color-wine-dark',
  theme_accent:         '--color-gold',
  theme_accent_light:   '--color-gold-light',
  theme_accent_dark:    '--color-gold-dark',
  theme_accent_pale:    '--color-gold-pale',
  theme_text_primary:   '--text-primary',
  theme_text_secondary: '--text-secondary',
  theme_text_accent:    '--text-gold',
  theme_neutral_1:      '--color-champagne',
  theme_neutral_2:      '--color-ivory',
  theme_neutral_3:      '--color-cream',
};

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
}

function applyThemeColors(theme) {
  if (!theme || typeof theme !== 'object') return;
  const root = document.documentElement;

  // Apply direct CSS variable overrides
  Object.entries(THEME_CSS_MAP).forEach(([dbKey, cssVar]) => {
    if (theme[dbKey]) {
      root.style.setProperty(cssVar, theme[dbKey]);
    }
  });

  // Auto-compute gradients from primary and accent colors
  const primary = theme.theme_primary || '#4A0E1B';
  const primaryDeep = theme.theme_primary_deep || '#2D0A12';
  const primaryLight = theme.theme_primary_light || '#6B1D30';
  const secondaryDark = theme.theme_secondary_dark || '#1A0509';
  const accent = theme.theme_accent || '#D4A853';
  const accentLight = theme.theme_accent_light || '#E8C87A';
  const accentDark = theme.theme_accent_dark || '#B8922F';
  const accentPale = theme.theme_accent_pale || '#F0D78C';

  root.style.setProperty('--gradient-gold', `linear-gradient(135deg, ${accent} 0%, ${accentPale} 25%, ${accent} 50%, ${accentDark} 75%, ${accent} 100%)`);
  root.style.setProperty('--gradient-gold-subtle', `linear-gradient(135deg, ${accent}1a 0%, ${accent}0d 100%)`);
  root.style.setProperty('--gradient-burgundy', `linear-gradient(180deg, ${primary} 0%, ${primaryDeep} 100%)`);
  root.style.setProperty('--gradient-hero', `radial-gradient(ellipse at center top, ${primaryLight} 0%, ${primary} 35%, ${primaryDeep} 70%, ${secondaryDark} 100%)`);
  root.style.setProperty('--gradient-section', `linear-gradient(180deg, ${primaryDeep} 0%, ${theme.theme_secondary || '#3A0B15'} 50%, ${primaryDeep} 100%)`);

  // Accent-derived shadows
  const rgb = hexToRgb(accent);
  if (rgb) {
    root.style.setProperty('--shadow-gold', `0 0 20px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15), 0 0 40px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08)`);
    root.style.setProperty('--shadow-glow', `0 0 30px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3), 0 0 60px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`);
  }

  // Text on gold (dark version of accent for contrast)
  root.style.setProperty('--text-on-gold', primaryDeep);
}

export function SiteProvider({ children }) {
  const [content, setContent] = useState({});
  const [events, setEvents] = useState([]);
  const [menu, setMenu] = useState([]);
  const [media, setMedia] = useState([]);
  const [gifts, setGifts] = useState([]);
  const [theme, setTheme] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [contentData, eventsData, menuData, mediaData, giftsData, themeData] = await Promise.allSettled([
        fetchContent(),
        fetchEvents(),
        fetchMenu(),
        fetchMedia(),
        fetchGifts(),
        fetchTheme(),
      ]);

      if (contentData.status === 'fulfilled') {
        // Transform array of { key, value } into an object
        const contentObj = {};
        if (Array.isArray(contentData.value)) {
          contentData.value.forEach(item => {
            contentObj[item.key] = item.value;
          });
        } else {
          Object.assign(contentObj, contentData.value);
        }
        setContent(contentObj);
      }

      if (eventsData.status === 'fulfilled') {
        setEvents(eventsData.value || []);
      }

      if (menuData.status === 'fulfilled') {
        // Menu may come as grouped object { Starters: [...], ... } or flat array
        const raw = menuData.value || [];
        if (Array.isArray(raw)) {
          setMenu(raw);
        } else if (typeof raw === 'object') {
          // Flatten grouped object into a flat array
          const flat = [];
          Object.entries(raw).forEach(([category, items]) => {
            if (Array.isArray(items)) {
              items.forEach(item => flat.push({ ...item, category, name: item.item_name || item.name }));
            }
          });
          setMenu(flat);
        }
      }

      if (mediaData.status === 'fulfilled') {
        setMedia(mediaData.value || []);
      }

      if (giftsData.status === 'fulfilled') {
        setGifts(giftsData.value || []);
      }

      // Apply theme colors to CSS custom properties
      if (themeData.status === 'fulfilled') {
        const themeObj = themeData.value || {};
        setTheme(themeObj);
        applyThemeColors(themeObj);
      }
    } catch (err) {
      setError(err.message);
      console.error('Failed to load site data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const value = {
    content,
    events,
    menu,
    media,
    gifts,
    theme,
    loading,
    error,
    refresh: loadData,
  };

  return (
    <SiteContext.Provider value={value}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSiteData() {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error('useSiteData must be used within a SiteProvider');
  }
  return context;
}

export default SiteContext;
