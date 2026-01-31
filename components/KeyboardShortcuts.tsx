'use client'

import { useEffect, useState } from 'react'
import { KeyboardShortcutsModal, useKeyboardShortcutsModal } from '@/components/ui/KeyboardShortcutsModal'

/**
 * Global keyboard shortcuts manager
 * Handles the shortcuts modal and listens for custom events
 */
export default function KeyboardShortcuts() {
  const { isOpen, open, close } = useKeyboardShortcutsModal()

  // Listen for custom event from command palette
  useEffect(() => {
    const handleOpenModal = () => open()
    window.addEventListener('open-shortcuts-modal', handleOpenModal)
    return () => window.removeEventListener('open-shortcuts-modal', handleOpenModal)
  }, [open])

  return <KeyboardShortcutsModal isOpen={isOpen} onClose={close} />
}
