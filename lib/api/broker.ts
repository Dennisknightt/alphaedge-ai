/**
 * MetaAPI broker integration — wraps Exness MT4/MT5 via MetaAPI REST
 * Docs: https://metaapi.cloud/docs/client/restApi/
 */

const META_API_BASE = 'https://mt-client-api-v1.agiliumtrade.agiliumtrade.ai'
const META_PROVISIONING_BASE = 'https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai'

function headers() {
  return {
    'auth-token': process.env.METAAPI_TOKEN ?? '',
    'Content-Type': 'application/json',
  }
}

const ACCOUNT_ID = () => process.env.METAAPI_ACCOUNT_ID ?? ''

// ─── Account Info ─────────────────────────────────────────────────────────────
export interface BrokerAccount {
  balance: number
  equity: number
  margin: number
  freeMargin: number
  marginLevel: number
  currency: string
  leverage: number
  server: string
  connected: boolean
}

export async function getAccountInfo(): Promise<BrokerAccount> {
  const [infoRes, connRes] = await Promise.all([
    fetch(`${META_API_BASE}/users/current/accounts/${ACCOUNT_ID()}/account-information`, { headers: headers() }),
    fetch(`${META_PROVISIONING_BASE}/users/current/accounts/${ACCOUNT_ID()}`, { headers: headers() }),
  ])

  if (!infoRes.ok) {
    const err = await infoRes.text()
    throw new Error(`MetaAPI account info failed: ${err}`)
  }

  const info = await infoRes.json()
  const acct = connRes.ok ? await connRes.json() : {}

  return {
    balance:     info.balance ?? 0,
    equity:      info.equity ?? 0,
    margin:      info.margin ?? 0,
    freeMargin:  info.freeMargin ?? 0,
    marginLevel: info.marginLevel ?? 0,
    currency:    info.currency ?? 'USD',
    leverage:    info.leverage ?? 100,
    server:      acct.server ?? 'Exness',
    connected:   acct.connectionStatus === 'CONNECTED',
  }
}

// ─── Open Positions ───────────────────────────────────────────────────────────
export interface BrokerPosition {
  id: string
  symbol: string
  type: 'BUY' | 'SELL'
  volume: number
  openPrice: number
  currentPrice: number
  profit: number
  swap: number
  openTime: string
  stopLoss?: number
  takeProfit?: number
}

export async function getOpenPositions(): Promise<BrokerPosition[]> {
  const res = await fetch(
    `${META_API_BASE}/users/current/accounts/${ACCOUNT_ID()}/positions`,
    { headers: headers() }
  )
  if (!res.ok) throw new Error(`MetaAPI positions failed: ${await res.text()}`)
  const data = await res.json()

  return (data ?? []).map((p: any): BrokerPosition => ({
    id:           p.id,
    symbol:       p.symbol,
    type:         p.type === 'POSITION_TYPE_BUY' ? 'BUY' : 'SELL',
    volume:       p.volume,
    openPrice:    p.openPrice,
    currentPrice: p.currentPrice,
    profit:       p.profit,
    swap:         p.swap ?? 0,
    openTime:     p.time,
    stopLoss:     p.stopLoss,
    takeProfit:   p.takeProfit,
  }))
}

// ─── Place Order ──────────────────────────────────────────────────────────────
export interface OrderParams {
  symbol: string          // e.g. 'EURUSD', 'XAUUSD'
  direction: 'BUY' | 'SELL'
  volume: number          // lot size e.g. 0.01
  stopLoss?: number
  takeProfit?: number
  comment?: string
}

export interface OrderResult {
  orderId: string
  positionId?: string
  filled: boolean
  price: number
}

export async function placeMarketOrder(params: OrderParams): Promise<OrderResult> {
  const body = {
    actionType: params.direction === 'BUY' ? 'ORDER_TYPE_BUY' : 'ORDER_TYPE_SELL',
    symbol:     params.symbol,
    volume:     params.volume,
    stopLoss:   params.stopLoss,
    takeProfit: params.takeProfit,
    comment:    params.comment ?? 'AlphaEdge AI',
  }

  const res = await fetch(
    `${META_API_BASE}/users/current/accounts/${ACCOUNT_ID()}/trade`,
    { method: 'POST', headers: headers(), body: JSON.stringify(body) }
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message ?? `Order failed: ${res.status}`)
  }

  const result = await res.json()
  return {
    orderId:    result.orderId ?? result.positionId ?? 'unknown',
    positionId: result.positionId,
    filled:     result.tradeExecutionStatus === 'TRADE_EXECUTED',
    price:      result.openPrice ?? 0,
  }
}

// ─── Close Position ───────────────────────────────────────────────────────────
export async function closePosition(positionId: string): Promise<void> {
  const res = await fetch(
    `${META_API_BASE}/users/current/accounts/${ACCOUNT_ID()}/trade`,
    {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ actionType: 'POSITION_CLOSE_ID', positionId }),
    }
  )
  if (!res.ok) throw new Error(`Close failed: ${await res.text()}`)
}

// ─── Symbol Price ─────────────────────────────────────────────────────────────
export async function getSymbolPrice(symbol: string): Promise<{ bid: number; ask: number }> {
  const res = await fetch(
    `${META_API_BASE}/users/current/accounts/${ACCOUNT_ID()}/symbols/${symbol}/current-price?keepSubscription=false`,
    { headers: headers() }
  )
  if (!res.ok) throw new Error(`Price fetch failed`)
  const data = await res.json()
  return { bid: data.bid, ask: data.ask }
}

// ─── Lot Size Calculator ──────────────────────────────────────────────────────
// Risk-based: 1% of balance per trade
export function calcLotSize(
  balance: number,
  riskPct: number,
  stopLossPips: number,
  pipValue: number = 10  // $10 per pip for standard lot on EURUSD
): number {
  const riskAmount = balance * (riskPct / 100)
  const lots = riskAmount / (stopLossPips * pipValue)
  // Round to 2 decimal places, min 0.01
  return Math.max(0.01, Math.round(lots * 100) / 100)
}
