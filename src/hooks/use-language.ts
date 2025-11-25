import { useEffect, useState } from "react";

export type Language = "he" | "en";

const LANGUAGE_STORAGE_KEY = "agalist-language";
const DEFAULT_LANGUAGE: Language = "he";

const getStoredLanguage = (): Language => {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE;
  }
  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return (stored === "en" || stored === "he" ? stored : DEFAULT_LANGUAGE);
};

export const useLanguage = () => {
  const [language, setLanguage] = useState<Language>(() => getStoredLanguage());

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    }
  }, [language]);

  const toggleLanguage = () => setLanguage(prev => (prev === "he" ? "en" : "he"));

  return { language, setLanguage, toggleLanguage };
};


