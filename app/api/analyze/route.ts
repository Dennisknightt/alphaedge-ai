import { NextResponse } from 'next/server'
import type { PredictionMarket } from '@/types'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const market: PredictionMarket = body.market

    if (!market) {
      return NextResponse.json({ error: 'market required' }, { status: 400 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 503 }
      )
    }

    // Lazy import to avoid loading SDK at edge
    const { analyzeMarket } = await import('@/lib/claude')
    const analysis = await analyzeMarket(market)
    return NextResponse.json({ analysis })
  } catch (err) {
    console.error('analyze route error:', err)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
