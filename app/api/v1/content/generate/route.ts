/**
 * Public API: Content Generation
 * 
 * POST /api/v1/content/generate - Generate content from transcript
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { authenticateApiRequest, hasScope } from '@/lib/api-keys'

const VALID_TEMPLATES = [
  'case_study',
  'blog_post',
  'social_media',
  'linkedin_post',
  'twitter_thread',
  'testimonial',
  'email',
  'executive_summary',
  'key_quotes',
  'action_items',
]

/**
 * POST /api/v1/content/generate
 * Generate content from a transcript
 */
export async function POST(request: Request) {
  const auth = await authenticateApiRequest(request)
  
  if (!auth.authenticated) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status, headers: auth.headers }
    )
  }
  
  if (!hasScope(auth.scopes || [], 'content:write')) {
    return NextResponse.json(
      { error: 'Insufficient permissions. Required scope: content:write' },
      { status: 403, headers: auth.headers }
    )
  }
  
  try {
    const body = await request.json()
    
    // Validate transcript_id
    if (!body.transcript_id || typeof body.transcript_id !== 'string') {
      return NextResponse.json(
        { error: 'transcript_id is required' },
        { status: 400, headers: auth.headers }
      )
    }
    
    // Validate template
    if (!body.template || !VALID_TEMPLATES.includes(body.template)) {
      return NextResponse.json(
        { 
          error: `template must be one of: ${VALID_TEMPLATES.join(', ')}` 
        },
        { status: 400, headers: auth.headers }
      )
    }
    
    const supabase = await createClient()
    
    // Verify transcript exists and belongs to user
    const { data: transcript, error: transcriptError } = await supabase
      .from('transcripts')
      .select('id, content, title')
      .eq('id', body.transcript_id)
      .eq('user_id', auth.userId)
      .single()
    
    if (transcriptError || !transcript) {
      return NextResponse.json(
        { error: 'Transcript not found' },
        { status: 404, headers: auth.headers }
      )
    }
    
    // Check usage limits
    const { data: usage } = await supabase
      .from('users')
      .select('monthly_transcript_limit, transcripts_used_this_month, booster_credits')
      .eq('id', auth.userId)
      .single()
    
    if (usage) {
      const effectiveLimit = (usage.monthly_transcript_limit || 0) + (usage.booster_credits || 0)
      if ((usage.transcripts_used_this_month || 0) >= effectiveLimit) {
        return NextResponse.json(
          { error: 'Monthly usage limit exceeded' },
          { status: 429, headers: auth.headers }
        )
      }
    }
    
    // TODO: Integrate with actual AI generation service
    // For now, return a placeholder response
    const generatedContent = {
      id: crypto.randomUUID(),
      transcript_id: body.transcript_id,
      template: body.template,
      title: `${body.template.replace('_', ' ')} - ${transcript.title}`,
      content: `[Generated ${body.template} content would appear here]`,
      word_count: 0,
      created_at: new Date().toISOString(),
    }
    
    // Save to database
    const { data: savedContent, error: saveError } = await supabase
      .from('generated_content')
      .insert({
        user_id: auth.userId,
        transcript_id: body.transcript_id,
        template: body.template,
        title: generatedContent.title,
        content: generatedContent.content,
        word_count: generatedContent.word_count,
      })
      .select('id, transcript_id, template, title, word_count, created_at')
      .single()
    
    if (saveError) {
      // If table doesn't exist, just return the generated content
      console.error('[API] Content save error:', saveError)
    }
    
    return NextResponse.json(
      { data: savedContent || generatedContent },
      { status: 201, headers: auth.headers }
    )
  } catch (error) {
    console.error('[API] Content generate error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: auth.headers }
    )
  }
}
