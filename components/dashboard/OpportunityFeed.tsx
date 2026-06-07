'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, Clock, Star, ChevronDown, ChevronUp, Shield } from 'lucide-react'
import { cn, fmtPct, fmt, timeUntil, riskBadge, confidenceColor, edgeColor } from '@/lib/utils'
import type { TradeSignal } from '@/types'

interface OpportunityFeedProps {
  signals: TradeSignal[]
  topSignal?: TradeSignal | null
}

function ConsensusBar({ consensus }: { consensus: TradeSignal['agentConsensus'] }) {
  const agents = [
    { id: 'research', label: 'Research', vote: consensus.research },
    { id: 'macro', label: 'Macro', vote: consensus.macro },
    { id: 'quant', label: 'Quant', vote: consensus.quant },
    { id: 'technical', label: 'Technical', vote: consensus.technical },
    { id: 'sentiment', label: 'Sentiment', vote: consensus.sentiment },
    { id: 'risk', label: 'Risk', vote: consensus.risk },
    { id: 'probability', label: 'Probability', vote: consensus.probability },
  ]

  return (
    <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
          Multi-Agent Consensus
        </span>
        <div className={cn('badge text-[10px]', consensus.passed ? 'badge-green' : 'badge-red')}>
          {consensus.approvalPct.toFixed(0)}% Approval {consensus.passed ? '✓' : '✗'}
        </div>
      </div>
      <div className="flex gap-1">
        {agents.map(({ id, label, vote }) => (
          <div key={id} className={cn(
            'flex-1 h-6 rounded flex items-center justify-center text-[9px] font-bold',
            vote.vote === 'APPROVE' ? 'bg-emerald-500/20 text-emerald-400' :
            vote.vote === 'REJECT' ? 'bg-red-500/20 text-red-400' :
            'bg-slate-700/30 text-slate-500'
          )} title={`${label}: ${vote.vote} (${vote.confidence.toFixed(1)})`}>
            {vote.vote === 'APPROVE' ? '✓' : vote.vote === 'REJECT' ? '✗' : '—'}
          </div>
        ))}
      </div>
      <div className="flex gap-1 mt-0.5">
        {agents.map(({ id, label }) => (
          <div key={id} className="flex-1 text-center text-[8px]" style={{ color: 'var(--text-muted)' }}>
            {label.slice(0, 3)}
          </div>
        ))}
      </div>
    </div>
  )
}

