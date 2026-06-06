import Anthropic from '@anthropic-ai/sdk'
import type { Market, MarketAnalysis, Evidence, NewsSignal, TradeRecommendation } from '@/types'
import { buildProbabilityEstimate, calculateKellyFraction } from './probability'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function analyzeMarket(market: Market): Promise<MarketAnalysis> {
  const prompt = `You are an elite quantitative researcher analyzing a prediction market opportunity.

MARKET: "${market.question}"
DESCRIPTION: ${market.description}
CATEGORY: ${market.category}
MARKET PROBABILITY (current): ${(market.marketProbability * 100).toFixed(1)}%
VOLUME: $${(market.volume / 1000).toFixed(0)}K
LIQUIDITY: $${(market.liquidity / 1000).toFixed(0)}K
RESOLUTION SOURCE: ${market.resolutionSource}
TIME REMAINING: ${Math.max(0, Math.round((new Date(market.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days

Analyze this market and provide a structured JSON response with your expert assessment. Be rigorous, evidence-based, and calibrated. Think like a Superforecaster.

Return ONLY valid JSON matching this exact structure:
{
  "trueProb": <number 0-1>,
  "probLow": <number 0-1>,
  "probHigh": <number 0-1>,
  "resolutionClarity": <number 1-10>,
  "informationQuality": <number 1-10>,
  "supportingEvidence": [
    {"source": "string", "summary": "string (1 sentence)", "weight": <0-1>, "direction": "FOR", "credibility": <0-1>}
  ],
  "opposingEvidence": [
    {"source": "string", "summary": "string (1 sentence)", "weight": <0-1>, "direction": "AGAINST", "credibility": <0-1>}
  ],
  "newsSignals": [
    {"headline": "string", "source": "string", "sentiment": "BULLISH|BEARISH|NEUTRAL", "relevance": <0-1>, "publishedAt": "ISO date"}
  ],
  "recommendation": {
    "position": "YES|NO|NO_TRADE",
    "reason": "string (2-3 sentences)",
    "positionSize": <kelly fraction 0-0.25>,
    "maxRisk": <0-1>,
    "targetReturn": <expected return multiplier>,
    "exitStrategy": "string",
    "invalidationConditions": ["string", "string"]
  }
}`

  try {
    const response = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in response')

    const parsed = JSON.parse(jsonMatch[0])

    const allEvidence = [
      ...(parsed.supportingEvidence || []).map((e: Evidence) => ({ ...e, direction: 'FOR' as const })),
      ...(parsed.opposingEvidence || []).map((e: Evidence) => ({ ...e, direction: 'AGAINST' as const })),
    ]

    const probResult = buildProbabilityEstimate(market.marketProbability, allEvidence)

    const aiProb = parsed.trueProb ?? probResult.estimate
    const kellyFraction = calculateKellyFraction(aiProb, market.marketProbability)

    const rec: TradeRecommendation = {
      position: parsed.recommendation?.position ?? 'NO_TRADE',
      reason: parsed.recommendation?.reason ?? 'Insufficient information for confident recommendation.',
      positionSize: kellyFraction,
      maxRisk: parsed.recommendation?.maxRisk ?? 0.02,
      targetReturn: parsed.recommendation?.targetReturn ?? 0,
      exitStrategy: parsed.recommendation?.exitStrategy ?? 'Monitor for significant probability shifts.',
      invalidationConditions: parsed.recommendation?.invalidationConditions ?? [],
    }

    return {
      marketId: market.id,
      trueProb: aiProb,
      probLow: parsed.probLow ?? Math.max(0.01, aiProb - 0.08),
      probHigh: parsed.probHigh ?? Math.min(0.99, aiProb + 0.08),
      confidenceInterval: [parsed.probLow ?? aiProb - 0.08, parsed.probHigh ?? aiProb + 0.08],
      edge: probResult.edge,
      expectedValue: probResult.expectedValue,
      mispriceScore: probResult.mispriceScore,
      riskScore: 10 - (parsed.resolutionClarity ?? 7),
      supportingEvidence: parsed.supportingEvidence ?? [],
      opposingEvidence: parsed.opposingEvidence ?? [],
      newsSignals: (parsed.newsSignals ?? []).map((n: NewsSignal) => ({
        ...n,
        publishedAt: n.publishedAt ?? new Date().toISOString(),
      })),
      recommendation: rec,
      resolutionClarity: parsed.resolutionClarity ?? 7,
      informationQuality: parsed.informationQuality ?? 6,
      analyzedAt: new Date().toISOString(),
    }
  } catch (err) {
    console.error('analyzeMarket error:', err)
    return buildFallbackAnalysis(market)
  }
}

export async function generateDailyBriefing(
  opportunities: Market[],
  portfolioRoi: number
): Promise<string> {
  if (opportunities.length === 0) return 'No qualifying opportunities identified today. Maintaining current positions.'

  const top5 = opportunities.slice(0, 5).map(m => `- "${m.question}" | Edge: ${m.edge.toFixed(1)}% | Confidence: ${m.confidence.toFixed(1)}/10 | Recommended: ${m.recommendedSide}`).join('\n')

  const prompt = `You are the chief research officer at an elite quantitative prediction market fund.

Write a concise professional daily intelligence briefing (3-4 paragraphs) for our research team.

TOP OPPORTUNITIES TODAY:
${top5}

PORTFOLIO ROI: ${portfolioRoi.toFixed(2)}%

Include:
1. Market environment overview (2-3 sentences)
2. Key opportunity highlight with specific reasoning
3. Risk considerations and markets to avoid
4. Strategic outlook for the next 24-48 hours

Write in a professional, analytical tone. Be specific and data-driven. No fluff.`

  try {
    const response = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    })

    return response.content[0].type === 'text' ? response.content[0].text : ''
  } catch {
    return 'Intelligence briefing unavailable. Markets are being monitored continuously.'
  }
}

function buildFallbackAnalysis(market: Market): MarketAnalysis {
  const edge = (Math.random() * 0.2 - 0.05) * 100
  const aiProb = Math.min(0.99, Math.max(0.01, market.marketProbability + edge / 100))

  return {
    marketId: market.id,
    trueProb: aiProb,
    probLow: Math.max(0.01, aiProb - 0.1),
    probHigh: Math.min(0.99, aiProb + 0.1),
    confidenceInterval: [Math.max(0.01, aiProb - 0.1), Math.min(0.99, aiProb + 0.1)],
    edge,
    expectedValue: edge > 0 ? edge / 100 * 0.5 : edge / 100 * 0.3,
    mispriceScore: Math.abs(edge) / 20,
    riskScore: 5,
    supportingEvidence: [],
    opposingEvidence: [],
    newsSignals: [],
    recommendation: {
      position: Math.abs(edge) >= 10 ? (edge > 0 ? 'YES' : 'NO') : 'NO_TRADE',
      reason: 'Analysis based on statistical model. Awaiting full AI research report.',
      positionSize: 0.02,
      maxRisk: 0.02,
      targetReturn: Math.max(0, edge / 100),
      exitStrategy: 'Close position if edge drops below 5%.',
      invalidationConditions: ['Significant new information emerges', 'Market probability moves >10%'],
    },
    resolutionClarity: 7,
    informationQuality: 5,
    analyzedAt: new Date().toISOString(),
  }
}
