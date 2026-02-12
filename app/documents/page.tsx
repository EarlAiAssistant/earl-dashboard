'use client'

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { FileText, Loader2, X, ChevronLeft, Tag, Trash2 } from 'lucide-react'

interface DocumentInfo {
  name: string
  path: string
  title: string
  category: string
  project: string
  size: string
}

const DOCUMENTS: DocumentInfo[] = [
  // Voxify Launch
  {
    name: 'linkedin-launch-post.md',
    path: 'docs/voxify/launch/linkedin-launch-post.md',
    title: '💼 LinkedIn Launch Post',
    category: 'Launch',
    project: 'Voxify',
    size: '4KB'
  },
  {
    name: 'LAUNCH-PLAN.md',
    path: 'docs/voxify/launch/LAUNCH-PLAN.md',
    title: '🚀 Voxify Launch Plan (30-Day GTM)',
    category: 'Launch',
    project: 'Voxify',
    size: '10KB'
  },
  {
    name: 'PRODUCT-HUNT-ASSETS.md',
    path: 'docs/voxify/launch/PRODUCT-HUNT-ASSETS.md',
    title: '🏆 Product Hunt Assets',
    category: 'Launch',
    project: 'Voxify',
    size: '6KB'
  },
  {
    name: 'SOCIAL-MEDIA-TEMPLATES.md',
    path: 'docs/voxify/launch/SOCIAL-MEDIA-TEMPLATES.md',
    title: '📱 Social Media Templates',
    category: 'Launch',
    project: 'Voxify',
    size: '9KB'
  },
  {
    name: 'PRE_LAUNCH_CHECKLIST.md',
    path: 'docs/voxify/launch/PRE_LAUNCH_CHECKLIST.md',
    title: '✅ Pre-Launch Checklist',
    category: 'Launch',
    project: 'Voxify',
    size: '7KB'
  },
  {
    name: 'call-content-ACTION-PLAN.md',
    path: 'docs/voxify/launch/call-content-ACTION-PLAN.md',
    title: '📋 90-Day Action Plan',
    category: 'Launch',
    project: 'Voxify',
    size: '17KB'
  },
  {
    name: 'call-content-customer-outreach-emails.md',
    path: 'docs/voxify/launch/call-content-customer-outreach-emails.md',
    title: '📧 Customer Outreach Emails',
    category: 'Launch',
    project: 'Voxify',
    size: '15KB'
  },
  {
    name: 'call-content-partnership-outreach.md',
    path: 'docs/voxify/launch/call-content-partnership-outreach.md',
    title: '🤝 Partnership Outreach',
    category: 'Launch',
    project: 'Voxify',
    size: '12KB'
  },
  
  // Voxify Business
  {
    name: 'networking-qa.md',
    path: 'docs/voxify/business/networking-qa.md',
    title: '🎤 Networking Q&A Prep',
    category: 'Business',
    project: 'Voxify',
    size: '3KB'
  },
  {
    name: 'EXPENSES.md',
    path: 'docs/voxify/business/EXPENSES.md',
    title: '💰 Monthly Expenses',
    category: 'Business',
    project: 'Voxify',
    size: '2KB'
  },
  {
    name: 'INFRASTRUCTURE-SCALABILITY.md',
    path: 'docs/voxify/technical/INFRASTRUCTURE-SCALABILITY.md',
    title: '📈 Infrastructure & Scaling Analysis',
    category: 'Technical',
    project: 'Voxify',
    size: '8KB'
  },
  {
    name: 'call-content-STRATEGIC-ANALYSIS.md',
    path: 'docs/voxify/business/call-content-STRATEGIC-ANALYSIS.md',
    title: '📊 Strategic Analysis (18k words)',
    category: 'Business',
    project: 'Voxify',
    size: '29KB'
  },
  {
    name: 'call-content-EXECUTIVE-SUMMARY.md',
    path: 'docs/voxify/business/call-content-EXECUTIVE-SUMMARY.md',
    title: '📝 Executive Summary',
    category: 'Business',
    project: 'Voxify',
    size: '10KB'
  },
  {
    name: 'call-content-competitor-analysis.md',
    path: 'docs/voxify/business/call-content-competitor-analysis.md',
    title: '🔍 Competitor Analysis',
    category: 'Business',
    project: 'Voxify',
    size: '14KB'
  },
  {
    name: 'pricing-strategy-research.md',
    path: 'docs/voxify/business/pricing-strategy-research.md',
    title: '💵 Pricing Strategy Research',
    category: 'Business',
    project: 'Voxify',
    size: '24KB'
  },
  {
    name: 'booster-pack-system-spec.md',
    path: 'docs/voxify/business/booster-pack-system-spec.md',
    title: '📦 Booster Pack System Spec',
    category: 'Technical',
    project: 'Voxify',
    size: '8KB'
  },
  {
    name: 'VOXIFY-COMPETITIVE-BATTLECARDS.md',
    path: 'docs/voxify/business/VOXIFY-COMPETITIVE-BATTLECARDS.md',
    title: '⚔️ Competitive Battle Cards',
    category: 'Sales',
    project: 'Voxify',
    size: '12KB'
  },
  {
    name: 'VOXIFY-PARTNERSHIP-PLAYBOOK.md',
    path: 'docs/voxify/business/VOXIFY-PARTNERSHIP-PLAYBOOK.md',
    title: '🤝 Partnership Playbook',
    category: 'Business',
    project: 'Voxify',
    size: '9KB'
  },
  {
    name: 'CUSTOMER-FEEDBACK-STRATEGY.md',
    path: 'docs/voxify/business/CUSTOMER-FEEDBACK-STRATEGY.md',
    title: '📊 Customer Feedback Strategy',
    category: 'Business',
    project: 'Voxify',
    size: '8KB'
  },
  {
    name: 'customer-health-dashboard-spec.md',
    path: 'docs/voxify/business/customer-health-dashboard-spec.md',
    title: '📊 Customer Health Dashboard',
    category: 'Technical',
    project: 'Voxify',
    size: '7KB'
  },
  
  // Voxify Brand
  {
    name: 'BRAND-IDENTITY.md',
    path: 'docs/voxify/brand/BRAND-IDENTITY.md',
    title: '🎨 Brand Identity Guidelines',
    category: 'Brand',
    project: 'Voxify',
    size: '9KB'
  },
  {
    name: 'NAME-RESEARCH.md',
    path: 'docs/voxify/brand/NAME-RESEARCH.md',
    title: '✨ Name Research (Voxify)',
    category: 'Brand',
    project: 'Voxify',
    size: '6KB'
  },
  {
    name: 'LOGO-CONCEPTS.md',
    path: 'docs/voxify/brand/LOGO-CONCEPTS.md',
    title: '🖼️ Logo Concepts (V→)',
    category: 'Brand',
    project: 'Voxify',
    size: '2KB'
  },
  {
    name: 'DOMAIN-TLD-RESEARCH.md',
    path: 'docs/voxify/brand/DOMAIN-TLD-RESEARCH.md',
    title: '🌐 Domain Strategy',
    category: 'Brand',
    project: 'Voxify',
    size: '5KB'
  },
  
  // Voxify Technical
  {
    name: 'GOOGLE-DOCS-INTEGRATION.md',
    path: 'docs/voxify/technical/GOOGLE-DOCS-INTEGRATION.md',
    title: '📄 Google Docs Integration',
    category: 'Technical',
    project: 'Voxify',
    size: '2KB'
  },
  {
    name: 'call-content-INTEGRATION-GUIDE.md',
    path: 'docs/voxify/technical/call-content-INTEGRATION-GUIDE.md',
    title: '🔌 Stripe Integration Guide',
    category: 'Technical',
    project: 'Voxify',
    size: '10KB'
  },
  {
    name: 'analytics-tracking-plan.md',
    path: 'docs/voxify/technical/analytics-tracking-plan.md',
    title: '📊 Analytics Tracking Plan',
    category: 'Technical',
    project: 'Voxify',
    size: '17KB'
  },
  {
    name: 'call-content-zapier-integration.md',
    path: 'docs/voxify/technical/call-content-zapier-integration.md',
    title: '⚡ Zapier Integration',
    category: 'Technical',
    project: 'Voxify',
    size: '14KB'
  },
  {
    name: 'assemblyai-integration-spec.md',
    path: 'docs/voxify/technical/assemblyai-integration-spec.md',
    title: '🎙️ AssemblyAI Integration',
    category: 'Technical',
    project: 'Voxify',
    size: '20KB'
  },
  
  // Voxify Marketing
  {
    name: 'VOXIFY-MARKETING-ROADMAP.md',
    path: 'docs/voxify/marketing/VOXIFY-MARKETING-ROADMAP.md',
    title: '🗺️ Marketing Roadmap (Trip Meeting)',
    category: 'Marketing',
    project: 'Voxify',
    size: '12KB'
  },
  {
    name: '01-how-to-turn-customer-calls-into-content.md',
    path: 'docs/voxify/marketing/blog-drafts/01-how-to-turn-customer-calls-into-content.md',
    title: '📝 Blog: How to Turn Customer Calls Into Content',
    category: 'Marketing',
    project: 'Voxify',
    size: '8KB'
  },
  {
    name: '02-50-customer-interview-questions.md',
    path: 'docs/voxify/marketing/blog-drafts/02-50-customer-interview-questions.md',
    title: '📝 Blog: 50 Customer Interview Questions',
    category: 'Marketing',
    project: 'Voxify',
    size: '10KB'
  },
  {
    name: '03-voxify-vs-chatgpt.md',
    path: 'docs/voxify/marketing/blog-drafts/03-voxify-vs-chatgpt.md',
    title: '📝 Blog: Voxify vs ChatGPT Comparison',
    category: 'Marketing',
    project: 'Voxify',
    size: '7KB'
  },
  {
    name: 'DISTRIBUTION-CHANNELS.md',
    path: 'docs/voxify/marketing/blog-drafts/DISTRIBUTION-CHANNELS.md',
    title: '📣 Blog Distribution Channels Guide',
    category: 'Marketing',
    project: 'Voxify',
    size: '8KB'
  },
  {
    name: '04-customer-interview-to-case-study.md',
    path: 'docs/voxify/marketing/blog-drafts/04-customer-interview-to-case-study.md',
    title: '📝 Blog: Customer Interview to Case Study',
    category: 'Marketing',
    project: 'Voxify',
    size: '8KB'
  },
  {
    name: '05-recording-customer-calls-guide.md',
    path: 'docs/voxify/marketing/blog-drafts/05-recording-customer-calls-guide.md',
    title: '📝 Blog: Recording Customer Calls Guide',
    category: 'Marketing',
    project: 'Voxify',
    size: '9KB'
  },
  {
    name: '06-customer-interview-mistakes.md',
    path: 'docs/voxify/marketing/blog-drafts/06-customer-interview-mistakes.md',
    title: '📝 Blog: 7 Customer Interview Mistakes',
    category: 'Marketing',
    project: 'Voxify',
    size: '6KB'
  },
  {
    name: '07-repurposing-customer-interviews.md',
    path: 'docs/voxify/marketing/blog-drafts/07-repurposing-customer-interviews.md',
    title: '📝 Blog: Repurposing Customer Interviews',
    category: 'Marketing',
    project: 'Voxify',
    size: '9KB'
  },
  {
    name: '08-zoom-calls-to-content.md',
    path: 'docs/voxify/marketing/blog-drafts/08-zoom-calls-to-content.md',
    title: '📝 Blog: Zoom Calls to Content in 30 Min',
    category: 'Marketing',
    project: 'Voxify',
    size: '8KB'
  },
  {
    name: '09-get-customers-to-agree-to-interviews.md',
    path: 'docs/voxify/marketing/blog-drafts/09-get-customers-to-agree-to-interviews.md',
    title: '📝 Blog: Get Customers to Agree to Interviews',
    category: 'Marketing',
    project: 'Voxify',
    size: '9KB'
  },
  {
    name: '10-case-study-template-framework.md',
    path: 'docs/voxify/marketing/blog-drafts/10-case-study-template-framework.md',
    title: '📝 Blog: Case Study Template Framework',
    category: 'Marketing',
    project: 'Voxify',
    size: '11KB'
  },
  {
    name: 'LINKEDIN-CONTENT-TEMPLATES.md',
    path: 'docs/voxify/marketing/blog-drafts/LINKEDIN-CONTENT-TEMPLATES.md',
    title: '💼 LinkedIn Content Templates (20+)',
    category: 'Marketing',
    project: 'Voxify',
    size: '15KB'
  },
  {
    name: 'TWITTER-THREAD-TEMPLATES.md',
    path: 'docs/voxify/marketing/blog-drafts/TWITTER-THREAD-TEMPLATES.md',
    title: '🐦 Twitter Thread Templates (6)',
    category: 'Marketing',
    project: 'Voxify',
    size: '12KB'
  },
  {
    name: 'COLD-OUTREACH-TEMPLATES.md',
    path: 'docs/voxify/marketing/blog-drafts/COLD-OUTREACH-TEMPLATES.md',
    title: '📧 Cold Outreach Email Templates',
    category: 'Sales',
    project: 'Voxify',
    size: '10KB'
  },
  {
    name: 'VOXIFY-TRIAL-EMAIL-SEQUENCE.md',
    path: 'docs/voxify/marketing/VOXIFY-TRIAL-EMAIL-SEQUENCE.md',
    title: '📧 14-Day Trial Email Sequence',
    category: 'Marketing',
    project: 'Voxify',
    size: '14KB'
  },
  {
    name: 'VOXIFY-FAQ-PAGE-CONTENT.md',
    path: 'docs/voxify/marketing/VOXIFY-FAQ-PAGE-CONTENT.md',
    title: '❓ FAQ Page Content (Ready to Publish)',
    category: 'Marketing',
    project: 'Voxify',
    size: '7KB'
  },
  {
    name: 'VOXIFY-ROI-CALCULATOR-COPY.md',
    path: 'docs/voxify/marketing/VOXIFY-ROI-CALCULATOR-COPY.md',
    title: '🧮 ROI Calculator Copy & Methodology',
    category: 'Marketing',
    project: 'Voxify',
    size: '8KB'
  },
  {
    name: 'VOXIFY-PRODUCT-HUNT-ASSETS.md',
    path: 'docs/voxify/marketing/VOXIFY-PRODUCT-HUNT-ASSETS.md',
    title: '🏆 Product Hunt Launch Kit (Full)',
    category: 'Marketing',
    project: 'Voxify',
    size: '9KB'
  },
  {
    name: 'CONTENT-CREATION-SUMMARY.md',
    path: 'docs/voxify/marketing/CONTENT-CREATION-SUMMARY.md',
    title: '📋 Content Creation Summary & Inventory',
    category: 'Marketing',
    project: 'Voxify',
    size: '5KB'
  },
  {
    name: 'call-content-seo-strategy.md',
    path: 'docs/voxify/marketing/call-content-seo-strategy.md',
    title: '🔍 SEO Strategy',
    category: 'Marketing',
    project: 'Voxify',
    size: '15KB'
  },
  {
    name: 'call-content-email-sequences.md',
    path: 'docs/voxify/marketing/call-content-email-sequences.md',
    title: '📧 Email Sequences',
    category: 'Marketing',
    project: 'Voxify',
    size: '17KB'
  },
  {
    name: 'call-content-demo-transcripts.md',
    path: 'docs/voxify/marketing/call-content-demo-transcripts.md',
    title: '🎙️ Demo Transcript Library',
    category: 'Marketing',
    project: 'Voxify',
    size: '23KB'
  },
  {
    name: 'call-content-getting-started-guide.md',
    path: 'docs/voxify/marketing/call-content-getting-started-guide.md',
    title: '📚 Getting Started Guide',
    category: 'Marketing',
    project: 'Voxify',
    size: '15KB'
  },
  {
    name: 'call-content-privacy-policy.md',
    path: 'docs/voxify/marketing/call-content-privacy-policy.md',
    title: '🔒 Privacy Policy',
    category: 'Legal',
    project: 'Voxify',
    size: '10KB'
  },
  {
    name: 'call-content-terms-of-service.md',
    path: 'docs/voxify/marketing/call-content-terms-of-service.md',
    title: '📜 Terms of Service',
    category: 'Legal',
    project: 'Voxify',
    size: '13KB'
  },
  
  // Setup Guides
  {
    name: 'STRIPE_ENV_SETUP.md',
    path: 'docs/setup/STRIPE_ENV_SETUP.md',
    title: '💳 Stripe Setup',
    category: 'Setup',
    project: 'Infrastructure',
    size: '3KB'
  },
  {
    name: 'STRIPE_CHECKOUT_TESTING.md',
    path: 'docs/setup/STRIPE_CHECKOUT_TESTING.md',
    title: '🧪 Stripe Checkout Testing',
    category: 'Setup',
    project: 'Infrastructure',
    size: '7KB'
  },
  {
    name: 'VERCEL_ENV_SETUP.md',
    path: 'docs/setup/VERCEL_ENV_SETUP.md',
    title: '▲ Vercel Setup',
    category: 'Setup',
    project: 'Infrastructure',
    size: '1KB'
  },
  {
    name: 'POSTHOG_SETUP.md',
    path: 'docs/setup/POSTHOG_SETUP.md',
    title: '📈 PostHog Setup',
    category: 'Setup',
    project: 'Infrastructure',
    size: '6KB'
  },
  {
    name: 'EMAIL_SETUP.md',
    path: 'docs/setup/EMAIL_SETUP.md',
    title: '✉️ Email (Resend) Setup',
    category: 'Setup',
    project: 'Infrastructure',
    size: '6KB'
  },
  {
    name: 'RUN_SQL_MIGRATION_GUIDE.md',
    path: 'docs/setup/RUN_SQL_MIGRATION_GUIDE.md',
    title: '🗄️ SQL Migration Guide',
    category: 'Setup',
    project: 'Infrastructure',
    size: '6KB'
  },
  {
    name: 'ASSEMBLYAI_SETUP.md',
    path: 'docs/setup/ASSEMBLYAI_SETUP.md',
    title: '🎙️ AssemblyAI Setup',
    category: 'Setup',
    project: 'Infrastructure',
    size: '7KB'
  },
  
  // Earl
  {
    name: 'DASHBOARD-USER-GUIDE.md',
    path: 'docs/earl/DASHBOARD-USER-GUIDE.md',
    title: '🤖 Dashboard User Guide',
    category: 'Documentation',
    project: 'Earl',
    size: '7KB'
  },
  {
    name: 'EARL-WORKFLOW.md',
    path: 'docs/earl/EARL-WORKFLOW.md',
    title: '⚙️ Earl Workflow',
    category: 'Documentation',
    project: 'Earl',
    size: '4KB'
  },
  {
    name: 'STATUS_API.md',
    path: 'docs/earl/STATUS_API.md',
    title: '📡 Status API',
    category: 'Technical',
    project: 'Earl',
    size: '2KB'
  },
  
  // Personal
  {
    name: 'drew-income-acceleration-ideas.md',
    path: 'docs/personal/drew-income-acceleration-ideas.md',
    title: '💡 Income Acceleration Ideas',
    category: 'Ideas',
    project: 'Personal',
    size: '8KB'
  },
  {
    name: 'michigan-up-land-research.md',
    path: 'docs/personal/michigan-up-land-research.md',
    title: '🏔️ Michigan UP Land Research',
    category: 'Research',
    project: 'Personal',
    size: '5KB'
  },
  {
    name: 'land-savings-roadmap.md',
    path: 'docs/personal/land-savings-roadmap.md',
    title: '🗺️ Land Savings Roadmap',
    category: 'Finance',
    project: 'Personal',
    size: '9KB'
  },
  {
    name: 'VOXIFY-LLC-SETUP.md',
    path: 'docs/personal/VOXIFY-LLC-SETUP.md',
    title: '🏢 Voxify LLC Setup Guide',
    category: 'Legal',
    project: 'Voxify',
    size: '6KB'
  }
]

