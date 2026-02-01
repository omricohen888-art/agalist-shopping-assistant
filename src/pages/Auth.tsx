import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useGlobalLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Loader2 } from 'lucide-react';

const Auth: React.FC = () => {
  const { user, loading, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { language } = useGlobalLanguage();
  const direction = language === 'he' ? 'rtl' : 'ltr';

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6" dir={direction}>
      <div className="w-full max-w-sm space-y-8">
        {/* Logo & Title */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center">
            <ShoppingCart className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            {language === 'he' ? 'Agalist' : 'Agalist'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'he' 
              ? 'התחבר כדי לשמור את הרשימות שלך בענן'
              : 'Sign in to save your lists to the cloud'
            }
          </p>
        </div>

        {/* Benefits */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-foreground text-center">
            {language === 'he' ? 'למה להתחבר?' : 'Why sign in?'}
          </h2>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-3">
              <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xs font-bold">✓</span>
              <span>{language === 'he' ? 'סנכרון בין כל המכשירים' : 'Sync across all devices'}</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xs font-bold">✓</span>
              <span>{language === 'he' ? 'גיבוי אוטומטי לענן' : 'Automatic cloud backup'}</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xs font-bold">✓</span>
              <span>{language === 'he' ? 'היסטוריית קניות שמורה' : 'Shopping history saved'}</span>
            </li>
          </ul>
        </div>

        {/* Sign In Button */}
        <Button
          onClick={handleGoogleSignIn}
          className="w-full h-14 text-base gap-3"
          size="lg"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {language === 'he' ? 'התחבר עם Google' : 'Sign in with Google'}
        </Button>

        {/* Skip for now */}
        <button
          onClick={() => navigate('/')}
          className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {language === 'he' ? 'המשך בלי התחברות' : 'Continue without signing in'}
        </button>
      </div>
    </div>
  );
};

export default Auth;
