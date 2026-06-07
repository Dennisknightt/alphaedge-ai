import Anthropic from '@anthropic-ai/sdk'
import type { PredictionMarket, MarketAnalysis, Evidence } from '@/types'
import { buildProbabilityEstimate } from './probability'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function analyzeMarket(market: PredictionMarket): Promise<MarketAnalysis> {
  const prompt = `You are an elite quantitative researcher analyzing a prediction market opportunity.

MARKET: "${market.question}"
DESCRIPTION: ${market.description}
CATEGORY: ${market.category}
MARKET PROBABILITY: ${(market.marketProb * 100).toFixed(1)}%
VOLUME: $${(market.volume / 1000).toFixed(0)}K
LIQUIDITY: $${(market.liquidity / 1000).toFixed(0)}K
RESOLUTION SOURCE: ${market.resolutionSource}
TIME REMAINING: ${Math.max(0, Math.round((new Date(market.endDate).getTime() - Date.now()) / 86400000))} days

Analyze this market. Return ONLY valid JSON:
{
  "trueProb": <number 0-1>,
  "probLow": <number 0-1>,
  "probHigh": <number 0-1>,
  "resolutionClarity": <number 1-10>,
  "informationQuality": <number 1-10>,
  "supportingEvidence": [{"source":"string","summary":"string","weight":<0-1>,"direction":"FOR","credibility":<0-1>}],
  "opposingEvidence": [{"source":"string","summary":"string","weight":<0-1>,"direction":"AGAINST","credibility":<0-1>}],
  "recommendation": "YES|NO|NO_TRADE",
  "reasoning": "string (2-3 sentences)"
}`

  try {
    const response = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in response')

    const parsed = JSON.parse(jsonMatch[0])
    const allEvidence = [
      ...(parsed.supportingEvidence ?? []).map((e: Evidence) => ({ ...e, direction: 'FOR' as const })),
      ...(parsed.opposingEvidence ?? []).map((e: Evidence) => ({ ...e, direction: 'AGAINST' as const })),
    ]
    const prob = buildProbabilityEstimate(market.marketProb, allEvidence)

    return {
      trueProb: parsed.trueProb ?? prob.estimate,
      probLow: parsed.probLow ?? Math.max(0.01, prob.estimate - 0.08),
      probHigh: parsed.probHigh ?? Math.min(0.99, prob.estimate + 0.08),
      edge: prob.edge,
      ev: prob.expectedValue,
      mispriceScore: prob.mispriceScore,
      riskScore: 10 - (parsed.resolutionClarity ?? 7),
      supportingEvidence: parsed.supportingEvidence ?? [],
      opposingEvidence: parsed.opposingEvidence ?? [],
      recommendation: parsed.recommendation ?? 'NO_TRADE',
      reasoning: parsed.reasoning ?? 'Insufficient information.',
      resolutionClarity: parsed.resolutionClarity ?? 7,
      infoQuality: parsed.informationQuality ?? 6,
      analyzedAt: new Date().toISOString(),
    }
  } catch (err) {
    console.error('analyzeMarket error:', err)
    return buildFallbackAnalysis(market)
  }
}

export async function generateDailyBriefing(markets: PredictionMarket[], roi: number): Promise<string> {
  const top5 = markets.slice(0, 5).map(m =>
    `- "${m.question}" | Edge: ${m.edge.toFixed(1)}% | Confidence: ${m.confidence.toFixed(1)}/10 | Side: ${m.recommendedSide}`
  ).join('\n')

  const prompt = `You are chief research officer at an elite quant fund. Write a concise 3-paragraph daily briefing.

TOP OPPORTUNITIES:
${top5}

PORTFOLIO ROI: ${roi.toFixed(2)}%

Include: market environment (1-2 sentences), key opportunity highlight, risk considerations. Professional, analytical, concise.`

  try {
    const res = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    })
    return res.content[0].type === 'text' ? res.content[0].text : ''
  } catch {
    return 'Intelligence briefing unavailable. Markets are being monitored continuously.'
  }
}

function buildFallbackAnalysis(market: PredictionMarket): MarketAnalysis {
  const prob = buildProbabilityEstimate(market.marketProb, [])
  return {
    trueProb: market.aiProb || market.marketProb,
    probLow: Math.max(0.01, (market.aiProb || market.marketProb) - 0.1),
    probHigh: Math.min(0.99, (market.aiProb || market.marketProb) + 0.1),
    edge: market.edge,
    ev: market.ev,
    mispriceScore: Math.abs(market.edge) / 20,
    riskScore: 5,
    supportingEvidence: [],
    opposingEvidence: [],
    recommendation: Math.abs(market.edge) >= 10 ? (market.edge > 0 ? 'YES' : 'NO') : 'NO_TRADE',
    reasoning: 'Fallback analysis — full AI research pending.',
    resolutionClarity: 7,
    infoQuality: 5,
    analyzedAt: new Date().toISOString(),
  }
}
