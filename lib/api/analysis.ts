/**
 * Real AI analysis engine — uses Claude to analyze actual live market data
 * and compute probability estimates, edge, EV, and trade recommendations.
 */
import Anthropic from '@anthropic-ai/sdk'
import type { PredictionMarket, MarketAnalysis, CryptoAsset, ForexPair } from '@/types'
import { buildProbabilityEstimate, kellyFraction } from '@/lib/probability'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ─── Prediction Market Analysis ──────────────────────────────────────────────
export async function analyzePredictionMarket(
  market: PredictionMarket,
  contextData?: { cryptoContext?: string; macroContext?: string }
): Promise<MarketAnalysis> {
  const daysLeft = Math.max(0, Math.round((new Date(market.endDate).getTime() - Date.now()) / 86400000))
  const vol = market.volume > 1e6 ? `$${(market.volume / 1e6).toFixed(1)}M` : `$${(market.volume / 1000).toFixed(0)}K`
  const liq = market.liquidity > 1e6 ? `$${(market.liquidity / 1e6).toFixed(1)}M` : `$${(market.liquidity / 1000).toFixed(0)}K`

  const prompt = `You are a Superforecaster and quantitative researcher at a top hedge fund. Analyze this LIVE prediction market.

MARKET: "${market.question}"
DESCRIPTION: ${market.description || '(no description)'}
CATEGORY: ${market.category}
CURRENT MARKET PROBABILITY: ${(market.marketProb * 100).toFixed(1)}%
VOLUME: ${vol} | LIQUIDITY: ${liq}
DAYS REMAINING: ${daysLeft}
RESOLUTION SOURCE: ${market.resolutionSource}
${contextData?.macroContext ? `\nMACRO CONTEXT: ${contextData.macroContext}` : ''}
${contextData?.cryptoContext ? `\nCRYPTO CONTEXT: ${contextData.cryptoContext}` : ''}

Analyze this market rigorously using:
1. Base rates from historical similar events
2. Current available public information
3. Resolution criteria clarity
4. Information quality and reliability
5. Bayesian updating from evidence

Return ONLY valid JSON (no markdown, no explanation outside JSON):
{
  "trueProb": <0-1, your calibrated estimate>,
  "probLow": <0-1, lower bound of 80% CI>,
  "probHigh": <0-1, upper bound of 80% CI>,
  "resolutionClarity": <1-10>,
  "infoQuality": <1-10>,
  "reasoning": "<2-3 sentences explaining your probability estimate>",
  "recommendation": "YES" | "NO" | "NO_TRADE",
  "supportingEvidence": [
    {"source": "<specific source>", "summary": "<one sentence>", "weight": <0-1>, "direction": "FOR", "credibility": <0-1>}
  ],
  "opposingEvidence": [
    {"source": "<specific source>", "summary": "<one sentence>", "weight": <0-1>, "direction": "AGAINST", "credibility": <0-1>}
  ],
  "invalidationConditions": ["<condition 1>", "<condition 2>"]
}`

  try {
    const resp = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = resp.content[0].type === 'text' ? resp.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON')
    const p = JSON.parse(jsonMatch[0])

    const allEvidence = [
      ...(p.supportingEvidence ?? []).map((e: any) => ({ ...e, direction: 'FOR' as const })),
      ...(p.opposingEvidence ?? []).map((e: any) => ({ ...e, direction: 'AGAINST' as const })),
    ]
    const prob = buildProbabilityEstimate(market.marketProb, allEvidence)
    const aiProb = p.trueProb ?? prob.estimate

    return {
      trueProb: aiProb,
      probLow:  p.probLow  ?? Math.max(0.01, aiProb - 0.12),
      probHigh: p.probHigh ?? Math.min(0.99, aiProb + 0.12),
      edge:  (aiProb - market.marketProb) * 100,
      ev:    aiProb * (1 / market.marketProb - 1) - (1 - aiProb),
      mispriceScore: Math.abs(aiProb - market.marketProb) * 10,
      riskScore:     10 - (p.resolutionClarity ?? 7),
      supportingEvidence: p.supportingEvidence ?? [],
      opposingEvidence:   p.opposingEvidence ?? [],
      recommendation:     p.recommendation ?? 'NO_TRADE',
      reasoning:          p.reasoning ?? 'Analysis based on available information.',
      resolutionClarity:  p.resolutionClarity ?? 7,
      infoQuality:        p.infoQuality ?? 6,
      analyzedAt:         new Date().toISOString(),
    }
  } catch (err) {
    console.error('analyzePredictionMarket:', err)
    return fallbackAnalysis(market)
  }
}

