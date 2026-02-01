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
    name: 'LAUNCH-READY.md',
    title: '🚀 Launch Ready Summary',
    category: 'Strategy',
    size: '4KB'
  },
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
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">📄 Documents</h1>
          <p className="text-gray-400 text-lg">Earl's autonomous work and resources</p>
        </div>

        {!selectedDoc ? (
          <>
            {/* Category Filter */}
            <div className="mb-8 flex flex-wrap gap-3">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'bg-gray-900 text-gray-300 hover:bg-gray-800 border border-gray-800 hover:border-gray-700'
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
                  className="bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 rounded-xl p-5 text-left transition-all hover:scale-[1.02] hover:shadow-xl"
                >
                  <div className="flex items-start gap-4">
                    <FileText className="w-10 h-10 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">
                        {doc.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded-md font-medium">
                          {doc.category}
                        </span>
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
            <div className="bg-black border border-gray-800 rounded-lg overflow-hidden">
              {/* Header */}
              <div className="bg-black border-b border-gray-800 p-4 sticky top-0 z-10 backdrop-blur-sm bg-black/95">
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
              <div className="p-6 md:p-8 lg:p-12 bg-black min-h-screen">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                  </div>
                ) : (
                  <article className="max-w-4xl mx-auto">
                    <div className="space-y-6">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({ node, inline, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || '')
                            return !inline && match ? (
                              <div className="my-6">
                                <SyntaxHighlighter
                                  style={vscDarkPlus}
                                  language={match[1]}
                                  PreTag="div"
                                  className="rounded-xl border border-gray-800 !text-sm md:!text-base overflow-x-auto"
                                  {...props}
                                >
                                  {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                              </div>
                            ) : (
                              <code className="bg-gray-900 text-blue-400 px-2 py-1 rounded font-mono text-sm">
                                {children}
                              </code>
                            )
                          },
                          table({ children }) {
                            return (
                              <div className="my-8 overflow-x-auto">
                                <table className="min-w-full border-collapse">
                                  {children}
                                </table>
                              </div>
                            )
                          },
                          thead({ children }) {
                            return <thead className="bg-gray-900">{children}</thead>
                          },
                          th({ children }) {
                            return (
                              <th className="border border-gray-800 px-4 py-3 text-left text-white font-semibold">
                                {children}
                              </th>
                            )
                          },
                          td({ children }) {
                            return (
                              <td className="border border-gray-800 px-4 py-3 text-white">
                                {children}
                              </td>
                            )
                          },
                          h1({ children }) {
                            return (
                              <h1 className="text-4xl md:text-5xl font-bold text-white mt-12 mb-6 pb-4 border-b border-gray-800 first:mt-0">
                                {children}
                              </h1>
                            )
                          },
                          h2({ children }) {
                            return (
                              <h2 className="text-3xl md:text-4xl font-bold text-white mt-10 mb-5">
                                {children}
                              </h2>
                            )
                          },
                          h3({ children }) {
                            return (
                              <h3 className="text-2xl md:text-3xl font-semibold text-white mt-8 mb-4">
                                {children}
                              </h3>
                            )
                          },
                          h4({ children }) {
                            return (
                              <h4 className="text-xl md:text-2xl font-semibold text-white mt-6 mb-3">
                                {children}
                              </h4>
                            )
                          },
                          p({ children }) {
                            return (
                              <p className="text-white text-base md:text-lg leading-relaxed mb-5">
                                {children}
                              </p>
                            )
                          },
                          ul({ children }) {
                            return (
                              <ul className="space-y-3 mb-6 pl-6">
                                {children}
                              </ul>
                            )
                          },
                          ol({ children }) {
                            return (
                              <ol className="space-y-3 mb-6 pl-6">
                                {children}
                              </ol>
                            )
                          },
                          li({ children }) {
                            return (
                              <li className="text-white text-base md:text-lg leading-relaxed list-disc">
                                {children}
                              </li>
                            )
                          },
                          a({ href, children }) {
                            return (
                              <a 
                                href={href} 
                                className="text-blue-400 hover:text-blue-300 underline decoration-blue-400/30 hover:decoration-blue-300 underline-offset-2 break-words transition-colors"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {children}
                              </a>
                            )
                          },
                          strong({ children }) {
                            return <strong className="text-white font-bold">{children}</strong>
                          },
                          em({ children }) {
                            return <em className="text-white italic">{children}</em>
                          },
                          blockquote({ children }) {
                            return (
                              <blockquote className="border-l-4 border-blue-500 bg-gray-900/50 pl-6 py-4 my-6 italic">
                                <div className="text-white">
                                  {children}
                                </div>
                              </blockquote>
                            )
                          },
                          hr() {
                            return <hr className="my-10 border-t border-gray-800" />
                          }
                        }}
                      >
                        {content}
                      </ReactMarkdown>
                    </div>
                  </article>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
