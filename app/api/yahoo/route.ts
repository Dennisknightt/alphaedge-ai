import { NextResponse } from 'next/server'

const YF_BASE = 'https://query1.finance.yahoo.com'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const ticker   = searchParams.get('ticker') ?? 'AAPL'
  const range    = searchParams.get('range') ?? '1mo'
  const interval = searchParams.get('interval') ?? '1d'

  try {
    const url = `${YF_BASE}/v8/finance/chart/${encodeURIComponent(ticker)}?interval=${interval}&range=${range}&includePrePost=false`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: range === '1d' ? 60 : 3600 },
    })

    if (!res.ok) throw new Error(`Yahoo Finance ${ticker} ${res.status}`)
    const json = await res.json()

    const result = json.chart?.result?.[0]
    if (!result) throw new Error('No data')

    const { meta, timestamp, indicators } = result
    const quotes = indicators?.quote?.[0] ?? {}
    const adjClose = indicators?.adjclose?.[0]?.adjclose

    // Quote data (most recent)
    const lastIdx = (timestamp?.length ?? 1) - 1
    const price   = adjClose?.[lastIdx] ?? quotes.close?.[lastIdx] ?? meta.regularMarketPrice ?? 0
    const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? price
    const change1dPct = ((price - prevClose) / prevClose) * 100

    // 5-day change
    const idx5  = Math.max(0, lastIdx - 5)
    const p5    = adjClose?.[idx5] ?? quotes.close?.[idx5] ?? price
    const change5dPct = ((price - p5) / p5) * 100

    // Volume
    const volume    = quotes.volume?.[lastIdx] ?? 0
    const avgVolume = quotes.volume
      ? Math.round(quotes.volume.filter(Boolean).reduce((a: number, b: number) => a + b, 0) / quotes.volume.filter(Boolean).length)
      : 0

    // OHLC history for charts
    const ohlc = timestamp
      ? timestamp.map((ts: number, i: number) => ({
          date:   new Date(ts * 1000).toISOString().slice(0, 10),
          open:   quotes.open?.[i] ?? 0,
          high:   quotes.high?.[i] ?? 0,
          low:    quotes.low?.[i] ?? 0,
          close:  adjClose?.[i] ?? quotes.close?.[i] ?? 0,
          volume: quotes.volume?.[i] ?? 0,
        })).filter((d: any) => d.close > 0)
      : []

    return NextResponse.json({
      ticker: meta.symbol,
      price,
      prevClose,
      change1dPct,
      change5dPct,
      volume,
      avgVolume,
      marketCap:    meta.marketCap ?? 0,
      pe:           meta.trailingPE ?? undefined,
      eps:          meta.epsTrailingTwelveMonths ?? undefined,
      earningsDate: undefined,
      ohlc,
      currency:     meta.currency ?? 'USD',
    })
  } catch (err) {
    console.error('yahoo route:', ticker, err)
    return NextResponse.json({ error: String(err), ticker, price: 0, ohlc: [] }, { status: 500 })
  }
}
