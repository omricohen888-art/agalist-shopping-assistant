import React from "react";
import { Plus, Minus, Trash2 } from "lucide-react";
import { Unit } from "@/types/shopping";
import { useHaptics } from "@/hooks/use-haptics";

interface QuantityControlProps {
    value: number;
    onChange: (val: number) => void;
    unit: Unit;
    min?: number;
    max?: number;
    step?: number; // Optional override
    isCompleted?: boolean;
    onDelete?: () => void;
    compact?: boolean;
}

// Unit type categories
const DISCRETE_UNITS: Unit[] = ['units', 'package'];

const QuantityControl = ({
    value,
    onChange,
    unit,
    isCompleted = false,
    onDelete,
    compact = false
}: QuantityControlProps) => {
    const { lightTap, mediumTap } = useHaptics();

    const isDiscrete = DISCRETE_UNITS.includes(unit);

    // Smarter step values based on unit type
    let step = 0.1;
    let minValue = 0.1;

    if (isDiscrete) {
        step = 1;
        minValue = 1;
    } else if (unit === 'g') {
        step = 50;
        minValue = 50;
    } else if (unit === 'kg') {
        step = 0.25;
        minValue = 0.1;
    }

    const handleIncrement = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent row click
        lightTap();
        let newValue: number;

        if (isDiscrete) {
            newValue = value + 1;
        } else {
            newValue = Math.round((value + step) * 100) / 100;
            if (unit === 'g') newValue = value + step;
        }

        onChange(newValue);
    };

    const handleDecrement = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent row click

        // Check if we should delete
        if (value <= minValue) {
            if (onDelete) {
                mediumTap();
                if (confirm('Remove item?')) {
                    onDelete();
                }
            }
            return;
        }

        lightTap();
        let newValue: number;

        if (isDiscrete) {
            newValue = Math.max(0, value - 1);
        } else {
            newValue = Math.max(0, Math.round((value - step) * 100) / 100);
            if (unit === 'g') newValue = Math.max(0, value - step);
        }

        onChange(newValue);
    };

    // Display formatting
    let displayValue: string;
    if (isDiscrete || unit === 'g') {
        displayValue = Math.round(value).toString();
    } else {
        displayValue = value >= 10 ? Math.round(value).toString() : parseFloat(value.toFixed(2)).toString();
    }

    const showTrash = value <= minValue && onDelete;

    // DESIGN IMPLEMENTATION:
    // 1. Decrease Button (Left): Circle 40px, Gray-100.
    // 2. Quantity (Center): Text-lg Bold, ~30px width.
    // 3. Increase Button (Right): Circle 40px, Green-500.
    // Layout: Flex with gap-4.

    return (
        <div className={`flex items-center gap-4 ${isCompleted ? 'opacity-50 grayscale' : ''}`} onClick={(e) => e.stopPropagation()}>

            {/* DECREASE / DELETE BUTTON */}
            <button
                type="button"
                onClick={handleDecrement}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm shrink-0
                  ${showTrash
                        ? 'bg-red-500 text-white hover:bg-red-600 shadow-md'
                        : 'bg-gray-200 text-black hover:bg-gray-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600'
                    }
                `}
            >
                {showTrash ? (
                    <Trash2 className="w-5 h-5" />
                ) : (
                    <Minus className="w-5 h-5" strokeWidth={2.5} />
                )}
            </button>

            {/* QUANTITY DISPLAY */}
            <div className="flex flex-col items-center justify-center min-w-[32px]">
                <span className="text-lg font-bold tabular-nums leading-none text-foreground">
                    {displayValue}
                </span>
                {/* Optional Unit display if needed, keeping it minimal as requested */}
                {!isDiscrete && (
                    <span className="text-[10px] text-muted-foreground font-medium lowercase">
                        {unit}
                    </span>
                )}
            </div>

            {/* INCREASE BUTTON */}
            <button
                type="button"
                onClick={handleIncrement}
                className="
          w-10 h-10 rounded-full flex items-center justify-center 
          bg-green-500 text-white hover:bg-green-600 
          shadow-sm transition-all active:scale-95
        "
            >
                <Plus className="w-5 h-5" strokeWidth={2.5} />
            </button>
        </div>
    );
};

export default QuantityControl;
