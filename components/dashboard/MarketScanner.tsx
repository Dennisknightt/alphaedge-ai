'use client'

import { cn, fmtPct, fmt, timeUntil, edgeColor, confidenceColor } from '@/lib/utils'
import type { PredictionMarket } from '@/types'

interface MarketScannerProps {
  markets: PredictionMarket[]
}

export default function MarketScanner({ markets }: MarketScannerProps) {
  const qualified = markets.filter(m => Math.abs(m.edge) >= 10 && m.confidence >= 7)
  const watching = markets.filter(m => Math.abs(m.edge) >= 5 && m.confidence < 7)
  const avoided = markets.filter(m => Math.abs(m.edge) < 5)

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-white">Prediction Market Scanner</span>
        <div className="flex gap-2 text-[10px]">
          <span className="badge badge-green">{qualified.length} Qualified</span>
          <span className="badge badge-yellow">{watching.length} Watching</span>
          <span className="badge badge-muted">{avoided.length} Low Priority</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Question</th>
              <th>Source</th>
              <th>Market %</th>
              <th>AI %</th>
              <th>Edge</th>
              <th>EV</th>
              <th>Confidence</th>
              <th>Side</th>
              <th>Expires</th>
            </tr>
          </thead>
          <tbody>
            {markets.slice(0, 10).map(m => {
              const isQualified = Math.abs(m.edge) >= 10 && m.confidence >= 7
              return (
                <tr key={m.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      {isQualified && <span className="text-emerald-400 text-[10px]">●</span>}
                      <span className="text-xs font-medium text-white max-w-xs truncate block" title={m.question}>
                        {m.question.length > 55 ? m.question.slice(0, 52) + '…' : m.question}
                      </span>
                    </div>
                  </td>
                  <td><span className="badge badge-blue">{m.source}</span></td>
                  <td><span className="tabular text-white">{fmtPct(m.marketProb * 100, 0, false)}</span></td>
                  <td>
                    <span className={cn('tabular font-semibold',
                      m.aiProb > m.marketProb ? 'text-emerald-400' : 'text-red-400')}>
                      {fmtPct(m.aiProb * 100, 0, false)}
                    </span>
                  </td>
                  <td>
                    <span className={cn('tabular font-bold', edgeColor(m.edge))}>
                      {m.edge > 0 ? '+' : ''}{fmt(m.edge, 1)}%
                    </span>
                  </td>
                  <td>
                    <span className={cn('tabular', m.ev > 0 ? 'text-emerald-400' : 'text-red-400')}>
                      {m.ev > 0 ? '+' : ''}{fmt(m.ev, 2)}
                    </span>
                  </td>
                  <td>
                    <span className={cn('tabular font-semibold', confidenceColor(m.confidence))}>
                      {fmt(m.confidence, 1)}/10
                    </span>
                  </td>
                  <td>
                    <span className={cn('badge text-[10px]',
                      m.recommendedSide === 'YES' ? 'badge-green' :
                      m.recommendedSide === 'NO' ? 'badge-red' : 'badge-muted')}>
                      {m.recommendedSide}
                    </span>
                  </td>
                  <td className="tabular text-slate-400 text-xs">{timeUntil(m.endDate)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
