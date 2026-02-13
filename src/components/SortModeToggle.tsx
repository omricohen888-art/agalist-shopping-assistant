import React from 'react';
import { ArrowDownAZ, ListOrdered, Sparkles } from 'lucide-react';

interface SortModeToggleProps {
  isSmartSort: boolean;
  onToggle: (isSmartSort: boolean) => void;
  language: 'he' | 'en';
}

export const SortModeToggle: React.FC<SortModeToggleProps> = ({
  isSmartSort,
  onToggle,
  language
}) => {
  return (
    <div className="flex items-center justify-center gap-1 p-0.5 glass rounded-full border border-border/50 w-full max-w-[240px] mx-auto">
      {/* Original Order Button - First */}
      <button
        onClick={() => onToggle(false)}
        className={`
          flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium
          transition-all duration-300 ease-out touch-manipulation
          ${!isSmartSort 
            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-[1.02]' 
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }
        `}
      >
        <ListOrdered className="h-2.5 w-2.5" />
        <span className="whitespace-nowrap">
          {language === 'he' ? 'סדר מקורי' : 'Original Order'}
        </span>
      </button>

      {/* Smart Sort Button - Second */}
      <button
        onClick={() => onToggle(true)}
        className={`
          flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium
          transition-all duration-300 ease-out touch-manipulation
          ${isSmartSort 
            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-[1.02]' 
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }
        `}
      >
        <Sparkles className={`h-2.5 w-2.5 ${isSmartSort ? 'animate-pulse' : ''}`} />
        <span className="whitespace-nowrap">
          {language === 'he' ? 'מיון חכם' : 'Smart Sort'}
        </span>
      </button>
    </div>
  );
};
