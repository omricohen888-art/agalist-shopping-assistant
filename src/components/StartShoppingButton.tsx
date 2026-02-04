import React from 'react';
import { ShoppingCart, Play, Sparkles, Rocket } from 'lucide-react';

interface StartShoppingButtonProps {
  onClick: () => void;
  language: 'he' | 'en';
  disabled?: boolean;
  variant?: 'primary' | 'compact';
}

export const StartShoppingButton: React.FC<StartShoppingButtonProps> = ({
  onClick,
  language,
  disabled = false,
  variant = 'primary'
}) => {
  const isCompact = variant === 'compact';
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        group relative overflow-hidden w-full sm:w-auto
        ${isCompact 
          ? 'h-10 sm:h-11 px-4 sm:px-6 rounded-lg sm:rounded-xl' 
          : 'h-11 sm:h-12 px-5 sm:px-8 rounded-xl'
        }
        font-bold text-primary-foreground
        transition-all duration-200 ease-out
        touch-manipulation
        
        /* Primary background */
        bg-primary
        
        /* Bold border */
        border-2 border-black dark:border-slate-700
        
        /* 3D shadow effect */
        shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
        dark:shadow-[3px_3px_0px_0px_rgba(100,116,139,0.8)]
        
        /* Hover/Active states */
        hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]
        dark:hover:shadow-[1px_1px_0px_0px_rgba(100,116,139,0.8)]
        active:translate-y-[3px] active:shadow-none
        
        /* Disabled state */
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
      `}
    >
      {/* Animated shine overlay */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"
      />

      {/* Button content */}
      <span className={`relative flex items-center justify-center gap-2 ${language === 'he' ? 'flex-row-reverse' : ''}`}>
        {/* Cart Icon */}
        <ShoppingCart 
          className={`${isCompact ? 'h-4 w-4' : 'h-5 w-5'} transition-transform group-hover:scale-110`} 
          strokeWidth={2.5}
        />
        
        {/* Text */}
        <span className={`${isCompact ? 'text-sm' : 'text-sm sm:text-base'} font-bold tracking-wide whitespace-nowrap`}>
          {language === 'he' ? "יוצאים לקניות!" : "Let's Go!"}
        </span>
      </span>
    </button>
  );
};

// Secondary save button to pair with the start shopping button
export const SaveListButton: React.FC<{
  onClick: () => void;
  language: 'he' | 'en';
  disabled?: boolean;
}> = ({ onClick, language, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative
        h-11 sm:h-14 px-4 sm:px-6 rounded-xl sm:rounded-2xl w-full sm:w-auto
        font-semibold
        bg-card/80 backdrop-blur-sm
        border-2 border-foreground/60
        text-foreground
        transition-all duration-200
        touch-manipulation
        hover:bg-card hover:border-primary hover:shadow-lg
        active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
      `}
    >
      {/* Notification dot */}
      <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-card" />
      <svg 
        className="h-5 w-5" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" />
        <polyline points="7 3 7 8 15 8" />
      </svg>
      <span className="text-sm sm:text-base whitespace-nowrap">
        {language === 'he' ? "שמור לאחר כך" : "Save for Later"}
      </span>
    </button>
  );
};
