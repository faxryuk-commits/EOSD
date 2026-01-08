export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const clients = await prisma.topClient.findMany({
      include: { 
        region: true,
        healthChecks: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { mrr: 'desc' },
    })
    return NextResponse.json(clients)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, regionId, mrr, contractStart, contractEnd, healthStatus, churnRisk } = body

    const client = await prisma.topClient.create({
      data: {
        name,
        regionId: regionId || 1,
        mrr: mrr || 0,
        contractStart: contractStart ? new Date(contractStart) : new Date(),
        contractEnd: contractEnd ? new Date(contractEnd) : null,
      },
    })
    
    // Create initial health check if status provided
    if (healthStatus || churnRisk) {
      // Find current period
      const currentPeriod = await prisma.period.findFirst({
        orderBy: { id: 'desc' }
      })
      
      if (currentPeriod) {
        await prisma.clientHealthCheck.create({
          data: {
            clientId: client.id,
            periodId: currentPeriod.id,
            healthStatus: healthStatus || 'healthy',
            churnRisk: churnRisk || 'low',
          },
        })
      }
    }

    return NextResponse.json(client)
  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    const client = await prisma.topClient.update({
      where: { id },
      data,
    })

    return NextResponse.json(client)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 })
  }
}

