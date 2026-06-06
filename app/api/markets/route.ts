import { NextResponse } from 'next/server'
import { fetchActiveMarkets, getMockMarkets } from '@/lib/polymarket'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get('limit') ?? '50')
  const useMock = searchParams.get('mock') === 'true'

  try {
    const markets = useMock ? getMockMarkets() : await fetchActiveMarkets(limit)
    return NextResponse.json({ markets, count: markets.length, fetchedAt: new Date().toISOString() })
  } catch (err) {
    console.error('markets route error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch markets', markets: getMockMarkets() },
      { status: 500 }
    )
  }
}
