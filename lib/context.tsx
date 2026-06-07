'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface AppContextValue {
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  searchOpen: boolean
  setSearchOpen: (v: boolean) => void
  copilotOpen: boolean
  setCopilotOpen: (v: boolean) => void
  notifOpen: boolean
  setNotifOpen: (v: boolean) => void
  mode: 'beginner' | 'professional' | 'institutional' | 'research'
  setMode: (m: AppContextValue['mode']) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [copilotOpen, setCopilotOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [mode, setMode] = useState<AppContextValue['mode']>('professional')

  const toggleSidebar = useCallback(() => setSidebarCollapsed(c => !c), [])

  return (
    <AppContext.Provider value={{
      sidebarCollapsed, toggleSidebar,
      searchOpen, setSearchOpen,
      copilotOpen, setCopilotOpen,
      notifOpen, setNotifOpen,
      mode, setMode,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}
