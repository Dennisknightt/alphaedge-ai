'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, TrendingUp, Zap, Briefcase, FileText, Shield, Cpu,
         Bitcoin, DollarSign, BarChart2, LayoutDashboard, ArrowRight, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useApp } from '@/lib/context'

const COMMANDS = [
  { id: 'dash',    label: 'Dashboard',             icon: LayoutDashboard, href: '/',                    category: 'Navigation',  keywords: ['home', 'overview'] },
  { id: 'opp',     label: 'Opportunities',          icon: Zap,             href: '/opportunities',       category: 'Navigation',  keywords: ['signals', 'trades', 'edge'] },
  { id: 'pred',    label: 'Prediction Markets',     icon: TrendingUp,      href: '/markets/prediction',  category: 'Markets',     keywords: ['polymarket', 'kalshi'] },
  { id: 'crypto',  label: 'Crypto Markets',         icon: Bitcoin,         href: '/markets/crypto',      category: 'Markets',     keywords: ['bitcoin', 'btc', 'eth', 'solana'] },
  { id: 'forex',   label: 'Forex Markets',          icon: DollarSign,      href: '/markets/forex',       category: 'Markets',     keywords: ['eurusd', 'currency'] },
  { id: 'equity',  label: 'Capital Markets',        icon: BarChart2,       href: '/markets/equities',    category: 'Markets',     keywords: ['stocks', 'equities', 'nvda', 'aapl'] },
  { id: 'port',    label: 'Portfolio',              icon: Briefcase,       href: '/portfolio',           category: 'Portfolio',   keywords: ['positions', 'pnl', 'returns'] },
  { id: 'risk',    label: 'Risk Center',            icon: Shield,          href: '/risk',                category: 'Risk',        keywords: ['limits', 'drawdown', 'protection'] },
  { id: 'brief',   label: 'Daily Briefing',         icon: FileText,        href: '/briefing',            category: 'Reports',     keywords: ['report', 'summary', 'intelligence'] },
  { id: 'agents',  label: 'AI Research Agents',     icon: Cpu,             href: '/research',            category: 'Intelligence',keywords: ['agents', 'research', 'ai', 'news'] },
]

const QUICK_ACTIONS = [
  { label: 'Show high confidence trades',  href: '/opportunities' },
  { label: 'Open risk center',             href: '/risk' },
  { label: 'Generate daily briefing',      href: '/briefing' },
  { label: 'Switch to prediction markets', href: '/markets/prediction' },
  { label: 'View portfolio P&L',           href: '/portfolio' },
  { label: 'Show BTC analysis',            href: '/markets/crypto' },
]

export default function SearchModal() {
  const { searchOpen, setSearchOpen, setCopilotOpen } = useApp()
  const [query, setQuery] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Ctrl+K / Cmd+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
      if (e.key === 'Escape') setSearchOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setSearchOpen])

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery('')
      setActiveIdx(0)
    }
  }, [searchOpen])

  const filtered = query.trim()
    ? COMMANDS.filter(c =>
        c.label.toLowerCase().includes(query.toLowerCase()) ||
        c.keywords.some(k => k.includes(query.toLowerCase()))
      )
    : COMMANDS

  const go = useCallback((href: string) => {
    router.push(href)
    setSearchOpen(false)
  }, [router, setSearchOpen])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!searchOpen) return
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, filtered.length - 1)) }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)) }
      if (e.key === 'Enter') { if (filtered[activeIdx]) go(filtered[activeIdx].href) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [searchOpen, filtered, activeIdx, go])

  if (!searchOpen) return null

  return (
    <>
      <div className="glass-overlay" onClick={() => setSearchOpen(false)} />
      <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-full max-w-xl px-4 scale-in">
        <div className="glass-panel overflow-hidden">

          {/* Input */}
          <div className="flex items-center gap-3 px-4 py-3.5"
            style={{ borderBottom: '1px solid var(--border)' }}>
            <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              ref={inputRef}
              className="cmd-input"
              placeholder="Search markets, signals, reports…"
              value={query}
              onChange={e => { setQuery(e.target.value); setActiveIdx(0) }}
            />
            <kbd className="text-[10px] px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto p-2">
            {!query && (
              <div className="px-2 py-1 mb-1 label">Quick Actions</div>
            )}
            {!query && QUICK_ACTIONS.slice(0, 3).map((a, i) => (
              <button key={i} onClick={() => go(a.href)}
                className="cmd-result w-full text-left">
                <Clock size={13} style={{ color: 'var(--text-muted)' }} />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{a.label}</span>
              </button>
            ))}

            {query && filtered.length === 0 && (
              <div className="py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                No results for &quot;{query}&quot;
              </div>
            )}

            {filtered.length > 0 && (
              <div className="mt-1">
                {!query && <div className="px-2 py-1 mb-1 label">Pages</div>}
                {filtered.map((cmd, i) => (
                  <button key={cmd.id} onClick={() => go(cmd.href)}
                    className={cn('cmd-result w-full text-left', i === activeIdx && 'active')}>
                    <cmd.icon size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white">{cmd.label}</div>
                      <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{cmd.category}</div>
                    </div>
                    <ArrowRight size={12} style={{ color: 'var(--text-dim)' }} />
                  </button>
                ))}
              </div>
            )}

            {/* Ask AI */}
            <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
              <button onClick={() => { setSearchOpen(false); setCopilotOpen(true) }}
                className="cmd-result w-full text-left">
                <div className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                  <span className="text-white text-[10px] font-bold">AI</span>
                </div>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Ask AI Copilot{query ? `: "${query}"` : '…'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
