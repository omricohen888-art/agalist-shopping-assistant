import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type Language = 'he' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Get initial language synchronously to prevent hydration mismatches
const getInitialLanguage = (): Language => {
  if (typeof window === 'undefined') return 'he';
  try {
    const stored = localStorage.getItem('agalist-language') as Language | null;
    return (stored === 'en' || stored === 'he') ? stored : 'he';
  } catch {
    return 'he';
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage());

  // Save to localStorage on change
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('agalist-language', lang);
        // Update HTML lang attribute
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
      }
    } catch (error) {
      console.warn('Failed to save language to localStorage:', error);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useGlobalLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useGlobalLanguage must be used within LanguageProvider');
  }
  return context;
};
