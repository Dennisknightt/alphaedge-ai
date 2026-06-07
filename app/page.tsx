'use client'

import { usePredictionMarkets, useCrypto, useMacro } from '@/hooks/useMarkets'
import Header from '@/components/layout/Header'
import MetricGrid from '@/components/dashboard/MetricGrid'
import AnswerCards from '@/components/dashboard/AnswerCards'
import ExecutiveMeters from '@/components/dashboard/ExecutiveMeters'
import OpportunityFeed from '@/components/dashboard/OpportunityFeed'
import PnLChart from '@/components/dashboard/PnLChart'
import RiskPanel from '@/components/dashboard/RiskPanel'
import AgentNetwork from '@/components/dashboard/AgentNetwork'
import MarketScanner from '@/components/dashboard/MarketScanner'
import KillSwitch from '@/components/dashboard/KillSwitch'
import { mockPortfolioMetrics, mockSystemState, mockSystemMetrics, mockTradeSignals } from '@/lib/mock-data'
import { generatePnlHistory } from '@/lib/mock-data'
import { cn, fmt } from '@/lib/utils'

// Dashboard uses a mix: live market data + static portfolio (no live trades yet)
const pnlHistory = generatePnlHistory(90)

export default function Dashboard() {
  const { data: marketsData, loading: marketsLoading, refetch, lastFetch } = usePredictionMarkets(30)
  const { data: cryptoData  } = useCrypto()
  const { data: macroData   } = useMacro()

  // Use live markets where available, fall back to empty
  const liveMarkets = marketsData?.markets ?? []
  const analyzed    = marketsData?.analyzed ?? false

  // Build agent statuses with live data availability
  const agentStatuses = mockSystemState.agentStatuses.map(a => ({
    ...a,
    status: (
      a.type === 'PREDICTION' ? (marketsLoading ? 'RUNNING' as const : 'IDLE' as const) :
      a.type === 'CRYPTO'     ? 'RUNNING' as const :
      a.type === 'MACRO'      ? (macroData ? 'IDLE' as const : 'RUNNING' as const) :
      a.status
    ),
  }))

  const systemState = { ...mockSystemState, agentStatuses }

  // Update market conditions score based on real macro
  const macroRiskScore = macroData?.regime?.riskScore ?? 50
  const systemMetrics  = {
    ...mockSystemMetrics,
    marketConditions: 100 - macroRiskScore,
    totalMarketsScanned: liveMarkets.length || mockSystemMetrics.totalMarketsScanned,
    opportunitiesFound:  liveMarkets.filter(m => Math.abs(m.edge) >= 10 && m.confidence >= 7).length || mockSystemMetrics.opportunitiesFound,
  }

  const topSignal = mockTradeSignals.find(s => s.status === 'APPROVED') ?? null

  return (
    <div className="flex flex-col flex-1">
      <Header
        title="Master Dashboard"
        subtitle={`AlphaEdge AI · Live data${lastFetch ? ` · Updated ${lastFetch.toLocaleTimeString()}` : ''}`}
        onRefresh={refetch}
        isRefreshing={marketsLoading}
      />

      <div className="flex-1 p-5 space-y-4">

        <KillSwitch systemState={systemState} />

        {/* The 3 core questions */}
        <AnswerCards
          portfolio={mockPortfolioMetrics}
          system={systemState}
          topSignal={topSignal}
        />

        {/* Metric grid */}
        <MetricGrid portfolio={mockPortfolioMetrics} system={systemMetrics} />

        {/* Data freshness notice */}
        <div className="flex items-center gap-4 px-1 text-[10px]" style={{ color: 'var(--text-dim)' }}>
          <div className="flex items-center gap-1.5">
            <div className={cn('w-1.5 h-1.5 rounded-full', liveMarkets.length > 0 ? 'bg-emerald-400 live-dot' : 'bg-amber-400')} />
            <span>Polymarket: {liveMarkets.length > 0 ? `${liveMarkets.length} live markets` : 'loading…'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={cn('w-1.5 h-1.5 rounded-full', cryptoData ? 'bg-emerald-400 live-dot' : 'bg-amber-400')} />
            <span>CoinGecko: {cryptoData ? `${cryptoData.assets.length} assets` : 'loading…'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={cn('w-1.5 h-1.5 rounded-full', macroData ? 'bg-emerald-400 live-dot' : 'bg-amber-400')} />
            <span>FRED Macro: {macroData ? macroData.regime?.label : 'loading…'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={cn('w-1.5 h-1.5 rounded-full', analyzed ? 'bg-emerald-400 live-dot' : 'bg-slate-600')} />
            <span>AI Analysis: {analyzed ? 'Claude active' : 'API key required'}</span>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-sm font-semibold text-white">Approved Opportunities</h2>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    80%+ consensus · Conf ≥ 8 · EV &gt; 0 · R:R ≥ 2:1 · Reality check passed
                  </p>
                </div>
                <div className="badge badge-green">
                  {mockTradeSignals.filter(s => s.status === 'APPROVED').length} approved
                </div>
              </div>
              <OpportunityFeed signals={mockTradeSignals} />
            </div>

            <PnLChart data={pnlHistory} startCapital={100000} />

            {/* Live market scanner */}
            {liveMarkets.length > 0 ? (
              <MarketScanner markets={liveMarkets} />
            ) : (
              <div className="card p-4">
                <div className="label mb-3">Prediction Market Scanner</div>
                <div className="space-y-2">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="skeleton h-3 rounded flex-1" />
                      <div className="skeleton h-3 w-16 rounded" />
                      <div className="skeleton h-3 w-12 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <ExecutiveMeters portfolio={mockPortfolioMetrics} system={systemState} />
            <RiskPanel portfolio={mockPortfolioMetrics} />
            <AgentNetwork agents={agentStatuses} />
          </div>
        </div>

        {/* Execution mode */}
        <div className="card p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="label mb-2">Execution Mode</div>
              <div className="flex items-center gap-1">
                {(['RESEARCH', 'PAPER', 'FORWARD', 'LIVE'] as const).map((mode, i) => {
                  const active = mode === systemState.executionMode
                  const locked = mode === 'LIVE' && !systemMetrics.liveUnlocked
                  return (
                    <div key={mode} className="flex items-center">
                      {i > 0 && <div className="w-6 h-px mx-1" style={{ background: 'var(--border)' }} />}
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-semibold"
                        style={{
                          background: active ? 'var(--accent-soft)' : 'transparent',
                          border: active ? '1px solid var(--accent-mid)' : '1px solid transparent',
                          color: active ? 'var(--accent)' : locked ? 'var(--text-dim)' : 'var(--text-muted)',
                        }}>
                        {locked && '🔒 '}{mode}
                        {active && <span className="w-1.5 h-1.5 rounded-full live-dot ml-1" style={{ background: 'var(--accent)' }} />}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              Paper trades: <span className="text-amber-400 font-bold">{systemMetrics.paperTrades}/100</span>
              <span className="mx-3">Win Rate: <span className="text-white font-bold">{fmt(systemMetrics.winRate, 1)}%</span></span>
              <span>ROI: <span className="text-emerald-400 font-bold">+{fmt(systemMetrics.historicalRoi, 1)}%</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
