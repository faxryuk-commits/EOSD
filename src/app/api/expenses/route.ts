import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { periodId, regionId, salary, marketing, office, software, otherExpenses } = body

    if (!periodId || !regionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const existing = await prisma.monthlyData.findFirst({
      where: { periodId, regionId },
    })

    if (existing) {
      await prisma.monthlyData.update({
        where: { id: existing.id },
        data: {
          salary: salary || 0,
          marketing: marketing || 0,
          office: office || 0,
          software: software || 0,
          otherExpenses: otherExpenses || 0,
        },
      })
    } else {
      await prisma.monthlyData.create({
        data: {
          periodId,
          regionId,
          revenue: 0,
          clientsCount: 0,
          newClients: 0,
          churnedClients: 0,
          salary: salary || 0,
          marketing: marketing || 0,
          office: office || 0,
          software: software || 0,
          otherExpenses: otherExpenses || 0,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving expenses:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

