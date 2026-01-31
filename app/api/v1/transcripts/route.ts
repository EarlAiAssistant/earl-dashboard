/**
 * Public API: Transcripts
 * 
 * GET  /api/v1/transcripts - List user's transcripts
 * POST /api/v1/transcripts - Upload a new transcript
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { authenticateApiRequest, hasScope, ApiScope } from '@/lib/api-keys'

/**
 * GET /api/v1/transcripts
 * List transcripts with pagination
 */
export async function GET(request: Request) {
  const auth = await authenticateApiRequest(request)
  
  if (!auth.authenticated) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status, headers: auth.headers }
    )
  }
  
  if (!hasScope(auth.scopes || [], 'transcripts:read')) {
    return NextResponse.json(
      { error: 'Insufficient permissions. Required scope: transcripts:read' },
      { status: 403, headers: auth.headers }
    )
  }
  
  try {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100)
    const offset = (page - 1) * limit
    
    const supabase = await createClient()
    
    // Get transcripts
    const { data: transcripts, error, count } = await supabase
      .from('transcripts')
      .select('id, title, duration, word_count, created_at, updated_at', { count: 'exact' })
      .eq('user_id', auth.userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) {
      throw error
    }
    
    return NextResponse.json(
      {
        data: transcripts,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      },
      { headers: auth.headers }
    )
  } catch (error) {
    console.error('[API] Transcripts GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: auth.headers }
    )
  }
}

/**
 * POST /api/v1/transcripts
 * Upload a new transcript
 */
export async function POST(request: Request) {
  const auth = await authenticateApiRequest(request)
  
  if (!auth.authenticated) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status, headers: auth.headers }
    )
  }
  
  if (!hasScope(auth.scopes || [], 'transcripts:write')) {
    return NextResponse.json(
      { error: 'Insufficient permissions. Required scope: transcripts:write' },
      { status: 403, headers: auth.headers }
    )
  }
  
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.title || typeof body.title !== 'string') {
      return NextResponse.json(
        { error: 'title is required and must be a string' },
        { status: 400, headers: auth.headers }
      )
    }
    
    if (!body.content || typeof body.content !== 'string') {
      return NextResponse.json(
        { error: 'content is required and must be a string' },
        { status: 400, headers: auth.headers }
      )
    }
    
    const supabase = await createClient()
    
    // Calculate word count
    const wordCount = body.content.split(/\s+/).filter(Boolean).length
    
    const { data, error } = await supabase
      .from('transcripts')
      .insert({
        user_id: auth.userId,
        title: body.title,
        content: body.content,
        duration: body.duration || null,
        word_count: wordCount,
        speakers: body.speakers || [],
        metadata: body.metadata || {},
      })
      .select('id, title, duration, word_count, created_at')
      .single()
    
    if (error) {
      throw error
    }
    
    return NextResponse.json(
      { data },
      { status: 201, headers: auth.headers }
    )
  } catch (error) {
    console.error('[API] Transcripts POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: auth.headers }
    )
  }
}