// ─── Bulk Market Scoring (faster, cheaper) ───────────────────────────────────
export async function scoreMarketsInBulk(
  markets: PredictionMarket[]
): Promise<Array<{ id: string; aiProb: number; edge: number; ev: number; confidence: number; reasoning: string; recommendation: 'YES' | 'NO' | 'NO_TRADE' }>> {
  const summaries = markets.slice(0, 20).map((m, i) =>
    `${i + 1}. "${m.question}" | Market: ${(m.marketProb * 100).toFixed(0)}% | Vol: $${(m.volume / 1000).toFixed(0)}K | Days: ${Math.round((new Date(m.endDate).getTime() - Date.now()) / 86400000)}`
  ).join('\n')

  const prompt = `You are a Superforecaster. For each prediction market below, provide a calibrated probability estimate and brief reasoning.

MARKETS:
${summaries}

Return ONLY a JSON array (no markdown):
[
  {
    "index": 1,
    "aiProb": <0-1>,
    "confidence": <1-10>,
    "reasoning": "<one sentence>",
    "recommendation": "YES" | "NO" | "NO_TRADE"
  }
]

Rules:
- Only recommend YES/NO if |aiProb - marketProb| > 0.08 AND confidence >= 7
- Be calibrated: most markets are correctly priced, edge is rare
- Consider base rates, resolution clarity, and information quality`

  try {
    const resp = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = resp.content[0].type === 'text' ? resp.content[0].text : ''
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error('No JSON array')
    const scores: Array<{ index: number; aiProb: number; confidence: number; reasoning: string; recommendation: string }> = JSON.parse(jsonMatch[0])

    return scores.map(s => {
      const market = markets[s.index - 1]
      if (!market) return null
      const aiProb = Math.min(0.99, Math.max(0.01, s.aiProb))
      const edge = (aiProb - market.marketProb) * 100
      const ev   = aiProb * (1 / market.marketProb - 1) - (1 - aiProb)
      return {
        id:             market.id,
        aiProb,
        edge,
        ev,
        confidence:     s.confidence,
        reasoning:      s.reasoning,
        recommendation: s.recommendation as 'YES' | 'NO' | 'NO_TRADE',
      }
    }).filter(Boolean) as any[]
  } catch (err) {
    console.error('scoreMarketsInBulk:', err)
    return markets.map(m => ({
      id:             m.id,
      aiProb:         m.marketProb,
      edge:           0,
      ev:             0,
      confidence:     5,
      reasoning:      'Analysis unavailable',
      recommendation: 'NO_TRADE' as const,
    }))
  }
}

// ─── Daily Briefing Generator ─────────────────────────────────────────────────
export async function generateLiveBriefing(params: {
  topMarkets:      PredictionMarket[]
  cryptoSummary:   string
  forexSummary:    string
  macroSummary:    string
  portfolioRoi:    number
  openPositions:   number
}): Promise<string> {
  const { topMarkets, cryptoSummary, forexSummary, macroSummary, portfolioRoi, openPositions } = params

  const topOpps = topMarkets
    .filter(m => Math.abs(m.edge) >= 10)
    .slice(0, 3)
    .map(m => `- "${m.question}" | AI: ${(m.aiProb * 100).toFixed(0)}% vs Market: ${(m.marketProb * 100).toFixed(0)}% | Edge: ${m.edge.toFixed(1)}%`)
    .join('\n') || '- No high-conviction opportunities identified today'

  const prompt = `You are the Chief Research Officer at an elite quantitative investment fund. Write today's daily intelligence briefing.

TODAY'S DATE: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

MACRO ENVIRONMENT:
${macroSummary}

TOP PREDICTION MARKET OPPORTUNITIES:
${topOpps}

CRYPTO INTELLIGENCE:
${cryptoSummary}

FOREX INTELLIGENCE:
${forexSummary}

PORTFOLIO STATUS: ${openPositions} open positions | Historical ROI: +${portfolioRoi.toFixed(1)}%

Write a professional 4-paragraph executive briefing:
1. Global market environment & macro context (2-3 sentences)
2. Top opportunity analysis with specific reasoning
3. Risk considerations and markets to avoid today
4. Strategic positioning for next 24-48 hours

Style: Bloomberg Intelligence meets Bridgewater Daily Observations. Professional, specific, evidence-based. No hedging with vague language.`

  try {
    const resp = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 700,
      messages: [{ role: 'user', content: prompt }],
    })
    return resp.content[0].type === 'text' ? resp.content[0].text : ''
  } catch {
    return 'Briefing generation unavailable. Market monitoring continues.'
  }
}

// ─── Fallback ─────────────────────────────────────────────────────────────────
function fallbackAnalysis(market: PredictionMarket): MarketAnalysis {
  return {
    trueProb: market.marketProb,
    probLow:  Math.max(0.01, market.marketProb - 0.10),
    probHigh: Math.min(0.99, market.marketProb + 0.10),
    edge: 0, ev: 0, mispriceScore: 0, riskScore: 5,
    supportingEvidence: [], opposingEvidence: [],
    recommendation: 'NO_TRADE',
    reasoning: 'Analysis unavailable — ANTHROPIC_API_KEY not configured or rate limited.',
    resolutionClarity: 7, infoQuality: 5,
    analyzedAt: new Date().toISOString(),
  }
}
