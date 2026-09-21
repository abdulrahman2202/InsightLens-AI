import React from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'default' | 'narrow' | 'wide' | 'full';
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className,
  maxWidth = 'default',
}) => {
  const maxWidthStyles = {
    narrow: 'max-w-4xl',
    default: 'max-w-6xl',
    wide: 'max-w-7xl',
    full: 'max-w-none',
  };

  return (
    <div className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8', maxWidthStyles[maxWidth], className)}>
      {children}
    </div>
  );
};
