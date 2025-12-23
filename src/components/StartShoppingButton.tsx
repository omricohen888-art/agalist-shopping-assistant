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
          ? 'h-11 sm:h-14 px-4 sm:px-8 rounded-xl sm:rounded-2xl' 
          : 'h-14 sm:h-18 px-6 sm:px-12 rounded-xl sm:rounded-full'
        }
        font-bold text-white
        transition-all duration-300 ease-out
        touch-manipulation
        
        /* Gradient background */
        bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500
        
        /* Bold black border */
        border-2 border-foreground/80
        
        /* Glow effect */
        shadow-[0_0_20px_rgba(16,185,129,0.4),0_8px_32px_rgba(16,185,129,0.3)]
        hover:shadow-[0_0_30px_rgba(16,185,129,0.6),0_12px_40px_rgba(16,185,129,0.4)]
        
        /* Pulse animation */
        animate-pulse-glow
        
        /* Hover/Active states */
        hover:scale-105 hover:brightness-110
        active:scale-95 active:brightness-95
        
        /* Disabled state */
        disabled:opacity-50 disabled:cursor-not-allowed disabled:animate-none disabled:hover:scale-100
      `}
    >
      {/* Animated shine overlay */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"
      />
      
      {/* Sparkle particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Sparkles 
          className="absolute top-1 right-3 h-3 w-3 text-white/60 animate-pulse" 
          style={{ animationDelay: '0s' }}
        />
        <Sparkles 
          className="absolute bottom-2 left-4 h-2.5 w-2.5 text-white/50 animate-pulse" 
          style={{ animationDelay: '0.3s' }}
        />
        <Sparkles 
          className="absolute top-3 left-8 h-2 w-2 text-white/40 animate-pulse" 
          style={{ animationDelay: '0.6s' }}
        />
      </div>

      {/* Button content */}
      <span className={`relative flex items-center justify-center gap-2 sm:gap-3 ${language === 'he' ? 'flex-row-reverse' : ''}`}>
        {/* Composite Icon: Cart with Play */}
        <span className="relative flex-shrink-0">
          <ShoppingCart 
            className={`${isCompact ? 'h-5 w-5 sm:h-6 sm:w-6' : 'h-6 w-6 sm:h-7 sm:w-7'} transition-transform group-hover:scale-110`} 
            strokeWidth={2.5}
          />
          {/* Play triangle inside/beside cart */}
          <span className="absolute -bottom-0.5 -right-1 bg-white rounded-full p-0.5 shadow-lg">
            <Play 
              className={`${isCompact ? 'h-2.5 w-2.5' : 'h-3 w-3'} text-emerald-600 fill-emerald-600`} 
            />
          </span>
        </span>
        
        {/* Text */}
        <span className={`${isCompact ? 'text-sm sm:text-base' : 'text-base sm:text-lg'} font-extrabold tracking-wide whitespace-nowrap`}>
          {language === 'he' ? "יוצאים לקניות!" : "Let's Go!"}
        </span>
        
        {/* Rocket emoji/icon for extra excitement */}
        <Rocket 
          className={`${isCompact ? 'h-4 w-4 sm:h-5 sm:w-5' : 'h-5 w-5 sm:h-6 sm:w-6'} transition-transform group-hover:translate-x-1 group-hover:-translate-y-1`}
        />
      </span>

      {/* Bottom highlight line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
