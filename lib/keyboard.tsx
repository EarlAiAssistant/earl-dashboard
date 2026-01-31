'use client'

import { useEffect, useCallback } from 'react'

type KeyCombo = string // e.g., 'cmd+k', 'ctrl+shift+p', 'escape'
type KeyHandler = (event: KeyboardEvent) => void

interface ShortcutConfig {
  key: KeyCombo
  handler: KeyHandler
  description?: string
  enabled?: boolean
}

/**
 * Parse a key combo string into its parts
 */
function parseKeyCombo(combo: string): {
  key: string
  ctrl: boolean
  meta: boolean
  shift: boolean
  alt: boolean
} {
  const parts = combo.toLowerCase().split('+')
  const key = parts[parts.length - 1]
  
  return {
    key,
    ctrl: parts.includes('ctrl'),
    meta: parts.includes('cmd') || parts.includes('meta'),
    shift: parts.includes('shift'),
    alt: parts.includes('alt') || parts.includes('option'),
  }
}

/**
 * Check if an event matches a key combo
 */
function matchesKeyCombo(event: KeyboardEvent, combo: string): boolean {
  const { key, ctrl, meta, shift, alt } = parseKeyCombo(combo)
  
  // Normalize event key
  const eventKey = event.key.toLowerCase()
  
  // Handle special keys
  const keyMatches = 
    eventKey === key ||
    (key === 'escape' && eventKey === 'escape') ||
    (key === 'enter' && eventKey === 'enter') ||
    (key === 'space' && eventKey === ' ') ||
    (key === 'backspace' && eventKey === 'backspace') ||
    (key === 'delete' && eventKey === 'delete') ||
    (key === 'tab' && eventKey === 'tab') ||
    (key === 'up' && eventKey === 'arrowup') ||
    (key === 'down' && eventKey === 'arrowdown') ||
    (key === 'left' && eventKey === 'arrowleft') ||
    (key === 'right' && eventKey === 'arrowright')
  
  const modifiersMatch =
    ctrl === (event.ctrlKey || (event.metaKey && !meta)) &&
    meta === event.metaKey &&
    shift === event.shiftKey &&
    alt === event.altKey
  
  return keyMatches && modifiersMatch
}

/**
 * Check if event target is an input element
 */
function isInputElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false
  
  const tagName = target.tagName.toLowerCase()
  const isInput = tagName === 'input' || tagName === 'textarea' || tagName === 'select'
  const isContentEditable = target.isContentEditable
  
  return isInput || isContentEditable
}

/**
 * Hook for a single keyboard shortcut
 */
export function useKeyboardShortcut(
  keyCombo: KeyCombo,
  handler: KeyHandler,
  options: {
    enabled?: boolean
    ignoreInputs?: boolean
  } = {}
) {
  const { enabled = true, ignoreInputs = true } = options

  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip if typing in an input (unless explicitly allowed)
      if (ignoreInputs && isInputElement(event.target)) return
      
      if (matchesKeyCombo(event, keyCombo)) {
        event.preventDefault()
        handler(event)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [keyCombo, handler, enabled, ignoreInputs])
}

/**
 * Hook for multiple keyboard shortcuts
 */
export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip if typing in an input
      if (isInputElement(event.target)) return

      for (const shortcut of shortcuts) {
        if (shortcut.enabled === false) continue
        
        if (matchesKeyCombo(event, shortcut.key)) {
          event.preventDefault()
          shortcut.handler(event)
          break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}

/**
 * Common keyboard shortcuts for the app
 */
export const SHORTCUTS = {
  // Navigation
  GO_HOME: 'cmd+h',
  GO_BACK: 'cmd+[',
  GO_FORWARD: 'cmd+]',
  
  // Search
  OPEN_SEARCH: 'cmd+k',
  CLOSE_SEARCH: 'escape',
  
  // Actions
  NEW_TRANSCRIPT: 'cmd+n',
  SAVE: 'cmd+s',
  COPY: 'cmd+c',
  PASTE: 'cmd+v',
  
  // UI
  CLOSE_MODAL: 'escape',
  TOGGLE_SIDEBAR: 'cmd+b',
  TOGGLE_DARK_MODE: 'cmd+d',
  
  // Help
  SHOW_SHORTCUTS: 'cmd+/',
}

/**
 * Format key combo for display (e.g., "⌘K" on Mac, "Ctrl+K" on Windows)
 */
export function formatKeyCombo(combo: string): string {
  const isMac = typeof window !== 'undefined' && navigator.platform.includes('Mac')
  
  const parts = combo.split('+')
  const formattedParts = parts.map((part) => {
    switch (part.toLowerCase()) {
      case 'cmd':
      case 'meta':
        return isMac ? '⌘' : 'Ctrl'
      case 'ctrl':
        return isMac ? '⌃' : 'Ctrl'
      case 'shift':
        return isMac ? '⇧' : 'Shift'
      case 'alt':
      case 'option':
        return isMac ? '⌥' : 'Alt'
      case 'escape':
        return 'Esc'
      case 'enter':
        return '↵'
      case 'backspace':
        return '⌫'
      case 'delete':
        return 'Del'
      case 'up':
        return '↑'
      case 'down':
        return '↓'
      case 'left':
        return '←'
      case 'right':
        return '→'
      default:
        return part.toUpperCase()
    }
  })
  
  return isMac ? formattedParts.join('') : formattedParts.join('+')
}

/**
 * Keyboard shortcut indicator component
 */
export function KeyboardShortcutHint({ combo }: { combo: string }) {
  return (
    <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs font-mono bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded border border-gray-200 dark:border-gray-700">
      {formatKeyCombo(combo)}
    </kbd>
  )
}
