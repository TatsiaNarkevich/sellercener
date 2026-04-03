import { UserProvider } from '@/lib/user-context'
import SidebarNav from './SidebarNav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <div className="flex min-h-screen bg-gray-50">
        <SidebarNav />
        <main className="flex-1 ml-64">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </UserProvider>
  )
}
