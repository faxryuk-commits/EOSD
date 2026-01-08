import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { periodId, regionId, revenue, clientsCount, newClients, churnedClients } = body

    // Validate
    if (!periodId || !regionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Find existing record
    const existing = await prisma.monthlyData.findFirst({
      where: { periodId, regionId },
    })

    if (existing) {
      // Update
      await prisma.monthlyData.update({
        where: { id: existing.id },
        data: {
          revenue: revenue || 0,
          clientsCount: clientsCount || 0,
          newClients: newClients || 0,
          churnedClients: churnedClients || 0,
        },
      })
    } else {
      // Create
      await prisma.monthlyData.create({
        data: {
          periodId,
          regionId,
          revenue: revenue || 0,
          clientsCount: clientsCount || 0,
          newClients: newClients || 0,
          churnedClients: churnedClients || 0,
          salary: 0,
          marketing: 0,
          office: 0,
          software: 0,
          otherExpenses: 0,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving sales data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const periodId = searchParams.get('periodId')

    if (!periodId) {
      return NextResponse.json({ error: 'Missing periodId' }, { status: 400 })
    }

    const data = await prisma.monthlyData.findMany({
      where: { periodId: parseInt(periodId) },
      include: { region: true },
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching sales data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

