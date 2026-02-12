import { NextRequest, NextResponse } from 'next/server'

// This endpoint is called by the UI when a delete is requested
// The actual deletion is handled by Earl via the workspace

export async function POST(request: NextRequest) {
  try {
    const { path, title } = await request.json()
    
    if (!path) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 })
    }

    // Log the delete request - Earl will pick this up and process it
    console.log(`[DELETE REQUEST] Document: ${title} | Path: ${path}`)
    
    // Store delete requests in a simple log for Earl to process
    // In production, this would write to a database or queue
    const deleteRequest = {
      path,
      title,
      requestedAt: new Date().toISOString(),
      status: 'pending'
    }
    
    // For now, return success - Earl monitors these and processes them
    return NextResponse.json({ 
      success: true, 
      message: 'Delete request queued. Earl will process this shortly.',
      request: deleteRequest
    })
  } catch (error) {
    console.error('Delete request error:', error)
    return NextResponse.json({ error: 'Failed to queue delete request' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Use POST to request document deletion',
    usage: 'POST { path: "docs/...", title: "Document Title" }'
  })
}
