'use client'

import { TrendingUp, TrendingDown, Activity, Shield, Target, Zap, BarChart2, DollarSign } from 'lucide-react'
import { cn, fmtCurrency, fmtPct, fmt } from '@/lib/utils'
import type { PortfolioMetrics, SystemMetrics } from '@/types'

interface MetricGridProps {
  portfolio: PortfolioMetrics
  system: SystemMetrics
}

interface MetricCardProps {
  label: string
  value: string
  sub?: string
  subColor?: string
  icon: React.ElementType
  iconColor: string
  iconBg: string
  accent?: boolean
}

function MetricCard({ label, value, sub, subColor, icon: Icon, iconColor, iconBg, accent }: MetricCardProps) {
  return (
    <div className={cn('card p-4 relative overflow-hidden', accent && 'glow-blue')}>
      <div className="flex items-start justify-between mb-3">
        <div className="text-[11px] font-semibold tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
          {label}
        </div>
        <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', iconBg)}>
          <Icon size={13} className={iconColor} />
        </div>
      </div>
      <div className="tabular text-xl font-bold text-white">{value}</div>
      {sub && (
        <div className={cn('text-xs mt-1 font-medium', subColor ?? 'text-slate-400')}>
          {sub}
        </div>
      )}
    </div>
  )
}

export default function MetricGrid({ portfolio, system }: MetricGridProps) {
  const pnlColor = portfolio.totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'
  const dailyColor = portfolio.dailyPnl >= 0 ? 'text-emerald-400' : 'text-red-400'

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

      {/* NAV */}
      <MetricCard
        label="Net Asset Value"
        value={fmtCurrency(portfolio.nav, true)}
        sub={`${portfolio.totalPnl >= 0 ? '+' : ''}${fmtCurrency(portfolio.totalPnl, true)} (${fmtPct(portfolio.totalPnlPct)})`}
        subColor={pnlColor}
        icon={DollarSign}
        iconColor="text-blue-400"
        iconBg="bg-blue-500/15"
        accent
      />

      {/* Daily P&L */}
      <MetricCard
        label="Daily P&L"
        value={`${portfolio.dailyPnl >= 0 ? '+' : ''}${fmtCurrency(portfolio.dailyPnl, true)}`}
        sub={`Weekly: ${fmtCurrency(portfolio.weeklyPnl, true)}`}
        subColor={dailyColor}
        icon={portfolio.dailyPnl >= 0 ? TrendingUp : TrendingDown}
        iconColor={portfolio.dailyPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}
        iconBg={portfolio.dailyPnl >= 0 ? 'bg-emerald-500/15' : 'bg-red-500/15'}
      />

      {/* Win Rate */}
      <MetricCard
        label="Win Rate"
        value={`${fmt(portfolio.winRate, 1)}%`}
        sub={`${portfolio.closedPositions} closed trades`}
        subColor="text-slate-400"
        icon={Target}
        iconColor="text-emerald-400"
        iconBg="bg-emerald-500/15"
      />

      {/* Sharpe */}
      <MetricCard
        label="Sharpe Ratio"
        value={fmt(portfolio.sharpeRatio, 2)}
        sub={`Sortino: ${fmt(portfolio.sortinoRatio, 2)}`}
        subColor="text-slate-400"
        icon={Activity}
        iconColor="text-purple-400"
        iconBg="bg-purple-500/15"
      />

      {/* Drawdown */}
      <MetricCard
        label="Max Drawdown"
        value={`${fmt(portfolio.maxDrawdown, 1)}%`}
        sub={`Current: ${fmt(portfolio.currentDrawdown, 1)}%`}
        subColor={portfolio.currentDrawdown > 5 ? 'text-red-400' : 'text-emerald-400'}
        icon={Shield}
        iconColor="text-amber-400"
        iconBg="bg-amber-500/15"
      />

      {/* Opportunities */}
      <MetricCard
        label="Opportunities"
        value={String(system.opportunitiesFound)}
        sub={`${system.totalMarketsScanned.toLocaleString()} markets scanned`}
        subColor="text-slate-400"
        icon={Zap}
        iconColor="text-cyan-400"
        iconBg="bg-cyan-500/15"
      />

      {/* System Confidence */}
      <MetricCard
        label="System Confidence"
        value={`${fmt(system.systemConfidence, 1)} / 10`}
        sub={`Market conditions: ${system.marketConditions}/100`}
        subColor={system.systemConfidence >= 8 ? 'text-emerald-400' : 'text-amber-400'}
        icon={BarChart2}
        iconColor="text-blue-400"
        iconBg="bg-blue-500/15"
      />

      {/* Risk Utilization */}
      <MetricCard
        label="Risk Utilization"
        value={`${fmt(portfolio.riskUtilization, 1)}%`}
        sub={`${portfolio.openPositions} open / ${fmtCurrency(portfolio.available, true)} avail`}
        subColor={portfolio.riskUtilization > 15 ? 'text-red-400' : 'text-emerald-400'}
        icon={Shield}
        iconColor="text-emerald-400"
        iconBg="bg-emerald-500/15"
      />
    </div>
  )
}
