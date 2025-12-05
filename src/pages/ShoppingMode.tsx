import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingItem, Unit, UNITS } from "@/types/shopping";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, CheckCircle2, Home, X, Check, Sparkles, 
  Trophy, Zap, Star, PartyPopper, ShoppingCart
} from "lucide-react";
import { useGlobalLanguage } from "@/context/LanguageContext";
import { useSoundSettings } from "@/hooks/use-sound-settings.tsx";
import { useHaptics } from "@/hooks/use-haptics";
import { ConfettiEffect } from "@/components/ConfettiEffect";
import { toast } from "sonner";

// Dynamic motivational messages
const getMotivationalText = (
  progress: number, 
  language: 'he' | 'en'
): { title: string; subtitle: string; emoji: string } => {
  if (progress === 0) {
    return language === 'he' 
      ? { title: "יוצאים למשימה!", subtitle: "בהצלחה בקניות", emoji: "🚀" }
      : { title: "Mission Started!", subtitle: "Let's go shopping", emoji: "🚀" };
  }
  if (progress < 25) {
    return language === 'he'
      ? { title: "התחלה מצוינת!", subtitle: "ממשיכים לאסוף", emoji: "💪" }
      : { title: "Great Start!", subtitle: "Keep collecting", emoji: "💪" };
  }
  if (progress < 50) {
    return language === 'he'
      ? { title: "בדרך הנכונה!", subtitle: "כבר חצי דרך", emoji: "⚡" }
      : { title: "On Track!", subtitle: "Almost halfway", emoji: "⚡" };
  }
  if (progress < 75) {
    return language === 'he'
      ? { title: "מעולה!", subtitle: "יותר מחצי!", emoji: "🔥" }
      : { title: "Excellent!", subtitle: "More than half!", emoji: "🔥" };
  }
  if (progress < 100) {
    return language === 'he'
      ? { title: "כמעט שם!", subtitle: "עוד קצת!", emoji: "🎯" }
      : { title: "Almost There!", subtitle: "Just a few more!", emoji: "🎯" };
  }
  return language === 'he'
    ? { title: "משימה הושלמה!", subtitle: "כל הכבוד!", emoji: "🎉" }
    : { title: "Mission Complete!", subtitle: "Amazing job!", emoji: "🎉" };
};

