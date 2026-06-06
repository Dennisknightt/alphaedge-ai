export interface ProbabilityResult {
  estimate: number
  low: number
  high: number
  confidence: number
  mispriceScore: number
  edge: number
  expectedValue: number
}

export function bayesianUpdate(prior: number, likelihood: number, weight: number): number {
  const posterior = (prior * likelihood * weight) / (prior * likelihood * weight + (1 - prior) * (1 - likelihood) * weight + prior * (1 - weight))
  return Math.min(Math.max(posterior, 0.01), 0.99)
}

export function monteCarloEV(
  aiProb: number,
  marketProb: number,
  simulations = 10000
): { ev: number; stdDev: number } {
  let totalEv = 0
  let totalEvSq = 0

  for (let i = 0; i < simulations; i++) {
    const r = Math.random()
    const outcome = r < aiProb ? 1 : 0
    const ev = outcome * (1 / marketProb) - 1
    totalEv += ev
    totalEvSq += ev * ev
  }

  const meanEv = totalEv / simulations
  const variance = totalEvSq / simulations - meanEv * meanEv
  return { ev: meanEv, stdDev: Math.sqrt(Math.max(variance, 0)) }
}

export function calculateEdge(aiProb: number, marketProb: number): number {
  return (aiProb - marketProb) * 100
}

export function calculateExpectedValue(aiProb: number, marketProb: number): number {
  const payoff = 1 / marketProb - 1
  return aiProb * payoff - (1 - aiProb)
}

export function calculateKellyFraction(aiProb: number, marketProb: number): number {
  const b = 1 / marketProb - 1
  const p = aiProb
  const q = 1 - p
  const kelly = (p * b - q) / b
  return Math.max(0, Math.min(kelly, 0.25))
}

export function calculateConfidence(
  evidence: { weight: number; credibility: number }[],
  resolutionClarity: number,
  infoQuality: number,
  liquidity: number
): number {
  if (evidence.length === 0) return 3

  const evidenceScore = evidence.reduce((sum, e) => sum + e.weight * e.credibility, 0) / evidence.length
  const normalizedEvidence = Math.min(evidenceScore * 10, 10)

  const liquidityScore = liquidity > 500_000 ? 10 : liquidity > 100_000 ? 8 : liquidity > 10_000 ? 6 : 4

  const score = (
    normalizedEvidence * 0.35 +
    resolutionClarity * 0.25 +
    infoQuality * 0.25 +
    liquidityScore * 0.15
  )

  return Math.min(Math.max(score, 1), 10)
}

export function buildProbabilityEstimate(
  marketProb: number,
  evidenceSignals: { direction: 'FOR' | 'AGAINST'; weight: number; credibility: number }[],
  baseRate?: number
): ProbabilityResult {
  let estimate = baseRate ?? marketProb
  const initialEstimate = estimate

  for (const signal of evidenceSignals) {
    const likelihood = signal.direction === 'FOR' ? 0.7 + signal.credibility * 0.2 : 0.3 - signal.credibility * 0.1
    estimate = bayesianUpdate(estimate, likelihood, signal.weight)
  }

  const uncertainty = 0.05 + (1 - evidenceSignals.length / 20) * 0.1
  const low = Math.max(0.01, estimate - uncertainty)
  const high = Math.min(0.99, estimate + uncertainty)

  const confidence = Math.min(
    10,
    5 + evidenceSignals.length * 0.5 + (1 - Math.abs(estimate - initialEstimate)) * 2
  )

  const edge = calculateEdge(estimate, marketProb)
  const expectedValue = calculateExpectedValue(estimate, marketProb)

  const mispriceScore = Math.abs(edge) / 10

  return { estimate, low, high, confidence, mispriceScore, edge, expectedValue }
}
