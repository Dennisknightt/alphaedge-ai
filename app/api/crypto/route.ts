import { NextResponse } from 'next/server'
import { fetchTopCryptos, fetchGlobalStats, fetchFearGreedIndex } from '@/lib/api/coingecko'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const [assets, global, fng] = await Promise.all([
      fetchTopCryptos(50),
      fetchGlobalStats(),
      fetchFearGreedIndex(),
    ])

    return NextResponse.json({ assets, global, fearGreed: fng, fetchedAt: new Date().toISOString() })
  } catch (err) {
    console.error('crypto route:', err)
    return NextResponse.json({ error: String(err), assets: [], global: null, fearGreed: null }, { status: 500 })
  }
}
