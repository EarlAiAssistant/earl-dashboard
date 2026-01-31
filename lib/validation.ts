import { z } from 'zod'

/**
 * Form Validation Schemas for Call-Content
 */

// ============================================
// COMMON SCHEMAS
// ============================================

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name must be less than 100 characters')

// ============================================
// AUTH SCHEMAS
// ============================================

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

export const signupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

// ============================================
// PROFILE SCHEMAS
// ============================================

export const profileSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  company: z.string().max(100, 'Company name must be less than 100 characters').optional(),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

// ============================================
// TRANSCRIPT SCHEMAS
// ============================================

export const uploadTranscriptSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  content: z.string().min(100, 'Transcript must be at least 100 characters'),
  industry: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export const transcriptSettingsSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  industry: z.string().optional(),
  speakers: z.array(z.object({
    label: z.string(),
    name: z.string(),
  })).optional(),
})

// ============================================
// CONTENT GENERATION SCHEMAS
// ============================================

export const generateContentSchema = z.object({
  transcriptId: z.string().min(1, 'Transcript is required'),
  template: z.enum([
    'blog_post',
    'case_study',
    'linkedin_post',
    'twitter_thread',
    'email_sequence',
    'testimonial',
    'press_release',
    'landing_page',
  ]),
  tone: z.enum(['professional', 'casual', 'formal', 'friendly']).optional(),
  length: z.enum(['short', 'medium', 'long']).optional(),
  customInstructions: z.string().max(500, 'Instructions must be less than 500 characters').optional(),
})

// ============================================
// BILLING SCHEMAS
// ============================================

export const checkoutSchema = z.object({
  tier: z.enum(['starter', 'professional', 'agency']),
  billingPeriod: z.enum(['monthly', 'annual']).optional(),
})

export const boosterPackSchema = z.object({
  userId: z.string().min(1),
  email: emailSchema,
})

// ============================================
// CONTACT/SUPPORT SCHEMAS
// ============================================

export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject must be less than 200 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000, 'Message must be less than 5000 characters'),
})

export const feedbackSchema = z.object({
  type: z.enum(['bug', 'feature', 'general']),
  message: z.string().min(10, 'Feedback must be at least 10 characters').max(2000, 'Feedback must be less than 2000 characters'),
  email: emailSchema.optional(),
})

// ============================================
// TYPE EXPORTS
// ============================================

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type ProfileInput = z.infer<typeof profileSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type UploadTranscriptInput = z.infer<typeof uploadTranscriptSchema>
export type TranscriptSettingsInput = z.infer<typeof transcriptSettingsSchema>
export type GenerateContentInput = z.infer<typeof generateContentSchema>
export type CheckoutInput = z.infer<typeof checkoutSchema>
export type BoosterPackInput = z.infer<typeof boosterPackSchema>
export type ContactInput = z.infer<typeof contactSchema>
export type FeedbackInput = z.infer<typeof feedbackSchema>

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validate data against a schema and return formatted errors
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
  result.error.errors.forEach((error) => {
    const path = error.path.join('.')
    if (!errors[path]) {
      errors[path] = error.message
    }
  })
  
  return { success: false, errors }
}

/**
 * Get first error message from Zod error
 */
export function getFirstError(error: z.ZodError): string {
  return error.errors[0]?.message || 'Validation failed'
}

/**
 * Format Zod errors for display
 */
export function formatErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {}
  error.errors.forEach((err) => {
    const path = err.path.join('.')
    if (!errors[path]) {
      errors[path] = err.message
    }
  })
  return errors
}
