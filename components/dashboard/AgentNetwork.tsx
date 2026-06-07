'use client'

import { Cpu, Circle, AlertCircle, Pause, CheckCircle2 } from 'lucide-react'
import { cn, fmtTime } from '@/lib/utils'
import type { AgentStatus } from '@/types'

interface AgentNetworkProps {
  agents: AgentStatus[]
}

const agentColors: Record<string, string> = {
  NEWS: 'text-blue-400',
  MACRO: 'text-purple-400',
  SOCIAL: 'text-cyan-400',
  PREDICTION: 'text-emerald-400',
  CRYPTO: 'text-amber-400',
  FOREX: 'text-rose-400',
  EQUITY: 'text-indigo-400',
  RISK: 'text-red-400',
}

const statusConfig = {
  RUNNING: { icon: Circle, label: 'Running', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/25', dot: 'bg-emerald-400 pulse-live' },
  IDLE: { icon: Pause, label: 'Idle', color: 'text-slate-400', bg: 'bg-slate-800/30 border-slate-700/30', dot: 'bg-slate-500' },
  ERROR: { icon: AlertCircle, label: 'Error', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/25', dot: 'bg-red-500 pulse-live' },
  PAUSED: { icon: Pause, label: 'Paused', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/25', dot: 'bg-amber-400' },
}

export default function AgentNetwork({ agents }: AgentNetworkProps) {
  const running = agents.filter(a => a.status === 'RUNNING').length

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Cpu size={14} className="text-blue-400" />
          <span className="text-sm font-semibold text-white">AI Research Network</span>
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-live inline-block" />
          {running}/{agents.length} active
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {agents.map(agent => {
          const sc = statusConfig[agent.status]
          const color = agentColors[agent.type] ?? 'text-blue-400'

          return (
            <div key={agent.id}
              className={cn('rounded-lg p-3 border', sc.bg)}>
              <div className="flex items-center justify-between mb-1.5">
                <span className={cn('text-xs font-semibold', color)}>
                  {agent.name.replace(' Intelligence', '').replace(' Agent', '')}
                </span>
                <div className={cn('w-1.5 h-1.5 rounded-full', sc.dot)} />
              </div>
              <div className="text-[10px] space-y-0.5" style={{ color: 'var(--text-muted)' }}>
                <div className="flex justify-between">
                  <span>Status</span>
                  <span className={sc.color}>{sc.label}</span>
                </div>
                <div className="flex justify-between">
                  <span>Confidence</span>
                  <span className={agent.confidence >= 8 ? 'text-emerald-400' : agent.confidence >= 6 ? 'text-amber-400' : 'text-red-400'}>
                    {agent.confidence.toFixed(1)}/10
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Processed</span>
                  <span className="text-slate-400">{agent.itemsProcessed.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
