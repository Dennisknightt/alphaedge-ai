'use client'

import { Shield, AlertTriangle } from 'lucide-react'
import { cn, fmt } from '@/lib/utils'
import type { PortfolioMetrics } from '@/types'

interface RiskPanelProps {
  portfolio: PortfolioMetrics
}

interface Limit {
  label: string
  used: number
  max: number
  unit?: string
}

function RiskMeter({ label, used, max, unit = '%' }: Limit) {
  const pct = Math.min((used / max) * 100, 100)
  const color = pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : '#10b981'

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span className="text-[11px] font-bold tabular" style={{ color }}>
          {fmt(used, 1)}{unit} <span style={{ color: 'var(--text-muted)' }}>/ {max}{unit}</span>
        </span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

function ExposureRow({ module, pct }: { module: string; pct: number }) {
  const colors: Record<string, string> = {
    PREDICTION: '#10b981',
    CRYPTO: '#f59e0b',
    FOREX: '#3b82f6',
    EQUITY: '#8b5cf6',
  }
  const color = colors[module] ?? '#94a3b8'

  return (
    <div className="flex items-center gap-2">
      <div className="w-20 text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>{module}</div>
      <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(pct * 5, 100)}%`, background: color }} />
      </div>
      <div className="w-10 text-right text-[10px] font-bold tabular" style={{ color }}>{fmt(pct, 1)}%</div>
    </div>
  )
}

export default function RiskPanel({ portfolio }: RiskPanelProps) {
  const riskLimits: Limit[] = [
    { label: 'Daily Risk', used: 0, max: 3 },
    { label: 'Weekly Risk', used: 0, max: 5 },
    { label: 'Monthly Drawdown', used: portfolio.currentDrawdown, max: 10 },
    { label: 'Risk Per Trade', used: 1.0, max: 1 },
    { label: 'Total Exposure', used: portfolio.riskUtilization, max: 30 },
  ]

  const healthColor = portfolio.portfolioHealthScore >= 80 ? '#10b981' : portfolio.portfolioHealthScore >= 60 ? '#f59e0b' : '#ef4444'
  const circumference = 2 * Math.PI * 40
  const dashArray = (portfolio.portfolioHealthScore / 100) * circumference

  return (
    <div className="card p-4 space-y-5">
      <div className="flex items-center gap-2">
        <Shield size={14} className="text-emerald-400" />
        <span className="text-sm font-semibold text-white">Capital Protection Engine</span>
      </div>

      {/* Health score */}
      <div className="flex items-center gap-4">
        <div className="relative w-24 h-24 shrink-0">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border)" strokeWidth="8" />
            <circle cx="50" cy="50" r="40" fill="none"
              stroke={healthColor} strokeWidth="8"
              strokeDasharray={`${dashArray} ${circumference}`}
              className="meter-ring" strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold tabular" style={{ color: healthColor }}>
              {portfolio.portfolioHealthScore}
            </span>
            <span className="text-[9px] font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Health</span>
          </div>
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex justify-between text-xs">
            <span style={{ color: 'var(--text-muted)' }}>Profit Factor</span>
            <span className="font-bold text-emerald-400">{fmt(portfolio.profitFactor, 2)}x</span>
          </div>
          <div className="flex justify-between text-xs">
            <span style={{ color: 'var(--text-muted)' }}>Max Drawdown</span>
            <span className="font-bold text-amber-400">{fmt(portfolio.maxDrawdown, 1)}%</span>
          </div>
          <div className="flex justify-between text-xs">
            <span style={{ color: 'var(--text-muted)' }}>Win Rate</span>
            <span className="font-bold text-white">{fmt(portfolio.winRate, 1)}%</span>
          </div>
          <div className="flex justify-between text-xs">
            <span style={{ color: 'var(--text-muted)' }}>Avg Win / Loss</span>
            <span className="font-bold text-white">{fmt(portfolio.avgWin/portfolio.avgLoss, 2)}x</span>
          </div>
        </div>
      </div>

      {/* Risk limits */}
      <div>
        <div className="text-[10px] font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
          Hard Risk Limits
        </div>
        <div className="space-y-2.5">
          {riskLimits.map(l => <RiskMeter key={l.label} {...l} />)}
        </div>
      </div>

      {/* Exposure by module */}
      <div>
        <div className="text-[10px] font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
          Exposure by Module
        </div>
        <div className="space-y-2">
          {Object.entries(portfolio.exposureByModule).map(([mod, pct]) => (
            <ExposureRow key={mod} module={mod} pct={pct} />
          ))}
        </div>
      </div>

      {/* Guards */}
      <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="text-[10px] font-semibold tracking-widest uppercase mb-1.5" style={{ color: 'var(--text-muted)' }}>
          Capital Guards Active
        </div>
        {['No Martingale', 'No Averaging Down', 'No Overleveraging', 'No Revenge Trading'].map(g => (
          <div key={g} className="flex items-center gap-1.5 text-xs text-emerald-400 py-0.5">
            <span className="text-emerald-400">✓</span>{g}
          </div>
        ))}
      </div>
    </div>
  )
}
