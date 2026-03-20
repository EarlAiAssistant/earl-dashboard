// ============================================================
// Toast notification store — lightweight, no external deps
// ============================================================

'use client';

import { useState, useCallback, useRef } from 'react';
import type { Toast, ToastType } from '@/src/lib/types';
import { generateId } from '@/src/lib/utils';

// Global state so multiple components can trigger toasts
let globalToasts: Toast[] = [];
let globalListeners: Array<(toasts: Toast[]) => void> = [];

function notify() {
  globalListeners.forEach((fn) => fn([...globalToasts]));
}

export function toast(type: ToastType, title: string, description?: string, duration = 3000) {
  const id = generateId();
  const t: Toast = { id, type, title, description, duration };
  globalToasts = [...globalToasts, t];
  notify();

  // Auto-dismiss
  if (duration > 0) {
    setTimeout(() => {
      dismissToast(id);
    }, duration);
  }

  return id;
}

export function dismissToast(id: string) {
  globalToasts = globalToasts.filter((t) => t.id !== id);
  notify();
}

/** Hook to subscribe to toast state */
export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>(globalToasts);

  // Subscribe on mount
  const ref = useRef(false);
  if (!ref.current) {
    ref.current = true;
    globalListeners.push(setToasts);
  }

  const dismiss = useCallback((id: string) => dismissToast(id), []);

  return { toasts, dismiss };
}

// Convenience helpers
export const toastSuccess = (title: string, desc?: string) => toast('success', title, desc);
export const toastError = (title: string, desc?: string) => toast('error', title, desc, 5000);
export const toastInfo = (title: string, desc?: string) => toast('info', title, desc);
export const toastWarning = (title: string, desc?: string) => toast('warning', title, desc, 4000);
