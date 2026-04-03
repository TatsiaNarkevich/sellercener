import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const statuses = await prisma.status.findMany({ orderBy: { order: 'asc' } })
    return NextResponse.json({ statuses })
  } catch (error) {
    console.error('Statuses GET error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const role = request.headers.get('x-user-role')
    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const body = await request.json()
    const { name, color, order, isDefault } = body

    if (!name) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }

    const status = await prisma.status.create({
      data: { name, color: color || '#6B7280', order: order ?? 0, isDefault: isDefault ?? false },
    })

    return NextResponse.json({ status }, { status: 201 })
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'P2002') {
      return NextResponse.json({ error: 'Status já existe' }, { status: 409 })
    }
    console.error('Statuses POST error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
