'use client'

import { useState } from 'react'
import { Star, ChevronDown, ChevronUp, CheckCircle2, XCircle, Shield, ArrowRight } from 'lucide-react'
import { cn, fmt, fmtPct, riskBadge, confidenceColor, edgeColor } from '@/lib/utils'
import type { TradeSignal } from '@/types'

function AgentBar({ consensus }: { consensus: TradeSignal['agentConsensus'] }) {
  const agents = [
    { key: 'research', label: 'Rsch', vote: consensus.research },
    { key: 'macro', label: 'Macro', vote: consensus.macro },
    { key: 'quant', label: 'Quant', vote: consensus.quant },
    { key: 'technical', label: 'Tech', vote: consensus.technical },
    { key: 'sentiment', label: 'Sent', vote: consensus.sentiment },
    { key: 'risk', label: 'Risk', vote: consensus.risk },
    { key: 'probability', label: 'Prob', vote: consensus.probability },
  ] as const

  return (
    <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border-soft)' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="label">Agent Consensus</span>
        <div className={cn('badge text-[10px]', consensus.passed ? 'badge-green' : 'badge-red')}>
          {consensus.approvalPct.toFixed(0)}% {consensus.passed ? '✓ PASSED' : '✗ FAILED'}
        </div>
      </div>
      <div className="flex gap-1">
        {agents.map(({ key, label, vote }) => (
          <div key={key} title={`${label}: ${vote.vote} (${vote.confidence.toFixed(1)})`}
            className={cn('flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded',
              vote.vote === 'APPROVE' ? 'bg-emerald-500/10 border border-emerald-500/20' :
              vote.vote === 'REJECT'  ? 'bg-red-500/10 border border-red-500/20' :
              'border border-transparent bg-white/3')}>
            <span className={cn('text-xs font-bold',
              vote.vote === 'APPROVE' ? 'text-emerald-400' :
              vote.vote === 'REJECT'  ? 'text-red-400' : 'text-slate-600')}>
              {vote.vote === 'APPROVE' ? '✓' : vote.vote === 'REJECT' ? '✗' : '—'}
            </span>
            <span className="text-[9px]" style={{ color: 'var(--text-dim)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SignalCard({ signal, rank }: { signal: TradeSignal; rank: number }) {
  const [expanded, setExpanded] = useState(rank === 1)
  const isTop = rank === 1
  const isLong = signal.direction === 'YES' || signal.direction === 'LONG'

  return (
    <div className={cn('card overflow-hidden hover-lift fade-in',
      isTop && 'border-emerald-500/20')}
      style={isTop ? { boxShadow: 'var(--shadow-glow-green)' } : undefined}>

      {/* Top badge strip */}
      {isTop && (
        <div className="flex items-center gap-2 px-4 py-2"
          style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1), transparent)', borderBottom: '1px solid rgba(16,185,129,0.15)' }}>
          <Star size={11} className="text-amber-400" />
          <span className="text-[10px] font-bold tracking-widest uppercase text-amber-400">Top Opportunity Today</span>
        </div>
      )}

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start gap-3">
          <div className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0',
            isTop ? 'bg-amber-500/15 text-amber-400' : 'bg-white/5 text-slate-500')}>
            {isTop ? <Star size={14} /> : `#${rank}`}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-sm font-semibold text-white leading-tight">{signal.asset}</div>
                <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {signal.module} · {signal.timeHorizon}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <div className={cn('badge', isLong ? 'badge-green' : 'badge-red')}>{signal.direction}</div>
                <div className={cn('badge', riskBadge(signal.riskTier))}>{signal.riskTier}</div>
              </div>
            </div>

            {/* Metrics strip */}
            <div className="grid grid-cols-4 gap-2 mt-3">
              {[
                { label: 'Edge', value: `+${(signal.ev * 100).toFixed(0)}%`, color: edgeColor(signal.ev * 100) },
                { label: 'Probability', value: fmtPct(signal.probability * 100, 0, false), color: 'text-white' },
                { label: 'R:R', value: `${fmt(signal.rr, 1)}:1`, color: 'text-blue-400' },
                { label: 'Confidence', value: fmt(signal.confidence, 1), color: confidenceColor(signal.confidence) },
              ].map(m => (
                <div key={m.label} className="p-2 rounded-lg text-center"
                  style={{ background: 'var(--bg-elevated)' }}>
                  <div className="label mb-0.5">{m.label}</div>
                  <div className={cn('text-sm font-bold tabular', m.color)}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Toggle */}
        <button onClick={() => setExpanded(e => !e)}
          className="w-full flex items-center justify-center gap-1 mt-3 pt-2 text-[10px] font-semibold transition-colors"
          style={{ borderTop: '1px solid var(--border-soft)', color: 'var(--text-muted)' }}>
          {expanded ? <><ChevronUp size={11} /> Less</> : <><ChevronDown size={11} /> Full Analysis</>}
        </button>

        {/* Expanded */}
        {expanded && (
          <div className="mt-3 space-y-3 fade-in">
            {/* Entry / SL / TP */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Entry', value: fmt(signal.entryPrice, 3), color: 'text-white' },
                { label: 'Stop Loss', value: fmt(signal.stopLoss, 3), color: 'text-red-400' },
                { label: 'Take Profit', value: fmt(signal.takeProfit, 3), color: 'text-emerald-400' },
              ].map(f => (
                <div key={f.label} className="p-2.5 rounded-lg"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-soft)' }}>
                  <div className="label mb-0.5">{f.label}</div>
                  <div className={cn('text-sm font-bold mono', f.color)}>{f.value}</div>
                </div>
              ))}
            </div>

            {/* Reasoning */}
            <div className="p-3 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
              <div className="label mb-1.5">AI Reasoning</div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {signal.reasoning}
              </p>
            </div>

            {/* Evidence */}
            <div className="grid grid-cols-2 gap-2">
              {signal.supportingEvidence.slice(0, 2).map((e, i) => (
                <div key={i} className="p-2.5 rounded-lg text-xs"
                  style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                  <div className="font-semibold text-emerald-400 mb-0.5 truncate">{e.source}</div>
                  <div style={{ color: 'var(--text-muted)' }} className="line-clamp-2">{e.summary}</div>
                </div>
              ))}
              {signal.opposingEvidence.slice(0, 2).map((e, i) => (
                <div key={i} className="p-2.5 rounded-lg text-xs"
                  style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                  <div className="font-semibold text-red-400 mb-0.5 truncate">{e.source}</div>
                  <div style={{ color: 'var(--text-muted)' }} className="line-clamp-2">{e.summary}</div>
                </div>
              ))}
            </div>

            {/* Position size + reality check */}
            <div className="flex items-center justify-between text-xs p-2.5 rounded-lg"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-soft)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Kelly Position Size</span>
              <span className="font-bold text-blue-400">{fmtPct(signal.positionSize * 100, 1, false)} of capital</span>
            </div>

            {/* Agent consensus */}
            <AgentBar consensus={signal.agentConsensus} />

            {/* Reality check */}
            <div className={cn('flex items-center gap-2 p-2.5 rounded-lg text-xs font-medium',
              signal.realityCheckPassed ? 'badge-green' : 'badge-red')}
              style={{
                background: signal.realityCheckPassed ? 'var(--emerald-soft)' : 'var(--red-soft)',
                border: `1px solid ${signal.realityCheckPassed ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                color: signal.realityCheckPassed ? 'var(--emerald)' : 'var(--red)',
              }}>
              {signal.realityCheckPassed
                ? <><CheckCircle2 size={12} /> Institutional Reality Check Passed — All criteria met</>
                : <><XCircle size={12} /> Reality check failed — Trade rejected</>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function OpportunityFeed({ signals }: { signals: TradeSignal[] }) {
  const approved = signals.filter(s => s.status === 'APPROVED' && s.realityCheckPassed)

  if (approved.length === 0) {
    return (
      <div className="no-trade p-8 flex flex-col items-center text-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
          <Shield size={22} className="text-amber-400" />
        </div>
        <div className="text-base font-bold text-amber-400">NO TRADE TODAY</div>
        <p className="text-xs max-w-sm" style={{ color: 'var(--text-muted)' }}>
          No opportunity meets all institutional criteria: confidence ≥ 8/10, positive EV, R:R ≥ 2:1, and 80% agent consensus. Capital is preserved.
        </p>
        <div className="label">Capital Preservation Active · Monitoring Continuously</div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {approved.map((signal, i) => (
        <SignalCard key={signal.asset} signal={signal} rank={i + 1} />
      ))}
    </div>
  )
}
