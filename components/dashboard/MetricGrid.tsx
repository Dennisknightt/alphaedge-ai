'use client'

import AnimatedCounter from '@/components/ui/AnimatedCounter'
import { TrendingUp, TrendingDown, Target, Activity, BarChart2, Zap, Shield, DollarSign } from 'lucide-react'
import { cn, fmt } from '@/lib/utils'
import type { PortfolioMetrics, SystemMetrics } from '@/types'

interface MetricGridProps {
  portfolio: PortfolioMetrics
  system: SystemMetrics
}

interface MetricCardProps {
  label: string
  value: React.ReactNode
  sub?: string
  subPositive?: boolean
  icon: React.ElementType
  accentColor: string
  delay?: string
  large?: boolean
}

function MetricCard({ label, value, sub, subPositive, icon: Icon, accentColor, delay = '', large }: MetricCardProps) {
  return (
    <div className={cn('metric-card p-4 fade-in', delay)}>
      {/* Faint gradient top glow */}
      <div className="absolute inset-x-0 top-0 h-px opacity-50"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}60, transparent)` }} />

      <div className="flex items-start justify-between mb-3">
        <div className="label">{label}</div>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}28` }}>
          <Icon size={13} style={{ color: accentColor }} />
        </div>
      </div>

      <div className={cn('font-extrabold text-white tabular mb-1', large ? 'display-num' : 'display-num-sm')}>
        {value}
      </div>

      {sub && (
        <div className={cn('text-[11px] font-medium',
          subPositive === undefined
            ? 'text-secondary'
            : subPositive ? 'positive' : 'negative'
        )}
          style={subPositive === undefined ? { color: 'var(--text-muted)' } : undefined}>
          {sub}
        </div>
      )}
    </div>
  )
}

export default function MetricGrid({ portfolio, system }: MetricGridProps) {
  const navPos   = portfolio.totalPnl >= 0
  const dailyPos = portfolio.dailyPnl >= 0

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <MetricCard
        large
        label="Net Asset Value"
        value={<AnimatedCounter value={portfolio.nav} prefix="$" decimals={0} />}
        sub={`${navPos ? '▲' : '▼'} $${Math.abs(portfolio.totalPnl).toLocaleString()} (${navPos ? '+' : ''}${fmt(portfolio.totalPnlPct, 1)}%)`}
        subPositive={navPos}
        icon={DollarSign} accentColor="#4f8ef7" delay="stagger-1"
      />
      <MetricCard
        large
        label="Daily P&L"
        value={`${dailyPos ? '+' : '-'}$${Math.abs(portfolio.dailyPnl).toLocaleString()}`}
        sub={`Weekly ${portfolio.weeklyPnl >= 0 ? '+' : ''}$${Math.abs(portfolio.weeklyPnl).toLocaleString()}`}
        subPositive={dailyPos}
        icon={dailyPos ? TrendingUp : TrendingDown}
        accentColor={dailyPos ? '#10d984' : '#f04545'} delay="stagger-2"
      />
      <MetricCard
        label="Win Rate"
        value={<AnimatedCounter value={portfolio.winRate} suffix="%" decimals={1} />}
        sub={`${portfolio.closedPositions} trades · PF ${fmt(portfolio.profitFactor, 2)}×`}
        icon={Target} accentColor="#10d984" delay="stagger-3"
      />
      <MetricCard
        label="Sharpe Ratio"
        value={<AnimatedCounter value={portfolio.sharpeRatio} decimals={2} />}
        sub={`Sortino ${fmt(portfolio.sortinoRatio, 2)}`}
        icon={Activity} accentColor="#9b74f7" delay="stagger-4"
      />
      <MetricCard
        label="Opportunities"
        value={String(system.opportunitiesFound)}
        sub={`${system.totalMarketsScanned.toLocaleString()} markets scanned`}
        icon={Zap} accentColor="#00d4f5" delay="stagger-5"
      />
      <MetricCard
        label="Open Positions"
        value={String(portfolio.openPositions)}
        sub={`$${portfolio.deployed.toLocaleString()} deployed`}
        icon={BarChart2} accentColor="#4f8ef7" delay="stagger-6"
      />
      <MetricCard
        label="Max Drawdown"
        value={`${fmt(portfolio.maxDrawdown, 1)}%`}
        sub={`Current ${fmt(portfolio.currentDrawdown, 1)}%`}
        subPositive={portfolio.currentDrawdown < 5}
        icon={Shield} accentColor="#f5a623" delay="stagger-7"
      />
      <MetricCard
        label="Avg Edge"
        value={`${fmt(system.avgEdge, 1)}%`}
        sub={`Historical ROI ${system.historicalRoi >= 0 ? '+' : ''}${fmt(system.historicalRoi, 1)}%`}
        subPositive={system.historicalRoi >= 0}
        icon={TrendingUp} accentColor="#10d984" delay="stagger-8"
      />
    </div>
  )
}
