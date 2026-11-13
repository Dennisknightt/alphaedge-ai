'use client'

import { useState, useEffect } from 'react'
import { Bell, RefreshCw, Search, Menu, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useApp } from '@/lib/context'
import { useCrypto, useMacro } from '@/hooks/useMarkets'

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
  const { setSearchOpen, setNotifOpen, toggleSidebar, mode } = useApp()
  const [time, setTime] = useState(new Date())
  const { data: cryptoData } = useCrypto()
  const { data: macroData } = useMacro()

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const modeConf = MODE_CONFIG[mode]
  const btc = cryptoData?.assets?.find((a: any) => a.symbol === 'BTC')
  const eth = cryptoData?.assets?.find((a: any) => a.symbol === 'ETH')
  const regime = macroData?.regime

  return (
    <header
      className="sticky top-0 z-30 flex flex-col"
      style={{
        background: 'rgba(5,7,15,0.94)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
    >
      {/* Top bar */}
      <div className="flex items-center gap-3 px-5" style={{ height: 'var(--header-height)' }}>

        <button onClick={toggleSidebar}
          className="p-1.5 rounded-lg hover:bg-white/5 transition-colors lg:hidden"
          style={{ color: 'var(--text-muted)' }}>
          <Menu size={16} />
        </button>

        {/* Page title */}
        <div className="flex-1 min-w-0">
          <h1 className="text-[14px] font-semibold text-white leading-tight truncate">{title}</h1>
          {subtitle && (
            <p className="text-[11px] truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
          )}
        </div>

        {/* Live market pulse strip — desktop only */}
        <div className="hidden xl:flex items-center gap-5 mx-4">
          {btc && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold tracking-wider" style={{ color: 'var(--text-dim)' }}>BTC</span>
              <span className="text-[12px] font-bold tabular text-white">${Math.round(btc.price).toLocaleString()}</span>
              <span className={cn('text-[10px] font-semibold tabular', btc.change24h >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                {btc.change24h >= 0 ? '+' : ''}{btc.change24h?.toFixed(1)}%
              </span>
            </div>
          )}
          {eth && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold tracking-wider" style={{ color: 'var(--text-dim)' }}>ETH</span>
              <span className="text-[12px] font-bold tabular text-white">${Math.round(eth.price).toLocaleString()}</span>
              <span className={cn('text-[10px] font-semibold tabular', eth.change24h >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                {eth.change24h >= 0 ? '+' : ''}{eth.change24h?.toFixed(1)}%
              </span>
            </div>
          )}
          {regime && (
            <div className="flex items-center gap-1.5 pl-4"
              style={{ borderLeft: '1px solid var(--border)' }}>
              <span className="text-[10px] font-bold tracking-wider" style={{ color: 'var(--text-dim)' }}>MACRO</span>
              <span className={cn('text-[11px] font-bold',
                regime.riskScore < 50 ? 'text-emerald-400' : regime.riskScore < 70 ? 'text-amber-400' : 'text-red-400')}>
                {regime.label}
              </span>
            </div>
          )}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">

          <button onClick={() => setSearchOpen(true)}
            className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            <Search size={12} />
            <span className="text-[12px]">Search</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-dim)' }}>⌘K</span>
          </button>

          <div className={cn('badge hidden sm:flex', modeConf.color)}>{modeConf.label}</div>

          {/* Clock */}
          <div className="hidden lg:flex flex-col items-end mono tabular"
            style={{ color: 'var(--text-muted)', minWidth: 60 }}>
            <span className="text-[12px] font-semibold">{time.toUTCString().slice(17, 25)}</span>
            <span className="text-[9px]" style={{ color: 'var(--text-dim)' }}>UTC</span>
          </div>

          {onRefresh && (
            <button onClick={onRefresh}
              className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
              style={{ color: isRefreshing ? 'var(--accent)' : 'var(--text-muted)' }}
              data-tooltip="Refresh data">
              <RefreshCw size={14} className={cn(isRefreshing && 'animate-spin')} />
            </button>
          )}

          <button onClick={() => setNotifOpen(true)}
            className="relative p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            style={{ color: 'var(--text-muted)' }}>
            <Bell size={14} />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full live-dot"
              style={{ background: 'var(--accent)' }} />
          </button>
        </div>
      </div>
    </header>
  )
}
