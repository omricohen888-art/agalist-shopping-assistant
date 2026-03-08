import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Store } from "lucide-react";

interface StoreAutocompleteProps {
  stores: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  direction?: "rtl" | "ltr";
}

export function StoreAutocomplete({ stores, value, onChange, placeholder, direction = "rtl" }: StoreAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = inputValue
    ? stores.filter((s) => s.includes(inputValue))
    : stores;

  const handleInputChange = (val: string) => {
    setInputValue(val);
    onChange(val);
    setIsOpen(true);
  };

  const handleSelect = (store: string) => {
    setInputValue(store);
    onChange(store);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Store className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none ${direction === 'rtl' ? 'right-3' : 'left-3'}`} />
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`h-12 text-base ${direction === 'rtl' ? 'pr-10' : 'pl-10'}`}
          dir={direction}
          autoComplete="off"
        />
      </div>
      {isOpen && filtered.length > 0 && (
        <div
          className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-xl border border-border bg-background shadow-lg"
          dir={direction}
        >
          {filtered.map((store) => (
            <button
              key={store}
              type="button"
              onClick={() => handleSelect(store)}
              className="w-full px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors text-right"
            >
              {store}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
