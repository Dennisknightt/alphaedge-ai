'use client'

import { cn } from '@/lib/utils'
import type { AgentStatus } from '@/types'

const TYPE_COLOR: Record<string, string> = {
  NEWS: '#3b82f6', MACRO: '#8b5cf6', SOCIAL: '#06b6d4',
  PREDICTION: '#10b981', CRYPTO: '#f59e0b', FOREX: '#f43f5e',
  EQUITY: '#6366f1', RISK: '#ef4444',
}

const STATUS_DOT: Record<string, string> = {
  RUNNING: 'bg-emerald-400 live-dot',
  IDLE:    'bg-slate-600',
  ERROR:   'bg-red-400 live-dot',
  PAUSED:  'bg-amber-400',
}

export default function AgentNetwork({ agents }: { agents: AgentStatus[] }) {
  const running = agents.filter(a => a.status === 'RUNNING').length

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="label">AI Research Network</div>
        <div className="flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-dot" />
          {running}/{agents.length} active
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {agents.map(agent => {
          const color = TYPE_COLOR[agent.type] ?? '#94a3b8'
          const isRunning = agent.status === 'RUNNING'
          return (
            <div key={agent.id}
              className="flex items-center gap-2.5 p-2.5 rounded-lg transition-all hover:bg-white/3"
              style={{ background: isRunning ? `${color}0a` : 'rgba(255,255,255,0.02)', border: `1px solid ${isRunning ? `${color}20` : 'var(--border-soft)'}` }}>
              <div className={cn('w-1.5 h-1.5 rounded-full shrink-0', STATUS_DOT[agent.status])} />
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-semibold truncate"
                  style={{ color: isRunning ? color : 'var(--text-secondary)' }}>
                  {agent.name.replace(' Intelligence', '').replace(' Agent', '')}
                </div>
                <div className="text-[9px]" style={{ color: 'var(--text-dim)' }}>
                  {agent.confidence.toFixed(1)}/10 · {agent.itemsProcessed.toLocaleString()} items
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
