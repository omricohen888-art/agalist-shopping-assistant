import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useGlobalLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, ArrowLeft, LogOut, Mail, User, Calendar, Shield } from 'lucide-react';
import { FaGoogle } from 'react-icons/fa';

const Profile = () => {
  const { user, loading, signOut } = useAuth();
  const { language } = useGlobalLanguage();
  const navigate = useNavigate();
  const isHebrew = language === 'he';
  const direction = isHebrew ? 'rtl' : 'ltr';
  const BackArrow = isHebrew ? ArrowRight : ArrowLeft;

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">
          {isHebrew ? 'טוען...' : 'Loading...'}
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Extract user info from Google auth
  const userMetadata = user.user_metadata || {};
  const displayName = userMetadata.full_name || userMetadata.name || user.email?.split('@')[0] || '';
  const avatarUrl = userMetadata.avatar_url || userMetadata.picture || '';
  const email = user.email || '';
  const createdAt = user.created_at ? new Date(user.created_at) : null;
  const provider = user.app_metadata?.provider || 'email';

  const content = {
    title: isHebrew ? 'הפרופיל שלי' : 'My Profile',
    back: isHebrew ? 'חזרה' : 'Back',
    personalInfo: isHebrew ? 'פרטים אישיים' : 'Personal Information',
    name: isHebrew ? 'שם' : 'Name',
    email: isHebrew ? 'אימייל' : 'Email',
    memberSince: isHebrew ? 'חבר מאז' : 'Member since',
    signedInWith: isHebrew ? 'מחובר באמצעות' : 'Signed in with',
    signOut: isHebrew ? 'התנתק' : 'Sign Out',
    google: 'Google',
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(isHebrew ? 'he-IL' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background" dir={direction}>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="container max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="shrink-0"
          >
            <BackArrow className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold text-foreground">{content.title}</h1>
        </div>
      </header>

      {/* Content */}
      <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Avatar & Name Card */}
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center gap-4">
              <Avatar className="h-24 w-24 border-4 border-primary/20">
                <AvatarImage src={avatarUrl} alt={displayName} />
                <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                  {getInitials(displayName) || <User className="h-10 w-10" />}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold text-foreground">{displayName}</h2>
                <p className="text-sm text-muted-foreground">{email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Info Card */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              {content.personalInfo}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Name */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{content.name}</p>
                <p className="font-medium text-foreground truncate">{displayName}</p>
              </div>
            </div>

            <Separator />

            {/* Email */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Mail className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{content.email}</p>
                <p className="font-medium text-foreground truncate">{email}</p>
              </div>
            </div>

            <Separator />

            {/* Member Since */}
            {createdAt && (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">{content.memberSince}</p>
                    <p className="font-medium text-foreground">{formatDate(createdAt)}</p>
                  </div>
                </div>

                <Separator />
              </>
            )}

            {/* Provider */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                {provider === 'google' ? (
                  <FaGoogle className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Shield className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{content.signedInWith}</p>
                <p className="font-medium text-foreground capitalize">
                  {provider === 'google' ? content.google : provider}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sign Out Button */}
        <Button
          variant="outline"
          className="w-full h-12 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
          onClick={handleSignOut}
        >
          <LogOut className="h-5 w-5 me-2" />
          {content.signOut}
        </Button>
      </div>
    </div>
  );
};

export default Profile;
