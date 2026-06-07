import type { ForexPair } from '@/types'

const BASE = 'https://api.frankfurter.app'

const PAIRS_CONFIG = [
  { pair: 'EUR/USD', base: 'EUR', quote: 'USD', cbBias: 'DOVISH'  as const },
  { pair: 'GBP/USD', base: 'GBP', quote: 'USD', cbBias: 'NEUTRAL' as const },
  { pair: 'USD/JPY', base: 'USD', quote: 'JPY', cbBias: 'HAWKISH' as const },
  { pair: 'USD/CHF', base: 'USD', quote: 'CHF', cbBias: 'DOVISH'  as const },
  { pair: 'AUD/USD', base: 'AUD', quote: 'USD', cbBias: 'NEUTRAL' as const },
  { pair: 'USD/CAD', base: 'USD', quote: 'CAD', cbBias: 'DOVISH'  as const },
  { pair: 'NZD/USD', base: 'NZD', quote: 'USD', cbBias: 'NEUTRAL' as const },
  { pair: 'EUR/GBP', base: 'EUR', quote: 'GBP', cbBias: 'DOVISH'  as const },
]

export interface ForexHistory { date: string; rate: number }

export async function fetchForexRates(): Promise<ForexPair[]> {
  // Fetch current rates with USD base
  const [latestUSD, latestEUR, latest1dUSD] = await Promise.all([
    fetch(`${BASE}/latest?from=USD`, { next: { revalidate: 300 } }).then(r => r.json()),
    fetch(`${BASE}/latest?from=EUR`, { next: { revalidate: 300 } }).then(r => r.json()),
    // Yesterday for 24h change
    fetch(`${BASE}/${getPrevDate(1)}?from=USD`, { next: { revalidate: 3600 } }).then(r => r.json()),
  ])

  const usdRates    = latestUSD.rates   as Record<string, number>
  const eurRates    = latestEUR.rates   as Record<string, number>
  const usdPrevRates = latest1dUSD.rates as Record<string, number>

  return PAIRS_CONFIG.map(cfg => {
    let bid: number
    let prevBid: number

    if (cfg.base === 'USD') {
      bid     = usdRates[cfg.quote]     ?? 1
      prevBid = usdPrevRates[cfg.quote] ?? bid
    } else if (cfg.quote === 'USD') {
      bid     = 1 / (usdRates[cfg.base]     ?? 1)
      prevBid = 1 / (usdPrevRates[cfg.base] ?? 1)
    } else if (cfg.base === 'EUR') {
      bid     = eurRates[cfg.quote]     ?? 1
      prevBid = eurRates[cfg.quote]     ?? bid  // approximate
    } else {
      // cross pair
      const baseUsd     = 1 / (usdRates[cfg.base]     ?? 1)
      const quoteUsd    = 1 / (usdRates[cfg.quote]    ?? 1)
      const prevBaseUsd = 1 / (usdPrevRates[cfg.base] ?? 1)
      const prevQuoteUsd = 1 / (usdPrevRates[cfg.quote] ?? 1)
      bid     = baseUsd  / quoteUsd
      prevBid = prevBaseUsd / prevQuoteUsd
    }

    const change24h  = ((bid - prevBid) / prevBid) * 100
    const spreadPips = cfg.pair.includes('JPY') ? 1.2 : 0.2
    const ask        = bid + (spreadPips / (cfg.pair.includes('JPY') ? 100 : 10000))

    // IR differential heuristics based on known central bank rates (2025)
    const irDiff: Record<string, number> = {
      'EUR/USD': -0.25, 'GBP/USD': 0.0, 'USD/JPY': 4.75,
      'USD/CHF': 3.0,   'AUD/USD': -0.10, 'USD/CAD': 0.25,
      'NZD/USD': -0.25, 'EUR/GBP': -0.25,
    }

    const trend: 'BULLISH' | 'BEARISH' | 'RANGING' =
      change24h > 0.3 ? 'BULLISH' : change24h < -0.3 ? 'BEARISH' : 'RANGING'

    return {
      pair:   cfg.pair,
      base:   cfg.base,
      quote:  cfg.quote,
      bid,
      ask,
      spread: spreadPips,
      change24h,
      high24h: bid * 1.003,
      low24h:  bid * 0.997,
      irDifferential: irDiff[cfg.pair] ?? 0,
      centralBankBias: cfg.cbBias,
      trend,
    }
  })
}

export async function fetchForexHistory(
  base: string,
  quote: string,
  startDate = '2010-01-01'
): Promise<ForexHistory[]> {
  const end = new Date().toISOString().slice(0, 10)
  const url = `${BASE}/${startDate}..${end}?from=${base}&to=${quote}`
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error(`Frankfurter history ${res.status}`)
  const data = await res.json()
  const rates = data.rates as Record<string, Record<string, number>>
  return Object.entries(rates)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, r]) => ({ date, rate: r[quote] ?? 0 }))
}

function getPrevDate(daysBack: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysBack)
  // Skip weekends (forex closed)
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}
