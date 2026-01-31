/**
 * Team Management System
 * 
 * Provides team creation, member management, and role-based access control.
 */

import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email'
import crypto from 'crypto'

// ============================================
// Types
// ============================================

export type TeamRole = 'owner' | 'admin' | 'member' | 'viewer'

export interface Team {
  id: string
  name: string
  slug: string
  owner_id: string
  stripe_customer_id?: string
  subscription_tier?: string
  subscription_status?: string
  monthly_transcript_limit: number
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: string
  team_id: string
  user_id: string
  role: TeamRole
  joined_at: string
  user?: {
    id: string
    name: string
    email: string
  }
}

export interface TeamInvite {
  id: string
  team_id: string
  email: string
  role: TeamRole
  token: string
  invited_by: string
  expires_at: string
  accepted_at: string | null
  created_at: string
}

// ============================================
// Constants
// ============================================

export const ROLE_PERMISSIONS: Record<TeamRole, readonly string[]> = {
  owner: ['*'], // All permissions
  admin: [
    'team:read', 'team:update',
    'members:read', 'members:invite', 'members:remove', 'members:update_role',
    'transcripts:*', 'content:*', 'billing:read',
  ],
  member: [
    'team:read',
    'members:read',
    'transcripts:*', 'content:*',
  ],
  viewer: [
    'team:read',
    'members:read',
    'transcripts:read', 'content:read',
  ],
}

export const ROLE_HIERARCHY: TeamRole[] = ['owner', 'admin', 'member', 'viewer']

// ============================================
// Permission Helpers
// ============================================

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: TeamRole, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[role]
  
  if (permissions.includes('*')) return true
  
  // Check exact match
  if (permissions.includes(permission)) return true
  
  // Check wildcard match (e.g., 'transcripts:*' matches 'transcripts:read')
  const [category] = permission.split(':')
  if (permissions.includes(`${category}:*`)) return true
  
  return false
}

/**
 * Check if a role can manage another role
 */
export function canManageRole(managerRole: TeamRole, targetRole: TeamRole): boolean {
  const managerIndex = ROLE_HIERARCHY.indexOf(managerRole)
  const targetIndex = ROLE_HIERARCHY.indexOf(targetRole)
  
  // Can only manage roles below yours in hierarchy
  return managerIndex < targetIndex
}

// ============================================
// Team Operations
// ============================================

/**
 * Create a new team
 */
export async function createTeam(
  ownerId: string,
  name: string,
  slug?: string
): Promise<Team | null> {
  const supabase = await createClient()
  
  // Generate slug from name if not provided
  const teamSlug = slug || name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  
  // Check slug availability
  const { data: existing } = await supabase
    .from('teams')
    .select('id')
    .eq('slug', teamSlug)
    .single()
  
  if (existing) {
    return null // Slug taken
  }
  
  // Create team
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .insert({
      name,
      slug: teamSlug,
      owner_id: ownerId,
      monthly_transcript_limit: 30, // Default limit
    })
    .select()
    .single()
  
  if (teamError || !team) {
    console.error('[Teams] Error creating team:', teamError)
    return null
  }
  
  // Add owner as member
  await supabase
    .from('team_members')
    .insert({
      team_id: team.id,
      user_id: ownerId,
      role: 'owner',
    })
  
  // Update user's current team
  await supabase
    .from('users')
    .update({ current_team_id: team.id })
    .eq('id', ownerId)
  
  return team
}

/**
 * Get team by ID or slug
 */
export async function getTeam(idOrSlug: string): Promise<Team | null> {
  const supabase = await createClient()
  
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug)
  
  const { data } = await supabase
    .from('teams')
    .select('*')
    .eq(isUuid ? 'id' : 'slug', idOrSlug)
    .single()
  
  return data
}

/**
 * Get user's teams
 */
export async function getUserTeams(userId: string): Promise<(Team & { role: TeamRole })[]> {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('team_members')
    .select('role, teams(*)')
    .eq('user_id', userId)
  
  if (!data) return []
  
  return data.map(m => ({
    ...(m.teams as unknown as Team),
    role: m.role as TeamRole,
  }))
}

/**
 * Get user's role in a team
 */
export async function getUserTeamRole(userId: string, teamId: string): Promise<TeamRole | null> {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('team_members')
    .select('role')
    .eq('user_id', userId)
    .eq('team_id', teamId)
    .single()
  
  return data?.role as TeamRole | null
}

// ============================================
// Member Operations
// ============================================

/**
 * Get team members
 */
export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('team_members')
    .select('*, users(id, name, email)')
    .eq('team_id', teamId)
    .order('joined_at', { ascending: true })
  
  return (data || []).map(m => ({
    ...m,
    user: m.users as unknown as TeamMember['user'],
  }))
}

/**
 * Update member role
 */
