import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useGlobalLanguage } from '@/context/LanguageContext';
import { ShoppingCart, BarChart3, Smartphone } from 'lucide-react';

const STORAGE_KEY = 'hasSeenWelcomePrompt';

export const WelcomePrompt = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading } = useAuth();
  const { language } = useGlobalLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    // Don't show if still loading auth state
    if (loading) return;

    // Don't show if user is logged in
    if (user) return;

    // Don't show if already seen
    const hasSeen = localStorage.getItem(STORAGE_KEY);
    if (hasSeen === 'true') return;

    // Show dialog after a short delay for better UX
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [user, loading]);

  const handleSignIn = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsOpen(false);
    navigate('/auth');
  };

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsOpen(false);
  };

  const isHebrew = language === 'he';

  const content = {
    title: isHebrew ? 'ברוכים הבאים לאגליסט!' : 'Welcome to Agalist!',
    description: isHebrew
      ? 'הירשם עכשיו כדי ליהנות מכל היתרונות:'
      : 'Sign up now to enjoy all the benefits:',
    benefits: isHebrew
      ? [
          { icon: ShoppingCart, text: 'לשמור את הרשימות שלך לאורך זמן' },
          { icon: BarChart3, text: 'לקבל תובנות כלכליות על הקניות שלך' },
          { icon: Smartphone, text: 'לגשת לרשימות מכל מכשיר' },
        ]
      : [
          { icon: ShoppingCart, text: 'Save your lists permanently' },
          { icon: BarChart3, text: 'Get financial insights on your shopping' },
          { icon: Smartphone, text: 'Access your lists from any device' },
        ],
    signInButton: isHebrew ? 'התחבר עכשיו' : 'Sign In Now',
    dismissButton: isHebrew ? 'אולי אח״כ' : 'Maybe Later',
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent 
        className="sm:max-w-md rounded-2xl"
        dir={isHebrew ? 'rtl' : 'ltr'}
      >
        <DialogHeader className="text-center sm:text-center">
          <DialogTitle className="text-xl font-bold text-foreground">
            {content.title}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground mt-2">
            {content.description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          {content.benefits.map((benefit, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 rounded-xl bg-muted/50"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <benefit.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">
                {benefit.text}
              </span>
            </div>
          ))}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={handleDismiss}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            {content.dismissButton}
          </Button>
          <Button
            onClick={handleSignIn}
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            {content.signInButton}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
