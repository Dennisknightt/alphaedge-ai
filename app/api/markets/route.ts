import { NextResponse } from 'next/server'
import { fetchPolymarkets } from '@/lib/api/polymarket'
import { scoreMarketsInBulk } from '@/lib/api/analysis'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const limit    = parseInt(searchParams.get('limit') ?? '30')
  const analyze  = searchParams.get('analyze') !== 'false'

  try {
    // 1. Fetch live Polymarket data
    let markets = await fetchPolymarkets(limit)

    // 2. Score with Claude if API key is present
    if (analyze && process.env.ANTHROPIC_API_KEY && markets.length > 0) {
      const scores = await scoreMarketsInBulk(markets)
      const scoreMap = new Map(scores.map(s => [s.id, s]))

      markets = markets.map(m => {
        const s = scoreMap.get(m.id)
        if (!s) return m
        return {
          ...m,
          aiProb:          s.aiProb,
          edge:            s.edge,
          ev:              s.ev,
          confidence:      s.confidence,
          recommendedSide: s.recommendation === 'YES' ? 'YES' as const
                         : s.recommendation === 'NO'  ? 'NO'  as const
                         : 'NONE' as const,
        }
      })
    }

    // 3. Sort by edge magnitude
    markets.sort((a, b) => Math.abs(b.edge) - Math.abs(a.edge))

    return NextResponse.json({
      markets,
      count: markets.length,
      analyzed: analyze && !!process.env.ANTHROPIC_API_KEY,
      fetchedAt: new Date().toISOString(),
    })
  } catch (err) {
    console.error('markets route:', err)
    return NextResponse.json({ error: String(err), markets: [], count: 0, fetchedAt: new Date().toISOString() }, { status: 500 })
  }
}
