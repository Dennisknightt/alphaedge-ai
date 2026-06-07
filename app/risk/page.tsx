'use client'

import Header from '@/components/layout/Header'
import { mockPortfolioMetrics, mockSystemState, mockSystemMetrics } from '@/lib/mock-data'
import { cn, fmt, fmtCurrency } from '@/lib/utils'
import { Shield, AlertTriangle, XCircle, CheckCircle2 } from 'lucide-react'

function LimitCard({ label, used, max, unit = '%', hardLimit = true }: { label: string; used: number; max: number; unit?: string; hardLimit?: boolean }) {
  const pct = Math.min((used / max) * 100, 100)
  const status = pct >= 100 ? 'BREACH' : pct >= 80 ? 'WARNING' : 'SAFE'
  const color = status === 'BREACH' ? '#ef4444' : status === 'WARNING' ? '#f59e0b' : '#10b981'

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-[10px] font-semibold tracking-wider uppercase mb-0.5" style={{ color: 'var(--text-muted)' }}>{label}</div>
          {hardLimit && <div className="text-[9px] badge badge-red mt-0.5">HARD LIMIT</div>}
        </div>
        <div className={cn('badge text-[10px]',
          status === 'BREACH' ? 'badge-red' : status === 'WARNING' ? 'badge-yellow' : 'badge-green')}>
          {status}
        </div>
      </div>
      <div className="flex items-end gap-1 mb-2">
        <span className="text-2xl font-bold tabular" style={{ color }}>{fmt(used, 1)}</span>
        <span className="text-slate-500 text-sm pb-0.5">/ {max}{unit}</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="text-[10px] text-slate-600 mt-1">{pct.toFixed(0)}% of limit utilized</div>
    </div>
  )
}