export const ShoppingMode = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useGlobalLanguage();
  const { playFeedback } = useSoundSettings();
  const { successPattern, lightTap } = useHaptics();
  
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [listName, setListName] = useState("");
  const [animatingItemId, setAnimatingItemId] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showMissionComplete, setShowMissionComplete] = useState(false);
  const direction = language === 'he' ? 'rtl' : 'ltr';

  useEffect(() => {
    if (!id) {
      navigate("/");
      return;
    }

    const listData = localStorage.getItem(`activeList_${id}`);
    if (listData) {
      const list = JSON.parse(listData);
      setItems(list.items || []);
      setListName(list.name || (language === 'he' ? 'רשימת קניות' : 'Shopping List'));
    } else {
      toast.error(language === 'he' ? 'הרשימה לא נמצאה' : 'List not found');
      navigate("/");
    }
  }, [id, navigate, language]);

  const completedCount = items.filter(item => item.checked).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const motivationalText = getMotivationalText(progress, language);

  // Check for mission complete
  useEffect(() => {
    if (progress === 100 && totalCount > 0 && !showMissionComplete) {
      setShowMissionComplete(true);
      setShowConfetti(true);
      playFeedback('success');
      successPattern();
      setTimeout(() => setShowConfetti(false), 2000);
    }
  }, [progress, totalCount, showMissionComplete, playFeedback, successPattern]);

  const toggleItem = useCallback((itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    if (!item.checked) {
      // Checking item - celebration!
      setAnimatingItemId(itemId);
      playFeedback('success');
      successPattern();
      
      setTimeout(() => {
        setItems(prev => prev.map(i =>
          i.id === itemId ? { ...i, checked: true } : i
        ));
        setAnimatingItemId(null);
      }, 300);
    } else {
      // Unchecking - simple
      lightTap();
      setItems(prev => prev.map(i =>
        i.id === itemId ? { ...i, checked: false } : i
      ));
    }
  }, [items, playFeedback, successPattern, lightTap]);

  const handleFinishShopping = () => {
    if (!id) return;

    const history = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      items: items,
      totalAmount: 0,
      store: "",
      completedItems: completedCount,
      totalItems: totalCount,
    };

    const savedHistory = JSON.parse(localStorage.getItem('shoppingHistory') || '[]');
    savedHistory.push(history);
    localStorage.setItem('shoppingHistory', JSON.stringify(savedHistory));
    localStorage.removeItem(`activeList_${id}`);

    toast.success(language === 'he' ? 'הקניות הושלמו!' : 'Shopping completed!');
    navigate("/");
  };

  const handleExit = () => {
    if (completedCount > 0 && completedCount < totalCount) {
      const confirmExit = window.confirm(
        language === 'he' 
          ? 'יש פריטים שעדיין לא נלקחו. האם לצאת בכל זאת?' 
          : 'Some items are not collected. Exit anyway?'
      );
      if (!confirmExit) return;
    }
    navigate("/");
  };

  const activeItems = items.filter(item => !item.checked);
  const completedItems = items.filter(item => item.checked);

  return (
    <div 
      className="min-h-screen pb-28 transition-all duration-500"
      dir={direction}
      style={{
        background: progress === 100 
          ? 'linear-gradient(135deg, hsl(var(--success) / 0.1) 0%, hsl(var(--background)) 50%, hsl(var(--primary) / 0.1) 100%)'
          : 'linear-gradient(180deg, hsl(var(--primary) / 0.08) 0%, hsl(var(--background)) 30%)'
      }}
    >
      {/* Full-screen Confetti for Mission Complete */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <ConfettiEffect isActive={showConfetti} origin={{ x: 50, y: 30 }} />
        </div>
      )}

      {/* Mission Header - Gamified */}
      <div className="sticky top-0 z-40 glass-strong border-b border-border/30 shadow-lg">
        <div className="max-w-3xl mx-auto px-4 py-4 sm:py-5">
          {/* Top Row: Exit + Title + Home */}
          <div className={`flex items-center justify-between mb-4 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
            {/* Exit Button */}
            <Button
              variant="ghost"
              onClick={handleExit}
              className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl glass hover:bg-destructive/10 hover:text-destructive transition-all active:scale-95 touch-manipulation"
            >
              <X className="h-6 w-6 sm:h-7 sm:w-7" />
            </Button>

            {/* Dynamic Title */}
            <div className="text-center flex-1 px-2">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-2xl sm:text-3xl">{motivationalText.emoji}</span>
                <h1 className="text-xl sm:text-2xl font-black text-foreground">
                  {motivationalText.title}
                </h1>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground font-medium">
                {motivationalText.subtitle}
              </p>
            </div>

            {/* Home Button */}
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl glass hover:bg-primary/10 transition-all active:scale-95 touch-manipulation"
            >
              <Home className="h-6 w-6 sm:h-7 sm:w-7" />
            </Button>
          </div>

          {/* Progress Section */}
          <div className="space-y-3">
            {/* Progress Bar - Juicy */}
            <div className="relative h-5 sm:h-6 bg-muted/30 rounded-full overflow-hidden shadow-inner">
              <div 
                className={`
                  absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out
                  ${progress === 100 
                    ? 'bg-gradient-to-r from-success via-primary to-success animate-pulse' 
                    : 'bg-gradient-to-r from-primary via-primary to-primary/80'
                  }
                `}
                style={{ width: `${progress}%` }}
              />
              {/* Animated shine */}
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full transition-all duration-700"
                style={{ width: `${progress}%`, transform: 'translateX(-100%)', animation: progress > 0 ? 'shine 2s ease-in-out infinite' : 'none' }}
              />
            </div>

            {/* Counter Pills */}
            <div className={`flex items-center justify-between ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-success/15 text-success rounded-full">
                  <Check className="h-4 w-4" strokeWidth={3} />
                  <span className="font-bold text-sm">{completedCount}</span>
                </div>
                <span className="text-muted-foreground">/</span>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 rounded-full">
                  <ShoppingCart className="h-4 w-4" />
                  <span className="font-bold text-sm">{totalCount}</span>
                </div>
              </div>
              
              <span className="text-lg sm:text-xl font-black text-foreground">
                {progress}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Active Items */}
        {activeItems.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-2">
              <Zap className="h-5 w-5 text-primary" />
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                {language === 'he' ? 'צריך לאסוף' : 'To Collect'}
              </h2>
              <span className="ml-auto px-2.5 py-1 bg-primary/15 text-primary rounded-full text-sm font-bold">
                {activeItems.length}
              </span>
            </div>
            
            <div className="space-y-3">
              {activeItems.map((item) => {
                const isAnimating = animatingItemId === item.id;
                const unitLabel = UNITS.find(u => u.value === item.unit)?.[language === 'he' ? 'labelHe' : 'labelEn'] || '';
                
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className={`
                      w-full text-${direction === 'rtl' ? 'right' : 'left'}
                      glass-strong rounded-3xl p-4 sm:p-5
                      border-2 transition-all duration-300
                      touch-manipulation
                      ${isAnimating 
                        ? 'border-success bg-success/10 scale-[0.97] shadow-xl shadow-success/20' 
                        : 'border-transparent hover:border-primary/30 hover:shadow-xl hover:scale-[1.01] active:scale-[0.98]'
                      }
                    `}
                  >
                    <div className={`flex items-center gap-4 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                      {/* Checkbox */}
                      <div 
                        className={`
                          flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl
                          flex items-center justify-center
                          border-2 transition-all duration-300
                          ${isAnimating 
                            ? 'bg-success border-success text-success-foreground scale-110' 
                            : 'bg-card border-border hover:border-success/50'
                          }
                        `}
                      >
                        {isAnimating && (
                          <Check className="h-8 w-8 sm:h-9 sm:w-9 animate-check-bounce" strokeWidth={3} />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-lg sm:text-xl font-semibold text-foreground truncate">
                          {item.text}
                        </p>
                        <p className="text-sm sm:text-base text-muted-foreground font-medium">
                          {item.quantity} {unitLabel}
                        </p>
                      </div>

                      {/* Tap indicator */}
                      <div className="flex-shrink-0 opacity-50">
                        <Sparkles className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Completed Items */}
        {completedItems.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-2">
              <Trophy className="h-5 w-5 text-success" />
              <h2 className="text-base sm:text-lg font-bold text-success">
                {language === 'he' ? 'נאסף!' : 'Collected!'}
              </h2>
              <span className="ml-auto px-2.5 py-1 bg-success/15 text-success rounded-full text-sm font-bold">
                {completedItems.length}
              </span>
            </div>
            
            <div className="space-y-2">
              {completedItems.map((item) => {
                const unitLabel = UNITS.find(u => u.value === item.unit)?.[language === 'he' ? 'labelHe' : 'labelEn'] || '';
                
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className={`
                      w-full text-${direction === 'rtl' ? 'right' : 'left'}
                      glass rounded-2xl p-3 sm:p-4
                      opacity-60 hover:opacity-80
                      transition-all duration-200
                      touch-manipulation active:scale-[0.98]
                    `}
                  >
                    <div className={`flex items-center gap-3 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                      {/* Checked indicator */}
                      <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-success/20 flex items-center justify-center">
                        <Check className="h-5 w-5 sm:h-6 sm:w-6 text-success" strokeWidth={3} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-base sm:text-lg font-medium text-muted-foreground line-through truncate">
                          {item.text}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground/70">
                          {item.quantity} {unitLabel}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {items.length === 0 && (
          <div className="text-center py-16 px-4">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
              <ShoppingCart className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-lg text-muted-foreground font-medium">
              {language === 'he' ? 'אין פריטים ברשימה' : 'No items in list'}
            </p>
          </div>
        )}

        {/* Mission Complete Celebration */}
        {showMissionComplete && progress === 100 && (
          <div className="glass-strong rounded-3xl p-6 sm:p-8 text-center border-2 border-success/30 shadow-xl shadow-success/10 animate-bounce-in">
            <div className="text-5xl sm:text-6xl mb-4">🎉</div>
            <h3 className="text-2xl sm:text-3xl font-black text-foreground mb-2">
              {language === 'he' ? 'כל הכבוד!' : 'Amazing!'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {language === 'he' ? 'אספת את כל הפריטים!' : 'You collected everything!'}
            </p>
            <div className="flex justify-center gap-2">
              <Star className="h-6 w-6 text-primary animate-pulse" fill="currentColor" />
              <Star className="h-6 w-6 text-primary animate-pulse" fill="currentColor" style={{ animationDelay: '0.1s' }} />
              <Star className="h-6 w-6 text-primary animate-pulse" fill="currentColor" style={{ animationDelay: '0.2s' }} />
            </div>
          </div>
        )}
      </div>

      {/* Sticky Footer - Finish Button */}
      <div className="fixed bottom-0 left-0 right-0 glass-strong border-t border-border/30 p-4 sm:p-5 shadow-2xl z-40">
        <div className="max-w-3xl mx-auto">
          <Button
            onClick={handleFinishShopping}
            disabled={completedCount === 0}
            className={`
              w-full h-14 sm:h-16 text-base sm:text-lg font-bold rounded-2xl
              transition-all duration-300 touch-manipulation
              ${progress === 100 
                ? 'bg-gradient-to-r from-success to-success/80 text-success-foreground shadow-xl shadow-success/30 hover:shadow-2xl hover:shadow-success/40' 
                : 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30'
              }
              active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {progress === 100 ? (
              <>
                <PartyPopper className={`h-6 w-6 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                {language === 'he' ? 'סיום מושלם!' : 'Perfect Finish!'}
              </>
            ) : (
              <>
                <CheckCircle2 className={`h-6 w-6 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                {language === 'he' ? 'סיים קניות' : 'Finish Shopping'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
