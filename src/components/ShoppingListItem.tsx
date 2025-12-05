import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Check, Plus, Minus, Sparkles } from "lucide-react";
import { ShoppingItem, Unit, UNITS } from "@/types/shopping";
import { useGlobalLanguage } from "@/context/LanguageContext";
import { useSoundSettings } from "@/hooks/use-sound-settings.tsx";
import { useHaptics } from "@/hooks/use-haptics";
import { ConfettiEffect } from "./ConfettiEffect";

interface QuantityStepperProps {
  value: number;
  onChange: (val: number) => void;
  unit: Unit;
  isCompleted?: boolean;
}

const QuantityStepper = ({ value, onChange, unit, isCompleted }: QuantityStepperProps) => {
  const step = unit === 'units' ? 1 : 0.5;
  const minValue = unit === 'units' ? 1 : 0.1;
  const { lightTap } = useHaptics();
  
  const handleIncrement = useCallback(() => {
    lightTap();
    const newValue = Math.round((value + step) * 10) / 10;
    onChange(newValue);
  }, [value, step, onChange, lightTap]);

  const handleDecrement = useCallback(() => {
    lightTap();
    const newValue = Math.max(minValue, Math.round((value - step) * 10) / 10);
    onChange(newValue);
  }, [value, step, minValue, onChange, lightTap]);

  const displayValue = unit === 'units' ? Math.round(value) : value;

  return (
    <div 
      className={`
        inline-flex items-center 
        rounded-2xl 
        overflow-hidden
        transition-all duration-300 ease-out
        shadow-sm
        ${isCompleted 
          ? 'bg-muted/50 opacity-50' 
          : 'glass hover:shadow-md hover:shadow-primary/10'
        }
      `}
    >
      {/* Minus Button */}
      <button
        type="button"
        onClick={handleDecrement}
        disabled={isCompleted || value <= minValue}
        className={`
          flex items-center justify-center
          w-12 h-12 sm:w-14 sm:h-14
          transition-all duration-200
          touch-manipulation
          active:scale-90 active:bg-primary/10
          ${isCompleted || value <= minValue
            ? 'text-muted-foreground/40 cursor-not-allowed'
            : 'text-foreground/70 hover:bg-primary/10 hover:text-primary'
          }
        `}
        aria-label="Decrease quantity"
      >
        <Minus className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
      </button>

      {/* Value Display */}
      <div 
        className={`
          min-w-[3.5rem] sm:min-w-[4rem] 
          text-center 
          font-bold 
          text-xl sm:text-2xl
          tabular-nums
          select-none
          py-2
          ${isCompleted 
            ? 'text-muted-foreground/50' 
            : 'text-foreground'
          }
        `}
      >
        {displayValue}
      </div>

      {/* Plus Button */}
      <button
        type="button"
        onClick={handleIncrement}
        disabled={isCompleted}
        className={`
          flex items-center justify-center
          w-12 h-12 sm:w-14 sm:h-14
          transition-all duration-200
          touch-manipulation
          active:scale-90 active:bg-primary/10
          ${isCompleted
            ? 'text-muted-foreground/40 cursor-not-allowed'
            : 'text-foreground/70 hover:bg-primary/10 hover:text-primary'
          }
        `}
        aria-label="Increase quantity"
      >
        <Plus className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
      </button>
    </div>
  );
};

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
        relative overflow-hidden
        rounded-3xl 
        transition-all duration-400 ease-out
        touch-manipulation
        ${isDimmed 
          ? 'glass opacity-60 scale-[0.98]' 
          : visualChecked 
            ? 'glass-strong border-2 border-success/40 shadow-lg shadow-success/10' 
            : 'glass-strong hover:shadow-xl hover:shadow-primary/5 hover:scale-[1.01] active:scale-[0.99]'
        }
      `}
      dir={direction}
    >
      {/* Success celebration gradient */}
      {visualChecked && !isDimmed && (
        <div className="absolute inset-0 bg-gradient-to-br from-success/15 via-success/5 to-transparent pointer-events-none" />
      )}

      {/* Confetti Effect */}
      <ConfettiEffect isActive={showConfetti} origin={{ x: 15, y: 30 }} />

      <div className="relative p-4 sm:p-5">
        {/* Top Row: Checkbox + Name + Delete */}
        <div className="flex items-center gap-4 mb-4">
          {/* Premium Checkbox */}
          <button
            ref={checkboxRef}
            onClick={handleCheck}
            className={`
              relative flex-shrink-0 
              w-14 h-14 sm:w-16 sm:h-16 
              rounded-2xl 
              flex items-center justify-center
              transition-all duration-300 ease-out
              touch-manipulation
              overflow-hidden
              ${visualChecked
                ? 'bg-gradient-to-br from-success to-success/80 shadow-xl shadow-success/30 animate-checkbox-pulse'
                : isDimmed
                  ? 'bg-muted border-2 border-muted-foreground/20'
                  : 'bg-card border-2 border-border hover:border-success/50 hover:bg-success/5 hover:shadow-lg active:scale-95'
              }
            `}
            aria-label={visualChecked ? 'Uncheck item' : 'Check item'}
          >
            {/* Ripple effect */}
            {showRipple && (
              <span 
                className="absolute w-4 h-4 bg-success/30 rounded-full animate-ripple"
                style={{ left: ripplePos.x, top: ripplePos.y, transform: 'translate(-50%, -50%)' }}
              />
            )}
            
            {visualChecked && (
              <>
                <Check 
                  className="h-8 w-8 sm:h-9 sm:w-9 text-success-foreground animate-check-bounce" 
                  strokeWidth={3} 
                />
                {!isDimmed && (
                  <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-primary animate-pulse-soft" />
                )}
              </>
            )}
          </button>
          
          {/* Item Name */}
          <div className="flex-1 min-w-0">
            <span 
              className={`
                block text-lg sm:text-xl font-semibold leading-snug
                transition-all duration-400
                ${visualChecked && !isDimmed
                  ? "strike-animate text-muted-foreground" 
                  : visualChecked
                    ? "line-through text-muted-foreground/60 decoration-2"
                    : "text-foreground"
                }
              `}
              style={{ 
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {item.text}
            </span>
          </div>

          {/* Delete Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(item.id)}
            className={`
              h-12 w-12 sm:h-14 sm:w-14 
              rounded-2xl flex-shrink-0
              text-muted-foreground/60
              hover:bg-destructive/10 hover:text-destructive
              active:scale-90
              transition-all duration-200
              touch-manipulation
              ${isDimmed ? 'opacity-40' : ''}
            `}
          >
            <Trash2 className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
        </div>

        {/* Bottom Row: Quantity Stepper + Unit */}
        <div className={`flex items-center gap-3 ${language === 'he' ? 'flex-row-reverse' : ''}`}>
          {/* Quantity Stepper */}
          <QuantityStepper
            value={item.quantity || 1}
            onChange={(val) => onQuantityChange(item.id, val)}
            unit={item.unit}
            isCompleted={isDimmed}
          />
          
          {/* Unit Select */}
          <Select
            value={item.unit || 'units'}
            onValueChange={(val: Unit) => onUnitChange(item.id, val)}
          >
            <SelectTrigger 
              className={`
                h-12 sm:h-14 px-4 sm:px-5
                text-base sm:text-lg font-semibold
                rounded-2xl transition-all duration-200
                [&>svg]:hidden
                touch-manipulation
                shadow-sm
                ${isDimmed 
                  ? 'bg-muted/50 text-muted-foreground/50 opacity-50' 
                  : 'glass hover:shadow-md focus:ring-2 focus:ring-primary/30'
                }
              `} 
              style={{ minWidth: '90px' }}
            >
              <span className="truncate">
                {(() => {
                  const u = UNITS.find(u => u.value === (item.unit || 'units'));
                  return u ? (language === 'he' ? u.labelHe : u.labelEn) : '';
                })()}
              </span>
            </SelectTrigger>
            <SelectContent className="glass-strong rounded-2xl shadow-2xl border-0">
              {UNITS.map(u => (
                <SelectItem 
                  key={u.value} 
                  value={u.value}
                  className="text-base sm:text-lg py-3.5 cursor-pointer rounded-xl mx-1 my-0.5"
                >
                  {language === 'he' ? u.labelHe : u.labelEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Spacer */}
          <div className="flex-1" />
        </div>
      </div>
    </div>
  );
};
