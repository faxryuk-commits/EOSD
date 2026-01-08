import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const settings = await prisma.settings.findMany({
      where: {
        key: {
          startsWith: 'clickhouse_'
        }
      }
    })

    const result: Record<string, any> = {}
    settings.forEach(s => {
      const key = s.key.replace('clickhouse_', '')
      result[key] = s.value
    })

    // Parse syncOptions if exists
    if (result.syncOptions) {
      try {
        result.syncOptions = JSON.parse(result.syncOptions)
      } catch {
        result.syncOptions = { clients: true, revenue: true, orders: false, churn: true }
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({})
  }
}

export async function POST(request: Request) {
  try {
    const { host, user, password, syncOptions } = await request.json()

    const saveOps = [
      prisma.settings.upsert({
        where: { key: 'clickhouse_host' },
        update: { value: host || '' },
        create: { key: 'clickhouse_host', value: host || '' },
      }),
      prisma.settings.upsert({
        where: { key: 'clickhouse_user' },
        update: { value: user || '' },
        create: { key: 'clickhouse_user', value: user || '' },
      }),
      prisma.settings.upsert({
        where: { key: 'clickhouse_password' },
        update: { value: password || '' },
        create: { key: 'clickhouse_password', value: password || '' },
      }),
      prisma.settings.upsert({
        where: { key: 'clickhouse_syncOptions' },
        update: { value: JSON.stringify(syncOptions) },
        create: { key: 'clickhouse_syncOptions', value: JSON.stringify(syncOptions) },
      }),
    ]

    await prisma.$transaction(saveOps)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving settings:', error)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}
