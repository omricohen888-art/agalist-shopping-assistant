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
const DISCRETE_UNITS: Unit[] = ['units', 'package'];

// SCENARIO B: Weight/Measurements (decimal, input + stepper)
const WEIGHT_UNITS: Unit[] = ['kg', 'g'];

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

  // SCENARIO A: Discrete Units (units, packages, cans) - Ultra compact stepper
  if (isDiscrete) {
    return (
      <div 
        className={`
          inline-flex items-center gap-0
          rounded-lg 
          overflow-hidden
          transition-all duration-150
          border border-border/40
          ${isCompleted 
            ? 'bg-muted/30 opacity-50' 
            : 'bg-muted/20'
          }
        `}
      >
        <button
          type="button"
          onClick={handleDecrement}
          disabled={isCompleted || value <= minValue}
          className={`
            flex items-center justify-center
            w-6 h-6
            transition-colors duration-100
            touch-manipulation
            active:bg-primary/20
            ${isCompleted || value <= minValue
              ? 'text-muted-foreground/30 cursor-not-allowed'
              : 'text-foreground/60 hover:bg-primary/10'
            }
          `}
          aria-label="Decrease quantity"
        >
          <Minus className="h-3 w-3" strokeWidth={2} />
        </button>

        <div 
          className={`
            min-w-[1.25rem]
            text-center 
            font-semibold
            text-xs
            tabular-nums
            select-none
            ${isCompleted ? 'text-muted-foreground/50' : 'text-foreground/80'}
          `}
        >
          {displayValue}
        </div>

        <button
          type="button"
          onClick={handleIncrement}
          disabled={isCompleted}
          className={`
            flex items-center justify-center
            w-6 h-6
            transition-colors duration-100
            touch-manipulation
            active:bg-primary/20
            ${isCompleted
              ? 'text-muted-foreground/30 cursor-not-allowed'
              : 'text-foreground/60 hover:bg-primary/10'
            }
          `}
          aria-label="Increase quantity"
        >
          <Plus className="h-3 w-3" strokeWidth={2} />
        </button>
      </div>
    );
  }

  // SCENARIO B: Weight/Measurements (kg, g, liters, ml) - Ultra compact
  return (
    <div 
      className={`
        inline-flex items-center gap-0
        rounded-lg 
        overflow-hidden
        transition-all duration-150
        border border-border/40
        ${isCompleted 
          ? 'bg-muted/30 opacity-50' 
          : 'bg-muted/20'
        }
      `}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={isCompleted || value <= minValue}
        className={`
          flex items-center justify-center
          h-6 w-6
          transition-colors duration-100
          touch-manipulation
          active:bg-accent/20
          ${isCompleted || value <= minValue
            ? 'text-muted-foreground/30 cursor-not-allowed'
            : 'text-foreground/60 hover:bg-accent/10'
          }
        `}
        aria-label="Decrease quantity"
      >
        <Minus className="h-3 w-3" strokeWidth={2} />
      </button>

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
          w-8
          px-0.5
          py-0
          text-center
          font-semibold
          text-xs
          bg-transparent
          border-0
          focus:outline-none
          tabular-nums
          ${isCompleted 
            ? 'text-muted-foreground/50 cursor-not-allowed' 
            : 'text-foreground/80'
          }
        `}
      />

      <button
        type="button"
        onClick={handleIncrement}
        disabled={isCompleted}
        className={`
          flex items-center justify-center
          h-6 w-6
          transition-colors duration-100
          touch-manipulation
          active:bg-accent/20
          ${isCompleted
            ? 'text-muted-foreground/30 cursor-not-allowed'
            : 'text-foreground/60 hover:bg-accent/10'
          }
        `}
        aria-label="Increase quantity"
      >
        <Plus className="h-3 w-3" strokeWidth={2} />
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
        rounded-lg 
        transition-all duration-150
        touch-manipulation
        ${isDimmed 
          ? 'bg-muted/20 opacity-50' 
          : visualChecked 
            ? 'bg-success/5 border border-success/20' 
            : 'bg-card/50 border border-border/30'
        }
      `}
      dir={direction}
    >
      <ConfettiEffect isActive={showConfetti} origin={{ x: 15, y: 20 }} />

      <div className="relative px-2 py-1.5 flex items-center gap-1.5">
        {/* Ultra Compact Checkbox */}
        <button
          ref={checkboxRef}
          onClick={handleCheck}
          className={`
            relative flex-shrink-0 
            w-6 h-6 
            rounded-md 
            flex items-center justify-center
            transition-all duration-150
            touch-manipulation
            overflow-hidden
            ${visualChecked
              ? 'bg-success'
              : isDimmed
                ? 'bg-muted border border-muted-foreground/20'
                : 'bg-card border border-border/60 hover:border-success/50 active:scale-95'
            }
          `}
          aria-label={visualChecked ? 'Uncheck item' : 'Check item'}
        >
          {showRipple && (
            <span 
              className="absolute w-2 h-2 bg-success/30 rounded-full animate-ripple"
              style={{ left: ripplePos.x, top: ripplePos.y, transform: 'translate(-50%, -50%)' }}
            />
          )}
          
          {visualChecked && (
            <Check className="h-3 w-3 text-success-foreground" strokeWidth={3} />
          )}
        </button>
        
        {/* Item Name - More compact */}
        <div className="flex-1 min-w-0">
          <span 
            className={`
              block text-xs font-medium leading-tight truncate
              ${visualChecked ? "line-through text-muted-foreground" : "text-foreground"}
            `}
          >
            {item.text}
          </span>
        </div>

        {/* Quantity Stepper - Already ultra compact */}
        <QuantityStepper
          value={item.quantity || 1}
          onChange={(val) => onQuantityChange(item.id, val)}
          unit={item.unit}
          isCompleted={isDimmed}
        />
        
        {/* Unit Select - Ultra compact */}
        <Select
          value={item.unit || 'units'}
          onValueChange={(val: Unit) => onUnitChange(item.id, val)}
        >
          <SelectTrigger 
            className={`
              h-6 px-1.5
              text-[10px] font-medium
              rounded-md transition-all
              [&>svg]:h-2.5 [&>svg]:w-2.5
              touch-manipulation
              border border-border/40
              min-w-[40px]
              ${isDimmed 
                ? 'bg-muted/30 text-muted-foreground/50 opacity-50' 
                : 'bg-muted/20 text-foreground/70'
              }
            `}
          >
            <span className="truncate">
              {(() => {
                const u = UNITS.find(u => u.value === (item.unit || 'units'));
                return u ? (language === 'he' ? u.labelHe : u.labelEn) : '';
              })()}
            </span>
          </SelectTrigger>
          <SelectContent className="rounded-lg shadow-lg">
            {UNITS.map(u => (
              <SelectItem 
                key={u.value} 
                value={u.value}
                className="text-xs py-1.5 cursor-pointer rounded-md"
              >
                {language === 'he' ? u.labelHe : u.labelEn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Delete Button - Ultra compact */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(item.id)}
          className={`
            h-5 w-5 
            rounded-md flex-shrink-0
            text-muted-foreground/40
            hover:bg-destructive/10 hover:text-destructive
            active:scale-95
            ${isDimmed ? 'opacity-30' : ''}
          `}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};
