import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ISRAELI_PRODUCTS } from "@/data/israeliProducts";

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

export const SmartAutocompleteInput = forwardRef<SmartAutocompleteInputRef, SmartAutocompleteInputProps>(({
  value,
  onChange,
  onKeyDown,
  placeholder = "הקלד מוצר ואנטר להוספה מהירה...",
  className = "",
}, ref) => {
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = React.useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    },
  }));

  // Filter products based on current value
  const filteredProducts = ISRAELI_PRODUCTS
    .filter(product =>
      product.toLowerCase().includes(value.toLowerCase()) &&
      product.toLowerCase() !== value.toLowerCase() // Don't show exact matches
    )
    .slice(0, 10); // Limit to 10 suggestions for performance

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
      setSelectedIndex(-1);
      e.preventDefault();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (open && selectedIndex >= 0 && filteredProducts[selectedIndex]) {
        // Select highlighted item
        handleSelect(filteredProducts[selectedIndex]);
      } else {
        // Add current input value (free text)
        onKeyDown?.(e);
      }
    } else if (e.key === "ArrowDown" && open) {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredProducts.length - 1));
    } else if (e.key === "ArrowUp" && open) {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else {
      // Reset selection when typing
      setSelectedIndex(-1);
      onKeyDown?.(e);
    }
  };

  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    setSelectedIndex(-1); // Reset selection when typing
    setOpen(newValue.length > 0 && filteredProducts.length > 0);
  };

  return (
    <div className={cn("relative", className)}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (filteredProducts.length > 0) {
            setOpen(true);
          }
        }}
        onBlur={() => {
          // Delay closing to allow for selection
          setTimeout(() => {
            setOpen(false);
            setSelectedIndex(-1);
          }, 200);
        }}
        placeholder={placeholder}
        className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 pr-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      />
      {filteredProducts.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1 h-8 w-8 p-0"
          onClick={() => setOpen(!open)}
          type="button"
        >
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      )}

      {open && (
        <div className="absolute top-full z-50 w-full mt-1">
          <div className="rounded-md border bg-popover text-popover-foreground shadow-md">
            <div className="p-2">
              <div className="space-y-1">
                {filteredProducts.length === 0 ? (
                  <div className="px-2 py-1 text-sm text-muted-foreground">
                    {value ? "לא נמצאו מוצרים. לחץ Enter להוספה." : "התחל להקליד..."}
                  </div>
                ) : (
                  filteredProducts.map((product, index) => (
                    <button
                      key={product}
                      className={cn(
                        "flex w-full items-center px-2 py-1 text-sm rounded-sm",
                        index === selectedIndex
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent hover:text-accent-foreground"
                      )}
                      onClick={() => handleSelect(product)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === product || index === selectedIndex ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {product}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
