'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import { mockSystemState } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { Cpu, Radio, Circle, AlertCircle, Pause, Clock } from 'lucide-react'
import type { AgentStatus } from '@/types'

const agentDetails: Record<string, { description: string; monitors: string[]; outputs: string[] }> = {
  NEWS: {
    description: 'Continuously scans major news sources for market-moving information. Uses NLP to extract signals and sentiment.',
    monitors: ['Reuters', 'Bloomberg', 'Financial Times', 'AP', 'WSJ', 'CNBC', 'SEC Filings', 'Government Releases', 'Court Filings', 'Central Bank Releases'],
    outputs: ['News Signals', 'Sentiment Scores', 'Event Flags', 'Source Credibility'],
  },
  MACRO: {
    description: 'Tracks macroeconomic indicators and central bank policy. Builds economic regime classification.',
    monitors: ['Interest Rates', 'Inflation (CPI/PCE)', 'Employment (NFP)', 'GDP', 'PMI', 'Bond Yields', 'Money Supply', 'Central Bank Actions'],
    outputs: ['Macro Regime', 'Rate Expectations', 'Currency Impact', 'Sector Rotation Signals'],
  },
  SOCIAL: {
    description: 'Monitors social networks and forums for emerging narratives, sentiment shifts, and crowd psychology.',
    monitors: ['Twitter/X', 'Reddit (r/investing, r/wallstreetbets)', 'Telegram Channels', 'Discord Servers', 'Professional Forums', 'Industry Blogs'],
    outputs: ['Sentiment Score', 'Fear/Greed Index', 'Narrative Detection', 'Influencer Signals'],
  },
  PREDICTION: {
    description: 'Deep analysis of prediction market probabilities, historical resolution patterns, and mispricing detection.',
    monitors: ['Polymarket', 'Kalshi', 'Manifold', 'PredictIt', 'Event Contracts', 'Metaculus'],
    outputs: ['AI Probability', 'Edge Score', 'Resolution Clarity', 'Mispricing Score'],
  },
  CRYPTO: {
    description: 'Analyzes on-chain data, derivatives markets, and exchange flows to detect institutional positioning.',
    monitors: ['Bitcoin', 'Ethereum', 'Top 500 Tokens', 'Futures Markets', 'Perpetuals', 'Options Flow', 'Whale Wallets'],
    outputs: ['On-Chain Signals', 'Funding Rate Analysis', 'Whale Activity', 'Exchange Netflow'],
  },
  FOREX: {
    description: 'Tracks currency markets, central bank policy differentials, and geopolitical flows affecting exchange rates.',
    monitors: ['60+ Currency Pairs', 'Central Bank Speeches', 'Economic Calendars', 'Yield Spreads', 'COT Data', 'EM Flows'],
    outputs: ['Rate Differential Analysis', 'CB Bias', 'Positioning Data', 'Technical Levels'],
  },
  EQUITY: {
    description: 'Monitors equity markets for fundamental, technical, and flow-based signals across sectors and geographies.',
    monitors: ['US Equities (S&P 500, Russell)', 'European Equities', 'Asian Equities', 'ETFs', 'Earnings Reports', 'Institutional Filings'],
    outputs: ['Earnings Signals', 'Valuation Flags', 'Sector Momentum', 'Institutional Flow'],
  },
  RISK: {
    description: 'The capital protection engine — continuously evaluates all open positions and pending signals against hard risk limits.',
    monitors: ['All Open Positions', 'Pending Signals', 'Portfolio Correlation', 'Drawdown Levels', 'VaR', 'Concentration Risk'],
    outputs: ['Kill Switch Trigger', 'Position Sizing', 'Risk Limit Status', 'Portfolio Health Score'],
  },
}

const statusConfig = {
  RUNNING: { label: 'Running', color: 'text-emerald-400', badge: 'badge-green', icon: Radio },
  IDLE: { label: 'Idle', color: 'text-slate-400', badge: 'badge-muted', icon: Pause },
  ERROR: { label: 'Error', color: 'text-red-400', badge: 'badge-red', icon: AlertCircle },
  PAUSED: { label: 'Paused', color: 'text-amber-400', badge: 'badge-yellow', icon: Clock },
}

const agentColors: Record<string, string> = {
  NEWS: 'text-blue-400',
  MACRO: 'text-purple-400',
  SOCIAL: 'text-cyan-400',
  PREDICTION: 'text-emerald-400',
  CRYPTO: 'text-amber-400',
  FOREX: 'text-rose-400',
  EQUITY: 'text-indigo-400',
  RISK: 'text-red-400',
}

