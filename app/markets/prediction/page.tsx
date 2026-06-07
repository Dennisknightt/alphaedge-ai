'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import { mockPredictionMarkets, mockSystemState } from '@/lib/mock-data'
import { cn, fmtPct, fmt, timeUntil, fmtCompact, edgeColor, confidenceColor, riskBadge } from '@/lib/utils'
import { TrendingUp, Search, Filter } from 'lucide-react'
import type { PredictionMarket } from '@/types'

type SortKey = 'edge' | 'confidence' | 'ev' | 'volume' | 'liquidity'

function ProbBar({ market, label }: { market: PredictionMarket; label: string }) {
  const hasEdge = Math.abs(market.edge) >= 10 && market.confidence >= 7
  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
        <div className="h-full rounded-full transition-all" style={{
          width: `${market.marketProb * 100}%`,
          background: 'rgba(59,130,246,0.6)'
        }} />
      </div>
      <span className="tabular text-xs font-medium text-blue-400">{fmtPct(market.marketProb * 100, 0, false)}</span>
      <span className="text-slate-600 text-xs">→</span>
      <span className={cn('tabular text-xs font-bold',
        market.aiProb > market.marketProb ? 'text-emerald-400' : 'text-red-400')}>
        AI: {fmtPct(market.aiProb * 100, 0, false)}
      </span>
    </div>
  )
}

export default function PredictionMarketsPage() {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('edge')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')

  const categories = ['ALL', ...Array.from(new Set(mockPredictionMarkets.map(m => m.category)))]

  const filtered = mockPredictionMarkets
    .filter(m => {
      const q = query.toLowerCase()
      return (
        (categoryFilter === 'ALL' || m.category === categoryFilter) &&
        (m.question.toLowerCase().includes(q) || m.category.toLowerCase().includes(q))
      )
    })
    .sort((a, b) => {
      if (sort === 'edge') return Math.abs(b.edge) - Math.abs(a.edge)
      if (sort === 'confidence') return b.confidence - a.confidence
      if (sort === 'ev') return b.ev - a.ev
      if (sort === 'volume') return b.volume - a.volume
      return b.liquidity - a.liquidity
    })

  const qualified = filtered.filter(m => Math.abs(m.edge) >= 10 && m.confidence >= 8)
  const watching = filtered.filter(m => Math.abs(m.edge) >= 5 && (Math.abs(m.edge) < 10 || m.confidence < 8))

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Prediction Markets" subtitle="Polymarket · Kalshi · Event Contracts" systemState={mockSystemState} />

      <div className="p-5 space-y-4">

        {/* Summary row */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Markets Scanned', value: mockPredictionMarkets.length.toString(), color: 'text-white' },
            { label: 'Qualified Opportunities', value: qualified.length.toString(), color: 'text-emerald-400' },
            { label: 'Watching', value: watching.length.toString(), color: 'text-amber-400' },
            { label: 'Avg Edge (Qualified)', value: qualified.length > 0 ? fmtPct(qualified.reduce((s, m) => s + Math.abs(m.edge), 0) / qualified.length, 1, false) : '—', color: 'text-blue-400' },
          ].map(card => (
            <div key={card.label} className="card p-3">
              <div className="text-[10px] font-semibold tracking-wider uppercase mb-1" style={{ color: 'var(--text-muted)' }}>{card.label}</div>
              <div className={cn('text-xl font-bold tabular', card.color)}>{card.value}</div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-1 min-w-48 card px-3 py-2">
            <Search size={13} className="text-slate-500 shrink-0" />
            <input
              type="text"
              placeholder="Search markets…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="bg-transparent text-xs text-white placeholder-slate-600 outline-none flex-1"
            />
          </div>

          <div className="flex gap-1">
            {categories.map(cat => (
              <button key={cat} onClick={() => setCategoryFilter(cat)}
                className={cn('px-2.5 py-1.5 rounded text-xs font-semibold transition-all',
                  categoryFilter === cat ? 'badge-blue' : 'text-slate-500 hover:text-white')}>
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
            <Filter size={12} />
            Sort:
            {(['edge', 'confidence', 'ev', 'volume', 'liquidity'] as SortKey[]).map(s => (
              <button key={s} onClick={() => setSort(s)}
                className={cn('px-2 py-1 rounded capitalize transition-all',
                  sort === s ? 'text-blue-400 font-semibold' : 'hover:text-white')}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Markets table */}
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Market Question</th>
                <th>Source</th>
                <th>Category</th>
                <th>Probability</th>
                <th>Edge</th>
                <th>EV</th>
                <th>Conf</th>
                <th>Liquidity</th>
                <th>Side</th>
                <th>Risk</th>
                <th>Expires</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => {
                const isQualified = Math.abs(m.edge) >= 10 && m.confidence >= 8
                const isWatching = !isQualified && Math.abs(m.edge) >= 5
                return (
                  <tr key={m.id} className={cn(
                    isQualified ? 'border-l-2 border-emerald-500/40' :
                    isWatching ? 'border-l-2 border-amber-500/20' : ''
                  )}>
                    <td className="max-w-xs">
                      <div className="flex items-center gap-2">
                        {isQualified && <TrendingUp size={11} className="text-emerald-400 shrink-0" />}
                        <span className="text-xs text-white font-medium" title={m.question}>
                          {m.question.length > 60 ? m.question.slice(0, 57) + '…' : m.question}
                        </span>
                      </div>
                    </td>
                    <td><span className="badge badge-blue text-[10px]">{m.source}</span></td>
                    <td><span className="text-xs text-slate-400">{m.category}</span></td>
                    <td><ProbBar market={m} label="" /></td>
                    <td>
                      <span className={cn('font-bold tabular text-sm', edgeColor(m.edge))}>
                        {m.edge > 0 ? '+' : ''}{fmt(m.edge, 1)}%
                      </span>
                    </td>
                    <td>
                      <span className={cn('tabular font-semibold', m.ev > 0 ? 'text-emerald-400' : 'text-red-400')}>
                        {m.ev > 0 ? '+' : ''}{fmt(m.ev, 3)}
                      </span>
                    </td>
                    <td>
                      <span className={cn('tabular font-semibold', confidenceColor(m.confidence))}>
                        {fmt(m.confidence, 1)}
                      </span>
                    </td>
                    <td className="tabular text-slate-400 text-xs">${fmtCompact(m.liquidity)}</td>
                    <td>
                      <span className={cn('badge text-[10px]',
                        m.recommendedSide === 'YES' ? 'badge-green' :
                        m.recommendedSide === 'NO' ? 'badge-red' : 'badge-muted')}>
                        {m.recommendedSide}
                      </span>
                    </td>
                    <td><span className={cn('badge text-[10px]', riskBadge(m.riskTier))}>{m.riskTier}</span></td>
                    <td className="text-xs text-slate-400 tabular">{timeUntil(m.endDate)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
