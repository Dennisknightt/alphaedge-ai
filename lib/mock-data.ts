import type {
  PredictionMarket, CryptoAsset, ForexPair, Equity,
  TradeSignal, AgentConsensus, PortfolioMetrics, Position,
  SystemState, AgentStatus, SystemMetrics
} from '@/types'

// ─── Agent Consensus Templates ───────────────────────────────────────────────
function mockConsensus(approvalPct: number): AgentConsensus {
  const pass = approvalPct >= 80
  return {
    research:    { vote: approvalPct > 75 ? 'APPROVE' : 'REJECT', confidence: 8.2, reasoning: 'Strong historical precedent supports thesis.' },
    macro:       { vote: approvalPct > 70 ? 'APPROVE' : 'REJECT', confidence: 7.8, reasoning: 'Macro environment broadly supportive.' },
    quant:       { vote: approvalPct > 80 ? 'APPROVE' : 'REJECT', confidence: 8.5, reasoning: 'Quantitative models show positive expected value.' },
    technical:   { vote: approvalPct > 65 ? 'APPROVE' : 'REJECT', confidence: 7.2, reasoning: 'Technical structure aligned with directional thesis.' },
    sentiment:   { vote: approvalPct > 60 ? 'APPROVE' : 'REJECT', confidence: 6.9, reasoning: 'Sentiment data not overextended.' },
    risk:        { vote: approvalPct > 85 ? 'APPROVE' : 'REJECT', confidence: 9.1, reasoning: 'Risk parameters within institutional limits.' },
    probability: { vote: approvalPct > 78 ? 'APPROVE' : 'REJECT', confidence: 8.7, reasoning: 'Bayesian model indicates mispricing.' },
    approvalPct,
    passed: pass,
  }
}

// ─── Prediction Markets ──────────────────────────────────────────────────────
export const mockPredictionMarkets: PredictionMarket[] = [
  {
    id: 'pm-1', source: 'POLYMARKET',
    question: 'Will the Federal Reserve cut rates in Q3 2025?',
    description: 'Resolves YES if the FOMC cuts the federal funds rate at least once between July 1 – September 30, 2025.',
    category: 'Economics', endDate: new Date(Date.now() + 52 * 86400000).toISOString(),
    volume: 4_800_000, liquidity: 620_000,
    marketProb: 0.41, aiProb: 0.59, edge: 18, ev: 0.31,
    confidence: 8.6, recommendedSide: 'YES', riskTier: 'MEDIUM',
    resolutionSource: 'Federal Reserve official announcements',
    outcomes: [{ name: 'YES', price: 0.41 }, { name: 'NO', price: 0.59 }],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pm-2', source: 'POLYMARKET',
    question: 'Will Bitcoin exceed $130,000 before end of 2025?',
    description: 'Resolves YES if BTC/USD spot price on any major CEX exceeds $130,000 before Dec 31, 2025.',
    category: 'Crypto', endDate: new Date(Date.now() + 195 * 86400000).toISOString(),
    volume: 12_400_000, liquidity: 1_950_000,
    marketProb: 0.34, aiProb: 0.49, edge: 15, ev: 0.27,
    confidence: 7.9, recommendedSide: 'YES', riskTier: 'HIGH',
    resolutionSource: 'CoinGecko BTC/USD price data',
    outcomes: [{ name: 'YES', price: 0.34 }, { name: 'NO', price: 0.66 }],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pm-3', source: 'POLYMARKET',
    question: 'Will there be a US recession in 2025?',
    description: 'Resolves YES if NBER officially declares a recession with start date in 2025.',
    category: 'Economics', endDate: new Date(Date.now() + 210 * 86400000).toISOString(),
    volume: 3_200_000, liquidity: 480_000,
    marketProb: 0.31, aiProb: 0.19, edge: -12, ev: 0.18,
    confidence: 8.8, recommendedSide: 'NO', riskTier: 'LOW',
    resolutionSource: 'NBER official announcements',
    outcomes: [{ name: 'YES', price: 0.31 }, { name: 'NO', price: 0.69 }],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pm-4', source: 'KALSHI',
    question: 'Will OpenAI release GPT-5 by end of 2025?',
    description: 'Resolves YES if OpenAI officially releases a GPT-5 series model to general availability by Dec 31, 2025.',
    category: 'Technology', endDate: new Date(Date.now() + 207 * 86400000).toISOString(),
    volume: 5_900_000, liquidity: 890_000,
    marketProb: 0.68, aiProb: 0.83, edge: 15, ev: 0.22,
    confidence: 8.2, recommendedSide: 'YES', riskTier: 'LOW',
    resolutionSource: 'OpenAI official blog',
    outcomes: [{ name: 'YES', price: 0.68 }, { name: 'NO', price: 0.32 }],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pm-5', source: 'POLYMARKET',
    question: 'Will SpaceX achieve full Starship orbital flight in 2025?',
    description: 'Resolves YES if Starship completes an orbital mission and returns safely before Dec 31, 2025.',
    category: 'Technology', endDate: new Date(Date.now() + 98 * 86400000).toISOString(),
    volume: 2_100_000, liquidity: 310_000,
    marketProb: 0.58, aiProb: 0.76, edge: 18, ev: 0.34,
    confidence: 9.1, recommendedSide: 'YES', riskTier: 'MEDIUM',
    resolutionSource: 'SpaceX official announcements, FAA',
    outcomes: [{ name: 'YES', price: 0.58 }, { name: 'NO', price: 0.42 }],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pm-6', source: 'KALSHI',
    question: 'Will CPI inflation drop below 2.5% in 2025?',
    description: 'Resolves YES if US CPI YoY falls below 2.5% for any month reported in 2025.',
    category: 'Economics', endDate: new Date(Date.now() + 180 * 86400000).toISOString(),
    volume: 1_400_000, liquidity: 210_000,
    marketProb: 0.52, aiProb: 0.38, edge: -14, ev: 0.19,
    confidence: 7.6, recommendedSide: 'NO', riskTier: 'MEDIUM',
    resolutionSource: 'Bureau of Labor Statistics',
    outcomes: [{ name: 'YES', price: 0.52 }, { name: 'NO', price: 0.48 }],
    updatedAt: new Date().toISOString(),
  },
]

