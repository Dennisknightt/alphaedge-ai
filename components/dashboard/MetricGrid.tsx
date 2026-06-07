'use client'

import AnimatedCounter from '@/components/ui/AnimatedCounter'
import { TrendingUp, TrendingDown, Target, Activity, BarChart2, Zap, Shield, DollarSign } from 'lucide-react'
import { cn, fmt } from '@/lib/utils'
import type { PortfolioMetrics, SystemMetrics } from '@/types'

interface MetricGridProps {
  portfolio: PortfolioMetrics
  system: SystemMetrics
}

function MetricCard({
  label, value, sub, subPos, icon: Icon, iconColor,
  delay = ''
}: {
  label: string; value: string | React.ReactNode; sub?: string; subPos?: boolean
  icon: React.ElementType; iconColor: string; delay?: string
}) {
  return (
    <div className={cn('card p-4 hover-lift fade-in', delay)}>
      <div className="flex items-start justify-between mb-3">
        <div className="label">{label}</div>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: `${iconColor}18` }}>
          <Icon size={13} style={{ color: iconColor }} />
        </div>
      </div>
      <div className="text-xl font-bold text-white tabular mb-0.5">{value}</div>
      {sub !== undefined && (
        <div className={cn('text-xs font-medium',
          subPos === undefined ? '' : subPos ? 'text-emerald-400' : 'text-red-400')}
          style={subPos === undefined ? { color: 'var(--text-muted)' } : undefined}>
          {sub}
        </div>
      )}
    </div>
  )
}

export default function MetricGrid({ portfolio, system }: MetricGridProps) {
  const navSign = portfolio.totalPnl >= 0
  const dailySign = portfolio.dailyPnl >= 0

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <MetricCard
        label="Net Asset Value"
        value={<AnimatedCounter value={portfolio.nav} prefix="$" decimals={0} />}
        sub={`${navSign ? '+' : ''}$${Math.abs(portfolio.totalPnl).toLocaleString()} (${navSign ? '+' : ''}${fmt(portfolio.totalPnlPct, 1)}%)`}
        subPos={navSign}
        icon={DollarSign} iconColor="var(--accent)" delay="stagger-1"
      />
      <MetricCard
        label="Daily P&L"
        value={`${dailySign ? '+' : '-'}$${Math.abs(portfolio.dailyPnl).toLocaleString()}`}
        sub={`Weekly: ${portfolio.weeklyPnl >= 0 ? '+' : ''}$${Math.abs(portfolio.weeklyPnl).toLocaleString()}`}
        subPos={dailySign}
        icon={dailySign ? TrendingUp : TrendingDown}
        iconColor={dailySign ? 'var(--emerald)' : 'var(--red)'} delay="stagger-2"
      />
      <MetricCard
        label="Win Rate"
        value={<AnimatedCounter value={portfolio.winRate} suffix="%" decimals={1} />}
        sub={`${portfolio.closedPositions} trades · PF ${fmt(portfolio.profitFactor, 2)}x`}
        icon={Target} iconColor="var(--emerald)" delay="stagger-3"
      />
      <MetricCard
        label="Sharpe Ratio"
        value={<AnimatedCounter value={portfolio.sharpeRatio} decimals={2} />}
        sub={`Sortino ${fmt(portfolio.sortinoRatio, 2)}`}
        icon={Activity} iconColor="var(--purple)" delay="stagger-4"
      />
      <MetricCard
        label="Opportunities"
        value={String(system.opportunitiesFound)}
        sub={`${system.totalMarketsScanned.toLocaleString()} markets scanned`}
        icon={Zap} iconColor="var(--cyan)" delay="stagger-5"
      />
      <MetricCard
        label="Open Positions"
        value={String(portfolio.openPositions)}
        sub={`$${portfolio.deployed.toLocaleString()} deployed`}
        icon={BarChart2} iconColor="var(--accent)" delay="stagger-6"
      />
      <MetricCard
        label="Max Drawdown"
        value={`${fmt(portfolio.maxDrawdown, 1)}%`}
        sub={`Current: ${fmt(portfolio.currentDrawdown, 1)}%`}
        subPos={portfolio.currentDrawdown < 5}
        icon={Shield} iconColor="var(--amber)" delay="stagger-7"
      />
      <MetricCard
        label="Avg Edge"
        value={`${fmt(system.avgEdge, 1)}%`}
        sub={`Historical ROI ${system.historicalRoi >= 0 ? '+' : ''}${fmt(system.historicalRoi, 1)}%`}
        subPos={system.historicalRoi >= 0}
        icon={TrendingUp} iconColor="var(--emerald)" delay="stagger-8"
      />
    </div>
  )
}
