import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@sellercener.com' },
    update: {},
    create: {
      email: 'admin@sellercener.com',
      name: 'Admin',
      password: hashedPassword,
      role: 'ADMIN',
      area: null,
    },
  })
  console.log('Created admin user:', admin.email)

  // Create sample team members
  const memberPassword = await bcrypt.hash('member123', 10)

  const members = [
    { name: 'Ana Silva', email: 'ana@sellercener.com', area: 'CRO' },
    { name: 'Bruno Costa', email: 'bruno@sellercener.com', area: 'SEO' },
    { name: 'Carla Mendes', email: 'carla@sellercener.com', area: 'UX_UI' },
  ]

  for (const member of members) {
    await prisma.user.upsert({
      where: { email: member.email },
      update: {},
      create: {
        ...member,
        password: memberPassword,
        role: 'MEMBER',
      },
    })
    console.log('Created member:', member.email)
  }

  // Create default statuses
  const statuses = [
    { name: 'Backlog', color: '#6B7280', order: 0, isDefault: true },
    { name: 'Em andamento', color: '#3B82F6', order: 1, isDefault: false },
    { name: 'Finalizado', color: '#10B981', order: 2, isDefault: false },
    { name: 'Cancelado', color: '#EF4444', order: 3, isDefault: false },
    { name: 'Bloqueado', color: '#F59E0B', order: 4, isDefault: false },
  ]

  for (const status of statuses) {
    await prisma.status.upsert({
      where: { name: status.name },
      update: {},
      create: status,
    })
    console.log('Created status:', status.name)
  }

  // Create sample brands
  const brands = ['Nike', 'Adidas', 'Puma']
  for (const brandName of brands) {
    await prisma.brand.upsert({
      where: { name: brandName },
      update: {},
      create: { name: brandName },
    })
    console.log('Created brand:', brandName)
  }

  // Create sample tasks
  const backlogStatus = await prisma.status.findFirst({ where: { name: 'Backlog' } })
  const emAndamentoStatus = await prisma.status.findFirst({ where: { name: 'Em andamento' } })
  const adminUser = await prisma.user.findFirst({ where: { email: 'admin@sellercener.com' } })
  const anaUser = await prisma.user.findFirst({ where: { email: 'ana@sellercener.com' } })
  const nikeBrand = await prisma.brand.findFirst({ where: { name: 'Nike' } })
  const adidasBrand = await prisma.brand.findFirst({ where: { name: 'Adidas' } })

  if (backlogStatus && emAndamentoStatus && adminUser && anaUser && nikeBrand && adidasBrand) {
    await prisma.task.createMany({
      data: [
        {
          title: 'Análise de conversão landing page',
          description: 'Analisar taxa de conversão da landing page de verão',
          area: 'CRO',
          priority: 'ALTA',
          hours: 4,
          brandId: nikeBrand.id,
          userId: anaUser.id,
          statusId: emAndamentoStatus.id,
        },
        {
          title: 'Otimização de palavras-chave',
          description: 'Pesquisa e implementação de novas palavras-chave',
          area: 'SEO',
          priority: 'MEDIA',
          hours: 8,
          brandId: adidasBrand.id,
          userId: adminUser.id,
          statusId: backlogStatus.id,
        },
      ],
    })
    console.log('Created sample tasks')
  }

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