// ─── Crypto Assets ───────────────────────────────────────────────────────────
export const mockCryptoAssets: CryptoAsset[] = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', price: 103_420, change24h: 2.4, change7d: 8.1, volume24h: 28_400_000_000, marketCap: 2_040_000_000_000, dominance: 54.2, fundingRate: 0.012, openInterest: 18_200_000_000, whaleActivity: 'ACCUMULATING', exchangeNetflow: -12400 },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', price: 3_840, change24h: 1.8, change7d: 5.2, volume24h: 14_200_000_000, marketCap: 462_000_000_000, fundingRate: 0.008, openInterest: 8_400_000_000, whaleActivity: 'NEUTRAL', exchangeNetflow: -3200 },
  { id: 'solana', symbol: 'SOL', name: 'Solana', price: 182, change24h: 3.1, change7d: 12.4, volume24h: 4_100_000_000, marketCap: 82_000_000_000, fundingRate: 0.021, openInterest: 2_100_000_000, whaleActivity: 'ACCUMULATING', exchangeNetflow: -890 },
  { id: 'bnb', symbol: 'BNB', name: 'BNB', price: 628, change24h: -0.8, change7d: 2.1, volume24h: 1_800_000_000, marketCap: 91_000_000_000, fundingRate: 0.005, whaleActivity: 'NEUTRAL' },
  { id: 'xrp', symbol: 'XRP', name: 'XRP', price: 2.18, change24h: 4.2, change7d: 18.7, volume24h: 6_200_000_000, marketCap: 125_000_000_000, whaleActivity: 'ACCUMULATING' },
  { id: 'avalanche', symbol: 'AVAX', name: 'Avalanche', price: 39.4, change24h: -1.2, change7d: -3.8, volume24h: 820_000_000, marketCap: 16_200_000_000, whaleActivity: 'DISTRIBUTING' },
]

