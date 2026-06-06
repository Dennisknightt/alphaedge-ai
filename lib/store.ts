'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Market, PortfolioPosition, PortfolioStats, SystemMetrics } from '@/types'

const STORAGE_KEY = 'edgeai_state'

interface AppState {
  markets: Market[]
  opportunities: Market[]
  positions: PortfolioPosition[]
  lastScan: string | null
  briefing: string | null
}

function getInitialState(): AppState {
  if (typeof window === 'undefined') return { markets: [], opportunities: [], positions: [], lastScan: null, briefing: null }
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  return { markets: [], opportunities: [], positions: [], lastScan: null, briefing: null }
}

function saveState(state: AppState) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch {}
}

export function useAppState() {
  const [state, setState] = useState<AppState>(getInitialState)

  const updateState = useCallback((updates: Partial<AppState>) => {
    setState(prev => {
      const next = { ...prev, ...updates }
      saveState(next)
      return next
    })
  }, [])

  return { state, updateState }
}

export function computePortfolioStats(positions: PortfolioPosition[]): PortfolioStats {
  const closed = positions.filter(p => p.status === 'CLOSED')
  const open = positions.filter(p => p.status === 'OPEN')
  const wins = closed.filter(p => p.outcome === 'WIN').length
  const winRate = closed.length > 0 ? (wins / closed.length) * 100 : 0
  const totalPnl = positions.reduce((sum, p) => sum + p.pnl, 0)
  const totalCost = positions.reduce((sum, p) => sum + p.cost, 0)
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0
  const deployed = open.reduce((sum, p) => sum + p.currentValue, 0)
  const totalCapital = 10000
  const available = totalCapital - deployed + totalPnl

  const dailyPnl = positions
    .filter(p => {
      const d = new Date(p.openedAt)
      const now = new Date()
      return d.toDateString() === now.toDateString()
    })
    .reduce((sum, p) => sum + p.pnl, 0)

  const weeklyPnl = positions
    .filter(p => {
      const d = new Date(p.openedAt)
      const now = new Date()
      return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000
    })
    .reduce((sum, p) => sum + p.pnl, 0)

  const monthlyPnl = positions
    .filter(p => {
      const d = new Date(p.openedAt)
      const now = new Date()
      return (now.getTime() - d.getTime()) < 30 * 24 * 60 * 60 * 1000
    })
    .reduce((sum, p) => sum + p.pnl, 0)

  return {
    totalCapital,
    deployed,
    available,
    totalPnl,
    totalPnlPct,
    winRate,
    sharpeRatio: winRate > 50 ? (winRate - 50) / 20 : 0,
    maxDrawdown: 0,
    dailyPnl,
    weeklyPnl,
    monthlyPnl,
    openPositions: open.length,
    closedPositions: closed.length,
    totalTrades: positions.length,
  }
}

export function computeSystemMetrics(markets: Market[], positions: PortfolioPosition[]): SystemMetrics {
  const qualified = markets.filter(m => m.confidence >= 8 && Math.abs(m.edge) >= 10)
  const avgEdge = qualified.length > 0
    ? qualified.reduce((sum, m) => sum + Math.abs(m.edge), 0) / qualified.length
    : 0

  const closed = positions.filter(p => p.status === 'CLOSED')
  const wins = closed.filter(p => p.outcome === 'WIN').length
  const winRate = closed.length > 0 ? (wins / closed.length) * 100 : 0
  const roi = closed.length > 0
    ? (closed.reduce((sum, p) => sum + p.pnl, 0) / closed.reduce((sum, p) => sum + p.cost, 0)) * 100
    : 0

  return {
    totalMarketsScanned: markets.length,
    opportunitiesFound: qualified.length,
    avgEdge,
    winRate,
    activePositions: positions.filter(p => p.status === 'OPEN').length,
    historicalRoi: roi,
    confidenceScore: markets.length > 0
      ? markets.reduce((sum, m) => sum + m.confidence, 0) / markets.length
      : 0,
    dailyOpportunities: qualified.length,
  }
}
