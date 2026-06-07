'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import { mockSystemState, mockSystemMetrics } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { Settings, Key, Database, Cpu, Shield, Bell, Lock } from 'lucide-react'
import type { ExecutionMode } from '@/types'

export default function SettingsPage() {
  const [mode, setMode] = useState<ExecutionMode>(mockSystemState.executionMode)
  const [apiKey, setApiKey] = useState('sk-ant-●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●')
  const [polyApiKey, setPolyApiKey] = useState('')
  const [supabaseUrl, setSupabaseUrl] = useState('')

  const modes: { id: ExecutionMode; label: string; desc: string; locked: boolean }[] = [
    { id: 'RESEARCH', label: 'Research Only', desc: 'AI analysis and research without any trade recommendations or tracking.', locked: false },
    { id: 'PAPER', label: 'Paper Trading', desc: 'Full simulation with virtual capital. All signals tracked for performance measurement.', locked: false },
    { id: 'FORWARD', label: 'Forward Testing', desc: 'Live data with paper trades. Validates model performance before going live.', locked: false },
    { id: 'LIVE', label: 'Live Trading', desc: 'Real capital deployment. Requires 100 paper trades, +EV, and 55%+ win rate.', locked: !mockSystemMetrics.liveUnlocked },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Settings" subtitle="API Configuration · Execution Mode · System Preferences" />

      <div className="p-5 space-y-5 max-w-3xl">

        {/* Execution Mode */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Cpu size={15} className="text-blue-400" />
            <h2 className="text-sm font-bold text-white">Execution Mode</h2>
          </div>
          <div className="space-y-2">
            {modes.map(m => (
              <button key={m.id} onClick={() => !m.locked && setMode(m.id)}
                disabled={m.locked}
                className={cn(
                  'w-full text-left p-4 rounded-lg border transition-all',
                  mode === m.id && !m.locked
                    ? 'border-blue-500/40 bg-blue-500/8'
                    : m.locked
                    ? 'border-transparent bg-slate-900/30 opacity-50 cursor-not-allowed'
                    : 'border-transparent hover:border-blue-500/20 hover:bg-blue-500/5 cursor-pointer'
                )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                      mode === m.id && !m.locked ? 'border-blue-400' : 'border-slate-600'
                    )}>
                      {mode === m.id && !m.locked && <div className="w-2 h-2 rounded-full bg-blue-400" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{m.label}</span>
                        {m.locked && <Lock size={11} className="text-slate-500" />}
                        {mode === m.id && <span className="badge badge-blue text-[10px]">Active</span>}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{m.desc}</p>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-3 p-3 rounded-lg text-xs text-slate-500" style={{ background: 'var(--bg-elevated)' }}>
            Live trading unlocks after: 100 paper trades ({mockSystemMetrics.paperTrades}/100) · Win Rate ≥ 55% ({mockSystemMetrics.winRate.toFixed(1)}%) · Positive EV
          </div>
        </div>

        {/* API Keys */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Key size={15} className="text-amber-400" />
            <h2 className="text-sm font-bold text-white">API Configuration</h2>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Anthropic API Key', value: apiKey, setter: setApiKey, placeholder: 'sk-ant-...', hint: 'Powers AI analysis, research agents, and daily briefings.' },
              { label: 'Polymarket API Key', value: polyApiKey, setter: setPolyApiKey, placeholder: 'Optional — required for live trading', hint: 'Used to fetch live market data and execute paper/live trades.' },
              { label: 'Supabase URL', value: supabaseUrl, setter: setSupabaseUrl, placeholder: 'https://your-project.supabase.co', hint: 'Database for storing trade history and performance data.' },
            ].map(field => (
              <div key={field.label}>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">{field.label}</label>
                <input
                  type="password"
                  value={field.value}
                  onChange={e => field.setter(e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2 rounded-lg text-xs text-white placeholder-slate-600 outline-none focus:border-blue-500/50 transition-colors"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                />
                <p className="text-[10px] text-slate-600 mt-1">{field.hint}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Risk preferences */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={15} className="text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Risk Parameters</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Max Risk Per Trade', value: '1.0%', note: 'Hard coded. Cannot be changed.' },
              { label: 'Max Daily Risk', value: '3.0%', note: 'Hard coded. Cannot be changed.' },
              { label: 'Max Weekly Risk', value: '5.0%', note: 'Hard coded. Cannot be changed.' },
              { label: 'Max Monthly Drawdown', value: '10.0%', note: 'Hard coded. Cannot be changed.' },
              { label: 'Min Confidence Threshold', value: '8.0/10', note: 'Hard coded. Cannot be changed.' },
              { label: 'Min Risk Reward', value: '2.0:1', note: 'Hard coded. Cannot be changed.' },
            ].map(p => (
              <div key={p.label} className="p-3 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
                <div className="text-[10px] text-slate-500 mb-0.5">{p.label}</div>
                <div className="text-sm font-bold text-white">{p.value}</div>
                <div className="text-[9px] text-slate-600 mt-0.5 flex items-center gap-1">
                  <Lock size={9} />{p.note}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={15} className="text-cyan-400" />
            <h2 className="text-sm font-bold text-white">Notifications</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: 'New opportunity approved', enabled: true },
              { label: 'Kill switch triggered', enabled: true },
              { label: 'Daily briefing generated', enabled: true },
              { label: 'Position stop-loss hit', enabled: true },
              { label: 'Market scan completed', enabled: false },
            ].map(n => (
              <div key={n.label} className="flex items-center justify-between py-1.5 border-b text-xs" style={{ borderColor: 'rgba(26,34,64,0.5)' }}>
                <span className="text-slate-300">{n.label}</span>
                <div className={cn(
                  'w-9 h-5 rounded-full transition-all relative cursor-pointer',
                  n.enabled ? 'bg-blue-500' : 'bg-slate-700'
                )}>
                  <div className={cn(
                    'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all',
                    n.enabled ? 'left-4' : 'left-0.5'
                  )} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
