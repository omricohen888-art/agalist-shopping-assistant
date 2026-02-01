import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGlobalLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle2, Sparkles, User } from 'lucide-react';

interface WelcomeNameModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WelcomeNameModal: React.FC<WelcomeNameModalProps> = ({ open, onOpenChange }) => {
  const { language } = useGlobalLanguage();
  const { user } = useAuth();
  const direction = language === 'he' ? 'rtl' : 'ltr';
  
  const [name, setName] = useState('');
  const [showSuccess, setShowSuccess] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill with Google display name if available
  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      setName(user.user_metadata.full_name);
    }
  }, [user]);

  // Show success animation first, then transition to name input
  useEffect(() => {
    if (open && showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [open, showSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setIsSubmitting(true);
    
    // Store the name in localStorage
    localStorage.setItem('user_display_name', name.trim());
    
    // Small delay for UX
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setIsSubmitting(false);
    onOpenChange(false);
  };

  const handleSkip = () => {
    // Mark as seen even if skipped
    localStorage.setItem('welcome_name_shown', 'true');
    onOpenChange(false);
  };

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
      <DialogContent className="sm:max-w-md" dir={direction}>
        <DialogHeader className="space-y-3">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">
            {language === 'he' ? 'איך לקרוא לך?' : 'What should we call you?'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {language === 'he' 
              ? 'הזן את השם שלך כדי שנוכל לפנות אליך באופן אישי'
              : 'Enter your name so we can address you personally'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={language === 'he' ? 'השם שלך בעברית...' : 'Your name...'}
              className="text-center text-lg h-12"
              dir={language === 'he' ? 'rtl' : 'ltr'}
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <Button 
              type="submit" 
              className="w-full h-12 text-base"
              disabled={!name.trim() || isSubmitting}
            >
              {isSubmitting 
                ? (language === 'he' ? 'שומר...' : 'Saving...') 
                : (language === 'he' ? 'בואו נתחיל!' : "Let's Start!")
              }
            </Button>
            
            <button
              type="button"
              onClick={handleSkip}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              {language === 'he' ? 'אולי אחר כך' : 'Maybe later'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeNameModal;
