'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useCurrentUser, CurrentUser } from '@/lib/user-context'

interface Member {
  id: string
  name: string
  role: string
  area: string | null
}

export default function SidebarNav() {
  const pathname = usePathname()
  const { currentUser, setCurrentUser } = useCurrentUser()
  const [members, setMembers] = useState<Member[]>([])
  const [showPicker, setShowPicker] = useState(false)

  useEffect(() => {
    fetch('/api/users')
      .then(r => r.json())
      .then(data => setMembers(data.users || []))
      .catch(() => {})
  }, [])

  function selectUser(member: Member) {
    setCurrentUser({ id: member.id, name: member.name, role: member.role, area: member.area })
    setShowPicker(false)
  }

  const isAdmin = currentUser?.role === 'ADMIN'

  const navItems = [
    {
      href: '/',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      href: '/my-tasks',
      label: 'Minhas Tarefas',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
    {
      href: '/tasks/new',
      label: '+ Nova Tarefa',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
  ]

  const areaLabel: Record<string, string> = {
    CRO: 'CRO', WEB_ANALYTICS: 'Web Analytics', UX_UI: 'UX/UI',
    SEO: 'SEO', MIDIA: 'Mídia', CRM: 'CRM', CONTEUDO: 'Conteúdo',
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col z-10">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <span className="font-bold text-gray-900 text-lg">Sellercener</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className={isActive ? 'text-primary-600' : 'text-gray-400'}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}

        {isAdmin && (
          <div className="pt-4">
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Administração
            </p>
            <Link
              href="/admin"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname.startsWith('/admin') ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className={pathname.startsWith('/admin') ? 'text-primary-600' : 'text-gray-400'}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </span>
              Painel Admin
            </Link>
          </div>
        )}
      </nav>

      {/* User Selector */}
      <div className="px-4 py-4 border-t border-gray-100 relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-left"
        >
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-medium">
              {currentUser ? currentUser.name.charAt(0).toUpperCase() : '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {currentUser ? currentUser.name : 'Selecionar usuário'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {currentUser
                ? currentUser.role === 'ADMIN' ? 'Admin' : (currentUser.area ? areaLabel[currentUser.area] || currentUser.area : 'Membro')
                : 'Clique para selecionar'}
            </p>
          </div>
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
        </button>

        {showPicker && (
          <div className="absolute bottom-full left-4 right-4 mb-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
            <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100 bg-gray-50">
              Quem é você?
            </p>
            <div className="max-h-64 overflow-y-auto">
              {members.map((member) => (
                <button
                  key={member.id}
                  onClick={() => selectUser(member)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-primary-50 transition-colors text-left ${
                    currentUser?.id === member.id ? 'bg-primary-50' : ''
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-medium">{member.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{member.name}</p>
                    <p className="text-xs text-gray-500">
                      {member.role === 'ADMIN' ? 'Admin' : (member.area ? areaLabel[member.area] || member.area : 'Membro')}
                    </p>
                  </div>
                  {currentUser?.id === member.id && (
                    <svg className="w-4 h-4 text-primary-600 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
