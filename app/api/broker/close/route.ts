import { NextResponse } from 'next/server'
import { closePosition } from '@/lib/api/broker'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  if (!process.env.METAAPI_TOKEN || !process.env.METAAPI_ACCOUNT_ID) {
    return NextResponse.json({ error: 'Broker not configured' }, { status: 503 })
  }
  try {
    const { positionId } = await req.json()
    if (!positionId) return NextResponse.json({ error: 'positionId required' }, { status: 400 })
    await closePosition(positionId)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Close failed' }, { status: 500 })
  }
}
