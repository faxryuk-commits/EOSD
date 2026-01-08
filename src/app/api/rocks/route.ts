export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const rocks = await prisma.rock.findMany({
      include: { owner: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(rocks)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch rocks' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, quarter, year, ownerId, dueDate } = body

    // Calculate default due date (end of quarter)
    const q = quarter || 1
    const y = year || 2026
    const defaultDueDate = new Date(y, q * 3, 0) // Last day of quarter
    
    const rock = await prisma.rock.create({
      data: {
        title,
        description,
        quarter: q,
        year: y,
        status: 'on_track',
        progress: 0,
        ownerId: ownerId || null,
        dueDate: dueDate ? new Date(dueDate) : defaultDueDate,
      },
    })

    return NextResponse.json(rock)
  } catch (error) {
    console.error('Error creating rock:', error)
    return NextResponse.json({ error: 'Failed to create rock' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    const rock = await prisma.rock.update({
      where: { id },
      data,
    })

    return NextResponse.json(rock)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update rock' }, { status: 500 })
  }
}

