import { NextResponse } from 'next/server'
import { AssemblyAI } from 'assemblyai'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes max

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY!,
})

/**
 * POST /api/transcribe
 * Upload audio/video file and get transcription
 * 
 * Supports: MP3, MP4, WAV, M4A, FLAC, OGG, WEBM
 * 
 * Body (multipart/form-data):
 * - file: Audio/video file (max 500MB)
 * - language: Optional language code (default: en)
 * - speaker_labels: Optional boolean for speaker diarization
 * 
 * Returns:
 * - transcriptId: AssemblyAI transcript ID
 * - status: queued | processing | completed | error
 * - text: Transcription text (when completed)
 * - duration: Audio duration in seconds
 * - cost: Estimated cost in USD
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const language = (formData.get('language') as string) || 'en'
    const speaker_labels = formData.get('speaker_labels') === 'true'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload file to AssemblyAI
    const uploadUrl = await client.files.upload(buffer)

    // Start transcription
    const transcript = await client.transcripts.transcribe({
      audio: uploadUrl,
      language_code: language as any,
      speaker_labels,
    })

    // Calculate cost (AssemblyAI charges $0.00025/second)
    const durationSeconds = transcript.audio_duration || 0
    const baseCost = (durationSeconds * 0.00025)
    const speakerCost = speaker_labels ? (durationSeconds * 0.00010) : 0 // Speaker diarization adds 40% cost
    const totalCost = baseCost + speakerCost

    return NextResponse.json({
      transcriptId: transcript.id,
      status: transcript.status,
      text: transcript.text || null,
      duration: durationSeconds,
      cost: Number(totalCost.toFixed(4)),
      language: transcript.language_code,
      speakerLabels: speaker_labels,
    })
  } catch (error) {
    console.error('Transcription error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Transcription failed',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/transcribe?id=<transcript_id>
 * Poll transcription status
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const transcriptId = searchParams.get('id')

  if (!transcriptId) {
    return NextResponse.json(
      { error: 'Missing transcript ID' },
      { status: 400 }
    )
  }

  try {
    const transcript = await client.transcripts.get(transcriptId)

    return NextResponse.json({
      transcriptId: transcript.id,
      status: transcript.status,
      text: transcript.text || null,
      duration: transcript.audio_duration || 0,
      language: transcript.language_code,
      utterances: transcript.utterances || [], // Speaker-separated segments
      error: transcript.error,
    })
  } catch (error) {
    console.error('Error fetching transcript:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch transcript',
      },
      { status: 500 }
    )
  }
}
