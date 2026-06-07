import { NextResponse } from 'next/server'
import { fetchActiveMarkets } from '@/lib/polymarket'
import { mockPredictionMarkets } from '@/lib/mock-data'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get('limit') ?? '50')
  const useMock = searchParams.get('mock') !== 'false'

  try {
    const markets = useMock ? mockPredictionMarkets : await fetchActiveMarkets(limit)
    return NextResponse.json({ markets, count: markets.length, fetchedAt: new Date().toISOString() })
  } catch (err) {
    console.error('markets route error:', err)
    return NextResponse.json({ markets: mockPredictionMarkets, count: mockPredictionMarkets.length, fetchedAt: new Date().toISOString() })
  }
}
