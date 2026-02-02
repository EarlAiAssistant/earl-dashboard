import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

/**
 * Tasks API for Earl assistant
 * 
 * GET  /api/tasks - List all tasks
 * POST /api/tasks - Create a new task
 * DELETE /api/tasks?id=xxx - Delete a task
 */

// Verify API key
function verifyApiKey(request: Request): boolean {
  const apiKey = request.headers.get('x-api-key')
  const expectedKey = process.env.EARL_HEARTBEAT_KEY || process.env.OPENCLAW_WEBHOOK_SECRET
  return apiKey === expectedKey
}

export async function GET(request: Request) {
  if (!verifyApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const search = searchParams.get('search')

  let query = supabase.from('tasks').select('*').order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ tasks: data })
}

export async function POST(request: Request) {
  if (!verifyApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const body = await request.json()
  const { title, description, status = 'backlog' } = body

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert({ title, description, status })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ task: data })
}

export async function DELETE(request: Request) {
  if (!verifyApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const search = searchParams.get('search')

  if (!id && !search) {
    return NextResponse.json({ error: 'Either id or search parameter is required' }, { status: 400 })
  }

  if (id) {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true, deleted: id })
  }

  if (search) {
    // Find and delete tasks matching search
    const { data: tasks } = await supabase
      .from('tasks')
      .select('id, title')
      .or(`title.ilike.%${search}%,description.ilike.%${search}%`)

    if (!tasks || tasks.length === 0) {
      return NextResponse.json({ error: 'No matching tasks found' }, { status: 404 })
    }

    const ids = tasks.map(t => t.id)
    const { error } = await supabase.from('tasks').delete().in('id', ids)
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, deleted: tasks })
  }
}
