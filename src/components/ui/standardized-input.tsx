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
  const baseStyles = 'outline-none caret-yellow-500 dark:caret-yellow-400 transition-all focus:outline-none focus:ring-0';

  const variantStyles = {
    'single-item': `
      text-base sm:text-lg
      font-medium
      border-2 border-gray-200 dark:border-slate-600
      rounded-xl
      shadow-sm dark:shadow-md
      hover:border-gray-300 dark:hover:border-slate-500
      focus:border-yellow-400 dark:focus:border-yellow-400
      focus:shadow-[0_0_0_3px_rgba(250,204,21,0.1)] dark:focus:shadow-[0_0_0_3px_rgba(250,204,21,0.15)]
      focus:translate-y-[-1px]
      bg-white dark:bg-slate-800
      !text-gray-900 dark:!text-slate-50
      placeholder:text-gray-400 dark:placeholder:text-slate-500
      px-4 py-3 sm:py-4
      leading-relaxed
    `,
    'notepad': `
      text-base sm:text-lg
      font-normal
      font-hand
      ${isChecked ? 'line-through text-gray-400 dark:text-slate-500' : 'text-gray-800 dark:text-slate-200'}
      placeholder:text-gray-300 dark:placeholder:text-slate-600
    `
  };

  return (
    <input
      ref={ref}
      className={`${baseStyles} ${variantStyles[variant]} ${error ? 'border-red-400 dark:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]' : ''} ${className}`}
      {...props}
    />
  );
});

StandardizedInput.displayName = 'StandardizedInput';
