/**
 * API Key Management System
 * 
 * Provides API key generation, validation, and rate limiting
 * for the public API.
 */

import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

// ============================================
// Types
// ============================================

export interface ApiKey {
  id: string
  user_id: string
  name: string
  key_prefix: string // First 8 chars for display
  key_hash: string // SHA256 hash for validation
  scopes: string[]
  rate_limit: number // Requests per minute
  last_used_at: string | null
  expires_at: string | null
  created_at: string
}

export interface ApiKeyCreateResult {
  key: string // Full key - only shown once
  apiKey: ApiKey
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: Date
}

// ============================================
// Constants
// ============================================

const KEY_PREFIX = 'cc_' // call-content prefix
const KEY_LENGTH = 32 // 32 random bytes = 64 hex chars
const DEFAULT_RATE_LIMIT = 60 // requests per minute

export const API_SCOPES = {
  'transcripts:read': 'Read transcripts',
  'transcripts:write': 'Upload transcripts',
  'content:read': 'Read generated content',
  'content:write': 'Generate content',
  'usage:read': 'Read usage stats',
} as const

export type ApiScope = keyof typeof API_SCOPES

// ============================================
// Key Generation
// ============================================

/**
 * Generate a new API key
 */
function generateApiKey(): string {
  const randomBytes = crypto.randomBytes(KEY_LENGTH)
  return KEY_PREFIX + randomBytes.toString('hex')
}

/**
 * Hash an API key for storage
 */
function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex')
}

/**
 * Get the prefix (first 8 chars) for display
 */
function getKeyPrefix(key: string): string {
  return key.slice(0, KEY_PREFIX.length + 8)
}

// ============================================
// Database Operations
// ============================================

/**
 * Create a new API key for a user
 */
export async function createApiKey(
  userId: string,
  name: string,
  options?: {
    scopes?: ApiScope[]
    rateLimit?: number
    expiresIn?: number // Days until expiration
  }
): Promise<ApiKeyCreateResult | null> {
  const supabase = await createClient()
  
  const key = generateApiKey()
  const keyHash = hashApiKey(key)
  const keyPrefix = getKeyPrefix(key)
  
  const expiresAt = options?.expiresIn
    ? new Date(Date.now() + options.expiresIn * 24 * 60 * 60 * 1000).toISOString()
    : null
  
  const { data, error } = await supabase
    .from('api_keys')
    .insert({
      user_id: userId,
      name,
      key_prefix: keyPrefix,
      key_hash: keyHash,
      scopes: options?.scopes || Object.keys(API_SCOPES),
      rate_limit: options?.rateLimit || DEFAULT_RATE_LIMIT,
      expires_at: expiresAt,
    })
    .select()
    .single()
  
  if (error) {
    console.error('[API Keys] Error creating key:', error)
    return null
  }
  
  return { key, apiKey: data }
}

/**
 * Validate an API key and return user info
 */
export async function validateApiKey(key: string): Promise<{
  valid: boolean
  userId?: string
  scopes?: string[]
  rateLimit?: number
  error?: string
}> {
  if (!key.startsWith(KEY_PREFIX)) {
    return { valid: false, error: 'Invalid key format' }
  }
  
  const supabase = await createClient()
  const keyHash = hashApiKey(key)
  
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('key_hash', keyHash)
    .single()
  
  if (error || !data) {
    return { valid: false, error: 'Invalid API key' }
  }
  
  // Check expiration
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { valid: false, error: 'API key has expired' }
  }
  
  // Update last used
  await supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', data.id)
  
  return {
    valid: true,
    userId: data.user_id,
    scopes: data.scopes,
    rateLimit: data.rate_limit,
  }
}

/**
 * List all API keys for a user
 */
export async function listApiKeys(userId: string): Promise<ApiKey[]> {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('api_keys')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  return data || []
}

/**
 * Revoke (delete) an API key
 */
export async function revokeApiKey(keyId: string, userId: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('api_keys')
    .delete()
    .eq('id', keyId)
    .eq('user_id', userId)
  
  return !error
}

// ============================================
// Rate Limiting
// ============================================

// In-memory rate limit store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

/**
 * Check rate limit for an API key
 */
export async function checkRateLimit(
  keyId: string,
  limit: number
): Promise<RateLimitResult> {
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute window
  
  const current = rateLimitStore.get(keyId)
  
  // Reset window if expired
  if (!current || now > current.resetAt) {
    rateLimitStore.set(keyId, { count: 1, resetAt: now + windowMs })
    return {
      allowed: true,
      remaining: limit - 1,
      resetAt: new Date(now + windowMs),
    }
  }
  
  // Check if over limit
  if (current.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(current.resetAt),
    }
  }
  
  // Increment count
  current.count++
  rateLimitStore.set(keyId, current)
  
  return {
    allowed: true,
    remaining: limit - current.count,
    resetAt: new Date(current.resetAt),
  }
}

// ============================================
// Middleware Helper
// ============================================

/**
 * Authenticate API request and check rate limits
 */
export async function authenticateApiRequest(request: Request): Promise<{
  authenticated: boolean
  userId?: string
  scopes?: string[]
  error?: string
  status?: number
  headers?: Record<string, string>
}> {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader?.startsWith('Bearer ')) {
    return {
      authenticated: false,
      error: 'Missing or invalid Authorization header',
      status: 401,
    }
  }
  
  const apiKey = authHeader.slice(7) // Remove 'Bearer '
  
  const validation = await validateApiKey(apiKey)
  
  if (!validation.valid) {
    return {
      authenticated: false,
      error: validation.error || 'Invalid API key',
      status: 401,
    }
  }
  
  // Check rate limit
  const keyHash = hashApiKey(apiKey)
  const rateLimit = await checkRateLimit(keyHash, validation.rateLimit || DEFAULT_RATE_LIMIT)
  
  const headers = {
    'X-RateLimit-Limit': String(validation.rateLimit || DEFAULT_RATE_LIMIT),
    'X-RateLimit-Remaining': String(rateLimit.remaining),
    'X-RateLimit-Reset': String(Math.floor(rateLimit.resetAt.getTime() / 1000)),
  }
  
  if (!rateLimit.allowed) {
    return {
      authenticated: false,
      error: 'Rate limit exceeded',
      status: 429,
      headers,
    }
  }
  
  return {
    authenticated: true,
    userId: validation.userId,
    scopes: validation.scopes,
    headers,
  }
}

/**
 * Check if user has required scope
 */
export function hasScope(scopes: string[], required: ApiScope): boolean {
  return scopes.includes(required)
}
