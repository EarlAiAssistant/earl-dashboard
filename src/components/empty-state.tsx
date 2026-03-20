// ============================================================
// Reusable empty state component with icon, message, and CTA
// ============================================================

'use client';

import type { ReactNode } from 'react';
import { Button, type ButtonProps } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: ButtonProps['variant'];
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  /** Additional hint text (e.g., keyboard shortcut) */
  hint?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  hint,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)} role="status">
      <div className="text-muted-foreground/25 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-1.5">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-5">{description}</p>

      <div className="flex items-center gap-3">
        {action && (
          <Button
            onClick={action.onClick}
            variant={action.variant || 'default'}
            size="sm"
          >
            {action.label}
          </Button>
        )}
        {secondaryAction && (
          <Button
            onClick={secondaryAction.onClick}
            variant="ghost"
            size="sm"
          >
            {secondaryAction.label}
          </Button>
        )}
      </div>

      {hint && (
        <div className="mt-4 text-xs text-muted-foreground">
          {hint}
        </div>
      )}
    </div>
  );
}
