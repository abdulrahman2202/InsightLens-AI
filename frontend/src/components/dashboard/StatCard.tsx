import React from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  highlight?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtitle,
  icon,
  highlight = false,
}) => {
  return (
    <div
      className={cn(
        'relative p-5 rounded-2xl border transition-all duration-200 bg-white',
        highlight
          ? 'border-[#FF9100]/40 shadow-sm ring-1 ring-[#FF9100]/20'
          : 'border-stone-200 shadow-xs hover:shadow-md hover:border-stone-300'
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-stone-900 tracking-tight">{value}</span>
          </div>
          {subtitle && <p className="text-xs text-stone-600 mt-1 font-medium">{subtitle}</p>}
        </div>
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
            highlight
              ? 'bg-[#FF9100]/15 text-[#C46E00]'
              : 'bg-[#12544F]/10 text-[#12544F]'
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};
