'use client'

import { AlertTriangle, Shield, Power } from 'lucide-react'
import type { SystemState } from '@/types'

interface KillSwitchProps {
  systemState: SystemState
}

export default function KillSwitch({ systemState }: KillSwitchProps) {
  if (systemState.status === 'ACTIVE') return null

  const isProtection = systemState.status === 'PROTECTION'

  return (
    <div className={`kill-switch-banner p-4 flex items-start gap-3 ${isProtection ? 'alert-pulse' : ''}`}>
      <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0">
        {isProtection ? <Shield size={20} className="text-red-400" /> : <AlertTriangle size={20} className="text-amber-400" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-bold text-red-400 tracking-wide">
            {isProtection ? '⚠ SYSTEM PROTECTION MODE ACTIVE' : '⚠ SYSTEM SUSPENDED'}
          </span>
          <div className="badge badge-red">
            <Power size={10} className="mr-1" />
            {systemState.status}
          </div>
        </div>
        <p className="text-xs text-slate-400">
          {systemState.killSwitchReason ?? 'Risk limits triggered. All new trade recommendations are suspended until conditions normalize.'}
        </p>
        <div className="flex gap-4 mt-2 text-xs">
          <span className="text-slate-500">Daily Loss: <span className="text-red-400 font-semibold">{systemState.dailyLoss.toFixed(1)}%</span></span>
          <span className="text-slate-500">Weekly Loss: <span className="text-red-400 font-semibold">{systemState.weeklyLoss.toFixed(1)}%</span></span>
          <span className="text-slate-500">Monthly DD: <span className="text-amber-400 font-semibold">{systemState.monthlyDrawdown.toFixed(1)}%</span></span>
        </div>
      </div>
    </div>
  )
}

export function NoTradeCard({ reason }: { reason: string }) {
  return (
    <div className="no-trade-card p-6 flex flex-col items-center text-center gap-3">
      <div className="w-12 h-12 rounded-full bg-amber-500/15 flex items-center justify-center">
        <Shield size={22} className="text-amber-400" />
      </div>
      <div>
        <div className="text-base font-bold text-amber-400 mb-1">NO TRADE TODAY</div>
        <p className="text-xs text-slate-400 max-w-sm">{reason}</p>
      </div>
      <div className="text-[10px] text-slate-600 font-semibold tracking-widest uppercase">
        Capital Preservation Active · Standing By
      </div>
    </div>
  )
}
