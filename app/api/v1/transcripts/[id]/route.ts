/**
 * Public API: Transcript Detail
 * 
 * GET    /api/v1/transcripts/:id - Get transcript details
 * DELETE /api/v1/transcripts/:id - Delete transcript
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { authenticateApiRequest, hasScope } from '@/lib/api-keys'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/v1/transcripts/:id
 */
export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params
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
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('transcripts')
      .select('*')
      .eq('id', id)
      .eq('user_id', auth.userId)
      .single()
    
    if (error || !data) {
      return NextResponse.json(
        { error: 'Transcript not found' },
        { status: 404, headers: auth.headers }
      )
    }
    
    return NextResponse.json({ data }, { headers: auth.headers })
  } catch (error) {
    console.error('[API] Transcript GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: auth.headers }
    )
  }
}

/**
 * DELETE /api/v1/transcripts/:id
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  const { id } = await params
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
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('transcripts')
      .delete()
      .eq('id', id)
      .eq('user_id', auth.userId)
    
    if (error) {
      throw error
    }
    
    return new NextResponse(null, { status: 204, headers: auth.headers })
  } catch (error) {
    console.error('[API] Transcript DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: auth.headers }
    )
  }
}
