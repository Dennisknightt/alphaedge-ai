import { NextResponse } from 'next/server'
import { getAccountInfo } from '@/lib/api/broker'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!process.env.METAAPI_TOKEN || !process.env.METAAPI_ACCOUNT_ID) {
    return NextResponse.json({ error: 'Broker not configured. Add METAAPI_TOKEN and METAAPI_ACCOUNT_ID.' }, { status: 503 })
  }
  try {
    const account = await getAccountInfo()
    return NextResponse.json(account)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Failed to fetch account' }, { status: 500 })
  }
}
