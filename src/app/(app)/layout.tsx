import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import SidebarNav from './SidebarNav'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarNav session={session} />
      <main className="flex-1 ml-64">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
