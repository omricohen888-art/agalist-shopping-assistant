import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingItem, Unit, UNITS, ShoppingHistory, ShoppingType, SHOPPING_TYPES, STORES_BY_TYPE } from "@/types/shopping";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, X, Check, ShoppingCart, Timer, Store,
  Plus, ClipboardPaste, Clock, Pin, PinOff, Trash2, Pencil, MessageSquare, Minus,
  Zap, Sparkles
} from "lucide-react";
import { useGlobalLanguage } from "@/context/LanguageContext";
import { useSoundSettings } from "@/hooks/use-sound-settings.tsx";
import { useHaptics } from "@/hooks/use-haptics";
import { ConfettiEffect } from "@/components/ConfettiEffect";
import { toast } from "sonner";
import { getSavedLists } from "@/utils/storage";
import { SavedList } from "@/types/shopping";
import { useCloudSync } from "@/hooks/use-cloud-sync";

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

// Clean status text based on progress
const getStatusText = (
  progress: number, 
  language: 'he' | 'en'
): string => {
  if (progress === 0) {
    return language === 'he' ? 'מצב קנייה' : 'Shopping Mode';
  }
  if (progress < 100) {
    return language === 'he' ? 'בתהליך' : 'In Progress';
  }
  return language === 'he' ? 'הושלם' : 'Completed';
};

// Professional progress feedback messages
const getProgressFeedback = (
  progress: number,
  completedCount: number,
  totalCount: number,
  language: 'he' | 'en'
): string => {
  if (progress === 0) {
    return language === 'he' 
      ? `${totalCount} פריטים ברשימה` 
      : `${totalCount} items in list`;
  }
  if (progress < 25) {
    return language === 'he' 
      ? 'התחלת לאסוף' 
      : 'Started collecting';
  }
  if (progress < 50) {
    return language === 'he' 
      ? 'ממשיך להתקדם' 
      : 'Making progress';
  }
  if (progress < 75) {
    return language === 'he' 
      ? 'יותר מחצי הדרך' 
      : 'Past halfway';
  }
  if (progress < 100) {
    return language === 'he' 
      ? `נותרו ${totalCount - completedCount} פריטים` 
      : `${totalCount - completedCount} items left`;
  }
  return language === 'he' 
    ? 'כל הפריטים נאספו' 
    : 'All items collected';
};

