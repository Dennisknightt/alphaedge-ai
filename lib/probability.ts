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
  const p = prior * likelihood * weight
  const q = (1 - prior) * (1 - likelihood) * weight + prior * (1 - weight)
  const posterior = p / (p + q)
  return Math.min(Math.max(posterior, 0.01), 0.99)
}

export function calculateEdge(aiProb: number, marketProb: number): number {
  return (aiProb - marketProb) * 100
}

export function calculateExpectedValue(aiProb: number, marketProb: number): number {
  const payoff = 1 / marketProb - 1
  return aiProb * payoff - (1 - aiProb)
}

export function kellyFraction(aiProb: number, marketProb: number): number {
  const b = 1 / marketProb - 1
  const q = 1 - aiProb
  const kelly = (aiProb * b - q) / b
  return Math.max(0, Math.min(kelly * 0.25, 0.05))
}

export function buildProbabilityEstimate(
  marketProb: number,
  signals: { direction: 'FOR' | 'AGAINST'; weight: number; credibility: number }[]
): ProbabilityResult {
  let estimate = marketProb

  for (const s of signals) {
    const likelihood = s.direction === 'FOR'
      ? 0.65 + s.credibility * 0.2
      : 0.35 - s.credibility * 0.1
    estimate = bayesianUpdate(estimate, likelihood, s.weight)
  }

  const uncertainty = Math.max(0.04, 0.12 - signals.length * 0.004)
  const low = Math.max(0.01, estimate - uncertainty)
  const high = Math.min(0.99, estimate + uncertainty)

  const confidence = Math.min(10, 4 + signals.length * 0.4 + (1 - Math.abs(estimate - marketProb)) * 2)
  const edge = calculateEdge(estimate, marketProb)
  const expectedValue = calculateExpectedValue(estimate, marketProb)
  const mispriceScore = Math.abs(edge) / 10

  return { estimate, low, high, confidence, mispriceScore, edge, expectedValue }
}
