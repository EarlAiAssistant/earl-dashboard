// ============================================================
// Keyboard shortcuts help modal (Cmd+/)
// ============================================================

'use client';

import { SHORTCUT_DOCS } from '@/src/lib/hooks/use-keyboard-shortcuts';
import { X, Keyboard } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

interface ShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

export function ShortcutsModal({ open, onClose }: ShortcutsModalProps) {
  if (!open) return null;

  // Group by context
  const grouped: Record<string, typeof SHORTCUT_DOCS> = {};
  for (const s of SHORTCUT_DOCS) {
    if (!grouped[s.context]) grouped[s.context] = [];
    grouped[s.context].push(s);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 max-h-[60vh] overflow-y-auto">
          {Object.entries(grouped).map(([context, shortcuts]) => (
            <div key={context}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {context}
              </h3>
              <div className="space-y-1">
                {shortcuts.map((s) => (
                  <div
                    key={s.key}
                    className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-accent/50"
                  >
                    <span className="text-sm">{s.description}</span>
                    <kbd className="px-2 py-0.5 text-xs font-mono text-muted-foreground bg-muted rounded border border-border min-w-[40px] text-center">
                      {s.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border text-xs text-muted-foreground text-center">
          Press <kbd className="px-1 py-0.5 bg-muted rounded border border-border">⌘/</kbd> to toggle this dialog
        </div>
      </div>
    </div>
  );
}
