'use client'

import Gauge from '@/components/ui/Gauge'
import { fmt } from '@/lib/utils'
import type { PortfolioMetrics, SystemState } from '@/types'

interface ExecutiveMetersProps {
  portfolio: PortfolioMetrics
  system: SystemState
}

function MeterRow({ label, value, max, color, unit = '' }: {
  label: string; value: number; max: number; color: string; unit?: string
}) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>{label}</span>
        <span className="text-[11px] font-bold tabular" style={{ color }}>
          {fmt(value, 1)}{unit} <span style={{ color: 'var(--text-dim)' }}>/{max}{unit}</span>
        </span>
      </div>
      <div className="progress">
        <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

export default function ExecutiveMeters({ portfolio, system }: ExecutiveMetersProps) {
  const marketStress = 100 - system.marketConditionsScore

  return (
    <div className="card p-5">
      <div className="label mb-4">Executive Status</div>

      {/* Gauge row */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        <Gauge value={portfolio.portfolioHealthScore} size={90} strokeWidth={7}
          label="Portfolio Health" sublabel="/100" />
        <Gauge value={Math.round(system.confidenceScore * 10)} size={90} strokeWidth={7}
          label="Sys Confidence" sublabel="/100" />
        <Gauge value={system.marketConditionsScore} size={90} strokeWidth={7}
          label="Market Cond." sublabel="/100" color="#3b82f6" />
        <Gauge value={Math.round(portfolio.winRate)} size={90} strokeWidth={7}
          label="Win Rate" sublabel="%" color="#8b5cf6" />
      </div>

      {/* Risk meters */}
      <div className="space-y-2.5">
        <MeterRow label="Daily Risk Used"    value={0}    max={3}  color="var(--emerald)" unit="%" />
        <MeterRow label="Monthly Drawdown"   value={portfolio.currentDrawdown}  max={10} color={portfolio.currentDrawdown > 7 ? 'var(--red)' : portfolio.currentDrawdown > 4 ? 'var(--amber)' : 'var(--emerald)'} unit="%" />
        <MeterRow label="Capital Deployed"   value={portfolio.riskUtilization}  max={30} color="var(--accent)" unit="%" />
        <MeterRow label="Market Stress"      value={marketStress} max={100} color={marketStress > 60 ? 'var(--red)' : marketStress > 40 ? 'var(--amber)' : 'var(--emerald)'} />
      </div>

      {/* Status indicators */}
      <div className="mt-4 pt-3 grid grid-cols-2 gap-x-4 gap-y-1"
        style={{ borderTop: '1px solid var(--border-soft)' }}>
        {[
          { label: 'Kill Switch', value: system.status === 'ACTIVE' ? 'CLEAR' : 'ACTIVE', ok: system.status === 'ACTIVE' },
          { label: 'Liquidity Risk', value: 'LOW', ok: true },
          { label: 'Concentration', value: `${fmt(portfolio.riskUtilization, 0)}%`, ok: portfolio.riskUtilization < 20 },
          { label: 'Tail Risk', value: 'MONITORED', ok: true },
        ].map(item => (
          <div key={item.label} className="flex items-center justify-between text-[10px]">
            <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
            <span className="font-bold" style={{ color: item.ok ? 'var(--emerald)' : 'var(--red)' }}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
