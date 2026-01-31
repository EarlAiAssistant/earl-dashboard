import { NextResponse } from 'next/server'
import { checkUsageLimit, incrementUsage } from '@/lib/usage-gating'

export const dynamic = 'force-dynamic'

/**
 * POST /api/transcripts/process
 * Process a transcript and generate content
 * 
 * Body:
 * {
 *   "userId": "uuid",
 *   "transcriptText": "...",
 *   "templates": ["blog_post", "case_study", "social_posts"]
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, transcriptText, templates } = body

    if (!userId || !transcriptText) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, transcriptText' },
        { status: 400 }
      )
    }

    // Check usage limits
    const usageStatus = await checkUsageLimit(userId)

    if (!usageStatus.canProcess) {
      return NextResponse.json(
        {
          error: 'Usage limit exceeded',
          reason: usageStatus.reason,
          usage: {
            used: usageStatus.transcriptsUsed,
            limit: usageStatus.transcriptLimit,
            remaining: usageStatus.remainingTranscripts,
            tier: usageStatus.tier,
            status: usageStatus.status,
          },
        },
        { status: 403 }
      )
    }

    // TODO: Actual transcript processing logic here
    // For now, simulate processing
    const transcriptId = crypto.randomUUID()
    
    // Process the transcript (placeholder)
    await processTranscript(transcriptText, templates)

    // Increment usage counter
    await incrementUsage(userId, transcriptId)

    // Return success with updated usage stats
    return NextResponse.json({
      success: true,
      transcriptId,
      usage: {
        used: usageStatus.transcriptsUsed + 1,
        limit: usageStatus.transcriptLimit,
        remaining: usageStatus.remainingTranscripts - 1,
      },
    })
  } catch (error) {
    console.error('Transcript processing error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to process transcript',
      },
      { status: 500 }
    )
  }
}

async function processTranscript(text: string, templates: string[]) {
  // TODO: Implement actual transcript processing
  // This would call your AI models to generate blog posts, case studies, etc.
  return {
    processed: true,
    templates,
  }
}
