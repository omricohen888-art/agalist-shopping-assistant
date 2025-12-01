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
  const baseStyles = 'bg-transparent outline-none caret-yellow-500 dark:caret-white transition-all focus:outline-none focus:ring-0';

  const variantStyles = {
    'single-item': `
      text-sm
      border-2 border-black dark:border-slate-700
      rounded-lg
      shadow-sm
      focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
      bg-white dark:bg-slate-900
      !text-black dark:!text-slate-100
      placeholder:text-gray-400 dark:placeholder:text-slate-500
      px-3 py-2
    `,
    'notepad': `
      text-lg
      font-normal
      font-hand
      ${isChecked ? 'line-through text-gray-500 dark:text-slate-500' : 'text-black dark:text-slate-200'}
      placeholder:text-gray-400 dark:placeholder:text-slate-500
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
