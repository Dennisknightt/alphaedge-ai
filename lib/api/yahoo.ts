import type { Equity } from '@/types'

const PROXY = '/api/yahoo'  // We proxy through Next.js to avoid CORS

export interface OHLCPoint { date: string; open: number; high: number; low: number; close: number; volume: number }

const WATCHLIST = [
  { ticker: 'SPY',  name: 'S&P 500 ETF',         sector: 'Index ETF' },
  { ticker: 'QQQ',  name: 'Nasdaq 100 ETF',       sector: 'Index ETF' },
  { ticker: 'NVDA', name: 'NVIDIA Corp',           sector: 'Technology' },
  { ticker: 'AAPL', name: 'Apple Inc',             sector: 'Technology' },
  { ticker: 'MSFT', name: 'Microsoft Corp',        sector: 'Technology' },
  { ticker: 'META', name: 'Meta Platforms',        sector: 'Technology' },
  { ticker: 'GOOGL',name: 'Alphabet Inc',          sector: 'Technology' },
  { ticker: 'AMZN', name: 'Amazon.com Inc',        sector: 'Consumer' },
  { ticker: 'TSLA', name: 'Tesla Inc',             sector: 'Consumer' },
  { ticker: 'JPM',  name: 'JPMorgan Chase',        sector: 'Financials' },
  { ticker: 'GLD',  name: 'SPDR Gold ETF',         sector: 'Commodities' },
  { ticker: 'TLT',  name: 'iShares 20yr Treasury', sector: 'Fixed Income' },
  { ticker: 'VIX',  name: 'CBOE Volatility Index', sector: 'Volatility' },
  { ticker: 'BTC-USD', name: 'Bitcoin USD',        sector: 'Crypto' },
]

export async function fetchEquities(): Promise<Equity[]> {
  const tickers = WATCHLIST.filter(w => w.sector !== 'Volatility').map(w => w.ticker)
  const results = await Promise.allSettled(
    tickers.map(t => fetchSingleQuote(t))
  )

  return results
    .map((r, i) => {
      if (r.status === 'rejected') return null
      const q = r.value
      const meta = WATCHLIST[i]
      return {
        ticker:         meta.ticker,
        name:           meta.name,
        sector:         meta.sector,
        price:          q.price,
        change1d:       q.change1dPct,
        change5d:       q.change5dPct,
        pe:             q.pe,
        eps:            q.eps,
        marketCap:      q.marketCap,
        volume:         q.volume,
        avgVolume:      q.avgVolume,
        relativeVolume: q.avgVolume > 0 ? q.volume / q.avgVolume : 1,
        earningsDate:   q.earningsDate,
        analystRating:  undefined,
      } as Equity
    })
    .filter(Boolean) as Equity[]
}

interface QuoteData {
  price: number; change1dPct: number; change5dPct: number
  pe?: number; eps?: number; marketCap: number; volume: number; avgVolume: number; earningsDate?: string
}

async function fetchSingleQuote(ticker: string): Promise<QuoteData> {
  const url = `${PROXY}?ticker=${encodeURIComponent(ticker)}&range=1mo&interval=1d`
  const res = await fetch(url, { next: { revalidate: 300 } })
  if (!res.ok) throw new Error(`Yahoo ${ticker} ${res.status}`)
  return res.json()
}

export async function fetchTickerHistory(ticker: string, range = '10y'): Promise<OHLCPoint[]> {
  const url = `${PROXY}?ticker=${encodeURIComponent(ticker)}&range=${range}&interval=1d`
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error(`Yahoo history ${ticker} ${res.status}`)
  const data = await res.json()
  return data.ohlc ?? []
}
