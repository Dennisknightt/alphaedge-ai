'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import { mockTradeSignals, mockSystemState, mockPortfolioMetrics, mockPredictionMarkets } from '@/lib/mock-data'
import { cn, fmtCurrency, fmtPct, fmt } from '@/lib/utils'
import { FileText, Star, Zap, Shield, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react'

const BRIEFING = `
## Global Market Conditions

Financial markets remain in a broadly constructive regime, with risk assets continuing to benefit from expectations of monetary policy easing. The Federal Reserve's data-dependent posture has created notable pricing inefficiencies in short-term prediction markets, where political anchoring is suppressing probabilities below what macro models suggest.

The macro backdrop is supportive: Core PCE continues its disinflationary trend, labor markets are softening gradually without alarming deterioration, and the yield curve is slowly normalizing. These conditions are historically consistent with central banks pivoting toward accommodation.

## Top Opportunity Highlight

The most compelling opportunity today is the **Federal Reserve Q3 Rate Cut** market on Polymarket (currently priced at 41%). Our AI probability model estimates 59% — a statistically significant 18 percentage point edge. CME FedWatch futures corroborate this divergence, showing 62% probability. The market appears anchored to hawkish FOMC commentary from January, which pre-dates three sequential softer CPI prints.

Secondary opportunity: **Starship Orbital 2025** (58% market vs. 76% AI estimate). Post-Flight 9 success, FAA licensing is on accelerated track. The market discount appears to be driven by historical SpaceX timeline skepticism rather than current technical evidence.

## Risk Considerations

- **Crypto markets** require caution: funding rates are elevated and open interest rising. BTC positions should be sized conservatively.
- **Forex volatility** is expected to spike around the ECB decision (Jun 12) and FOMC (Jun 18). Avoid new forex positions in the 48 hours preceding these events.
- **Equity valuations** remain stretched on a forward P/E basis. No equity signals currently meet the 8/10 confidence threshold.

## Strategic Outlook (Next 48 Hours)

Maintain current approved positions with original stop-loss levels. No new positions recommended pending next Fed communication. The two approved signals (Fed Rate Cut, Starship Orbital) are sized within Kelly fraction limits. Capital preservation posture remains priority. If CPI data (Jun 11) prints above 3.3%, reassess Fed Rate Cut position immediately.
`.trim()

export default function BriefingPage() {
  const [generating, setGenerating] = useState(false)
  const [generatedAt] = useState(new Date())

  const qualified = mockPredictionMarkets.filter(m => Math.abs(m.edge) >= 10 && m.confidence >= 8)

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Daily Executive Briefing" subtitle={`Generated ${generatedAt.toLocaleString()}`} systemState={mockSystemState} />

      <div className="p-5 space-y-5">

        {/* Action bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={15} className="text-blue-400" />
            <span className="text-sm font-semibold text-white">Intelligence Briefing — {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <button
            onClick={() => { setGenerating(true); setTimeout(() => setGenerating(false), 2000) }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-blue-400 border border-blue-500/30 hover:bg-blue-500/10 transition-all"
          >
            <RefreshCw size={12} className={cn(generating && 'animate-spin')} />
            {generating ? 'Generating…' : 'Regenerate Briefing'}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-5">

          {/* Briefing text */}
          <div className="col-span-2 space-y-4">

            {/* Main briefing */}
            <div className="card p-6">
              <div className="prose prose-invert prose-sm max-w-none">
                {BRIEFING.split('\n\n').map((para, i) => {
                  if (para.startsWith('## ')) {
                    return <h3 key={i} className="text-sm font-bold text-blue-400 tracking-wide uppercase mt-4 mb-2 first:mt-0">{para.replace('## ', '')}</h3>
                  }
                  return (
                    <p key={i} className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
                      {para.split('**').map((s, j) =>
                        j % 2 === 1 ? <strong key={j} className="text-white font-semibold">{s}</strong> : s
                      )}
                    </p>
                  )
                })}
              </div>
            </div>

            {/* Market summaries */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { title: 'Prediction Markets', icon: TrendingUp, color: 'text-emerald-400', summary: '6 markets scanned. 2 qualified (≥10% edge, ≥8/10 conf). Fed Rate Cut and Starship Orbital are approved. 4 markets rejected.', badge: '2 APPROVED' },
                { title: 'Crypto Markets', icon: Star, color: 'text-amber-400', summary: 'BTC accumulation signals strong. No directional crypto trades qualify today — funding rates elevated, position sizing insufficient edge vs risk.', badge: 'MONITORING' },
                { title: 'Forex Markets', icon: Zap, color: 'text-blue-400', summary: 'USD weakening trend intact. EUR/USD and GBP/USD show bullish bias but upcoming central bank events warrant caution. No forex signals approved.', badge: 'CAUTION' },
                { title: 'Capital Markets', icon: AlertTriangle, color: 'text-purple-400', summary: 'US equities near all-time highs. VIX at 13.2 — low fear. No equity signals meet confidence threshold. Earnings season watchlist active.', badge: 'OBSERVING' },
              ].map(m => (
                <div key={m.title} className="card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <m.icon size={13} className={m.color} />
                      <span className="text-xs font-semibold text-white">{m.title}</span>
                    </div>
                    <span className="badge badge-muted text-[9px]">{m.badge}</span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{m.summary}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">

            {/* Top opportunities */}
            <div className="card p-4">
              <div className="text-xs font-bold text-amber-400 tracking-widest uppercase mb-3">⭐ Top Opportunities</div>
              <div className="space-y-3">
                {[
                  { label: 'Top Opportunity', signal: mockTradeSignals[0], icon: Star, color: 'text-amber-400' },
                  { label: 'Highest Confidence', signal: mockTradeSignals[1], icon: TrendingUp, color: 'text-emerald-400' },
                  { label: 'Highest EV', signal: mockTradeSignals[0], icon: Zap, color: 'text-blue-400' },
                ].map(item => item.signal && (
                  <div key={item.label} className="p-3 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <item.icon size={11} className={item.color} />
                      <span className="text-[10px] font-semibold text-slate-400">{item.label}</span>
                    </div>
                    <div className="text-xs font-semibold text-white">{item.signal.asset}</div>
                    <div className="flex gap-2 mt-1 text-[10px]">
                      <span className="text-emerald-400">EV +{(item.signal.ev * 100).toFixed(0)}%</span>
                      <span className="text-purple-400">{fmt(item.signal.confidence, 1)}/10</span>
                      <span className={cn('badge text-[10px]',
                        item.signal.direction === 'YES' ? 'badge-green' : 'badge-red')}>
                        {item.signal.direction}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Markets to avoid */}
            <div className="card p-4">
              <div className="text-xs font-bold text-red-400 tracking-widest uppercase mb-3">⚠ Markets to Avoid</div>
              <div className="space-y-2 text-xs">
                {[
                  { market: 'CPI Below 2.5%', reason: 'Insufficient edge (market prob matches AI)' },
                  { market: 'US Unemployment >5%', reason: 'Low confidence score (6.8/10)' },
                  { market: 'Any Crypto Perp', reason: 'High funding rates — EV eroded by carry' },
                ].map((item, i) => (
                  <div key={i} className="p-2 rounded" style={{ background: 'var(--red-dim)' }}>
                    <div className="font-semibold text-red-400 mb-0.5">{item.market}</div>
                    <div className="text-slate-500">{item.reason}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk warnings */}
            <div className="card p-4">
              <div className="text-xs font-bold text-amber-400 tracking-widest uppercase mb-3">Risk Warnings</div>
              <div className="space-y-2 text-xs text-slate-400">
                {[
                  'CPI release Jun 11 — potential volatility spike',
                  'ECB decision Jun 12 — EUR/USD exposure risk',
                  'FOMC Jun 18 — reassess all Fed-linked positions',
                  'BTC funding rate elevated — avoid new longs',
                ].map((w, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <span className="text-amber-400 shrink-0 mt-0.5">▸</span>{w}
                  </div>
                ))}
              </div>
            </div>

            {/* Portfolio status */}
            <div className="card p-4">
              <div className="text-xs font-bold text-blue-400 tracking-widest uppercase mb-3">Portfolio Status</div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">NAV</span>
                  <span className="font-bold text-white">{fmtCurrency(mockPortfolioMetrics.nav, true)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Daily P&L</span>
                  <span className="font-bold text-emerald-400">+{fmtCurrency(mockPortfolioMetrics.dailyPnl)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Open Positions</span>
                  <span className="font-bold text-white">{mockPortfolioMetrics.openPositions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Risk Utilized</span>
                  <span className="font-bold text-emerald-400">{fmt(mockPortfolioMetrics.riskUtilization, 1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Health Score</span>
                  <span className="font-bold text-emerald-400">{mockPortfolioMetrics.portfolioHealthScore}/100</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
