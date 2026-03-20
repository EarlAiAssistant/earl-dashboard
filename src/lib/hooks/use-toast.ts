// ============================================================
// Toast notification store — lightweight, no external deps
// Uses useSyncExternalStore for proper React integration
// ============================================================

'use client';

import { useCallback, useSyncExternalStore } from 'react';
import type { Toast, ToastType } from '@/src/lib/types';
import { generateId } from '@/src/lib/utils';

// Global state
let globalToasts: Toast[] = [];
let listeners: Array<() => void> = [];

function emitChange() {
  listeners.forEach((fn) => fn());
}

function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot(): Toast[] {
  return globalToasts;
}

function getServerSnapshot(): Toast[] {
  return [];
}

/** Add a toast notification */
export function toast(type: ToastType, title: string, description?: string, duration = 3000) {
  const id = generateId();
  const t: Toast = { id, type, title, description, duration };
  globalToasts = [...globalToasts, t];
  emitChange();

  // Auto-dismiss
  if (duration > 0) {
    setTimeout(() => {
      dismissToast(id);
    }, duration);
  }

  return id;
}

/** Dismiss a toast by ID */
export function dismissToast(id: string) {
  globalToasts = globalToasts.filter((t) => t.id !== id);
  emitChange();
}

/** Hook to subscribe to toast state (properly reactive) */
export function useToasts() {
  const toasts = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const dismiss = useCallback((id: string) => dismissToast(id), []);
  return { toasts, dismiss };
}

// Convenience helpers
export const toastSuccess = (title: string, desc?: string) => toast('success', title, desc);
export const toastError = (title: string, desc?: string) => toast('error', title, desc, 5000);
export const toastInfo = (title: string, desc?: string) => toast('info', title, desc);
export const toastWarning = (title: string, desc?: string) => toast('warning', title, desc, 4000);
