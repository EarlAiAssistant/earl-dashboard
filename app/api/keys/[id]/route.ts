/**
 * API Key Revocation
 * 
 * DELETE /api/keys/:id - Revoke an API key
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { revokeApiKey } from '@/lib/api-keys'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * DELETE /api/keys/:id
 * Revoke (delete) an API key
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  const { id } = await params
  
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const success = await revokeApiKey(id, user.id)
    
    if (!success) {
      return NextResponse.json(
        { error: 'API key not found or already revoked' },
        { status: 404 }
      )
    }
    
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[API Keys] Revoke error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
