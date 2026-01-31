/**
 * Optimistic UI Utilities
 * 
 * Patterns and hooks for optimistic updates - update UI immediately,
 * then sync with server, rolling back on error.
 */

import { useOptimistic, useTransition, useCallback, useState } from 'react'
import { toast } from '@/components/ui/Toast'

// ============================================
// Types
// ============================================

export interface OptimisticAction<T> {
  type: 'add' | 'update' | 'delete'
  item: T
  previousItem?: T
}

export interface MutationOptions<T, TInput = unknown> {
  /** Server mutation function */
  mutationFn: (input: TInput) => Promise<T>
  /** Called immediately with optimistic data */
  onMutate?: (input: TInput) => T | void
  /** Called on success with server response */
  onSuccess?: (data: T, input: TInput) => void
  /** Called on error with rollback option */
  onError?: (error: Error, input: TInput, rollback: () => void) => void
  /** Show toast on success */
  successMessage?: string
  /** Show toast on error */
  errorMessage?: string
}

// ============================================
// useOptimisticList Hook
// ============================================

/**
 * Hook for optimistic list operations (add, update, delete)
 * 
 * @example
 * ```tsx
 * const { items, addItem, updateItem, deleteItem, isPending } = useOptimisticList(
 *   serverItems,
 *   (items, action) => {
 *     if (action.type === 'add') return [...items, action.item]
 *     if (action.type === 'update') return items.map(i => i.id === action.item.id ? action.item : i)
 *     if (action.type === 'delete') return items.filter(i => i.id !== action.item.id)
 *     return items
 *   }
 * )
 * ```
 */
export function useOptimisticList<T extends { id: string }>(
  serverItems: T[],
  reducer: (items: T[], action: OptimisticAction<T>) => T[]
) {
  const [optimisticItems, addOptimisticAction] = useOptimistic(
    serverItems,
    reducer
  )
  const [isPending, startTransition] = useTransition()

  const addItem = useCallback(
    async (
      item: T,
      serverAction: () => Promise<T>,
      options?: { onSuccess?: (item: T) => void; onError?: (error: Error) => void }
    ) => {
      startTransition(() => {
        addOptimisticAction({ type: 'add', item })
      })

      try {
        const result = await serverAction()
        options?.onSuccess?.(result)
        return result
      } catch (error) {
        options?.onError?.(error as Error)
        throw error
      }
    },
    [addOptimisticAction]
  )

  const updateItem = useCallback(
    async (
      item: T,
      serverAction: () => Promise<T>,
      options?: { onSuccess?: (item: T) => void; onError?: (error: Error) => void }
    ) => {
      const previousItem = serverItems.find((i) => i.id === item.id)
      
      startTransition(() => {
        addOptimisticAction({ type: 'update', item, previousItem })
      })

      try {
        const result = await serverAction()
        options?.onSuccess?.(result)
        return result
      } catch (error) {
        options?.onError?.(error as Error)
        throw error
      }
    },
    [addOptimisticAction, serverItems]
  )

  const deleteItem = useCallback(
    async (
      item: T,
      serverAction: () => Promise<void>,
      options?: { onSuccess?: () => void; onError?: (error: Error) => void }
    ) => {
      startTransition(() => {
        addOptimisticAction({ type: 'delete', item })
      })

      try {
        await serverAction()
        options?.onSuccess?.()
      } catch (error) {
        options?.onError?.(error as Error)
        throw error
      }
    },
    [addOptimisticAction]
  )

  return {
    items: optimisticItems,
    addItem,
    updateItem,
    deleteItem,
    isPending,
  }
}

// ============================================
// useOptimisticMutation Hook
// ============================================

/**
 * Hook for single optimistic mutations with automatic rollback
 * 
 * @example
 * ```tsx
 * const { mutate, isPending, error } = useOptimisticMutation({
 *   mutationFn: async (data) => await api.updateProfile(data),
 *   onMutate: (data) => setProfile({ ...profile, ...data }),
 *   onError: (error, data, rollback) => {
 *     rollback() // Restore previous state
 *     toast.error('Failed to update profile')
 *   },
 *   successMessage: 'Profile updated!'
 * })
 * 
 * // Usage
 * mutate({ name: 'New Name' })
 * ```
 */
export function useOptimisticMutation<T, TInput = unknown>(
  options: MutationOptions<T, TInput>
) {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [previousState, setPreviousState] = useState<T | null>(null)

  const mutate = useCallback(
    async (input: TInput): Promise<T | undefined> => {
      setIsPending(true)
      setError(null)

      // Apply optimistic update
      const optimisticResult = options.onMutate?.(input)
      if (optimisticResult !== undefined) {
        setPreviousState(optimisticResult as T)
      }

      try {
        const result = await options.mutationFn(input)
        
        options.onSuccess?.(result, input)
        
        if (options.successMessage) {
          toast.success(options.successMessage)
        }
        
        return result
      } catch (err) {
        const error = err as Error
        setError(error)
        
        const rollback = () => {
          if (previousState !== null) {
            options.onMutate?.(previousState as unknown as TInput)
          }
        }
        
        options.onError?.(error, input, rollback)
        
        if (options.errorMessage) {
          toast.error(options.errorMessage)
        }
        
        throw error
      } finally {
        setIsPending(false)
      }
    },
    [options, previousState]
  )

  const reset = useCallback(() => {
    setError(null)
    setPreviousState(null)
  }, [])

  return {
    mutate,
    isPending,
    error,
    reset,
  }
}

