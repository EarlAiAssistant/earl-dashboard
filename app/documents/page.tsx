'use client'

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { FileText, Loader2, X, ChevronLeft } from 'lucide-react'

interface DocumentInfo {
  name: string
  title: string
  category: string
  size: string
}

const DOCUMENTS: DocumentInfo[] = [
  {
    name: 'call-content-pricing-page.md',
    title: 'Pricing Page Copy (Call-Content)',
    category: 'Marketing',
    size: '12KB'
  },
  {
    name: 'call-content-demo-transcripts.md',
    title: 'Demo Transcript Library',
    category: 'Product',
    size: '23KB'
  },
  {
    name: 'call-content-email-sequences.md',
    title: 'Email Automation Sequences',
    category: 'Marketing',
    size: '17KB'
  },
  {
    name: 'call-content-ACTION-PLAN.md',
    title: '90-Day Launch Action Plan',
    category: 'Strategy',
    size: '17KB'
  },
  {
    name: 'call-content-STRATEGIC-ANALYSIS.md',
    title: 'Strategic Analysis (18k words)',
    category: 'Strategy',
    size: '29KB'
  },
  {
    name: 'call-content-EXECUTIVE-SUMMARY.md',
    title: 'Executive Summary',
    category: 'Strategy',
    size: '10KB'
  },
  {
    name: 'call-content-INTEGRATION-GUIDE.md',
    title: 'Stripe Integration Guide',
    category: 'Technical',
    size: '10KB'
  },
  {
    name: 'michigan-up-land-research.md',
    title: 'Michigan UP Land Research',
    category: 'Finance',
    size: '5KB'
  },
  {
    name: 'drew-income-acceleration-ideas.md',
    title: 'Income Acceleration Ideas',
    category: 'Finance',
    size: '8KB'
  },
  {
    name: 'tile-table-instructions.md',
    title: 'Tile Table Building Instructions',
    category: 'DIY',
    size: '5KB'
  },
  {
    name: 'pricing-strategy-research.md',
    title: 'Pricing Strategy Research',
    category: 'Strategy',
    size: '24KB'
  },
  {
    name: 'DASHBOARD-USER-GUIDE.md',
    title: 'Dashboard User Guide',
    category: 'Documentation',
    size: '7KB'
  }
]

const CATEGORIES = ['All', 'Marketing', 'Product', 'Strategy', 'Technical', 'Finance', 'DIY', 'Documentation']

export default function DocumentsPage() {
  const [documents] = useState<DocumentInfo[]>(DOCUMENTS)
  const [selectedDoc, setSelectedDoc] = useState<DocumentInfo | null>(null)
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('All')

  const fetchDocument = async (doc: DocumentInfo) => {
    setLoading(true)
    setSelectedDoc(doc)
    
    try {
      const response = await fetch(`/${doc.name}`)
      if (!response.ok) throw new Error('Failed to fetch document')
      const text = await response.text()
      setContent(text)
    } catch (error) {
      console.error('Error fetching document:', error)
      setContent('# Error\n\nFailed to load document.')
    } finally {
      setLoading(false)
    }
  }

  const filteredDocs = selectedCategory === 'All' 
    ? documents 
    : documents.filter(d => d.category === selectedCategory)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">📄 Documents</h1>
          <p className="text-gray-400">Earl's autonomous work and resources</p>
        </div>

        {!selectedDoc ? (
          <>
            {/* Category Filter */}
            <div className="mb-6 flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Document Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocs.map((doc) => (
                <button
                  key={doc.name}
                  onClick={() => fetchDocument(doc)}
                  className="bg-gray-800 hover:bg-gray-750 border border-gray-700 rounded-lg p-4 text-left transition-all hover:scale-105 hover:shadow-lg"
                >
                  <div className="flex items-start gap-3">
                    <FileText className="w-8 h-8 text-blue-400 flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium mb-1 line-clamp-2">
                        {doc.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-400">{doc.category}</span>
                        <span className="text-gray-600">•</span>
                        <span className="text-gray-500">{doc.size}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {filteredDocs.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                No documents in this category
              </div>
            )}
          </>
        ) : (
          <>
            {/* Document Viewer - Mobile Friendly */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
              {/* Header */}
              <div className="bg-gray-900 border-b border-gray-700 p-4 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setSelectedDoc(null)
                      setContent('')
                    }}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-400" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-white truncate">
                      {selectedDoc.title}
                    </h2>
                    <p className="text-sm text-gray-400">
                      {selectedDoc.category} • {selectedDoc.size}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedDoc(null)
                      setContent('')
                    }}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors lg:hidden"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 md:p-6 lg:p-8 bg-gray-900">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  </div>
                ) : (
                  <div className="max-w-4xl mx-auto">
                    <div className="prose prose-invert prose-lg max-w-none
                      prose-headings:text-white prose-headings:font-bold
                      prose-p:text-gray-200 prose-p:text-base prose-p:leading-relaxed
                      prose-li:text-gray-200 prose-li:text-base prose-li:leading-relaxed
                      prose-strong:text-white prose-strong:font-semibold
                      prose-a:text-blue-400 prose-a:no-underline hover:prose-a:text-blue-300
                      prose-code:text-blue-300 prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                      prose-pre:bg-gray-950 prose-pre:border prose-pre:border-gray-700
                      prose-blockquote:border-l-blue-500 prose-blockquote:text-gray-300
                      prose-th:text-white prose-th:bg-gray-800
                      prose-td:text-gray-200 prose-td:border-gray-700
                      prose-hr:border-gray-700">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({ node, inline, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || '')
                            return !inline && match ? (
                              <SyntaxHighlighter
                                style={vscDarkPlus}
                                language={match[1]}
                                PreTag="div"
                                className="rounded-lg !text-sm md:!text-base"
                                {...props}
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            ) : (
                              <code {...props}>
                                {children}
                              </code>
                            )
                          },
                          table({ children }) {
                            return (
                              <div className="overflow-x-auto -mx-4 sm:mx-0 my-6">
                                <table className="min-w-full border border-gray-700 rounded-lg">{children}</table>
                              </div>
                            )
                          },
                          h1({ children }) {
                            return <h1 className="text-3xl md:text-4xl mt-8 mb-4">{children}</h1>
                          },
                          h2({ children }) {
                            return <h2 className="text-2xl md:text-3xl mt-6 mb-3">{children}</h2>
                          },
                          h3({ children }) {
                            return <h3 className="text-xl md:text-2xl mt-5 mb-2">{children}</h3>
                          },
                          h4({ children }) {
                            return <h4 className="text-lg md:text-xl mt-4 mb-2">{children}</h4>
                          },
                          p({ children }) {
                            return <p className="text-base md:text-lg mb-4 leading-relaxed">{children}</p>
                          },
                          ul({ children }) {
                            return <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>
                          },
                          ol({ children }) {
                            return <ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>
                          },
                          li({ children }) {
                            return <li className="text-base md:text-lg leading-relaxed ml-4">{children}</li>
                          },
                          a({ href, children }) {
                            return (
                              <a 
                                href={href} 
                                className="text-blue-400 hover:text-blue-300 hover:underline break-words"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {children}
                              </a>
                            )
                          },
                          blockquote({ children }) {
                            return (
                              <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-300 my-4">
                                {children}
                              </blockquote>
                            )
                          },
                          hr() {
                            return <hr className="my-8 border-gray-700" />
                          }
                        }}
                      >
                        {content}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
