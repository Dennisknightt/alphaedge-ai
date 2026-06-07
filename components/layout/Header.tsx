'use client'

import { useState, useEffect } from 'react'
import { Bell, RefreshCw, ChevronDown, Search, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useApp } from '@/lib/context'

interface HeaderProps {
  title: string
  subtitle?: string
  isRefreshing?: boolean
  onRefresh?: () => void
}

const MODE_CONFIG = {
  beginner:      { label: 'Beginner',      color: 'badge-green' },
  professional:  { label: 'Professional',  color: 'badge-blue' },
  institutional: { label: 'Institutional', color: 'badge-purple' },
  research:      { label: 'Research',      color: 'badge-amber' },
}

export default function Header({ title, subtitle, isRefreshing, onRefresh }: HeaderProps) {
  const { setSearchOpen, setNotifOpen, sidebarCollapsed, toggleSidebar, mode } = useApp()
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const modeConf = MODE_CONFIG[mode]

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 px-5"
      style={{
        height: 'var(--header-height)',
        background: 'rgba(2,4,8,0.92)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}>

      {/* Mobile / collapse toggle */}
      <button onClick={toggleSidebar}
        className="p-1.5 rounded-md hover:bg-white/5 transition-colors lg:hidden"
        style={{ color: 'var(--text-muted)' }}>
        <Menu size={16} />
      </button>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-sm font-semibold text-white leading-tight truncate">{title}</h1>
        {subtitle && <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">

        {/* Search */}
        <button onClick={() => setSearchOpen(true)}
          className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-all"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          <Search size={12} />
          <span>Search</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.06)' }}>⌘K</span>
        </button>

        {/* Mode badge */}
        <div className={cn('badge hidden sm:flex', modeConf.color)}>{modeConf.label}</div>

        {/* Clock */}
        <div className="hidden lg:block text-[11px] mono tabular"
          style={{ color: 'var(--text-muted)', minWidth: 64, textAlign: 'right' }}>
          {time.toUTCString().slice(17, 25)}
          <div className="text-[9px]" style={{ color: 'var(--text-dim)' }}>UTC</div>
        </div>

        {/* Refresh */}
        {onRefresh && (
          <button onClick={onRefresh}
            className="p-1.5 rounded-md hover:bg-white/5 transition-colors"
            style={{ color: isRefreshing ? 'var(--accent)' : 'var(--text-muted)' }}
            data-tooltip="Refresh data">
            <RefreshCw size={14} className={cn(isRefreshing && 'animate-spin')} />
          </button>
        )}

        {/* Notifications */}
        <button onClick={() => setNotifOpen(true)}
          className="relative p-1.5 rounded-md hover:bg-white/5 transition-colors"
          style={{ color: 'var(--text-muted)' }}>
          <Bell size={14} />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full live-dot"
            style={{ background: 'var(--accent)' }} />
        </button>
      </div>
    </header>
  )
}