// ─── Forex Pairs ─────────────────────────────────────────────────────────────
export const mockForexPairs: ForexPair[] = [
  { pair: 'EUR/USD', base: 'EUR', quote: 'USD', bid: 1.0842, ask: 1.0844, spread: 0.2, change24h: 0.18, high24h: 1.0861, low24h: 1.0809, irDifferential: -0.25, centralBankBias: 'DOVISH', trend: 'BULLISH' },
  { pair: 'GBP/USD', base: 'GBP', quote: 'USD', bid: 1.2681, ask: 1.2683, spread: 0.2, change24h: 0.31, high24h: 1.2702, low24h: 1.2628, irDifferential: 0.0, centralBankBias: 'NEUTRAL', trend: 'BULLISH' },
  { pair: 'USD/JPY', base: 'USD', quote: 'JPY', bid: 153.84, ask: 153.86, spread: 0.2, change24h: -0.42, high24h: 154.82, low24h: 153.21, irDifferential: 4.75, centralBankBias: 'HAWKISH', trend: 'BEARISH' },
  { pair: 'USD/CHF', base: 'USD', quote: 'CHF', bid: 0.8962, ask: 0.8964, spread: 0.2, change24h: -0.19, high24h: 0.9010, low24h: 0.8941, irDifferential: 3.0, centralBankBias: 'DOVISH', trend: 'RANGING' },
  { pair: 'AUD/USD', base: 'AUD', quote: 'USD', bid: 0.6412, ask: 0.6414, spread: 0.2, change24h: 0.54, high24h: 0.6428, low24h: 0.6371, irDifferential: -0.1, centralBankBias: 'NEUTRAL', trend: 'BULLISH' },
  { pair: 'USD/CAD', base: 'USD', quote: 'CAD', bid: 1.3682, ask: 1.3684, spread: 0.2, change24h: -0.28, high24h: 1.3741, low24h: 1.3671, irDifferential: 0.25, centralBankBias: 'DOVISH', trend: 'RANGING' },
]

// ─── Equities ────────────────────────────────────────────────────────────────
export const mockEquities: Equity[] = [
  { ticker: 'NVDA', name: 'NVIDIA Corp', sector: 'Technology', price: 1082.40, change1d: 2.8, change5d: 7.4, pe: 48.2, eps: 22.46, marketCap: 2_640_000_000_000, volume: 42_100_000, avgVolume: 38_200_000, relativeVolume: 1.10, analystRating: 'BUY' },
  { ticker: 'AAPL', name: 'Apple Inc', sector: 'Technology', price: 213.50, change1d: 0.4, change5d: 1.2, pe: 32.1, eps: 6.65, marketCap: 3_290_000_000_000, volume: 68_400_000, avgVolume: 72_100_000, relativeVolume: 0.95, analystRating: 'HOLD' },
  { ticker: 'MSFT', name: 'Microsoft Corp', sector: 'Technology', price: 448.70, change1d: 1.1, change5d: 3.6, pe: 38.4, eps: 11.69, marketCap: 3_340_000_000_000, volume: 22_800_000, avgVolume: 21_400_000, relativeVolume: 1.07, analystRating: 'BUY' },
  { ticker: 'META', name: 'Meta Platforms', sector: 'Technology', price: 612.30, change1d: 3.2, change5d: 8.9, pe: 29.8, eps: 20.55, marketCap: 1_560_000_000_000, volume: 18_200_000, avgVolume: 15_800_000, relativeVolume: 1.15, analystRating: 'BUY' },
  { ticker: 'TSLA', name: 'Tesla Inc', sector: 'Consumer Discretionary', price: 248.90, change1d: -1.8, change5d: -4.2, pe: 72.1, eps: 3.45, marketCap: 796_000_000_000, volume: 98_400_000, avgVolume: 82_100_000, relativeVolume: 1.20, analystRating: 'HOLD' },
  { ticker: 'GLD', name: 'SPDR Gold ETF', sector: 'Commodities', price: 238.40, change1d: 0.6, change5d: 2.1, marketCap: 0, volume: 8_200_000, avgVolume: 7_400_000, relativeVolume: 1.11, analystRating: 'BUY' },
]

