import type { PredictionMarket } from '@/types'

const GAMMA_API = 'https://gamma-api.polymarket.com'

interface GammaMarket {
  id: string
  conditionId: string
  question: string
  description: string
  category: string
  endDate: string
  volume: number
  liquidity: number
  outcomePrices: string
  outcomes: string
  active: boolean
  closed: boolean
  resolutionSource: string
}

export async function fetchActiveMarkets(limit = 50): Promise<PredictionMarket[]> {
  try {
    const params = new URLSearchParams({
      active: 'true',
      closed: 'false',
      limit: String(limit),
      order: 'volume',
      ascending: 'false',
    })

    const res = await fetch(`${GAMMA_API}/markets?${params}`, {
      next: { revalidate: 300 },
    })

    if (!res.ok) throw new Error(`Gamma API ${res.status}`)
    const data: GammaMarket[] = await res.json()

    return data
      .filter(m => m.active && !m.closed && m.liquidity > 1000)
      .map(parseGammaMarket)
  } catch (err) {
    console.error('fetchActiveMarkets:', err)
    return []
  }
}

function parseGammaMarket(m: GammaMarket): PredictionMarket {
  let marketProb = 0.5

  try {
    const prices: string[] = JSON.parse(m.outcomePrices || '[0.5,0.5]')
    const names: string[] = JSON.parse(m.outcomes || '["YES","NO"]')
    const yesIdx = names.findIndex(n => n === 'Yes' || n === 'YES')
    marketProb = parseFloat(prices[yesIdx >= 0 ? yesIdx : 0] ?? '0.5')
  } catch {}

  return {
    id: m.id,
    source: 'POLYMARKET',
    question: m.question,
    description: m.description || '',
    category: m.category || 'General',
    endDate: m.endDate,
    volume: m.volume || 0,
    liquidity: m.liquidity || 0,
    marketProb: Math.min(Math.max(marketProb, 0.01), 0.99),
    aiProb: 0,
    edge: 0,
    ev: 0,
    confidence: 0,
    recommendedSide: 'NONE',
    riskTier: 'MEDIUM',
    resolutionSource: m.resolutionSource || 'Unknown',
    outcomes: [],
    updatedAt: new Date().toISOString(),
  }
}
