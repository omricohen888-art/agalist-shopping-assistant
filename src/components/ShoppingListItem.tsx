import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Check, Plus, Minus, Sparkles } from "lucide-react";
import { ShoppingItem, Unit, UNITS } from "@/types/shopping";
import { useGlobalLanguage } from "@/context/LanguageContext";
import { useSoundSettings } from "@/hooks/use-sound-settings.tsx";
import { useHaptics } from "@/hooks/use-haptics";
import { ConfettiEffect } from "./ConfettiEffect";

import QuantityControl from "@/components/QuantityControl";

// Unit type categories for smart behavior
// SCENARIO A: Discrete Units (whole numbers, stepper-only)
const DISCRETE_UNITS: Unit[] = ['units', 'package'];

interface QuantityStepperProps {
  value: number;
  onChange: (val: number) => void;
  unit: Unit;
}


interface ShoppingListItemProps {
  item: ShoppingItem;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onQuantityChange: (id: string, quantity: number) => void;
  onUnitChange: (id: string, unit: Unit) => void;
  isCompleted?: boolean;
}

export const ShoppingListItem = ({
  item,
  onToggle,
  onDelete,
  onQuantityChange,
  onUnitChange,
  isCompleted = false
}: ShoppingListItemProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [ripplePos, setRipplePos] = useState({ x: 0, y: 0 });
  const [showRipple, setShowRipple] = useState(false);
  const checkboxRef = useRef<HTMLButtonElement>(null);

  const { language } = useGlobalLanguage();
  const { playFeedback } = useSoundSettings();
  const { successPattern } = useHaptics();
  const direction = language === 'he' ? 'rtl' : 'ltr';

  const handleCheck = (e: React.MouseEvent) => {
    if (item.checked) {
      // Unchecking - simple feedback
      playFeedback('click');
      onToggle(item.id);
      return;
    }

    // Checking - full celebration!
    const rect = checkboxRef.current?.getBoundingClientRect();
    if (rect) {
      setRipplePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }

    setShowRipple(true);
    setIsAnimating(true);
    setShowConfetti(true);

    // Haptic + Sound feedback
    successPattern();
    playFeedback('success');

    // Staggered animations
    setTimeout(() => setShowRipple(false), 600);
    setTimeout(() => {
      onToggle(item.id);
      setIsAnimating(false);
    }, 400);
    setTimeout(() => setShowConfetti(false), 800);
  };

  const visualChecked = isAnimating || item.checked;
  const isDimmed = isCompleted && !isAnimating;

  return (
    <div
      className={`
        relative flex items-center p-3 mb-2 rounded-xl border border-border/30
        bg-card/50 shadow-sm transition-all duration-200
        ${isDimmed ? 'opacity-50' : ''}
        ${visualChecked ? 'bg-success/5 border-success/20' : ''}
      `}
      dir={direction}
    >
      <ConfettiEffect isActive={showConfetti} origin={{ x: 20, y: 20 }} />

      {/* Checkbox */}
      <div className="flex-shrink-0 ml-3">
        <button
          ref={checkboxRef}
          onClick={handleCheck}
          className={`
            w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300
            ${visualChecked
              ? 'bg-success border-success scale-110'
              : 'border-muted-foreground/40 hover:border-primary/50'
            }
          `}
        >
          {visualChecked && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
        </button>
      </div>

      {/* Name & Unit */}
      <div className="flex-1 min-w-0 pr-3 flex flex-col justify-center translate-y-[1px]">
        <span
          onClick={handleCheck}
          className={`
            text-base font-medium truncate leading-tight cursor-pointer select-none transition-all
            ${visualChecked ? "line-through text-muted-foreground" : "text-foreground"}
          `}
        >
          {item.text}
        </span>
      </div>

      {/* Quantity Control (Right Side) */}
      <div className="flex-shrink-0 flex items-center z-10">
        <QuantityControl
          value={item.quantity || 1}
          onChange={(val) => onQuantityChange(item.id, val)}
          unit={item.unit || 'units'}
          isCompleted={visualChecked}
          onDelete={() => onDelete(item.id)}
        />
      </div>
    </div>
  );
};
