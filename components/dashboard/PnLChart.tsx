'use client'

import { useState } from 'react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  Tooltip, CartesianGrid, ReferenceLine
} from 'recharts'
import { cn, fmtCurrency } from '@/lib/utils'
import type { ChartPoint } from '@/types'

interface PnLChartProps {
  data: ChartPoint[]
  startCapital?: number
}

const FRAMES = ['1W', '1M', '3M', 'ALL'] as const

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="card p-3 text-xs shadow-xl border-blue-500/20">
      <div className="font-semibold text-white mb-1">{label}</div>
      <div className="space-y-0.5">
        <div className="flex justify-between gap-4">
          <span style={{ color: 'var(--text-muted)' }}>NAV</span>
          <span className="font-bold text-white tabular">{fmtCurrency(d.value)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span style={{ color: 'var(--text-muted)' }}>P&L</span>
          <span className={cn('font-bold tabular', d.pnl >= 0 ? 'text-emerald-400' : 'text-red-400')}>
            {d.pnl >= 0 ? '+' : ''}{fmtCurrency(d.pnl)}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function PnLChart({ data, startCapital = 100000 }: PnLChartProps) {
  const [frame, setFrame] = useState<typeof FRAMES[number]>('3M')

  const sliceMap = { '1W': 7, '1M': 30, '3M': 90, 'ALL': data.length }
  const slice = data.slice(-sliceMap[frame])

  const last = slice[slice.length - 1]?.value ?? startCapital
  const first = slice[0]?.value ?? startCapital
  const isPositive = last >= first

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-semibold text-white">Portfolio NAV</div>
          <div className={cn('text-2xl font-bold tabular mt-0.5', isPositive ? 'text-emerald-400' : 'text-red-400')}>
            {fmtCurrency(last, true)}
          </div>
        </div>
        <div className="flex gap-1">
          {FRAMES.map(f => (
            <button key={f} onClick={() => setFrame(f)}
              className={cn(
                'px-2.5 py-1 rounded text-xs font-semibold transition-all',
                frame === f
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              )}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={slice} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
          <defs>
            <linearGradient id="navGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0.3} />
              <stop offset="95%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.06)" />
          <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} width={48} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={startCapital} stroke="rgba(59,130,246,0.3)" strokeDasharray="4 4" />
          <Area
            type="monotone"
            dataKey="value"
            stroke={isPositive ? '#10b981' : '#ef4444'}
            strokeWidth={2}
            fill="url(#navGrad)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
