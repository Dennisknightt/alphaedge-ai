import type { PredictionMarket } from '@/types'

const GAMMA = 'https://gamma-api.polymarket.com'
const CLOB  = 'https://clob.polymarket.com'

interface GammaMarket {
  id: string
  conditionId?: string
  question: string
  description?: string
  category?: string
  endDate?: string
  closingTime?: string
  volume?: number
  volumeNum?: number
  liquidity?: number
  liquidityNum?: number
  outcomePrices?: string
  outcomes?: string
  active?: boolean
  closed?: boolean
  archived?: boolean
  restricted?: boolean
  resolutionSource?: string
  marketType?: string
  tags?: { id: number; label: string; slug: string }[]
}

export async function fetchPolymarkets(limit = 30): Promise<PredictionMarket[]> {
  const params = new URLSearchParams({
    active:     'true',
    closed:     'false',
    archived:   'false',
    limit:      String(limit),
    order:      'volume',
    ascending:  'false',
  })

  const res = await fetch(`${GAMMA}/markets?${params}`, {
    next: { revalidate: 300 },
    headers: { 'Accept': 'application/json' },
  })

  if (!res.ok) throw new Error(`Polymarket ${res.status}`)

  const data: GammaMarket[] = await res.json()

  return data
    .filter(m =>
      m.active &&
      !m.closed &&
      !m.archived &&
      (m.liquidityNum ?? m.liquidity ?? 0) > 500 &&
      m.question.length < 200
    )
    .slice(0, limit)
    .map(parseMarket)
}

export async function fetchTopPolymarkets(limit = 10): Promise<PredictionMarket[]> {
  const params = new URLSearchParams({
    active:    'true',
    closed:    'false',
    limit:     String(limit),
    order:     'volume',
    ascending: 'false',
  })
  const res = await fetch(`${GAMMA}/markets?${params}`, { next: { revalidate: 180 } })
  if (!res.ok) throw new Error(`Polymarket ${res.status}`)
  const data: GammaMarket[] = await res.json()
  return data.filter(m => m.active && !m.closed).slice(0, limit).map(parseMarket)
}

function parseMarket(m: GammaMarket): PredictionMarket {
  let marketProb = 0.5
  let outcomes: { name: string; price: number }[] = []

  try {
    const names: string[]  = JSON.parse(m.outcomes ?? '["YES","NO"]')
    const prices: string[] = JSON.parse(m.outcomePrices ?? '[0.5,0.5]')
    outcomes = names.map((n, i) => ({ name: n, price: parseFloat(prices[i] ?? '0.5') }))
    const yes = outcomes.find(o => o.name === 'Yes' || o.name === 'YES')
    marketProb = yes ? yes.price : parseFloat(prices[0] ?? '0.5')
  } catch {}

  const vol  = m.volumeNum    ?? m.volume    ?? 0
  const liq  = m.liquidityNum ?? m.liquidity ?? 0
  const endDate = m.endDate ?? m.closingTime ?? new Date(Date.now() + 30 * 86400000).toISOString()

  const category = m.category ??
    m.tags?.[0]?.label ?? 'General'

  return {
    id: m.id,
    source: 'POLYMARKET',
    question: m.question,
    description: m.description ?? '',
    category,
    endDate,
    volume: vol,
    liquidity: liq,
    marketProb: Math.min(Math.max(marketProb, 0.01), 0.99),
    aiProb: 0,
    edge: 0,
    ev: 0,
    confidence: 0,
    recommendedSide: 'NONE',
    riskTier: liq > 100_000 ? 'LOW' : liq > 10_000 ? 'MEDIUM' : 'HIGH',
    resolutionSource: m.resolutionSource ?? 'Polymarket resolution committee',
    outcomes,
    updatedAt: new Date().toISOString(),
  }
}
