// ============================================================
// Global keyboard shortcut handler
// ============================================================

'use client';

import { useEffect, useCallback, useRef } from 'react';

export interface ShortcutAction {
  key: string;
  meta?: boolean;  // Cmd/Ctrl
  shift?: boolean;
  handler: () => void;
  /** If true, only fires when no input/textarea is focused */
  requireNoFocus?: boolean;
}

/**
 * Register global keyboard shortcuts.
 * Automatically handles meta key cross-platform (Cmd on Mac, Ctrl otherwise).
 */
export function useKeyboardShortcuts(shortcuts: ShortcutAction[], enabled = true) {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      const isInput =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable);

      for (const shortcut of shortcutsRef.current) {
        const metaMatch = shortcut.meta
          ? e.metaKey || e.ctrlKey
          : !e.metaKey && !e.ctrlKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();

        if (keyMatch && metaMatch && shiftMatch) {
          // Skip non-meta shortcuts when user is typing in an input
          if (shortcut.requireNoFocus && isInput) continue;

          e.preventDefault();
          e.stopPropagation();
          shortcut.handler();
          return;
        }
      }
    },
    [enabled]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [handleKeyDown]);
}

/** All documented shortcuts for the help modal */
export const SHORTCUT_DOCS = [
  { key: '⌘K', description: 'Open command palette', context: 'Global' },
  { key: '⌘N', description: 'Create new task', context: 'Global' },
  { key: '⌘/', description: 'Show keyboard shortcuts', context: 'Global' },
  { key: 'Esc', description: 'Close modals / palette', context: 'Global' },
  { key: 'J', description: 'Next task', context: 'List view' },
  { key: 'K', description: 'Previous task', context: 'List view' },
  { key: 'Enter', description: 'Open selected task', context: 'List view' },
  { key: '1-5', description: 'Quick status (1=Triage → 5=Done)', context: 'Task selected' },
  { key: 'P', description: 'Cycle priority', context: 'Task selected' },
  { key: 'D', description: 'Mark as done', context: 'Task selected' },
  { key: 'A', description: 'Toggle "My Day"', context: 'Task selected' },
  { key: '⌘S', description: 'Save changes', context: 'Edit mode' },
];
