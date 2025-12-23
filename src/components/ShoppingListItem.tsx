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

  // SCENARIO A: Discrete Units - Ultra minimal
  if (isDiscrete) {
    return (
      <div 
        className={`
          inline-flex items-center
          rounded
          border border-border/30
          ${isCompleted ? 'opacity-40' : ''}
        `}
      >
        <button
          type="button"
          onClick={handleDecrement}
          disabled={isCompleted || value <= minValue}
          className={`
            w-5 h-5 flex items-center justify-center
            touch-manipulation active:bg-primary/20
            ${isCompleted || value <= minValue ? 'text-muted-foreground/20' : 'text-foreground/50'}
          `}
        >
          <Minus className="h-2.5 w-2.5" strokeWidth={2} />
        </button>
        <span className={`min-w-[1rem] text-center text-[11px] font-semibold tabular-nums ${isCompleted ? 'text-muted-foreground/40' : 'text-foreground/70'}`}>
          {displayValue}
        </span>
        <button
          type="button"
          onClick={handleIncrement}
          disabled={isCompleted}
          className={`
            w-5 h-5 flex items-center justify-center
            touch-manipulation active:bg-primary/20
            ${isCompleted ? 'text-muted-foreground/20' : 'text-foreground/50'}
          `}
        >
          <Plus className="h-2.5 w-2.5" strokeWidth={2} />
        </button>
      </div>
    );
  }

  // SCENARIO B: Weight/Measurements - Ultra minimal
  return (
    <div 
      className={`
        inline-flex items-center
        rounded
        border border-border/30
        ${isCompleted ? 'opacity-40' : ''}
      `}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={isCompleted || value <= minValue}
        className={`
          w-5 h-5 flex items-center justify-center
          touch-manipulation active:bg-accent/20
          ${isCompleted || value <= minValue ? 'text-muted-foreground/20' : 'text-foreground/50'}
        `}
      >
        <Minus className="h-2.5 w-2.5" strokeWidth={2} />
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
        className={`
          w-6 text-center text-[11px] font-semibold bg-transparent border-0 p-0
          focus:outline-none tabular-nums
          ${isCompleted ? 'text-muted-foreground/40' : 'text-foreground/70'}
        `}
      />
      <button
        type="button"
        onClick={handleIncrement}
        disabled={isCompleted}
        className={`
          w-5 h-5 flex items-center justify-center
          touch-manipulation active:bg-accent/20
          ${isCompleted ? 'text-muted-foreground/20' : 'text-foreground/50'}
        `}
      >
        <Plus className="h-2.5 w-2.5" strokeWidth={2} />
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
        relative rounded
        ${isDimmed 
          ? 'opacity-40' 
          : visualChecked 
            ? 'bg-success/5' 
            : ''
        }
      `}
      dir={direction}
    >
      <ConfettiEffect isActive={showConfetti} origin={{ x: 10, y: 12 }} />

      <div className="flex items-center gap-1.5 py-1 px-1">
        {/* Minimal Checkbox */}
        <button
          ref={checkboxRef}
          onClick={handleCheck}
          className={`
            flex-shrink-0 w-5 h-5 rounded
            flex items-center justify-center
            touch-manipulation
            ${visualChecked
              ? 'bg-success'
              : 'border border-border/50 active:scale-95'
            }
          `}
        >
          {showRipple && (
            <span 
              className="absolute w-2 h-2 bg-success/30 rounded-full animate-ripple"
              style={{ left: ripplePos.x, top: ripplePos.y, transform: 'translate(-50%, -50%)' }}
            />
          )}
          {visualChecked && <Check className="h-3 w-3 text-success-foreground" strokeWidth={3} />}
        </button>
        
        {/* Item Name */}
        <span 
          className={`
            flex-1 text-[11px] font-medium truncate
            ${visualChecked ? "line-through text-muted-foreground/60" : "text-foreground"}
          `}
        >
          {item.text}
        </span>

        {/* Quantity */}
        <QuantityStepper
          value={item.quantity || 1}
          onChange={(val) => onQuantityChange(item.id, val)}
          unit={item.unit}
          isCompleted={isDimmed}
        />
        
        {/* Unit - Ultra minimal */}
        <Select
          value={item.unit || 'units'}
          onValueChange={(val: Unit) => onUnitChange(item.id, val)}
        >
          <SelectTrigger 
            className={`
              h-5 px-1 min-w-[32px]
              text-[10px] font-medium
              rounded border-border/30
              [&>svg]:h-2 [&>svg]:w-2 [&>svg]:opacity-50
              ${isDimmed ? 'opacity-40' : ''}
            `}
          >
            <span className="truncate">
              {(() => {
                const u = UNITS.find(u => u.value === (item.unit || 'units'));
                return u ? (language === 'he' ? u.labelHe : u.labelEn) : '';
              })()}
            </span>
          </SelectTrigger>
          <SelectContent className="rounded-lg">
            {UNITS.map(u => (
              <SelectItem key={u.value} value={u.value} className="text-xs py-1">
                {language === 'he' ? u.labelHe : u.labelEn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Delete - Ultra minimal */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(item.id)}
          className={`h-5 w-5 rounded text-muted-foreground/30 hover:text-destructive ${isDimmed ? 'opacity-30' : ''}`}
        >
          <Trash2 className="h-2.5 w-2.5" />
        </Button>
      </div>
    </div>
  );
};
