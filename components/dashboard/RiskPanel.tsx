'use client'

import { Shield, CheckCircle2 } from 'lucide-react'
import { cn, fmt, fmtCurrency } from '@/lib/utils'
import type { PortfolioMetrics } from '@/types'

function Limit({ label, used, max, unit = '%' }: { label: string; used: number; max: number; unit?: string }) {
  const pct = Math.min((used / max) * 100, 100)
  const color = pct >= 90 ? 'var(--red)' : pct >= 65 ? 'var(--amber)' : 'var(--emerald)'
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{label}</span>
        <span className="text-[11px] font-bold mono" style={{ color }}>
          {fmt(used, 1)}{unit}<span style={{ color: 'var(--text-dim)' }}>/{max}{unit}</span>
        </span>
      </div>
      <div className="progress">
        <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

export default function RiskPanel({ portfolio }: { portfolio: PortfolioMetrics }) {
  const hColor = portfolio.portfolioHealthScore >= 80 ? 'var(--emerald)' : portfolio.portfolioHealthScore >= 60 ? 'var(--amber)' : 'var(--red)'
  const r = 36, sw = 7, circ = 2 * Math.PI * r
  const dash = (portfolio.portfolioHealthScore / 100) * circ

  return (
    <div className="card p-4 space-y-4">
      <div className="label">Capital Protection</div>

      {/* Health ring + stats */}
      <div className="flex items-center gap-4">
        <div className="relative shrink-0" style={{ width: 90, height: 90 }}>
          <svg width={90} height={90} className="-rotate-90">
            <circle cx={45} cy={45} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={sw} />
            <circle cx={45} cy={45} r={r} fill="none" stroke={hColor} strokeWidth={sw}
              strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 1s ease' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold mono" style={{ color: hColor }}>{portfolio.portfolioHealthScore}</span>
            <span className="text-[9px]" style={{ color: 'var(--text-dim)' }}>HEALTH</span>
          </div>
        </div>
        <div className="flex-1 space-y-1.5 text-xs">
          {[
            { l: 'Win Rate',        v: `${fmt(portfolio.winRate, 1)}%`,      c: portfolio.winRate >= 55 ? 'text-emerald-400' : 'text-amber-400' },
            { l: 'Profit Factor',   v: `${fmt(portfolio.profitFactor, 2)}x`, c: 'text-white' },
            { l: 'Max Drawdown',    v: `${fmt(portfolio.maxDrawdown, 1)}%`,  c: 'text-amber-400' },
            { l: 'Available',       v: fmtCurrency(portfolio.available, true), c: 'text-emerald-400' },
          ].map(r => (
            <div key={r.l} className="flex justify-between">
              <span style={{ color: 'var(--text-muted)' }}>{r.l}</span>
              <span className={cn('font-bold mono', r.c)}>{r.v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Limits */}
      <div className="space-y-2.5">
        <Limit label="Daily Risk"         used={0}                           max={3} />
        <Limit label="Monthly Drawdown"   used={portfolio.currentDrawdown}   max={10} />
        <Limit label="Capital Deployed"   used={portfolio.riskUtilization}   max={30} />
        <Limit label="Max Single Trade"   used={1.0}                         max={1} />
      </div>

      {/* Guards */}
      <div className="pt-2" style={{ borderTop: '1px solid var(--border-soft)' }}>
        <div className="label mb-2">Active Guards</div>
        {['No Martingale', 'No Averaging Down', 'No Overleveraging', 'No Revenge Trading', 'No Force Trades'].map(g => (
          <div key={g} className="flex items-center gap-1.5 py-0.5 text-[11px] text-emerald-400">
            <CheckCircle2 size={11} />
            <span>{g}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
