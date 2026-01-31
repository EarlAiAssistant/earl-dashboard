import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import MobileNav from '@/components/MobileNav'
import PostHogProvider from '@/components/providers/PostHogProvider'
import { createClient } from '@/lib/supabase/server'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Earl Dashboard - AI Activity Monitor',
  description: 'Track Earl AI assistant tasks and activities in real-time',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isLoginPage = !user

  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <PostHogProvider>
          {isLoginPage ? (
            children
          ) : (
            <div className="flex h-screen bg-gray-950">
              {/* Desktop sidebar - hidden on mobile */}
              <aside className="hidden md:block w-64 flex-shrink-0">
                <Sidebar />
              </aside>
              
              {/* Mobile navigation */}
              <MobileNav />
              
              <main className="flex-1 overflow-auto pt-16 md:pt-0">
                {children}
              </main>
            </div>
          )}
        </PostHogProvider>
      </body>
    </html>
  )
}
