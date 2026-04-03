import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existingTask = await prisma.task.findUnique({ where: { id: params.id } })
    if (!existingTask) {
      return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 })
    }

    // Only admin or task owner can edit
    if (session.role !== 'ADMIN' && existingTask.userId !== session.userId) {
      return NextResponse.json({ error: 'Sem permissão para editar esta tarefa' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, area, priority, hours, observations, brandId, userId, statusId } = body

    const assignedUserId = session.role === 'ADMIN' ? (userId || existingTask.userId) : existingTask.userId

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
        userId: assignedUserId,
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
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existingTask = await prisma.task.findUnique({ where: { id: params.id } })
    if (!existingTask) {
      return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 })
    }

    // Only admin or task owner can delete
    if (session.role !== 'ADMIN' && existingTask.userId !== session.userId) {
      return NextResponse.json({ error: 'Sem permissão para excluir esta tarefa' }, { status: 403 })
    }

    await prisma.task.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Task DELETE error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
