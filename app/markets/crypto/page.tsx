'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import { useCrypto, useHistory } from '@/hooks/useMarkets'
import { cn, fmtCurrency, fmtPct, fmtCompact, fmt } from '@/lib/utils'
import { TrendingUp, TrendingDown, Bitcoin, RefreshCw } from 'lucide-react'
import { SkeletonTable, SkeletonChart } from '@/components/ui/SkeletonLoader'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

export default function CryptoMarketsPage() {
  const { data, loading, error, refetch, lastFetch } = useCrypto()
  const btcHistory = useHistory('crypto', 'bitcoin', '2013-01-01')
  const [selected, setSelected] = useState('bitcoin')

  const assets = data?.assets ?? []
  const global  = data?.global
  const fng     = data?.fearGreed

  const fngColor = (fng?.value ?? 50) < 30 ? 'text-red-400' : (fng?.value ?? 50) < 50 ? 'text-amber-400' : (fng?.value ?? 50) < 70 ? 'text-emerald-400' : 'text-red-400'

  // Sampled history for chart (every ~30 days for readability)
  const btcPoints = (btcHistory.data?.points ?? []).filter((_: any, i: number) => i % 30 === 0).slice(-120)

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Crypto Markets"
        subtitle={`CoinGecko Live · ${assets.length} assets · ${lastFetch ? `Updated ${lastFetch.toLocaleTimeString()}` : 'Loading…'}`}
        onRefresh={refetch}
        isRefreshing={loading}
      />

      <div className="p-5 space-y-4">

        {/* Global stats */}
        {global && (
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Total Market Cap', value: `$${(global.totalMarketCap / 1e12).toFixed(2)}T`, color: 'text-white', sub: `${global.marketCapChange24h >= 0 ? '+' : ''}${fmt(global.marketCapChange24h, 1)}% 24h`, subPos: global.marketCapChange24h >= 0 },
              { label: 'BTC Dominance',    value: `${fmt(global.btcDominance, 1)}%`,              color: 'text-amber-400', sub: 'of total market cap', subPos: undefined },
              { label: 'Total Volume 24h', value: `$${(global.totalVolume / 1e9).toFixed(1)}B`,   color: 'text-blue-400', sub: 'spot + derivatives', subPos: undefined },
              { label: 'Fear & Greed',     value: fng ? `${fng.value} — ${fng.label}` : '—',      color: fngColor, sub: 'Alternative.me index', subPos: undefined },
            ].map(c => (
              <div key={c.label} className="card p-3 fade-in">
                <div className="label mb-1">{c.label}</div>
                <div className={cn('text-xl font-bold tabular', c.color)}>{c.value}</div>
                {c.sub && <div className={cn('text-xs mt-0.5', c.subPos === undefined ? '' : c.subPos ? 'text-emerald-400' : 'text-red-400')} style={c.subPos === undefined ? { color: 'var(--text-muted)' } : undefined}>{c.sub}</div>}
              </div>
            ))}
          </div>
        )}

        {/* BTC Historical Chart */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-semibold text-white">Bitcoin Price History</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {btcHistory.data?.count ? `${btcHistory.data.count.toLocaleString()} data points since ${btcHistory.data?.from}` : 'Loading CoinGecko historical data…'}
              </div>
            </div>
            <div className="badge badge-amber">BTC/USD · All-Time</div>
          </div>
          {btcHistory.loading ? (
            <div className="skeleton h-48 w-full rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={btcPoints}>
                <defs>
                  <linearGradient id="btcGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: 'var(--text-dim)', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fill: 'var(--text-dim)', fontSize: 10 }} axisLine={false} tickLine={false}
                  tickFormatter={v => v >= 1000 ? `$${(v/1000).toFixed(0)}K` : `$${v}`} width={52} />
                <Tooltip contentStyle={{ background: '#0d1120', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, fontSize: 11 }}
                  formatter={(v) => [`$${Number(v).toLocaleString()}`, 'BTC/USD']} />
                <Area type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={1.5} fill="url(#btcGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="card p-3 border-red-500/20" style={{ background: 'var(--red-soft)' }}>
            <p className="text-xs text-red-400">CoinGecko error: {error} — Rate limits may apply. Retrying automatically.</p>
          </div>
        )}

        {/* Live asset table */}
        {loading && !data ? <SkeletonTable rows={10} /> : (
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid var(--border-soft)' }}>
              <div className="flex items-center gap-2">
                <Bitcoin size={14} className="text-amber-400" />
                <span className="label">Live Cryptocurrency Prices</span>
              </div>
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Source: CoinGecko · Refreshes every 2 min</span>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Asset</th>
                  <th>Price</th>
                  <th>24h</th>
                  <th>7d</th>
                  <th>Volume 24h</th>
                  <th>Market Cap</th>
                </tr>
              </thead>
              <tbody>
                {assets.slice(0, 30).map((asset, i) => (
                  <tr key={asset.id}>
                    <td className="text-xs" style={{ color: 'var(--text-dim)' }}>{i + 1}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                          {asset.symbol.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{asset.symbol}</div>
                          <div className="text-[10px]" style={{ color: 'var(--text-dim)' }}>{asset.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="mono tabular font-semibold text-white text-sm">
                      {fmtCurrency(asset.price, asset.price > 1000)}
                    </td>
                    <td>
                      <div className={cn('flex items-center gap-1 font-semibold text-xs tabular',
                        asset.change24h >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                        {asset.change24h >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                        {fmtPct(asset.change24h)}
                      </div>
                    </td>
                    <td>
                      <span className={cn('tabular font-semibold text-xs', asset.change7d >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                        {fmtPct(asset.change7d)}
                      </span>
                    </td>
                    <td className="mono tabular text-xs" style={{ color: 'var(--text-muted)' }}>
                      ${fmtCompact(asset.volume24h)}
                    </td>
                    <td className="mono tabular text-xs" style={{ color: 'var(--text-muted)' }}>
                      ${fmtCompact(asset.marketCap)}
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
