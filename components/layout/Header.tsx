'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Bell, Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { cn, fmtTime } from '@/lib/utils'
import type { SystemState } from '@/types'

interface HeaderProps {
  title: string
  subtitle?: string
  systemState?: SystemState
  onRefresh?: () => void
  isRefreshing?: boolean
}

export default function Header({ title, subtitle, systemState, onRefresh, isRefreshing }: HeaderProps) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const status = systemState?.status ?? 'ACTIVE'
  const statusConfig = {
    ACTIVE: { color: 'text-emerald-400', bg: 'badge-green', label: 'SYSTEM ACTIVE', icon: CheckCircle },
    PROTECTION: { color: 'text-red-400', bg: 'badge-red', label: 'PROTECTION MODE', icon: Shield },
    SUSPENDED: { color: 'text-amber-400', bg: 'badge-yellow', label: 'SUSPENDED', icon: AlertTriangle },
    IDLE: { color: 'text-slate-400', bg: 'badge-muted', label: 'IDLE', icon: Clock },
  }[status]

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3"
      style={{ background: 'rgba(2,4,10,0.95)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(8px)' }}>

      {/* Title */}
      <div>
        <h1 className="text-base font-bold text-white">{title}</h1>
        {subtitle && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">

        {/* System status */}
        {systemState && (
          <div className={cn('badge', statusConfig.bg, 'flex items-center gap-1.5')}>
            <statusConfig.icon size={10} />
            {statusConfig.label}
          </div>
        )}

        {/* Mode badge */}
        {systemState && (
          <div className="badge badge-purple">
            {systemState.executionMode} MODE
          </div>
        )}

        {/* Clock */}
        <div className="text-xs font-mono tabular" style={{ color: 'var(--text-secondary)' }}>
          <span style={{ color: 'var(--text-muted)' }}>UTC </span>
          {time.toUTCString().slice(17, 25)}
        </div>

        {/* Refresh */}
        {onRefresh && (
          <button onClick={onRefresh}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
              'hover:bg-blue-500/10 hover:text-blue-400',
              isRefreshing && 'opacity-50 pointer-events-none'
            )}
            style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
            <RefreshCw size={12} className={cn(isRefreshing && 'animate-spin')} />
            {isRefreshing ? 'Scanning…' : 'Refresh'}
          </button>
        )}

        {/* Notifications */}
        <button className="relative p-1.5 rounded-md hover:bg-white/5 transition-colors"
          style={{ color: 'var(--text-muted)' }}>
          <Bell size={15} />
          <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-blue-500" />
        </button>
      </div>
    </header>
  )
}
