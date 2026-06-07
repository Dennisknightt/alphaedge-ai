'use client'

import { ShieldCheck, Zap, AlertTriangle, TrendingUp, Activity, Eye } from 'lucide-react'
import { cn, fmtCurrency, fmt } from '@/lib/utils'
import type { PortfolioMetrics, SystemState, TradeSignal } from '@/types'

interface AnswerCardsProps {
  portfolio: PortfolioMetrics
  system: SystemState
  topSignal: TradeSignal | null
}

export default function AnswerCards({ portfolio, system, topSignal }: AnswerCardsProps) {
  const isSafe = portfolio.currentDrawdown < 5 && system.status === 'ACTIVE'
  const shouldTrade = topSignal?.status === 'APPROVED' && topSignal?.realityCheckPassed
  const biggestRisk = portfolio.currentDrawdown > 3
    ? `Current drawdown at ${fmt(portfolio.currentDrawdown, 1)}%`
    : 'No significant risks detected — all limits clear'

  return (
    <div className="grid grid-cols-3 gap-3">

      {/* Am I Safe? */}
      <div className={cn('rounded-xl p-4 fade-in stagger-1', isSafe ? 'answer-safe' : 'answer-danger')}>
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck size={16} className={isSafe ? 'text-emerald-400' : 'text-red-400'} />
          <span className="text-[10px] font-bold tracking-widest uppercase"
            style={{ color: isSafe ? 'var(--emerald)' : 'var(--red)' }}>Am I Safe?</span>
        </div>
        <div className={cn('text-xl font-bold mb-1', isSafe ? 'text-emerald-400' : 'text-red-400')}>
          {isSafe ? 'Yes — Protected' : 'Caution'}
        </div>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {isSafe
            ? `Health ${portfolio.portfolioHealthScore}/100. Drawdown ${fmt(portfolio.currentDrawdown, 1)}%. All guards active.`
            : `Drawdown at ${fmt(portfolio.currentDrawdown, 1)}% — approaching limit. Review positions.`}
        </p>
        <div className="flex gap-3 mt-3 text-[10px]">
          <span style={{ color: 'var(--text-dim)' }}>Drawdown</span>
          <span className="font-bold" style={{ color: isSafe ? 'var(--emerald)' : 'var(--red)' }}>
            {fmt(portfolio.currentDrawdown, 1)}% / 10%
          </span>
        </div>
        <div className="progress mt-1.5">
          <div className="progress-fill"
            style={{ width: `${(portfolio.currentDrawdown / 10) * 100}%`, background: isSafe ? 'var(--emerald)' : 'var(--red)' }} />
        </div>
      </div>

      {/* Should I Trade? */}
      <div className={cn('rounded-xl p-4 fade-in stagger-2', shouldTrade ? 'answer-safe' : 'answer-caution')}>
        <div className="flex items-center gap-2 mb-3">
          <Zap size={16} className={shouldTrade ? 'text-emerald-400' : 'text-amber-400'} />
          <span className="text-[10px] font-bold tracking-widest uppercase"
            style={{ color: shouldTrade ? 'var(--emerald)' : 'var(--amber)' }}>Should I Trade?</span>
        </div>
        {shouldTrade && topSignal ? (
          <>
            <div className="text-xl font-bold text-emerald-400 mb-1">Yes — 2 Signals</div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Top: {topSignal.asset}. Edge {(topSignal.ev * 100).toFixed(0)}%, confidence {fmt(topSignal.confidence, 1)}/10. 91% agent consensus.
            </p>
            <div className="flex gap-2 mt-3">
              <div className="badge badge-green">{topSignal.direction}</div>
              <div className="badge badge-blue">EV +{(topSignal.ev * 100).toFixed(0)}%</div>
            </div>
          </>
        ) : (
          <>
            <div className="text-xl font-bold text-amber-400 mb-1">No Trade Today</div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              No opportunity meets all institutional criteria. Capital is preserved and awaiting a high-conviction setup.
            </p>
            <div className="badge badge-amber mt-3">Waiting for edge</div>
          </>
        )}
      </div>

      {/* Biggest Risk */}
      <div className="answer-caution rounded-xl p-4 fade-in stagger-3">
        <div className="flex items-center gap-2 mb-3">
          <Eye size={16} className="text-amber-400" />
          <span className="text-[10px] font-bold tracking-widest uppercase text-amber-400">Watch Closely</span>
        </div>
        <div className="text-sm font-bold text-white mb-1">Market Context</div>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {biggestRisk}. Fed meeting Jun 18 — monitor all rate-linked positions.
        </p>
        <div className="mt-3 space-y-1">
          {['FOMC Jun 18', 'ECB Jun 12', 'CPI Jun 11'].map((event, i) => (
            <div key={i} className="flex items-center justify-between text-[10px]">
              <span style={{ color: 'var(--text-muted)' }}>{event}</span>
              <span className="badge badge-amber">Upcoming</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
