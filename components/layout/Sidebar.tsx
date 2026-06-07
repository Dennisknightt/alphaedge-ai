'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Zap, TrendingUp, Bitcoin, DollarSign, BarChart2,
  Briefcase, FileText, Settings, Shield, Cpu, Activity,
  ChevronLeft, ChevronRight, Search, Menu
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useApp } from '@/lib/context'

const navSections = [
  {
    label: 'Core',
    items: [
      { href: '/',             label: 'Dashboard',          icon: LayoutDashboard },
      { href: '/opportunities',label: 'Opportunities',      icon: Zap },
    ],
  },
  {
    label: 'Markets',
    items: [
      { href: '/markets/prediction', label: 'Prediction',   icon: TrendingUp },
      { href: '/markets/crypto',     label: 'Crypto',       icon: Bitcoin },
      { href: '/markets/forex',      label: 'Forex',        icon: DollarSign },
      { href: '/markets/equities',   label: 'Equities',     icon: BarChart2 },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { href: '/research',    label: 'Agents',              icon: Cpu },
      { href: '/briefing',    label: 'Reports',             icon: FileText },
    ],
  },
  {
    label: 'Portfolio',
    items: [
      { href: '/portfolio',   label: 'Portfolio',           icon: Briefcase },
      { href: '/risk',        label: 'Risk Center',         icon: Shield },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/settings',    label: 'Settings',            icon: Settings },
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
      style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border)' }}
    >
      {/* Logo + toggle */}
      <div className="flex items-center justify-between px-3 py-3.5"
        style={{ borderBottom: '1px solid var(--border)', minHeight: '52px' }}>
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)' }}>
              <Activity size={14} className="text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white leading-tight truncate">AlphaEdge</div>
              <div className="text-[9px] font-bold tracking-widest" style={{ color: 'var(--accent)' }}>AI · INSTITUTIONAL</div>
            </div>
          </div>
        )}
        {sidebarCollapsed && (
          <div className="w-7 h-7 rounded-lg flex items-center justify-center mx-auto"
            style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)' }}>
            <Activity size={14} className="text-white" />
          </div>
        )}
        {!sidebarCollapsed && (
          <button onClick={toggleSidebar}
            className="p-1.5 rounded-md hover:bg-white/5 transition-colors shrink-0"
            style={{ color: 'var(--text-muted)' }}>
            <ChevronLeft size={14} />
          </button>
        )}
      </div>

      {/* Search shortcut */}
      {!sidebarCollapsed ? (
        <button onClick={() => setSearchOpen(true)}
          className="mx-2 mt-2 flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-all"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          <Search size={12} />
          <span className="flex-1 text-left">Search...</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded"
            style={{ background: 'rgba(255,255,255,0.07)', color: 'var(--text-dim)' }}>⌘K</span>
        </button>
      ) : (
        <button onClick={() => setSearchOpen(true)}
          className="mx-auto mt-2 p-2 rounded-md hover:bg-white/5 transition-colors"
          style={{ color: 'var(--text-muted)' }}
          data-tooltip="Search (⌘K)">
          <Search size={15} />
        </button>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
        {navSections.map(section => (
          <div key={section.label}>
            {!sidebarCollapsed && (
              <div className="px-2 mb-1 label">{section.label}</div>
            )}
            <div className="space-y-0.5">
              {section.items.map(item => {
                const active = pathname === item.href
                return (
                  <Link key={item.href} href={item.href}
                    className={cn('nav-item', active && 'active')}
                    data-tooltip={sidebarCollapsed ? item.label : undefined}>
                    <item.icon size={15} className="nav-icon shrink-0" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Expand button when collapsed */}
      {sidebarCollapsed && (
        <button onClick={toggleSidebar}
          className="mx-auto mb-3 p-2 rounded-md hover:bg-white/5 transition-colors"
          style={{ color: 'var(--text-muted)' }}>
          <ChevronRight size={14} />
        </button>
      )}

      {/* Version */}
      {!sidebarCollapsed && (
        <div className="px-3 py-2.5 flex items-center justify-between"
          style={{ borderTop: '1px solid var(--border)' }}>
          <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>v1.0 · Paper Mode</span>
          <span className="badge badge-green">LIVE</span>
        </div>
      )}
    </aside>
  )
}
