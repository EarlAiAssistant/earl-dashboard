/**
 * Team Members API
 * 
 * GET  /api/teams/:id/members - List team members
 * POST /api/teams/:id/members - Invite a new member
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { 
  getTeamMembers, 
  getUserTeamRole, 
  createInvite,
  hasPermission,
  TeamRole
} from '@/lib/teams'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/teams/:id/members
 */
export async function GET(request: Request, { params }: RouteParams) {
  const { id: teamId } = await params
  
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check membership
    const role = await getUserTeamRole(user.id, teamId)
    if (!role) {
      return NextResponse.json({ error: 'Not a team member' }, { status: 403 })
    }
    
    const members = await getTeamMembers(teamId)
    
    return NextResponse.json({ data: members })
  } catch (error) {
    console.error('[Team Members API] List error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/teams/:id/members
 * Body: { email, role }
 */
export async function POST(request: Request, { params }: RouteParams) {
  const { id: teamId } = await params
  
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check permission
    const role = await getUserTeamRole(user.id, teamId)
    if (!role || !hasPermission(role, 'members:invite')) {
      return NextResponse.json(
        { error: 'You do not have permission to invite members' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    
    if (!body.email || typeof body.email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }
    
    const inviteRole = body.role as TeamRole || 'member'
    if (!['admin', 'member', 'viewer'].includes(inviteRole)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be admin, member, or viewer' },
        { status: 400 }
      )
    }
    
    const invite = await createInvite(teamId, body.email, inviteRole, user.id)
    
    if (!invite) {
      return NextResponse.json(
        { error: 'User is already a member or has a pending invite' },
        { status: 400 }
      )
    }
    
    return NextResponse.json({ 
      data: invite,
      message: `Invitation sent to ${body.email}` 
    }, { status: 201 })
  } catch (error) {
    console.error('[Team Members API] Invite error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
