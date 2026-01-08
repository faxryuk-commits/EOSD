export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const warnings = await prisma.warning.findMany({
      include: { owner: true, region: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(warnings)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch warnings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, category, severity, ownerId, regionId, mitigation } = body

    const warning = await prisma.warning.create({
      data: {
        title,
        description,
        category: category || 'operational',
        severity: severity || 'medium',
        status: 'open',
        ownerId: ownerId || null,
        regionId: regionId || null,
        mitigationPlan: mitigation || null,
      },
    })

    return NextResponse.json(warning)
  } catch (error) {
    console.error('Error creating warning:', error)
    return NextResponse.json({ error: 'Failed to create warning' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    const warning = await prisma.warning.update({
      where: { id },
      data,
    })

    return NextResponse.json(warning)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update warning' }, { status: 500 })
  }
}

