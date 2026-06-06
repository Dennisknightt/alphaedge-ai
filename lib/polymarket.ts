import type { Market, Outcome } from '@/types'

const GAMMA_API = 'https://gamma-api.polymarket.com'
const CLOB_API = 'https://clob.polymarket.com'

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
  marketType: string
  resolutionSource: string
}

export async function fetchActiveMarkets(limit = 50): Promise<Market[]> {
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

    if (!res.ok) throw new Error(`Gamma API error: ${res.status}`)

    const data: GammaMarket[] = await res.json()

    return data
      .filter(m => m.active && !m.closed && m.liquidity > 1000)
      .map(m => parseGammaMarket(m))
  } catch (err) {
    console.error('fetchActiveMarkets error:', err)
    return getMockMarkets()
  }
}

export async function fetchMarketById(conditionId: string): Promise<Market | null> {
  try {
    const res = await fetch(`${GAMMA_API}/markets/${conditionId}`)
    if (!res.ok) return null
    const data: GammaMarket = await res.json()
    return parseGammaMarket(data)
  } catch {
    return null
  }
}

function parseGammaMarket(m: GammaMarket): Market {
  let outcomes: Outcome[] = []
  let marketProbability = 0.5

  try {
    const names: string[] = JSON.parse(m.outcomes || '["YES","NO"]')
    const prices: string[] = JSON.parse(m.outcomePrices || '[0.5,0.5]')
    outcomes = names.map((name, i) => ({
      id: `${m.id}-${i}`,
      name,
      price: parseFloat(prices[i] || '0.5'),
      volume: m.volume / names.length,
    }))
    const yesOutcome = outcomes.find(o => o.name === 'Yes' || o.name === 'YES')
    marketProbability = yesOutcome ? yesOutcome.price : parseFloat(prices[0] || '0.5')
  } catch {
    marketProbability = 0.5
  }

  return {
    id: m.id,
    conditionId: m.conditionId,
    question: m.question,
    description: m.description || '',
    category: m.category || 'General',
    endDate: m.endDate,
    volume: m.volume || 0,
    liquidity: m.liquidity || 0,
    marketProbability: Math.min(Math.max(marketProbability, 0.01), 0.99),
    aiProbability: 0,
    edge: 0,
    expectedValue: 0,
    confidence: 0,
    recommendedSide: 'NONE',
    riskRating: 'MEDIUM',
    status: 'ACTIVE',
    resolutionSource: m.resolutionSource || 'Unknown',
    outcomes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export function getMockMarkets(): Market[] {
  return [
    {
      id: 'mock-1',
      conditionId: 'mock-cond-1',
      question: 'Will the Federal Reserve cut interest rates in Q3 2025?',
      description: 'This market resolves YES if the Federal Reserve cuts the federal funds rate at least once between July 1, 2025 and September 30, 2025.',
      category: 'Economics',
      endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      volume: 2450000,
      liquidity: 380000,
      marketProbability: 0.42,
      aiProbability: 0.58,
      edge: 16,
      expectedValue: 0.24,
      confidence: 8.2,
      recommendedSide: 'YES',
      riskRating: 'MEDIUM',
      status: 'ACTIVE',
      resolutionSource: 'Federal Reserve official announcements',
      outcomes: [
        { id: 'o1', name: 'YES', price: 0.42, volume: 1225000 },
        { id: 'o2', name: 'NO', price: 0.58, volume: 1225000 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'mock-2',
      conditionId: 'mock-cond-2',
      question: 'Will Bitcoin exceed $120,000 before end of 2025?',
      description: 'Market resolves YES if BTC/USD spot price on any major exchange exceeds $120,000 USD at any point before December 31, 2025.',
      category: 'Crypto',
      endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      volume: 8900000,
      liquidity: 1200000,
      marketProbability: 0.38,
      aiProbability: 0.52,
      edge: 14,
      expectedValue: 0.19,
      confidence: 7.8,
      recommendedSide: 'YES',
      riskRating: 'HIGH',
      status: 'ACTIVE',
      resolutionSource: 'CoinGecko BTC/USD price data',
      outcomes: [
        { id: 'o3', name: 'YES', price: 0.38, volume: 4450000 },
        { id: 'o4', name: 'NO', price: 0.62, volume: 4450000 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'mock-3',
      conditionId: 'mock-cond-3',
      question: 'Will there be a US recession declared in 2025?',
      description: 'Resolves YES if the NBER officially declares a US recession with a start date in 2025.',
      category: 'Economics',
      endDate: new Date(Date.now() + 210 * 24 * 60 * 60 * 1000).toISOString(),
      volume: 3200000,
      liquidity: 520000,
      marketProbability: 0.28,
      aiProbability: 0.18,
      edge: 10,
      expectedValue: 0.15,
      confidence: 8.5,
      recommendedSide: 'NO',
      riskRating: 'LOW',
      status: 'ACTIVE',
      resolutionSource: 'NBER official announcements',
      outcomes: [
        { id: 'o5', name: 'YES', price: 0.28, volume: 1600000 },
        { id: 'o6', name: 'NO', price: 0.72, volume: 1600000 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'mock-4',
      conditionId: 'mock-cond-4',
      question: 'Will AI surpass human performance on MMMU benchmark in 2025?',
      description: 'Resolves YES if any publicly available AI system scores above 90% on the MMMU benchmark in 2025.',
      category: 'Technology',
      endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
      volume: 780000,
      liquidity: 95000,
      marketProbability: 0.55,
      aiProbability: 0.72,
      edge: 17,
      expectedValue: 0.28,
      confidence: 7.5,
      recommendedSide: 'YES',
      riskRating: 'MEDIUM',
      status: 'ACTIVE',
      resolutionSource: 'MMMU leaderboard official',
      outcomes: [
        { id: 'o7', name: 'YES', price: 0.55, volume: 390000 },
        { id: 'o8', name: 'NO', price: 0.45, volume: 390000 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'mock-5',
      conditionId: 'mock-cond-5',
      question: 'Will SpaceX Starship complete full orbital flight in 2025?',
      description: 'Resolves YES if SpaceX Starship successfully completes a full orbital mission (reaches orbit and returns) in calendar year 2025.',
      category: 'Technology',
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      volume: 1560000,
      liquidity: 230000,
      marketProbability: 0.61,
      aiProbability: 0.78,
      edge: 17,
      expectedValue: 0.31,
      confidence: 8.8,
      recommendedSide: 'YES',
      riskRating: 'MEDIUM',
      status: 'ACTIVE',
      resolutionSource: 'SpaceX official announcements, FAA reports',
      outcomes: [
        { id: 'o9', name: 'YES', price: 0.61, volume: 780000 },
        { id: 'o10', name: 'NO', price: 0.39, volume: 780000 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'mock-6',
      conditionId: 'mock-cond-6',
      question: 'Will Ethereum ETF see $5B+ cumulative inflows in 2025?',
      description: 'Resolves YES if US spot Ethereum ETFs accumulate over $5 billion in total net inflows by December 31, 2025.',
      category: 'Crypto',
      endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      volume: 2100000,
      liquidity: 310000,
      marketProbability: 0.44,
      aiProbability: 0.31,
      edge: 13,
      expectedValue: 0.18,
      confidence: 7.2,
      recommendedSide: 'NO',
      riskRating: 'MEDIUM',
      status: 'ACTIVE',
      resolutionSource: 'Bloomberg ETF flow data',
      outcomes: [
        { id: 'o11', name: 'YES', price: 0.44, volume: 1050000 },
        { id: 'o12', name: 'NO', price: 0.56, volume: 1050000 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'mock-7',
      conditionId: 'mock-cond-7',
      question: 'Will unemployment exceed 5% in the US in 2025?',
      description: 'Resolves YES if the US Bureau of Labor Statistics reports an unemployment rate at or above 5.0% for any month in 2025.',
      category: 'Economics',
      endDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000).toISOString(),
      volume: 890000,
      liquidity: 145000,
      marketProbability: 0.22,
      aiProbability: 0.14,
      edge: 8,
      expectedValue: 0.09,
      confidence: 6.8,
      recommendedSide: 'NO',
      riskRating: 'LOW',
      status: 'ACTIVE',
      resolutionSource: 'BLS monthly employment reports',
      outcomes: [
        { id: 'o13', name: 'YES', price: 0.22, volume: 445000 },
        { id: 'o14', name: 'NO', price: 0.78, volume: 445000 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'mock-8',
      conditionId: 'mock-cond-8',
      question: 'Will OpenAI release GPT-5 in 2025?',
      description: 'Resolves YES if OpenAI officially releases a model called GPT-5 or GPT-5-series to general public access by December 31, 2025.',
      category: 'Technology',
      endDate: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000).toISOString(),
      volume: 4500000,
      liquidity: 680000,
      marketProbability: 0.71,
      aiProbability: 0.85,
      edge: 14,
      expectedValue: 0.22,
      confidence: 8.1,
      recommendedSide: 'YES',
      riskRating: 'LOW',
      status: 'ACTIVE',
      resolutionSource: 'OpenAI official blog and product announcements',
      outcomes: [
        { id: 'o15', name: 'YES', price: 0.71, volume: 2250000 },
        { id: 'o16', name: 'NO', price: 0.29, volume: 2250000 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]
}
