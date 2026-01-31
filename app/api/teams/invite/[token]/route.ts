/**
 * Team Invite Acceptance API
 * 
 * GET  /api/teams/invite/:token - Get invite details
 * POST /api/teams/invite/:token - Accept invite
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { acceptInvite } from '@/lib/teams'

interface RouteParams {
  params: Promise<{ token: string }>
}

/**
 * GET /api/teams/invite/:token
 * Get invite details (public, for invite page)
 */
export async function GET(request: Request, { params }: RouteParams) {
  const { token } = await params
  
  try {
    const supabase = await createClient()
    
    const { data: invite } = await supabase
      .from('team_invites')
      .select('*, teams(name, slug)')
      .eq('token', token)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .single()
    
    if (!invite) {
      return NextResponse.json(
        { error: 'Invite not found or expired' },
        { status: 404 }
      )
    }
    
    const team = invite.teams as { name: string; slug: string }
    
    return NextResponse.json({
      data: {
        email: invite.email,
        role: invite.role,
        team: team,
        expires_at: invite.expires_at,
      }
    })
  } catch (error) {
    console.error('[Team Invite] Get error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/teams/invite/:token
 * Accept the invite (requires auth)
 */
export async function POST(request: Request, { params }: RouteParams) {
  const { token } = await params
  
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const success = await acceptInvite(token, user.id)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to accept invite. It may be expired or already used.' },
        { status: 400 }
      )
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'You have joined the team!'
    })
  } catch (error) {
    console.error('[Team Invite] Accept error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
