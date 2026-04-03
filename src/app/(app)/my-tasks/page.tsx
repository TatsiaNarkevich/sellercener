'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useCurrentUser } from '@/lib/user-context'

interface Task {
  id: string
  title: string
  area: string
  priority: string
  hours: number | null
  brand: { id: string; name: string }
  user: { id: string; name: string; area: string | null }
  status: { id: string; name: string; color: string }
  createdAt: string
}

const AREA_LABELS: Record<string, string> = {
  CRO: 'CRO',
  WEB_ANALYTICS: 'Web Analytics',
  UX_UI: 'UX/UI',
  SEO: 'SEO',
  MIDIA: 'Mídia',
  CRM: 'CRM',
  CONTEUDO: 'Conteúdo',
}

const AREA_COLORS: Record<string, string> = {
  CRO: 'bg-purple-100 text-purple-800',
  WEB_ANALYTICS: 'bg-blue-100 text-blue-800',
  UX_UI: 'bg-pink-100 text-pink-800',
  SEO: 'bg-green-100 text-green-800',
  MIDIA: 'bg-orange-100 text-orange-800',
  CRM: 'bg-cyan-100 text-cyan-800',
  CONTEUDO: 'bg-yellow-100 text-yellow-800',
}

const PRIORITY_LABELS: Record<string, string> = {
  BAIXA: 'Baixa',
  MEDIA: 'Média',
  ALTA: 'Alta',
  URGENTE: 'Urgente',
}

const PRIORITY_COLORS: Record<string, string> = {
  BAIXA: 'bg-gray-100 text-gray-700',
  MEDIA: 'bg-blue-100 text-blue-700',
  ALTA: 'bg-orange-100 text-orange-700',
  URGENTE: 'bg-red-100 text-red-700',
}

export default function MyTasksPage() {
  const { currentUser } = useCurrentUser()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = useCallback(() => {
    if (!currentUser) { setLoading(false); return }
    setLoading(true)
    const params = new URLSearchParams({ userId: currentUser.id })
    fetch(`/api/tasks?${params}`)
      .then(r => r.json())
      .then(data => {
        setTasks(data.tasks || [])
        setLoading(false)
      })
  }, [currentUser])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    fetchTasks()
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Minhas Tarefas</h1>
        <p className="text-gray-500 text-sm mt-1">Todas as tarefas atribuídas a você</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Tarefas ({tasks.length})</h2>
          <Link
            href="/tasks/new"
            className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            + Nova Tarefa
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400">Carregando...</div>
        ) : tasks.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <p className="font-medium">Nenhuma tarefa encontrada</p>
            <p className="text-sm mt-1">Você não tem tarefas atribuídas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-6 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Título</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Área</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Marca</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Prioridade</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Horas</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tasks.map((task, i) => (
                  <tr key={task.id} className={i % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50/50 hover:bg-gray-100/50'}>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 truncate max-w-[220px]">{task.title}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${AREA_COLORS[task.area] || 'bg-gray-100 text-gray-700'}`}>
                        {AREA_LABELS[task.area] || task.area}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-700">{task.brand.name}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[task.priority] || 'bg-gray-100 text-gray-700'}`}>
                        {PRIORITY_LABELS[task.priority] || task.priority}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: task.status.color }}
                      >
                        {task.status.name}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-700">{task.hours ?? '—'}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/tasks/${task.id}/edit`}
                          className="text-primary-600 hover:text-primary-800 p-1 rounded hover:bg-primary-50 transition"
                          title="Editar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition"
                          title="Excluir"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
