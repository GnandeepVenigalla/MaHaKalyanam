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
  theme_names_font:     '--font-names',
  theme_names_size:     '--font-names-scale',
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
  // SKIP text colors and neutrals — those are designed for the light template
  // and the stored theme may have dark-mode values that break contrast
  const SKIP_KEYS = new Set([
    'theme_text_primary', 'theme_text_secondary', 'theme_text_accent',
    'theme_neutral_1', 'theme_neutral_2', 'theme_neutral_3',
  ]);
  Object.entries(THEME_CSS_MAP).forEach(([dbKey, cssVar]) => {
    if (theme[dbKey] && !SKIP_KEYS.has(dbKey)) {
      root.style.setProperty(cssVar, theme[dbKey]);
    }
  });

  // ─── Auto-compute RGB triplets for rgba() usage ───
  // This is the KEY fix: components use rgba(var(--color-accent-rgb), 0.1)
  // instead of hardcoded rgba(212, 168, 83, 0.1)
  const primary = theme.theme_primary || '#4A0E1B';
  const primaryDeep = theme.theme_primary_deep || '#2D0A12';
  const primaryLight = theme.theme_primary_light || '#6B1D30';
  const secondary = theme.theme_secondary || '#3A0B15';
  const secondaryDark = theme.theme_secondary_dark || '#1A0509';
  const accent = theme.theme_accent || '#D4A853';
  const accentLight = theme.theme_accent_light || '#E8C87A';
  const accentDark = theme.theme_accent_dark || '#B8922F';
  const accentPale = theme.theme_accent_pale || '#F0D78C';
  const textPrimary = theme.theme_text_primary || '#2C1810';

  // Compute RGB triplets for ALL key colors
  const rgbMap = {
    '--color-primary-rgb': primary,
    '--color-primary-deep-rgb': primaryDeep,
    '--color-primary-light-rgb': primaryLight,
    '--color-secondary-rgb': secondary,
    '--color-secondary-dark-rgb': secondaryDark,
    '--color-accent-rgb': accent,
    '--color-accent-light-rgb': accentLight,
    '--color-accent-dark-rgb': accentDark,
  };

  Object.entries(rgbMap).forEach(([cssVar, hex]) => {
    const rgb = hexToRgb(hex);
    if (rgb) {
      root.style.setProperty(cssVar, `${rgb.r}, ${rgb.g}, ${rgb.b}`);
    }
  });

  // Text primary RGB for opacity variants
  const textRgb = hexToRgb(textPrimary);
  if (textRgb) {
    root.style.setProperty('--text-primary-rgb', `${textRgb.r}, ${textRgb.g}, ${textRgb.b}`);
    root.style.setProperty('--text-secondary', `rgba(${textRgb.r}, ${textRgb.g}, ${textRgb.b}, 0.65)`);
    root.style.setProperty('--text-tertiary', `rgba(${textRgb.r}, ${textRgb.g}, ${textRgb.b}, 0.45)`);
  }

  // Neutrals
  const neutral1 = theme.theme_neutral_1 || '#F5E6CC';
  const neutral2 = theme.theme_neutral_2 || '#FFF8F0';
  const neutral3 = theme.theme_neutral_3 || '#FBF7F2';

  // ─── Auto-compute gradients — LIGHT theme ───
  root.style.setProperty('--gradient-gold', `linear-gradient(135deg, ${accent} 0%, ${accentLight} 50%, ${accent} 100%)`);
  root.style.setProperty('--gradient-gold-subtle', `linear-gradient(135deg, ${accent}14 0%, ${accent}08 100%)`);
  root.style.setProperty('--gradient-burgundy', `linear-gradient(180deg, ${primary} 0%, ${primaryDeep} 100%)`);
  // Hero & sections use LIGHT backgrounds
  root.style.setProperty('--gradient-hero', `linear-gradient(180deg, ${neutral2} 0%, ${neutral3} 50%, ${neutral2} 100%)`);
  root.style.setProperty('--gradient-section', `linear-gradient(180deg, ${neutral3} 0%, ${neutral2} 50%, ${neutral3} 100%)`);

  // Glass gradient using text primary RGB
  if (textRgb) {
    root.style.setProperty('--gradient-glass', `linear-gradient(135deg, rgba(${textRgb.r}, ${textRgb.g}, ${textRgb.b}, 0.03) 0%, rgba(${textRgb.r}, ${textRgb.g}, ${textRgb.b}, 0.01) 100%)`);
  }

  // ─── Accent-derived shadows ───
  const accentRgb = hexToRgb(accent);
  if (accentRgb) {
    root.style.setProperty('--shadow-gold', `0 0 20px rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.15), 0 0 40px rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.08)`);
    root.style.setProperty('--shadow-glow', `0 0 30px rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.3), 0 0 60px rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.1)`);
  }

  // Text on gold (dark version of primary for contrast)
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

  // Dynamically load the chosen font family from Google Fonts
  useEffect(() => {
    if (!theme.theme_names_font) return;
    const fontName = theme.theme_names_font.split(',')[0].replace(/['"]/g, '').trim();
    if (!fontName) return;

    const linkId = 'site-dynamic-font';
    let link = document.getElementById(linkId);
    if (!link) {
      link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    
    // Only fetch if it doesn't look like a generic system font
    if (!['serif', 'sans-serif', 'cursive', 'monospace', 'system-ui'].includes(fontName.toLowerCase())) {
      link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@300;400;500;600&display=swap`;
    }
  }, [theme.theme_names_font]);

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