// ─── Approved Trade Signals ───────────────────────────────────────────────────
export const mockTradeSignals: TradeSignal[] = [
  {
    module: 'PREDICTION', asset: 'Fed Rate Cut Q3',
    direction: 'YES', entryPrice: 0.41, stopLoss: 0.28, takeProfit: 0.72,
    rr: 2.4, probability: 0.59, ev: 0.31, confidence: 8.6,
    timeHorizon: '52 days', riskTier: 'MEDIUM',
    agentConsensus: mockConsensus(86),
    supportingEvidence: [
      { source: 'Fed Futures Market', summary: 'CME FedWatch shows 62% probability of at least one cut by September.', weight: 0.85, direction: 'FOR', credibility: 0.9 },
      { source: 'PCE Data', summary: 'Core PCE trending down toward 2.4%, providing room for easing.', weight: 0.78, direction: 'FOR', credibility: 0.85 },
    ],
    opposingEvidence: [
      { source: 'FOMC Minutes', summary: 'Several members expressed caution about cutting too early in 2025.', weight: 0.60, direction: 'AGAINST', credibility: 0.88 },
    ],
    reasoning: 'Market pricing underestimates probability of a cut. Macro data trajectory and CME futures both signal higher likelihood than current 41% market price. Edge is statistically significant with high resolution clarity.',
    invalidationConditions: ['CPI re-accelerates above 3.5%', 'Labor market tightens unexpectedly', 'Fed explicitly rules out 2025 cuts'],
    positionSize: 0.035, maxRiskPct: 1.0,
    realityCheckPassed: true, status: 'APPROVED',
    approvedAt: new Date().toISOString(),
  },
  {
    module: 'PREDICTION', asset: 'Starship Orbital 2025',
    direction: 'YES', entryPrice: 0.58, stopLoss: 0.42, takeProfit: 0.88,
    rr: 2.9, probability: 0.76, ev: 0.34, confidence: 9.1,
    timeHorizon: '98 days', riskTier: 'MEDIUM',
    agentConsensus: mockConsensus(91),
    supportingEvidence: [
      { source: 'SpaceX Internal', summary: 'Flight 9 successful. FAA expediting license for orbital attempt.', weight: 0.92, direction: 'FOR', credibility: 0.88 },
      { source: 'Elon Musk', summary: 'Publicly stated orbital flight targeted for mid-2025.', weight: 0.70, direction: 'FOR', credibility: 0.65 },
    ],
    opposingEvidence: [
      { source: 'Historical', summary: 'SpaceX has a history of timeline slippage on ambitious milestones.', weight: 0.55, direction: 'AGAINST', credibility: 0.80 },
    ],
    reasoning: 'Technical progress is clear and FAA licensing is on track. Market significantly underprices this at 58%. AI model estimates 76% probability based on hardware readiness and regulatory timeline.',
    invalidationConditions: ['FAA grounds Starship program', 'Catastrophic vehicle failure', 'Major technical setback discovered'],
    positionSize: 0.028, maxRiskPct: 0.8,
    realityCheckPassed: true, status: 'APPROVED',
    approvedAt: new Date().toISOString(),
  },
]

// ─── Portfolio Metrics ────────────────────────────────────────────────────────
export const mockPortfolioMetrics: PortfolioMetrics = {
  nav: 128_400,
  totalCapital: 100_000,
  deployed: 6_800,
  available: 121_600,
  unrealizedPnl: 2_140,
  realizedPnl: 26_260,
  totalPnl: 28_400,
  totalPnlPct: 28.4,
  winRate: 72.4,
  profitFactor: 2.84,
  sharpeRatio: 1.92,
  sortinoRatio: 2.41,
  maxDrawdown: 6.2,
  currentDrawdown: 0.4,
  avgWin: 842,
  avgLoss: 296,
  dailyPnl: 1_240,
  weeklyPnl: 4_820,
  monthlyPnl: 12_600,
  annualPnl: 28_400,
  openPositions: 2,
  closedPositions: 29,
  totalTrades: 31,
  riskUtilization: 6.8,
  exposureByModule: { PREDICTION: 4.2, CRYPTO: 1.8, FOREX: 0.8, EQUITY: 0 },
  portfolioHealthScore: 91,
}

