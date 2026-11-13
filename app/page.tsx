'use client'

import { usePredictionMarkets, useMacro } from '@/hooks/useMarkets'
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
import { mockPortfolioMetrics, mockSystemState, mockSystemMetrics, mockTradeSignals, generatePnlHistory } from '@/lib/mock-data'
import { fmt } from '@/lib/utils'

const pnlHistory = generatePnlHistory(90)

export default function Dashboard() {
  const { data: marketsData, loading: marketsLoading, refetch, lastFetch } = usePredictionMarkets(30)
  const { data: macroData } = useMacro()

  const liveMarkets = marketsData?.markets ?? []

  const agentStatuses = mockSystemState.agentStatuses.map(a => ({
    ...a, status: 'RUNNING' as const,
    lastRun: new Date(Date.now() - Math.floor(Math.random() * 300000)).toISOString(),
    itemsProcessed: a.itemsProcessed + Math.floor(Math.random() * 20),
  }))

  const systemState = { ...mockSystemState, agentStatuses }

  const macroRiskScore = macroData?.regime?.riskScore ?? 50
  const systemMetrics  = {
    ...mockSystemMetrics,
    marketConditions:    100 - macroRiskScore,
    totalMarketsScanned: liveMarkets.length || mockSystemMetrics.totalMarketsScanned,
    opportunitiesFound:  liveMarkets.filter(m => Math.abs(m.edge) >= 10 && m.confidence >= 7).length || mockSystemMetrics.opportunitiesFound,
  }

  const approvedSignals = mockTradeSignals.filter(s => s.status === 'APPROVED' && s.realityCheckPassed)
  const topSignal = approvedSignals[0] ?? null

  return (
    <div className="flex flex-col flex-1">
      <Header
        title="Master Dashboard"
        subtitle={lastFetch ? `Updated ${lastFetch.toLocaleTimeString()}` : 'Loading live data…'}
        onRefresh={refetch}
        isRefreshing={marketsLoading}
      />

      <div className="flex-1 p-5 space-y-5">

        {/* ── Kill switch ── */}
        <KillSwitch systemState={systemState} />

        <AnswerCards
          portfolio={mockPortfolioMetrics}
          system={systemState}
          topSignal={topSignal}
          approvedCount={approvedSignals.length}
        />

        <MetricGrid portfolio={mockPortfolioMetrics} />

        {/* ── Main two-column layout ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

          {/* Left — 2 cols: signals + chart + scanner */}
          <div className="xl:col-span-2 space-y-5">

            {/* Approved Opportunities */}
            <section>
              <div className="flex items-baseline justify-between mb-3">
                <h2 className="section-title">Opportunities</h2>
                <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  {approvedSignals.length} approved today
                </span>
              </div>
              <OpportunityFeed signals={mockTradeSignals} />
            </section>

            {/* P&L Chart */}
            <PnLChart data={pnlHistory} startCapital={100000} />

            {/* Market Scanner */}
            {liveMarkets.length > 0 ? (
              <MarketScanner markets={liveMarkets} />
            ) : (
              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="section-title">Prediction Market Scanner</div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full live-dot bg-amber-400" />
                    <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Connecting to Polymarket…</span>
                  </div>
                </div>
                <div className="space-y-3">
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

          {/* Right — sidebar: meters + risk + agents */}
          <div className="space-y-5">
            <ExecutiveMeters portfolio={mockPortfolioMetrics} system={systemState} />
            <RiskPanel portfolio={mockPortfolioMetrics} />
            <AgentNetwork agents={agentStatuses} />
          </div>
        </div>

        {/* ── Execution mode bar ── */}
        <div className="card p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="label mb-2.5">Execution Mode</div>
              <div className="flex items-center gap-1">
                {(['RESEARCH', 'PAPER', 'FORWARD', 'LIVE'] as const).map((mode, i) => {
                  const active = mode === systemState.executionMode
                  const locked = mode === 'LIVE' && !systemMetrics.liveUnlocked
                  return (
                    <div key={mode} className="flex items-center">
                      {i > 0 && <div className="w-5 h-px mx-1" style={{ background: 'var(--border)' }} />}
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors"
                        style={{
                          background: active ? 'var(--accent-soft)' : 'transparent',
                          border: active ? '1px solid var(--accent-mid)' : '1px solid transparent',
                          color: active ? 'var(--accent)' : locked ? 'var(--text-dim)' : 'var(--text-muted)',
                        }}>
                        {locked && <span className="mr-0.5">🔒</span>}{mode}
                        {active && <span className="w-1.5 h-1.5 rounded-full live-dot ml-1" style={{ background: 'var(--accent)' }} />}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="flex items-center gap-6 text-[11px]" style={{ color: 'var(--text-muted)' }}>
              <div>Paper trades <span className="text-amber-400 font-bold ml-1">{systemMetrics.paperTrades}/100</span></div>
              <div>Win Rate <span className="text-white font-bold ml-1">{fmt(systemMetrics.winRate, 1)}%</span></div>
              <div>ROI <span className="positive font-bold ml-1">+{fmt(systemMetrics.historicalRoi, 1)}%</span></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
