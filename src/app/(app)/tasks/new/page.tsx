'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCurrentUser } from '@/lib/user-context'

interface Brand { id: string; name: string; active: boolean }
interface Status { id: string; name: string; color: string; order: number; isDefault: boolean }
interface User { id: string; name: string; email: string; area: string | null; active: boolean; role: string }

const AREAS = [
  { value: 'CRO', label: 'CRO' },
  { value: 'WEB_ANALYTICS', label: 'Web Analytics' },
  { value: 'UX_UI', label: 'UX/UI' },
  { value: 'SEO', label: 'SEO' },
  { value: 'MIDIA', label: 'Mídia' },
  { value: 'CRM', label: 'CRM' },
  { value: 'CONTEUDO', label: 'Conteúdo' },
]

const PRIORITIES = [
  { value: 'BAIXA', label: 'Baixa' },
  { value: 'MEDIA', label: 'Média' },
  { value: 'ALTA', label: 'Alta' },
  { value: 'URGENTE', label: 'Urgente' },
]

export default function NewTaskPage() {
  const router = useRouter()
  const { currentUser } = useCurrentUser()
  const [brands, setBrands] = useState<Brand[]>([])
  const [statuses, setStatuses] = useState<Status[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [area, setArea] = useState(currentUser?.area || '')
  const [priority, setPriority] = useState('MEDIA')
  const [hours, setHours] = useState('')
  const [observations, setObservations] = useState('')
  const [brandId, setBrandId] = useState('')
  const [userId, setUserId] = useState(currentUser?.id || '')
  const [statusId, setStatusId] = useState('')

  useEffect(() => {
    if (currentUser) {
      setUserId(currentUser.id)
      if (currentUser.area && !area) setArea(currentUser.area)
    }
  }, [currentUser])

  useEffect(() => {
    Promise.all([
      fetch('/api/brands').then(r => r.json()),
      fetch('/api/statuses').then(r => r.json()),
      fetch('/api/users').then(r => r.json()),
    ]).then(([b, s, u]) => {
      setBrands(b.brands || [])
      const sorted: Status[] = s.statuses || []
      setStatuses(sorted)
      const def = sorted.find((st: Status) => st.isDefault)
      if (def) setStatusId(def.id)
      setUsers(u.users || [])
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!currentUser) {
      setError('Selecione seu nome no menu lateral antes de criar uma tarefa')
      return
    }
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, description, area, priority,
          hours: hours ? parseFloat(hours) : null,
          observations, brandId,
          userId: isAdmin ? userId : currentUser.id,
          statusId,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao criar tarefa')
        setLoading(false)
        return
      }

      router.push('/')
      router.refresh()
    } catch {
      setError('Erro ao conectar com o servidor')
      setLoading(false)
    }
  }

  const isAdmin = currentUser?.role === 'ADMIN'

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Nova Tarefa</h1>
        <p className="text-gray-500 text-sm mt-1">Preencha os dados para criar uma nova tarefa</p>
      </div>

      {!currentUser && (
        <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm">
          Selecione seu nome no menu lateral para criar tarefas.
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Título da tarefa"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              placeholder="Descreva a tarefa..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Área <span className="text-red-500">*</span>
              </label>
              <select
                value={area}
                onChange={e => setArea(e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Selecione...</option>
                {AREAS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marca <span className="text-red-500">*</span>
              </label>
              <select
                value={brandId}
                onChange={e => setBrandId(e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Selecione...</option>
                {brands.filter(b => b.active).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusId}
                onChange={e => setStatusId(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Selecione...</option>
                {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Horas</label>
              <input
                type="number"
                value={hours}
                onChange={e => setHours(e.target.value)}
                step="0.5"
                min="0"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="0.0"
              />
            </div>

            {isAdmin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
                <select
                  value={userId}
                  onChange={e => setUserId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Selecione...</option>
                  {users.filter(u => u.active).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea
              value={observations}
              onChange={e => setObservations(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              placeholder="Observações adicionais..."
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || !currentUser}
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Criando...' : 'Criar Tarefa'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 px-6 rounded-lg transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
