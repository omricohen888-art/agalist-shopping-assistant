import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingItem, Unit, UNITS, ShoppingHistory, ShoppingType, SHOPPING_TYPES, STORES_BY_TYPE } from "@/types/shopping";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, X, Check, ShoppingCart, Timer, Store,
  Plus, ClipboardPaste, Clock, Pin, PinOff, Trash2, Pencil, MessageSquare, Minus,
  Zap, Sparkles, Trophy, ArrowRight
} from "lucide-react";
import { useGlobalLanguage } from "@/context/LanguageContext";
import { useSoundSettings } from "@/hooks/use-sound-settings.tsx";
import { useHaptics } from "@/hooks/use-haptics";
import { ConfettiEffect } from "@/components/ConfettiEffect";
import { toast } from "sonner";
import { getSavedLists } from "@/utils/storage";
import { SavedList } from "@/types/shopping";
import { useCloudSync } from "@/hooks/use-cloud-sync";
import { motion, AnimatePresence, Reorder, useMotionValue, useTransform } from "framer-motion";

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

// Haptic feedback helper
const triggerHaptic = (pattern: number | number[] = 50) => {
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      // Vibration not supported
    }
  }
};

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

// Swipeable Item Component
const SwipeableItem = ({ 
  item, 
  onComplete, 
  onDelete, 
  onEdit,
  onPin,
  language,
  direction,
  isAnimating,
  editingItemId,
  editingQuantity,
  editingUnit,
  editingNote,
  setEditingQuantity,
  setEditingUnit,
  setEditingNote,
  saveItemEdit,
  cancelEdit,
}: {
  item: ShoppingItem;
  onComplete: (id: string) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onEdit: (item: ShoppingItem, e: React.MouseEvent) => void;
  onPin: (id: string, e: React.MouseEvent) => void;
  language: 'he' | 'en';
  direction: 'rtl' | 'ltr';
  isAnimating: boolean;
  editingItemId: string | null;
  editingQuantity: number;
  editingUnit: Unit;
  editingNote: string;
  setEditingQuantity: (q: number) => void;
  setEditingUnit: (u: Unit) => void;
  setEditingNote: (n: string) => void;
  saveItemEdit: () => void;
  cancelEdit: () => void;
}) => {
  const x = useMotionValue(0);
  const background = useTransform(
    x,
    direction === 'rtl' ? [0, 100] : [-100, 0],
    ['hsl(var(--success) / 0)', 'hsl(var(--success) / 0.3)']
  );
  const checkOpacity = useTransform(
    x,
    direction === 'rtl' ? [0, 80] : [-80, 0],
    [0, 1]
  );

  const unitLabel = UNITS.find(u => u.value === item.unit)?.[language === 'he' ? 'labelHe' : 'labelEn'] || '';
  const isEditing = editingItemId === item.id;

  const handleDragEnd = () => {
    const xValue = x.get();
    const threshold = 80;
    if ((direction === 'rtl' && xValue > threshold) || (direction === 'ltr' && xValue < -threshold)) {
      triggerHaptic([30, 50, 30]);
      onComplete(item.id);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: isAnimating ? 0.95 : 1,
        backgroundColor: isAnimating ? 'hsl(var(--success) / 0.2)' : 'hsl(var(--card))'
      }}
      exit={{ opacity: 0, x: direction === 'rtl' ? 100 : -100, scale: 0.8 }}
      transition={{ 
        layout: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
        scale: { type: "spring", stiffness: 500, damping: 25 }
      }}
      className={`
        relative overflow-hidden rounded-2xl
        border-2 transition-colors duration-300
        shadow-sm hover:shadow-lg
        ${item.pinned 
          ? 'border-destructive bg-destructive/5 ring-2 ring-destructive/20' 
          : 'border-foreground/20 hover:border-primary/50'
        }
        ${isAnimating ? 'border-success' : ''}
        ${isEditing ? 'border-primary bg-primary/5' : ''}
      `}
    >
      {/* Swipe background indicator */}
      <motion.div 
        className={`absolute inset-0 flex items-center ${direction === 'rtl' ? 'justify-start pl-6' : 'justify-end pr-6'}`}
        style={{ background }}
      >
        <motion.div style={{ opacity: checkOpacity }}>
          <Check className="h-8 w-8 text-success" strokeWidth={3} />
        </motion.div>
      </motion.div>

      {/* Pinned indicator badge */}
      {item.pinned && (
        <div className={`absolute -top-2 ${direction === 'rtl' ? 'left-3' : 'right-3'} z-10
          bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full
          flex items-center gap-1`}>
          <Pin className="h-2.5 w-2.5" />
          {language === 'he' ? 'דחוף' : 'Urgent'}
        </div>
      )}

      {/* Swipeable content */}
      <motion.div
        style={{ x }}
        drag="x"
        dragConstraints={{ left: direction === 'rtl' ? 0 : -100, right: direction === 'rtl' ? 100 : 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        className="relative bg-card p-3 sm:p-4"
      >
        {/* Normal View */}
        {!isEditing && (
          <div className={`flex items-center gap-3 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
            {/* Checkbox - Large and bouncy */}
            <motion.button
              onClick={() => {
                triggerHaptic(50);
                onComplete(item.id);
              }}
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.05 }}
              className={`
                flex-shrink-0 w-14 h-14 rounded-2xl
                flex items-center justify-center
                border-2 transition-all duration-300
                touch-manipulation
                ${isAnimating 
                  ? 'bg-success border-success text-success-foreground' 
                  : 'bg-muted/50 border-foreground/30 hover:border-primary hover:bg-primary/10'
                }
              `}
            >
              <AnimatePresence>
                {isAnimating && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  >
                    <Check className="h-8 w-8" strokeWidth={3} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Content - clickable to toggle */}
            <button
              onClick={() => {
                triggerHaptic(50);
                onComplete(item.id);
              }}
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

            {/* Action buttons - vertical stack */}
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={(e) => onPin(item.id, e)}
                className={`
                  w-9 h-9 rounded-xl flex items-center justify-center
                  border-2 transition-all duration-200
                  ${item.pinned 
                    ? 'bg-destructive text-destructive-foreground border-destructive' 
                    : 'bg-warning/10 text-warning border-warning/50 hover:bg-warning/20'
                  }
                `}
              >
                {item.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
              </motion.button>

              <div className="flex items-center gap-0.5">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => onEdit(item, e)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center
                    text-muted-foreground/60 hover:text-primary hover:bg-primary/10"
                >
                  <Pencil className="h-3 w-3" />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => onDelete(item.id, e)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center
                    text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3 w-3" />
                </motion.button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Mode */}
        {isEditing && (
          <div className="space-y-3">
            <p className={`text-base font-semibold text-foreground ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
              {item.text}
            </p>

            <div className={`flex items-center gap-3 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
              <span className="text-sm text-muted-foreground font-medium">
                {language === 'he' ? 'כמות:' : 'Qty:'}
              </span>
              <div className="flex items-center gap-2">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setEditingQuantity(Math.max(0.5, editingQuantity - 0.5))}
                  className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center"
                >
                  <Minus className="h-4 w-4" />
                </motion.button>
                <input
                  type="number"
                  inputMode="decimal"
                  value={editingQuantity}
                  onChange={(e) => setEditingQuantity(Math.max(0.5, parseFloat(e.target.value) || 0.5))}
                  className="w-16 h-8 text-center text-base font-semibold bg-background border border-border rounded-lg"
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setEditingQuantity(editingQuantity + 0.5)}
                  className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center"
                >
                  <Plus className="h-4 w-4" />
                </motion.button>
              </div>

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

            <div className={`flex gap-2 pt-1 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={cancelEdit}
                className="flex-1 h-9 rounded-lg border border-border bg-muted text-muted-foreground text-sm font-medium"
              >
                {language === 'he' ? 'ביטול' : 'Cancel'}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={saveItemEdit}
                className="flex-1 h-9 rounded-lg bg-primary text-primary-foreground text-sm font-bold"
              >
                {language === 'he' ? 'שמור' : 'Save'}
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

// Completed Item Component
const CompletedItem = ({ 
  item, 
  onToggle, 
  onDelete, 
  language, 
  direction 
}: {
  item: ShoppingItem;
  onToggle: (id: string) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  language: 'he' | 'en';
  direction: 'rtl' | 'ltr';
}) => {
  const unitLabel = UNITS.find(u => u.value === item.unit)?.[language === 'he' ? 'labelHe' : 'labelEn'] || '';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 0.7, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={`
        flex items-center gap-3 py-2 px-3
        bg-muted/30 rounded-lg
        ${direction === 'rtl' ? 'flex-row-reverse' : ''}
      `}
    >
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => onToggle(item.id)}
        className={`flex-1 min-w-0 text-${direction === 'rtl' ? 'right' : 'left'}`}
      >
        <div className={`flex items-center gap-3 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
          <div className="flex-shrink-0 w-6 h-6 rounded-md bg-success/20 flex items-center justify-center">
            <Check className="h-3.5 w-3.5 text-success" strokeWidth={2.5} />
          </div>
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
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={(e) => onDelete(item.id, e)}
        className="flex-shrink-0 w-7 h-7 rounded flex items-center justify-center
          text-muted-foreground/50 hover:text-destructive"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </motion.button>
    </motion.div>
  );
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

    let listData = localStorage.getItem(`shoppingList_${id}`);
    if (!listData) {
      listData = localStorage.getItem(`activeList_${id}`);
    }
    
    if (listData) {
      const list = JSON.parse(listData);
      setItems(list.items || []);
      setListName(list.name || (language === 'he' ? 'רשימת קניות' : 'Shopping List'));
      
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

  // Check for mission complete
  useEffect(() => {
    if (progress === 100 && totalCount > 0 && !showMissionComplete) {
      setShowMissionComplete(true);
      setShowConfetti(true);
      playFeedback('success');
      successPattern();
      triggerHaptic([50, 100, 50, 100, 50]);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [progress, totalCount, showMissionComplete, playFeedback, successPattern]);

  const toggleItem = useCallback((itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    if (!item.checked) {
      setAnimatingItemId(itemId);
      playFeedback('success');
      successPattern();
      triggerHaptic(50);
      
      setTimeout(() => {
        setItems(prev => prev.map(i =>
          i.id === itemId ? { ...i, checked: true } : i
        ));
        setAnimatingItemId(null);
      }, 300);
    } else {
      lightTap();
      triggerHaptic(30);
      setItems(prev => prev.map(i =>
        i.id === itemId ? { ...i, checked: false } : i
      ));
    }
  }, [items, playFeedback, successPattern, lightTap]);

  const handleFinishShopping = () => {
    if (!id) return;
    const uncollectedCount = items.filter(item => !item.checked).length;
    if (uncollectedCount > 0) {
      setShowUncollectedWarning(true);
    } else {
      setShowFinishDialog(true);
    }
  };

  const proceedToFinishDialog = () => {
    setShowUncollectedWarning(false);
    setShowFinishDialog(true);
  };

  const confirmFinishShopping = async () => {
    if (!id) return;
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

    await saveShoppingHistory(history);
    
    if (originalListId) {
      await deleteSavedList(originalListId);
    }
    
    localStorage.removeItem(`shoppingList_${id}`);
    localStorage.removeItem(`activeList_${id}`);

    setShowFinishDialog(false);
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
    setIsTimerRunning(false);

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
      await updateSavedList(listToSave);
    } else {
      await saveList(listToSave);
    }
    
    localStorage.removeItem(`shoppingList_${id}`);
    localStorage.removeItem(`activeList_${id}`);

    navigate("/");
    setTimeout(() => {
      toast.success(
        language === 'he' ? '💾 הרשימה נשמרה בהצלחה!' : '💾 List saved successfully!',
        { duration: 4000 }
      );
    }, 100);
  };

  const handleExit = () => {
    setShowExitDialog(true);
  };

  const confirmExit = () => {
    setShowExitDialog(false);
    localStorage.removeItem(`shoppingList_${id}`);
    localStorage.removeItem(`activeList_${id}`);
    navigate("/");
  };

  const togglePin = useCallback((itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    lightTap();
    triggerHaptic(30);
    setItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, pinned: !item.pinned } : item
    ));
  }, [lightTap]);

  const requestDeleteItem = useCallback((itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (skipDeleteConfirm) {
      setItems(prev => prev.filter(item => item.id !== itemId));
      lightTap();
      triggerHaptic(30);
      toast.success(language === 'he' ? 'פריט הוסר' : 'Item removed');
    } else {
      setPendingDeleteItemId(itemId);
      setDontAskAgainChecked(false);
      setShowDeleteConfirm(true);
    }
  }, [skipDeleteConfirm, lightTap, language]);

  const confirmDeleteItem = useCallback(() => {
    if (!pendingDeleteItemId) return;
    
    if (dontAskAgainChecked) {
      localStorage.setItem('agalist-skip-delete-confirm', 'true');
      setSkipDeleteConfirm(true);
    }
    
    setItems(prev => prev.filter(item => item.id !== pendingDeleteItemId));
    lightTap();
    triggerHaptic(30);
    toast.success(language === 'he' ? 'פריט הוסר' : 'Item removed');
    setShowDeleteConfirm(false);
    setPendingDeleteItemId(null);
  }, [pendingDeleteItemId, dontAskAgainChecked, lightTap, language]);

  const startEditingItem = useCallback((item: ShoppingItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingItemId(item.id);
    setEditingQuantity(item.quantity);
    setEditingUnit(item.unit);
    setEditingNote(item.note || "");
    lightTap();
  }, [lightTap]);

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

  const cancelEdit = useCallback(() => {
    setEditingItemId(null);
    setEditingNote("");
    setEditingQuantity(1);
    setEditingUnit("units");
  }, []);

  // Sorted items
  const { pinnedItems, groupedItems, flatSortedItems, completedItems } = useMemo(() => {
    const active = items.filter(item => !item.checked);
    const completed = items.filter(item => item.checked);
    const pinned = active.filter(item => item.pinned);
    const unpinned = active.filter(item => !item.pinned);
    
    if (isSmartSort) {
      const grouped = groupByCategory(unpinned);
      return { pinnedItems: pinned, groupedItems: grouped, flatSortedItems: [], completedItems: completed };
    } else {
      return { pinnedItems: pinned, groupedItems: null, flatSortedItems: unpinned, completedItems: completed };
    }
  }, [items, isSmartSort]);

  const activeItemsCount = items.filter(item => !item.checked).length;

  // Get progress bar color based on percentage
  const getProgressColor = () => {
    if (progress === 100) return 'from-success via-emerald-400 to-success';
    if (progress >= 75) return 'from-success/80 via-success to-emerald-400';
    if (progress >= 50) return 'from-warning via-amber-400 to-success/70';
    if (progress >= 25) return 'from-primary via-warning to-amber-400';
    return 'from-primary via-primary to-warning/70';
  };

  return (
    <div 
      className="min-h-screen pb-32 transition-all duration-500 relative overflow-hidden bg-gradient-to-b from-background via-background to-muted/20"
      dir={direction}
    >
      {/* Decorative Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 left-1/4 w-96 h-96 bg-success/10 rounded-full blur-3xl" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.12, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          className="absolute bottom-1/4 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl" 
        />
      </div>
      
      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <ConfettiEffect isActive={showConfetti} origin={{ x: 50, y: 30 }} />
        </div>
      )}

      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b-2 border-foreground/10 shadow-lg"
      >
        <div className="max-w-3xl mx-auto px-4 py-3">
          {/* Top Row */}
          <div className={`flex items-center justify-between mb-3 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleExit}
              className="h-10 w-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <X className="h-5 w-5" />
            </motion.button>

            <div className="text-center flex-1 px-4">
              <input
                type="text"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                placeholder={language === 'he' ? 'רשימת קניות' : 'Shopping List'}
                className="w-full max-w-[260px] text-center text-base font-semibold text-foreground bg-transparent focus:outline-none"
                dir={direction}
              />
              <div className={`flex items-center justify-center gap-2 mt-1 text-xs ${
                elapsedTime > 1800 ? 'text-destructive' : elapsedTime > 900 ? 'text-warning' : 'text-success'
              }`}>
                <Timer className="h-3.5 w-3.5" />
                <span className="font-mono tabular-nums font-medium">{formatTime(elapsedTime)}</span>
              </div>
            </div>

            {/* Status Badge */}
            <motion.div 
              animate={{ scale: progress === 100 ? [1, 1.1, 1] : 1 }}
              transition={{ duration: 0.5, repeat: progress === 100 ? Infinity : 0, repeatDelay: 1 }}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-lg
                ${progress === 100 
                  ? 'bg-gradient-to-r from-success to-emerald-400 text-white' 
                  : progress > 0
                    ? 'bg-gradient-to-r from-warning to-primary text-white'
                    : 'bg-gradient-to-r from-primary to-primary/80 text-white'
                }
              `}
            >
              {progress === 100 ? (
                <Trophy className="h-5 w-5" />
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
                    : (language === 'he' ? "בואו!" : "Let's Go!")
                }
              </span>
            </motion.div>
          </div>

          {/* Gamified Progress Bar */}
          <div className="space-y-2">
            <div className={`flex items-center justify-between text-sm ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
              <span className="font-bold text-foreground">
                {completedCount} / {totalCount} {language === 'he' ? 'נאספו' : 'collected'}
              </span>
              <span className="text-muted-foreground text-xs">
                {getProgressFeedback(progress, completedCount, totalCount, language)}
              </span>
            </div>
            
            <div className="relative h-4 bg-muted rounded-full overflow-hidden shadow-inner">
              <motion.div 
                className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${getProgressColor()}`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
              >
                {/* Glow effect */}
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </motion.div>
              
              {/* Shine animation */}
              {progress > 0 && progress < 100 && (
                <motion.div 
                  className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  animate={{ x: ['-100%', '400%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                />
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating Add Button - Accessible */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          setShowAddItemInput(true);
          setTimeout(() => addItemInputRef.current?.focus(), 100);
        }}
        className="fixed bottom-36 right-4 z-30 w-14 h-14 rounded-full bg-success text-success-foreground shadow-xl flex items-center justify-center"
      >
        <Plus className="h-7 w-7" />
      </motion.button>

      {/* Add Item Modal */}
      <AnimatePresence>
        {showAddItemInput && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl p-4 space-y-4"
            >
              <div className={`flex items-center justify-between ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <h3 className="text-base font-semibold text-foreground">
                  {language === 'he' ? 'הוספת פריטים' : 'Add Items'}
                </h3>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => { setShowAddItemInput(false); setNewItemText(""); }}
                  className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground flex items-center justify-center"
                >
                  <X className="h-4 w-4" />
                </motion.button>
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
                    triggerHaptic(50);
                    toast.success(language === 'he' ? `נוספו ${newItems.length} פריטים` : `Added ${newItems.length} items`);
                  } else if (e.key === 'Escape') {
                    setShowAddItemInput(false);
                    setNewItemText("");
                  }
                }}
                placeholder={language === 'he' 
                  ? 'הקלידו או הדביקו פריטים...\nחלב\nלחם\nביצים' 
                  : 'Type or paste items...\nMilk\nBread\nEggs'}
                className="w-full bg-muted/30 border border-border focus:border-primary rounded-xl text-base py-3 px-4 resize-none min-h-[140px]"
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
                        setNewItemText(prev => prev + (prev ? '\n' : '') + lines.join('\n'));
                        triggerHaptic(30);
                        toast.success(language === 'he' ? `הודבקו ${lines.length} שורות` : `Pasted ${lines.length} lines`);
                      }
                    } catch (e) {
                      toast.error(language === 'he' ? 'שגיאה בהדבקה' : 'Paste failed');
                    }
                  }}
                  className="h-10"
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
                      triggerHaptic(50);
                      toast.success(language === 'he' ? `נוספו ${newItems.length} פריטים` : `Added ${newItems.length} items`);
                    }
                  }}
                  disabled={!newItemText.trim()}
                  className="flex-1 h-10 bg-primary hover:bg-primary/90"
                >
                  {language === 'he' ? 'הוסף לרשימה' : 'Add to List'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Items List */}
      <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
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
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">
                {language === 'he' ? 'לאסוף' : 'To Collect'}
              </h2>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                {activeItemsCount}
              </span>
            </div>
            
            {/* Pinned Items */}
            <AnimatePresence>
              {pinnedItems.length > 0 && (
                <motion.div layout className="space-y-2">
                  <div className="flex items-center gap-2 px-1">
                    <Pin className="h-3.5 w-3.5 text-destructive fill-destructive" />
                    <span className="text-xs font-bold text-destructive">
                      {language === 'he' ? 'פריטים דחופים' : 'Urgent Items'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {pinnedItems.map((item) => (
                      <SwipeableItem
                        key={item.id}
                        item={item}
                        onComplete={toggleItem}
                        onDelete={requestDeleteItem}
                        onEdit={startEditingItem}
                        onPin={togglePin}
                        language={language}
                        direction={direction}
                        isAnimating={animatingItemId === item.id}
                        editingItemId={editingItemId}
                        editingQuantity={editingQuantity}
                        editingUnit={editingUnit}
                        editingNote={editingNote}
                        setEditingQuantity={setEditingQuantity}
                        setEditingUnit={setEditingUnit}
                        setEditingNote={setEditingNote}
                        saveItemEdit={saveItemEdit}
                        cancelEdit={cancelEdit}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Smart Sort Categories */}
            {isSmartSort && groupedItems && (
              <div className="space-y-4">
                {Array.from(groupedItems.entries()).map(([categoryKey, categoryItems]) => {
                  if (categoryItems.length === 0) return null;
                  const categoryInfo = getCategoryInfo(categoryKey);
                  return (
                    <motion.div layout key={categoryKey} className="space-y-2">
                      <div className="flex items-center gap-2 px-1">
                        <span className="text-base">{categoryInfo.icon}</span>
                        <span className="text-xs font-bold text-muted-foreground">
                          {language === 'he' ? categoryInfo.nameHe : categoryInfo.nameEn}
                        </span>
                        <span className="text-xs text-muted-foreground/70">({categoryItems.length})</span>
                      </div>
                      <div className="space-y-2">
                        <AnimatePresence>
                          {categoryItems.map((item) => (
                            <SwipeableItem
                              key={item.id}
                              item={item}
                              onComplete={toggleItem}
                              onDelete={requestDeleteItem}
                              onEdit={startEditingItem}
                              onPin={togglePin}
                              language={language}
                              direction={direction}
                              isAnimating={animatingItemId === item.id}
                              editingItemId={editingItemId}
                              editingQuantity={editingQuantity}
                              editingUnit={editingUnit}
                              editingNote={editingNote}
                              setEditingQuantity={setEditingQuantity}
                              setEditingUnit={setEditingUnit}
                              setEditingNote={setEditingNote}
                              saveItemEdit={saveItemEdit}
                              cancelEdit={cancelEdit}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Original Order */}
            {!isSmartSort && flatSortedItems.length > 0 && (
              <div className="space-y-2">
                <AnimatePresence>
                  {flatSortedItems.map((item) => (
                    <SwipeableItem
                      key={item.id}
                      item={item}
                      onComplete={toggleItem}
                      onDelete={requestDeleteItem}
                      onEdit={startEditingItem}
                      onPin={togglePin}
                      language={language}
                      direction={direction}
                      isAnimating={animatingItemId === item.id}
                      editingItemId={editingItemId}
                      editingQuantity={editingQuantity}
                      editingUnit={editingUnit}
                      editingNote={editingNote}
                      setEditingQuantity={setEditingQuantity}
                      setEditingUnit={setEditingUnit}
                      setEditingNote={setEditingNote}
                      saveItemEdit={saveItemEdit}
                      cancelEdit={cancelEdit}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}

        {/* Completed Items */}
        <AnimatePresence>
          {completedItems.length > 0 && (
            <motion.div 
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3 mt-6 pt-4 border-t border-border"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-success">
                  {language === 'he' ? 'נאסף' : 'Collected'}
                </h2>
                <span className="text-xs text-success/70 bg-success/10 px-2 py-0.5 rounded">
                  {completedItems.length}
                </span>
              </div>
              
              <div className="space-y-1.5">
                {completedItems.map((item) => (
                  <CompletedItem
                    key={item.id}
                    item={item}
                    onToggle={toggleItem}
                    onDelete={requestDeleteItem}
                    language={language}
                    direction={direction}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {items.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 px-6"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-muted/50 flex items-center justify-center">
              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">
              {language === 'he' ? 'הרשימה ריקה' : 'List is empty'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === 'he' ? 'הוסף פריטים כדי להתחיל' : 'Add items to get started'}
            </p>
          </motion.div>
        )}

        {/* Mission Complete Banner */}
        <AnimatePresence>
          {showMissionComplete && progress === 100 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="bg-gradient-to-r from-success/20 via-success/10 to-emerald-500/20 rounded-2xl p-6 text-center border-2 border-success/30"
            >
              <motion.div 
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 3 }}
                className="w-16 h-16 mx-auto mb-3 rounded-full bg-success/20 flex items-center justify-center"
              >
                <Trophy className="h-8 w-8 text-success" />
              </motion.div>
              <h3 className="text-xl font-bold text-success mb-1">
                {language === 'he' ? '🎉 קנייה הושלמה!' : '🎉 Shopping Complete!'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === 'he' ? `סיימת ב-${formatTime(elapsedTime)}` : `Completed in ${formatTime(elapsedTime)}`}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sticky Action Deck (Bottom Bar) */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t-2 border-foreground/10 p-4 z-40 shadow-2xl"
      >
        <div className={`max-w-3xl mx-auto flex gap-3 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSaveForLater}
            className="flex-1 h-14 rounded-2xl border-2 border-border bg-card flex items-center justify-center gap-2 font-semibold text-foreground"
          >
            <Clock className="h-5 w-5" />
            {language === 'he' ? 'שמור' : 'Save'}
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleFinishShopping}
            className={`flex-[2] h-14 rounded-2xl flex items-center justify-center gap-2 font-bold text-lg shadow-lg ${
              progress === 100 
                ? 'bg-gradient-to-r from-success to-emerald-400 text-white' 
                : 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground'
            }`}
          >
            {progress === 100 ? (
              <>
                <Trophy className="h-6 w-6" />
                {language === 'he' ? 'סיים וחגוג!' : 'Finish & Celebrate!'}
              </>
            ) : (
              <>
                <CheckCircle2 className="h-6 w-6" />
                {language === 'he' ? 'סיים קנייה' : 'Finish Shopping'}
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Finish Shopping Dialog */}
      <Dialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <DialogContent className="sm:max-w-md" dir={direction}>
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">
              {language === 'he' ? '🛒 סיום קנייה' : '🛒 Finish Shopping'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="shoppingType" className="text-sm font-medium">
                {language === 'he' ? 'סוג קנייה' : 'Shopping Type'}
              </Label>
              <Select 
                value={selectedShoppingType} 
                onValueChange={(value: ShoppingType) => {
                  setSelectedShoppingType(value);
                  setSelectedStore("");
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
                    <span>{language === 'he' ? 'בחר סוג' : 'Select type'}</span>
                  )}
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50" dir={direction}>
                  {SHOPPING_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <span className={`flex items-center gap-2 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                        <span>{type.icon}</span>
                        <span>{language === 'he' ? type.labelHe : type.labelEn}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="store" className="text-sm font-medium">
                {language === 'he' ? 'רשת/חנות' : 'Store'}
              </Label>
              <Select value={selectedStore} onValueChange={setSelectedStore}>
                <SelectTrigger dir={direction} className="w-full h-12 text-base">
                  {selectedStore ? (
                    <span className={`flex items-center gap-2 w-full ${direction === 'rtl' ? 'flex-row-reverse justify-end' : ''}`}>
                      <span className="w-5 h-5 flex-shrink-0">{getStoreLogo(selectedStore)}</span>
                      <span>{selectedStore}</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Store className="h-4 w-4 opacity-50" />
                      {language === 'he' ? 'בחר חנות' : 'Select store'}
                    </span>
                  )}
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50" dir={direction}>
                  {STORES_BY_TYPE[selectedShoppingType].map((store) => (
                    <SelectItem key={store} value={store}>
                      <span className={`flex items-center gap-2 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                        <span className="w-5 h-5">{getStoreLogo(store)}</span>
                        <span>{store}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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

            <div className="bg-gradient-to-r from-success/10 to-primary/10 rounded-xl p-4 space-y-2">
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
            <Button variant="outline" onClick={() => setShowFinishDialog(false)} className="flex-1">
              {language === 'he' ? 'ביטול' : 'Cancel'}
            </Button>
            <Button onClick={confirmFinishShopping} className="flex-1 bg-success hover:bg-success/90">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {language === 'he' ? 'שמור וסיים' : 'Save & Finish'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Uncollected Items Warning */}
      <Dialog open={showUncollectedWarning} onOpenChange={setShowUncollectedWarning}>
        <DialogContent className="sm:max-w-md" dir={direction}>
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">
              {language === 'he' ? '⚠️ רגע!' : '⚠️ Wait!'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4 text-center space-y-3">
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-16 h-16 mx-auto rounded-full bg-warning/15 flex items-center justify-center"
            >
              <ShoppingCart className="h-8 w-8 text-warning" />
            </motion.div>
            <p className="text-base font-medium text-foreground">
              {language === 'he' 
                ? `שכחת ${items.filter(item => !item.checked).length} פריטים!` 
                : `You forgot ${items.filter(item => !item.checked).length} items!`
              }
            </p>
            <p className="text-sm text-muted-foreground">
              {language === 'he' ? 'האם אתה בטוח שברצונך לסיים?' : 'Are you sure you want to finish?'}
            </p>
          </div>

          <DialogFooter className="flex flex-col gap-2 sm:flex-col">
            <Button onClick={() => setShowUncollectedWarning(false)} className="w-full h-12 text-base font-bold">
              {language === 'he' ? '🛒 חזרה לקנייה' : '🛒 Back to Shopping'}
            </Button>
            <Button variant="outline" onClick={proceedToFinishDialog} className="w-full h-12 text-base font-medium text-muted-foreground">
              {language === 'he' ? 'המשך בכל זאת' : 'Continue Anyway'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Exit Dialog */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent className="sm:max-w-md" dir={direction}>
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">
              {language === 'he' ? '🛒 לצאת מהקנייה?' : '🛒 Exit Shopping?'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4 text-center">
            <p className="text-muted-foreground">
              {language === 'he' ? 'האם לשמור את הרשימה לפני היציאה?' : 'Would you like to save the list before exiting?'}
            </p>
          </div>

          <DialogFooter className="flex flex-col gap-2 sm:flex-col">
            <Button onClick={() => { setShowExitDialog(false); handleSaveForLater(); }} className="w-full h-12 text-base font-bold">
              {language === 'he' ? '💾 שמור לאחר כך' : '💾 Save for Later'}
            </Button>
            <Button variant="outline" onClick={confirmExit} className="w-full h-12 text-base font-medium text-muted-foreground hover:text-destructive">
              {language === 'he' ? 'כן, אני בטוח' : "Yes, I'm sure"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-sm" dir={direction}>
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-bold">
              {language === 'he' ? '🗑️ למחוק פריט?' : '🗑️ Delete Item?'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-3 text-center">
            <p className="text-sm text-muted-foreground">
              {language === 'he' ? 'האם אתה בטוח שברצונך להסיר פריט זה?' : 'Are you sure you want to remove this item?'}
            </p>
          </div>

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
            <Button variant="outline" onClick={() => { setShowDeleteConfirm(false); setPendingDeleteItemId(null); }} className="flex-1">
              {language === 'he' ? 'ביטול' : 'Cancel'}
            </Button>
            <Button onClick={confirmDeleteItem} className="flex-1 bg-destructive hover:bg-destructive/90">
              <Trash2 className="h-4 w-4 mr-1" />
              {language === 'he' ? 'מחק' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
