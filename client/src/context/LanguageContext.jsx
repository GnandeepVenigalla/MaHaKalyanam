import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchTranslations } from '../utils/api';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');

  const [translations, setTranslations] = useState({});

  useEffect(() => {
    fetchTranslations()
      .then(data => {
        if (data) setTranslations(data);
      })
      .catch(err => console.error('Failed to load translations:', err));
  }, []);

  const t = useCallback((key) => {
    const entry = translations[key];
    if (!entry) {
      return key;
    }
    return entry[language] || entry.en || key;
  }, [language, translations]);

  const value = { language, setLanguage, t };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export default LanguageContext;
