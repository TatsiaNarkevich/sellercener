import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  const step: string[] = []
  try {
    step.push('parse-body')
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 })
    }

    step.push('prisma-query')
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user || !user.active) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
    }

    step.push('bcrypt-compare')
    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
    }

    step.push('sign-token')
    const token = await signToken({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      area: user.area,
    })

    step.push('set-cookie')
    const response = NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role, area: user.area } })
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error at step', step.at(-1), ':', error)
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: 'Erro interno do servidor', step: step.at(-1), detail: msg }, { status: 500 })
  }
}
