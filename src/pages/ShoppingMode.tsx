import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingItem, Unit, UNITS, ShoppingHistory, ShoppingType, SHOPPING_TYPES, STORES_BY_TYPE } from "@/types/shopping";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, CheckCircle2, Home, X, Check, Sparkles, 
  Trophy, Zap, Star, PartyPopper, ShoppingCart, Timer, Store,
  Plus, ClipboardPaste, Clock, Pin, PinOff
} from "lucide-react";
import { useGlobalLanguage } from "@/context/LanguageContext";
import { useSoundSettings } from "@/hooks/use-sound-settings.tsx";
import { useHaptics } from "@/hooks/use-haptics";
import { ConfettiEffect } from "@/components/ConfettiEffect";
import { toast } from "sonner";
import { saveShoppingHistory, saveList, deleteSavedList, updateSavedList, getSavedLists } from "@/utils/storage";
import { SavedList } from "@/types/shopping";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sanitizeInput } from "@/utils/security";
import { SortModeToggle } from "@/components/SortModeToggle";
import { sortByCategory, groupByCategory, getCategoryInfo, CategoryKey } from "@/utils/categorySort";
import { getStoreLogo } from "@/data/storeLogos";

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
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const [showUncollectedWarning, setShowUncollectedWarning] = useState(false);
  const [totalAmount, setTotalAmount] = useState("");
  const [selectedStore, setSelectedStore] = useState("");
  const [selectedShoppingType, setSelectedShoppingType] = useState<ShoppingType>("supermarket");
  const [showAddItemInput, setShowAddItemInput] = useState(false);
  const [newItemText, setNewItemText] = useState("");
  const [isSmartSort, setIsSmartSort] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [originalListId, setOriginalListId] = useState<string | null>(null);
  const direction = language === 'he' ? 'rtl' : 'ltr';

  // Stopwatch state
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const addItemInputRef = useRef<HTMLInputElement>(null);

  // Timer effect
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerRunning]);

  // Format time as MM:SS or HH:MM:SS
  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!id) {
      navigate("/");
      return;
    }

    // Try both key patterns for compatibility
    let listData = localStorage.getItem(`shoppingList_${id}`);
    if (!listData) {
      listData = localStorage.getItem(`activeList_${id}`);
    }
    
    if (listData) {
      const list = JSON.parse(listData);
      setItems(list.items || []);
      setListName(list.name || (language === 'he' ? 'רשימת קניות' : 'Shopping List'));
      
      // Check if this list exists in savedLists and save its original ID
      const savedLists = getSavedLists();
      const existingList = savedLists.find(savedList => savedList.id === id);
      if (existingList) {
        setOriginalListId(id);
      }
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
    
    // Check if there are uncollected items
    const uncollectedCount = items.filter(item => !item.checked).length;
    if (uncollectedCount > 0) {
      // Show warning dialog
      setShowUncollectedWarning(true);
    } else {
      // All items collected, open finish dialog
      setShowFinishDialog(true);
    }
  };

  const proceedToFinishDialog = () => {
    setShowUncollectedWarning(false);
    setShowFinishDialog(true);
  };

  const confirmFinishShopping = () => {
    if (!id) return;

    // Stop timer
    setIsTimerRunning(false);

    const history: ShoppingHistory = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      listName: listName.trim() || undefined,
      items: items,
      totalAmount: parseFloat(totalAmount) || 0,
      store: selectedStore || (language === 'he' ? 'לא צוין' : 'Not specified'),
      completedItems: completedCount,
      totalItems: totalCount,
      shoppingType: selectedShoppingType,
    };

    // Use storage utility function to save with correct key
    saveShoppingHistory(history);
    
    // Delete original list from savedLists (moves to history only)
    if (originalListId) {
      deleteSavedList(originalListId);
    }
    
    localStorage.removeItem(`shoppingList_${id}`);
    localStorage.removeItem(`activeList_${id}`);

    setShowFinishDialog(false);
    
    // Navigate to dashboard and show toast
    navigate("/");
    setTimeout(() => {
      toast.success(
        language === 'he' ? '🎉 הקנייה הושלמה בהצלחה!' : '🎉 Shopping completed successfully!',
        { duration: 4000 }
      );
    }, 100);
  };

  const handleSaveForLater = () => {
    if (!id) return;

    // Stop timer
    setIsTimerRunning(false);

    // Create list object - use original ID if exists to update instead of create
    const listToSave: SavedList = {
      id: originalListId || Date.now().toString(),
      name: listName,
      items: items,
      createdAt: new Date().toISOString(),
      isShoppingComplete: completedCount === totalCount && totalCount > 0,
      shoppingCompletedAt: completedCount === totalCount && totalCount > 0 ? new Date().toISOString() : undefined,
      shoppingDuration: elapsedTime,
    };
    
    if (originalListId) {
      // Update existing list - moves it to "Continue where we left off" section
      updateSavedList(listToSave);
    } else {
      // New list - save as new
      saveList(listToSave);
    }
    
    // Remove active list
    localStorage.removeItem(`shoppingList_${id}`);
    localStorage.removeItem(`activeList_${id}`);

    // Navigate to dashboard and show toast
    navigate("/");
    setTimeout(() => {
      toast.success(
        language === 'he' ? '💾 הרשימה נשמרה בהצלחה!' : '💾 List saved successfully!',
        { duration: 4000 }
      );
    }, 100);
  };

  const handleExit = () => {
    // Show exit dialog to ask about saving
    setShowExitDialog(true);
  };

  const confirmExit = () => {
    setShowExitDialog(false);
    localStorage.removeItem(`shoppingList_${id}`);
    localStorage.removeItem(`activeList_${id}`);
    navigate("/");
  };

  // Toggle pin status
  const togglePin = useCallback((itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    lightTap();
    setItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, pinned: !item.pinned } : item
    ));
  }, [lightTap]);

  // Sorted items with pinned first, then smart sort if enabled
  const { pinnedItems, groupedItems, flatSortedItems } = useMemo(() => {
    const active = items.filter(item => !item.checked);
    const pinned = active.filter(item => item.pinned);
    const unpinned = active.filter(item => !item.pinned);
    
    if (isSmartSort) {
      const grouped = groupByCategory(unpinned);
      return { pinnedItems: pinned, groupedItems: grouped, flatSortedItems: [] };
    } else {
      return { pinnedItems: pinned, groupedItems: null, flatSortedItems: unpinned };
    }
  }, [items, isSmartSort]);

  const activeItemsCount = items.filter(item => !item.checked).length;

  const completedItems = items.filter(item => item.checked);

  // Render a single item
  const renderItem = (item: ShoppingItem) => {
    const isAnimating = animatingItemId === item.id;
    const unitLabel = UNITS.find(u => u.value === item.unit)?.[language === 'he' ? 'labelHe' : 'labelEn'] || '';
    
    return (
      <div
        key={item.id}
        className={`
          relative w-full
          bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-3 sm:p-4
          border-2 transition-all duration-300
          shadow-sm
          ${item.pinned ? 'border-red-300 bg-red-50/50 dark:bg-red-900/20' : 'border-transparent'}
          ${isAnimating 
            ? 'border-green-400 bg-green-50/90 scale-[0.97] shadow-lg shadow-green-200/50' 
            : ''
          }
        `}
      >
        <div className={`flex items-center gap-3 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
          {/* Checkbox */}
          <button
            onClick={() => toggleItem(item.id)}
            className={`
              flex-shrink-0 w-11 h-11 sm:w-14 sm:h-14 rounded-xl
              flex items-center justify-center
              border-2 transition-all duration-300
              touch-manipulation active:scale-95
              ${isAnimating 
                ? 'bg-green-500 border-green-500 text-white scale-110' 
                : 'bg-white border-gray-300 dark:bg-slate-700 dark:border-slate-600 hover:border-primary'
              }
            `}
          >
            {isAnimating && (
              <Check className="h-6 w-6 sm:h-7 sm:w-7 animate-check-bounce" strokeWidth={3} />
            )}
          </button>

          {/* Content */}
          <button
            onClick={() => toggleItem(item.id)}
            className={`flex-1 min-w-0 text-${direction === 'rtl' ? 'right' : 'left'} touch-manipulation`}
          >
            <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
              {item.text}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 font-medium">
              {item.quantity} {unitLabel}
            </p>
          </button>

          {/* Pin button */}
          <button
            onClick={(e) => togglePin(item.id, e)}
            className={`
              flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
              transition-all duration-200 touch-manipulation active:scale-90
              ${item.pinned 
                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:bg-slate-700 dark:hover:bg-slate-600'
              }
            `}
            title={item.pinned 
              ? (language === 'he' ? 'הסר נעיצה' : 'Unpin') 
              : (language === 'he' ? 'נעץ פריט דחוף' : 'Pin urgent')
            }
          >
            {item.pinned ? (
              <PinOff className="h-4 w-4" />
            ) : (
              <Pin className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div 
      className="min-h-screen pb-28 sm:pb-32 transition-all duration-500 relative overflow-hidden"
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
          {/* Top Row: Exit + Title + Green Cart */}
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
              {/* Editable List Name */}
              <input
                type="text"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                placeholder={language === 'he' ? 'שם הרשימה...' : 'List name...'}
                className="w-full max-w-[200px] text-center text-xs sm:text-sm text-gray-600 dark:text-slate-400 font-medium bg-transparent border-b border-dashed border-gray-300 dark:border-slate-600 focus:border-primary focus:outline-none px-2 py-0.5 transition-colors"
                dir={direction}
              />
            </div>

            {/* Green Shopping Cart Icon - Indicates Shopping Mode */}
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-success/15 flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-success" strokeWidth={2.5} />
            </div>
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

            {/* Counter Pills + Timer - Compact */}
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
              
              {/* Timer - Fun & Inviting */}
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-cyan-50 to-sky-50 dark:from-cyan-900/30 dark:to-sky-900/30 rounded-xl border border-cyan-200/50 dark:border-cyan-700/50 shadow-sm">
                <div className="relative">
                  <Clock className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                </div>
                <div className="flex flex-col">
                  <span className="font-mono font-black text-base sm:text-lg tabular-nums text-cyan-700 dark:text-cyan-300">
                    {formatTime(elapsedTime)}
                  </span>
                  <span className="text-[9px] text-cyan-600/70 dark:text-cyan-400/70 font-medium -mt-0.5">
                    {language === 'he' ? 'זמן קנייה' : 'Shopping time'}
                  </span>
                </div>
              </div>
              
              <span className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
                {progress}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Shopping Mode Banner */}
      <div className="bg-success/10 border-b border-success/20">
        <div className="max-w-3xl mx-auto px-3 py-2 flex items-center justify-center gap-2">
          <ShoppingCart className="h-4 w-4 text-success" />
          <span className="text-sm font-medium text-success">
            {language === 'he' 
              ? 'מצב קנייה אינטראקטיבי - חוויית קנייה משופרת' 
              : 'Interactive Shopping Mode - Enhanced Shopping Experience'}
          </span>
        </div>
      </div>

      {/* Quick Add Item Bar - Enhanced & Prominent */}
      <div className="sticky top-[140px] z-30 bg-gradient-to-b from-white/90 to-white/70 dark:from-slate-900/90 dark:to-slate-900/70 backdrop-blur-md border-b border-primary/10 px-3 py-3">
        <div className="max-w-3xl mx-auto">
          {showAddItemInput ? (
            <div className="flex items-center gap-2">
              <input
                ref={addItemInputRef}
                type="text"
                value={newItemText}
                onChange={(e) => setNewItemText(sanitizeInput(e.target.value))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newItemText.trim()) {
                    // Check if multiple lines (pasted content)
                    const lines = newItemText.split(/[\n,]/).map(l => l.trim()).filter(l => l.length > 0);
                    const newItems: ShoppingItem[] = lines.map((text, i) => ({
                      id: `${Date.now()}-${i}`,
                      text: text.replace(/^•\s*/, ''),
                      checked: false,
                      quantity: 1,
                      unit: 'units' as Unit
                    }));
                    setItems(prev => [...newItems, ...prev]);
                    setNewItemText("");
                    toast.success(language === 'he' ? `נוספו ${newItems.length} פריטים` : `Added ${newItems.length} items`);
                  } else if (e.key === 'Escape') {
                    setShowAddItemInput(false);
                    setNewItemText("");
                  }
                }}
                placeholder={language === 'he' ? 'הקלד פריט או הדבק רשימה...' : 'Type item or paste list...'}
                className="flex-1 h-12 px-4 text-base bg-white dark:bg-slate-800 border-2 border-primary/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm"
                autoFocus
              />
              <Button
                size="sm"
                onClick={async () => {
                  try {
                    const text = await navigator.clipboard.readText();
                    if (text.trim()) {
                      const lines = text.split(/[\n,]/).map(l => l.trim()).filter(l => l.length > 0);
                      const newItems: ShoppingItem[] = lines.map((line, i) => ({
                        id: `${Date.now()}-${i}`,
                        text: sanitizeInput(line.replace(/^•\s*/, '')),
                        checked: false,
                        quantity: 1,
                        unit: 'units' as Unit
                      }));
                      setItems(prev => [...newItems, ...prev]);
                      setNewItemText("");
                      setShowAddItemInput(false);
                      toast.success(language === 'he' ? `הודבקו ${newItems.length} פריטים` : `Pasted ${newItems.length} items`);
                    }
                  } catch {
                    toast.error(language === 'he' ? 'לא ניתן לקרוא מהלוח' : 'Cannot read clipboard');
                  }
                }}
                className="h-12 px-4 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
                variant="ghost"
              >
                <ClipboardPaste className="h-5 w-5" />
              </Button>
              <Button
                size="sm"
                onClick={() => { setShowAddItemInput(false); setNewItemText(""); }}
                variant="ghost"
                className="h-12 w-12 text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <button
              onClick={() => {
                setShowAddItemInput(true);
                setTimeout(() => addItemInputRef.current?.focus(), 100);
              }}
              className="w-full flex items-center justify-center gap-3 h-14 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 hover:from-primary/20 hover:via-primary/10 hover:to-primary/20 border-2 border-dashed border-primary/40 hover:border-primary/60 rounded-2xl text-base font-bold text-primary transition-all active:scale-[0.98] shadow-sm hover:shadow-md"
            >
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Plus className="h-5 w-5" />
              </div>
              {language === 'he' ? 'הוסף פריט או הדבק רשימה' : 'Add item or paste list'}
            </button>
          )}
        </div>
      </div>

      {/* Items List - Mobile-Optimized */}
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Sort Toggle */}
        {activeItemsCount > 0 && (
          <div className="mb-2">
            <SortModeToggle 
              isSmartSort={isSmartSort} 
              onToggle={setIsSmartSort} 
              language={language} 
            />
          </div>
        )}

        {/* Active Items */}
        {activeItemsCount > 0 && (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
              <h2 className="text-sm sm:text-base font-bold text-gray-800 dark:text-white">
                {language === 'he' ? 'צריך לאסוף' : 'To Collect'}
              </h2>
              <span className="ml-auto px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full text-xs font-bold">
                {activeItemsCount}
              </span>
            </div>
            
            {/* Pinned Items Section */}
            {pinnedItems.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <Pin className="h-3.5 w-3.5 text-red-500 fill-red-500" />
                  <span className="text-xs font-bold text-red-600">
                    {language === 'he' ? 'פריטים דחופים' : 'Urgent Items'}
                  </span>
                </div>
                <div className="space-y-2">
                  {pinnedItems.map((item) => renderItem(item))}
                </div>
              </div>
            )}

            {/* Smart Sort with Categories */}
            {isSmartSort && groupedItems && (
              <div className="space-y-4">
                {Array.from(groupedItems.entries()).map(([categoryKey, categoryItems]) => {
                  if (categoryItems.length === 0) return null;
                  const categoryInfo = getCategoryInfo(categoryKey);
                  return (
                    <div key={categoryKey} className="space-y-2">
                      <div className="flex items-center gap-2 px-1">
                        <span className="text-base">{categoryInfo.icon}</span>
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                          {language === 'he' ? categoryInfo.nameHe : categoryInfo.nameEn}
                        </span>
                        <span className="text-xs text-gray-400">({categoryItems.length})</span>
                      </div>
                      <div className="space-y-2">
                        {categoryItems.map((item) => renderItem(item))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Original Order (flat list) */}
            {!isSmartSort && flatSortedItems.length > 0 && (
              <div className="space-y-2">
                {flatSortedItems.map((item) => renderItem(item))}
              </div>
            )}
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

      {/* Finish Shopping Dialog */}
      <Dialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <DialogContent className="sm:max-w-md" dir={direction}>
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">
              {language === 'he' ? '🛒 סיום קנייה' : '🛒 Finish Shopping'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Shopping Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="shoppingType" className="text-sm font-medium">
                {language === 'he' ? 'סוג קנייה' : 'Shopping Type'}
              </Label>
              <Select 
                value={selectedShoppingType} 
                onValueChange={(value: ShoppingType) => {
                  setSelectedShoppingType(value);
                  setSelectedStore(""); // Reset store when type changes
                }}
              >
                <SelectTrigger className="w-full h-12 text-base">
                  <SelectValue placeholder={language === 'he' ? 'בחר סוג' : 'Select type'} />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50">
                  {SHOPPING_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value} className="text-base">
                      <span className="flex items-center gap-2">
                        <span>{type.icon}</span>
                        <span>{language === 'he' ? type.labelHe : type.labelEn}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Store Selection */}
            <div className="space-y-2">
              <Label htmlFor="store" className="text-sm font-medium">
                {language === 'he' ? 'רשת/חנות' : 'Store'}
              </Label>
              <Select value={selectedStore} onValueChange={setSelectedStore}>
                <SelectTrigger className="w-full h-12 text-base">
                  {selectedStore ? (
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center text-foreground [&_svg]:w-5 [&_svg]:h-5 [&_svg]:max-w-5 [&_svg]:max-h-5">{getStoreLogo(selectedStore)}</span>
                      <span>{selectedStore}</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Store className="h-4 w-4 opacity-50" />
                      <span>{language === 'he' ? 'בחר חנות' : 'Select store'}</span>
                    </span>
                  )}
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50">
                  {STORES_BY_TYPE[selectedShoppingType].map((store) => (
                    <SelectItem key={store} value={store} className="text-base">
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center text-foreground [&_svg]:w-5 [&_svg]:h-5 [&_svg]:max-w-5 [&_svg]:max-h-5">{getStoreLogo(store)}</span>
                        <span>{store}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Total Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium">
                {language === 'he' ? 'סכום הקנייה (₪)' : 'Total Amount ($)'}
              </Label>
              <Input
                id="amount"
                type="number"
                inputMode="decimal"
                placeholder={language === 'he' ? 'לדוגמה: 250' : 'e.g., 250'}
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                className="h-12 text-base text-center"
              />
            </div>

            {/* Shopping Summary */}
            <div className="bg-muted/50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{language === 'he' ? 'פריטים שנאספו:' : 'Items collected:'}</span>
                <span className="font-bold text-success">{completedCount}/{totalCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{language === 'he' ? 'זמן קנייה:' : 'Shopping time:'}</span>
                <span className="font-bold font-mono">{formatTime(elapsedTime)}</span>
              </div>
            </div>
          </div>

          <DialogFooter className={`flex gap-2 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
            <Button
              variant="outline"
              onClick={() => setShowFinishDialog(false)}
              className="flex-1"
            >
              {language === 'he' ? 'ביטול' : 'Cancel'}
            </Button>
            <Button
              onClick={confirmFinishShopping}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {language === 'he' ? 'שמור וסיים' : 'Save & Finish'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Uncollected Items Warning Dialog */}
      <Dialog open={showUncollectedWarning} onOpenChange={setShowUncollectedWarning}>
        <DialogContent className="sm:max-w-md" dir={direction}>
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">
              {language === 'he' ? '⚠️ רגע!' : '⚠️ Wait!'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4 text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-orange-100 flex items-center justify-center">
              <ShoppingCart className="h-8 w-8 text-orange-500" />
            </div>
            <p className="text-base font-medium text-foreground">
              {language === 'he' 
                ? `שכחת ${items.filter(item => !item.checked).length} פריטים!` 
                : `You forgot ${items.filter(item => !item.checked).length} items!`
              }
            </p>
            <p className="text-sm text-muted-foreground">
              {language === 'he' 
                ? 'האם אתה בטוח שברצונך לסיים?' 
                : 'Are you sure you want to finish?'
              }
            </p>
          </div>

          <DialogFooter className="flex flex-col gap-2 sm:flex-col">
            <Button
              onClick={() => setShowUncollectedWarning(false)}
              className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90"
            >
              {language === 'he' ? '🛒 חזרה לקנייה' : '🛒 Back to Shopping'}
            </Button>
            <Button
              variant="outline"
              onClick={proceedToFinishDialog}
              className="w-full h-12 text-base font-medium text-muted-foreground"
            >
              {language === 'he' ? 'המשך בכל זאת' : 'Continue Anyway'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Exit Confirmation Dialog */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent className="sm:max-w-md" dir={direction}>
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">
              {language === 'he' ? '🛒 לצאת מהקנייה?' : '🛒 Exit Shopping?'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4 text-center">
            <p className="text-muted-foreground">
              {language === 'he' 
                ? 'האם לשמור את הרשימה לפני היציאה?' 
                : 'Would you like to save the list before exiting?'
              }
            </p>
          </div>

          <DialogFooter className="flex flex-col gap-2 sm:flex-col">
            <Button
              onClick={() => {
                setShowExitDialog(false);
                handleSaveForLater();
              }}
              className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90"
            >
              {language === 'he' ? '💾 שמור לאחר כך' : '💾 Save for Later'}
            </Button>
            <Button
              variant="outline"
              onClick={confirmExit}
              className="w-full h-12 text-base font-medium text-muted-foreground hover:text-destructive hover:border-destructive/50"
            >
              {language === 'he' ? 'כן, אני בטוח' : "Yes, I'm sure"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
