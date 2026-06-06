// ─── Market Modules ────────────────────────────────────────────────────────
export type MarketModule = 'PREDICTION' | 'CRYPTO' | 'FOREX' | 'EQUITY'
export type Direction = 'LONG' | 'SHORT' | 'YES' | 'NO'
export type RiskTier = 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME'
export type ExecutionMode = 'RESEARCH' | 'PAPER' | 'FORWARD' | 'LIVE'
export type SystemStatus = 'ACTIVE' | 'PROTECTION' | 'SUSPENDED' | 'IDLE'

// ─── Prediction Markets ─────────────────────────────────────────────────────
export interface PredictionMarket {
  id: string
  source: 'POLYMARKET' | 'KALSHI' | 'OTHER'
  question: string
  description: string
  category: string
  endDate: string
  volume: number
  liquidity: number
  marketProb: number
  aiProb: number
  edge: number
  ev: number
  confidence: number
  recommendedSide: 'YES' | 'NO' | 'NONE'
  riskTier: RiskTier
  resolutionSource: string
  outcomes: { name: string; price: number }[]
  analysis?: MarketAnalysis
  updatedAt: string
}

// ─── Crypto Assets ──────────────────────────────────────────────────────────
export interface CryptoAsset {
  id: string
  symbol: string
  name: string
  price: number
  change24h: number
  change7d: number
  volume24h: number
  marketCap: number
  dominance?: number
  fundingRate?: number
  openInterest?: number
  whaleActivity?: 'ACCUMULATING' | 'DISTRIBUTING' | 'NEUTRAL'
  exchangeNetflow?: number
  signal?: TradeSignal
}

// ─── Forex Pairs ─────────────────────────────────────────────────────────────
export interface ForexPair {
  pair: string
  base: string
  quote: string
  bid: number
  ask: number
  spread: number
  change24h: number
  high24h: number
  low24h: number
  irDifferential?: number
  centralBankBias?: 'HAWKISH' | 'DOVISH' | 'NEUTRAL'
  trend: 'BULLISH' | 'BEARISH' | 'RANGING'
  signal?: TradeSignal
}

// ─── Equity / Asset ─────────────────────────────────────────────────────────
export interface Equity {
  ticker: string
  name: string
  sector: string
  price: number
  change1d: number
  change5d: number
  pe?: number
  eps?: number
  marketCap: number
  volume: number
  avgVolume: number
  relativeVolume: number
  earningsDate?: string
  analystRating?: 'BUY' | 'HOLD' | 'SELL'
  signal?: TradeSignal
}

// ─── Trade Signal ───────────────────────────────────────────────────────────
export interface TradeSignal {
  module: MarketModule
  asset: string
  direction: Direction
  entryPrice: number
  stopLoss: number
  takeProfit: number
  rr: number
  probability: number
  ev: number
  confidence: number
  timeHorizon: string
  riskTier: RiskTier
  agentConsensus: AgentConsensus
  supportingEvidence: Evidence[]
  opposingEvidence: Evidence[]
  reasoning: string
  invalidationConditions: string[]
  positionSize: number
  maxRiskPct: number
  realityCheckPassed: boolean
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED'
  approvedAt?: string
  rejectionReason?: string
}

// ─── Agent Consensus ────────────────────────────────────────────────────────
export interface AgentConsensus {
  research: AgentVote
  macro: AgentVote
  quant: AgentVote
  technical: AgentVote
  sentiment: AgentVote
  risk: AgentVote
  probability: AgentVote
  approvalPct: number
  passed: boolean
}

export interface AgentVote {
  vote: 'APPROVE' | 'REJECT' | 'ABSTAIN'
  confidence: number
  reasoning: string
}

// ─── Market Analysis ────────────────────────────────────────────────────────
export interface MarketAnalysis {
  trueProb: number
  probLow: number
  probHigh: number
  edge: number
  ev: number
  mispriceScore: number
  riskScore: number
  supportingEvidence: Evidence[]
  opposingEvidence: Evidence[]
  recommendation: 'YES' | 'NO' | 'NO_TRADE'
  reasoning: string
  resolutionClarity: number
  infoQuality: number
  analyzedAt: string
}

export interface Evidence {
  source: string
  summary: string
  weight: number
  direction: 'FOR' | 'AGAINST'
  credibility: number
}

