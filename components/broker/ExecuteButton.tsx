'use client'

import { useState } from 'react'
import { Zap, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExecuteButtonProps {
  symbol: string
  direction: 'BUY' | 'SELL'
  stopLoss?: number
  takeProfit?: number
  riskPct?: number
  className?: string
}

type State = 'idle' | 'loading' | 'success' | 'error'

export default function ExecuteButton({
  symbol, direction, stopLoss, takeProfit, riskPct = 1, className,
}: ExecuteButtonProps) {
  const [state, setState] = useState<State>('idle')
  const [msg, setMsg] = useState('')

  const execute = async () => {
    setState('loading')
    setMsg('')
    try {
      const res = await fetch('/api/broker/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, direction, stopLoss, takeProfit, riskPct }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setState('success')
        setMsg(`Order placed · ${data.orderId ?? ''}`)
        setTimeout(() => setState('idle'), 3000)
      } else {
        setState('error')
        setMsg(data.error ?? 'Order failed')
        setTimeout(() => setState('idle'), 4000)
      }
    } catch (err: any) {
      setState('error')
      setMsg(err.message ?? 'Network error')
      setTimeout(() => setState('idle'), 4000)
    }
  }

  const isBuy = direction === 'BUY'
  const colorBase = isBuy ? 'emerald' : 'red'

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <button
        onClick={execute}
        disabled={state === 'loading'}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all',
          'border disabled:opacity-50 disabled:cursor-not-allowed',
          isBuy
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
            : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20',
          state === 'success' && 'bg-emerald-500/20 border-emerald-500/50',
          state === 'error' && 'bg-red-500/20 border-red-500/50',
        )}
      >
        {state === 'loading' && <Loader2 size={11} className="animate-spin" />}
        {state === 'success' && <CheckCircle size={11} />}
        {state === 'error' && <XCircle size={11} />}
        {state === 'idle' && <Zap size={11} />}
        {state === 'idle' && `${direction} ${symbol}`}
        {state === 'loading' && 'Executing…'}
        {state === 'success' && 'Placed!'}
        {state === 'error' && 'Failed'}
      </button>
      {msg && (
        <div className={cn(
          'text-[9px] px-1',
          state === 'success' ? 'text-emerald-400' : 'text-red-400',
        )}>
          {msg}
        </div>
      )}
    </div>
  )
}
