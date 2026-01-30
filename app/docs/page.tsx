'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Document } from '@/lib/types'
import { formatFileSize, formatDate } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { 
  Upload, 
  File, 
  FileText, 
  Image as ImageIcon, 
  Download, 
  Trash2,
  Loader2,
  X,
  Eye
} from 'lucide-react'

const getFileIcon = (mimeType: string | null) => {
  if (!mimeType) return File
  if (mimeType.startsWith('image/')) return ImageIcon
  if (mimeType.includes('pdf') || mimeType.includes('text') || mimeType.includes('markdown')) return FileText
  return File
}

export default function DocsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null)
  const [docContent, setDocContent] = useState<string>('')
  const [loadingContent, setLoadingContent] = useState(false)
  const supabase = createClient()

  const fetchDocuments = async () => {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('uploaded_at', { ascending: false })

    if (error) {
      console.error('Error fetching documents:', error)
    } else {
      setDocuments(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setUploading(true)

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const filePath = `${Date.now()}-${file.name}`

      try {
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { error: dbError } = await supabase.from('documents').insert({
          filename: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
        })

        if (dbError) throw dbError
      } catch (error) {
        console.error('Error uploading file:', error)
        alert(`Failed to upload ${file.name}`)
      }
    }

    setUploading(false)
    fetchDocuments()
  }

  const handleView = async (doc: Document) => {
    setViewingDoc(doc)
    
    // If it's an image, don't fetch text content
    if (doc.mime_type?.startsWith('image/')) {
      return
    }

    // If it's a markdown or text file, fetch and display
    if (doc.mime_type?.includes('markdown') || doc.mime_type?.includes('text') || doc.filename.endsWith('.md')) {
      setLoadingContent(true)
      try {
        const { data, error } = await supabase.storage
          .from('documents')
          .download(doc.file_path)

        if (error) throw error

        const text = await data.text()
        setDocContent(text)
      } catch (error) {
        console.error('Error loading file:', error)
        setDocContent('Failed to load file content')
      }
      setLoadingContent(false)
    }
  }

  const handleDownload = async (doc: Document) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(doc.file_path)

      if (error) throw error

      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = doc.filename
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading file:', error)
      alert('Failed to download file')
    }
  }

  const handleDelete = async (doc: Document) => {
    if (!confirm(`Delete "${doc.filename}"?`)) return

    try {
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([doc.file_path])

      if (storageError) throw storageError

      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', doc.id)

      if (dbError) throw dbError

      if (viewingDoc?.id === doc.id) {
        setViewingDoc(null)
        setDocContent('')
      }

      fetchDocuments()
    } catch (error) {
      console.error('Error deleting file:', error)
      alert('Failed to delete file')
    }
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files)
    }
  }, [])

  const getFileUrl = (doc: Document) => {
    const { data } = supabase.storage
      .from('documents')
      .getPublicUrl(doc.file_path)
    return data.publicUrl
  }

  return (
    <div className="flex h-screen bg-gray-950">
      {/* Sidebar - File List */}
      <aside className="w-80 bg-gray-900 border-r border-gray-800 overflow-y-auto flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-lg font-bold text-white mb-3">Documents</h2>
          
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors mb-3 ${
              dragActive
                ? 'border-blue-500 bg-blue-900/20'
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-400 mb-2">Drop files or</p>
            <label className="inline-block">
              <input
                type="file"
                multiple
                onChange={(e) => handleUpload(e.target.files)}
                className="hidden"
                disabled={uploading}
              />
              <span className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded cursor-pointer inline-block transition-colors">
                {uploading ? 'Uploading...' : 'Choose Files'}
              </span>
            </label>
          </div>
        </div>

        {/* File List */}
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              <File className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No documents yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {documents.map((doc) => {
                const Icon = getFileIcon(doc.mime_type)
                const isActive = viewingDoc?.id === doc.id
                return (
                  <div
                    key={doc.id}
                    className={`p-2 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer ${
                      isActive ? 'bg-blue-900/50 border border-blue-700' : ''
                    }`}
                    onClick={() => handleView(doc)}
                  >
                    <div className="flex items-start gap-2">
                      <Icon className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm text-white truncate font-medium">{doc.filename}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                          <span>{doc.file_size ? formatFileSize(doc.file_size) : '?'}</span>
                          <span>•</span>
                          <span>{formatDate(doc.uploaded_at)}</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDownload(doc)
                          }}
                          className="p-1 hover:bg-gray-700 rounded transition-colors"
                        >
                          <Download className="w-3 h-3 text-gray-400" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(doc)
                          }}
                          className="p-1 hover:bg-red-900/50 rounded transition-colors"
                        >
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </aside>

      {/* Main Viewer Area */}
      <main className="flex-1 overflow-y-auto">
        {loadingContent ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : viewingDoc ? (
          <article className="max-w-4xl mx-auto p-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">{viewingDoc.filename}</h1>
              <div className="text-sm text-gray-400">
                {viewingDoc.file_size && <span>{formatFileSize(viewingDoc.file_size)} • </span>}
                <span>Uploaded {formatDate(viewingDoc.uploaded_at)}</span>
              </div>
            </div>

            {/* Image viewer */}
            {viewingDoc.mime_type?.startsWith('image/') && (
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <img 
                  src={getFileUrl(viewingDoc)} 
                  alt={viewingDoc.filename}
                  className="max-w-full h-auto rounded"
                />
              </div>
            )}

            {/* Markdown viewer */}
            {(viewingDoc.mime_type?.includes('markdown') || 
              viewingDoc.mime_type?.includes('text') || 
              viewingDoc.filename.endsWith('.md')) && (
              <div className="prose prose-invert prose-blue max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code(props) {
                      const { children, className, node, ...rest } = props
                      const match = /language-(\w+)/.exec(className || '')
                      return match ? (
                        <SyntaxHighlighter
                          style={vscDarkPlus}
                          language={match[1]}
                          PreTag="div"
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...rest}>
                          {children}
                        </code>
                      )
                    },
                  }}
                >
                  {docContent}
                </ReactMarkdown>
              </div>
            )}

            {/* Download button for other files */}
            {!viewingDoc.mime_type?.startsWith('image/') &&
             !viewingDoc.mime_type?.includes('markdown') &&
             !viewingDoc.mime_type?.includes('text') &&
             !viewingDoc.filename.endsWith('.md') && (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">Preview not available for this file type</p>
                <button
                  onClick={() => handleDownload(viewingDoc)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors inline-flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download File
                </button>
              </div>
            )}
          </article>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Eye className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg">Select a document to view</p>
            <p className="text-sm mt-2">Upload markdown, images, PDFs, and more</p>
          </div>
        )}
      </main>
    </div>
  )
}
