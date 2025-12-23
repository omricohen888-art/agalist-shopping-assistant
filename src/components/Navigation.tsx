import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Plus, Book, History, BarChart3, Lightbulb, Info, Settings } from 'lucide-react';
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
    { path: '/insights', icon: Lightbulb, label: t.navigation.insights, id: 'insights' },
    { path: '/about', icon: Info, label: t.navigation.about, id: 'about' },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border shadow-lg z-50"
    >
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden">
        <div className="flex items-center justify-center h-20 px-3">
          {/* Navigation Items - Centered */}
          <div className="flex items-center justify-center gap-1.5">
            {navigationItems.map(({ path, icon: Icon, label, id }) => (
              <button
                key={id}
                onClick={() => handleNavigate(path)}
                className={`flex items-center justify-center w-14 h-14 rounded-xl transition-all flex-shrink-0 active:scale-95 ${
                  isActive(path)
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:bg-muted'
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
            className="h-14 w-14 flex items-center justify-center text-muted-foreground hover:bg-muted rounded-xl transition-colors ml-2 flex-shrink-0 active:scale-95"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" strokeWidth={2} />
            ) : (
              <Menu className="h-6 w-6" strokeWidth={2} />
            )}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Menu */}
            <div className="absolute bottom-20 right-4 left-4 bg-card border border-border shadow-xl rounded-2xl z-50">
              <div className="p-4 space-y-3">
                {/* Language Toggle */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setLanguage('he')}
                    className={`flex-1 px-3 py-2.5 rounded-xl font-medium text-sm transition-all active:scale-95 ${
                      language === 'he'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    עברית
                  </button>
                  <button
                    onClick={() => setLanguage('en')}
                    className={`flex-1 px-3 py-2.5 rounded-xl font-medium text-sm transition-all active:scale-95 ${
                      language === 'en'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
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
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-muted text-foreground hover:bg-muted/80 transition-colors active:scale-95"
                >
                  <Settings className="h-5 w-5 flex-shrink-0" strokeWidth={1.5} />
                  <span className="font-medium text-sm">{language === 'he' ? 'הגדרות' : 'Settings'}</span>
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
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium active:scale-95 ${
                  isActive(path)
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
                title={label}
              >
                <Icon className="h-5 w-5 flex-shrink-0" strokeWidth={1.5} />
                <span className="text-sm">{label}</span>
              </button>
            ))}
          </div>

          {/* Right Section - Settings & Language */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
              <button
                onClick={() => setLanguage('he')}
                className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-all active:scale-95 ${
                  language === 'he'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted/80'
                }`}
              >
                עברית
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-all active:scale-95 ${
                  language === 'en'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted/80'
                }`}
              >
                EN
              </button>
            </div>

            {/* Settings Button */}
            <button
              onClick={() => onSettingsClick?.()}
              className="p-2 rounded-xl text-muted-foreground hover:bg-muted transition-colors active:scale-95"
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
