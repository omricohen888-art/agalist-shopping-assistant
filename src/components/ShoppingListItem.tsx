import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Check, Plus, Minus } from "lucide-react";
import { ShoppingItem, Unit, UNITS } from "@/types/shopping";
import { useGlobalLanguage } from "@/context/LanguageContext";
import { useSoundSettings } from "@/hooks/use-sound-settings.tsx";

interface QuantityStepperProps {
  value: number;
  onChange: (val: number) => void;
  unit: Unit;
  isCompleted?: boolean;
}

const QuantityStepper = ({ value, onChange, unit, isCompleted }: QuantityStepperProps) => {
  const step = unit === 'units' ? 1 : 0.5;
  const minValue = unit === 'units' ? 1 : 0.1;
  
  const handleIncrement = useCallback(() => {
    const newValue = Math.round((value + step) * 10) / 10;
    onChange(newValue);
  }, [value, step, onChange]);

  const handleDecrement = useCallback(() => {
    const newValue = Math.max(minValue, Math.round((value - step) * 10) / 10);
    onChange(newValue);
  }, [value, step, minValue, onChange]);

  const displayValue = unit === 'units' ? Math.round(value) : value;

  return (
    <div 
      className={`
        inline-flex items-center 
        rounded-2xl 
        border-2 
        overflow-hidden
        transition-all duration-200
        ${isCompleted 
          ? 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 opacity-60' 
          : 'border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-primary/50'
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
          w-11 h-11 sm:w-12 sm:h-12
          transition-all duration-150
          touch-manipulation
          active:scale-90
          ${isCompleted || value <= minValue
            ? 'text-gray-300 dark:text-slate-600 cursor-not-allowed'
            : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-primary active:bg-primary/10'
          }
        `}
        aria-label="Decrease quantity"
      >
        <Minus className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
      </button>

      {/* Value Display */}
      <div 
        className={`
          min-w-[3rem] sm:min-w-[3.5rem] 
          text-center 
          font-bold 
          text-lg sm:text-xl
          tabular-nums
          select-none
          ${isCompleted 
            ? 'text-gray-400 dark:text-slate-500' 
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
          w-11 h-11 sm:w-12 sm:h-12
          transition-all duration-150
          touch-manipulation
          active:scale-90
          ${isCompleted
            ? 'text-gray-300 dark:text-slate-600 cursor-not-allowed'
            : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-primary active:bg-primary/10'
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
  const { language } = useGlobalLanguage();
  const { playSound } = useSoundSettings();
  const direction = language === 'he' ? 'rtl' : 'ltr';

  const handleCheck = () => {
    playSound(800, 0.1);
    setIsAnimating(true);
    setTimeout(() => {
      onToggle(item.id);
      setIsAnimating(false);
    }, 500);
  };

  const visualChecked = isAnimating || item.checked;
  const isDimmed = isCompleted && !isAnimating;

  return (
    <div 
      className={`
        relative overflow-hidden
        bg-card rounded-2xl 
        border-2 transition-all duration-300 ease-out
        touch-manipulation
        ${isDimmed 
          ? 'border-gray-100 dark:border-slate-700/50 bg-gray-50/80 dark:bg-slate-800/50' 
          : visualChecked 
            ? 'border-success/30 bg-success/5 dark:bg-success/10' 
            : 'border-gray-100 dark:border-slate-700 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5'
        }
        ${!isDimmed && !visualChecked ? 'active:scale-[0.99]' : ''}
      `}
      dir={direction}
    >
      {/* Success gradient overlay */}
      {visualChecked && !isDimmed && (
        <div className="absolute inset-0 bg-gradient-to-r from-success/10 via-transparent to-success/5 pointer-events-none" />
      )}

      <div className="relative p-3 sm:p-4">
        {/* Top Row: Checkbox + Name + Delete */}
        <div className="flex items-center gap-3 sm:gap-4 mb-3">
          {/* Large Touch-Friendly Checkbox */}
          <button
            onClick={handleCheck}
            className={`
              relative flex-shrink-0 
              w-12 h-12 sm:w-14 sm:h-14 
              rounded-2xl 
              border-3 
              flex items-center justify-center
              transition-all duration-300 ease-out
              touch-manipulation
              active:scale-90
              ${visualChecked
                ? 'bg-success border-success shadow-lg shadow-success/30'
                : isDimmed
                  ? 'border-gray-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-700'
                  : 'border-gray-300 dark:border-slate-500 bg-white dark:bg-slate-800 hover:border-success hover:bg-success/10'
              }
            `}
            aria-label={visualChecked ? 'Uncheck item' : 'Check item'}
          >
            {visualChecked && (
              <Check 
                className="h-7 w-7 sm:h-8 sm:w-8 text-white animate-in zoom-in-50 duration-300" 
                strokeWidth={3.5} 
              />
            )}
            {isAnimating && (
              <div className="absolute inset-0 rounded-2xl bg-success/20 animate-ping" />
            )}
          </button>
          
          {/* Item Name */}
          <div className="flex-1 min-w-0">
            <span 
              className={`
                block text-base sm:text-lg font-semibold leading-tight
                transition-all duration-300
                ${visualChecked 
                  ? "line-through text-muted-foreground decoration-2 decoration-success/50" 
                  : "text-foreground"
                }
                ${isDimmed ? 'opacity-60' : ''}
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
              h-10 w-10 sm:h-11 sm:w-11 
              rounded-xl flex-shrink-0
              text-gray-400 dark:text-slate-500
              hover:bg-destructive/10 hover:text-destructive
              active:scale-90
              transition-all duration-200
              touch-manipulation
              ${isDimmed ? 'opacity-50' : ''}
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
                h-11 sm:h-12 px-3 sm:px-4
                text-sm sm:text-base font-semibold
                rounded-2xl border-2 transition-all duration-200
                [&>svg]:hidden
                touch-manipulation
                ${isDimmed 
                  ? 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 text-gray-400 dark:text-slate-500 opacity-60' 
                  : 'border-gray-200 dark:border-slate-600 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white dark:bg-slate-800'
                }
              `} 
              style={{ minWidth: '80px' }}
            >
              <span className="truncate">
                {(() => {
                  const u = UNITS.find(u => u.value === (item.unit || 'units'));
                  return u ? (language === 'he' ? u.labelHe : u.labelEn) : '';
                })()}
              </span>
            </SelectTrigger>
            <SelectContent className="border-2 border-gray-200 dark:border-slate-600 rounded-xl shadow-xl">
              {UNITS.map(u => (
                <SelectItem 
                  key={u.value} 
                  value={u.value}
                  className="text-sm sm:text-base py-3 cursor-pointer"
                >
                  {language === 'he' ? u.labelHe : u.labelEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Spacer to push controls to start */}
          <div className="flex-1" />
        </div>
      </div>
    </div>
  );
};
