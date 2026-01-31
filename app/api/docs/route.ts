import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const GITHUB_OWNER = 'EarlAiAssistant'
const GITHUB_REPO = 'earl-dashboard'
const GITHUB_BRANCH = 'main'

interface GitHubFile {
  name: string
  path: string
  type: 'file' | 'dir'
  download_url?: string
}

/**
 * GET /api/docs
 * Fetch markdown files from GitHub repo server-side
 * 
 * Query params:
 * - path: relative path to file (e.g., "call-content-pricing-page.md")
 * - list: if true, returns list of all markdown files
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const path = searchParams.get('path')
  const list = searchParams.get('list')

  try {
    // List all markdown files
    if (list === 'true') {
      const files = await fetchMarkdownFileList()
      return NextResponse.json({ files })
    }

    // Fetch specific file
    if (path) {
      const content = await fetchFileContent(path)
      return NextResponse.json({ content, path })
    }

    return NextResponse.json(
      { error: 'Missing path or list parameter' },
      { status: 400 }
    )
  } catch (error) {
    console.error('GitHub API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch from GitHub' },
      { status: 500 }
    )
  }
}

async function fetchMarkdownFileList(): Promise<string[]> {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/trees/${GITHUB_BRANCH}?recursive=1`
  
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Earl-Dashboard',
    },
    next: { revalidate: 60 }, // Cache for 1 minute
  })

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`)
  }

  const data = await response.json()
  
  // Filter for markdown files
  const mdFiles = data.tree
    .filter((item: any) => item.type === 'blob' && item.path.endsWith('.md'))
    .map((item: any) => item.path)
  
  return mdFiles
}

async function fetchFileContent(path: string): Promise<string> {
  const url = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${path}`
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Earl-Dashboard',
    },
    next: { revalidate: 60 }, // Cache for 1 minute
  })

  if (!response.ok) {
    throw new Error(`File not found: ${path}`)
  }

  return response.text()
}
