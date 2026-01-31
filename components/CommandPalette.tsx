'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Home,
  FileText,
  Activity,
  CreditCard,
  Settings,
  Upload,
  Moon,
  Sun,
  HelpCircle,
  Keyboard,
  X,
} from 'lucide-react'
import { useKeyboardShortcut, formatKeyCombo, SHORTCUTS } from '@/lib/keyboard'
import { cn } from '@/lib/utils'

interface Command {
  id: string
  label: string
  description?: string
  icon: React.ReactNode
  shortcut?: string
  action: () => void
  category: 'navigation' | 'actions' | 'settings' | 'help'
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Define commands
  const commands: Command[] = useMemo(() => [
    // Navigation
    {
      id: 'home',
      label: 'Go to Dashboard',
      description: 'Return to the main dashboard',
      icon: <Home className="w-4 h-4" />,
      shortcut: SHORTCUTS.GO_HOME,
      action: () => router.push('/'),
      category: 'navigation',
    },
    {
      id: 'documents',
      label: 'Go to Documents',
      description: 'View all documents',
      icon: <FileText className="w-4 h-4" />,
      action: () => router.push('/documents'),
      category: 'navigation',
    },
    {
      id: 'activity',
      label: 'Go to Activity',
      description: 'View activity log',
      icon: <Activity className="w-4 h-4" />,
      action: () => router.push('/activity'),
      category: 'navigation',
    },
    {
      id: 'billing',
      label: 'Go to Billing',
      description: 'Manage subscription and usage',
      icon: <CreditCard className="w-4 h-4" />,
      action: () => router.push('/billing'),
      category: 'navigation',
    },
    
    // Actions
    {
      id: 'new-transcript',
      label: 'Upload Transcript',
      description: 'Upload a new transcript or audio file',
      icon: <Upload className="w-4 h-4" />,
      shortcut: SHORTCUTS.NEW_TRANSCRIPT,
      action: () => router.push('/upload'),
      category: 'actions',
    },
    
    // Settings
    {
      id: 'toggle-theme',
      label: 'Toggle Dark Mode',
      description: 'Switch between light and dark theme',
      icon: <Moon className="w-4 h-4" />,
      shortcut: SHORTCUTS.TOGGLE_DARK_MODE,
      action: () => {
        document.documentElement.classList.toggle('dark')
      },
      category: 'settings',
    },
    {
      id: 'settings',
      label: 'Open Settings',
      description: 'Manage your account settings',
      icon: <Settings className="w-4 h-4" />,
      action: () => router.push('/settings'),
      category: 'settings',
    },
    
    // Help
    {
      id: 'help',
      label: 'Help & Documentation',
      description: 'View documentation and guides',
      icon: <HelpCircle className="w-4 h-4" />,
      action: () => router.push('/docs'),
      category: 'help',
    },
    {
      id: 'shortcuts',
      label: 'Keyboard Shortcuts',
      description: 'View all keyboard shortcuts',
      icon: <Keyboard className="w-4 h-4" />,
      shortcut: SHORTCUTS.SHOW_SHORTCUTS,
      action: () => {
        // Dispatch custom event to open shortcuts modal
        window.dispatchEvent(new CustomEvent('open-shortcuts-modal'))
      },
      category: 'help',
    },
  ], [router])

  // Filter commands based on search
  const filteredCommands = useMemo(() => {
    if (!search) return commands
    
    const query = search.toLowerCase()
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(query) ||
        cmd.description?.toLowerCase().includes(query)
    )
  }, [commands, search])

  // Reset selection when filtered results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [filteredCommands])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  // Keyboard shortcut to open
  useKeyboardShortcut(SHORTCUTS.OPEN_SEARCH, () => setIsOpen(true))

  // Close on escape
  useKeyboardShortcut('escape', () => setIsOpen(false), { enabled: isOpen, ignoreInputs: false })

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((i) => (i + 1) % filteredCommands.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((i) => (i - 1 + filteredCommands.length) % filteredCommands.length)
        break
      case 'Enter':
        e.preventDefault()
        if (filteredCommands[selectedIndex]) {
          executeCommand(filteredCommands[selectedIndex])
        }
        break
    }
  }

  const executeCommand = (command: Command) => {
    setIsOpen(false)
    setSearch('')
    command.action()
  }

  if (!isOpen) return null

  // Group commands by category
  const categories = ['navigation', 'actions', 'settings', 'help'] as const
  const groupedCommands = categories.reduce((acc, category) => {
    acc[category] = filteredCommands.filter((cmd) => cmd.category === category)
    return acc
  }, {} as Record<typeof categories[number], Command[]>)

  const categoryLabels = {
    navigation: 'Navigation',
    actions: 'Actions',
    settings: 'Settings',
    help: 'Help',
  }

  let globalIndex = -1

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Palette */}
      <div className="relative max-w-xl w-full mx-auto mt-[20vh]">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search commands..."
              className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 outline-none"
            />
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          
          {/* Commands */}
          <div className="max-h-80 overflow-y-auto py-2">
            {filteredCommands.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                No commands found
              </div>
            ) : (
              categories.map((category) => {
                const categoryCommands = groupedCommands[category]
                if (categoryCommands.length === 0) return null
                
                return (
                  <div key={category}>
                    <div className="px-4 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {categoryLabels[category]}
                    </div>
                    {categoryCommands.map((command) => {
                      globalIndex++
                      const isSelected = globalIndex === selectedIndex
                      const currentIndex = globalIndex
                      
                      return (
                        <button
                          key={command.id}
                          onClick={() => executeCommand(command)}
                          onMouseEnter={() => setSelectedIndex(currentIndex)}
                          className={cn(
                            'w-full flex items-center gap-3 px-4 py-2 text-left transition-colors',
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                          )}
                        >
                          <span className={cn(
                            'flex-shrink-0',
                            isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
                          )}>
                            {command.icon}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">{command.label}</div>
                            {command.description && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {command.description}
                              </div>
                            )}
                          </div>
                          {command.shortcut && (
                            <kbd className="flex-shrink-0 px-1.5 py-0.5 text-xs font-mono bg-gray-100 dark:bg-gray-800 text-gray-500 rounded">
                              {formatKeyCombo(command.shortcut)}
                            </kbd>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )
              })
            )}
          </div>
          
          {/* Footer */}
          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1 rounded bg-gray-100 dark:bg-gray-800">↑↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 rounded bg-gray-100 dark:bg-gray-800">↵</kbd>
                select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 rounded bg-gray-100 dark:bg-gray-800">esc</kbd>
                close
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
