import React from 'react';
import { clsx } from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, type = 'text', id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full space-y-1.5 font-mono text-xs">
        {label && (
          <label htmlFor={inputId} className="block text-[#a1a1aa] uppercase font-semibold text-[11px]">
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          className={clsx(
            'w-full h-10 px-3 py-2 text-xs bg-[#09090b] border rounded-md text-[#f4f4f5] placeholder:text-[#71717a] focus:outline-none focus:border-[#e05638] transition-all',
            error ? 'border-rose-600 focus:border-rose-500' : 'border-[#27272a]',
            className
          )}
          {...props}
        />
        {error && <p className="text-[11px] text-rose-400">{error}</p>}
        {!error && helperText && <p className="text-[10px] text-[#71717a]">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
