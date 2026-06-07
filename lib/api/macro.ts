// Macro data from public FRED (St. Louis Fed) and World Bank APIs
// FRED API is free and public — key optional for higher rate limits

export interface MacroSeries { date: string; value: number }

const FRED_BASE = 'https://fred.stlouisfed.org/graph/fredgraph.csv'

// Series IDs
const SERIES = {
  fedFundsRate:     'FEDFUNDS',        // Federal Funds Effective Rate (monthly)
  cpi:              'CPIAUCSL',        // Consumer Price Index
  cpiYoY:           'CPALTT01USM657N', // CPI YoY %
  unemployment:     'UNRATE',          // Unemployment Rate
  gdpGrowth:        'A191RL1Q225SBEA', // Real GDP Growth Rate
  tenYearYield:     'DGS10',           // 10-Year Treasury Yield
  twoYearYield:     'DGS2',            // 2-Year Treasury Yield
  sp500:            'SP500',           // S&P 500
  m2:               'M2SL',            // M2 Money Supply
  coreInflation:    'CPILFESL',        // Core CPI (ex food & energy)
  pce:              'PCEPI',           // PCE Price Index
  hoursWorked:      'HOABS',           // Non-farm Business Sector Hours Worked
  vix:              'VIXCLS',          // VIX (CBOE Volatility)
  dollarIndex:      'DTWEXBGS',        // Trade-Weighted USD Index
}

// Public FRED CSV endpoint — no API key needed for this endpoint
async function fetchFredSeries(seriesId: string, limit = 600): Promise<MacroSeries[]> {
  const url = `${FRED_BASE}?id=${seriesId}&vintage_date=&realtime_start=&realtime_end=`
  try {
    const res = await fetch(url, { next: { revalidate: 86400 } })
    if (!res.ok) throw new Error(`FRED ${seriesId} ${res.status}`)
    const text = await res.text()
    const lines = text.trim().split('\n').slice(1) // skip header
    return lines
      .slice(-limit)
      .map(line => {
        const [date, value] = line.split(',')
        const v = parseFloat(value)
        return { date: date.trim(), value: isNaN(v) ? 0 : v }
      })
      .filter(d => d.value !== 0)
  } catch {
    return []
  }
}

export interface MacroDashboard {
  fedFundsRate:  { current: number; previous: number; series: MacroSeries[] }
  cpiYoY:        { current: number; previous: number; series: MacroSeries[] }
  unemployment:  { current: number; previous: number; series: MacroSeries[] }
  tenYearYield:  { current: number; previous: number; series: MacroSeries[] }
  twoYearYield:  { current: number; previous: number; series: MacroSeries[] }
  sp500:         { current: number; previous: number; series: MacroSeries[] }
  vix:           { current: number; previous: number; series: MacroSeries[] }
  dollarIndex:   { current: number; previous: number; series: MacroSeries[] }
  yieldCurveSpread: number // 10Y - 2Y
  lastUpdated:   string
}

export async function fetchMacroDashboard(): Promise<MacroDashboard> {
  const [fed, cpi, unemp, t10, t2, sp, vix, dxy] = await Promise.all([
    fetchFredSeries(SERIES.fedFundsRate,  120),
    fetchFredSeries(SERIES.cpiYoY,        120),
    fetchFredSeries(SERIES.unemployment,  120),
    fetchFredSeries(SERIES.tenYearYield,   60),
    fetchFredSeries(SERIES.twoYearYield,   60),
    fetchFredSeries(SERIES.sp500,         600),  // since 2010+
    fetchFredSeries(SERIES.vix,            60),
    fetchFredSeries(SERIES.dollarIndex,    60),
  ])

  const last = (arr: MacroSeries[]) => arr.at(-1)?.value ?? 0
  const prev = (arr: MacroSeries[]) => arr.at(-2)?.value ?? 0

  const t10cur = last(t10)
  const t2cur  = last(t2)

  return {
    fedFundsRate:  { current: last(fed),  previous: prev(fed),  series: fed  },
    cpiYoY:        { current: last(cpi),  previous: prev(cpi),  series: cpi  },
    unemployment:  { current: last(unemp),previous: prev(unemp),series: unemp },
    tenYearYield:  { current: t10cur,     previous: prev(t10),  series: t10  },
    twoYearYield:  { current: t2cur,      previous: prev(t2),   series: t2   },
    sp500:         { current: last(sp),   previous: prev(sp),   series: sp   },
    vix:           { current: last(vix),  previous: prev(vix),  series: vix  },
    dollarIndex:   { current: last(dxy),  previous: prev(dxy),  series: dxy  },
    yieldCurveSpread: t10cur - t2cur,
    lastUpdated:   new Date().toISOString(),
  }
}

// Market regime classifier based on macro data
export function classifyRegime(macro: MacroDashboard): {
  label: string
  description: string
  riskScore: number
} {
  const { fedFundsRate: fed, cpiYoY: cpi, unemployment: unemp, vix, yieldCurveSpread: spread } = macro
  const fedR  = fed.current
  const cpiR  = cpi.current
  const unempR = unemp.current
  const vixR  = vix.current
  let riskScore = 50

  // High rates + high inflation = stagflation risk
  if (fedR > 4 && cpiR > 4) riskScore += 20
  // Inverted yield curve = recession risk
  if (spread < 0) riskScore += 15
  // High VIX = elevated fear
  if (vixR > 25) riskScore += 15
  if (vixR > 35) riskScore += 10
  // Low unemployment = healthy
  if (unempR < 4.5) riskScore -= 10
  // Easing Fed = supportive
  if (fedR < fed.previous) riskScore -= 10

  riskScore = Math.min(100, Math.max(0, riskScore))

  let label: string
  let description: string

  if (riskScore < 30) {
    label = 'GOLDILOCKS'
    description = 'Low inflation, moderate growth, supportive policy'
  } else if (riskScore < 45) {
    label = 'EXPANSION'
    description = 'Healthy economic growth with manageable risks'
  } else if (riskScore < 60) {
    label = 'LATE CYCLE'
    description = 'Elevated rates, slowing growth signals'
  } else if (riskScore < 75) {
    label = 'RISK-OFF'
    description = 'High uncertainty, defensive posture warranted'
  } else {
    label = 'CRISIS WATCH'
    description = 'Multiple risk factors elevated simultaneously'
  }

  return { label, description, riskScore }
}
