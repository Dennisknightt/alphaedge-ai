'use client'

import Header from '@/components/layout/Header'
import { useForex, useMacro, useHistory } from '@/hooks/useMarkets'
import { cn, fmtPct, fmt } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { SkeletonTable } from '@/components/ui/SkeletonLoader'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

export default function ForexPage() {
  const { data: forexData, loading, error, refetch, lastFetch } = useForex()
  const { data: macroData } = useMacro()

  const eurusdHistory = useHistory('forex', 'EUR/USD', '2010-01-01')

  const pairs  = forexData?.pairs ?? []
  const macro  = macroData?.macro
  const regime = macroData?.regime

  // Sampled EUR/USD history — every 30 points for chart readability
  const eurusdPoints = (eurusdHistory.data?.points ?? []).filter((_: any, i: number) => i % 30 === 0)

  const trendIcon = (trend: string) => {
    if (trend === 'BULLISH') return <TrendingUp size={12} className="text-emerald-400" />
    if (trend === 'BEARISH') return <TrendingDown size={12} className="text-red-400" />
    return <Minus size={12} className="text-slate-400" />
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Forex Markets"
        subtitle={`Frankfurter API · Live Rates · ${lastFetch ? `Updated ${lastFetch.toLocaleTimeString()}` : 'Loading…'}`}
        onRefresh={refetch}
        isRefreshing={loading}
      />

      <div className="p-5 space-y-4">

        {/* Macro context from FRED */}
        {macro && regime && (
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Macro Regime',  value: regime.label,                                        color: regime.riskScore < 50 ? 'text-emerald-400' : regime.riskScore < 70 ? 'text-amber-400' : 'text-red-400' },
              { label: 'Fed Funds Rate', value: `${fmt(macro.fedFundsRate.current, 2)}%`,           color: 'text-white' },
              { label: 'CPI YoY',        value: `${fmt(macro.cpiYoY.current, 1)}%`,                 color: macro.cpiYoY.current > 4 ? 'text-red-400' : macro.cpiYoY.current > 2.5 ? 'text-amber-400' : 'text-emerald-400' },
              { label: '10Y–2Y Spread',  value: `${macro.yieldCurveSpread >= 0 ? '+' : ''}${fmt(macro.yieldCurveSpread, 2)}%`, color: macro.yieldCurveSpread < 0 ? 'text-red-400' : 'text-emerald-400' },
            ].map(c => (
              <div key={c.label} className="card p-3 fade-in">
                <div className="label mb-1">{c.label}</div>
                <div className={cn('text-xl font-bold tabular', c.color)}>{c.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* EUR/USD long-term chart */}
        {eurusdPoints.length > 0 && (
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm font-semibold text-white">EUR/USD Exchange Rate</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Frankfurter API · Since 2010 · {eurusdHistory.data?.count?.toLocaleString()} trading days</div>
              </div>
              <div className="badge badge-blue">ECB vs Fed Dynamics</div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={eurusdPoints}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: 'var(--text-dim)', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fill: 'var(--text-dim)', fontSize: 10 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} width={44} />
                <Tooltip contentStyle={{ background: '#0d1120', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, fontSize: 11 }}
                  formatter={(v) => [Number(v).toFixed(4), 'EUR/USD']} />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Central bank context */}
        <div className="card p-4">
          <div className="label mb-3">Central Bank Monitor</div>
          <div className="grid grid-cols-4 gap-3">
            {[
              { bank: 'Federal Reserve', rate: macro ? `${fmt(macro.fedFundsRate.current, 2)}%` : '—', bias: 'NEUTRAL', color: 'text-amber-400' },
              { bank: 'ECB',             rate: '4.00%',                                                 bias: 'DOVISH', color: 'text-emerald-400' },
              { bank: 'Bank of Japan',   rate: '0.10%',                                                 bias: 'HAWKISH', color: 'text-red-400' },
              { bank: 'Bank of England', rate: '5.00%',                                                 bias: 'NEUTRAL', color: 'text-amber-400' },
            ].map(cb => (
              <div key={cb.bank} className="card-elevated p-3 rounded-lg">
                <div className="text-[10px] text-slate-500 mb-0.5">{cb.bank}</div>
                <div className="text-base font-bold text-white">{cb.rate}</div>
                <span className={cn('badge text-[9px] mt-1',
                  cb.bias === 'HAWKISH' ? 'badge-red' : cb.bias === 'DOVISH' ? 'badge-green' : 'badge-amber')}>
                  {cb.bias}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Live rates table */}
        {error && <div className="card p-3 border-red-500/20" style={{ background: 'var(--red-soft)' }}>
          <p className="text-xs text-red-400">Forex error: {error}</p>
        </div>}

        {loading && !forexData ? <SkeletonTable rows={8} /> : (
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid var(--border-soft)' }}>
              <div className="label">Live Exchange Rates</div>
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Frankfurter ECB Data · Refreshes every 5 min</span>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Pair</th>
                  <th>Bid</th>
                  <th>Ask</th>
                  <th>Spread</th>
                  <th>24h Change</th>
                  <th>IR Differential</th>
                  <th>CB Bias</th>
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody>
                {pairs.map(pair => (
                  <tr key={pair.pair}>
                    <td>
                      <div className="flex items-center gap-2">
                        {trendIcon(pair.trend)}
                        <span className="text-sm font-bold text-white">{pair.pair}</span>
                      </div>
                    </td>
                    <td className="mono tabular font-semibold text-white text-sm">{fmt(pair.bid, 4)}</td>
                    <td className="mono tabular text-xs" style={{ color: 'var(--text-muted)' }}>{fmt(pair.ask, 4)}</td>
                    <td className="mono tabular text-xs" style={{ color: 'var(--text-muted)' }}>{fmt(pair.spread, 1)} pips</td>
                    <td>
                      <span className={cn('tabular font-semibold text-xs', pair.change24h >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                        {fmtPct(pair.change24h)}
                      </span>
                    </td>
                    <td>
                      {pair.irDifferential !== undefined && (
                        <span className={cn('mono tabular text-xs font-semibold',
                          pair.irDifferential > 2 ? 'text-emerald-400' : pair.irDifferential > 0 ? 'text-amber-400' : 'text-red-400')}>
                          {pair.irDifferential > 0 ? '+' : ''}{fmt(pair.irDifferential, 2)}%
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={cn('badge text-[9px]',
                        pair.centralBankBias === 'HAWKISH' ? 'badge-red' :
                        pair.centralBankBias === 'DOVISH'  ? 'badge-green' : 'badge-amber')}>
                        {pair.centralBankBias}
                      </span>
                    </td>
                    <td>
                      <span className={cn('badge text-[9px]',
                        pair.trend === 'BULLISH' ? 'badge-green' : pair.trend === 'BEARISH' ? 'badge-red' : 'badge-muted')}>
                        {pair.trend}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
