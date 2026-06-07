'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import { mockTradeSignals, mockSystemState } from '@/lib/mock-data'
import { cn, fmtPct, fmt } from '@/lib/utils'
import { Zap, CheckCircle2, XCircle, Shield, Star } from 'lucide-react'
import type { TradeSignal, MarketModule } from '@/types'

function ConsensusGrid({ consensus }: { consensus: TradeSignal['agentConsensus'] }) {
  const agents = [
    { label: 'Research', vote: consensus.research },
    { label: 'Macro', vote: consensus.macro },
    { label: 'Quant', vote: consensus.quant },
    { label: 'Technical', vote: consensus.technical },
    { label: 'Sentiment', vote: consensus.sentiment },
    { label: 'Risk', vote: consensus.risk },
    { label: 'Probability', vote: consensus.probability },
  ]

  return (
    <div className="grid grid-cols-7 gap-1 mt-3">
      {agents.map(({ label, vote }) => (
        <div key={label} className={cn(
          'rounded p-2 text-center',
          vote.vote === 'APPROVE' ? 'bg-emerald-500/15 border border-emerald-500/25' :
          vote.vote === 'REJECT' ? 'bg-red-500/15 border border-red-500/25' :
          'bg-slate-800/30 border border-slate-700/30'
        )}>
          <div className={cn('text-lg mb-0.5',
            vote.vote === 'APPROVE' ? 'text-emerald-400' :
            vote.vote === 'REJECT' ? 'text-red-400' : 'text-slate-500')}>
            {vote.vote === 'APPROVE' ? '✓' : vote.vote === 'REJECT' ? '✗' : '—'}
          </div>
          <div className="text-[9px] text-slate-500">{label}</div>
          <div className={cn('text-[10px] font-bold mt-0.5',
            vote.confidence >= 8 ? 'text-emerald-400' : vote.confidence >= 6 ? 'text-amber-400' : 'text-red-400')}>
            {vote.confidence.toFixed(1)}
          </div>
          <div className="text-[9px] text-slate-600 leading-tight mt-0.5 hidden">{vote.reasoning}</div>
        </div>
      ))}
    </div>
  )
}

function RealityCheckPanel({ signal }: { signal: TradeSignal }) {
  const checks = [
    { question: 'What assumptions must be true?', answer: signal.supportingEvidence.map(e => e.summary).slice(0, 2).join(' ') || 'Key assumptions validated by research.' },
    { question: 'What could make this fail?', answer: signal.invalidationConditions.slice(0, 2).join('; ') || 'Monitor for invalidation conditions.' },
    { question: 'What evidence contradicts?', answer: signal.opposingEvidence.map(e => e.summary).slice(0, 1).join(' ') || 'No major contradicting evidence.' },
    { question: 'Would an institution approve?', answer: signal.agentConsensus.passed ? `Yes — ${signal.agentConsensus.approvalPct.toFixed(0)}% agent consensus reached.` : 'No — below 80% threshold.' },
    { question: 'Valid without leverage?', answer: signal.ev > 0 ? `Yes — positive EV of +${(signal.ev * 100).toFixed(1)}% standalone.` : 'No — negative EV rejects regardless.' },
  ]

  return (
    <div className="mt-4 space-y-2">
      <div className="text-[10px] font-bold tracking-widest uppercase text-amber-400 mb-2">Reality Check</div>
      {checks.map((c, i) => (
        <div key={i} className="p-2.5 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
          <div className="text-[10px] font-semibold text-amber-400 mb-0.5">{c.question}</div>
          <div className="text-xs text-slate-400">{c.answer}</div>
        </div>
      ))}
    </div>
  )
}

