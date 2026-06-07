'use client'

import Header from '@/components/layout/Header'
import { mockEquities, mockSystemState } from '@/lib/mock-data'
import { cn, fmtCurrency, fmtPct, fmtCompact, fmt } from '@/lib/utils'
import { BarChart2, TrendingUp, TrendingDown } from 'lucide-react'

export default function EquitiesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Capital Markets" subtitle="US Equities · ETFs · Bonds · Commodities · Indices" systemState={mockSystemState} />

      <div className="p-5 space-y-4">

        {/* Summary */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Assets Tracked', value: '2,400+', color: 'text-white' },
            { label: 'Buy Signals', value: '4', color: 'text-emerald-400' },
            { label: 'Sell Signals', value: '1', color: 'text-red-400' },
            { label: 'Market Regime', value: 'RISK-ON', color: 'text-emerald-400' },
          ].map(c => (
            <div key={c.label} className="card p-3">
              <div className="text-[10px] font-semibold tracking-wider uppercase mb-1" style={{ color: 'var(--text-muted)' }}>{c.label}</div>
              <div className={cn('text-xl font-bold tabular', c.color)}>{c.value}</div>
            </div>
          ))}
        </div>

        {/* Market intelligence */}
        <div className="card p-4">
          <div className="text-xs font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>EQUITY MARKET INTELLIGENCE</div>
          <div className="grid grid-cols-4 gap-4 text-xs">
            {[
              { label: 'S&P 500', value: '5,842', change: '+0.82%', note: 'Above 20-DMA', positive: true },
              { label: 'NASDAQ', value: '19,124', change: '+1.14%', note: 'Tech leadership', positive: true },
              { label: '10Y Yield', value: '4.31%', change: '-0.04%', note: 'Slightly declining', positive: true },
              { label: 'VIX', value: '13.2', change: '-0.8', note: 'Low fear — caution', positive: true },
            ].map(idx => (
              <div key={idx.label} className="card-elevated p-3 rounded-lg">
                <div className="text-[10px] text-slate-500 mb-0.5">{idx.label}</div>
                <div className="text-base font-bold text-white">{idx.value}</div>
                <div className={cn('text-xs font-semibold', idx.positive ? 'text-emerald-400' : 'text-red-400')}>{idx.change}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{idx.note}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Equities table */}
        <div className="card overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <BarChart2 size={14} className="text-purple-400" />
            <span className="text-sm font-semibold text-white">High-Priority Watchlist</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Ticker</th>
                <th>Company</th>
                <th>Sector</th>
                <th>Price</th>
                <th>1D</th>
                <th>5D</th>
                <th>P/E</th>
                <th>Market Cap</th>
                <th>Rel Volume</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {mockEquities.map(eq => (
                <tr key={eq.ticker}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center text-xs font-bold text-purple-400">
                        {eq.ticker.slice(0, 2)}
                      </div>
                      <span className="text-sm font-bold text-white">{eq.ticker}</span>
                    </div>
                  </td>
                  <td className="text-xs text-slate-400">{eq.name}</td>
                  <td><span className="badge badge-muted text-[10px]">{eq.sector.slice(0, 10)}</span></td>
                  <td className="tabular font-semibold text-white text-sm">{fmtCurrency(eq.price)}</td>
                  <td>
                    <div className={cn('flex items-center gap-1 text-xs font-semibold tabular',
                      eq.change1d >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                      {eq.change1d >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                      {fmtPct(eq.change1d)}
                    </div>
                  </td>
                  <td>
                    <span className={cn('tabular text-xs font-semibold',
                      eq.change5d >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                      {fmtPct(eq.change5d)}
                    </span>
                  </td>
                  <td className="tabular text-slate-400 text-xs">{eq.pe ? fmt(eq.pe, 1) : '—'}</td>
                  <td className="tabular text-slate-400 text-xs">{eq.marketCap > 0 ? `$${fmtCompact(eq.marketCap)}` : '—'}</td>
                  <td>
                    <span className={cn('tabular text-xs font-semibold',
                      eq.relativeVolume >= 1.1 ? 'text-amber-400' : 'text-slate-400')}>
                      {fmt(eq.relativeVolume, 2)}x
                    </span>
                  </td>
                  <td>
                    {eq.analystRating && (
                      <span className={cn('badge text-[10px]',
                        eq.analystRating === 'BUY' ? 'badge-green' :
                        eq.analystRating === 'SELL' ? 'badge-red' : 'badge-yellow')}>
                        {eq.analystRating}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sector performance */}
        <div className="card p-4">
          <div className="text-xs font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>SECTOR PERFORMANCE (MTD)</div>
          <div className="grid grid-cols-5 gap-2">
            {[
              { sector: 'Technology', perf: 7.4, color: '#3b82f6' },
              { sector: 'Energy', perf: 4.2, color: '#f59e0b' },
              { sector: 'Healthcare', perf: 2.1, color: '#10b981' },
              { sector: 'Financials', perf: 3.8, color: '#8b5cf6' },
              { sector: 'Consumer Disc', perf: -1.2, color: '#ef4444' },
              { sector: 'Industrials', perf: 1.9, color: '#06b6d4' },
              { sector: 'Utilities', perf: -0.8, color: '#ef4444' },
              { sector: 'Materials', perf: 2.6, color: '#10b981' },
              { sector: 'Real Estate', perf: -2.1, color: '#ef4444' },
              { sector: 'Comm. Svc', perf: 5.1, color: '#3b82f6' },
            ].map(s => (
              <div key={s.sector} className="text-center p-2 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
                <div className="text-[10px] text-slate-400 mb-1">{s.sector}</div>
                <div className="text-sm font-bold tabular" style={{ color: s.color }}>
                  {s.perf >= 0 ? '+' : ''}{fmt(s.perf, 1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
