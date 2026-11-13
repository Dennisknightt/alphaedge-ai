import { NextResponse } from 'next/server'
import { placeMarketOrder, getAccountInfo, calcLotSize } from '@/lib/api/broker'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  if (!process.env.METAAPI_TOKEN || !process.env.METAAPI_ACCOUNT_ID) {
    return NextResponse.json({ error: 'Broker not configured' }, { status: 503 })
  }

  try {
    const body = await req.json()
    const { symbol, direction, stopLoss, takeProfit, riskPct = 1, lotSize } = body

    if (!symbol || !direction) {
      return NextResponse.json({ error: 'symbol and direction required' }, { status: 400 })
    }

    // Auto-calculate lot size from account balance if not provided
    let volume = lotSize
    if (!volume) {
      const account = await getAccountInfo()
      const slPips = stopLoss ? Math.abs(stopLoss - (takeProfit ?? stopLoss)) / 0.0001 : 20
      volume = calcLotSize(account.balance, riskPct, slPips)
    }

    const result = await placeMarketOrder({
      symbol,
      direction: direction.toUpperCase(),
      volume,
      stopLoss,
      takeProfit,
      comment: `AlphaEdge AI · ${symbol}`,
    })

    return NextResponse.json({ success: true, ...result })
  } catch (err: any) {
    console.error('execute route error:', err)
    return NextResponse.json({ error: err.message ?? 'Order failed' }, { status: 500 })
  }
}
