import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { AppProvider } from '@/lib/context'
import Sidebar from '@/components/layout/Sidebar'
import SearchModal from '@/components/layout/SearchModal'
import NotificationCenter from '@/components/layout/NotificationCenter'
import AICopilot from '@/components/layout/AICopilot'
import AppShell from '@/components/layout/AppShell'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AlphaEdge AI — Institutional Market Intelligence',
  description: 'Institutional-grade autonomous market intelligence. Capital preservation first.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AppProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <AppShell>{children}</AppShell>
          </div>
          <SearchModal />
          <NotificationCenter />
          <AICopilot />
        </AppProvider>
      </body>
    </html>
  )
}