export default function RiskPage() {
  const m = mockPortfolioMetrics

  const rejectionRules = [
    { rule: 'Confidence < 8/10', active: true },
    { rule: 'Expected Value ≤ 0', active: true },
    { rule: 'Risk Reward < 2:1', active: true },
    { rule: 'Liquidity Too Low', active: true },
    { rule: 'Spread Too Wide', active: true },
    { rule: 'Conflicting Data', active: true },
    { rule: 'Poor Information Quality', active: true },
    { rule: 'Insufficient Evidence', active: true },
    { rule: 'Market Manipulation Detected', active: true },
    { rule: 'Unclear Resolution Rules', active: true },
  ]

  const killSwitchTriggers = [
    { trigger: 'Daily Loss Limit Hit (3%)', active: false },
    { trigger: 'Weekly Loss Limit Hit (5%)', active: false },
    { trigger: 'Monthly Drawdown Limit Hit (10%)', active: false },
    { trigger: 'Major Data Failure', active: false },
    { trigger: 'Extreme Volatility Event', active: false },
    { trigger: 'Geopolitical Shock', active: false },
    { trigger: 'Model Confidence Collapse', active: false },
    { trigger: 'Unexpected Market Conditions', active: false },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Risk Management" subtitle="Capital Protection Engine · Hard Limits · Kill Switch System" />

      <div className="p-5 space-y-5">

        {/* Status banner */}
        <div className="card p-4 flex items-center gap-4 border-emerald-500/20 bg-emerald-500/5">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <Shield size={20} className="text-emerald-400" />
          </div>
          <div>
            <div className="text-sm font-bold text-emerald-400">Capital Protection Engine: ACTIVE</div>
            <div className="text-xs text-slate-400">All guards operational. No limits breached. Portfolio health: {m.portfolioHealthScore}/100</div>
          </div>
          <div className="ml-auto badge badge-green">ALL SYSTEMS GO</div>
        </div>

        {/* Hard limits grid */}
        <div>
          <h2 className="text-sm font-bold text-white mb-3">Hard Risk Limits</h2>
          <div className="grid grid-cols-3 gap-3">
            <LimitCard label="Risk Per Trade" used={1.0} max={1} unit="%" />
            <LimitCard label="Daily Risk" used={0} max={3} unit="%" />
            <LimitCard label="Weekly Risk" used={0} max={5} unit="%" />
            <LimitCard label="Monthly Drawdown" used={m.currentDrawdown} max={10} unit="%" />
            <LimitCard label="Single Asset Exposure" used={m.exposureByModule.PREDICTION} max={10} unit="%" />
            <LimitCard label="Single Sector Exposure" used={m.riskUtilization} max={20} unit="%" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-5">
          {/* Trade rejection rules */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <XCircle size={14} className="text-red-400" />
              <span className="text-sm font-semibold text-white">Trade Rejection Rules</span>
            </div>
            <p className="text-xs text-slate-500 mb-3">A trade is automatically rejected if ANY of these conditions are true.</p>
            <div className="space-y-2">
              {rejectionRules.map(r => (
                <div key={r.rule} className="flex items-center gap-2 text-xs">
                  <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                  <span className="text-slate-300">{r.rule}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Kill switch triggers */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={14} className="text-amber-400" />
              <span className="text-sm font-semibold text-white">Kill Switch Triggers</span>
            </div>
            <p className="text-xs text-slate-500 mb-3">System enters Protection Mode if any trigger activates. All new recommendations suspended.</p>
            <div className="space-y-2">
              {killSwitchTriggers.map(r => (
                <div key={r.trigger} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className={cn('w-2 h-2 rounded-full', r.active ? 'bg-red-400 pulse-live' : 'bg-emerald-400')} />
                    <span className="text-slate-300">{r.trigger}</span>
                  </div>
                  <span className={cn('badge text-[9px]', r.active ? 'badge-red' : 'badge-green')}>
                    {r.active ? 'ACTIVE' : 'CLEAR'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Capital guards */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield size={14} className="text-emerald-400" />
              <span className="text-sm font-semibold text-white">Capital Guards</span>
            </div>
            <p className="text-xs text-slate-500 mb-3">Behavioral guardrails enforced at all times. Cannot be overridden.</p>
            <div className="space-y-3">
              {[
                { guard: 'No Martingale', desc: 'Never double down on losing positions' },
                { guard: 'No Averaging Down', desc: 'No adding to positions below entry' },
                { guard: 'No Revenge Trading', desc: 'Cooling period after consecutive losses' },
                { guard: 'No Overleveraging', desc: 'Maximum 1:1 notional, no margin' },
                { guard: 'No Emotional Override', desc: 'All decisions algorithm-only' },
                { guard: 'No Concentration Risk', desc: 'Max 10% per asset, 20% per sector' },
                { guard: 'No Force Trades', desc: 'Zero activity if no qualifying signal' },
              ].map(g => (
                <div key={g.guard} className="flex items-start gap-2">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-white">{g.guard}</div>
                    <div className="text-[10px] text-slate-500">{g.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reality check framework */}
        <div className="card p-5">
          <div className="text-sm font-bold text-amber-400 mb-3">Reality Check Framework</div>
          <p className="text-xs text-slate-400 mb-4">Before any signal is approved, the system runs a 5-question institutional sanity check. If answers are weak, the trade is automatically rejected.</p>
          <div className="grid grid-cols-5 gap-3">
            {[
              { q: 'What assumptions must be true?', icon: '🔍' },
              { q: 'What could make this fail?', icon: '⚠️' },
              { q: 'What evidence contradicts the thesis?', icon: '🔄' },
              { q: 'Would an institutional hedge fund approve?', icon: '🏛️' },
              { q: 'Valid without leverage?', icon: '📊' },
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-lg text-center" style={{ background: 'var(--bg-elevated)' }}>
                <div className="text-2xl mb-2">{item.icon}</div>
                <p className="text-[10px] text-slate-400 leading-tight">{item.q}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
