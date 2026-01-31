import { MetadataRoute } from 'next'

/**
 * Generate sitemap.xml for Call-Content
 * Next.js automatically serves this at /sitemap.xml
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://call-content.com'
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/docs`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
  ]

  // Blog posts (from public folder)
  const blogPosts = [
    'how-to-turn-customer-calls-into-content',
    '50-customer-interview-questions',
    'customer-interview-to-case-study',
    'call-content-vs-chatgpt',
    'otter-vs-call-content',
    'repurpose-customer-interviews',
    'customer-interview-best-practices',
    'case-study-examples-teardowns',
    'turn-zoom-calls-into-content',
    'saas-case-study-template',
    'customer-interview-mistakes',
    'recording-customer-calls-guide',
    'customer-interview-content-playbook',
    'customer-testimonial-examples',
    'call-content-vs-jasper',
    'call-content-vs-otter',
    'complete-guide-customer-interview-content-marketing',
    'how-to-write-case-studies-that-convert',
  ].map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: new Date('2026-01-31'),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...blogPosts]
}
