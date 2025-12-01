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
      className="w-[2.5rem] sm:w-[3.5rem] h-8 sm:h-9 text-center text-[10px] sm:text-xs rounded-lg shrink-0 px-0 border-2 border-black/20 hover:border-black focus:border-black transition-colors bg-white dark:bg-slate-900 !text-black dark:!text-slate-100"
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

  // Determine visual state (show as checked if animating, even if not actually checked yet)
  const visualChecked = isAnimating || item.checked;
  const isDimmed = isCompleted && !isAnimating;

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] border-2 border-black dark:border-slate-700 py-2 px-2 sm:px-3 flex flex-row items-center justify-between flex-nowrap w-full gap-2 sm:gap-3 group hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all touch-manipulation animate-in slide-in-from-top-4 fade-in duration-300 min-h-[3.5rem] sm:min-h-[3rem] ${isDimmed ? 'bg-gray-50 dark:bg-slate-700/50 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] border-gray-200 dark:border-slate-600 opacity-60' : ''
      } ${visualChecked ? 'bg-green-50 dark:bg-green-900/20' : ''
      }`}>
      <Checkbox
        checked={visualChecked}
        onCheckedChange={handleCheck}
        className={`h-5 w-5 sm:h-6 sm:w-6 border-2 flex-shrink-0 transition-all duration-200 active:scale-110 rounded-md ${visualChecked
          ? 'border-green-500 bg-green-500 text-white'
          : isDimmed
            ? 'border-gray-400 dark:border-slate-500'
            : 'border-black dark:border-slate-600 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 data-[state=checked]:text-white'
          }`}
      />
      <span className={`flex-grow text-sm sm:text-base md:text-lg leading-tight sm:leading-relaxed transition-all text-right break-words min-w-0 font-bold ${visualChecked ? "line-through text-gray-500 dark:text-slate-400 decoration-2" : "text-black dark:text-slate-100"
        }`}>
        {item.text}
      </span>

      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 border-l-2 border-black/10 dark:border-slate-700/50 pl-1 sm:pl-2" onClick={(e) => e.stopPropagation()}>
        <QuantityInput
          value={item.quantity || 1}
          onChange={(val) => onQuantityChange(item.id, val)}
          unit={item.unit}
        />
        <Select
          value={item.unit || 'units'}
          onValueChange={(val: Unit) => onUnitChange(item.id, val)}
        >
          <SelectTrigger className="w-14 sm:w-16 h-8 sm:h-9 px-0 sm:px-1 text-[10px] sm:text-xs rounded-lg border-2 border-black/20 hover:border-black focus:border-black transition-colors text-center justify-center [&>span]:w-full [&>span]:text-center [&>svg]:hidden">
            <span className="truncate w-full text-center">
              {(() => {
                const u = UNITS.find(u => u.value === (item.unit || 'units'));
                return u ? (language === 'he' ? u.labelHe : u.labelEn) : '';
              })()}
            </span>
          </SelectTrigger>
          <SelectContent className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {UNITS.map(u => (
              <SelectItem key={u.value} value={u.value}>
                {language === 'he' ? u.labelHe : u.labelEn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(item.id)}
          className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 hover:bg-red-100 text-red-500 hover:text-red-600 touch-manipulation rounded-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>
    </div>
  );
};
