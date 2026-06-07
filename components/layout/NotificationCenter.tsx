'use client'

import { useApp } from '@/lib/context'
import { X, Zap, AlertTriangle, Info, TrendingUp, Bell, CheckCircle2, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

const NOTIFICATIONS = [
  {
    id: 1, category: 'Opportunities', severity: 'info' as const,
    title: 'New opportunity approved',
    body: 'Fed Rate Cut Q3 — 18% edge, 8.6/10 confidence. Recommend YES at 0.41.',
    time: '2m ago', read: false,
  },
  {
    id: 2, category: 'Opportunities', severity: 'info' as const,
    title: 'Signal approved: Starship Orbital',
    body: '17% edge, 9.1/10 confidence. 91% agent consensus. Recommended YES.',
    time: '8m ago', read: false,
  },
  {
    id: 3, category: 'Risk Alerts', severity: 'warning' as const,
    title: 'BTC funding rate elevated',
    body: 'Funding rate at 0.021% — above normal threshold. New BTC longs should be sized conservatively.',
    time: '24m ago', read: true,
  },
  {
    id: 4, category: 'News Alerts', severity: 'info' as const,
    title: 'Federal Reserve commentary released',
    body: 'Fed Chair remarks suggest data-dependent approach continues. Bullish for rate cut thesis.',
    time: '1h ago', read: true,
  },
  {
    id: 5, category: 'Market Events', severity: 'warning' as const,
    title: 'ECB Decision in 48 hours',
    body: 'European Central Bank rate decision on June 12. Expect EUR/USD volatility.',
    time: '2h ago', read: true,
  },
  {
    id: 6, category: 'AI Recommendations', severity: 'info' as const,
    title: 'Daily briefing generated',
    body: 'Executive intelligence report for today is ready. 2 approved signals, 0 risk flags.',
    time: '3h ago', read: true,
  },
]

const SEVERITY_CONFIG = {
  info:     { icon: Info,          color: 'text-blue-400',    dot: 'bg-blue-400' },
  warning:  { icon: AlertTriangle, color: 'text-amber-400',   dot: 'bg-amber-400' },
  critical: { icon: Shield,        color: 'text-red-400',     dot: 'bg-red-400' },
}

const CATEGORY_ICONS = {
  'Opportunities':     Zap,
  'Risk Alerts':       Shield,
  'News Alerts':       Bell,
  'AI Recommendations':TrendingUp,
  'Market Events':     TrendingUp,
  'Trade Updates':     CheckCircle2,
}

export default function NotificationCenter() {
  const { notifOpen, setNotifOpen } = useApp()
  const unread = NOTIFICATIONS.filter(n => !n.read).length

  if (!notifOpen) return null

  return (
    <>
      <div className="glass-overlay" onClick={() => setNotifOpen(false)} />
      <div className="fixed top-14 right-4 z-[100] w-96 scale-in">
        <div className="card-glass overflow-hidden" style={{ maxHeight: '80vh' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2">
              <Bell size={14} style={{ color: 'var(--accent)' }} />
              <span className="text-sm font-semibold text-white">Notifications</span>
              {unread > 0 && (
                <span className="badge badge-blue">{unread} new</span>
              )}
            </div>
            <button onClick={() => setNotifOpen(false)}
              className="p-1 rounded hover:bg-white/5 transition-colors"
              style={{ color: 'var(--text-muted)' }}>
              <X size={14} />
            </button>
          </div>

          {/* Category filters */}
          <div className="flex gap-1 px-3 py-2 overflow-x-auto"
            style={{ borderBottom: '1px solid var(--border)' }}>
            {['All', 'Opportunities', 'Risk', 'News', 'AI'].map(cat => (
              <button key={cat}
                className="px-2.5 py-1 rounded text-[10px] font-semibold shrink-0 transition-all"
                style={{
                  background: cat === 'All' ? 'var(--accent-soft)' : 'transparent',
                  color: cat === 'All' ? 'var(--accent)' : 'var(--text-muted)',
                }}>
                {cat}
              </button>
            ))}
          </div>

          {/* Notifications list */}
          <div className="overflow-y-auto" style={{ maxHeight: '56vh', borderTop: '1px solid var(--border)' }}>
            {NOTIFICATIONS.map(n => {
              const CatIcon = CATEGORY_ICONS[n.category as keyof typeof CATEGORY_ICONS] ?? Bell
              const sc = SEVERITY_CONFIG[n.severity]
              return (
                <div key={n.id}
                  className={cn('flex gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-white/3',
                    !n.read && 'bg-blue-500/3')}>
                  <div className="mt-0.5 shrink-0">
                    <div className={cn('w-6 h-6 rounded-full flex items-center justify-center',
                      n.severity === 'info' ? 'bg-blue-500/15' :
                      n.severity === 'warning' ? 'bg-amber-500/15' : 'bg-red-500/15')}>
                      <CatIcon size={11} className={sc.color} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <span className={cn('text-xs font-semibold',
                        n.read ? 'text-white/70' : 'text-white')}>
                        {n.title}
                      </span>
                      {!n.read && (
                        <div className={cn('w-1.5 h-1.5 rounded-full shrink-0 mt-1', sc.dot)} />
                      )}
                    </div>
                    <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                      {n.body}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="badge badge-muted text-[9px]">{n.category}</span>
                      <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>{n.time}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 flex items-center justify-between"
            style={{ borderTop: '1px solid var(--border)' }}>
            <button className="text-[11px] font-medium" style={{ color: 'var(--accent)' }}>
              Mark all as read
            </button>
            <button className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              Notification settings
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
