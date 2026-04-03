import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const area = searchParams.get('area')
    const brandId = searchParams.get('brandId')
    const statusId = searchParams.get('statusId')
    const userId = searchParams.get('userId')
    const search = searchParams.get('search')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}
    if (area) where.area = area
    if (brandId) where.brandId = brandId
    if (statusId) where.statusId = statusId
    if (userId) where.userId = userId
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ]
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        brand: true,
        user: { select: { id: true, name: true, email: true, area: true } },
        status: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error('Tasks GET error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, area, priority, hours, observations, brandId, userId, statusId } = body

    if (!title || !area || !brandId || !statusId || !userId) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        area,
        priority: priority || 'MEDIA',
        hours: hours ? parseFloat(hours) : null,
        observations: observations || null,
        brandId,
        userId,
        statusId,
      },
      include: {
        brand: true,
        user: { select: { id: true, name: true, email: true, area: true } },
        status: true,
      },
    })

    return NextResponse.json({ task }, { status: 201 })
  } catch (error) {
    console.error('Tasks POST error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
