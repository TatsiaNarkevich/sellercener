import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        brand: true,
        user: { select: { id: true, name: true, email: true, area: true } },
        status: true,
      },
    })

    if (!task) {
      return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 })
    }

    return NextResponse.json({ task })
  } catch (error) {
    console.error('Task GET error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const existingTask = await prisma.task.findUnique({ where: { id: params.id } })
    if (!existingTask) {
      return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 })
    }

    const body = await request.json()
    const { title, description, area, priority, hours, observations, brandId, userId, statusId } = body

    const task = await prisma.task.update({
      where: { id: params.id },
      data: {
        title: title ?? existingTask.title,
        description: description !== undefined ? description : existingTask.description,
        area: area ?? existingTask.area,
        priority: priority ?? existingTask.priority,
        hours: hours !== undefined ? (hours ? parseFloat(hours) : null) : existingTask.hours,
        observations: observations !== undefined ? observations : existingTask.observations,
        brandId: brandId ?? existingTask.brandId,
        userId: userId ?? existingTask.userId,
        statusId: statusId ?? existingTask.statusId,
      },
      include: {
        brand: true,
        user: { select: { id: true, name: true, email: true, area: true } },
        status: true,
      },
    })

    return NextResponse.json({ task })
  } catch (error) {
    console.error('Task PUT error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const existingTask = await prisma.task.findUnique({ where: { id: params.id } })
    if (!existingTask) {
      return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 })
    }

    await prisma.task.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Task DELETE error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
