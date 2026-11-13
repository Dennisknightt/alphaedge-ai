import { NextResponse } from 'next/server'
import { getOpenPositions } from '@/lib/api/broker'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!process.env.METAAPI_TOKEN || !process.env.METAAPI_ACCOUNT_ID) {
    return NextResponse.json({ positions: [], error: 'Broker not configured' }, { status: 200 })
  }
  try {
    const positions = await getOpenPositions()
    return NextResponse.json({ positions })
  } catch (err: any) {
    return NextResponse.json({ positions: [], error: err.message }, { status: 500 })
  }
}
