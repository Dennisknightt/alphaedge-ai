'use client'

import { useState, useEffect, useCallback } from 'react'
import { cn, fmtCurrency } from '@/lib/utils'
import { Wifi, WifiOff, TrendingUp, TrendingDown, X, RefreshCw } from 'lucide-react'
import type { BrokerAccount, BrokerPosition } from '@/lib/api/broker'

interface BrokerState {
  account: BrokerAccount | null
  positions: BrokerPosition[]
  loading: boolean
  error: string | null
  configured: boolean
}

export default function BrokerPanel() {
  const [state, setState] = useState<BrokerState>({
    account: null, positions: [], loading: true, error: null, configured: false,
  })
  const [closing, setClosing] = useState<string | null>(null)

  const load = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }))
    try {
      const [aRes, pRes] = await Promise.all([
        fetch('/api/broker/account'),
        fetch('/api/broker/positions'),
      ])

      if (aRes.status === 503) {
        setState(s => ({ ...s, loading: false, configured: false }))
        return
      }

      const account = aRes.ok ? await aRes.json() : null
      const { positions = [] } = pRes.ok ? await pRes.json() : {}

      if (account?.error) {
        setState(s => ({ ...s, loading: false, configured: true, error: account.error }))
        return
      }

      setState({ account, positions, loading: false, error: null, configured: true })
    } catch (err: any) {
      setState(s => ({ ...s, loading: false, error: err.message }))
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleClose = async (positionId: string) => {
    setClosing(positionId)
    try {
      const res = await fetch('/api/broker/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ positionId }),
      })
      if (res.ok) load()
    } finally {
      setClosing(null)
    }
  }

  if (!state.configured && !state.loading) {
    return (
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <WifiOff size={14} className="text-slate-500" />
          <div className="label text-slate-500">Broker</div>
        </div>
        <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Add <strong className="text-blue-400">METAAPI_TOKEN</strong> and{' '}
          <strong className="text-blue-400">METAAPI_ACCOUNT_ID</strong> in Vercel to connect your Exness MT4/MT5 account.
        </p>
        <a href="https://metaapi.cloud" target="_blank" rel="noopener noreferrer"
          className="mt-2 inline-block text-[10px] text-blue-400 hover:underline">
          Get free MetaAPI credentials →
        </a>
      </div>
    )
  }

  return (
    <div className="card p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {state.account?.connected
            ? <Wifi size={13} className="text-emerald-400" />
            : <WifiOff size={13} className="text-red-400" />}
          <div className="label">Exness Live</div>
        </div>
        <button onClick={load} disabled={state.loading}
          className="text-slate-500 hover:text-white transition-colors">
          <RefreshCw size={12} className={state.loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {state.error && (
        <div className="mb-3 p-2 rounded text-[10px] text-red-400" style={{ background: 'var(--red-soft)' }}>
          {state.error}
        </div>
      )}

      {/* Account stats */}
      {state.account && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          {[
            { l: 'Balance',    v: fmtCurrency(state.account.balance),    color: 'text-white' },
            { l: 'Equity',     v: fmtCurrency(state.account.equity),     color: state.account.equity >= state.account.balance ? 'text-emerald-400' : 'text-red-400' },
            { l: 'Free Margin',v: fmtCurrency(state.account.freeMargin), color: 'text-white' },
            { l: 'Leverage',   v: `1:${state.account.leverage}`,          color: 'text-blue-400' },
          ].map(item => (
            <div key={item.l} className="p-2 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
              <div className="text-[9px]" style={{ color: 'var(--text-dim)' }}>{item.l}</div>
              <div className={cn('text-xs font-bold tabular', item.color)}>{item.v}</div>
            </div>
          ))}
        </div>
      )}

      {/* Open positions */}
      <div className="text-[10px] font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
        Open Positions ({state.positions.length})
      </div>

      {state.positions.length === 0 ? (
        <p className="text-[10px] py-2 text-center" style={{ color: 'var(--text-dim)' }}>
          No open positions
        </p>
      ) : (
        <div className="space-y-1.5">
          {state.positions.map(pos => (
            <div key={pos.id} className="flex items-center justify-between p-2 rounded-lg"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-soft)' }}>
              <div className="flex items-center gap-2">
                {pos.type === 'BUY'
                  ? <TrendingUp size={11} className="text-emerald-400 shrink-0" />
                  : <TrendingDown size={11} className="text-red-400 shrink-0" />}
                <div>
                  <div className="text-[10px] font-bold text-white">{pos.symbol}</div>
                  <div className="text-[9px]" style={{ color: 'var(--text-dim)' }}>
                    {pos.type} {pos.volume} @ {pos.openPrice}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn('text-xs font-bold tabular', pos.profit >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                  {pos.profit >= 0 ? '+' : ''}{fmtCurrency(pos.profit)}
                </span>
                <button onClick={() => handleClose(pos.id)} disabled={closing === pos.id}
                  className="text-slate-600 hover:text-red-400 transition-colors">
                  <X size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {state.account && (
        <div className="mt-2 pt-2 text-[9px]" style={{ borderTop: '1px solid var(--border-soft)', color: 'var(--text-dim)' }}>
          {state.account.server} · {state.account.currency}
        </div>
      )}
    </div>
  )
}
