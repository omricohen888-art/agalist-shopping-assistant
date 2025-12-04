import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Check } from "lucide-react";
import { ShoppingItem, Unit, UNITS } from "@/types/shopping";
import { useGlobalLanguage } from "@/context/LanguageContext";
import { useSoundSettings } from "@/hooks/use-sound-settings.tsx";

interface QuantityInputProps {
  value: number;
  onChange: (val: number) => void;
  unit: Unit;
  isCompleted?: boolean;
}

const QuantityInput = ({ value, onChange, unit, isCompleted }: QuantityInputProps) => {
  const [localValue, setLocalValue] = useState(value.toString());

  const handleBlur = () => {
    let parsed = parseFloat(localValue);
    if (!isNaN(parsed) && parsed >= 0) {
      if (unit === 'units') {
        parsed = Math.round(parsed);
        if (parsed === 0) parsed = 1;
      }
      onChange(parsed);
      setLocalValue(parsed.toString());
    } else {
      setLocalValue(value.toString());
    }
  };

  return (
    <input
      type="number"
      step={unit === 'units' ? "1" : "any"}
      min="0"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.currentTarget.blur();
        }
      }}
      className={`h-10 sm:h-11 text-center text-sm sm:text-base font-semibold rounded-xl px-1 border-2 transition-all duration-200 touch-manipulation
        ${isCompleted 
          ? 'border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-slate-500' 
          : 'border-gray-200 dark:border-slate-600 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white dark:bg-slate-800 text-foreground'
        }`}
      style={{ width: '56px', flexShrink: 0 }}
    />
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
    // Play success sound immediately
    playSound(800, 0.1);

    // Start animation
    setIsAnimating(true);

    // Wait 500ms before actually toggling
    setTimeout(() => {
      onToggle(item.id);
      setIsAnimating(false);
    }, 500);
  };

  // Determine visual state (show as checked if animating, even if not actually checked yet)
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
        ${!isDimmed && !visualChecked ? 'active:scale-[0.98]' : ''}
      `}
      dir={direction}
    >
      {/* Success celebration gradient overlay */}
      {visualChecked && !isDimmed && (
        <div className="absolute inset-0 bg-gradient-to-r from-success/10 via-transparent to-success/5 pointer-events-none" />
      )}

      <div className="relative flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
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
        
        {/* Item Name - Flexible width */}
        <div className="flex-1 min-w-0 py-1">
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

        {/* Controls Section */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Quantity Input */}
          <QuantityInput
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
                h-10 sm:h-11 px-2 text-sm sm:text-base font-medium
                rounded-xl border-2 transition-all duration-200
                text-center justify-center 
                [&>svg]:hidden
                touch-manipulation
                ${isDimmed 
                  ? 'border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-slate-500' 
                  : 'border-gray-200 dark:border-slate-600 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white dark:bg-slate-800'
                }
              `} 
              style={{ width: '64px', flexShrink: 0 }}
            >
              <span className="truncate w-full text-center">
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
                  className="text-sm sm:text-base py-2.5 cursor-pointer"
                >
                  {language === 'he' ? u.labelHe : u.labelEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Delete Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(item.id)}
            className={`
              h-10 w-10 sm:h-11 sm:w-11 
              rounded-xl
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
      </div>
    </div>
  );
};
