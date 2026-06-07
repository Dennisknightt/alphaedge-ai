import { NextResponse } from 'next/server'
import { fetchForexRates } from '@/lib/api/frankfurter'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const pairs = await fetchForexRates()
    return NextResponse.json({ pairs, fetchedAt: new Date().toISOString() })
  } catch (err) {
    console.error('forex route:', err)
    return NextResponse.json({ error: String(err), pairs: [] }, { status: 500 })
  }
}
