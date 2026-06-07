'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import { useEquityQuote, useHistory, useMacro } from '@/hooks/useMarkets'
import { cn, fmtCurrency, fmtPct, fmtCompact, fmt } from '@/lib/utils'
import { BarChart2, TrendingUp, TrendingDown } from 'lucide-react'
import { SkeletonTable, SkeletonChart } from '@/components/ui/SkeletonLoader'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

const TICKERS = [
  { ticker: 'SPY',  name: 'S&P 500 ETF',     sector: 'Index ETF',      color: '#3b82f6' },
  { ticker: 'NVDA', name: 'NVIDIA',           sector: 'Technology',     color: '#10b981' },
  { ticker: 'AAPL', name: 'Apple',            sector: 'Technology',     color: '#6366f1' },
  { ticker: 'MSFT', name: 'Microsoft',        sector: 'Technology',     color: '#8b5cf6' },
  { ticker: 'META', name: 'Meta',             sector: 'Technology',     color: '#f59e0b' },
  { ticker: 'GOOGL',name: 'Alphabet',         sector: 'Technology',     color: '#06b6d4' },
  { ticker: 'AMZN', name: 'Amazon',           sector: 'Consumer',       color: '#f43f5e' },
  { ticker: 'TSLA', name: 'Tesla',            sector: 'Consumer',       color: '#ef4444' },
  { ticker: 'JPM',  name: 'JPMorgan',         sector: 'Financials',     color: '#84cc16' },
  { ticker: 'GLD',  name: 'SPDR Gold ETF',    sector: 'Commodities',    color: '#fbbf24' },
]

function TickerCard({ ticker, name, sector, color }: { ticker: string; name: string; sector: string; color: string }) {
  const { data, loading } = useEquityQuote(ticker)

  if (loading || !data) {
    return (
      <div className="card p-4">
        <div className="skeleton h-3 w-16 mb-2 rounded" />
        <div className="skeleton h-6 w-24 mb-1 rounded" />
        <div className="skeleton h-3 w-12 rounded" />
      </div>
    )
  }

  const pos = data.change1dPct >= 0

  return (
    <div className="card p-4 hover-lift fade-in">
      <div className="flex items-start justify-between mb-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
          style={{ background: `${color}20`, color }}>
          {ticker.slice(0, 2)}
        </div>
        <span className={cn('badge text-[9px]', pos ? 'badge-green' : 'badge-red')}>
          {pos ? '▲' : '▼'} {fmtPct(Math.abs(data.change1dPct))}
        </span>
      </div>
      <div className="text-xs font-bold text-white">{ticker}</div>
      <div className="text-[10px] mb-1" style={{ color: 'var(--text-dim)' }}>{name}</div>
      <div className="text-lg font-bold mono tabular text-white">
        {fmtCurrency(data.price, data.price > 1000)}
      </div>
      <div className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
        Vol: {fmtCompact(data.volume ?? 0)}
      </div>
    </div>
  )
}

