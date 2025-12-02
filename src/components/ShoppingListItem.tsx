import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { ShoppingItem, Unit, UNITS } from "@/types/shopping";
import { useLanguage } from "@/hooks/use-language";
import { useSoundSettings } from "@/hooks/use-sound-settings.tsx";

interface QuantityInputProps {
  value: number;
  onChange: (val: number) => void;
  unit: Unit;
}

const QuantityInput = ({ value, onChange, unit }: QuantityInputProps) => {
  const [localValue, setLocalValue] = useState(value.toString());
  const [isFocused, setIsFocused] = useState(false);

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
    setIsFocused(false);
  };

  return (
    <input
      type="number"
      step={unit === 'units' ? "1" : "any"}
      min="0"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      onFocus={() => setIsFocused(true)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.currentTarget.blur();
        }
      }}
      className="w-12 sm:w-14 h-9 sm:h-10 text-center text-xs sm:text-sm font-semibold rounded-lg shrink-0 px-2 border-2 border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 focus:border-yellow-400 dark:focus:border-yellow-400 focus:shadow-[0_0_0_3px_rgba(250,204,21,0.1)] dark:focus:shadow-[0_0_0_3px_rgba(250,204,21,0.15)] transition-all duration-200 bg-white dark:bg-slate-800 !text-gray-900 dark:!text-slate-50 placeholder:text-gray-400 dark:placeholder:text-slate-500"
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
  const { language } = useLanguage();
  const { playSound } = useSoundSettings();
  const direction = language === 'he' ? 'rtl' : 'ltr';

  const handleCheck = () => {
    // Play success sound immediately
    playSound(800, 0.1);

    // Start animation
    setIsAnimating(true);

    // Wait 600ms before actually toggling
    setTimeout(() => {
      onToggle(item.id);
      setIsAnimating(false);
    }, 600);
  };

  // Determine visual state
  const visualChecked = isAnimating || item.checked;
  const isDimmed = isCompleted && !isAnimating;

  return (
    <div className={`
      group relative
      bg-white dark:bg-slate-800
      rounded-xl
      border-2 border-gray-200 dark:border-slate-700
      shadow-sm hover:shadow-md
      dark:shadow-sm dark:hover:shadow-lg
      hover:border-gray-300 dark:hover:border-slate-600
      active:shadow-sm
      py-3 sm:py-4 px-3 sm:px-4
      flex flex-row items-center justify-between flex-nowrap
      w-full gap-2 sm:gap-3
      transition-all duration-200 ease-out
      touch-manipulation
      animate-in slide-in-from-top-4 fade-in duration-300
      min-h-[4rem] sm:min-h-[4.25rem]
      hover:-translate-y-0.5
      ${isDimmed 
        ? 'bg-gray-50 dark:bg-slate-700/40 shadow-sm border-gray-100 dark:border-slate-700/50 opacity-65' 
        : ''
      }
      ${visualChecked 
        ? 'bg-emerald-50 dark:bg-emerald-950/25 border-emerald-200 dark:border-emerald-900/40' 
        : ''
      }
    `}>
      {/* Checkbox - Left side */}
      <Checkbox
        checked={visualChecked}
        onCheckedChange={handleCheck}
        className={`
          flex-shrink-0
          h-6 w-6 sm:h-7 sm:w-7
          border-2
          rounded-md
          transition-all duration-200
          active:scale-110
          cursor-pointer
          ${visualChecked
            ? 'border-emerald-500 dark:border-emerald-400 bg-emerald-500 dark:bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
            : isDimmed
              ? 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800'
              : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-gray-400 dark:hover:border-slate-500'
          }
        `}
      />

      {/* Item Text - Middle, flex-grow */}
      <span className={`
        flex-grow
        text-sm sm:text-base md:text-lg
        leading-tight sm:leading-relaxed
        transition-all duration-200
        text-right break-words
        min-w-0
        font-semibold tracking-tight
        ${visualChecked 
          ? "line-through text-gray-400 dark:text-slate-500 decoration-2 decoration-gray-300 dark:decoration-slate-600" 
          : isDimmed
            ? "text-gray-500 dark:text-slate-500"
            : "text-gray-900 dark:text-slate-100"
        }
      `}>
        {item.text}
      </span>

      {/* Quantity, Unit, Delete - Right side */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0 border-l-2 border-gray-200 dark:border-slate-700/50 pl-2 sm:pl-3" onClick={(e) => e.stopPropagation()}>
        {/* Quantity Input */}
        <QuantityInput
          value={item.quantity || 1}
          onChange={(val) => onQuantityChange(item.id, val)}
          unit={item.unit}
        />

        {/* Unit Select */}
        <Select
          value={item.unit || 'units'}
          onValueChange={(val: Unit) => onUnitChange(item.id, val)}
        >
          <SelectTrigger className="
            w-16 sm:w-20
            h-9 sm:h-10
            px-2 sm:px-2.5
            text-[10px] sm:text-xs
            font-semibold
            rounded-lg
            border-2 border-gray-200 dark:border-slate-600
            hover:border-gray-300 dark:hover:border-slate-500
            focus:border-yellow-400 dark:focus:border-yellow-400
            focus:shadow-[0_0_0_3px_rgba(250,204,21,0.1)]
            dark:focus:shadow-[0_0_0_3px_rgba(250,204,21,0.15)]
            transition-all duration-200
            text-center justify-center
            [&>span]:w-full [&>span]:text-center
            [&>svg]:hidden
            bg-white dark:bg-slate-800
            !text-gray-900 dark:!text-slate-50
            shadow-sm
          ">
            <span className="truncate w-full text-center">
              {(() => {
                const u = UNITS.find(u => u.value === (item.unit || 'units'));
                return u ? (language === 'he' ? u.labelHe : u.labelEn) : '';
              })()}
            </span>
          </SelectTrigger>
          <SelectContent className="border-2 border-gray-200 dark:border-slate-700 shadow-md dark:shadow-lg rounded-lg bg-white dark:bg-slate-900">
            {UNITS.map(u => (
              <SelectItem 
                key={u.value} 
                value={u.value}
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                <span className="font-medium">
                  {language === 'he' ? u.labelHe : u.labelEn}
                </span>
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
            h-9 w-9 sm:h-10 sm:w-10
            flex-shrink-0
            hover:bg-red-100 dark:hover:bg-red-950/40
            text-red-500 dark:text-red-400
            hover:text-red-600 dark:hover:text-red-500
            touch-manipulation
            rounded-lg
            transition-all duration-200
            opacity-100 sm:opacity-0 sm:group-hover:opacity-100
            hover:scale-110
            active:scale-95
            shadow-sm hover:shadow-md
          `}
        >
          <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>
    </div>
  );
};
