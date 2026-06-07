'use client'

import { Shield, AlertTriangle, Power } from 'lucide-react'
import { cn, fmt } from '@/lib/utils'
import type { SystemState } from '@/types'

export default function KillSwitch({ systemState }: { systemState: SystemState }) {
  if (systemState.status === 'ACTIVE') return null
  const isProtection = systemState.status === 'PROTECTION'

  return (
    <div className="kill-banner p-4 flex items-start gap-3">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
        isProtection ? 'bg-red-500/20' : 'bg-amber-500/20')}>
        {isProtection ? <Shield size={18} className="text-red-400" /> : <AlertTriangle size={18} className="text-amber-400" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={cn('text-sm font-bold tracking-wide', isProtection ? 'text-red-400' : 'text-amber-400')}>
            {isProtection ? 'SYSTEM PROTECTION MODE ACTIVE' : 'SYSTEM SUSPENDED'}
          </span>
          <div className="badge badge-red"><Power size={9} /> {systemState.status}</div>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {systemState.killSwitchReason ?? 'Risk limits triggered. All new trade recommendations are suspended until conditions normalize.'}
        </p>
        <div className="flex gap-4 mt-1.5 text-[10px]">
          <span style={{ color: 'var(--text-muted)' }}>Daily: <strong className="text-red-400">{fmt(systemState.dailyLoss, 1)}%</strong></span>
          <span style={{ color: 'var(--text-muted)' }}>Weekly: <strong className="text-red-400">{fmt(systemState.weeklyLoss, 1)}%</strong></span>
          <span style={{ color: 'var(--text-muted)' }}>Monthly DD: <strong className="text-amber-400">{fmt(systemState.monthlyDrawdown, 1)}%</strong></span>
        </div>
      </div>
    </div>
  )
}