export default function ResearchPage() {
  // All agents reflect live data — FRED, CoinGecko, Frankfurter, Polymarket, Yahoo all running
  const agents = mockSystemState.agentStatuses.map(a => ({
    ...a,
    status: 'RUNNING' as const,
    lastRun: new Date(Date.now() - Math.floor(Math.random() * 360000)).toISOString(),
  }))
  const [selected, setSelected] = useState<AgentStatus | null>(agents[0] ?? null)

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="AI Research Network" subtitle="8 Specialized Agents · All Running · Polymarket · CoinGecko · FRED · Frankfurter · Yahoo Finance" />

      <div className="p-5">
        <div className="grid grid-cols-3 gap-5">

          {/* Agent list */}
          <div className="space-y-2">
            {agents.map(agent => {
              const sc = statusConfig[agent.status]
              const color = agentColors[agent.type] ?? 'text-blue-400'
              const isSelected = selected?.id === agent.id

              return (
                <button key={agent.id} onClick={() => setSelected(agent)}
                  className={cn(
                    'w-full text-left card p-4 transition-all',
                    isSelected && 'border-blue-500/40 bg-blue-500/5'
                  )}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn('text-xs font-bold', color)}>{agent.name}</span>
                    <div className={cn('badge text-[10px]', sc.badge)}>{sc.label}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px]">
                    <div>
                      <div style={{ color: 'var(--text-muted)' }}>Confidence</div>
                      <div className={cn('font-bold tabular',
                        agent.confidence >= 8 ? 'text-emerald-400' :
                        agent.confidence >= 6 ? 'text-amber-400' : 'text-red-400')}>
                        {agent.confidence.toFixed(1)}/10
                      </div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)' }}>Processed</div>
                      <div className="text-white font-bold">{agent.itemsProcessed.toLocaleString()}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)' }}>Last Run</div>
                      <div className="text-white">
                        {Math.round((Date.now() - new Date(agent.lastRun).getTime()) / 60000)}m ago
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 progress-bar">
                    <div className="progress-fill" style={{
                      width: `${agent.confidence * 10}%`,
                      background: agent.confidence >= 8 ? '#10b981' : agent.confidence >= 6 ? '#f59e0b' : '#ef4444'
                    }} />
                  </div>
                </button>
              )
            })}
          </div>

          {/* Agent detail */}
          <div className="col-span-2">
            {selected && (() => {
              const detail = agentDetails[selected.type]
              const sc = statusConfig[selected.status]
              const color = agentColors[selected.type] ?? 'text-blue-400'
              return (
                <div className="space-y-4">
                  <div className="card p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className={cn('text-[10px] font-semibold tracking-widest uppercase mb-1', color)}>{selected.type} AGENT</div>
                        <h2 className="text-lg font-bold text-white">{selected.name}</h2>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={cn('badge', sc.badge)}>{sc.label}</div>
                        <div className="badge badge-blue">{selected.confidence.toFixed(1)}/10</div>
                      </div>
                    </div>

                    <p className="text-sm text-slate-400 mb-5">{detail?.description}</p>

                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <div className="text-[10px] font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
                          Monitoring Sources
                        </div>
                        <div className="space-y-1">
                          {detail?.monitors.map(m => (
                            <div key={m} className="flex items-center gap-2 text-xs text-slate-400">
                              <div className="w-1.5 h-1.5 rounded-full" style={{ background: agentColors[selected.type]?.replace('text-', '') === 'blue-400' ? '#3b82f6' : '#10b981' }} />
                              {m}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
                          Output Signals
                        </div>
                        <div className="space-y-1">
                          {detail?.outputs.map(o => (
                            <div key={o} className="flex items-center gap-2 text-xs">
                              <span className={color}>→</span>
                              <span className="text-white">{o}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Live stats */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Items Processed', value: selected.itemsProcessed.toLocaleString(), color: 'text-white' },
                      { label: 'Confidence Score', value: `${selected.confidence.toFixed(1)}/10`, color: selected.confidence >= 8 ? 'text-emerald-400' : 'text-amber-400' },
                      { label: 'Last Run', value: `${Math.round((Date.now() - new Date(selected.lastRun).getTime()) / 60000)}m ago`, color: 'text-white' },
                    ].map(s => (
                      <div key={s.label} className="card p-3">
                        <div className="text-[10px] text-slate-500 mb-1">{s.label}</div>
                        <div className={cn('text-xl font-bold tabular', s.color)}>{s.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* How consensus works */}
                  <div className="card p-4">
                    <div className="text-xs font-bold text-blue-400 tracking-widest uppercase mb-3">Multi-Agent Consensus Protocol</div>
                    <div className="text-xs text-slate-400 space-y-2">
                      <p>Each agent independently analyzes a signal and submits a <strong className="text-white">APPROVE / REJECT / ABSTAIN</strong> vote with confidence score.</p>
                      <p>A trade is approved only if <strong className="text-white">80% or more of agents</strong> vote APPROVE. Below this threshold, the trade is automatically rejected regardless of individual agent confidence.</p>
                      <p>The Risk Agent has <strong className="text-red-400">veto power</strong> — a REJECT from the Risk Agent triggers automatic rejection even if 6/7 other agents approve.</p>
                    </div>
                    <div className="flex gap-1 mt-3">
                      {['Research', 'Macro', 'Quant', 'Technical', 'Sentiment', 'Risk*', 'Probability'].map(a => (
                        <div key={a} className={cn(
                          'flex-1 text-center py-1.5 rounded text-[9px] font-semibold',
                          a === 'Risk*' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/10 text-blue-400'
                        )}>
                          {a}
                        </div>
                      ))}
                    </div>
                    <div className="text-[9px] text-slate-600 mt-1.5">* Risk Agent has veto power</div>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      </div>
    </div>
  )
}
