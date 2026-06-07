import { NextResponse } from 'next/server'
import { generateLiveBriefing } from '@/lib/api/analysis'
import { fetchPolymarkets } from '@/lib/api/polymarket'
import { fetchGlobalStats, fetchFearGreedIndex } from '@/lib/api/coingecko'
import { fetchMacroDashboard, classifyRegime } from '@/lib/api/macro'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 503 })
  }

  try {
    const [markets, global, fng, macro] = await Promise.all([
      fetchPolymarkets(20),
      fetchGlobalStats().catch(() => null),
      fetchFearGreedIndex().catch(() => null),
      fetchMacroDashboard().catch(() => null),
    ])

    const regime = macro ? classifyRegime(macro) : null

    const cryptoSummary = global
      ? `Total market cap $${(global.totalMarketCap / 1e12).toFixed(2)}T (${global.marketCapChange24h >= 0 ? '+' : ''}${global.marketCapChange24h.toFixed(1)}% 24h). BTC dominance ${global.btcDominance.toFixed(1)}%. Fear & Greed: ${fng?.value ?? 50} (${fng?.label ?? 'Neutral'}).`
      : 'Crypto market data unavailable.'

    const macroSummary = macro && regime
      ? `Regime: ${regime.label} (${regime.description}). Fed Funds: ${macro.fedFundsRate.current.toFixed(2)}%. CPI YoY: ${macro.cpiYoY.current.toFixed(1)}%. Unemployment: ${macro.unemployment.current.toFixed(1)}%. 10Y Yield: ${macro.tenYearYield.current.toFixed(2)}%. Yield curve spread: ${macro.yieldCurveSpread.toFixed(2)}%.`
      : 'Macro data loading.'

    const forexSummary = 'EUR/USD, GBP/USD showing USD weakness bias. Fed pivot expectations driving dollar outflows. Monitor ECB and BOJ divergence.'

    const briefingText = await generateLiveBriefing({
      topMarkets:    markets.slice(0, 10),
      cryptoSummary,
      forexSummary,
      macroSummary,
      portfolioRoi:  28.4,
      openPositions: 2,
    })

    return NextResponse.json({
      briefing: briefingText,
      markets:  markets.slice(0, 5),
      macro:    macro ? { regime, rates: { fed: macro.fedFundsRate.current, cpi: macro.cpiYoY.current, unemployment: macro.unemployment.current, t10: macro.tenYearYield.current } } : null,
      crypto:   { global, fearGreed: fng },
      generatedAt: new Date().toISOString(),
    })
  } catch (err) {
    console.error('briefing route:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
