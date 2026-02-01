import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useGlobalLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle2, Sparkles, ShoppingCart, Cloud, BarChart3 } from 'lucide-react';

interface WelcomeNameModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WelcomeNameModal: React.FC<WelcomeNameModalProps> = ({ open, onOpenChange }) => {
  const { language } = useGlobalLanguage();
  const { user } = useAuth();
  const direction = language === 'he' ? 'rtl' : 'ltr';
  
  const [showSuccess, setShowSuccess] = useState(true);

  // Get user's display name from Google
  const displayName = user?.user_metadata?.full_name || 
                      user?.user_metadata?.name || 
                      (language === 'he' ? 'משתמש' : 'User');

  // Auto-save the name from Google to localStorage
  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      localStorage.setItem('user_display_name', user.user_metadata.full_name);
    } else if (user?.user_metadata?.name) {
      localStorage.setItem('user_display_name', user.user_metadata.name);
    }
  }, [user]);

  // Show success animation first, then transition to welcome screen
  useEffect(() => {
    if (open && showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [open, showSuccess]);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setShowSuccess(true);
    }
  }, [open]);

  const handleStart = () => {
    localStorage.setItem('welcome_name_shown', 'true');
    onOpenChange(false);
  };

  const features = [
    {
      icon: ShoppingCart,
      textHe: 'צור רשימות קניות בקלות',
      textEn: 'Create shopping lists easily'
    },
    {
      icon: Cloud,
      textHe: 'הרשימות שלך שמורות ונגישות מכל מכשיר',
      textEn: 'Your lists are saved and accessible from any device'
    },
    {
      icon: BarChart3,
      textHe: 'קבל תובנות על הקניות שלך',
      textEn: 'Get insights about your shopping'
    }
  ];

  if (showSuccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
          className="sm:max-w-md border-none bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20"
          dir={direction}
        >
          <div className="flex flex-col items-center justify-center py-8 space-y-6">
            {/* Success Animation */}
            <div className="relative">
              <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center animate-scale-in shadow-lg shadow-primary/30">
                <CheckCircle2 className="w-14 h-14 text-primary-foreground animate-fade-in" />
              </div>
              {/* Sparkles around the checkmark */}
              <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-amber-400 animate-pulse" />
              <Sparkles className="absolute -bottom-1 -left-3 w-5 h-5 text-amber-400 animate-pulse delay-150" />
              <Sparkles className="absolute top-0 -left-4 w-4 h-4 text-amber-400 animate-pulse delay-300" />
            </div>
            
            <div className="text-center space-y-2 animate-fade-in">
              <h2 className="text-2xl font-bold text-primary dark:text-primary">
                {language === 'he' ? 'התחברת בהצלחה!' : 'Successfully Connected!'}
              </h2>
              <p className="text-muted-foreground">
                {language === 'he' ? 'ברוכים הבאים לעגליסט' : 'Welcome to Agalist'}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-md border-none bg-gradient-to-br from-background to-muted/30"
        dir={direction}
      >
        <div className="flex flex-col items-center py-6 space-y-6">
          {/* Personal Greeting */}
          <div className="text-center space-y-2 animate-fade-in">
            <h2 className="text-2xl font-bold text-foreground">
              {language === 'he' ? `שלום, ${displayName}! 👋` : `Hello, ${displayName}! 👋`}
            </h2>
            <p className="text-lg text-muted-foreground">
              {language === 'he' ? 'ברוכים הבאים לעגליסט' : 'Welcome to Agalist'}
            </p>
          </div>

          {/* Feature Cards */}
          <div className="w-full space-y-3 animate-fade-in">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50 shadow-sm"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  {language === 'he' ? feature.textHe : feature.textEn}
                </p>
              </div>
            ))}
          </div>

          {/* Start Button */}
          <Button 
            onClick={handleStart}
            className="w-full h-12 text-base font-medium animate-fade-in"
            size="lg"
          >
            {language === 'he' ? 'בואו נתחיל!' : "Let's Start!"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeNameModal;
