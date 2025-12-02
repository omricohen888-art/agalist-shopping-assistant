import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ISRAELI_PRODUCTS } from "@/data/israeliProducts";
import { getFrequentItems } from "@/utils/storage";

interface SmartAutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  className?: string;
}

export interface SmartAutocompleteInputRef {
  focus: () => void;
}

const HEBREW_ALPHABET = "אבגדהוזחטיכלמנסעפצקרשת".split("");

export const SmartAutocompleteInput = forwardRef<SmartAutocompleteInputRef, SmartAutocompleteInputProps>(({
  value,
  onChange,
  onKeyDown,
  placeholder = "הקלד מוצר ואנטר להוספה מהירה...",
  className = "",
}, ref) => {
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [randomSuggestions, setRandomSuggestions] = useState<string[]>([]);
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Initialize suggestions
  useEffect(() => {
    const frequent = getFrequentItems(7);
    if (frequent.length > 0) {
      setRandomSuggestions(frequent);
    } else {
      const shuffled = [...ISRAELI_PRODUCTS].sort(() => 0.5 - Math.random());
      setRandomSuggestions(shuffled.slice(0, 7));
    }
  }, []);

  // Filter products based on current value or active letter
  const getFilteredProducts = () => {
    if (value.trim().length > 0) {
      return ISRAELI_PRODUCTS
        .filter(product =>
          product.toLowerCase().includes(value.toLowerCase()) &&
          product.toLowerCase() !== value.toLowerCase()
        )
        .slice(0, 5);
    }

    if (activeLetter) {
      return ISRAELI_PRODUCTS
        .filter(product => product.startsWith(activeLetter));
    }

    return randomSuggestions;
  };

  const filteredProducts = getFilteredProducts();

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setOpen(false);
    setActiveLetter(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
      setSelectedIndex(-1);
      e.preventDefault();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (open && selectedIndex >= 0 && filteredProducts[selectedIndex]) {
        handleSelect(filteredProducts[selectedIndex]);
      } else {
        onKeyDown?.(e);
        setOpen(false); // Close on enter if no selection
      }
    } else if (e.key === "ArrowDown" && open) {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredProducts.length - 1));
    } else if (e.key === "ArrowUp" && open) {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else {
      setSelectedIndex(-1);
      onKeyDown?.(e);
    }
  };

  // ... existing code ...
  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    setSelectedIndex(-1);
    setActiveLetter(null); // Clear letter filter on typing
    setOpen(true);
  };

  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  // Update dropdown position
  useEffect(() => {
    if (open && inputRef.current) {
      const updatePosition = () => {
        if (!inputRef.current) return;
        const rect = inputRef.current.getBoundingClientRect();
        setDropdownStyle({
          position: 'fixed',
          top: `${rect.bottom + 4}px`,
          left: `${rect.left}px`,
          width: `${rect.width}px`,
          zIndex: 9999, // High z-index
        });
      };

      updatePosition();
      // Update on scroll and resize to keep it attached
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);

      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [open]);

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            setTimeout(() => {
              setOpen(false);
              setSelectedIndex(-1);
            }, 200);
          }}
          placeholder={placeholder}
          autoFocus={false}
          className="
            flex h-11 w-full rounded-xl
            border-2 border-gray-200 dark:border-slate-600
            bg-white dark:bg-slate-800
            px-4 py-3 pr-10
            text-sm sm:text-base
            font-medium
            ring-offset-background
            file:border-0 file:bg-transparent file:text-sm file:font-medium
            placeholder:text-gray-400 dark:placeholder:text-slate-500
            text-gray-900 dark:text-slate-50
            hover:border-gray-300 dark:hover:border-slate-500
            focus-visible:outline-none
            focus-visible:border-yellow-400 dark:focus-visible:border-yellow-400
            focus-visible:ring-3 focus-visible:ring-yellow-100 dark:focus-visible:ring-yellow-950/40
            focus-visible:-translate-y-0.5
            disabled:cursor-not-allowed disabled:opacity-50
            shadow-sm
            transition-all duration-200
          "
        />
        {value.length === 0 && (
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-slate-500 pointer-events-none" />
        )}
      </div>

      {open && typeof document !== 'undefined' && createPortal(
        <div style={dropdownStyle}>
          <div className="
            rounded-xl
            border-2 border-gray-200 dark:border-slate-700
            bg-white dark:bg-slate-900
            text-gray-900 dark:text-slate-50
            shadow-lg dark:shadow-xl
            overflow-hidden
          ">

            {/* Alphabet Filter (Only show when input is empty) */}
            {value.length === 0 && (
              <div className="p-3 border-b-2 border-gray-100 dark:border-slate-800 bg-gradient-to-r from-yellow-50 to-yellow-100/50 dark:from-yellow-950/20 dark:to-yellow-950/10 overflow-x-auto whitespace-nowrap no-scrollbar">
                <div className="flex gap-2">
                  {HEBREW_ALPHABET.map(letter => (
                    <button
                      key={letter}
                      onMouseDown={(e) => {
                        e.preventDefault(); // Prevent blur
                        setActiveLetter(prev => prev === letter ? null : letter);
                      }}
                      className={cn(
                        "w-9 h-9 rounded-lg text-sm font-bold border-2 transition-all flex items-center justify-center flex-shrink-0 shadow-sm",
                        activeLetter === letter
                          ? "bg-yellow-400 text-gray-900 border-yellow-500 shadow-md hover:shadow-lg hover:scale-110"
                          : "bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-50 border-gray-300 dark:border-slate-700 hover:border-yellow-300 dark:hover:border-yellow-600/50 hover:bg-yellow-50 dark:hover:bg-slate-700/50 active:scale-95"
                      )}
                    >
                      {letter}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="max-h-[280px] overflow-y-auto p-2">
              {filteredProducts.length === 0 ? (
                <div className="px-4 py-8 text-sm text-gray-400 dark:text-slate-500 text-center font-medium">
                  {value ? "לא נמצאו מוצרים" : "בחר אות או הקלד לחיפוש"}
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredProducts.map((product, index) => (
                    <button
                      key={product}
                      onMouseDown={(e) => {
                        e.preventDefault(); // Prevent blur
                        handleSelect(product);
                      }}
                      className={cn(
                        "
                          flex w-full items-center px-4 py-3 text-sm sm:text-base
                          rounded-lg transition-all duration-150
                          font-medium text-right
                          hover:scale-105 hover:shadow-sm
                          active:scale-100
                        ",
                        index === selectedIndex
                          ? "bg-yellow-100 dark:bg-yellow-950/40 text-gray-900 dark:text-yellow-200 font-semibold shadow-sm"
                          : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800/60"
                      )}
                    >
                      <Check
                        className={cn(
                          "ml-2 h-5 w-5 text-emerald-500 dark:text-emerald-400 flex-shrink-0",
                          value === product ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="text-right flex-grow">{product}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
});
