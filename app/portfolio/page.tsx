'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import { mockPortfolioMetrics, mockPositions, mockSystemState, generatePnlHistory } from '@/lib/mock-data'
import { cn, fmtCurrency, fmtPct, fmt, fmtDate } from '@/lib/utils'
import { Briefcase, TrendingUp, TrendingDown } from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  Tooltip, CartesianGrid, BarChart, Bar
} from 'recharts'

function StatRow({ label, value, color = 'text-white' }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b text-xs" style={{ borderColor: 'rgba(26,34,64,0.5)' }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span className={cn('font-bold tabular', color)}>{value}</span>
    </div>
  )
}

export default function PortfolioPage() {
  const [tab, setTab] = useState<'overview' | 'positions' | 'performance'>('overview')
  const pnl = generatePnlHistory(90)
  const m = mockPortfolioMetrics

  const monthlyData = Array.from({ length: 6 }, (_, i) => ({
    month: new Date(Date.now() - (5 - i) * 30 * 86400000).toLocaleDateString('en-US', { month: 'short' }),
    pnl: Math.round((Math.random() * 6000) + 1000),
  }))

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Portfolio" subtitle="Capital Management · P&L Tracking · Risk Analytics" />

      <div className="p-5 space-y-4">

        {/* Hero metrics */}
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: 'Net Asset Value', value: fmtCurrency(m.nav, true), sub: `+${fmtPct(m.totalPnlPct)}`, subColor: 'text-emerald-400' },
            { label: 'Total P&L', value: `+${fmtCurrency(m.totalPnl, true)}`, sub: 'All time realized + unrealized', subColor: 'text-emerald-400' },
            { label: 'Daily P&L', value: `+${fmtCurrency(m.dailyPnl, true)}`, sub: `Weekly: +${fmtCurrency(m.weeklyPnl, true)}`, subColor: 'text-emerald-400' },
            { label: 'Win Rate', value: `${fmt(m.winRate, 1)}%`, sub: `${m.closedPositions} closed trades`, subColor: 'text-slate-400' },
            { label: 'Profit Factor', value: `${fmt(m.profitFactor, 2)}x`, sub: `Sharpe: ${fmt(m.sharpeRatio, 2)}`, subColor: 'text-slate-400' },
          ].map(card => (
            <div key={card.label} className="card p-4">
              <div className="text-[10px] font-semibold tracking-wider uppercase mb-2" style={{ color: 'var(--text-muted)' }}>{card.label}</div>
              <div className="text-xl font-bold text-white tabular">{card.value}</div>
              <div className={cn('text-xs mt-0.5', card.subColor)}>{card.sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b" style={{ borderColor: 'var(--border)' }}>
          {(['overview', 'positions', 'performance'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={cn(
                'px-4 py-2 text-xs font-semibold capitalize transition-all border-b-2',
                tab === t ? 'text-blue-400 border-blue-400' : 'text-slate-500 border-transparent hover:text-white'
              )}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="grid grid-cols-3 gap-5">
            {/* NAV chart */}
            <div className="col-span-2 card p-4">
              <div className="text-sm font-semibold text-white mb-1">NAV History (90 Days)</div>
              <div className="text-xs text-slate-500 mb-4">Starting capital: $100,000</div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={pnl}>
                  <defs>
                    <linearGradient id="navG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.06)" />
                  <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} width={50} />
                  <Tooltip contentStyle={{ background: '#0d1225', border: '1px solid #1a2240', borderRadius: 8, fontSize: 11 }} />
                  <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fill="url(#navG)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Stats */}
            <div className="card p-4">
              <div className="text-sm font-semibold text-white mb-3">Portfolio Statistics</div>
              <div>
                <StatRow label="Total Capital" value={fmtCurrency(m.totalCapital, true)} />
                <StatRow label="Deployed" value={fmtCurrency(m.deployed, true)} color="text-amber-400" />
                <StatRow label="Available" value={fmtCurrency(m.available, true)} color="text-emerald-400" />
                <StatRow label="Unrealized P&L" value={`+${fmtCurrency(m.unrealizedPnl, true)}`} color="text-emerald-400" />
                <StatRow label="Realized P&L" value={`+${fmtCurrency(m.realizedPnl, true)}`} color="text-emerald-400" />
                <StatRow label="Avg Win" value={fmtCurrency(m.avgWin)} color="text-emerald-400" />
                <StatRow label="Avg Loss" value={fmtCurrency(m.avgLoss)} color="text-red-400" />
                <StatRow label="Max Drawdown" value={`${fmt(m.maxDrawdown, 1)}%`} color="text-amber-400" />
                <StatRow label="Sortino Ratio" value={fmt(m.sortinoRatio, 2)} />
                <StatRow label="Monthly P&L" value={`+${fmtCurrency(m.monthlyPnl, true)}`} color="text-emerald-400" />
                <StatRow label="Annual P&L" value={`+${fmtCurrency(m.annualPnl, true)}`} color="text-emerald-400" />
                <StatRow label="Open Positions" value={String(m.openPositions)} />
                <StatRow label="Total Trades" value={String(m.totalTrades)} />
              </div>
            </div>
          </div>
        )}

        {tab === 'positions' && (
          <div className="card overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Module</th>
                  <th>Direction</th>
                  <th>Entry</th>
                  <th>Current</th>
                  <th>Qty</th>
                  <th>Cost</th>
                  <th>Value</th>
                  <th>P&L</th>
                  <th>P&L %</th>
                  <th>Status</th>
                  <th>Opened</th>
                </tr>
              </thead>
              <tbody>
                {mockPositions.map(pos => (
                  <tr key={pos.id}>
                    <td className="text-xs font-semibold text-white">{pos.asset}</td>
                    <td><span className="badge badge-blue text-[10px]">{pos.module}</span></td>
                    <td>
                      <span className={cn('badge text-[10px]',
                        pos.direction === 'YES' || pos.direction === 'LONG' ? 'badge-green' : 'badge-red')}>
                        {pos.direction}
                      </span>
                    </td>
                    <td className="tabular text-white text-xs">{fmt(pos.entryPrice, 3)}</td>
                    <td className="tabular text-white text-xs">{fmt(pos.currentPrice, 3)}</td>
                    <td className="tabular text-slate-400 text-xs">{pos.quantity.toLocaleString()}</td>
                    <td className="tabular text-slate-400 text-xs">{fmtCurrency(pos.cost)}</td>
                    <td className="tabular text-white text-xs">{fmtCurrency(pos.currentValue)}</td>
                    <td>
                      <span className={cn('tabular font-bold text-xs', pos.pnl >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                        {pos.pnl >= 0 ? '+' : ''}{fmtCurrency(pos.pnl)}
                      </span>
                    </td>
                    <td>
                      <span className={cn('tabular font-bold text-xs', pos.pnlPct >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                        {pos.pnlPct >= 0 ? '+' : ''}{fmt(pos.pnlPct, 1)}%
                      </span>
                    </td>
                    <td>
                      <span className={cn('badge text-[10px]',
                        pos.status === 'OPEN' ? 'badge-blue' :
                        pos.status === 'CLOSED' ? 'badge-muted' : 'badge-red')}>
                        {pos.status}
                      </span>
                    </td>
                    <td className="text-xs text-slate-400">{fmtDate(pos.openedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'performance' && (
          <div className="grid grid-cols-2 gap-5">
            <div className="card p-4">
              <div className="text-sm font-semibold text-white mb-4">Monthly P&L</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.06)" />
                  <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} width={44} />
                  <Tooltip contentStyle={{ background: '#0d1225', border: '1px solid #1a2240', borderRadius: 8, fontSize: 11 }} />
                  <Bar dataKey="pnl" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card p-4 space-y-3">
              <div className="text-sm font-semibold text-white">Performance Attribution</div>
              {Object.entries(m.exposureByModule).map(([mod, pct]) => {
                const modPnl = m.totalPnl * (pct / 100) * 0.8 + 200
                const colors: Record<string, string> = { PREDICTION: '#10b981', CRYPTO: '#f59e0b', FOREX: '#3b82f6', EQUITY: '#8b5cf6' }
                return (
                  <div key={mod}>
                    <div className="flex items-center justify-between mb-1 text-xs">
                      <span className="font-semibold" style={{ color: colors[mod] ?? '#94a3b8' }}>{mod}</span>
                      <span className="text-emerald-400 font-bold">+{fmtCurrency(modPnl)}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${Math.min(pct * 8, 100)}%`, background: colors[mod] ?? '#94a3b8' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
