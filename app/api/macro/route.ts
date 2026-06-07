import { NextResponse } from 'next/server'
import { fetchMacroDashboard, classifyRegime } from '@/lib/api/macro'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const macro  = await fetchMacroDashboard()
    const regime = classifyRegime(macro)
    return NextResponse.json({ macro, regime, fetchedAt: new Date().toISOString() })
  } catch (err) {
    console.error('macro route:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
