import { NextResponse } from 'next/server'
import { fetchCoinHistory } from '@/lib/api/coingecko'
import { fetchForexHistory } from '@/lib/api/frankfurter'
import type { ChartPoint } from '@/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const type  = searchParams.get('type') ?? 'crypto'
  const asset = searchParams.get('asset') ?? 'bitcoin'
  const from  = searchParams.get('from') ?? '2013-01-01'

  try {
    let points: ChartPoint[] = []

    if (type === 'crypto') {
      const hist = await fetchCoinHistory(asset, 'max')
      const startTs = new Date(from).getTime()
      points = hist
        .filter(h => new Date(h.date).getTime() >= startTs)
        .map(h => ({ date: h.date, value: h.price, pnl: 0 }))
    }

    if (type === 'forex') {
      const [base, quote] = asset.split('/')
      if (base && quote) {
        const hist = await fetchForexHistory(base, quote, from)
        points = hist.map(h => ({ date: h.date, value: h.rate, pnl: 0 }))
      }
    }

    if (type === 'sp500') {
      // Use Yahoo Finance proxy for S&P 500
      const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001'}/api/yahoo?ticker=SPY&range=max&interval=1mo`)
      if (res.ok) {
        const data = await res.json()
        const startTs = new Date(from).getTime()
        points = (data.ohlc ?? [])
          .filter((d: any) => new Date(d.date).getTime() >= startTs)
          .map((d: any) => ({ date: d.date, value: d.close, pnl: 0 }))
      }
    }

    // Compute cumulative return as pnl
    const first = points[0]?.value ?? 1
    points = points.map(p => ({ ...p, pnl: ((p.value - first) / first) * 100 }))

    return NextResponse.json({ points, asset, type, from, count: points.length })
  } catch (err) {
    console.error('history route:', err)
    return NextResponse.json({ error: String(err), points: [] }, { status: 500 })
  }
}
