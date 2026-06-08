import React, { createContext, useContext, useState, useCallback } from 'react';
import translations from '../utils/translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');

  const t = useCallback((key) => {
    const entry = translations[key];
    if (!entry) {
      console.warn(`Translation missing for key: "${key}"`);
      return key;
    }
    return entry[language] || entry.en || key;
  }, [language]);

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
