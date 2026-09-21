import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'teal' | 'cream' | 'orange' | 'stone' | 'outline' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'stone',
  size = 'md',
  className,
  icon,
}) => {
  const variantStyles = {
    teal: 'bg-[#12544F]/10 text-[#12544F] border border-[#12544F]/20 font-medium',
    cream: 'bg-[#FDF4D2] text-[#12544F] border border-[#F3E5AB] font-medium',
    orange: 'bg-[#FF9100]/15 text-[#C46E00] border border-[#FF9100]/30 font-semibold',
    stone: 'bg-stone-100 text-stone-700 border border-stone-200 font-medium',
    outline: 'bg-transparent text-stone-700 border border-stone-300 font-medium',
    neutral: 'bg-stone-200/80 text-stone-800 border border-stone-300 font-medium',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 rounded-md gap-1',
    md: 'text-xs px-2.5 py-1 rounded-md gap-1.5',
    lg: 'text-sm px-3 py-1.5 rounded-lg gap-2',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center tracking-wide transition-colors select-none',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
