/**
 * Form Validation Library
 * 
 * Common Zod schemas for form validation throughout the app.
 * Use with react-hook-form + @hookform/resolvers/zod
 */

import { z } from 'zod'

// ============================================
// Primitive Schemas
// ============================================

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[0-9]/, 'Password must contain a number')

export const simplePasswordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')

export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name is too long')

export const urlSchema = z
  .string()
  .url('Please enter a valid URL')
  .or(z.literal(''))

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number')
  .or(z.literal(''))

// ============================================
// Auth Schemas
// ============================================

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  name: nameSchema.optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

// ============================================
// Profile Schemas
// ============================================

export const profileSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  company: z.string().max(100).optional(),
  role: z.string().max(100).optional(),
  phone: phoneSchema.optional(),
  website: urlSchema.optional(),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

// ============================================
// Content Schemas
// ============================================

export const transcriptUploadSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().max(1000, 'Description is too long').optional(),
  customerName: z.string().max(100).optional(),
  customerCompany: z.string().max(100).optional(),
  tags: z.array(z.string().max(50)).max(10, 'Maximum 10 tags allowed').optional(),
})

export const contentGenerationSchema = z.object({
  transcriptId: z.string().uuid('Invalid transcript ID'),
  templateType: z.enum([
    'case_study',
    'blog_post',
    'social_media',
    'testimonial',
    'email',
    'executive_summary',
    'key_quotes',
    'action_items',
  ]),
  customPrompt: z.string().max(2000).optional(),
  tone: z.enum(['professional', 'casual', 'friendly', 'formal']).optional(),
  length: z.enum(['short', 'medium', 'long']).optional(),
})

export const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
})

// ============================================
// Billing Schemas
// ============================================

export const billingInfoSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  address: z.object({
    line1: z.string().min(1, 'Address is required'),
    line2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    country: z.string().min(2).max(2, 'Use 2-letter country code'),
  }),
  taxId: z.string().optional(),
})

// ============================================
// Contact/Support Schemas
// ============================================

export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  subject: z.string().min(1, 'Subject is required').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
  category: z.enum(['general', 'support', 'billing', 'feature_request', 'bug_report']).optional(),
})

export const feedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  feedback: z.string().max(2000).optional(),
  category: z.enum(['product', 'support', 'content', 'other']).optional(),
})

// ============================================
// Type Exports
// ============================================

export type LoginFormData = z.infer<typeof loginSchema>
export type SignupFormData = z.infer<typeof signupSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type ProfileFormData = z.infer<typeof profileSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
export type TranscriptUploadFormData = z.infer<typeof transcriptUploadSchema>
export type ContentGenerationFormData = z.infer<typeof contentGenerationSchema>
export type ProjectFormData = z.infer<typeof projectSchema>
export type BillingInfoFormData = z.infer<typeof billingInfoSchema>
export type ContactFormData = z.infer<typeof contactSchema>
export type FeedbackFormData = z.infer<typeof feedbackSchema>

// ============================================
// Validation Helpers
// ============================================

/**
 * Validate data against a schema and return typed result
 */
export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data)
  
  if (result.success) {
    return { success: true, data: result.data }
  }
  
  const errors: Record<string, string> = {}
  result.error.issues.forEach((issue) => {
    const path = issue.path.join('.')
    if (!errors[path]) {
      errors[path] = issue.message
    }
  })
  
  return { success: false, errors }
}

/**
 * Create a partial schema (all fields optional) for patch operations
 */
export function createPartialSchema<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
  return schema.partial()
}
