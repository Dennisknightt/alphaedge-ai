import type { CryptoAsset } from '@/types'

const BASE = 'https://api.coingecko.com/api/v3'

const TOP_IDS = [
  'bitcoin','ethereum','solana','binancecoin','ripple',
  'cardano','avalanche-2','polkadot','chainlink','uniswap',
  'the-open-network','dogecoin','shiba-inu','litecoin','bitcoin-cash',
]

export interface CoinHistory { date: string; price: number; volume: number; marketCap: number }

export async function fetchTopCryptos(limit = 50): Promise<CryptoAsset[]> {
  const url = `${BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=1h,24h,7d`
  const res = await fetch(url, { next: { revalidate: 120 } })
  if (!res.ok) throw new Error(`CoinGecko /markets ${res.status}`)
  const data = await res.json()

  return data.map((c: any): CryptoAsset => ({
    id:              c.id,
    symbol:          c.symbol.toUpperCase(),
    name:            c.name,
    price:           c.current_price ?? 0,
    change24h:       c.price_change_percentage_24h ?? 0,
    change7d:        c.price_change_percentage_7d_in_currency ?? 0,
    volume24h:       c.total_volume ?? 0,
    marketCap:       c.market_cap ?? 0,
    dominance:       undefined,
    fundingRate:     undefined,
    openInterest:    undefined,
    whaleActivity:   undefined,
    exchangeNetflow: undefined,
  }))
}

export async function fetchCoinHistory(
  coinId: string,
  days: number | 'max' = 'max'
): Promise<CoinHistory[]> {
  const url = `${BASE}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=${days === 'max' || (typeof days === 'number' && days > 90) ? 'daily' : 'hourly'}`
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error(`CoinGecko history ${res.status}`)
  const data = await res.json()

  const prices:     [number, number][] = data.prices ?? []
  const volumes:    [number, number][] = data.total_volumes ?? []
  const marketCaps: [number, number][] = data.market_caps ?? []

  return prices.map(([ts, price], i) => ({
    date:      new Date(ts).toISOString().slice(0, 10),
    price,
    volume:    volumes[i]?.[1]    ?? 0,
    marketCap: marketCaps[i]?.[1] ?? 0,
  }))
}

export async function fetchGlobalStats(): Promise<{
  totalMarketCap: number
  btcDominance:   number
  totalVolume:    number
  marketCapChange24h: number
}> {
  const res = await fetch(`${BASE}/global`, { next: { revalidate: 300 } })
  if (!res.ok) throw new Error(`CoinGecko /global ${res.status}`)
  const { data } = await res.json()
  return {
    totalMarketCap:     data.total_market_cap?.usd ?? 0,
    btcDominance:       data.market_cap_percentage?.btc ?? 0,
    totalVolume:        data.total_volume?.usd ?? 0,
    marketCapChange24h: data.market_cap_change_percentage_24h_usd ?? 0,
  }
}

export async function fetchFearGreedIndex(): Promise<{ value: number; label: string }> {
  try {
    const res = await fetch('https://api.alternative.me/fng/?limit=1', { next: { revalidate: 3600 } })
    if (!res.ok) throw new Error('FNG error')
    const { data } = await res.json()
    const v = parseInt(data[0]?.value ?? '50')
    return {
      value: v,
      label: data[0]?.value_classification ?? (v < 25 ? 'Extreme Fear' : v < 45 ? 'Fear' : v < 55 ? 'Neutral' : v < 75 ? 'Greed' : 'Extreme Greed'),
    }
  } catch {
    return { value: 50, label: 'Neutral' }
  }
}
