/**
 * Teams API
 * 
 * GET  /api/teams - List user's teams
 * POST /api/teams - Create a new team
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createTeam, getUserTeams } from '@/lib/teams'

/**
 * GET /api/teams
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const teams = await getUserTeams(user.id)
    
    return NextResponse.json({ data: teams })
  } catch (error) {
    console.error('[Teams API] List error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/teams
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    
    if (!body.name || typeof body.name !== 'string' || body.name.length < 2) {
      return NextResponse.json(
        { error: 'Team name must be at least 2 characters' },
        { status: 400 }
      )
    }
    
    const team = await createTeam(user.id, body.name, body.slug)
    
    if (!team) {
      return NextResponse.json(
        { error: 'Team slug is already taken' },
        { status: 400 }
      )
    }
    
    return NextResponse.json({ data: team }, { status: 201 })
  } catch (error) {
    console.error('[Teams API] Create error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