const CATEGORIES = ['All', 'Launch', 'Business', 'Brand', 'Technical', 'Marketing', 'Sales', 'Setup', 'Legal', 'Documentation', 'Ideas', 'Research', 'Finance']
const PROJECTS = ['All', 'Voxify', 'Earl', 'Infrastructure', 'Personal']

export default function DocumentsPage() {
  const [documents] = useState<DocumentInfo[]>(DOCUMENTS)
  const [selectedDoc, setSelectedDoc] = useState<DocumentInfo | null>(null)
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedProject, setSelectedProject] = useState('All')
  const [deletedDocs, setDeletedDocs] = useState<Set<string>>(new Set())
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const handleDelete = async (doc: DocumentInfo) => {
    try {
      const response = await fetch('/api/documents/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: doc.path, title: doc.title })
      })
      
      if (response.ok) {
        setDeletedDocs(prev => new Set([...prev, doc.path]))
        setDeleteConfirm(null)
        if (selectedDoc?.path === doc.path) {
          setSelectedDoc(null)
          setContent('')
        }
      }
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  const fetchDocument = async (doc: DocumentInfo) => {
    setLoading(true)
    setSelectedDoc(doc)
    
    try {
      const response = await fetch(`https://raw.githubusercontent.com/EarlAiAssistant/earl-dashboard/main/${doc.path}`)
      if (!response.ok) throw new Error('Failed to fetch document')
      const text = await response.text()
      setContent(text)
    } catch (error) {
      console.error('Error fetching document:', error)
      setContent('# Error\n\nFailed to load document. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const filteredDocs = documents.filter(d => {
    const categoryMatch = selectedCategory === 'All' || d.category === selectedCategory
    const projectMatch = selectedProject === 'All' || d.project === selectedProject
    const notDeleted = !deletedDocs.has(d.path)
    return categoryMatch && projectMatch && notDeleted
  })

  const getProjectColor = (project: string) => {
    const colors: Record<string, string> = {
      'Voxify': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
      'Earl': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'Infrastructure': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'Personal': 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
    return colors[project] || 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Launch': 'bg-green-500/10 text-green-400',
      'Business': 'bg-blue-500/10 text-blue-400',
      'Brand': 'bg-purple-500/10 text-purple-400',
      'Technical': 'bg-orange-500/10 text-orange-400',
      'Marketing': 'bg-pink-500/10 text-pink-400',
      'Sales': 'bg-violet-500/10 text-violet-400',
      'Setup': 'bg-yellow-500/10 text-yellow-400',
      'Legal': 'bg-red-500/10 text-red-400',
      'Documentation': 'bg-cyan-500/10 text-cyan-400',
      'Ideas': 'bg-amber-500/10 text-amber-400',
      'Research': 'bg-indigo-500/10 text-indigo-400',
      'Finance': 'bg-emerald-500/10 text-emerald-400'
    }
    return colors[category] || 'bg-blue-500/10 text-blue-400'
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">📄 Documents</h1>
          <p className="text-gray-400 text-lg">Organized documentation for all projects</p>
        </div>

        {!selectedDoc ? (
          <>
            {/* Project Filter */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400 font-medium">Project:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {PROJECTS.map(proj => (
                  <button
                    key={proj}
                    onClick={() => setSelectedProject(proj)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${
                      selectedProject === proj
                        ? proj === 'All' 
                          ? 'bg-white text-black border-white'
                          : getProjectColor(proj)
                        : 'bg-gray-900 text-gray-400 hover:bg-gray-800 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    {proj}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-400 font-medium">Category:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedCategory === cat
                        ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30'
                        : 'bg-gray-900 text-gray-400 hover:bg-gray-800 border border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Results count */}
            <div className="mb-4 text-sm text-gray-500">
              Showing {filteredDocs.length} document{filteredDocs.length !== 1 ? 's' : ''}
              {selectedProject !== 'All' && ` in ${selectedProject}`}
              {selectedCategory !== 'All' && ` • ${selectedCategory}`}
            </div>

            {/* Document Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocs.map((doc) => (
                <button
                  key={doc.path}
                  onClick={() => fetchDocument(doc)}
                  className="bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 rounded-xl p-5 text-left transition-all hover:scale-[1.02] hover:shadow-xl"
                >
                  <div className="flex items-start gap-4">
                    <FileText className="w-10 h-10 text-teal-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">
                        {doc.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className={`px-2 py-0.5 rounded border text-xs font-medium ${getProjectColor(doc.project)}`}>
                          {doc.project}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(doc.category)}`}>
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
                No documents match your filters
              </div>
            )}
          </>
        ) : (
          <>
            {/* Document Viewer */}
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
                    <div className="flex items-center gap-2 text-sm">
                      <span className={`px-2 py-0.5 rounded border text-xs font-medium ${getProjectColor(selectedDoc.project)}`}>
                        {selectedDoc.project}
                      </span>
                      <span className="text-gray-400">{selectedDoc.category}</span>
                      <span className="text-gray-500">• {selectedDoc.size}</span>
                    </div>
                  </div>
                  {deleteConfirm === selectedDoc.path ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-red-400">Delete?</span>
                      <button
                        onClick={() => handleDelete(selectedDoc)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-sm rounded-lg"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(selectedDoc.path)}
                      className="p-2 hover:bg-red-900/50 rounded-lg transition-colors"
                      title="Delete document"
                    >
                      <Trash2 className="w-5 h-5 text-red-400" />
                    </button>
                  )}
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
              <div className="p-4 md:p-8 lg:p-12 bg-black min-h-screen overflow-x-hidden">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
                  </div>
                ) : (
                  <article className="max-w-4xl mx-auto overflow-hidden">
                    <div className="space-y-6 break-words">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({ node, inline, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || '')
                            return !inline && match ? (
                              <div className="my-6 overflow-x-auto max-w-full">
                                <SyntaxHighlighter
                                  style={vscDarkPlus}
                                  language={match[1]}
                                  PreTag="div"
                                  className="rounded-xl border border-gray-800 !text-xs md:!text-sm"
                                  wrapLongLines={true}
                                  {...props}
                                >
                                  {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                              </div>
                            ) : (
                              <code className="bg-gray-900 text-teal-400 px-1.5 py-0.5 rounded font-mono text-xs md:text-sm break-all">
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
                              <p className="text-white text-base md:text-lg leading-relaxed mb-5 break-words overflow-wrap-anywhere">
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
                              <li className="text-white text-sm md:text-base leading-relaxed list-disc break-words">
                                {children}
                              </li>
                            )
                          },
                          a({ href, children }) {
                            return (
                              <a 
                                href={href} 
                                className="text-teal-400 hover:text-teal-300 underline decoration-teal-400/30 hover:decoration-teal-300 underline-offset-2 break-words transition-colors"
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
                              <blockquote className="border-l-4 border-teal-500 bg-gray-900/50 pl-4 md:pl-6 py-4 my-6 italic overflow-hidden">
                                <div className="text-white break-words text-sm md:text-base">
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
