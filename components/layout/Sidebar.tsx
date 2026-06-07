'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, TrendingUp, Bitcoin, DollarSign, BarChart2,
  Briefcase, FileText, Settings, Zap, Shield, Activity,
  ChevronRight, Cpu
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navGroups = [
  {
    label: 'Overview',
    items: [
      { href: '/', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/briefing', label: 'Daily Briefing', icon: FileText },
    ],
  },
  {
    label: 'Markets',
    items: [
      { href: '/markets/prediction', label: 'Prediction Markets', icon: TrendingUp },
      { href: '/markets/crypto', label: 'Crypto Markets', icon: Bitcoin },
      { href: '/markets/forex', label: 'Forex Markets', icon: DollarSign },
      { href: '/markets/equities', label: 'Capital Markets', icon: BarChart2 },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { href: '/opportunities', label: 'Opportunities', icon: Zap },
      { href: '/research', label: 'Research Agents', icon: Cpu },
    ],
  },
  {
    label: 'Portfolio',
    items: [
      { href: '/portfolio', label: 'Portfolio', icon: Briefcase },
      { href: '/risk', label: 'Risk Management', icon: Shield },
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

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 flex flex-col z-40"
      style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border)' }}>

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
          <Activity size={16} className="text-white" />
        </div>
        <div>
          <div className="text-sm font-bold text-white leading-tight">AlphaEdge</div>
          <div className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: 'var(--accent)' }}>AI</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-5">
        {navGroups.map(group => (
          <div key={group.label}>
            <div className="px-2 mb-1 text-[10px] font-semibold tracking-widest uppercase"
              style={{ color: 'var(--text-muted)' }}>
              {group.label}
            </div>
            <div className="space-y-0.5">
              {group.items.map(item => {
                const active = pathname === item.href
                return (
                  <Link key={item.href} href={item.href}
                    className={cn('nav-item', active && 'active')}>
                    <item.icon size={14} className="shrink-0" />
                    <span className="flex-1 text-xs">{item.label}</span>
                    {active && <ChevronRight size={12} className="opacity-50" />}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Version */}
      <div className="px-4 py-3 border-t text-[10px]"
        style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
        <div className="flex items-center justify-between">
          <span>AlphaEdge AI v1.0</span>
          <span className="badge badge-green">LIVE</span>
        </div>
      </div>
    </aside>
  )
}
