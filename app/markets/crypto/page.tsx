'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import { mockCryptoAssets, mockSystemState } from '@/lib/mock-data'
import { cn, fmtCurrency, fmtPct, fmtCompact, fmt } from '@/lib/utils'
import { Bitcoin, TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function CryptoMarketsPage() {
  const [view, setView] = useState<'spot' | 'signals'>('spot')

  const btcDom = mockCryptoAssets.find(a => a.symbol === 'BTC')?.dominance ?? 54

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Crypto Markets" subtitle="Bitcoin · Ethereum · Solana · Top 500" systemState={mockSystemState} />

      <div className="p-5 space-y-4">

        {/* Summary */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Assets Monitored', value: '500+', color: 'text-white' },
            { label: 'BTC Dominance', value: `${btcDom}%`, color: 'text-amber-400' },
            { label: 'Crypto Signals', value: '3', color: 'text-emerald-400' },
            { label: 'Market Regime', value: 'BULL', color: 'text-emerald-400' },
          ].map(c => (
            <div key={c.label} className="card p-3">
              <div className="text-[10px] font-semibold tracking-wider uppercase mb-1" style={{ color: 'var(--text-muted)' }}>{c.label}</div>
              <div className={cn('text-xl font-bold tabular', c.color)}>{c.value}</div>
            </div>
          ))}
        </div>

        {/* Intelligence summary */}
        <div className="card p-4">
          <div className="text-xs font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>CRYPTO INTELLIGENCE SUMMARY</div>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div>
              <div className="text-emerald-400 font-semibold mb-1">🐋 Whale Activity</div>
              <p className="text-slate-400">BTC whales accumulating. Exchange outflows at 3-month highs, suggesting reduced selling pressure. ETH showing neutral patterns.</p>
            </div>
            <div>
              <div className="text-blue-400 font-semibold mb-1">📊 Market Structure</div>
              <p className="text-slate-400">BTC above key weekly VWAP. Funding rates elevated but not extreme (&lt;0.05%). Open interest increasing — caution on leverage.</p>
            </div>
            <div>
              <div className="text-amber-400 font-semibold mb-1">⚡ On-Chain Signals</div>
              <p className="text-slate-400">Stablecoin supply ratio improving. Exchange reserves declining for BTC/ETH. Developer activity elevated on SOL ecosystem.</p>
            </div>
          </div>
        </div>

        {/* Asset Table */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2">
              <Bitcoin size={14} className="text-amber-400" />
              <span className="text-sm font-semibold text-white">Cryptocurrency Watchlist</span>
            </div>
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
                <th>Funding Rate</th>
                <th>Whale Activity</th>
                <th>Exchange Flow</th>
              </tr>
            </thead>
            <tbody>
              {mockCryptoAssets.map((asset, i) => (
                <tr key={asset.id}>
                  <td className="text-slate-500 text-xs">{i + 1}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center text-xs font-bold text-amber-400">
                        {asset.symbol.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{asset.symbol}</div>
                        <div className="text-[10px] text-slate-500">{asset.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="tabular font-semibold text-white text-sm">{fmtCurrency(asset.price, asset.price > 1000)}</td>
                  <td>
                    <div className={cn('flex items-center gap-1 font-semibold text-xs tabular',
                      asset.change24h >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                      {asset.change24h >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                      {fmtPct(asset.change24h)}
                    </div>
                  </td>
                  <td>
                    <span className={cn('tabular font-semibold text-xs',
                      asset.change7d >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                      {fmtPct(asset.change7d)}
                    </span>
                  </td>
                  <td className="tabular text-slate-400 text-xs">${fmtCompact(asset.volume24h)}</td>
                  <td className="tabular text-slate-400 text-xs">${fmtCompact(asset.marketCap)}</td>
                  <td>
                    {asset.fundingRate !== undefined ? (
                      <span className={cn('tabular text-xs font-semibold',
                        asset.fundingRate > 0.02 ? 'text-red-400' : asset.fundingRate > 0 ? 'text-amber-400' : 'text-emerald-400')}>
                        {(asset.fundingRate * 100).toFixed(3)}%
                      </span>
                    ) : <span className="text-slate-600">—</span>}
                  </td>
                  <td>
                    {asset.whaleActivity ? (
                      <span className={cn('badge text-[10px]',
                        asset.whaleActivity === 'ACCUMULATING' ? 'badge-green' :
                        asset.whaleActivity === 'DISTRIBUTING' ? 'badge-red' : 'badge-muted')}>
                        {asset.whaleActivity}
                      </span>
                    ) : <span className="text-slate-600">—</span>}
                  </td>
                  <td>
                    {asset.exchangeNetflow !== undefined ? (
                      <span className={cn('tabular text-xs font-semibold',
                        asset.exchangeNetflow < 0 ? 'text-emerald-400' : 'text-red-400')}>
                        {asset.exchangeNetflow < 0 ? '' : '+'}{fmtCompact(asset.exchangeNetflow)} BTC
                      </span>
                    ) : <span className="text-slate-600">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Key metrics for BTC */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card p-4">
            <div className="text-xs font-semibold mb-3 text-amber-400">BITCOIN DERIVATIVES</div>
            <div className="space-y-2 text-xs">
              {[
                { label: 'Funding Rate (Perp)', value: '0.012%', note: 'Slightly bullish bias' },
                { label: 'Open Interest', value: '$18.2B', note: 'Rising — monitor leverage' },
                { label: 'Long/Short Ratio', value: '1.42', note: 'Longs dominant' },
                { label: 'Options Put/Call', value: '0.68', note: 'Bullish skew' },
                { label: 'Futures Basis', value: '+8.2% ann', note: 'Contango — healthy' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                  <div className="text-right">
                    <span className="font-bold text-white">{item.value}</span>
                    <div className="text-[10px] text-slate-500">{item.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-4">
            <div className="text-xs font-semibold mb-3 text-blue-400">ON-CHAIN METRICS (BTC)</div>
            <div className="space-y-2 text-xs">
              {[
                { label: 'Exchange Reserve', value: '2.31M BTC', note: '↓ Decreasing' },
                { label: 'Active Addresses', value: '982K / day', note: '↑ Rising' },
                { label: 'SOPR (7d MA)', value: '1.04', note: 'Profitable selling' },
                { label: 'MVRV Ratio', value: '2.18', note: 'Moderate — not overheated' },
                { label: 'Stablecoin SR', value: '12.4%', note: 'Dry powder available' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                  <div className="text-right">
                    <span className="font-bold text-white">{item.value}</span>
                    <div className="text-[10px] text-slate-500">{item.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
