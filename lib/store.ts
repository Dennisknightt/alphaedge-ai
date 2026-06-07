'use client'

import { useState, useCallback } from 'react'
import type { Position, PortfolioMetrics } from '@/types'

export function computePortfolioMetrics(positions: Position[]): Partial<PortfolioMetrics> {
  const open = positions.filter(p => p.status === 'OPEN')
  const closed = positions.filter(p => p.status === 'CLOSED')
  const wins = closed.filter(p => p.outcome === 'WIN').length
  const winRate = closed.length > 0 ? (wins / closed.length) * 100 : 0
  const totalPnl = positions.reduce((s, p) => s + p.pnl, 0)
  const totalCost = positions.reduce((s, p) => s + p.cost, 0)
  const deployed = open.reduce((s, p) => s + p.currentValue, 0)
  const totalCapital = 100_000

  return {
    totalCapital,
    deployed,
    available: totalCapital - deployed + totalPnl,
    unrealizedPnl: open.reduce((s, p) => s + p.pnl, 0),
    realizedPnl: closed.reduce((s, p) => s + p.pnl, 0),
    totalPnl,
    totalPnlPct: totalCost > 0 ? (totalPnl / totalCost) * 100 : 0,
    winRate,
    openPositions: open.length,
    closedPositions: closed.length,
    totalTrades: positions.length,
  }
}
