import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'orange' | 'cream';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      primary:
        'bg-[#12544F] text-white hover:bg-[#0d3e3a] active:bg-[#0a2e2b] shadow-sm border border-[#0d3e3a]',
      secondary:
        'bg-stone-100 text-stone-800 hover:bg-stone-200 active:bg-stone-300 border border-stone-200 shadow-sm',
      cream:
        'bg-[#FDF4D2] text-[#12544F] hover:bg-[#faecc0] active:bg-[#f6e4ac] border border-[#f1de9f] font-semibold shadow-sm',
      orange:
        'bg-[#FF9100] text-white hover:bg-[#e08000] active:bg-[#c97300] font-semibold shadow-sm border border-[#e08000]',
      outline:
        'bg-transparent text-stone-800 hover:bg-stone-100 active:bg-stone-200 border border-stone-300',
      ghost:
        'bg-transparent text-stone-700 hover:bg-stone-100 active:bg-stone-200 border border-transparent',
    };

    const sizeStyles = {
      sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5 font-medium',
      md: 'text-sm px-4 py-2 rounded-xl gap-2 font-medium',
      lg: 'text-base px-5 py-2.5 rounded-xl gap-2.5 font-semibold',
      icon: 'p-2 rounded-xl aspect-square justify-center',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12544F]/40 focus-visible:ring-offset-1 select-none',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
