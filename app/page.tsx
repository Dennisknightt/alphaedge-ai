'use client'

import { useState, useEffect, useCallback } from 'react'
import Header from '@/components/layout/Header'
import MetricGrid from '@/components/dashboard/MetricGrid'
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
import type { SystemState } from '@/types'

export default function Dashboard() {
  const [refreshing, setRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [systemState] = useState<SystemState>(mockSystemState)
  const pnlHistory = generatePnlHistory(90)

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await new Promise(r => setTimeout(r, 1800))
    setLastRefresh(new Date())
    setRefreshing(false)
  }, [])

  useEffect(() => {
    const timer = setInterval(handleRefresh, 5 * 60 * 1000)
    return () => clearInterval(timer)
  }, [handleRefresh])

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="AlphaEdge AI"
        subtitle={`Master Dashboard · Last scan ${lastRefresh.toLocaleTimeString()}`}
        systemState={systemState}
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
      />

      <div className="flex-1 p-5 space-y-5">
        <KillSwitch systemState={systemState} />

        <MetricGrid portfolio={mockPortfolioMetrics} system={mockSystemMetrics} />

        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-2 space-y-5">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-sm font-bold text-white">Approved Opportunities</h2>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    80%+ agent consensus · Confidence ≥ 8 · EV &gt; 0 · R:R ≥ 2:1
                  </p>
                </div>
                <div className="badge badge-green">{mockTradeSignals.filter(s => s.status === 'APPROVED').length} APPROVED</div>
              </div>
              <OpportunityFeed signals={mockTradeSignals} />
            </div>

            <PnLChart data={pnlHistory} startCapital={100000} />
            <MarketScanner markets={mockPredictionMarkets} />
          </div>

          <div className="space-y-5">
            <RiskPanel portfolio={mockPortfolioMetrics} />
            <AgentNetwork agents={systemState.agentStatuses} />
          </div>
        </div>

        {/* Execution Mode Tracker */}
        <div className="card p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="text-[10px] font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
                Execution Mode
              </div>
              <div className="flex items-center gap-1">
                {(['RESEARCH', 'PAPER', 'FORWARD', 'LIVE'] as const).map((mode, i) => {
                  const active = mode === systemState.executionMode
                  const locked = mode === 'LIVE' && !mockSystemMetrics.liveUnlocked
                  return (
                    <div key={mode} className="flex items-center">
                      {i > 0 && <div className="w-8 h-px mx-1" style={{ background: 'var(--border)' }} />}
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold ${
                        active
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : locked
                          ? 'text-slate-700 border border-transparent'
                          : 'text-slate-500 border border-transparent'
                      }`}>
                        {locked && <span>🔒</span>}
                        {mode}
                        {active && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 pulse-live" />}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              <div className="mb-0.5">
                Live trading unlocks after: <span className="text-white">100 paper trades · +EV · Win Rate ≥ 55% · Controlled DD</span>
              </div>
              <div>
                Paper trades: <span className={mockSystemMetrics.paperTrades >= 100 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                  {mockSystemMetrics.paperTrades}/100
                </span>
                <span className="ml-4">Win Rate: <span className="text-white font-bold">{mockSystemMetrics.winRate.toFixed(1)}%</span></span>
                <span className="ml-4">ROI: <span className="text-emerald-400 font-bold">+{mockSystemMetrics.historicalRoi.toFixed(1)}%</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
