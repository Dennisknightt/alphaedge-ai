'use client'

import AnimatedCounter from '@/components/ui/AnimatedCounter'
import { TrendingUp, TrendingDown, Target, Shield, DollarSign } from 'lucide-react'
import { cn, fmt } from '@/lib/utils'
import type { PortfolioMetrics } from '@/types'

interface MetricGridProps {
  portfolio: PortfolioMetrics
}

function Kpi({ label, value, sub, positive, icon: Icon, accent, delay }: {
  label: string
  value: React.ReactNode
  sub: string
  positive?: boolean
  icon: React.ElementType
  accent: string
  delay: string
}) {
  return (
    <div className={cn('metric-card p-5 fade-in', delay)}>
      <div className="flex items-center justify-between mb-4">
        <span className="label">{label}</span>
        <Icon size={14} style={{ color: accent }} />
      </div>
      <div className="display-num text-white mb-2">{value}</div>
      <div className={cn('text-[12px] font-semibold',
        positive === undefined ? '' : positive ? 'positive' : 'negative')}
        style={positive === undefined ? { color: 'var(--text-muted)' } : undefined}>
        {sub}
      </div>
    </div>
  )
}

export default function MetricGrid({ portfolio }: MetricGridProps) {
  const navPos   = portfolio.totalPnl >= 0
  const dailyPos = portfolio.dailyPnl >= 0

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      <Kpi
        label="Net asset value"
        value={<AnimatedCounter value={portfolio.nav} prefix="$" decimals={0} />}
        sub={`${navPos ? '+' : '−'}$${Math.abs(portfolio.totalPnl).toLocaleString()} all time (${navPos ? '+' : ''}${fmt(portfolio.totalPnlPct, 1)}%)`}
        positive={navPos}
        icon={DollarSign} accent="#4f8ef7" delay="stagger-1"
      />
      <Kpi
        label="Today"
        value={`${dailyPos ? '+' : '−'}$${Math.abs(portfolio.dailyPnl).toLocaleString()}`}
        sub={`${portfolio.weeklyPnl >= 0 ? '+' : '−'}$${Math.abs(portfolio.weeklyPnl).toLocaleString()} this week`}
        positive={dailyPos}
        icon={dailyPos ? TrendingUp : TrendingDown} accent={dailyPos ? '#10d984' : '#f04545'} delay="stagger-2"
      />
      <Kpi
        label="Win rate"
        value={<AnimatedCounter value={portfolio.winRate} suffix="%" decimals={1} />}
        sub={`${portfolio.closedPositions} closed trades · profit factor ${fmt(portfolio.profitFactor, 2)}×`}
        icon={Target} accent="#10d984" delay="stagger-3"
      />
      <Kpi
        label="Max drawdown"
        value={`${fmt(portfolio.maxDrawdown, 1)}%`}
        sub={`Currently ${fmt(portfolio.currentDrawdown, 1)}% · limit 10%`}
        positive={portfolio.currentDrawdown < 5}
        icon={Shield} accent="#f5a623" delay="stagger-4"
      />
    </div>
  )
}
