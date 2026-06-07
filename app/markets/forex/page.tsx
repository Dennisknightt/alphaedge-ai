'use client'

import Header from '@/components/layout/Header'
import { mockForexPairs, mockSystemState } from '@/lib/mock-data'
import { cn, fmtPct, fmt } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const trendIcon = (trend: string) => {
  if (trend === 'BULLISH') return <TrendingUp size={12} className="text-emerald-400" />
  if (trend === 'BEARISH') return <TrendingDown size={12} className="text-red-400" />
  return <Minus size={12} className="text-slate-400" />
}

export default function ForexPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Forex Markets" subtitle="Major Pairs · Cross Pairs · EM Currencies" />

      <div className="p-5 space-y-4">

        {/* Summary */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Pairs Monitored', value: '60+', color: 'text-white' },
            { label: 'Bullish Setups', value: '3', color: 'text-emerald-400' },
            { label: 'Bearish Setups', value: '2', color: 'text-red-400' },
            { label: 'DXY Trend', value: 'WEAKENING', color: 'text-red-400' },
          ].map(c => (
            <div key={c.label} className="card p-3">
              <div className="text-[10px] font-semibold tracking-wider uppercase mb-1" style={{ color: 'var(--text-muted)' }}>{c.label}</div>
              <div className={cn('text-xl font-bold tabular', c.color)}>{c.value}</div>
            </div>
          ))}
        </div>

        {/* Macro context */}
        <div className="card p-4">
          <div className="text-xs font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>FOREX MACRO INTELLIGENCE</div>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div>
              <div className="text-blue-400 font-semibold mb-1">🏦 Central Bank Watch</div>
              <div className="space-y-1 text-slate-400">
                <div className="flex justify-between"><span>Fed</span><span className="badge badge-yellow">NEUTRAL</span></div>
                <div className="flex justify-between"><span>ECB</span><span className="badge badge-green">DOVISH</span></div>
                <div className="flex justify-between"><span>BOJ</span><span className="badge badge-red">HAWKISH</span></div>
                <div className="flex justify-between"><span>BOE</span><span className="badge badge-yellow">NEUTRAL</span></div>
              </div>
            </div>
            <div>
              <div className="text-purple-400 font-semibold mb-1">📅 Key Events</div>
              <div className="space-y-1 text-slate-400">
                <div>FOMC Meeting — Jun 18</div>
                <div>ECB Decision — Jun 12</div>
                <div>US CPI — Jun 11</div>
                <div>NFP — Jul 4</div>
                <div>BOJ Policy — Jun 17</div>
              </div>
            </div>
            <div>
              <div className="text-amber-400 font-semibold mb-1">📊 Rate Differentials</div>
              <div className="space-y-1 text-slate-400">
                <div className="flex justify-between"><span>USD-EUR</span><span className="text-amber-400">+0.25%</span></div>
                <div className="flex justify-between"><span>USD-JPY</span><span className="text-red-400">+4.75%</span></div>
                <div className="flex justify-between"><span>USD-GBP</span><span className="text-white">0.00%</span></div>
                <div className="flex justify-between"><span>USD-CHF</span><span className="text-emerald-400">+3.00%</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Pairs table */}
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Pair</th>
                <th>Bid</th>
                <th>Ask</th>
                <th>Spread</th>
                <th>24h Change</th>
                <th>24h Range</th>
                <th>IR Differential</th>
                <th>CB Bias</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {mockForexPairs.map(pair => (
                <tr key={pair.pair}>
                  <td>
                    <div className="flex items-center gap-2">
                      {trendIcon(pair.trend)}
                      <span className="text-sm font-bold text-white">{pair.pair}</span>
                    </div>
                  </td>
                  <td className="tabular font-mono text-white text-sm">{fmt(pair.bid, 4)}</td>
                  <td className="tabular font-mono text-slate-400 text-sm">{fmt(pair.ask, 4)}</td>
                  <td className="tabular text-xs text-slate-400">{fmt(pair.spread, 1)} pips</td>
                  <td>
                    <span className={cn('tabular font-semibold text-xs',
                      pair.change24h >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                      {fmtPct(pair.change24h)}
                    </span>
                  </td>
                  <td className="tabular text-xs text-slate-400">
                    {fmt(pair.low24h, 4)} – {fmt(pair.high24h, 4)}
                  </td>
                  <td>
                    {pair.irDifferential !== undefined ? (
                      <span className={cn('tabular text-xs font-semibold',
                        pair.irDifferential > 2 ? 'text-emerald-400' :
                        pair.irDifferential > 0 ? 'text-amber-400' : 'text-red-400')}>
                        {pair.irDifferential > 0 ? '+' : ''}{fmt(pair.irDifferential, 2)}%
                      </span>
                    ) : '—'}
                  </td>
                  <td>
                    {pair.centralBankBias ? (
                      <span className={cn('badge text-[10px]',
                        pair.centralBankBias === 'HAWKISH' ? 'badge-red' :
                        pair.centralBankBias === 'DOVISH' ? 'badge-green' : 'badge-yellow')}>
                        {pair.centralBankBias}
                      </span>
                    ) : '—'}
                  </td>
                  <td>
                    <span className={cn('badge text-[10px]',
                      pair.trend === 'BULLISH' ? 'badge-green' :
                      pair.trend === 'BEARISH' ? 'badge-red' : 'badge-muted')}>
                      {pair.trend}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