export default function EquitiesPage() {
  const { data: macroData } = useMacro()
  const spyHistory = useHistory('sp500', 'SPY', '2010-01-01')
  const [selectedTicker, setSelectedTicker] = useState('SPY')
  const tickerHistory = useHistory('sp500', selectedTicker, '2020-01-01')

  const macro  = macroData?.macro
  const regime = macroData?.regime

  // Sample SPY history for chart
  const spyPoints = (spyHistory.data?.points ?? [])
    .filter((_: any, i: number) => i % 20 === 0)
    .slice(-200)

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Capital Markets"
        subtitle="Yahoo Finance · Live Prices · Historical since 2010"
      />

      <div className="p-5 space-y-4">

        {/* Market regime from FRED */}
        {regime && (
          <div className="card p-4 flex items-center gap-4">
            <div className="flex-1">
              <div className="label mb-1">Current Market Regime</div>
              <div className={cn('text-xl font-bold', regime.riskScore < 50 ? 'text-emerald-400' : regime.riskScore < 70 ? 'text-amber-400' : 'text-red-400')}>
                {regime.label}
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{regime.description}</div>
            </div>
            {macro && (
              <div className="grid grid-cols-4 gap-4 text-xs">
                {[
                  { l: 'Fed Rate', v: `${fmt(macro.fedFundsRate.current, 2)}%` },
                  { l: 'CPI YoY',  v: `${fmt(macro.cpiYoY.current, 1)}%` },
                  { l: 'Unemployment', v: `${fmt(macro.unemployment.current, 1)}%` },
                  { l: '10Y Yield',    v: `${fmt(macro.tenYearYield.current, 2)}%` },
                ].map(i => (
                  <div key={i.l}>
                    <div style={{ color: 'var(--text-dim)' }}>{i.l}</div>
                    <div className="font-bold text-white mono">{i.v}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Ticker grid */}
        <div className="grid grid-cols-5 gap-3">
          {TICKERS.map(t => (
            <TickerCard key={t.ticker} {...t} />
          ))}
        </div>

        {/* S&P 500 Historical Chart */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-semibold text-white">S&P 500 (SPY) Since 2010</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {spyHistory.data?.count ? `${spyHistory.data.count.toLocaleString()} trading days · Yahoo Finance` : 'Loading…'}
              </div>
            </div>
            <div className="badge badge-blue">15-Year Performance</div>
          </div>
          {spyHistory.loading || spyPoints.length === 0 ? (
            <div className="skeleton h-48 w-full rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={spyPoints}>
                <defs>
                  <linearGradient id="spyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: 'var(--text-dim)', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fill: 'var(--text-dim)', fontSize: 10 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `$${v.toFixed(0)}`} width={44} />
                <Tooltip contentStyle={{ background: '#0d1120', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, fontSize: 11 }}
                  formatter={(v) => [`$${Number(v).toFixed(2)}`, 'SPY']} />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={1.5} fill="url(#spyGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Sector performance from macro */}
        {macro && (
          <div className="card p-4">
            <div className="label mb-3">Macro Signals for Equity Positioning</div>
            <div className="grid grid-cols-3 gap-3 text-xs">
              {[
                {
                  signal: 'Rate Environment',
                  value: `${fmt(macro.fedFundsRate.current, 2)}% (${macro.fedFundsRate.current > macro.fedFundsRate.previous ? '↑ Tightening' : macro.fedFundsRate.current < macro.fedFundsRate.previous ? '↓ Easing' : '→ Stable'})`,
                  impact: macro.fedFundsRate.current > 4 ? 'Headwind for growth stocks, favor value' : 'Supportive for equities',
                  color: macro.fedFundsRate.current > 4 ? 'text-red-400' : 'text-emerald-400',
                },
                {
                  signal: 'Inflation Trend',
                  value: `${fmt(macro.cpiYoY.current, 1)}% YoY (${macro.cpiYoY.current > macro.cpiYoY.previous ? '↑' : '↓'} vs prev month)`,
                  impact: macro.cpiYoY.current > 4 ? 'High inflation: favor commodities, TIPS' : 'Disinflation: positive for duration assets',
                  color: macro.cpiYoY.current > 4 ? 'text-amber-400' : 'text-emerald-400',
                },
                {
                  signal: 'Yield Curve',
                  value: `${macro.yieldCurveSpread >= 0 ? '+' : ''}${fmt(macro.yieldCurveSpread, 2)}% (10Y–2Y)`,
                  impact: macro.yieldCurveSpread < 0 ? 'Inverted — recession risk, be defensive' : 'Normal — economic expansion signal',
                  color: macro.yieldCurveSpread < 0 ? 'text-red-400' : 'text-emerald-400',
                },
              ].map(s => (
                <div key={s.signal} className="card-elevated p-3 rounded-lg">
                  <div className="label mb-1">{s.signal}</div>
                  <div className={cn('font-bold mono mb-1', s.color)}>{s.value}</div>
                  <div style={{ color: 'var(--text-muted)' }}>{s.impact}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
