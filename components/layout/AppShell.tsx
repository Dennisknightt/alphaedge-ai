'use client'

import { useApp } from '@/lib/context'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export default function AppShell({ children }: { children: ReactNode }) {
  const { sidebarCollapsed } = useApp()
  return (
    <main className={cn('main-content min-h-screen grid-bg flex flex-col',
      sidebarCollapsed && 'sidebar-collapsed')}>
      {children}
    </main>
  )
}
