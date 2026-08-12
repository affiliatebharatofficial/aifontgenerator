import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-bold tracking-wider uppercase transition-all focus:outline-none focus:ring-1 focus:ring-[#e05638] disabled:opacity-50 disabled:pointer-events-none rounded-md cursor-pointer';

    const variants = {
      primary: 'bg-[#e05638] hover:bg-[#c84326] text-white shadow-sm',
      secondary: 'bg-[#18181b] hover:bg-[#27272a] text-[#f4f4f5] border border-[#27272a]',
      outline: 'border border-[#27272a] hover:bg-[#18181b] text-[#a1a1aa] hover:text-[#f4f4f5]',
      ghost: 'hover:bg-[#18181b] text-[#a1a1aa] hover:text-[#f4f4f5]',
      danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm',
    };

    const sizes = {
      sm: 'h-8 px-3 text-[11px] gap-1.5 font-mono',
      md: 'h-10 px-4 text-xs gap-2 font-mono',
      lg: 'h-12 px-6 text-xs gap-2.5 font-mono',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
