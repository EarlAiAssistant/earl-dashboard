/**
 * API Key Management
 * 
 * GET  /api/keys - List user's API keys
 * POST /api/keys - Create a new API key
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createApiKey, listApiKeys, API_SCOPES, ApiScope } from '@/lib/api-keys'

/**
 * GET /api/keys
 * List all API keys for the current user
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const keys = await listApiKeys(user.id)
    
    // Don't expose the hash
    const safeKeys = keys.map(({ key_hash, ...rest }) => rest)
    
    return NextResponse.json({ 
      data: safeKeys,
      availableScopes: API_SCOPES,
    })
  } catch (error) {
    console.error('[API Keys] List error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/keys
 * Create a new API key
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    
    // Validate name
    if (!body.name || typeof body.name !== 'string' || body.name.length < 1) {
      return NextResponse.json(
        { error: 'name is required' },
        { status: 400 }
      )
    }
    
    // Validate scopes
    const validScopes = Object.keys(API_SCOPES) as ApiScope[]
    const scopes = body.scopes?.filter((s: string) => validScopes.includes(s as ApiScope)) || validScopes
    
    // Validate rate limit
    const rateLimit = body.rateLimit && typeof body.rateLimit === 'number' 
      ? Math.min(Math.max(body.rateLimit, 10), 1000) // Between 10 and 1000
      : undefined
    
    // Validate expiration
    const expiresIn = body.expiresInDays && typeof body.expiresInDays === 'number'
      ? Math.min(Math.max(body.expiresInDays, 1), 365) // Between 1 and 365 days
      : undefined
    
    const result = await createApiKey(user.id, body.name, {
      scopes,
      rateLimit,
      expiresIn,
    })
    
    if (!result) {
      return NextResponse.json(
        { error: 'Failed to create API key' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      // Only return the full key once - user must save it
      key: result.key,
      warning: 'Save this key now. It will not be shown again.',
      data: {
        id: result.apiKey.id,
        name: result.apiKey.name,
        key_prefix: result.apiKey.key_prefix,
        scopes: result.apiKey.scopes,
        rate_limit: result.apiKey.rate_limit,
        expires_at: result.apiKey.expires_at,
        created_at: result.apiKey.created_at,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('[API Keys] Create error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
