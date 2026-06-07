'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import { usePredictionMarkets } from '@/hooks/useMarkets'
import { cn, fmtPct, fmt, timeUntil, fmtCompact, edgeColor, confidenceColor, riskBadge } from '@/lib/utils'
import { TrendingUp, Search, Filter, RefreshCw, ExternalLink } from 'lucide-react'
import { SkeletonTable } from '@/components/ui/SkeletonLoader'

type SortKey = 'edge' | 'confidence' | 'ev' | 'volume' | 'liquidity'

export default function PredictionMarketsPage() {
  const { data, loading, error, refetch, lastFetch } = usePredictionMarkets(40)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('edge')
  const [category, setCategory] = useState('ALL')

  const markets = data?.markets ?? []
  const categories = ['ALL', ...Array.from(new Set(markets.map(m => m.category))).sort()]

  const filtered = markets
    .filter(m => {
      const q = query.toLowerCase()
      return (
        (category === 'ALL' || m.category === category) &&
        (!q || m.question.toLowerCase().includes(q) || m.category.toLowerCase().includes(q))
      )
    })
    .sort((a, b) => {
      if (sort === 'edge')       return Math.abs(b.edge) - Math.abs(a.edge)
      if (sort === 'confidence') return b.confidence - a.confidence
      if (sort === 'ev')         return b.ev - a.ev
      if (sort === 'volume')     return b.volume - a.volume
      return b.liquidity - a.liquidity
    })

  const qualified = filtered.filter(m => Math.abs(m.edge) >= 10 && m.confidence >= 7)
  const watching  = filtered.filter(m => Math.abs(m.edge) >= 5 && !qualified.includes(m))

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Prediction Markets"
        subtitle={`Polymarket Live · ${markets.length} markets · ${lastFetch ? `Updated ${lastFetch.toLocaleTimeString()}` : 'Loading…'}`}
        onRefresh={refetch}
        isRefreshing={loading}
      />

      <div className="p-5 space-y-4">

        {/* Summary */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Live Markets', value: markets.length || '…', color: 'text-white' },
            { label: 'Qualified',    value: qualified.length,       color: 'text-emerald-400' },
            { label: 'Watching',     value: watching.length,        color: 'text-amber-400' },
            {
              label: 'AI Analyzed',
              value: data?.analyzed ? 'Yes ✓' : 'No key',
              color: data?.analyzed ? 'text-emerald-400' : 'text-amber-400'
            },
          ].map(c => (
            <div key={c.label} className="card p-3 fade-in">
              <div className="label mb-1">{c.label}</div>
              <div className={cn('text-xl font-bold tabular', c.color)}>{String(c.value)}</div>
            </div>
          ))}
        </div>

        {/* AI analysis note */}
        {!data?.analyzed && (
          <div className="card p-3 flex items-center gap-3 border-amber-500/20"
            style={{ background: 'var(--amber-soft)' }}>
            <span className="text-amber-400 text-xs font-semibold">⚠ AI Analysis</span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Add ANTHROPIC_API_KEY to enable Claude probability analysis. Currently showing raw market probabilities only.
            </span>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-1 min-w-48 card px-3 py-2">
            <Search size={13} style={{ color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Search markets…" value={query}
              onChange={e => setQuery(e.target.value)}
              className="bg-transparent text-xs text-white placeholder-slate-600 outline-none flex-1" />
          </div>
          <div className="flex gap-1 flex-wrap">
            {categories.slice(0, 8).map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={cn('px-2.5 py-1.5 rounded text-[10px] font-semibold transition-all',
                  category === cat ? 'badge-blue' : 'text-slate-500 hover:text-white')}>
                {cat}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
            <Filter size={11} />
            {(['edge','confidence','ev','volume','liquidity'] as SortKey[]).map(s => (
              <button key={s} onClick={() => setSort(s)}
                className={cn('px-1.5 py-0.5 rounded capitalize', sort === s ? 'text-blue-400 font-semibold' : 'hover:text-white')}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="card p-4 border-red-500/20" style={{ background: 'var(--red-soft)' }}>
            <p className="text-xs text-red-400">Failed to load markets: {error}</p>
          </div>
        )}

        {/* Table */}
        {loading && !data ? <SkeletonTable rows={8} /> : (
          <div className="card overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Market Question</th>
                  <th>Source</th>
                  <th>Category</th>
                  <th>Mkt Prob</th>
                  {data?.analyzed && <th>AI Prob</th>}
                  {data?.analyzed && <th>Edge</th>}
                  {data?.analyzed && <th>EV</th>}
                  {data?.analyzed && <th>Confidence</th>}
                  <th>Liquidity</th>
                  {data?.analyzed && <th>Side</th>}
                  <th>Expires</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => {
                  const isQ = Math.abs(m.edge) >= 10 && m.confidence >= 7
                  return (
                    <tr key={m.id}>
                      <td style={{ maxWidth: 320 }}>
                        <div className="flex items-center gap-2">
                          {isQ && <div className="w-1.5 h-1.5 rounded-full shrink-0 bg-emerald-400" />}
                          <span className="text-xs font-medium text-white" title={m.question}
                            style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {m.question}
                          </span>
                        </div>
                      </td>
                      <td><span className="badge badge-blue">{m.source}</span></td>
                      <td><span className="text-xs" style={{ color: 'var(--text-muted)' }}>{m.category}</span></td>
                      <td><span className="mono tabular text-white text-xs">{fmtPct(m.marketProb * 100, 1, false)}</span></td>
                      {data?.analyzed && (
                        <td>
                          <span className={cn('mono tabular text-xs font-semibold',
                            m.aiProb > m.marketProb ? 'text-emerald-400' : m.aiProb < m.marketProb ? 'text-red-400' : 'text-slate-400')}>
                            {m.aiProb ? fmtPct(m.aiProb * 100, 1, false) : '—'}
                          </span>
                        </td>
                      )}
                      {data?.analyzed && (
                        <td>
                          <span className={cn('mono font-bold text-xs', edgeColor(m.edge))}>
                            {m.edge !== 0 ? `${m.edge > 0 ? '+' : ''}${fmt(m.edge, 1)}%` : '—'}
                          </span>
                        </td>
                      )}
                      {data?.analyzed && (
                        <td>
                          <span className={cn('mono text-xs font-semibold', m.ev > 0 ? 'text-emerald-400' : m.ev < 0 ? 'text-red-400' : 'text-slate-400')}>
                            {m.ev !== 0 ? `${m.ev > 0 ? '+' : ''}${fmt(m.ev, 3)}` : '—'}
                          </span>
                        </td>
                      )}
                      {data?.analyzed && (
                        <td>
                          <span className={cn('mono text-xs font-semibold', m.confidence ? confidenceColor(m.confidence) : 'text-slate-500')}>
                            {m.confidence ? `${fmt(m.confidence, 1)}/10` : '—'}
                          </span>
                        </td>
                      )}
                      <td className="mono tabular text-xs" style={{ color: 'var(--text-muted)' }}>
                        ${fmtCompact(m.liquidity)}
                      </td>
                      {data?.analyzed && (
                        <td>
                          <span className={cn('badge text-[9px]',
                            m.recommendedSide === 'YES' ? 'badge-green' :
                            m.recommendedSide === 'NO'  ? 'badge-red' : 'badge-muted')}>
                            {m.recommendedSide}
                          </span>
                        </td>
                      )}
                      <td className="mono text-xs" style={{ color: 'var(--text-muted)' }}>
                        {timeUntil(m.endDate)}
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={12} className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                    {loading ? 'Loading live markets…' : 'No markets match your filter.'}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
