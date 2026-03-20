// ============================================================
// Template picker — select a template when creating a task
// ============================================================

'use client';

import { useTemplates } from '@/src/lib/hooks/use-tasks';
import type { TaskTemplate } from '@/src/lib/types';
import { FileText, Bug, Lightbulb, Palette, Wrench, X } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';

const templateIcons: Record<string, typeof FileText> = {
  tpl_bug: Bug,
  tpl_feature: Lightbulb,
  tpl_design: Palette,
  tpl_chore: Wrench,
};

interface TemplatePickerProps {
  onSelect: (template: TaskTemplate) => void;
  onClose: () => void;
}

export function TemplatePicker({ onSelect, onClose }: TemplatePickerProps) {
  const { data: templates, isLoading } = useTemplates();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Choose Template</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground text-sm">Loading...</div>
          ) : !templates?.length ? (
            <div className="text-center py-8 text-muted-foreground text-sm">No templates available</div>
          ) : (
            templates.map((t) => {
              const Icon = templateIcons[t.id] || FileText;
              return (
                <button
                  key={t.id}
                  onClick={() => onSelect(t)}
                  className={cn(
                    'w-full text-left px-4 py-3 rounded-lg border border-border',
                    'hover:border-primary/50 hover:bg-accent/50 transition-colors'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      {t.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}

          {/* Blank option */}
          <button
            onClick={onClose}
            className="w-full text-left px-4 py-3 rounded-lg border border-dashed border-border hover:border-primary/30 transition-colors"
          >
            <p className="text-sm text-muted-foreground">Start from scratch</p>
          </button>
        </div>
      </div>
    </div>
  );
}