export const ShoppingMode = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useGlobalLanguage();
  const { playFeedback } = useSoundSettings();
  const { successPattern, lightTap } = useHaptics();
  const { saveShoppingHistory, saveList, updateSavedList, deleteSavedList } = useCloudSync();
  
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDeleteItemId, setPendingDeleteItemId] = useState<string | null>(null);
  const [skipDeleteConfirm, setSkipDeleteConfirm] = useState(() => {
    return localStorage.getItem('agalist-skip-delete-confirm') === 'true';
  });
  const [dontAskAgainChecked, setDontAskAgainChecked] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState("");
  const [editingQuantity, setEditingQuantity] = useState<number>(1);
  const [editingUnit, setEditingUnit] = useState<Unit>("units");
  const direction = language === 'he' ? 'rtl' : 'ltr';

  // Stopwatch state
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const addItemInputRef = useRef<HTMLTextAreaElement>(null);

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
  const statusText = getStatusText(progress, language);

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

  const confirmFinishShopping = async () => {
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
    await saveShoppingHistory(history);
    
    // Delete original list from savedLists (moves to history only)
    if (originalListId) {
      await deleteSavedList(originalListId);
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

  const handleSaveForLater = async () => {
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
      await updateSavedList(listToSave);
    } else {
      // New list - save as new
      await saveList(listToSave);
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

  // Request to delete an item (may show confirmation)
  const requestDeleteItem = useCallback((itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (skipDeleteConfirm) {
      // Skip confirmation - delete immediately
      setItems(prev => prev.filter(item => item.id !== itemId));
      lightTap();
      toast.success(language === 'he' ? 'פריט הוסר' : 'Item removed');
    } else {
      // Show confirmation dialog
      setPendingDeleteItemId(itemId);
      setDontAskAgainChecked(false);
      setShowDeleteConfirm(true);
    }
  }, [skipDeleteConfirm, lightTap, language]);

  // Confirm delete item
  const confirmDeleteItem = useCallback(() => {
    if (!pendingDeleteItemId) return;
    
    // Save preference if checkbox was checked
    if (dontAskAgainChecked) {
      localStorage.setItem('agalist-skip-delete-confirm', 'true');
      setSkipDeleteConfirm(true);
    }
    
    setItems(prev => prev.filter(item => item.id !== pendingDeleteItemId));
    lightTap();
    toast.success(language === 'he' ? 'פריט הוסר' : 'Item removed');
    setShowDeleteConfirm(false);
    setPendingDeleteItemId(null);
  }, [pendingDeleteItemId, dontAskAgainChecked, lightTap, language]);

  // Start editing an item
  const startEditingItem = useCallback((item: ShoppingItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingItemId(item.id);
    setEditingQuantity(item.quantity);
    setEditingUnit(item.unit);
    setEditingNote(item.note || "");
    lightTap();
  }, [lightTap]);

  // Save item edits
  const saveItemEdit = useCallback(() => {
    if (!editingItemId) return;
    
    setItems(prev => prev.map(item =>
      item.id === editingItemId
        ? { ...item, quantity: editingQuantity, unit: editingUnit, note: editingNote.trim() || undefined }
        : item
    ));
    
    setEditingItemId(null);
    lightTap();
    toast.success(language === 'he' ? 'הפריט עודכן' : 'Item updated');
  }, [editingItemId, editingQuantity, editingUnit, editingNote, lightTap, language]);

  // Cancel editing
  const cancelEdit = useCallback(() => {
    setEditingItemId(null);
    setEditingNote("");
    setEditingQuantity(1);
    setEditingUnit("units");
  }, []);

  // Update quantity inline
  const updateQuantity = useCallback((delta: number) => {
    setEditingQuantity(prev => Math.max(0.5, prev + delta));
  }, []);

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
    const isEditing = editingItemId === item.id;
    const unitLabel = UNITS.find(u => u.value === item.unit)?.[language === 'he' ? 'labelHe' : 'labelEn'] || '';
    
    return (
      <div
        key={item.id}
        className={`
          relative w-full
          bg-card rounded-2xl p-3 sm:p-4
          border-2 transition-all duration-300
          shadow-sm hover:shadow-lg
          ${item.pinned 
            ? 'border-destructive bg-destructive/5 ring-2 ring-destructive/20' 
            : 'border-foreground/20 hover:border-primary/50'
          }
          ${isAnimating 
            ? 'border-success bg-success/10 scale-[0.98] shadow-xl' 
            : ''
          }
          ${isEditing ? 'border-primary bg-primary/5' : ''}
        `}
      >
        {/* Pinned indicator badge */}
        {item.pinned && (
          <div className={`absolute -top-2 ${direction === 'rtl' ? 'left-3' : 'right-3'} 
            bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full
            flex items-center gap-1`}>
            <Pin className="h-2.5 w-2.5" />
            {language === 'he' ? 'דחוף' : 'Urgent'}
          </div>
        )}

        {/* Normal View */}
        {!isEditing && (
          <div className={`flex items-center gap-3 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
            {/* Checkbox - Large and prominent */}
            <button
              onClick={() => toggleItem(item.id)}
              className={`
                flex-shrink-0 w-14 h-14 rounded-2xl
                flex items-center justify-center
                border-2 transition-all duration-300
                touch-manipulation active:scale-90
                ${isAnimating 
                  ? 'bg-success border-success text-success-foreground scale-105' 
                  : 'bg-muted/50 border-foreground/30 hover:border-primary hover:bg-primary/10'
                }
              `}
            >
              {isAnimating && (
                <Check className="h-8 w-8 animate-check-bounce" strokeWidth={3} />
              )}
            </button>

            {/* Content - clickable to toggle */}
            <button
              onClick={() => toggleItem(item.id)}
              className={`flex-1 min-w-0 text-${direction === 'rtl' ? 'right' : 'left'} touch-manipulation py-2`}
            >
              <p className="text-base sm:text-lg font-bold text-foreground truncate">
                {item.text}
              </p>
              <div className="flex flex-col gap-0.5">
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                  {item.quantity} {unitLabel}
                </p>
                {item.note && (
                  <p className="text-xs text-destructive font-medium flex items-center gap-1">
                    <MessageSquare className="h-3 w-3 inline" />
                    {item.note}
                  </p>
                )}
              </div>
            </button>

            {/* Action buttons - vertical stack for cleaner look */}
            <div className={`flex flex-col items-center gap-1 flex-shrink-0`}>
              {/* Pin button - prominent */}
              <button
                onClick={(e) => togglePin(item.id, e)}
                className={`
                  w-9 h-9 rounded-xl flex items-center justify-center
                  border-2 transition-all duration-200 touch-manipulation active:scale-90
                  ${item.pinned 
                    ? 'bg-destructive text-destructive-foreground border-destructive' 
                    : 'bg-warning/10 text-warning border-warning/50 hover:bg-warning/20 hover:border-warning'
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

              {/* Secondary actions row */}
              <div className="flex items-center gap-0.5">
                {/* Edit button */}
                <button
                  onClick={(e) => startEditingItem(item, e)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center
                    transition-all duration-200 touch-manipulation active:scale-90
                    text-muted-foreground/60 hover:text-primary hover:bg-primary/10"
                  title={language === 'he' ? 'ערוך פריט' : 'Edit item'}
                >
                  <Pencil className="h-3 w-3" />
                </button>

                {/* Delete button */}
                <button
                  onClick={(e) => requestDeleteItem(item.id, e)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center
                    transition-all duration-200 touch-manipulation active:scale-90
                    text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10"
                  title={language === 'he' ? 'הסר פריט' : 'Remove item'}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Mode */}
        {isEditing && (
          <div className="space-y-3">
            {/* Item name (read-only) */}
            <p className={`text-base font-semibold text-foreground ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
              {item.text}
            </p>

            {/* Quantity controls */}
            <div className={`flex items-center gap-3 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
              <span className="text-sm text-muted-foreground font-medium">
                {language === 'he' ? 'כמות:' : 'Qty:'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(-0.5)}
                  className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center
                    hover:bg-accent transition-colors touch-manipulation active:scale-95"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  type="number"
                  inputMode="decimal"
                  value={editingQuantity}
                  onChange={(e) => setEditingQuantity(Math.max(0.5, parseFloat(e.target.value) || 0.5))}
                  className="w-16 h-8 text-center text-base font-semibold bg-background border border-border rounded-lg"
                />
                <button
                  onClick={() => updateQuantity(0.5)}
                  className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center
                    hover:bg-accent transition-colors touch-manipulation active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Unit selector */}
              <Select value={editingUnit} onValueChange={(val) => setEditingUnit(val as Unit)}>
                <SelectTrigger className="w-24 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => (
                    <SelectItem key={u.value} value={u.value}>
                      {language === 'he' ? u.labelHe : u.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Note input */}
            <div className="space-y-1">
              <label className={`text-sm text-muted-foreground font-medium flex items-center gap-1 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <MessageSquare className="h-3.5 w-3.5" />
                {language === 'he' ? 'הערה:' : 'Note:'}
              </label>
              <input
                type="text"
                value={editingNote}
                onChange={(e) => setEditingNote(e.target.value)}
                placeholder={language === 'he' ? 'הוסף הערה...' : 'Add a note...'}
                className={`w-full h-9 px-3 text-sm bg-background border border-border rounded-lg ${direction === 'rtl' ? 'text-right' : 'text-left'}`}
                dir={direction}
              />
            </div>

            {/* Action buttons */}
            <div className={`flex gap-2 pt-1 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
              <button
                onClick={cancelEdit}
                className="flex-1 h-9 rounded-lg border border-border bg-muted text-muted-foreground
                  hover:bg-accent transition-colors text-sm font-medium touch-manipulation active:scale-95"
              >
                {language === 'he' ? 'ביטול' : 'Cancel'}
              </button>
              <button
                onClick={saveItemEdit}
                className="flex-1 h-9 rounded-lg bg-primary text-primary-foreground
                  hover:bg-primary/90 transition-colors text-sm font-bold touch-manipulation active:scale-95"
              >
                {language === 'he' ? 'שמור' : 'Save'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      className="min-h-screen pb-28 sm:pb-32 transition-all duration-500 relative overflow-hidden bg-gradient-to-b from-background via-background to-muted/20"
      dir={direction}
    >
      {/* Colorful Decorative Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-success/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-warning/10 rounded-full blur-3xl" />
      </div>
      
      
      {/* Full-screen Confetti for Mission Complete */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <ConfettiEffect isActive={showConfetti} origin={{ x: 50, y: 30 }} />
        </div>
      )}

      {/* Professional Header with Welcome Message */}
      <div className="sticky top-0 z-40 bg-card border-b-2 border-foreground/20 shadow-md">
        <div className="max-w-3xl mx-auto px-4 py-3">
          {/* Welcome Banner */}
          <div className={`text-center mb-3 pb-3 border-b border-border ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
            <h1 className="text-lg font-bold text-foreground">
              {language === 'he' ? 'מצב קנייה אינטראקטיבי' : 'Interactive Shopping Mode'}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {language === 'he' 
                ? 'סמנו פריטים תוך כדי קנייה • הוסיפו פריטים בזמן אמת' 
                : 'Check items while shopping • Add items in real-time'}
            </p>
          </div>
          {/* Top Row: Exit + Title + Status */}
          <div className={`flex items-center justify-between mb-3 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
            {/* Exit Button - Minimal */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExit}
              className="h-9 w-9 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <X className="h-5 w-5" />
            </Button>

            {/* Center: List Name & Timer */}
            <div className="text-center flex-1 px-4">
              <input
                type="text"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                placeholder={language === 'he' ? 'רשימת קניות' : 'Shopping List'}
                className="w-full max-w-[260px] text-center text-base font-semibold text-foreground bg-transparent focus:outline-none placeholder:text-muted-foreground"
                dir={direction}
              />
              <div className={`flex items-center justify-center gap-2 mt-1 text-xs ${
                elapsedTime > 1800 ? 'text-destructive' : elapsedTime > 900 ? 'text-warning' : 'text-success'
              }`}>
                <Timer className="h-3.5 w-3.5" />
                <span className="font-mono tabular-nums font-medium">{formatTime(elapsedTime)}</span>
              </div>
            </div>

            {/* Status Badge - Large & Inviting */}
            <div className={`
              flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold
              transition-all duration-300 shadow-md
              ${progress === 100 
                ? 'bg-gradient-to-r from-success to-emerald-400 text-white animate-pulse-glow' 
                : progress > 0
                  ? 'bg-gradient-to-r from-warning to-primary text-white'
                  : 'bg-gradient-to-r from-cyan-500 to-primary text-white'
              }
            `}>
              {progress === 100 ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : progress > 0 ? (
                <Zap className="h-5 w-5" />
              ) : (
                <ShoppingCart className="h-5 w-5" />
              )}
              <span>
                {progress === 100 
                  ? (language === 'he' ? 'סיימת!' : 'Done!')
                  : progress > 0 
                    ? `${progress}%`
                    : (language === 'he' ? 'בואו נתחיל!' : "Let's Go!")
                }
              </span>
            </div>
          </div>

          {/* Progress Bar - Colorful Gradient */}
          <div className="space-y-2">
            <div className="relative h-3 bg-muted rounded-full overflow-hidden shadow-inner">
              <div 
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out"
                style={{ 
                  width: `${progress}%`,
                  background: progress === 100 
                    ? 'linear-gradient(90deg, hsl(152, 69%, 46%), hsl(160, 84%, 39%))' 
                    : progress > 50 
                      ? 'linear-gradient(90deg, hsl(38, 92%, 50%), hsl(152, 69%, 46%))'
                      : 'linear-gradient(90deg, hsl(47.9, 95.8%, 53.1%), hsl(38, 92%, 50%))'
                }}
              />
              {/* Animated shine effect */}
              {progress > 0 && progress < 100 && (
                <div className="absolute inset-0 overflow-hidden rounded-full">
                  <div className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine" />
                </div>
              )}
            </div>

            {/* Counter Row - Enhanced with feedback */}
            <div className={`flex items-center justify-between text-sm ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground">
                  {completedCount} / {totalCount}
                </span>
                <span className="text-muted-foreground text-xs">
                  · {getProgressFeedback(progress, completedCount, totalCount, language)}
                </span>
              </div>
              <div className={`flex items-center gap-1.5 font-bold ${
                progress === 100 ? 'text-success' : progress > 50 ? 'text-warning' : 'text-primary'
              }`}>
                {progress === 100 && <CheckCircle2 className="h-4 w-4" />}
                {progress}%
              </div>
          </div>
        </div>
      </div>
      </div>

      {/* Quick Add Button - Prominent & Inviting */}
      <div className="sticky top-[140px] z-30 bg-gradient-to-b from-background via-background to-transparent px-4 py-3">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => {
              setShowAddItemInput(true);
              setTimeout(() => addItemInputRef.current?.focus(), 100);
            }}
            className={`
              w-full flex items-center justify-center gap-3 h-12
              bg-gradient-to-r from-success/10 to-primary/10 
              hover:from-success/20 hover:to-primary/20
              border-2 border-success/50 hover:border-success
              rounded-xl text-base font-semibold text-foreground 
              shadow-sm hover:shadow-md
              transition-all duration-200
              ${direction === 'rtl' ? 'flex-row-reverse' : ''}
            `}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-success/20">
              <Plus className="h-5 w-5 text-success" />
            </div>
            {language === 'he' ? 'הוסף פריט לרשימה' : 'Add item to list'}
          </button>
        </div>
      </div>

      {/* Add Item Modal/Expanded Area */}
      {showAddItemInput && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
          <div className="w-full max-w-lg bg-card border border-border rounded-xl shadow-xl p-4 space-y-4">
            <div className={`flex items-center justify-between ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
              <h3 className="text-base font-semibold text-foreground">
                {language === 'he' ? 'הוספת פריטים' : 'Add Items'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setShowAddItemInput(false); setNewItemText(""); }}
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <textarea
              ref={addItemInputRef}
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && newItemText.trim()) {
                  e.preventDefault();
                  const lines = newItemText.split(/[\n,]/).map(l => sanitizeInput(l.trim())).filter(l => l.length > 0);
                  const newItems: ShoppingItem[] = lines.map((text, i) => ({
                    id: `${Date.now()}-${i}`,
                    text: text.replace(/^•\s*/, ''),
                    checked: false,
                    quantity: 1,
                    unit: 'units' as Unit
                  }));
                  setItems(prev => [...newItems, ...prev]);
                  setNewItemText("");
                  setShowAddItemInput(false);
                  toast.success(language === 'he' ? `נוספו ${newItems.length} פריטים` : `Added ${newItems.length} items`);
                } else if (e.key === 'Escape') {
                  setShowAddItemInput(false);
                  setNewItemText("");
                }
              }}
              placeholder={language === 'he' 
                ? 'הקלידו או הדביקו פריטים...\nחלב\nלחם\nביצים' 
                : 'Type or paste items...\nMilk\nBread\nEggs'}
              className="w-full bg-muted/30 border border-border focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-lg outline-none text-base text-foreground placeholder:text-muted-foreground/50 py-3 px-4 resize-none min-h-[140px] transition-colors"
              rows={5}
              autoFocus
              dir={direction}
            />

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    const text = await navigator.clipboard.readText();
                    if (text.trim()) {
                      const lines = text.split(/[\n,]/).map(l => sanitizeInput(l.trim())).filter(l => l.length > 0);
                      const newItems: ShoppingItem[] = lines.map((line, i) => ({
                        id: `${Date.now()}-${i}`,
                        text: line.replace(/^•\s*/, ''),
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
                className="flex-1 h-10"
              >
                <ClipboardPaste className="h-4 w-4 mr-2" />
                {language === 'he' ? 'הדבק' : 'Paste'}
              </Button>
              <Button
                onClick={() => {
                  if (newItemText.trim()) {
                    const lines = newItemText.split(/[\n,]/).map(l => sanitizeInput(l.trim())).filter(l => l.length > 0);
                    const newItems: ShoppingItem[] = lines.map((text, i) => ({
                      id: `${Date.now()}-${i}`,
                      text: text.replace(/^•\s*/, ''),
                      checked: false,
                      quantity: 1,
                      unit: 'units' as Unit
                    }));
                    setItems(prev => [...newItems, ...prev]);
                    setNewItemText("");
                    setShowAddItemInput(false);
                    toast.success(language === 'he' ? `נוספו ${newItems.length} פריטים` : `Added ${newItems.length} items`);
                  }
                }}
                disabled={!newItemText.trim()}
                className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {language === 'he' ? 'הוסף לרשימה' : 'Add to List'}
              </Button>
            </div>
          </div>
        </div>
      )}


      {/* Items List */}
      <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
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

        {/* Active Items Header - Clean */}
        {activeItemsCount > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">
                {language === 'he' ? 'לאסוף' : 'To Collect'}
              </h2>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                {activeItemsCount}
              </span>
            </div>
            
            {/* Pinned Items Section */}
            {pinnedItems.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <Pin className="h-3.5 w-3.5 text-destructive fill-destructive" />
                  <span className="text-xs font-bold text-destructive">
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
                        <span className="text-xs font-bold text-muted-foreground">
                          {language === 'he' ? categoryInfo.nameHe : categoryInfo.nameEn}
                        </span>
                        <span className="text-xs text-muted-foreground/70">({categoryItems.length})</span>
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

        {/* Completed Items - Clean header */}
        {completedItems.length > 0 && (
          <div className="space-y-3 mt-6 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-success">
                {language === 'he' ? 'נאסף' : 'Collected'}
              </h2>
              <span className="text-xs text-success/70 bg-success/10 px-2 py-0.5 rounded">
                {completedItems.length}
              </span>
            </div>
            
            <div className="space-y-1.5">
              {completedItems.map((item) => {
                const unitLabel = UNITS.find(u => u.value === item.unit)?.[language === 'he' ? 'labelHe' : 'labelEn'] || '';
                
                return (
                  <div 
                    key={item.id}
                    className={`
                      flex items-center gap-3 py-2 px-3
                      bg-muted/30 rounded-lg
                      transition-colors
                      ${direction === 'rtl' ? 'flex-row-reverse' : ''}
                    `}
                  >
                    <button
                      onClick={() => toggleItem(item.id)}
                      className={`flex-1 min-w-0 text-${direction === 'rtl' ? 'right' : 'left'} touch-manipulation`}
                    >
                      <div className={`flex items-center gap-3 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                        {/* Checked indicator */}
                        <div className="flex-shrink-0 w-6 h-6 rounded-md bg-success/20 flex items-center justify-center">
                          <Check className="h-3.5 w-3.5 text-success" strokeWidth={2.5} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-muted-foreground line-through truncate">
                            {item.text}
                          </p>
                          {(item.note || item.quantity > 1) && (
                            <p className="text-xs text-muted-foreground/60">
                              {item.quantity} {unitLabel}
                              {item.note && ` • ${item.note}`}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={(e) => requestDeleteItem(item.id, e)}
                      className="flex-shrink-0 w-7 h-7 rounded flex items-center justify-center
                        text-muted-foreground/50 hover:text-destructive transition-colors"
                      title={language === 'he' ? 'הסר' : 'Remove'}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State - Clean */}
        {items.length === 0 && (
          <div className="text-center py-16 px-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-muted/50 flex items-center justify-center">
              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">
              {language === 'he' ? 'הרשימה ריקה' : 'List is empty'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === 'he' ? 'הוסף פריטים כדי להתחיל' : 'Add items to get started'}
            </p>
          </div>
        )}

        {/* Mission Complete - Minimal celebration */}
        {showMissionComplete && progress === 100 && (
          <div className="bg-success/10 rounded-xl p-6 text-center border border-success/20">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-success/20 flex items-center justify-center">
              <Check className="h-6 w-6 text-success" strokeWidth={2.5} />
            </div>
            <h3 className="text-lg font-semibold text-success mb-1">
              {language === 'he' ? 'הושלם!' : 'Complete!'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === 'he' ? `הזמן: ${formatTime(elapsedTime)}` : `Time: ${formatTime(elapsedTime)}`}
            </p>
          </div>
        )}
      </div>

      {/* Footer - Clean and professional */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 z-40">
        <div className={`max-w-3xl mx-auto flex gap-3 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
          <Button
            onClick={handleSaveForLater}
            variant="outline"
            className="flex-1 h-11"
          >
            <Clock className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
            {language === 'he' ? 'שמור' : 'Save'}
          </Button>
          
          <Button
            onClick={handleFinishShopping}
            className={`flex-1 h-11 ${
              progress === 100 
                ? 'bg-success hover:bg-success/90 text-success-foreground' 
                : 'bg-primary hover:bg-primary/90 text-primary-foreground'
            }`}
          >
            <CheckCircle2 className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
            {language === 'he' ? 'סיים קנייה' : 'Finish'}
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
                <SelectTrigger dir={direction} className="w-full h-12 text-base">
                  {selectedShoppingType ? (
                    <span className={`flex items-center gap-2 w-full ${direction === 'rtl' ? 'flex-row-reverse justify-end' : ''}`}>
                      <span>{SHOPPING_TYPES.find(t => t.value === selectedShoppingType)?.icon}</span>
                      <span>{language === 'he' 
                        ? SHOPPING_TYPES.find(t => t.value === selectedShoppingType)?.labelHe 
                        : SHOPPING_TYPES.find(t => t.value === selectedShoppingType)?.labelEn
                      }</span>
                    </span>
                  ) : (
                    <span className={`flex items-center gap-2 w-full ${direction === 'rtl' ? 'flex-row-reverse justify-end' : ''}`}>
                      <span>{language === 'he' ? 'בחר סוג' : 'Select type'}</span>
                    </span>
                  )}
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50" dir={direction}>
                  {SHOPPING_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value} className={`text-base ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                      <span className={`flex items-center gap-2 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
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
                <SelectTrigger dir={direction} className={`w-full h-12 text-base ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                  {selectedStore ? (
                    <span className={`flex items-center gap-2 w-full ${direction === 'rtl' ? 'flex-row-reverse justify-end' : ''}`}>
                      <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center text-foreground [&_svg]:w-5 [&_svg]:h-5 [&_svg]:max-w-5 [&_svg]:max-h-5">{getStoreLogo(selectedStore)}</span>
                      <span>{selectedStore}</span>
                    </span>
                  ) : (
                    <span className={`flex items-center gap-2 w-full ${direction === 'rtl' ? 'flex-row-reverse justify-end' : ''}`}>
                      <Store className="h-4 w-4 opacity-50" />
                      <span>{language === 'he' ? 'בחר חנות' : 'Select store'}</span>
                    </span>
                  )}
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50" dir={direction}>
                  {STORES_BY_TYPE[selectedShoppingType].map((store) => (
                    <SelectItem key={store} value={store} className={`text-base ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                      <span className={`flex items-center gap-2 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
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
              className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
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
            <div className="w-16 h-16 mx-auto rounded-full bg-warning/15 flex items-center justify-center">
              <ShoppingCart className="h-8 w-8 text-warning" />
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
      {/* Delete Item Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-sm" dir={direction}>
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-bold">
              {language === 'he' ? '🗑️ למחוק פריט?' : '🗑️ Delete Item?'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-3 text-center">
            <p className="text-sm text-muted-foreground">
              {language === 'he' 
                ? 'האם אתה בטוח שברצונך להסיר פריט זה?' 
                : 'Are you sure you want to remove this item?'
              }
            </p>
          </div>

          {/* Don't ask again checkbox */}
          <div className={`flex items-center gap-2 px-2 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
            <input
              type="checkbox"
              id="dontAskAgain"
              checked={dontAskAgainChecked}
              onChange={(e) => setDontAskAgainChecked(e.target.checked)}
              className="w-4 h-4 rounded border-border"
            />
            <label htmlFor="dontAskAgain" className="text-sm text-muted-foreground cursor-pointer">
              {language === 'he' ? 'אל תציג הודעה זו שוב' : "Don't show this again"}
            </label>
          </div>

          <DialogFooter className={`flex gap-2 pt-2 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteConfirm(false);
                setPendingDeleteItemId(null);
              }}
              className="flex-1"
            >
              {language === 'he' ? 'ביטול' : 'Cancel'}
            </Button>
            <Button
              onClick={confirmDeleteItem}
              className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              {language === 'he' ? 'מחק' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
