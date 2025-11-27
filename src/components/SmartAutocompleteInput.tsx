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
          className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 pr-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        {value.length === 0 && (
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        )}
      </div>

      {open && typeof document !== 'undefined' && createPortal(
        <div style={dropdownStyle}>
          <div className="rounded-xl border-2 border-black bg-white text-popover-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">

            {/* Alphabet Filter (Only show when input is empty) */}
            {value.length === 0 && (
              <div className="p-2 border-b-2 border-black/10 bg-yellow-50 overflow-x-auto whitespace-nowrap no-scrollbar">
                <div className="flex gap-1.5">
                  {HEBREW_ALPHABET.map(letter => (
                    <button
                      key={letter}
                      onMouseDown={(e) => {
                        e.preventDefault(); // Prevent blur
                        setActiveLetter(prev => prev === letter ? null : letter);
                      }}
                      className={cn(
                        "w-8 h-8 rounded-lg text-sm font-bold border-2 transition-all flex items-center justify-center flex-shrink-0",
                        activeLetter === letter
                          ? "bg-black text-yellow-400 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                          : "bg-white text-black border-black/20 hover:border-black hover:bg-yellow-100"
                      )}
                    >
                      {letter}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="max-h-[240px] overflow-y-auto p-1">
              {filteredProducts.length === 0 ? (
                <div className="px-4 py-3 text-sm text-muted-foreground text-center">
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
                        "flex w-full items-center px-3 py-2.5 text-sm rounded-lg transition-colors font-medium text-right",
                        index === selectedIndex
                          ? "bg-yellow-100 text-black"
                          : "hover:bg-gray-100 text-gray-700"
                      )}
                    >
                      <Check
                        className={cn(
                          "ml-2 h-4 w-4 text-green-600",
                          value === product ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {product}
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
