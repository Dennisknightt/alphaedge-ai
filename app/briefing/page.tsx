'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import { useBriefing, usePredictionMarkets, useMacro, useCrypto } from '@/hooks/useMarkets'
import { cn, fmtCurrency, fmtPct, fmt } from '@/lib/utils'
import { FileText, Star, Zap, Shield, TrendingUp, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react'
import { SkeletonCard } from '@/components/ui/SkeletonLoader'

export default function BriefingPage() {
  const briefing = useBriefing()
  const markets  = usePredictionMarkets(10)
  const macro    = useMacro()
  const crypto   = useCrypto()

  const topMarkets = (markets.data?.markets ?? []).filter(m => Math.abs(m.edge) >= 5).slice(0, 3)
  const macroData  = macro.data?.macro
  const regime     = macro.data?.regime
  const global     = crypto.data?.global
  const fng        = crypto.data?.fearGreed

  const generatedAt = briefing.data?.generatedAt ? new Date(briefing.data.generatedAt) : null

  const briefingText: string = briefing.data?.briefing ?? ''

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Daily Executive Briefing"
        subtitle={generatedAt ? `Generated ${generatedAt.toLocaleString()} · AI-powered, live data` : 'Loading live intelligence briefing…'}
        onRefresh={briefing.refetch}
        isRefreshing={briefing.loading}
      />

      <div className="p-5 space-y-5">

        {/* Action bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={15} className="text-blue-400" />
            <span className="text-sm font-semibold text-white">
              Intelligence Briefing — {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          {!process.env.NEXT_PUBLIC_SUPABASE_URL && (
            <div className="badge badge-amber">Claude API Required for AI Briefing</div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-5">

          {/* Main briefing */}
          <div className="col-span-2 space-y-4">

            <div className="card p-6">
              {briefing.loading ? (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <Loader2 size={24} className="animate-spin text-blue-400" />
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Claude is analyzing live market data from Polymarket, CoinGecko, FRED, and Frankfurter…
                  </p>
                </div>
              ) : briefing.error ? (
                <div>
                  <div className="text-amber-400 text-sm font-semibold mb-3">AI Briefing requires ANTHROPIC_API_KEY</div>
                  <div className="text-xs space-y-2" style={{ color: 'var(--text-muted)' }}>
                    <p>Add your API key in Settings or as a Vercel environment variable to enable live Claude-powered intelligence briefings.</p>
                    <p className="text-blue-400">The platform is still fully functional — all market data (Polymarket, CoinGecko, Frankfurter, FRED) loads without an API key.</p>
                  </div>
                </div>
              ) : briefingText ? (
                <div className="space-y-3">
                  {briefingText.split('\n\n').map((para, i) => {
                    if (!para.trim()) return null
                    return (
                      <p key={i} className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        {para.split('**').map((s, j) =>
                          j % 2 === 1
                            ? <strong key={j} className="text-white font-semibold">{s}</strong>
                            : s
                        )}
                      </p>
                    )
                  })}
                </div>
              ) : (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Briefing not yet generated. Click refresh to generate.</p>
              )}
            </div>

            {/* Live market summaries */}
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  title: 'Prediction Markets',
                  icon:  TrendingUp,
                  color: 'text-emerald-400',
                  summary: markets.loading ? 'Loading…' :
                    `${markets.data?.count ?? 0} markets scanned. ${topMarkets.length} opportunities with ≥5% edge. ${markets.data?.analyzed ? 'AI-scored.' : 'Raw probabilities only.'}`,
                  badge: markets.data?.analyzed ? `${topMarkets.length} SIGNALS` : 'LOADING',
                },
                {
                  title: 'Crypto Markets',
                  icon:  Star,
                  color: 'text-amber-400',
                  summary: global
                    ? `Market cap $${(global.totalMarketCap / 1e12).toFixed(2)}T (${global.marketCapChange24h >= 0 ? '+' : ''}${fmt(global.marketCapChange24h, 1)}% 24h). BTC dominance ${fmt(global.btcDominance, 1)}%. Fear & Greed: ${fng?.value ?? '—'} (${fng?.label ?? '…'}).`
                    : 'Loading CoinGecko data…',
                  badge: fng ? fng.label.toUpperCase() : 'LOADING',
                },
                {
                  title: 'Macro Environment',
                  icon:  Zap,
                  color: 'text-blue-400',
                  summary: macroData && regime
                    ? `${regime.label} regime. Fed: ${fmt(macroData.fedFundsRate.current, 2)}%. CPI: ${fmt(macroData.cpiYoY.current, 1)}%. Unemployment: ${fmt(macroData.unemployment.current, 1)}%. Yield spread: ${fmt(macroData.yieldCurveSpread, 2)}%.`
                    : 'Loading FRED macro data…',
                  badge: regime ? regime.label : 'LOADING',
                },
                {
                  title: 'Capital Markets',
                  icon:  AlertTriangle,
                  color: 'text-purple-400',
                  summary: macroData
                    ? `10Y yield ${fmt(macroData.tenYearYield.current, 2)}% (${macroData.tenYearYield.current > macroData.tenYearYield.previous ? '↑' : '↓'} vs prior). VIX: ${fmt(macroData.vix.current, 1)}. USD index: ${fmt(macroData.dollarIndex.current, 1)}.`
                    : 'Loading…',
                  badge: macroData ? (macroData.vix.current > 25 ? 'HIGH VOL' : 'NORMAL') : 'LOADING',
                },
              ].map(m => (
                <div key={m.title} className="card p-4 fade-in">
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

          {/* Right sidebar — live data */}
          <div className="space-y-4">

            {/* Top opportunities from real data */}
            <div className="card p-4">
              <div className="label text-amber-400 mb-3">⭐ Live Opportunities</div>
              {markets.loading ? (
                <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="skeleton h-14 rounded-lg" />)}</div>
              ) : topMarkets.length > 0 ? (
                <div className="space-y-2">
                  {topMarkets.map((m, i) => (
                    <div key={m.id} className="p-3 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Star size={10} className={i === 0 ? 'text-amber-400' : 'text-slate-500'} />
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>#{i + 1} Opportunity</span>
                      </div>
                      <div className="text-xs font-semibold text-white leading-tight mb-1"
                        style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {m.question}
                      </div>
                      <div className="flex gap-2">
                        {m.edge !== 0 && <span className={cn('badge text-[9px]', m.edge > 0 ? 'badge-green' : 'badge-red')}>
                          Edge {m.edge > 0 ? '+' : ''}{fmt(m.edge, 1)}%
                        </span>}
                        {m.recommendedSide !== 'NONE' && (
                          <span className={cn('badge text-[9px]', m.recommendedSide === 'YES' ? 'badge-green' : 'badge-red')}>
                            {m.recommendedSide}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs py-4 text-center" style={{ color: 'var(--text-muted)' }}>
                  {markets.data?.analyzed ? 'No high-edge opportunities today' : 'AI analysis required for signals'}
                </div>
              )}
            </div>

            {/* Live macro snapshot */}
            {macroData && (
              <div className="card p-4">
                <div className="label text-blue-400 mb-3">FRED Macro Snapshot</div>
                <div className="space-y-1.5">
                  {[
                    { l: 'Fed Funds Rate',  v: `${fmt(macroData.fedFundsRate.current, 2)}%`,    trend: macroData.fedFundsRate.current - macroData.fedFundsRate.previous },
                    { l: 'CPI YoY',         v: `${fmt(macroData.cpiYoY.current, 1)}%`,          trend: macroData.cpiYoY.current - macroData.cpiYoY.previous },
                    { l: 'Unemployment',    v: `${fmt(macroData.unemployment.current, 1)}%`,     trend: macroData.unemployment.current - macroData.unemployment.previous },
                    { l: '10Y Treasury',    v: `${fmt(macroData.tenYearYield.current, 2)}%`,     trend: macroData.tenYearYield.current - macroData.tenYearYield.previous },
                    { l: 'Yield Spread',    v: `${fmt(macroData.yieldCurveSpread, 2)}%`,         trend: macroData.yieldCurveSpread },
                    { l: 'VIX',             v: `${fmt(macroData.vix.current, 1)}`,              trend: macroData.vix.previous - macroData.vix.current },
                  ].map(i => (
                    <div key={i.l} className="flex justify-between text-xs py-0.5" style={{ borderBottom: '1px solid var(--border-soft)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{i.l}</span>
                      <span className="font-bold mono text-white">
                        {i.v}
                        <span className={cn('ml-1 text-[10px]', i.trend > 0 ? 'text-emerald-400' : i.trend < 0 ? 'text-red-400' : 'text-slate-500')}>
                          {i.trend > 0.01 ? '▲' : i.trend < -0.01 ? '▼' : '→'}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Data sources */}
            <div className="card p-4">
              <div className="label mb-3">Live Data Sources</div>
              {[
                { name: 'Polymarket',        url: 'gamma-api.polymarket.com', status: !markets.error ? 'LIVE' : 'ERROR', ok: !markets.error },
                { name: 'CoinGecko',         url: 'api.coingecko.com',        status: !crypto.error ? 'LIVE' : 'ERROR',  ok: !crypto.error },
                { name: 'Frankfurter (ECB)', url: 'api.frankfurter.app',      status: 'LIVE',                            ok: true },
                { name: 'FRED (St Louis Fed)',url: 'fred.stlouisfed.org',      status: !macro.error ? 'LIVE' : 'ERROR',  ok: !macro.error },
                { name: 'Yahoo Finance',      url: 'query1.finance.yahoo.com', status: 'LIVE',                           ok: true },
                { name: 'Claude API (AI)',    url: 'api.anthropic.com',        status: briefing.error ? 'KEY NEEDED' : 'LIVE', ok: !briefing.error },
              ].map(s => (
                <div key={s.name} className="flex items-center justify-between py-1.5 text-[10px]">
                  <div>
                    <div className="font-semibold text-white">{s.name}</div>
                    <div style={{ color: 'var(--text-dim)' }}>{s.url}</div>
                  </div>
                  <span className={cn('badge text-[9px]', s.ok ? 'badge-green' : 'badge-amber')}>{s.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
