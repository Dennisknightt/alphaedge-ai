'use client'

import { useState, useEffect, useCallback } from 'react'
import type { PredictionMarket, CryptoAsset, ForexPair, Equity } from '@/types'

// Generic fetcher with loading/error state
function useFetch<T>(url: string, interval?: number) {
  const [data, setData]       = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setData(json)
      setLastFetch(new Date())
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }, [url])

  useEffect(() => {
    fetchData()
    if (!interval) return
    const t = setInterval(fetchData, interval)
    return () => clearInterval(t)
  }, [fetchData, interval])

  return { data, loading, error, refetch: fetchData, lastFetch }
}

// ─── Prediction Markets ──────────────────────────────────────────────────────
interface MarketsResponse {
  markets: PredictionMarket[]
  count: number
  analyzed: boolean
  fetchedAt: string
}

export function usePredictionMarkets(limit = 30) {
  return useFetch<MarketsResponse>(`/api/markets?limit=${limit}`, 5 * 60 * 1000)
}

// ─── Crypto ──────────────────────────────────────────────────────────────────
interface CryptoResponse {
  assets: CryptoAsset[]
  global: {
    totalMarketCap: number
    btcDominance: number
    totalVolume: number
    marketCapChange24h: number
  } | null
  fearGreed: { value: number; label: string } | null
  fetchedAt: string
}

export function useCrypto() {
  return useFetch<CryptoResponse>('/api/crypto', 2 * 60 * 1000)
}

// ─── Forex ───────────────────────────────────────────────────────────────────
interface ForexResponse { pairs: ForexPair[]; fetchedAt: string }

export function useForex() {
  return useFetch<ForexResponse>('/api/forex', 5 * 60 * 1000)
}

// ─── Macro ───────────────────────────────────────────────────────────────────
export function useMacro() {
  return useFetch<any>('/api/macro', 60 * 60 * 1000)
}

// ─── Yahoo Finance ────────────────────────────────────────────────────────────
export function useEquityQuote(ticker: string) {
  return useFetch<any>(`/api/yahoo?ticker=${encodeURIComponent(ticker)}&range=1mo&interval=1d`, 5 * 60 * 1000)
}

// ─── History ─────────────────────────────────────────────────────────────────
export function useHistory(type: 'crypto' | 'forex' | 'sp500', asset: string, from = '2013-01-01') {
  return useFetch<any>(
    `/api/history?type=${type}&asset=${encodeURIComponent(asset)}&from=${from}`,
    60 * 60 * 1000  // hourly
  )
}

// ─── Daily Briefing ───────────────────────────────────────────────────────────
export function useBriefing() {
  return useFetch<any>('/api/briefing', 60 * 60 * 1000)
}
