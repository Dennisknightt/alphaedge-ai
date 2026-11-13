'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Zap, TrendingUp, Bitcoin, DollarSign, BarChart2,
  Briefcase, FileText, Settings, Shield, Cpu, Activity,
  ChevronLeft, ChevronRight, Search,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useApp } from '@/lib/context'

const nav = [
  {
    label: 'Core',
    items: [
      { href: '/',              label: 'Dashboard',    icon: LayoutDashboard },
      { href: '/opportunities', label: 'Opportunities',icon: Zap },
    ],
  },
  {
    label: 'Markets',
    items: [
      { href: '/markets/prediction', label: 'Prediction', icon: TrendingUp },
      { href: '/markets/crypto',     label: 'Crypto',     icon: Bitcoin },
      { href: '/markets/forex',      label: 'Forex',      icon: DollarSign },
      { href: '/markets/equities',   label: 'Equities',   icon: BarChart2 },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { href: '/research', label: 'AI Agents', icon: Cpu },
      { href: '/briefing', label: 'Reports',   icon: FileText },
    ],
  },
  {
    label: 'Portfolio',
    items: [
      { href: '/portfolio', label: 'Portfolio',   icon: Briefcase },
      { href: '/risk',      label: 'Risk Center', icon: Shield },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/settings', label: 'Settings', icon: Settings },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar, setSearchOpen } = useApp()

  return (
    <aside
      className={cn('sidebar fixed left-0 top-0 h-screen z-40 flex flex-col',
        sidebarCollapsed && 'collapsed')}
      style={{
        background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-base) 100%)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center px-3 py-4"
        style={{ borderBottom: '1px solid var(--border)', minHeight: 'var(--header-height)' }}>
        {sidebarCollapsed ? (
          <button onClick={toggleSidebar} className="mx-auto">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #4f8ef7 0%, #7c5df7 100%)', boxShadow: '0 4px 12px rgba(79,142,247,0.35)' }}>
              <Activity size={15} className="text-white" />
            </div>
          </button>
        ) : (
          <>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mr-2.5"
              style={{ background: 'linear-gradient(135deg, #4f8ef7 0%, #7c5df7 100%)', boxShadow: '0 4px 12px rgba(79,142,247,0.35)' }}>
              <Activity size={15} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-bold text-white leading-tight">AlphaEdge</div>
              <div className="text-[9px] font-bold tracking-widest"
                style={{ background: 'linear-gradient(90deg, #4f8ef7, #7c5df7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                AI · INSTITUTIONAL
              </div>
            </div>
            <button onClick={toggleSidebar}
              className="p-1.5 rounded-lg hover:bg-white/5 transition-colors shrink-0"
              style={{ color: 'var(--text-dim)' }}>
              <ChevronLeft size={14} />
            </button>
          </>
        )}
      </div>

      {/* Search */}
      {!sidebarCollapsed ? (
        <button onClick={() => setSearchOpen(true)}
          className="mx-3 mt-3 flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          <Search size={12} />
          <span className="flex-1 text-left text-[12px]">Search…</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded"
            style={{ background: 'rgba(255,255,255,0.07)', color: 'var(--text-dim)' }}>⌘K</span>
        </button>
      ) : (
        <button onClick={() => setSearchOpen(true)}
          className="mx-auto mt-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
          style={{ color: 'var(--text-muted)' }}
          data-tooltip="Search (⌘K)">
          <Search size={15} />
        </button>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-5 scroll-area">
        {nav.map(section => (
          <div key={section.label}>
            {!sidebarCollapsed && (
              <div className="nav-section-label mb-2">{section.label}</div>
            )}
            {sidebarCollapsed && <div className="my-1 mx-2 divider" />}
            <div className="space-y-0.5">
              {section.items.map(item => {
                const active = pathname === item.href
                return (
                  <Link key={item.href} href={item.href}
                    className={cn('nav-item', active && 'active')}
                    data-tooltip={sidebarCollapsed ? item.label : undefined}>
                    <item.icon size={15} className="nav-icon shrink-0" />
                    {!sidebarCollapsed && <span className="text-[12.5px]">{item.label}</span>}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Expand (collapsed state) */}
      {sidebarCollapsed && (
        <button onClick={toggleSidebar}
          className="mx-auto mb-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
          style={{ color: 'var(--text-dim)' }}>
          <ChevronRight size={14} />
        </button>
      )}

      {/* Footer status */}
      {!sidebarCollapsed && (
        <div className="px-3 py-3 flex items-center gap-2"
          style={{ borderTop: '1px solid var(--border)' }}>
          <div className="w-1.5 h-1.5 rounded-full live-dot" style={{ background: 'var(--emerald)' }} />
          <span className="text-[10px] flex-1" style={{ color: 'var(--text-dim)' }}>All systems live</span>
          <span className="badge badge-green text-[9px]">v1.0</span>
        </div>
      )}
    </aside>
  )
}
