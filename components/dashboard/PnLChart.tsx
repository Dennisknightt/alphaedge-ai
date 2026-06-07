'use client'

import { useState } from 'react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts'
import { cn, fmtCurrency, fmt } from '@/lib/utils'
import type { ChartPoint } from '@/types'

const FRAMES = ['1W', '1M', '3M', 'ALL'] as const

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const isPos = d.value >= 100000
  return (
    <div className="card p-3 text-xs shadow-xl" style={{ boxShadow: 'var(--shadow-elevated)' }}>
      <div className="font-semibold text-white mb-1.5">{label}</div>
      <div className="space-y-0.5">
        <div className="flex justify-between gap-4">
          <span style={{ color: 'var(--text-muted)' }}>NAV</span>
          <span className="font-bold text-white mono">{fmtCurrency(d.value, true)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span style={{ color: 'var(--text-muted)' }}>P&L</span>
          <span className={cn('font-bold mono', d.pnl >= 0 ? 'text-emerald-400' : 'text-red-400')}>
            {d.pnl >= 0 ? '+' : ''}{fmtCurrency(d.pnl, true)}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function PnLChart({ data, startCapital = 100000 }: { data: ChartPoint[]; startCapital?: number }) {
  const [frame, setFrame] = useState<typeof FRAMES[number]>('3M')
  const sliceMap = { '1W': 7, '1M': 30, '3M': 90, 'ALL': data.length }
  const slice = data.slice(-sliceMap[frame])

  const last = slice.at(-1)?.value ?? startCapital
  const first = slice[0]?.value ?? startCapital
  const isPos = last >= first
  const changePct = ((last - first) / first) * 100

  const gradId = `navGrad-${frame}`

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="label mb-1">NAV Performance</div>
          <div className={cn('text-2xl font-bold mono tabular', isPos ? 'text-emerald-400' : 'text-red-400')}>
            {fmtCurrency(last, true)}
          </div>
          <div className={cn('text-xs font-semibold mt-0.5', isPos ? 'text-emerald-400' : 'text-red-400')}>
            {isPos ? '▲' : '▼'} {fmtCurrency(Math.abs(last - first), true)} ({isPos ? '+' : ''}{fmt(changePct, 2)}%) this period
          </div>
        </div>
        <div className="flex gap-1">
          {FRAMES.map(f => (
            <button key={f} onClick={() => setFrame(f)}
              className={cn('px-2.5 py-1 rounded text-[11px] font-semibold transition-all',
                frame === f
                  ? 'text-white'
                  : 'hover:text-white')}
              style={{
                background: frame === f ? 'var(--accent-soft)' : 'transparent',
                border: frame === f ? '1px solid var(--accent-mid)' : '1px solid transparent',
                color: frame === f ? 'var(--accent)' : 'var(--text-muted)',
              }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={slice} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isPos ? '#10b981' : '#ef4444'} stopOpacity={0.25} />
              <stop offset="100%" stopColor={isPos ? '#10b981' : '#ef4444'} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="date" tick={{ fill: 'var(--text-dim)', fontSize: 10 }} axisLine={false} tickLine={false}
            interval="preserveStartEnd" />
          <YAxis tick={{ fill: 'var(--text-dim)', fontSize: 10 }} axisLine={false} tickLine={false}
            tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} width={44} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeDasharray: '4 4' }} />
          <ReferenceLine y={startCapital} stroke="rgba(255,255,255,0.12)" strokeDasharray="4 4" />
          <Area type="monotone" dataKey="value"
            stroke={isPos ? '#10b981' : '#ef4444'} strokeWidth={1.5}
            fill={`url(#${gradId})`} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
