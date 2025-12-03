import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Plus, Book, History, BarChart3, Info, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGlobalLanguage } from '@/context/LanguageContext';
import { translations } from '@/utils/translations';

interface NavigationProps {
  onSettingsClick?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ onSettingsClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage } = useGlobalLanguage();
  const t = translations[language];
  const direction = language === 'he' ? 'rtl' : 'ltr';
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    { path: '/', icon: Plus, label: t.navigation.list, id: 'list' },
    { path: '/notebook', icon: Book, label: t.navigation.notebook, id: 'notebook' },
    { path: '/history', icon: History, label: t.navigation.history, id: 'history' },
    { path: '/compare', icon: BarChart3, label: t.navigation.compare, id: 'compare' },
    { path: '/about', icon: Info, label: t.navigation.about, id: 'about' },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 shadow-2xl z-50"
      dir={direction}
    >
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden">
        <div className="flex items-center justify-center h-20 px-3">
          {/* Navigation Items - Centered */}
          <div className="flex items-center justify-center gap-2">
            {navigationItems.map(({ path, icon: Icon, label, id }) => (
              <button
                key={id}
                onClick={() => handleNavigate(path)}
                className={`flex items-center justify-center w-14 h-14 rounded-xl transition-all flex-shrink-0 active:scale-95 ${
                  isActive(path)
                    ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/50'
                    : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
                title={label}
              >
                <Icon className="h-6 w-6 flex-shrink-0" strokeWidth={1.5} />
              </button>
            ))}
          </div>

          {/* Menu Toggle Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="h-14 w-14 flex items-center justify-center text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors ml-2 flex-shrink-0 active:scale-95"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? (
              <X className="h-7 w-7" strokeWidth={2} />
            ) : (
              <Menu className="h-7 w-7" strokeWidth={2} />
            )}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Menu */}
            <div className="absolute bottom-16 right-0 left-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 shadow-lg z-50">
              <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
                {/* Language Toggle */}
                <div className="flex gap-2 mb-4 flex-row">
                  <button
                    onClick={() => setLanguage('he')}
                    className={`flex-1 px-3 py-2.5 rounded-lg font-bold text-sm transition-all active:scale-95 ${
                      language === 'he'
                        ? 'bg-yellow-400 text-black'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300'
                    }`}
                  >
                    עברית
                  </button>
                  <button
                    onClick={() => setLanguage('en')}
                    className={`flex-1 px-3 py-2.5 rounded-lg font-bold text-sm transition-all active:scale-95 ${
                      language === 'en'
                        ? 'bg-yellow-400 text-black'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300'
                    }`}
                  >
                    English
                  </button>
                </div>

                {/* Settings Button */}
                <button
                  onClick={() => {
                    onSettingsClick?.();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors active:scale-95"
                >
                  <Settings className="h-5 w-5 flex-shrink-0" strokeWidth={1.5} />
                  <span className="font-semibold text-sm">{language === 'he' ? 'הגדרות' : 'Settings'}</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Desktop Top Navigation */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between h-16 px-6 gap-4">
          {/* Navigation Items - Horizontal */}
          <div className="flex items-center gap-2">
            {navigationItems.map(({ path, icon: Icon, label, id }) => (
              <button
                key={id}
                onClick={() => handleNavigate(path)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-semibold active:scale-95 ${
                  isActive(path)
                    ? 'bg-yellow-400 text-black shadow-md'
                    : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
                title={label}
              >
                <Icon className="h-5 w-5 flex-shrink-0" strokeWidth={1.5} />
                <span className="text-sm">{label}</span>
              </button>
            ))}
          </div>

          {/* Right Section - Settings & Language */}
          <div className="flex items-center gap-2 flex-row">
            {/* Language Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
              <button
                onClick={() => setLanguage('he')}
                className={`px-3 py-1.5 rounded font-bold text-xs transition-all active:scale-95 ${
                  language === 'he'
                    ? 'bg-yellow-400 text-black'
                    : 'text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
              >
                עברית
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 rounded font-bold text-xs transition-all active:scale-95 ${
                  language === 'en'
                    ? 'bg-yellow-400 text-black'
                    : 'text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
              >
                EN
              </button>
            </div>

            {/* Settings Button */}
            <button
              onClick={() => onSettingsClick?.()}
              className="p-2 rounded-lg text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors active:scale-95"
              title={language === 'he' ? 'הגדרות' : 'Settings'}
            >
              <Settings className="h-5 w-5 flex-shrink-0" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
