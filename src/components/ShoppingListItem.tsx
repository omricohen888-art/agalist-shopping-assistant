import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Check, Plus, Minus, Sparkles } from "lucide-react";
import { ShoppingItem, Unit, UNITS } from "@/types/shopping";
import { useGlobalLanguage } from "@/context/LanguageContext";
import { useSoundSettings } from "@/hooks/use-sound-settings.tsx";
import { useHaptics } from "@/hooks/use-haptics";
import { ConfettiEffect } from "./ConfettiEffect";

// Unit type categories for smart behavior
// SCENARIO A: Discrete Units (whole numbers, stepper-only)
const DISCRETE_UNITS: Unit[] = ['units', 'package', 'packs', 'cans', 'bottles', 'boxes'];

// SCENARIO B: Weight/Measurements (decimal, input + stepper)
const WEIGHT_UNITS: Unit[] = ['kg', 'g', 'liters', 'ml', 'oz', 'lbs'];

interface QuantityStepperProps {
  value: number;
  onChange: (val: number) => void;
  unit: Unit;
  isCompleted?: boolean;
}

// Check if a unit is discrete (whole numbers) or continuous (decimal)
const isDiscreteUnit = (unit: Unit): boolean => DISCRETE_UNITS.includes(unit);

const QuantityStepper = ({ value, onChange, unit, isCompleted }: QuantityStepperProps) => {
  const [inputValue, setInputValue] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Different behavior based on unit type
  const isDiscrete = isDiscreteUnit(unit);
  
  // Smarter step values based on unit type
  let step = 0.1;
  let minValue = 0.1;
  
  if (isDiscrete) {
    step = 1;
    minValue = 1;
  } else if (unit === 'g') {
    // Grams: step by 50g (0.05kg)
    step = 0.05;
    minValue = 0.05;
  } else if (unit === 'kg') {
    // Kilograms: step by 0.25kg
    step = 0.25;
    minValue = 0.1;
  } else if (unit === 'ml') {
    // Milliliters: step by 100ml
    step = 0.1;
    minValue = 0.1;
  } else if (unit === 'liters') {
    // Liters: step by 0.25L
    step = 0.25;
    minValue = 0.1;
  }
  
  const { lightTap } = useHaptics();
  
  const handleIncrement = useCallback(() => {
    lightTap();
    let newValue: number;
    
    if (isDiscrete) {
      // For units: whole numbers only (fast, clicker-game style)
      newValue = value + 1;
    } else {
      // For weights: precise decimal increments with smart rounding
      newValue = Math.round((value + step) * 100) / 100;
    }
    
    onChange(newValue);
  }, [value, step, isDiscrete, onChange, lightTap]);

  const handleDecrement = useCallback(() => {
    lightTap();
    let newValue: number;
    
    if (isDiscrete) {
      // For units: whole numbers only, min 1 (can't go below)
      newValue = Math.max(minValue, value - 1);
    } else {
      // For weights: precise decimal decrements with min check
      newValue = Math.max(minValue, Math.round((value - step) * 100) / 100);
    }
    
    onChange(newValue);
  }, [value, step, minValue, isDiscrete, onChange, lightTap]);

  // Handle manual input for weight units
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
  };

  const handleInputBlur = () => {
    let numValue = parseFloat(inputValue);
    
    // Validate the parsed value
    if (isNaN(numValue) || numValue < minValue) {
      numValue = minValue;
    }
    
    // For discrete units: round to integer
    if (isDiscrete) {
      numValue = Math.round(numValue);
    } else {
      // For weights: round to 2 decimal places for consistency
      numValue = Math.round(numValue * 100) / 100;
    }
    
    onChange(numValue);
    setInputValue(String(numValue));
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    }
  };

  // Display value depends on unit type
  // Discrete units: always integer
  // Weight units: show decimal based on unit
  let displayValue: string;
  if (isDiscrete) {
    displayValue = Math.round(value).toString();
  } else {
    // For weights, show 1-2 decimals based on the value
    if (value >= 1) {
      displayValue = value.toFixed(1);
    } else {
      displayValue = value.toFixed(2);
    }
  }

  // SCENARIO A: Discrete Units (units, packages, cans) - Read-only stepper (clicker-style)
  if (isDiscrete) {
    return (
      <div 
        className={`
          inline-flex items-center gap-0
          rounded-2xl 
          overflow-hidden
          transition-all duration-300 ease-out
          shadow-sm
          bg-gradient-to-br from-primary/10 to-primary/5
          border border-primary/20
          ${isCompleted 
            ? 'bg-muted/50 opacity-50 border-muted/30' 
            : 'hover:shadow-md hover:shadow-primary/15'
          }
        `}
      >
        {/* Minus Button - Large for easy tapping */}
        <button
          type="button"
          onClick={handleDecrement}
          disabled={isCompleted || value <= minValue}
          className={`
            flex items-center justify-center
            w-12 h-12 sm:w-14 sm:h-14
            transition-all duration-150
            touch-manipulation
            active:scale-75 active:bg-primary/20
            ${isCompleted || value <= minValue
              ? 'text-muted-foreground/40 cursor-not-allowed'
              : 'text-primary/70 hover:bg-primary/15 hover:text-primary active:text-primary'
            }
          `}
          aria-label="Decrease quantity"
          title="Tap to decrease"
        >
          <Minus className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={3} />
        </button>

        {/* Value Display - READ ONLY FOR DISCRETE UNITS (prominent for clicker feel) */}
        <div 
          className={`
            min-w-[4rem] sm:min-w-[4.5rem] 
            text-center 
            font-black
            text-2xl sm:text-3xl
            tabular-nums
            select-none
            py-2
            cursor-not-allowed
            transition-all duration-200
            ${isCompleted 
              ? 'text-muted-foreground/50' 
              : 'text-primary/80'
            }
          `}
        >
          {displayValue}
        </div>

        {/* Plus Button - Large for easy tapping */}
        <button
          type="button"
          onClick={handleIncrement}
          disabled={isCompleted}
          className={`
            flex items-center justify-center
            w-12 h-12 sm:w-14 sm:h-14
            transition-all duration-150
            touch-manipulation
            active:scale-75 active:bg-primary/20
            ${isCompleted
              ? 'text-muted-foreground/40 cursor-not-allowed'
              : 'text-primary/70 hover:bg-primary/15 hover:text-primary active:text-primary'
            }
          `}
          aria-label="Increase quantity"
          title="Tap to increase"
        >
          <Plus className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={3} />
        </button>
      </div>
    );
  }

  // SCENARIO B: Weight/Measurements (kg, g, liters, ml) - Input + fine-tuning buttons
  return (
    <div 
      className={`
        inline-flex items-center gap-1.5 sm:gap-2
        rounded-2xl 
        overflow-hidden
        transition-all duration-300 ease-out
        shadow-sm
        border border-border/60
        ${isCompleted 
          ? 'bg-muted/40 opacity-50 border-muted/30' 
          : 'bg-gradient-to-br from-accent/10 to-accent/5 hover:shadow-md hover:shadow-accent/15'
        }
      `}
    >
      {/* Minus Button - Small for fine-tuning weights */}
      <button
        type="button"
        onClick={handleDecrement}
        disabled={isCompleted || value <= minValue}
        className={`
          flex items-center justify-center
          h-10 w-10 sm:h-11 sm:w-11
          transition-all duration-150
          touch-manipulation
          active:scale-75 active:bg-accent/20
          rounded-lg
          ${isCompleted || value <= minValue
            ? 'text-muted-foreground/40 cursor-not-allowed'
            : 'text-accent/70 hover:bg-accent/15 hover:text-accent active:text-accent'
          }
        `}
        aria-label="Decrease quantity"
        title="Fine-tune down"
      >
        <Minus className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
      </button>

      {/* Input Field - EDITABLE FOR WEIGHT UNITS (precise decimal input) */}
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onKeyDown={handleInputKeyDown}
        disabled={isCompleted}
        placeholder={String(minValue)}
        className={`
          w-16 sm:w-18
          px-2 sm:px-3
          py-1 sm:py-1.5
          text-center
          font-bold
          text-base sm:text-lg
          bg-white dark:bg-slate-800
          border border-border/50
          focus:outline-none
          focus:ring-2 focus:ring-accent/40 focus:ring-inset
          rounded-lg
          tabular-nums
          selection:bg-accent/30
          transition-all duration-200
          ${isCompleted 
            ? 'text-muted-foreground/50 cursor-not-allowed dark:text-slate-500' 
            : 'text-gray-900 dark:text-slate-100'
          }
        `}
      />

      {/* Plus Button - Small for fine-tuning weights */}
      <button
        type="button"
        onClick={handleIncrement}
        disabled={isCompleted}
        className={`
          flex items-center justify-center
          h-10 w-10 sm:h-11 sm:w-11
          transition-all duration-150
          touch-manipulation
          active:scale-75 active:bg-accent/20
          rounded-lg
          ${isCompleted
            ? 'text-muted-foreground/40 cursor-not-allowed'
            : 'text-accent/70 hover:bg-accent/15 hover:text-accent active:text-accent'
          }
        `}
        aria-label="Increase quantity"
        title="Fine-tune up"
      >
        <Plus className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
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

export { QuantityStepper };

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
                border border-border/50
                ${isDimmed 
                  ? 'bg-muted/50 text-muted-foreground/50 opacity-50 dark:bg-slate-700 dark:text-slate-500' 
                  : 'bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 hover:shadow-md focus:ring-2 focus:ring-primary/30'
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
