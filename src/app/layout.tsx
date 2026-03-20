// ============================================================
// Root layout — wraps all pages with providers and global styles
// ============================================================

import type { Metadata } from 'next';
import { Providers } from './providers';
import '@/src/styles/globals.css';

export const metadata: Metadata = {
  title: 'Earl Dashboard',
  description: 'Task management dashboard — fast, focused, keyboard-first',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
