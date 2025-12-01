import React from 'react';

interface StandardizedTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const StandardizedTextarea = React.forwardRef<
  HTMLTextAreaElement,
  StandardizedTextareaProps
>(({ error = false, className = '', ...props }, ref) => {
  const baseStyles = 'border-2 border-black dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-black dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-0 focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all resize-none';

  return (
    <textarea
      ref={ref}
      className={`${baseStyles} ${error ? 'border-red-500' : ''} ${className}`}
      {...props}
    />
  );
});

StandardizedTextarea.displayName = 'StandardizedTextarea';
