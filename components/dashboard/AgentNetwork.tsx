'use client'

import { cn } from '@/lib/utils'
import type { AgentStatus } from '@/types'

const TYPE_COLOR: Record<string, string> = {
  NEWS:       '#3b82f6',
  MACRO:      '#8b5cf6',
  SOCIAL:     '#06b6d4',
  PREDICTION: '#10b981',
  CRYPTO:     '#f59e0b',
  FOREX:      '#f43f5e',
  EQUITY:     '#6366f1',
  RISK:       '#ef4444',
}

// Maps each agent to its live data source
const TYPE_SOURCE: Record<string, string> = {
  NEWS:       'Reuters · Bloomberg · AP',
  MACRO:      'FRED · St Louis Fed',
  SOCIAL:     'X · Reddit · Forums',
  PREDICTION: 'Polymarket · Kalshi',
  CRYPTO:     'CoinGecko · Alt.me',
  FOREX:      'Frankfurter · ECB',
  EQUITY:     'Yahoo Finance',
  RISK:       'Portfolio Monitor',
}

function minsAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'just now'
  if (m === 1) return '1m ago'
  if (m < 60)  return `${m}m ago`
  return `${Math.floor(m / 60)}h ago`
}

export default function AgentNetwork({ agents }: { agents: AgentStatus[] }) {
  const running = agents.filter(a => a.status === 'RUNNING').length

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="label">AI Research Network</div>
        <div className="flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-dot" />
          {running}/{agents.length} running
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {agents.map(agent => {
          const color = TYPE_COLOR[agent.type] ?? '#94a3b8'
          const source = TYPE_SOURCE[agent.type] ?? 'Live data'
          const isRunning = agent.status === 'RUNNING'

          return (
            <div key={agent.id}
              className="flex items-center gap-2.5 p-2.5 rounded-lg transition-all hover:bg-white/3"
              style={{
                background: `${color}08`,
                border: `1px solid ${color}22`,
              }}>
              {/* Running pulse */}
              <div className="w-1.5 h-1.5 rounded-full shrink-0 live-dot"
                style={{ background: color, boxShadow: `0 0 4px ${color}80` }} />

              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-semibold truncate" style={{ color }}>
                  {agent.name.replace(' Intelligence', '').replace(' Agent', '').replace(' & Capital Protection', '')}
                </div>
                <div className="text-[9px] truncate" style={{ color: 'var(--text-dim)' }}>
                  {source}
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-[9px]" style={{ color: 'var(--text-dim)' }}>
                    {minsAgo(agent.lastRun)}
                  </span>
                  <span className="text-[9px] font-semibold"
                    style={{ color: agent.confidence >= 8 ? 'var(--emerald)' : agent.confidence >= 7 ? 'var(--amber)' : 'var(--red)' }}>
                    {agent.confidence.toFixed(1)}/10
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
