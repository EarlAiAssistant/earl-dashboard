'use client'

import { useState, useEffect } from 'react'
import { X, Keyboard } from 'lucide-react'
import { useKeyboardShortcut, formatKeyCombo, SHORTCUTS } from '@/lib/keyboard'

interface ShortcutCategory {
  name: string
  shortcuts: { combo: string; label: string }[]
}

const shortcutCategories: ShortcutCategory[] = [
  {
    name: 'Navigation',
    shortcuts: [
      { combo: SHORTCUTS.GO_HOME, label: 'Go to Dashboard' },
      { combo: SHORTCUTS.GO_BACK, label: 'Go Back' },
      { combo: SHORTCUTS.GO_FORWARD, label: 'Go Forward' },
    ],
  },
  {
    name: 'Search & Commands',
    shortcuts: [
      { combo: SHORTCUTS.OPEN_SEARCH, label: 'Open Command Palette' },
      { combo: SHORTCUTS.CLOSE_SEARCH, label: 'Close Dialog / Cancel' },
    ],
  },
  {
    name: 'Actions',
    shortcuts: [
      { combo: SHORTCUTS.NEW_TRANSCRIPT, label: 'New Transcript' },
      { combo: SHORTCUTS.SAVE, label: 'Save' },
      { combo: SHORTCUTS.COPY, label: 'Copy' },
      { combo: SHORTCUTS.PASTE, label: 'Paste' },
    ],
  },
  {
    name: 'Interface',
    shortcuts: [
      { combo: SHORTCUTS.TOGGLE_SIDEBAR, label: 'Toggle Sidebar' },
      { combo: SHORTCUTS.TOGGLE_DARK_MODE, label: 'Toggle Dark Mode' },
      { combo: SHORTCUTS.SHOW_SHORTCUTS, label: 'Show This Help' },
    ],
  },
]

interface KeyboardShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  // Close on escape
  useKeyboardShortcut('escape', onClose, { enabled: isOpen, ignoreInputs: false })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Keyboard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-6">
            {shortcutCategories.map((category) => (
              <div key={category.name}>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
                  {category.name}
                </h3>
                <div className="space-y-2">
                  {category.shortcuts.map((shortcut) => (
                    <div
                      key={shortcut.combo}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {shortcut.label}
                      </span>
                      <kbd className="px-2.5 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md border border-gray-200 dark:border-gray-700">
                        {formatKeyCombo(shortcut.combo)}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Press <kbd className="px-1.5 py-0.5 font-mono bg-gray-200 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300">Esc</kbd> to close
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Hook to manage keyboard shortcuts modal state
 */
export function useKeyboardShortcutsModal() {
  const [isOpen, setIsOpen] = useState(false)

  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)
  const toggle = () => setIsOpen((prev) => !prev)

  // Global shortcut to open
  useKeyboardShortcut(SHORTCUTS.SHOW_SHORTCUTS, open)

  return {
    isOpen,
    open,
    close,
    toggle,
    Modal: () => <KeyboardShortcutsModal isOpen={isOpen} onClose={close} />,
  }
}

export default KeyboardShortcutsModal