// ─── Portfolio ───────────────────────────────────────────────────────────────
export interface Position {
  id: string
  module: MarketModule
  asset: string
  direction: Direction
  entryPrice: number
  currentPrice: number
  quantity: number
  cost: number
  currentValue: number
  pnl: number
  pnlPct: number
  stopLoss: number
  takeProfit: number
  riskAmount: number
  status: 'OPEN' | 'CLOSED' | 'STOPPED'
  openedAt: string
  closedAt?: string
  outcome?: 'WIN' | 'LOSS' | 'BREAKEVEN'
  signal: TradeSignal
}

export interface PortfolioMetrics {
  nav: number
  totalCapital: number
  deployed: number
  available: number
  unrealizedPnl: number
  realizedPnl: number
  totalPnl: number
  totalPnlPct: number
  winRate: number
  profitFactor: number
  sharpeRatio: number
  sortinoRatio: number
  maxDrawdown: number
  currentDrawdown: number
  avgWin: number
  avgLoss: number
  dailyPnl: number
  weeklyPnl: number
  monthlyPnl: number
  annualPnl: number
  openPositions: number
  closedPositions: number
  totalTrades: number
  riskUtilization: number
  exposureByModule: Record<MarketModule, number>
  portfolioHealthScore: number
}

// ─── System State ────────────────────────────────────────────────────────────
export interface SystemState {
  status: SystemStatus
  executionMode: ExecutionMode
  killSwitchReason?: string
  dailyLoss: number
  weeklyLoss: number
  monthlyDrawdown: number
  agentStatuses: AgentStatus[]
  lastScanAt: string
  nextScanAt: string
  confidenceScore: number
  marketConditionsScore: number
  noTradeReason?: string
}

export interface AgentStatus {
  id: string
  name: string
  type: 'NEWS' | 'MACRO' | 'SOCIAL' | 'PREDICTION' | 'CRYPTO' | 'FOREX' | 'EQUITY' | 'RISK'
  status: 'RUNNING' | 'IDLE' | 'ERROR' | 'PAUSED'
  lastRun: string
  itemsProcessed: number
  confidence: number
}

// ─── Daily Briefing ──────────────────────────────────────────────────────────
export interface DailyBriefing {
  date: string
  executiveSummary: string
  globalMarketSummary: string
  predictionSummary: string
  cryptoSummary: string
  forexSummary: string
  equitySummary: string
  topOpportunity: TradeSignal | null
  highestConfidence: TradeSignal | null
  highestEV: TradeSignal | null
  topArbitrage: TradeSignal | null
  marketsToAvoid: string[]
  riskWarnings: string[]
  noTradeReason?: string
  generatedAt: string
}

// ─── Quant Metrics ───────────────────────────────────────────────────────────
export interface QuantMetrics {
  expectedValue: number
  expectedReturn: number
  probability: number
  riskScore: number
  volatility: number
  beta: number
  alpha: number
  sharpe: number
  sortino: number
  liquidityScore: number
  marketRegimeScore: number
  trendStrength: number
  momentum: number
  drawdownProbability: number
  tailRisk: number
}

// ─── Technical Analysis ──────────────────────────────────────────────────────
export interface TechnicalAnalysis {
  trend: 'BULLISH' | 'BEARISH' | 'RANGING'
  strength: number
  support: number[]
  resistance: number[]
  rsi: number
  macd: { line: number; signal: number; histogram: number }
  atr: number
  vwap?: number
  volumeProfile: 'HIGH' | 'AVERAGE' | 'LOW'
  orderBlocks: { price: number; type: 'DEMAND' | 'SUPPLY' }[]
  fairValueGaps: { low: number; high: number; type: 'BULLISH' | 'BEARISH' }[]
}

// ─── Chart Data ──────────────────────────────────────────────────────────────
export interface ChartPoint {
  date: string
  value: number
  pnl?: number
  drawdown?: number
}

export interface SystemMetrics {
  totalMarketsScanned: number
  opportunitiesFound: number
  avgEdge: number
  winRate: number
  activePositions: number
  historicalRoi: number
  systemConfidence: number
  marketConditions: number
  dailyOpportunities: number
  paperTrades: number
  liveUnlocked: boolean
}
