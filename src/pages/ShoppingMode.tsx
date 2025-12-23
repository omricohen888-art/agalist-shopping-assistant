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

  const handleSaveForLater = () => {
    if (!id) return;

    // Save to savedLists
    const savedLists = JSON.parse(localStorage.getItem('savedLists') || '[]');
    const newSavedList = {
      id: Date.now().toString(),
      name: listName,
      items: items,
      createdAt: new Date().toISOString(),
    };
    savedLists.push(newSavedList);
    localStorage.setItem('savedLists', JSON.stringify(savedLists));
    
    // Remove active list
    localStorage.removeItem(`activeList_${id}`);

    toast.success(language === 'he' ? 'הרשימה נשמרה!' : 'List saved!');
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
      className="min-h-screen pb-24 sm:pb-28 transition-all duration-500 relative overflow-hidden"
      dir={direction}
    >
      {/* Colorful Background */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          background: progress === 100 
            ? 'linear-gradient(135deg, hsl(142, 76%, 90%) 0%, hsl(48, 96%, 89%) 50%, hsl(142, 76%, 85%) 100%)'
            : 'linear-gradient(160deg, hsl(48, 96%, 93%) 0%, hsl(45, 93%, 87%) 30%, hsl(38, 92%, 85%) 60%, hsl(32, 95%, 88%) 100%)'
        }}
      />
      
      {/* Decorative Shopping Cart - Background */}
      <div className="fixed inset-0 -z-5 pointer-events-none overflow-hidden">
        {/* Large cart in bottom right */}
        <ShoppingCart 
          className="absolute -bottom-10 -right-10 sm:-bottom-16 sm:-right-16 h-48 w-48 sm:h-72 sm:w-72 text-black/[0.04] rotate-12" 
          strokeWidth={1}
        />
        {/* Small cart top left */}
        <ShoppingCart 
          className="absolute -top-6 -left-6 sm:-top-10 sm:-left-10 h-24 w-24 sm:h-36 sm:w-36 text-black/[0.03] -rotate-12" 
          strokeWidth={1}
        />
        {/* Floating sparkles */}
        <Sparkles className="absolute top-1/4 right-8 sm:right-16 h-8 w-8 sm:h-12 sm:w-12 text-primary/10 animate-pulse" />
        <Star className="absolute top-1/3 left-6 sm:left-12 h-6 w-6 sm:h-10 sm:w-10 text-primary/10 animate-pulse" style={{ animationDelay: '0.5s' }} />
        <Zap className="absolute bottom-1/3 right-12 sm:right-24 h-6 w-6 sm:h-8 sm:w-8 text-success/10 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      {/* Full-screen Confetti for Mission Complete */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <ConfettiEffect isActive={showConfetti} origin={{ x: 50, y: 30 }} />
        </div>
      )}

      {/* Mission Header - Gamified & Mobile-Optimized */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-black/10 shadow-lg">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          {/* Top Row: Exit + Title + Home */}
          <div className={`flex items-center justify-between mb-3 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
            {/* Exit Button */}
            <Button
              variant="ghost"
              onClick={handleExit}
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-all active:scale-95 touch-manipulation"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>

            {/* Dynamic Title */}
            <div className="text-center flex-1 px-2">
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-0.5">
                <span className="text-xl sm:text-2xl">{motivationalText.emoji}</span>
                <h1 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
                  {motivationalText.title}
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400 font-medium">
                {motivationalText.subtitle}
              </p>
            </div>

            {/* Home Button */}
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-all active:scale-95 touch-manipulation"
            >
              <Home className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700 dark:text-slate-300" />
            </Button>
          </div>

          {/* Progress Section - Compact */}
          <div className="space-y-2">
            {/* Progress Bar - Juicy */}
            <div className="relative h-4 sm:h-5 bg-black/10 rounded-full overflow-hidden shadow-inner">
              <div 
                className={`
                  absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out
                  ${progress === 100 
                    ? 'bg-gradient-to-r from-green-400 via-emerald-500 to-green-400 animate-pulse' 
                    : 'bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500'
                  }
                `}
                style={{ width: `${progress}%` }}
              />
              {/* Animated shine */}
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full transition-all duration-700"
                style={{ width: `${progress}%`, transform: 'translateX(-100%)', animation: progress > 0 ? 'shine 2s ease-in-out infinite' : 'none' }}
              />
            </div>

            {/* Counter Pills - Compact */}
            <div className={`flex items-center justify-between ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  <span className="font-bold text-xs sm:text-sm">{completedCount}</span>
                </div>
                <span className="text-gray-400 text-sm">/</span>
                <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded-full">
                  <ShoppingCart className="h-3.5 w-3.5 text-gray-600 dark:text-slate-300" />
                  <span className="font-bold text-xs sm:text-sm text-gray-700 dark:text-slate-200">{totalCount}</span>
                </div>
              </div>
              
              <span className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
                {progress}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Items List - Mobile-Optimized */}
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Active Items */}
        {activeItems.length > 0 && (
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
              <h2 className="text-sm sm:text-base font-bold text-gray-800 dark:text-white">
                {language === 'he' ? 'צריך לאסוף' : 'To Collect'}
              </h2>
              <span className="ml-auto px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full text-xs font-bold">
                {activeItems.length}
              </span>
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              {activeItems.map((item) => {
                const isAnimating = animatingItemId === item.id;
                const unitLabel = UNITS.find(u => u.value === item.unit)?.[language === 'he' ? 'labelHe' : 'labelEn'] || '';
                
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className={`
                      w-full text-${direction === 'rtl' ? 'right' : 'left'}
                      bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-3 sm:p-4
                      border-2 transition-all duration-300
                      touch-manipulation shadow-sm
                      ${isAnimating 
                        ? 'border-green-400 bg-green-50/90 scale-[0.97] shadow-lg shadow-green-200/50' 
                        : 'border-transparent hover:border-orange-300 hover:shadow-md active:scale-[0.98]'
                      }
                    `}
                  >
                    <div className={`flex items-center gap-3 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                      {/* Checkbox */}
                      <div 
                        className={`
                          flex-shrink-0 w-11 h-11 sm:w-14 sm:h-14 rounded-xl
                          flex items-center justify-center
                          border-2 transition-all duration-300
                          ${isAnimating 
                            ? 'bg-green-500 border-green-500 text-white scale-110' 
                            : 'bg-white border-gray-300 dark:bg-slate-700 dark:border-slate-600'
                          }
                        `}
                      >
                        {isAnimating && (
                          <Check className="h-6 w-6 sm:h-7 sm:w-7 animate-check-bounce" strokeWidth={3} />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {item.text}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 font-medium">
                          {item.quantity} {unitLabel}
                        </p>
                      </div>

                      {/* Tap indicator */}
                      <div className="flex-shrink-0 opacity-40">
                        <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-orange-400" />
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
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
              <h2 className="text-sm sm:text-base font-bold text-green-600">
                {language === 'he' ? 'נאסף!' : 'Collected!'}
              </h2>
              <span className="ml-auto px-2 py-0.5 bg-green-100 text-green-600 rounded-full text-xs font-bold">
                {completedItems.length}
              </span>
            </div>
            
            <div className="space-y-1.5 sm:space-y-2">
              {completedItems.map((item) => {
                const unitLabel = UNITS.find(u => u.value === item.unit)?.[language === 'he' ? 'labelHe' : 'labelEn'] || '';
                
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className={`
                      w-full text-${direction === 'rtl' ? 'right' : 'left'}
                      bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-2.5 sm:p-3
                      opacity-70 hover:opacity-90
                      transition-all duration-200
                      touch-manipulation active:scale-[0.98]
                    `}
                  >
                    <div className={`flex items-center gap-2.5 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                      {/* Checked indicator */}
                      <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" strokeWidth={3} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm sm:text-base font-medium text-gray-500 line-through truncate">
                          {item.text}
                        </p>
                        <p className="text-xs text-gray-400">
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
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-orange-100 flex items-center justify-center">
              <ShoppingCart className="h-8 w-8 text-orange-400" />
            </div>
            <p className="text-base text-gray-600 font-medium">
              {language === 'he' ? 'אין פריטים ברשימה' : 'No items in list'}
            </p>
          </div>
        )}

        {/* Mission Complete Celebration */}
        {showMissionComplete && progress === 100 && (
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-5 sm:p-6 text-center border-2 border-green-300 shadow-xl shadow-green-100/50 animate-bounce-in">
            <div className="text-4xl sm:text-5xl mb-3">🎉</div>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-1">
              {language === 'he' ? 'כל הכבוד!' : 'Amazing!'}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-slate-400 mb-3">
              {language === 'he' ? 'אספת את כל הפריטים!' : 'You collected everything!'}
            </p>
            <div className="flex justify-center gap-1.5">
              <Star className="h-5 w-5 text-yellow-400 animate-pulse" fill="currentColor" />
              <Star className="h-5 w-5 text-yellow-400 animate-pulse" fill="currentColor" style={{ animationDelay: '0.1s' }} />
              <Star className="h-5 w-5 text-yellow-400 animate-pulse" fill="currentColor" style={{ animationDelay: '0.2s' }} />
            </div>
          </div>
        )}
      </div>

      {/* Sticky Footer - Two Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-black/10 p-3 sm:p-4 shadow-2xl z-40">
        <div className={`max-w-3xl mx-auto flex gap-2 sm:gap-3 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
          {/* Save for Later Button */}
          <Button
            onClick={handleSaveForLater}
            variant="outline"
            className="flex-1 h-12 sm:h-14 text-sm sm:text-base font-bold rounded-xl bg-white dark:bg-slate-800 border-2 border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all touch-manipulation active:scale-[0.98]"
          >
            {language === 'he' ? 'שמור לאחר כך' : 'Save for Later'}
          </Button>
          
          {/* Finish Shopping Button */}
          <Button
            onClick={handleFinishShopping}
            className={`
              flex-1 h-12 sm:h-14 text-sm sm:text-base font-bold rounded-xl
              transition-all duration-300 touch-manipulation
              ${progress === 100 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-200/50 hover:shadow-xl hover:shadow-green-300/50' 
                : 'bg-gradient-to-r from-orange-400 to-yellow-400 text-white shadow-lg shadow-orange-200/50 hover:shadow-xl hover:shadow-orange-300/50'
              }
              active:scale-[0.98]
            `}
          >
            {progress === 100 ? (
              <>
                <PartyPopper className={`h-5 w-5 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                {language === 'he' ? 'סיום מושלם!' : 'Perfect Finish!'}
              </>
            ) : (
              <>
                <CheckCircle2 className={`h-5 w-5 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                {language === 'he' ? 'סיום קנייה' : 'Finish Shopping'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
