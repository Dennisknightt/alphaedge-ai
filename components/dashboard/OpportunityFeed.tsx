'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Shield } from 'lucide-react'
import { cn, fmt, confidenceColor, edgeColor } from '@/lib/utils'
import type { TradeSignal } from '@/types'

const AGENT_KEYS = ['research', 'macro', 'quant', 'technical', 'sentiment', 'risk', 'probability'] as const

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="min-w-0">
      <div className="label mb-0.5">{label}</div>
      <div className={cn('text-[13px] font-bold tabular', color ?? 'text-white')}>{value}</div>
    </div>
  )
}

function SignalCard({ signal, rank }: { signal: TradeSignal; rank: number }) {
  const [expanded, setExpanded] = useState(rank === 1)
  const isLong = signal.direction === 'YES' || signal.direction === 'LONG'
  const approvers = AGENT_KEYS.filter(k => signal.agentConsensus[k].vote === 'APPROVE').length

  return (
    <div className={cn('card overflow-hidden fade-in', rank === 1 && 'border-emerald-500/25')}>
      <button onClick={() => setExpanded(e => !e)}
        className="w-full grid grid-cols-[auto_1fr_repeat(3,minmax(0,auto))_auto] items-center gap-5 px-5 py-4 text-left">
        <div className={cn('text-[11px] font-bold w-6 h-6 rounded-md flex items-center justify-center',
          rank === 1 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/5 text-slate-500')}>
          {rank}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-bold text-white truncate">{signal.asset}</span>
            <span className={cn('badge', isLong ? 'badge-green' : 'badge-red')}>{signal.direction}</span>
          </div>
          <div className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
            {signal.module} · {signal.timeHorizon}
          </div>
        </div>

        <Stat label="Edge" value={`+${(signal.ev * 100).toFixed(0)}%`} color={edgeColor(signal.ev * 100)} />
        <Stat label="R:R" value={`${fmt(signal.rr, 1)}:1`} color="text-blue-400" />
        <Stat label="Confidence" value={fmt(signal.confidence, 1)} color={confidenceColor(signal.confidence)} />

        <div style={{ color: 'var(--text-muted)' }}>
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 pt-1 space-y-4 fade-in" style={{ borderTop: '1px solid var(--border-soft)' }}>
          <div className="grid grid-cols-3 gap-3 pt-4">
            <Stat label="Entry" value={fmt(signal.entryPrice, 3)} />
            <Stat label="Stop loss" value={fmt(signal.stopLoss, 3)} color="text-red-400" />
            <Stat label="Take profit" value={fmt(signal.takeProfit, 3)} color="text-emerald-400" />
          </div>

          <p className="text-[12.5px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {signal.reasoning}
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px]">
            <span style={{ color: 'var(--text-muted)' }}>
              <span className="font-bold text-white">{approvers}/7</span> agents approve
            </span>
            <span style={{ color: 'var(--text-muted)' }}>
              Position size <span className="font-bold text-blue-400">{(signal.positionSize * 100).toFixed(1)}%</span> of capital
            </span>
            <span className={signal.realityCheckPassed ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>
              {signal.realityCheckPassed ? 'Reality check passed' : 'Reality check failed'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function OpportunityFeed({ signals }: { signals: TradeSignal[] }) {
  const approved = signals.filter(s => s.status === 'APPROVED' && s.realityCheckPassed)

  if (approved.length === 0) {
    return (
      <div className="no-trade p-8 flex flex-col items-center text-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-amber-500/10 flex items-center justify-center">
          <Shield size={20} className="text-amber-400" />
        </div>
        <div className="text-[15px] font-bold text-amber-400">No trade today</div>
        <p className="text-[12px] max-w-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Nothing meets every criterion: confidence 8+/10, positive expected value, 2:1 reward-to-risk, and 80% agent consensus.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      {approved.map((signal, i) => (
        <SignalCard key={signal.asset} signal={signal} rank={i + 1} />
      ))}
    </div>
  )
}
