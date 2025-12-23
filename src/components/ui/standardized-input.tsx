import React from 'react';

interface StandardizedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'single-item' | 'notepad';
  isChecked?: boolean;
  error?: boolean;
}

export const StandardizedInput = React.forwardRef<
  HTMLInputElement,
  StandardizedInputProps
>(({ variant = 'single-item', isChecked = false, error = false, className = '', ...props }, ref) => {
  const baseStyles = 'bg-transparent outline-none caret-yellow-500 dark:caret-white transition-all focus:outline-none focus:ring-0 flex-1 min-w-0';

  const variantStyles = {
    'single-item': `
      text-sm
      border border-border/50
      rounded-xl
      shadow-sm
      focus:border-primary/50
      focus:ring-2
      focus:ring-primary/20
      bg-card dark:bg-slate-900
      text-foreground
      placeholder:text-muted-foreground
      px-3 py-2
    `,
    'notepad': `
      text-base md:text-lg
      font-medium
      overflow-hidden
      text-ellipsis
      whitespace-nowrap
      ${isChecked ? 'line-through text-muted-foreground opacity-60' : 'text-foreground'}
      placeholder:text-muted-foreground
    `
  };

  return (
    <input
      ref={ref}
      className={`${baseStyles} ${variantStyles[variant]} ${error ? 'border-red-500' : ''} ${className}`}
      {...props}
    />
  );
});

StandardizedInput.displayName = 'StandardizedInput';