export async function updateMemberRole(
  teamId: string,
  userId: string,
  newRole: TeamRole,
  actorRole: TeamRole
): Promise<boolean> {
  // Can't change owner
  if (newRole === 'owner') return false
  
  // Check permission
  if (!canManageRole(actorRole, newRole)) return false
  
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('team_members')
    .update({ role: newRole })
    .eq('team_id', teamId)
    .eq('user_id', userId)
    .neq('role', 'owner') // Can't update owner
  
  return !error
}

/**
 * Remove member from team
 */
export async function removeMember(
  teamId: string,
  userId: string
): Promise<boolean> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('team_id', teamId)
    .eq('user_id', userId)
    .neq('role', 'owner') // Can't remove owner
  
  return !error
}

// ============================================
// Invitation Operations
// ============================================

/**
 * Create team invitation
 */
export async function createInvite(
  teamId: string,
  email: string,
  role: TeamRole,
  invitedBy: string
): Promise<TeamInvite | null> {
  const supabase = await createClient()
  
  // Check if already a member
  const { data: users } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()
  
  if (users) {
    const existingMember = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', teamId)
      .eq('user_id', users.id)
      .single()
    
    if (existingMember.data) {
      return null // Already a member
    }
  }
  
  // Check for existing pending invite
  const { data: existingInvite } = await supabase
    .from('team_invites')
    .select('id')
    .eq('team_id', teamId)
    .eq('email', email)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .single()
  
  if (existingInvite) {
    return null // Pending invite exists
  }
  
  // Generate token
  const token = crypto.randomBytes(32).toString('hex')
  
  // Create invite (expires in 7 days)
  const { data: invite, error } = await supabase
    .from('team_invites')
    .insert({
      team_id: teamId,
      email,
      role,
      token,
      invited_by: invitedBy,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single()
  
  if (error || !invite) {
    console.error('[Teams] Error creating invite:', error)
    return null
  }
  
  // Get team and inviter info for email
  const { data: team } = await supabase
    .from('teams')
    .select('name')
    .eq('id', teamId)
    .single()
  
  const { data: inviter } = await supabase
    .from('users')
    .select('name')
    .eq('id', invitedBy)
    .single()
  
  // Send invitation email
  if (team && inviter) {
    await sendTeamInviteEmail(
      email,
      team.name,
      inviter.name || 'A team member',
      role,
      token
    )
  }
  
  return invite
}

/**
 * Accept team invitation
 */
export async function acceptInvite(token: string, userId: string): Promise<boolean> {
  const supabase = await createClient()
  
  // Find and validate invite
  const { data: invite } = await supabase
    .from('team_invites')
    .select('*')
    .eq('token', token)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .single()
  
  if (!invite) {
    return false // Invalid or expired
  }
  
  // Add as member
  const { error: memberError } = await supabase
    .from('team_members')
    .insert({
      team_id: invite.team_id,
      user_id: userId,
      role: invite.role,
    })
  
  if (memberError) {
    console.error('[Teams] Error adding member:', memberError)
    return false
  }
  
  // Mark invite as accepted
  await supabase
    .from('team_invites')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', invite.id)
  
  // Update user's current team
  await supabase
    .from('users')
    .update({ current_team_id: invite.team_id })
    .eq('id', userId)
  
  return true
}

/**
 * Get pending invites for a team
 */
export async function getTeamInvites(teamId: string): Promise<TeamInvite[]> {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('team_invites')
    .select('*')
    .eq('team_id', teamId)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
  
  return data || []
}

/**
 * Cancel invitation
 */
export async function cancelInvite(inviteId: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('team_invites')
    .delete()
    .eq('id', inviteId)
    .is('accepted_at', null)
  
  return !error
}

// ============================================
// Email Template
// ============================================

async function sendTeamInviteEmail(
  email: string,
  teamName: string,
  inviterName: string,
  role: TeamRole,
  token: string
): Promise<void> {
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://call-content.com'}/invite/${token}`
  
  await sendEmail({
    to: email,
    subject: `${inviterName} invited you to join ${teamName} on Call-Content`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
    .invite { background: #f0f9ff; border-radius: 12px; padding: 30px; text-align: center; margin: 20px 0; }
    .team-name { font-size: 24px; font-weight: bold; color: #1e40af; }
    .role { display: inline-block; background: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 20px; font-size: 14px; margin-top: 10px; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Call-Content</div>
    </div>
    
    <h1>You're invited! 🎉</h1>
    
    <p><strong>${inviterName}</strong> has invited you to join their team on Call-Content:</p>
    
    <div class="invite">
      <div class="team-name">${teamName}</div>
      <div class="role">${role.charAt(0).toUpperCase() + role.slice(1)}</div>
    </div>
    
    <p>As a team ${role}, you'll be able to collaborate on transcripts and content with your team.</p>
    
    <p style="text-align: center; margin: 30px 0;">
      <a href="${inviteUrl}" class="button">Accept Invitation →</a>
    </p>
    
    <p style="color: #666; font-size: 14px;">This invitation expires in 7 days.</p>
    
    <div class="footer">
      <p>If you weren't expecting this invitation, you can ignore this email.</p>
    </div>
  </div>
</body>
</html>
    `,
  })
}
