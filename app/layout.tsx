import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'
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
        {isLoginPage ? (
          children
        ) : (
          <div className="flex h-screen bg-gray-950">
            <aside className="w-64 flex-shrink-0">
              <Sidebar />
            </aside>
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </div>
        )}
      </body>
    </html>
  )
}
