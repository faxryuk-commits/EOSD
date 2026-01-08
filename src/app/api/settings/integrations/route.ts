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

    const config: Record<string, string> = {}
    settings.forEach(s => {
      config[s.key.replace('clickhouse_', '')] = s.value
    })

    return NextResponse.json({ config })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { config, metrics } = body

    // Save ClickHouse config
    const configKeys = ['host', 'port', 'database', 'username', 'password', 'ssl']
    for (const key of configKeys) {
      if (config[key] !== undefined) {
        await prisma.settings.upsert({
          where: { key: `clickhouse_${key}` },
          update: { value: String(config[key]) },
          create: { 
            key: `clickhouse_${key}`, 
            value: String(config[key]),
            description: `ClickHouse ${key} configuration`
          },
        })
      }
    }

    // Save metrics config as JSON
    if (metrics) {
      await prisma.settings.upsert({
        where: { key: 'clickhouse_metrics' },
        update: { value: JSON.stringify(metrics) },
        create: { 
          key: 'clickhouse_metrics', 
          value: JSON.stringify(metrics),
          description: 'ClickHouse metrics configuration'
        },
      })
    }

    return NextResponse.json({ success: true, message: 'Configuration saved' })
  } catch (error: any) {
    console.error('Save error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