// ─── Open Positions ───────────────────────────────────────────────────────────
export const mockPositions: Position[] = [
  {
    id: 'pos-1', module: 'PREDICTION', asset: 'Fed Rate Cut Q3',
    direction: 'YES', entryPrice: 0.41, currentPrice: 0.47,
    quantity: 5000, cost: 2050, currentValue: 2350,
    pnl: 300, pnlPct: 14.6,
    stopLoss: 0.28, takeProfit: 0.72, riskAmount: 650,
    status: 'OPEN', openedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    signal: mockTradeSignals[0],
  },
  {
    id: 'pos-2', module: 'PREDICTION', asset: 'Starship Orbital 2025',
    direction: 'YES', entryPrice: 0.58, currentPrice: 0.63,
    quantity: 4000, cost: 2320, currentValue: 2520,
    pnl: 200, pnlPct: 8.6,
    stopLoss: 0.42, takeProfit: 0.88, riskAmount: 640,
    status: 'OPEN', openedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    signal: mockTradeSignals[1],
  },
]

// ─── System State ─────────────────────────────────────────────────────────────
export const mockSystemState: SystemState = {
  status: 'ACTIVE',
  executionMode: 'PAPER',
  dailyLoss: 0,
  weeklyLoss: 0,
  monthlyDrawdown: 0.4,
  agentStatuses: [
    { id: 'a1', name: 'News Intelligence',      type: 'NEWS',       status: 'RUNNING', lastRun: new Date(Date.now() - 180000).toISOString(),  itemsProcessed: 1284, confidence: 8.2 },
    { id: 'a2', name: 'Macro Intelligence',     type: 'MACRO',      status: 'RUNNING', lastRun: new Date(Date.now() - 300000).toISOString(),  itemsProcessed: 312,  confidence: 8.6 },
    { id: 'a3', name: 'Social Intelligence',    type: 'SOCIAL',     status: 'RUNNING', lastRun: new Date(Date.now() - 120000).toISOString(),  itemsProcessed: 5821, confidence: 7.1 },
    { id: 'a4', name: 'Prediction Market Agent',type: 'PREDICTION', status: 'RUNNING', lastRun: new Date(Date.now() - 60000).toISOString(),   itemsProcessed: 48,   confidence: 8.7 },
    { id: 'a5', name: 'Crypto Intelligence',    type: 'CRYPTO',     status: 'RUNNING', lastRun: new Date(Date.now() - 90000).toISOString(),   itemsProcessed: 1500, confidence: 8.1 },
    { id: 'a6', name: 'Forex Intelligence',     type: 'FOREX',      status: 'RUNNING', lastRun: new Date(Date.now() - 240000).toISOString(),  itemsProcessed: 96,   confidence: 7.9 },
    { id: 'a7', name: 'Equity Intelligence',    type: 'EQUITY',     status: 'RUNNING', lastRun: new Date(Date.now() - 150000).toISOString(),  itemsProcessed: 420,  confidence: 7.8 },
    { id: 'a8', name: 'Risk & Capital Protection', type: 'RISK',    status: 'RUNNING', lastRun: new Date(Date.now() - 30000).toISOString(),   itemsProcessed: 62,   confidence: 9.4 },
  ],
  lastScanAt: new Date(Date.now() - 1800000).toISOString(),
  nextScanAt: new Date(Date.now() + 1800000).toISOString(),
  confidenceScore: 8.4,
  marketConditionsScore: 72,
}

export const mockSystemMetrics: SystemMetrics = {
  totalMarketsScanned: 1248,
  opportunitiesFound: 7,
  avgEdge: 16.4,
  winRate: 72.4,
  activePositions: 2,
  historicalRoi: 28.4,
  systemConfidence: 8.4,
  marketConditions: 72,
  dailyOpportunities: 2,
  paperTrades: 31,
  liveUnlocked: false,
}

// ─── PnL History ──────────────────────────────────────────────────────────────
export function generatePnlHistory(days = 90) {
  const data = []
  let nav = 100000
  for (let i = days; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86400000)
    const change = (Math.random() - 0.35) * 800 + 200
    nav = Math.max(94000, nav + change)
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.round(nav),
      pnl: Math.round(nav - 100000),
    })
  }
  return data
}
