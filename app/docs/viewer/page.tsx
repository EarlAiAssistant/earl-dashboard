'use client'

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { FileText, Loader2, AlertCircle } from 'lucide-react'

interface DocFile {
  name: string
  path: string
  download_url: string
}

export default function DocsViewerPage() {
  const [files, setFiles] = useState<DocFile[]>([])
  const [selectedFile, setSelectedFile] = useState<DocFile | null>(null)
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [loadingContent, setLoadingContent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDocsList()
  }, [])

  const fetchDocsList = async () => {
    try {
      // Fetch list of markdown files from GitHub repo
      const res = await fetch(
        'https://api.github.com/repos/EarlAiAssistant/earl-dashboard-kanban/contents',
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      )

      if (!res.ok) throw new Error('Failed to fetch files')

      const data = await res.json()
      
      // Filter for markdown files and documentation
      const mdFiles = data
        .filter((file: any) => 
          file.name.endsWith('.md') && 
          (file.name.includes('call-content') || 
           file.name.includes('EXECUTIVE') ||
           file.name.includes('STRATEGIC') ||
           file.name.includes('ACTION') ||
           file.name.includes('INTEGRATION') ||
           file.name === 'README.md')
        )
        .map((file: any) => ({
          name: file.name,
          path: file.path,
          download_url: file.download_url,
        }))

      setFiles(mdFiles)
      
      // Auto-select first file
      if (mdFiles.length > 0) {
        fetchFileContent(mdFiles[0])
      }
      
      setLoading(false)
    } catch (err) {
      setError('Failed to load documentation files')
      setLoading(false)
    }
  }

  const fetchFileContent = async (file: DocFile) => {
    setLoadingContent(true)
    setSelectedFile(file)
    
    try {
      const res = await fetch(file.download_url)
      if (!res.ok) throw new Error('Failed to fetch file content')
      
      const text = await res.text()
      setContent(text)
      setLoadingContent(false)
    } catch (err) {
      setError('Failed to load file content')
      setLoadingContent(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  if (error && files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-400">
        <AlertCircle className="w-16 h-16 mb-4" />
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-950">
      {/* Sidebar - File List */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 overflow-y-auto">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-lg font-bold text-white">Documentation</h2>
          <p className="text-xs text-gray-400 mt-1">{files.length} files</p>
        </div>
        
        <nav className="p-2">
          {files.map((file) => (
            <button
              key={file.path}
              onClick={() => fetchFileContent(file)}
              className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-colors flex items-center gap-2 ${
                selectedFile?.path === file.path
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <FileText className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm truncate">{file.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {loadingContent ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : selectedFile ? (
          <article className="max-w-4xl mx-auto p-8">
            <h1 className="text-3xl font-bold text-white mb-6">{selectedFile.name}</h1>
            
            <div className="prose prose-invert prose-blue max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '')
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    )
                  },
                  h1: ({ node, ...props }) => (
                    <h1 className="text-3xl font-bold text-white mt-8 mb-4" {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 className="text-2xl font-bold text-white mt-6 mb-3" {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 className="text-xl font-bold text-white mt-4 mb-2" {...props} />
                  ),
                  p: ({ node, ...props }) => (
                    <p className="text-gray-300 mb-4 leading-relaxed" {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="text-gray-300 mb-4 list-disc pl-6 space-y-2" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="text-gray-300 mb-4 list-decimal pl-6 space-y-2" {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li className="text-gray-300" {...props} />
                  ),
                  a: ({ node, ...props }) => (
                    <a className="text-blue-400 hover:text-blue-300 underline" {...props} />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-400 my-4" {...props} />
                  ),
                  table: ({ node, ...props }) => (
                    <div className="overflow-x-auto my-4">
                      <table className="min-w-full border border-gray-700" {...props} />
                    </div>
                  ),
                  thead: ({ node, ...props }) => (
                    <thead className="bg-gray-800" {...props} />
                  ),
                  th: ({ node, ...props }) => (
                    <th className="border border-gray-700 px-4 py-2 text-left text-gray-200 font-semibold" {...props} />
                  ),
                  td: ({ node, ...props }) => (
                    <td className="border border-gray-700 px-4 py-2 text-gray-300" {...props} />
                  ),
                  hr: ({ node, ...props }) => (
                    <hr className="border-gray-700 my-8" {...props} />
                  ),
                  strong: ({ node, ...props }) => (
                    <strong className="text-white font-bold" {...props} />
                  ),
                  em: ({ node, ...props }) => (
                    <em className="text-gray-200 italic" {...props} />
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          </article>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <FileText className="w-16 h-16 mb-4" />
            <p>Select a file to view</p>
          </div>
        )}
      </main>
    </div>
  )
}