// ============================================
// useOptimisticToggle Hook
// ============================================

/**
 * Hook for optimistic toggle operations (like/favorite/checkbox)
 * 
 * @example
 * ```tsx
 * const { isActive, toggle, isPending } = useOptimisticToggle(
 *   item.isFavorited,
 *   async (newValue) => {
 *     await api.setFavorite(item.id, newValue)
 *   }
 * )
 * 
 * <button onClick={toggle} disabled={isPending}>
 *   {isActive ? '★' : '☆'}
 * </button>
 * ```
 */
export function useOptimisticToggle(
  initialValue: boolean,
  onToggle: (newValue: boolean) => Promise<void>,
  options?: {
    onError?: (error: Error) => void
    successMessage?: string
    errorMessage?: string
  }
) {
  const [optimisticValue, setOptimisticValue] = useOptimistic(
    initialValue,
    (_, newValue: boolean) => newValue
  )
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<Error | null>(null)

  const toggle = useCallback(async () => {
    const newValue = !optimisticValue
    setError(null)
    
    startTransition(() => {
      setOptimisticValue(newValue)
    })

    try {
      await onToggle(newValue)
      
      if (options?.successMessage) {
        toast.success(options.successMessage)
      }
    } catch (err) {
      const error = err as Error
      setError(error)
      options?.onError?.(error)
      
      if (options?.errorMessage) {
        toast.error(options.errorMessage)
      }
    }
  }, [optimisticValue, onToggle, options, setOptimisticValue])

  return {
    isActive: optimisticValue,
    toggle,
    isPending,
    error,
  }
}

// ============================================
// useOptimisticCounter Hook
// ============================================

/**
 * Hook for optimistic counter operations (upvotes, quantity)
 * 
 * @example
 * ```tsx
 * const { count, increment, decrement, isPending } = useOptimisticCounter(
 *   item.votes,
 *   async (newCount) => {
 *     await api.setVotes(item.id, newCount)
 *   }
 * )
 * 
 * <button onClick={increment}>+</button>
 * <span>{count}</span>
 * <button onClick={decrement}>-</button>
 * ```
 */
export function useOptimisticCounter(
  initialValue: number,
  onUpdate: (newValue: number) => Promise<void>,
  options?: {
    min?: number
    max?: number
    onError?: (error: Error) => void
  }
) {
  const [optimisticCount, setOptimisticCount] = useOptimistic(
    initialValue,
    (_, newValue: number) => newValue
  )
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<Error | null>(null)

  const updateCount = useCallback(
    async (newValue: number) => {
      const { min = -Infinity, max = Infinity } = options || {}
      const clampedValue = Math.min(Math.max(newValue, min), max)
      
      if (clampedValue === optimisticCount) return
      
      setError(null)
      
      startTransition(() => {
        setOptimisticCount(clampedValue)
      })

      try {
        await onUpdate(clampedValue)
      } catch (err) {
        const error = err as Error
        setError(error)
        options?.onError?.(error)
      }
    },
    [optimisticCount, onUpdate, options, setOptimisticCount]
  )

  const increment = useCallback(
    (amount = 1) => updateCount(optimisticCount + amount),
    [optimisticCount, updateCount]
  )

  const decrement = useCallback(
    (amount = 1) => updateCount(optimisticCount - amount),
    [optimisticCount, updateCount]
  )

  const setCount = useCallback(
    (value: number) => updateCount(value),
    [updateCount]
  )

  return {
    count: optimisticCount,
    increment,
    decrement,
    setCount,
    isPending,
    error,
  }
}

// ============================================
// Higher-Order Action Wrapper
// ============================================

/**
 * Wrap a server action with optimistic UI handling
 * 
 * @example
 * ```tsx
 * const saveWithOptimism = withOptimistic(
 *   saveToServer,
 *   {
 *     onOptimistic: (data) => updateLocalState(data),
 *     onSuccess: () => toast.success('Saved!'),
 *     onError: (err, rollback) => {
 *       rollback()
 *       toast.error('Save failed')
 *     }
 *   }
 * )
 * 
 * // Usage
 * await saveWithOptimism(myData)
 * ```
 */
export function withOptimistic<TInput, TOutput>(
  serverFn: (input: TInput) => Promise<TOutput>,
  handlers: {
    onOptimistic?: (input: TInput) => TInput
    onSuccess?: (result: TOutput, input: TInput) => void
    onError?: (error: Error, input: TInput, rollback: () => void) => void
  }
) {
  let previousInput: TInput | undefined

  return async (input: TInput): Promise<TOutput> => {
    // Store previous and apply optimistic update
    if (handlers.onOptimistic) {
      previousInput = { ...input }
      handlers.onOptimistic(input)
    }

    try {
      const result = await serverFn(input)
      handlers.onSuccess?.(result, input)
      return result
    } catch (err) {
      const error = err as Error
      const rollback = () => {
        if (previousInput && handlers.onOptimistic) {
          handlers.onOptimistic(previousInput)
        }
      }
      handlers.onError?.(error, input, rollback)
      throw error
    }
  }
}
