import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { promises as fs } from 'fs'
import path from 'path'

export const metadata: Metadata = {
  title: 'Privacy Policy | Call-Content',
  description: 'Privacy Policy for Call-Content - how we collect, use, and protect your data.',
}

async function getPrivacyContent() {
  const filePath = path.join(process.cwd(), 'legal', 'privacy-policy.md')
  const content = await fs.readFile(filePath, 'utf-8')
  return content
}

function MarkdownContent({ content }: { content: string }) {
  // Simple markdown-to-HTML conversion for legal docs
  const html = content
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-6 text-white">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mt-10 mb-4 text-white">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-medium mt-8 mb-3 text-gray-200">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
    .replace(/^- (.*$)/gim, '<li class="ml-4 mb-1 text-gray-300">• $1</li>')
    .replace(/^---$/gim, '<hr class="border-gray-700 my-6" />')
    .replace(/\n\n/g, '</p><p class="mb-4 text-gray-400">')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-400 hover:text-blue-300 underline">$1</a>')

  return (
    <div 
      className="prose prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: `<p class="mb-4 text-gray-400">${html}</p>` }}
    />
  )
}

export default async function PrivacyPage() {
  const content = await getPrivacyContent()

  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 md:p-12">
          <MarkdownContent content={content} />
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>
            Questions about our privacy practices?{' '}
            <Link href="/contact" className="text-blue-400 hover:text-blue-300">
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
