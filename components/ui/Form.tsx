'use client'

/**
 * Form Components
 * 
 * React Hook Form + Zod integration with styled form fields.
 * Provides type-safe forms with built-in validation display.
 */

import React from 'react'
import {
  useForm,
  UseFormReturn,
  FieldValues,
  SubmitHandler,
  UseFormProps,
  Path,
  FieldError,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// ============================================
// Form Context
// ============================================

const FormContext = React.createContext<UseFormReturn<any> | null>(null)

export function useFormContext<T extends FieldValues>() {
  const context = React.useContext(FormContext) as UseFormReturn<T> | null
  if (!context) {
    throw new Error('useFormContext must be used within a Form component')
  }
  return context
}

// ============================================
// Form Root Component
// ============================================

interface FormProps<T extends FieldValues> {
  schema: z.ZodSchema<T>
  onSubmit: SubmitHandler<T>
  children: React.ReactNode
  className?: string
  defaultValues?: UseFormProps<T>['defaultValues']
  mode?: UseFormProps<T>['mode']
}

export function Form<T extends FieldValues>({
  schema,
  onSubmit,
  children,
  className = '',
  defaultValues,
  mode = 'onBlur',
}: FormProps<T>) {
  const form = useForm<T>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any),
    defaultValues,
    mode,
  })

  return (
    <FormContext.Provider value={form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={className} noValidate>
        {children}
      </form>
    </FormContext.Provider>
  )
}

// ============================================
// Form Field Component
// ============================================

interface FormFieldProps {
  name: string
  label?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select'
  placeholder?: string
  disabled?: boolean
  className?: string
  autoComplete?: string
  children?: React.ReactNode // For select options
  rows?: number // For textarea
  helpText?: string
}

export function FormField({
  name,
  label,
  type = 'text',
  placeholder,
  disabled = false,
  className = '',
  autoComplete,
  children,
  rows = 4,
  helpText,
}: FormFieldProps) {
  const { register, formState: { errors } } = useFormContext()
  const error = errors[name] as FieldError | undefined
  const hasError = !!error

  const baseInputClasses = `
    w-full px-4 py-2.5 bg-gray-800 border rounded-lg
    text-white placeholder-gray-400
    transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    disabled:opacity-50 disabled:cursor-not-allowed
    ${hasError ? 'border-red-500' : 'border-gray-700 hover:border-gray-600'}
    ${className}
  `.trim()

  const renderInput = () => {
    if (type === 'textarea') {
      return (
        <textarea
          {...register(name)}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          rows={rows}
          className={baseInputClasses}
        />
      )
    }

    if (type === 'select') {
      return (
        <select
          {...register(name)}
          disabled={disabled}
          className={baseInputClasses}
        >
          {children}
        </select>
      )
    }

    return (
      <input
        {...register(name, { valueAsNumber: type === 'number' })}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        className={baseInputClasses}
      />
    )
  }

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      {renderInput()}
      {helpText && !hasError && (
        <p className="text-xs text-gray-500">{helpText}</p>
      )}
      {hasError && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error?.message}
        </p>
      )}
    </div>
  )
}

// ============================================
// Checkbox Field
// ============================================

interface CheckboxFieldProps {
  name: string
  label: string
  disabled?: boolean
  className?: string
}

export function CheckboxField({
  name,
  label,
  disabled = false,
  className = '',
}: CheckboxFieldProps) {
  const { register, formState: { errors } } = useFormContext()
  const error = errors[name] as FieldError | undefined

  return (
    <div className={`space-y-1 ${className}`}>
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          {...register(name)}
          type="checkbox"
          disabled={disabled}
          className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500 focus:ring-2"
        />
        <span className="text-sm text-gray-300">{label}</span>
      </label>
      {error && (
        <p className="text-xs text-red-400">{error.message}</p>
      )}
    </div>
  )
}

// ============================================
// Radio Group Field
// ============================================

interface RadioOption {
  value: string
  label: string
}

interface RadioGroupFieldProps {
  name: string
  label?: string
  options: RadioOption[]
  disabled?: boolean
  className?: string
  direction?: 'horizontal' | 'vertical'
}

export function RadioGroupField({
  name,
  label,
  options,
  disabled = false,
  className = '',
  direction = 'vertical',
}: RadioGroupFieldProps) {
  const { register, formState: { errors } } = useFormContext()
  const error = errors[name] as FieldError | undefined

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <span className="block text-sm font-medium text-gray-300">{label}</span>
      )}
      <div className={`flex gap-4 ${direction === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'}`}>
        {options.map((option) => (
          <label key={option.value} className="flex items-center gap-2 cursor-pointer">
            <input
              {...register(name)}
              type="radio"
              value={option.value}
              disabled={disabled}
              className="w-4 h-4 border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500 focus:ring-2"
            />
            <span className="text-sm text-gray-300">{option.label}</span>
          </label>
        ))}
      </div>
      {error && (
        <p className="text-xs text-red-400">{error.message}</p>
      )}
    </div>
  )
}

// ============================================
// Submit Button
// ============================================

interface SubmitButtonProps {
  children: React.ReactNode
  className?: string
  loadingText?: string
}

export function SubmitButton({
  children,
  className = '',
  loadingText = 'Submitting...',
}: SubmitButtonProps) {
  const { formState: { isSubmitting } } = useFormContext()

  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className={`
        w-full px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg
        hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200
        flex items-center justify-center gap-2
        ${className}
      `.trim()}
    >
      {isSubmitting ? (
        <>
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  )
}

// ============================================
// Form Error Summary
// ============================================

interface FormErrorSummaryProps {
  className?: string
}

export function FormErrorSummary({ className = '' }: FormErrorSummaryProps) {
  const { formState: { errors } } = useFormContext()
  const errorMessages = Object.values(errors)
    .map((error) => (error as FieldError)?.message)
    .filter(Boolean)

  if (errorMessages.length === 0) return null

  return (
    <div className={`p-4 bg-red-500/10 border border-red-500/20 rounded-lg ${className}`}>
      <div className="flex items-start gap-3">
        <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
        <div className="space-y-1">
          <p className="text-sm font-medium text-red-400">Please fix the following errors:</p>
          <ul className="list-disc list-inside text-sm text-red-300 space-y-0.5">
            {errorMessages.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

// ============================================
// Form Success Message
// ============================================

interface FormSuccessProps {
  message: string
  className?: string
}

export function FormSuccess({ message, className = '' }: FormSuccessProps) {
  return (
    <div className={`p-4 bg-green-500/10 border border-green-500/20 rounded-lg ${className}`}>
      <div className="flex items-center gap-3">
        <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <p className="text-sm text-green-400">{message}</p>
      </div>
    </div>
  )
}

// ============================================
// Standalone Hook Export
// ============================================

/**
 * Create a typed form hook with Zod validation
 */
export function useZodForm<T extends FieldValues>(
  schema: z.ZodSchema<T>,
  options?: Omit<UseFormProps<T>, 'resolver'>
) {
  return useForm<T>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any),
    ...options,
  })
}

// Re-export useful types
export type { SubmitHandler, UseFormReturn, FieldValues }