function SignalCard({ signal, rank, isTop }: { signal: TradeSignal; rank: number; isTop?: boolean }) {
  const [expanded, setExpanded] = useState(isTop)

  const dirColor = signal.direction === 'YES' || signal.direction === 'LONG' ? 'text-emerald-400' : 'text-red-400'
  const dirBg = signal.direction === 'YES' || signal.direction === 'LONG' ? 'badge-green' : 'badge-red'

  return (
    <div className={cn('card p-4', isTop && 'glow-green border-emerald-500/20')}>
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0',
          isTop ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800/50 text-slate-500'
        )}>
          {isTop ? <Star size={14} /> : `#${rank}`}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              {isTop && <div className="text-[10px] font-bold text-amber-400 tracking-widest uppercase mb-0.5">⭐ Top Opportunity</div>}
              <div className="text-sm font-semibold text-white leading-tight">{signal.asset}</div>
              <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{signal.module} MARKET</div>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <div className={cn('badge', dirBg)}>{signal.direction}</div>
              <div className={cn('badge', riskBadge(signal.riskTier))}>{signal.riskTier}</div>
            </div>
          </div>

          {/* Key metrics row */}
          <div className="grid grid-cols-4 gap-2 mt-2">
            <div>
              <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Edge</div>
              <div className={cn('text-sm font-bold tabular', edgeColor(signal.ev * 100))}>
                {fmtPct(signal.ev * 100)}
              </div>
            </div>
            <div>
              <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Prob</div>
              <div className="text-sm font-bold tabular text-white">{fmtPct(signal.probability * 100, 0, false)}</div>
            </div>
            <div>
              <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>R:R</div>
              <div className="text-sm font-bold tabular text-blue-400">{fmt(signal.rr, 1)}:1</div>
            </div>
            <div>
              <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Conf</div>
              <div className={cn('text-sm font-bold tabular', confidenceColor(signal.confidence))}>
                {fmt(signal.confidence, 1)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expand toggle */}
      <button onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-center gap-1 mt-3 pt-2 border-t text-[10px] font-semibold transition-colors hover:text-blue-400"
        style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
        {expanded ? <><ChevronUp size={12} /> Less</> : <><ChevronDown size={12} /> Details</>}
      </button>

      {/* Expanded */}
      {expanded && (
        <div className="mt-3 space-y-3 fade-in">
          {/* Entry/Stop/Target */}
          <div className="grid grid-cols-3 gap-2 p-3 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
            <div>
              <div className="text-[10px] text-slate-500 mb-0.5">Entry</div>
              <div className="text-sm font-bold text-white tabular">{fmt(signal.entryPrice, 3)}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 mb-0.5">Stop Loss</div>
              <div className="text-sm font-bold text-red-400 tabular">{fmt(signal.stopLoss, 3)}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 mb-0.5">Take Profit</div>
              <div className="text-sm font-bold text-emerald-400 tabular">{fmt(signal.takeProfit, 3)}</div>
            </div>
          </div>

          {/* Reasoning */}
          <div>
            <div className="text-[10px] font-semibold tracking-widest uppercase mb-1.5" style={{ color: 'var(--text-muted)' }}>
              AI Reasoning
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{signal.reasoning}</p>
          </div>

          {/* Evidence */}
          {signal.supportingEvidence.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold tracking-widest uppercase mb-1.5 text-emerald-500">
                Supporting Evidence
              </div>
              <div className="space-y-1.5">
                {signal.supportingEvidence.slice(0, 2).map((e, i) => (
                  <div key={i} className="text-xs p-2 rounded" style={{ background: 'var(--green-dim)' }}>
                    <span className="font-semibold text-emerald-400">{e.source}: </span>
                    <span style={{ color: 'var(--text-secondary)' }}>{e.summary}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {signal.opposingEvidence.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold tracking-widest uppercase mb-1.5 text-red-500">
                Risk Factors
              </div>
              <div className="space-y-1.5">
                {signal.opposingEvidence.slice(0, 2).map((e, i) => (
                  <div key={i} className="text-xs p-2 rounded" style={{ background: 'var(--red-dim)' }}>
                    <span className="font-semibold text-red-400">{e.source}: </span>
                    <span style={{ color: 'var(--text-secondary)' }}>{e.summary}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invalidation */}
          {signal.invalidationConditions.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold tracking-widest uppercase mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Invalidation Conditions
              </div>
              <ul className="space-y-0.5">
                {signal.invalidationConditions.map((c, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <span className="text-amber-400 mt-0.5">•</span>{c}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Position sizing */}
          <div className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
            <span className="text-[10px] text-slate-500 font-semibold uppercase">Kelly Position Size</span>
            <span className="text-sm font-bold text-blue-400">{fmtPct(signal.positionSize * 100, 1, false)} of capital</span>
          </div>

          {/* Consensus */}
          <ConsensusBar consensus={signal.agentConsensus} />

          {/* Reality check badge */}
          <div className={cn(
            'flex items-center gap-2 p-2 rounded-lg text-xs font-medium',
            signal.realityCheckPassed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
          )}>
            {signal.realityCheckPassed
              ? <><CheckCircle2 size={12} /> Reality Check Passed — Institutional Standards Met</>
              : <><XCircle size={12} /> Reality Check Failed — Trade Rejected</>}
          </div>
        </div>
      )}
    </div>
  )
}

export default function OpportunityFeed({ signals, topSignal }: OpportunityFeedProps) {
  const qualified = signals.filter(s => s.status === 'APPROVED' && s.realityCheckPassed)

  if (qualified.length === 0) {
    return (
      <div className="card p-8 flex flex-col items-center text-center gap-3">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
          <Shield size={20} className="text-amber-400" />
        </div>
        <div className="text-base font-bold text-amber-400">NO TRADE TODAY</div>
        <p className="text-xs max-w-sm" style={{ color: 'var(--text-muted)' }}>
          No opportunity meets the minimum threshold of 8/10 confidence, positive EV, and 2:1 risk-reward. Capital is preserved.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {qualified.map((signal, i) => (
        <SignalCard key={signal.asset} signal={signal} rank={i + 1} isTop={i === 0} />
      ))}
    </div>
  )
}
