'use client'

import { cn, fmtPct, fmt, timeUntil, fmtCompact, edgeColor, confidenceColor } from '@/lib/utils'
import type { PredictionMarket } from '@/types'

export default function MarketScanner({ markets }: { markets: PredictionMarket[] }) {
  const qualified = markets.filter(m => Math.abs(m.edge) >= 10 && m.confidence >= 7)

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5"
        style={{ borderBottom: '1px solid var(--border-soft)' }}>
        <div className="label">Prediction Market Scanner</div>
        <div className="flex gap-2">
          <span className="badge badge-green">{qualified.length} qualified</span>
          <span className="badge badge-muted">{markets.length} total</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Question</th>
              <th>Mkt %</th>
              <th>AI %</th>
              <th>Edge</th>
              <th>EV</th>
              <th>Conf</th>
              <th>Side</th>
              <th>Expires</th>
            </tr>
          </thead>
          <tbody>
            {markets.slice(0, 8).map(m => {
              const q = Math.abs(m.edge) >= 10 && m.confidence >= 7
              return (
                <tr key={m.id}>
                  <td className="max-w-xs">
                    <div className="flex items-center gap-2">
                      {q && <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--emerald)' }} />}
                      <span className="text-xs font-medium text-white truncate" title={m.question} style={{ maxWidth: 260 }}>
                        {m.question}
                      </span>
                    </div>
                  </td>
                  <td className="mono tabular text-white text-xs">{fmtPct(m.marketProb * 100, 0, false)}</td>
                  <td>
                    <span className={cn('mono tabular text-xs font-semibold',
                      m.aiProb > m.marketProb ? 'text-emerald-400' : 'text-red-400')}>
                      {fmtPct(m.aiProb * 100, 0, false)}
                    </span>
                  </td>
                  <td>
                    <span className={cn('mono font-bold text-xs', edgeColor(m.edge))}>
                      {m.edge > 0 ? '+' : ''}{fmt(m.edge, 1)}%
                    </span>
                  </td>
                  <td>
                    <span className={cn('mono text-xs font-semibold', m.ev > 0 ? 'text-emerald-400' : 'text-red-400')}>
                      {m.ev > 0 ? '+' : ''}{fmt(m.ev, 2)}
                    </span>
                  </td>
                  <td>
                    <span className={cn('mono text-xs font-semibold', confidenceColor(m.confidence))}>
                      {fmt(m.confidence, 1)}
                    </span>
                  </td>
                  <td>
                    <span className={cn('badge text-[9px]',
                      m.recommendedSide === 'YES' ? 'badge-green' :
                      m.recommendedSide === 'NO'  ? 'badge-red'  : 'badge-muted')}>
                      {m.recommendedSide}
                    </span>
                  </td>
                  <td className="text-xs mono" style={{ color: 'var(--text-muted)' }}>
                    {timeUntil(m.endDate)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
