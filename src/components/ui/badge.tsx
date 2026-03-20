'use client';

import { cn } from '@/src/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline';
}

export function Badge({ children, className, variant = 'outline' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border',
        variant === 'default' && 'bg-primary text-primary-foreground border-transparent',
        className
      )}
    >
      {children}
    </span>
  );
}