export default function OpportunitiesPage() {
  const [selected, setSelected] = useState<TradeSignal | null>(mockTradeSignals[0] ?? null)
  const [showReality, setShowReality] = useState(false)

  const modules: (MarketModule | 'ALL')[] = ['ALL', 'PREDICTION', 'CRYPTO', 'FOREX', 'EQUITY']
  const [moduleFilter, setModuleFilter] = useState<MarketModule | 'ALL'>('ALL')

  const filtered = mockTradeSignals.filter(s =>
    moduleFilter === 'ALL' || s.module === moduleFilter
  )

  const approved = filtered.filter(s => s.status === 'APPROVED')
  const rejected = filtered.filter(s => s.status === 'REJECTED')

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Opportunity Center" subtitle="Multi-Agent Consensus · Trade Approval Framework" />

      <div className="p-5">
        <div className="grid grid-cols-3 gap-5">

          {/* Left: signal list */}
          <div className="space-y-3">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-2">
              <div className="card p-3 text-center">
                <div className="text-lg font-bold text-emerald-400">{approved.length}</div>
                <div className="text-[10px] text-slate-500">Approved</div>
              </div>
              <div className="card p-3 text-center">
                <div className="text-lg font-bold text-red-400">{rejected.length}</div>
                <div className="text-[10px] text-slate-500">Rejected</div>
              </div>
              <div className="card p-3 text-center">
                <div className="text-lg font-bold text-slate-400">{filtered.length}</div>
                <div className="text-[10px] text-slate-500">Total</div>
              </div>
            </div>

            {/* Module filter */}
            <div className="flex flex-wrap gap-1">
              {modules.map(m => (
                <button key={m} onClick={() => setModuleFilter(m)}
                  className={cn('text-[10px] px-2 py-1 rounded font-semibold transition-all',
                    moduleFilter === m ? 'badge-blue' : 'text-slate-500 hover:text-white')}>
                  {m}
                </button>
              ))}
            </div>

            {/* No trade state */}
            {approved.length === 0 ? (
              <div className="no-trade-card p-6 text-center">
                <Shield size={24} className="text-amber-400 mx-auto mb-2" />
                <div className="text-sm font-bold text-amber-400">NO TRADE TODAY</div>
                <p className="text-xs text-slate-500 mt-1">No opportunity meets all institutional criteria.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {approved.map((signal, i) => (
                  <button key={signal.asset} onClick={() => setSelected(signal)}
                    className={cn(
                      'w-full text-left card p-3 transition-all hover:border-blue-500/30',
                      selected?.asset === signal.asset && 'border-blue-500/40 bg-blue-500/5'
                    )}>
                    <div className="flex items-start gap-2">
                      <div className={cn('w-6 h-6 rounded flex items-center justify-center text-xs font-bold shrink-0 mt-0.5',
                        i === 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700/40 text-slate-500')}>
                        {i === 0 ? <Star size={12} /> : i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-white truncate">{signal.asset}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{signal.module}</span>
                          <span className={cn('badge text-[10px]',
                            signal.direction === 'YES' || signal.direction === 'LONG' ? 'badge-green' : 'badge-red')}>
                            {signal.direction}
                          </span>
                        </div>
                        <div className="flex gap-3 mt-1 text-[10px]">
                          <span className="text-blue-400">EV +{(signal.ev * 100).toFixed(0)}%</span>
                          <span className="text-purple-400">{fmt(signal.confidence, 1)}/10</span>
                          <span className="text-slate-500">{signal.agentConsensus.approvalPct.toFixed(0)}% consensus</span>
                        </div>
                      </div>
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-1" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: signal detail */}
          <div className="col-span-2">
            {selected ? (
              <div className="card p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[10px] text-slate-500 mb-0.5">{selected.module} MARKET · {selected.timeHorizon}</div>
                    <h2 className="text-lg font-bold text-white">{selected.asset}</h2>
                  </div>
                  <div className="flex gap-2">
                    <span className={cn('badge', selected.direction === 'YES' || selected.direction === 'LONG' ? 'badge-green' : 'badge-red')}>
                      {selected.direction}
                    </span>
                    {selected.realityCheckPassed
                      ? <span className="badge badge-green">✓ APPROVED</span>
                      : <span className="badge badge-red">✗ REJECTED</span>}
                  </div>
                </div>

                {/* Trade parameters */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'Entry', value: fmt(selected.entryPrice, 3), color: 'text-white' },
                    { label: 'Stop Loss', value: fmt(selected.stopLoss, 3), color: 'text-red-400' },
                    { label: 'Take Profit', value: fmt(selected.takeProfit, 3), color: 'text-emerald-400' },
                    { label: 'R:R Ratio', value: `${fmt(selected.rr, 1)}:1`, color: 'text-blue-400' },
                    { label: 'Probability', value: fmtPct(selected.probability * 100, 0, false), color: 'text-white' },
                    { label: 'Expected Value', value: `+${(selected.ev * 100).toFixed(1)}%`, color: 'text-emerald-400' },
                    { label: 'Confidence', value: `${fmt(selected.confidence, 1)}/10`, color: 'text-purple-400' },
                    { label: 'Kelly Size', value: fmtPct(selected.positionSize * 100, 1, false) + ' capital', color: 'text-cyan-400' },
                  ].map(m => (
                    <div key={m.label} className="p-3 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
                      <div className="text-[10px] text-slate-500 mb-1">{m.label}</div>
                      <div className={cn('text-sm font-bold tabular', m.color)}>{m.value}</div>
                    </div>
                  ))}
                </div>

                {/* Reasoning */}
                <div>
                  <div className="text-[10px] font-semibold tracking-widest uppercase mb-1.5" style={{ color: 'var(--text-muted)' }}>AI Reasoning</div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{selected.reasoning}</p>
                </div>

                {/* Evidence columns */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[10px] font-semibold tracking-widest uppercase mb-2 text-emerald-500">Supporting Evidence</div>
                    <div className="space-y-1.5">
                      {selected.supportingEvidence.map((e, i) => (
                        <div key={i} className="text-xs p-2 rounded" style={{ background: 'var(--green-dim)' }}>
                          <div className="font-semibold text-emerald-400 mb-0.5">{e.source}</div>
                          <div className="text-slate-400">{e.summary}</div>
                          <div className="text-[10px] text-slate-600 mt-0.5">Weight: {(e.weight * 100).toFixed(0)}% · Credibility: {(e.credibility * 100).toFixed(0)}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold tracking-widest uppercase mb-2 text-red-500">Risk Factors</div>
                    <div className="space-y-1.5">
                      {selected.opposingEvidence.map((e, i) => (
                        <div key={i} className="text-xs p-2 rounded" style={{ background: 'var(--red-dim)' }}>
                          <div className="font-semibold text-red-400 mb-0.5">{e.source}</div>
                          <div className="text-slate-400">{e.summary}</div>
                        </div>
                      ))}
                      {selected.opposingEvidence.length === 0 && (
                        <div className="text-xs text-slate-600 italic">No significant risk factors identified.</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Invalidation */}
                <div>
                  <div className="text-[10px] font-semibold tracking-widest uppercase mb-1.5" style={{ color: 'var(--text-muted)' }}>Invalidation Conditions</div>
                  <ul className="space-y-1">
                    {selected.invalidationConditions.map((c, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-slate-400">
                        <span className="text-amber-400 mt-0.5 shrink-0">⚠</span>{c}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Multi-Agent Consensus */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>Multi-Agent Consensus</div>
                    <div className={cn('badge text-xs', selected.agentConsensus.passed ? 'badge-green' : 'badge-red')}>
                      {selected.agentConsensus.approvalPct.toFixed(0)}% · {selected.agentConsensus.passed ? 'PASSED ✓' : 'FAILED ✗'}
                    </div>
                  </div>
                  <ConsensusGrid consensus={selected.agentConsensus} />
                  <div className="mt-2 text-[10px] text-slate-600">Minimum approval threshold: 80%. Trade rejected if below threshold.</div>
                </div>

                {/* Reality check toggle */}
                <div>
                  <button onClick={() => setShowReality(r => !r)}
                    className="text-[10px] font-semibold text-amber-400 tracking-widest uppercase flex items-center gap-1.5">
                    {showReality ? '▾' : '▸'} Reality Check Framework
                  </button>
                  {showReality && <RealityCheckPanel signal={selected} />}
                </div>
              </div>
            ) : (
              <div className="card p-8 flex flex-col items-center justify-center text-center h-64">
                <Zap size={24} className="text-blue-400 mb-2" />
                <div className="text-sm font-semibold text-white">Select an opportunity to review</div>
                <p className="text-xs text-slate-500 mt-1">Full trade analysis, agent consensus, and reality check will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
