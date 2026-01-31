'use client'

import { useState, useCallback, useRef } from 'react'

/**
 * Optimistic UI Utilities
 * 
 * Provides hooks and helpers for implementing optimistic updates
 * that make the app feel faster by updating the UI immediately
 * before the server confirms the change.
 */

interface OptimisticState<T> {
  data: T
  isOptimistic: boolean
  error: string | null
}

/**
 * Hook for optimistic state management
 * 
 * Usage:
 * ```
 * const { data, update, rollback, isOptimistic } = useOptimistic(initialItems)
 * 
 * const handleDelete = async (id) => {
 *   // Optimistically remove item
 *   const removed = data.find(item => item.id === id)
 *   update(data.filter(item => item.id !== id))
 *   
 *   try {
 *     await api.delete(id)
 *   } catch (error) {
 *     // Rollback on error
 *     rollback()
 *     toast.error('Failed to delete')
 *   }
 * }
 * ```
 */
export function useOptimistic<T>(initialData: T) {
  const [state, setState] = useState<OptimisticState<T>>({
    data: initialData,
    isOptimistic: false,
    error: null,
  })
  
  const previousDataRef = useRef<T>(initialData)

  const update = useCallback((newData: T) => {
    previousDataRef.current = state.data
    setState({
      data: newData,
      isOptimistic: true,
      error: null,
    })
  }, [state.data])

  const confirm = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isOptimistic: false,
    }))
  }, [])

  const rollback = useCallback((error?: string) => {
    setState({
      data: previousDataRef.current,
      isOptimistic: false,
      error: error || 'Operation failed',
    })
  }, [])

  const set = useCallback((data: T) => {
    previousDataRef.current = data
    setState({
      data,
      isOptimistic: false,
      error: null,
    })
  }, [])

  return {
    data: state.data,
    isOptimistic: state.isOptimistic,
    error: state.error,
    update,
    confirm,
    rollback,
    set,
  }
}

/**
 * Hook for optimistic list operations
 * 
 * Specialized for arrays with common operations like add, remove, update
 */
export function useOptimisticList<T extends { id: string }>(initialItems: T[] = []) {
  const {
    data: items,
    isOptimistic,
    error,
    update,
    confirm,
    rollback,
    set,
  } = useOptimistic(initialItems)

  const addItem = useCallback((item: T) => {
    update([...items, item])
  }, [items, update])

  const removeItem = useCallback((id: string) => {
    update(items.filter((item) => item.id !== id))
  }, [items, update])

  const updateItem = useCallback((id: string, updates: Partial<T>) => {
    update(
      items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      )
    )
  }, [items, update])

  const moveItem = useCallback((fromIndex: number, toIndex: number) => {
    const newItems = [...items]
    const [movedItem] = newItems.splice(fromIndex, 1)
    newItems.splice(toIndex, 0, movedItem)
    update(newItems)
  }, [items, update])

  return {
    items,
    isOptimistic,
    error,
    addItem,
    removeItem,
    updateItem,
    moveItem,
    confirm,
    rollback,
    set,
  }
}

/**
 * Hook for optimistic async operations with loading state
 */
export function useOptimisticAction<T, R>(
  action: (data: T) => Promise<R>,
  options: {
    onOptimisticUpdate?: (data: T) => void
    onSuccess?: (result: R) => void
    onError?: (error: Error) => void
    onRollback?: () => void
  } = {}
) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(async (data: T): Promise<R | null> => {
    setIsLoading(true)
    setError(null)

    // Apply optimistic update
    options.onOptimisticUpdate?.(data)

    try {
      const result = await action(data)
      options.onSuccess?.(result)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Operation failed'
      setError(errorMessage)
      options.onRollback?.()
      options.onError?.(err instanceof Error ? err : new Error(errorMessage))
      return null
    } finally {
      setIsLoading(false)
    }
  }, [action, options])

  return {
    execute,
    isLoading,
    error,
  }
}

/**
 * Higher-order function to wrap an API call with optimistic update
 * 
 * Usage:
 * ```
 * const deleteItem = withOptimisticUpdate(
 *   async (id: string) => api.delete(id),
 *   {
 *     optimistic: (id) => setItems(items.filter(i => i.id !== id)),
 *     rollback: () => setItems(originalItems),
 *   }
 * )
 * ```
 */
export function withOptimisticUpdate<T extends any[], R>(
  asyncFn: (...args: T) => Promise<R>,
  handlers: {
    optimistic: (...args: T) => void
    rollback: (...args: T) => void
    onSuccess?: (result: R) => void
    onError?: (error: Error) => void
  }
): (...args: T) => Promise<R | null> {
  return async (...args: T) => {
    // Apply optimistic update immediately
    handlers.optimistic(...args)

    try {
      const result = await asyncFn(...args)
      handlers.onSuccess?.(result)
      return result
    } catch (err) {
      // Rollback on error
      handlers.rollback(...args)
      handlers.onError?.(err instanceof Error ? err : new Error('Operation failed'))
      return null
    }
  }
}

/**
 * Debounced optimistic update for frequent changes (e.g., text input)
 * 
 * Updates locally immediately, but debounces the server call
 */
export function useDebouncedOptimistic<T>(
  initialValue: T,
  saveToServer: (value: T) => Promise<void>,
  debounceMs: number = 500
) {
  const [localValue, setLocalValue] = useState(initialValue)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState(initialValue)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const setValue = useCallback((value: T) => {
    // Update local state immediately
    setLocalValue(value)

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Debounce server save
    timeoutRef.current = setTimeout(async () => {
      setIsSaving(true)
      try {
        await saveToServer(value)
        setLastSaved(value)
      } catch (error) {
        // Optionally rollback to last saved value
        console.error('Failed to save:', error)
      } finally {
        setIsSaving(false)
      }
    }, debounceMs)
  }, [saveToServer, debounceMs])

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  return {
    value: localValue,
    setValue,
    isSaving,
    isDirty: localValue !== lastSaved,
    cleanup,
  }
}

/**
 * Type for optimistic mutation result
 */
export interface OptimisticResult<T> {
  data: T | null
  error: string | null
  isLoading: boolean
  isSuccess: boolean
}

/**
 * Create an optimistic mutation
 */
export function createOptimisticMutation<TInput, TOutput, TOptimistic>(
  mutationFn: (input: TInput) => Promise<TOutput>,
  options: {
    getOptimisticData: (input: TInput) => TOptimistic
    applyOptimistic: (data: TOptimistic) => void
    revertOptimistic: (data: TOptimistic) => void
    applyResult?: (result: TOutput) => void
  }
) {
  return async (input: TInput): Promise<OptimisticResult<TOutput>> => {
    const optimisticData = options.getOptimisticData(input)
    
    // Apply optimistic update
    options.applyOptimistic(optimisticData)
    
    try {
      const result = await mutationFn(input)
      options.applyResult?.(result)
      
      return {
        data: result,
        error: null,
        isLoading: false,
        isSuccess: true,
      }
    } catch (err) {
      // Revert on error
      options.revertOptimistic(optimisticData)
      
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Mutation failed',
        isLoading: false,
        isSuccess: false,
      }
    }
  }
}
