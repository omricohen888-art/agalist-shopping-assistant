import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Plus, Book, History, BarChart3, Lightbulb, Info, Settings, User, LogOut, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGlobalLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { translations } from '@/utils/translations';

interface NavigationProps {
  onSettingsClick?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ onSettingsClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useGlobalLanguage();
  const { user, loading, signOut } = useAuth();
  const t = translations[language];
  const direction = language === 'he' ? 'rtl' : 'ltr';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);

  const [secretClickCount, setSecretClickCount] = useState(0);
  const secretClickTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSecretEntry = () => {
    // Clear existing timer
    if (secretClickTimerRef.current) {
      clearTimeout(secretClickTimerRef.current);
    }

    // Increment count
    setSecretClickCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 5) {
        // Trigger Secret Entry
        navigate('/admin');
        return 0;
      }
      return newCount;
    });

    // Reset count after 3 seconds of inactivity
    secretClickTimerRef.current = setTimeout(() => {
      setSecretClickCount(0);
    }, 3000);

    // Toggle menu as usual
    setIsMenuOpen(!isMenuOpen);
  };

  // Close desktop menu when clicking outside (but not on button or panel)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedOnButton = menuButtonRef.current?.contains(target);
      const clickedOnPanel = menuPanelRef.current?.contains(target);

      if (!clickedOnButton && !clickedOnPanel) {
        setIsDesktopMenuOpen(false);
      }
    };
    if (isDesktopMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDesktopMenuOpen]);

  // UNIFIED NAVIGATION ITEMS - VISIBLE TO ALL USERS (BOTH LOGGED-IN AND GUESTS)
  // CRITICAL: Settings (Gear) button MUST appear for BOTH user types
  // NO Info/About button in bottom bar - only Settings
  const navigationItems = [
    { path: '/', icon: Plus, label: t.navigation.list, id: 'list' },
    { path: '/notebook', icon: Book, label: t.navigation.notebook, id: 'notebook' },
    { path: '/history', icon: History, label: t.navigation.history, id: 'history' },
    { path: '/insights', icon: Lightbulb, label: t.navigation.insights, id: 'insights' },
    // Settings (Gear icon) - visible to BOTH logged-in AND guest users
    { path: null, icon: Settings, label: language === 'he' ? 'הגדרות' : 'Settings', id: 'settings', isSettings: true },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleAuthClick = () => {
    if (user) {
      handleSignOut();
    } else {
      navigate('/auth');
      setIsMenuOpen(false);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  // User display info
  const userDisplayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';
  const userAvatarUrl = user?.user_metadata?.avatar_url;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border shadow-lg z-50"
    >
      {/* MOBILE BOTTOM NAVIGATION - UNIFIED FOR BOTH LOGGED-IN AND GUEST USERS */}
      {/* All buttons including Settings are visible to both user types */}
      <div className="md:hidden">
        <div className="flex items-center justify-center h-20 px-3">
          {/* Navigation Items - Centered */}
          <div className="flex items-center justify-center gap-1.5">
            {navigationItems.map(({ path, icon: Icon, label, id, isSettings }) => (
              <button
                key={id}
                onClick={() => {
                  if (isSettings) {
                    onSettingsClick?.();
                  } else if (path) {
                    handleNavigate(path);
                  }
                }}
                className={`flex items-center justify-center w-14 h-14 rounded-xl transition-all flex-shrink-0 active:scale-95 ${!isSettings && path && isActive(path)
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
            onClick={handleSecretEntry}
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
              <div className="p-4 space-y-2">
                {/* User Info (if logged in) */}
                {user && (
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-border mb-2 pb-4">
                    {userAvatarUrl ? (
                      <img
                        src={userAvatarUrl}
                        alt={userDisplayName}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">
                        {userDisplayName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                )}

                {/* Account/Login Button */}
                <button
                  onClick={handleAuthClick}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors active:scale-95 ${user
                    ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                    }`}
                >
                  {user ? (
                    <>
                      <LogOut className="h-5 w-5 flex-shrink-0" strokeWidth={1.5} />
                      <span className="font-medium text-sm">{language === 'he' ? 'התנתק' : 'Sign Out'}</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="h-5 w-5 flex-shrink-0" strokeWidth={1.5} />
                      <span className="font-medium text-sm">{language === 'he' ? 'התחבר' : 'Sign In'}</span>
                    </>
                  )}
                </button>

                {/* Profile Button - ONLY FOR LOGGED-IN USERS */}
                {user && (
                  <button
                    onClick={() => {
                      handleNavigate('/profile');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-muted text-foreground hover:bg-muted/80 transition-colors active:scale-95"
                  >
                    <User className="h-5 w-5 flex-shrink-0" strokeWidth={1.5} />
                    <span className="font-medium text-sm">{language === 'he' ? 'פרופיל' : 'Profile'}</span>
                  </button>
                )}

                {/* About Button - VISIBLE FOR BOTH LOGGED-IN AND GUEST USERS */}
                <button
                  onClick={() => {
                    handleNavigate('/about');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-muted text-foreground hover:bg-muted/80 transition-colors active:scale-95"
                >
                  <Info className="h-5 w-5 flex-shrink-0" strokeWidth={1.5} />
                  <span className="font-medium text-sm">{t.navigation.about}</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* DESKTOP TOP NAVIGATION - UNIFIED FOR BOTH LOGGED-IN AND GUEST USERS */}
      {/* All buttons including Settings are visible to both user types */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between h-16 px-6 gap-4">
          {/* Navigation Items - Horizontal */}
          <div className="flex items-center gap-2">
            {navigationItems.map(({ path, icon: Icon, label, id, isSettings }) => (
              <button
                key={id}
                onClick={() => {
                  if (isSettings) {
                    onSettingsClick?.();
                  } else if (path) {
                    handleNavigate(path);
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium active:scale-95 ${!isSettings && path && isActive(path)
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

          {/* Right Section - Account & Settings */}
          <div className="flex items-center gap-2">
            {/* User Avatar or Login Button */}
            {user ? (
              <button
                onClick={handleAuthClick}
                className="flex items-center gap-2 p-2 rounded-xl hover:bg-muted transition-colors active:scale-95"
                title={language === 'he' ? 'התנתק' : 'Sign Out'}
              >
                {userAvatarUrl ? (
                  <img
                    src={userAvatarUrl}
                    alt={userDisplayName}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                )}
                <LogOut className="h-4 w-4 text-muted-foreground" />
              </button>
            ) : (
              <button
                onClick={() => navigate('/auth')}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-primary hover:bg-primary/10 transition-colors active:scale-95"
                title={language === 'he' ? 'התחבר' : 'Sign In'}
              >
                <LogIn className="h-5 w-5 flex-shrink-0" strokeWidth={1.5} />
                <span className="text-sm font-medium">{language === 'he' ? 'התחבר' : 'Sign In'}</span>
              </button>
            )}

            {/* Hamburger Menu Button */}
            <button
              ref={menuButtonRef}
              onClick={() => setIsDesktopMenuOpen(!isDesktopMenuOpen)}
              className="p-2 rounded-xl text-muted-foreground hover:bg-muted transition-colors active:scale-95"
              title={language === 'he' ? 'תפריט' : 'Menu'}
            >
              {isDesktopMenuOpen ? (
                <X className="h-5 w-5 flex-shrink-0" strokeWidth={1.5} />
              ) : (
                <Menu className="h-5 w-5 flex-shrink-0" strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Side Menu - Rendered as Portal outside nav stacking context */}
      {isDesktopMenuOpen && createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[9998]"
            onClick={() => setIsDesktopMenuOpen(false)}
          />
          {/* Side Panel */}
          <div
            ref={menuPanelRef}
            className="fixed top-0 end-0 h-full w-64 bg-card border-s border-border shadow-2xl z-[9999] animate-slide-in-right"
            dir={direction}
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <span className="font-medium text-foreground">{language === 'he' ? 'תפריט' : 'Menu'}</span>
              <button
                onClick={() => setIsDesktopMenuOpen(false)}
                className="p-2 rounded-xl hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-2 space-y-1">
              {/* Profile Button - ONLY FOR LOGGED-IN USERS */}
              {user && (
                <button
                  onClick={() => {
                    handleNavigate('/profile');
                    setIsDesktopMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-muted transition-colors"
                >
                  <User className="h-5 w-5 flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-sm font-medium">{language === 'he' ? 'פרופיל' : 'Profile'}</span>
                </button>
              )}

              {/* About Button */}
              <button
                onClick={() => {
                  handleNavigate('/about');
                  setIsDesktopMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-muted transition-colors"
              >
                <Info className="h-5 w-5 flex-shrink-0" strokeWidth={1.5} />
                <span className="text-sm font-medium">{t.navigation.about}</span>
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </nav>
  );
};
