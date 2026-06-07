'use client'

import { useState, useEffect, useCallback } from 'react'
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
import {
  mockPortfolioMetrics, mockSystemState, mockSystemMetrics,
  mockTradeSignals, mockPredictionMarkets, generatePnlHistory
} from '@/lib/mock-data'

const pnlHistory = generatePnlHistory(90)

export default function Dashboard() {
  const [refreshing, setRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await new Promise(r => setTimeout(r, 1500))
    setLastRefresh(new Date())
    setRefreshing(false)
  }, [])

  useEffect(() => {
    const t = setInterval(handleRefresh, 5 * 60 * 1000)
    return () => clearInterval(t)
  }, [handleRefresh])

  const topSignal = mockTradeSignals.find(s => s.status === 'APPROVED') ?? null

  return (
    <div className="flex flex-col flex-1">
      <Header
        title="Master Dashboard"
        subtitle={`AlphaEdge AI · Last scan ${lastRefresh.toLocaleTimeString()}`}
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
      />

      <div className="flex-1 p-5 space-y-4">

        {/* Kill switch — only visible when triggered */}
        <KillSwitch systemState={mockSystemState} />

        {/* The 3 core questions every institutional manager needs answered */}
        <AnswerCards
          portfolio={mockPortfolioMetrics}
          system={mockSystemState}
          topSignal={topSignal}
        />

        {/* Metric grid */}
        <MetricGrid portfolio={mockPortfolioMetrics} system={mockSystemMetrics} />

        {/* Main content */}
        <div className="grid grid-cols-3 gap-4">

          {/* Left col — opportunities + chart + scanner */}
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
            <MarketScanner markets={mockPredictionMarkets} />
          </div>

          {/* Right col — meters + risk + agents */}
          <div className="space-y-4">
            <ExecutiveMeters portfolio={mockPortfolioMetrics} system={mockSystemState} />
            <RiskPanel portfolio={mockPortfolioMetrics} />
            <AgentNetwork agents={mockSystemState.agentStatuses} />
          </div>
        </div>

        {/* Execution mode footer */}
        <div className="card p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="label mb-2">Execution Mode</div>
              <div className="flex items-center gap-1">
                {(['RESEARCH', 'PAPER', 'FORWARD', 'LIVE'] as const).map((mode, i) => {
                  const active = mode === mockSystemState.executionMode
                  const locked = mode === 'LIVE' && !mockSystemMetrics.liveUnlocked
                  return (
                    <div key={mode} className="flex items-center">
                      {i > 0 && <div className="w-6 h-px mx-1" style={{ background: 'var(--border)' }} />}
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-semibold"
                        style={{
                          background: active ? 'var(--accent-soft)' : 'transparent',
                          border: active ? '1px solid var(--accent-mid)' : '1px solid transparent',
                          color: active ? 'var(--accent)' : locked ? 'var(--text-dim)' : 'var(--text-muted)',
                        }}>
                        {locked && '🔒 '}
                        {mode}
                        {active && <span className="w-1.5 h-1.5 rounded-full live-dot ml-1" style={{ background: 'var(--accent)' }} />}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              <span>Paper trades: </span>
              <span className={mockSystemMetrics.paperTrades >= 100 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                {mockSystemMetrics.paperTrades}/100
              </span>
              <span className="mx-3">Win Rate: </span>
              <span className="text-white font-bold">{mockSystemMetrics.winRate.toFixed(1)}%</span>
              <span className="mx-3">Historical ROI: </span>
              <span className="text-emerald-400 font-bold">+{mockSystemMetrics.historicalRoi.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
