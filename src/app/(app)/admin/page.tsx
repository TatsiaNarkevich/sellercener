'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Brand {
  id: string
  name: string
  active: boolean
}

interface Status {
  id: string
  name: string
  color: string
  order: number
  isDefault: boolean
}

interface User {
  id: string
  name: string
  email: string
  role: string
  area: string | null
  active: boolean
  createdAt: string
}

const AREAS = [
  { value: 'CRO', label: 'CRO' },
  { value: 'WEB_ANALYTICS', label: 'Web Analytics' },
  { value: 'UX_UI', label: 'UX/UI' },
  { value: 'SEO', label: 'SEO' },
  { value: 'MIDIA', label: 'Mídia' },
  { value: 'CRM', label: 'CRM' },
  { value: 'CONTEUDO', label: 'Conteúdo' },
]

const AREA_LABELS: Record<string, string> = {
  CRO: 'CRO',
  WEB_ANALYTICS: 'Web Analytics',
  UX_UI: 'UX/UI',
  SEO: 'SEO',
  MIDIA: 'Mídia',
  CRM: 'CRM',
  CONTEUDO: 'Conteúdo',
}

const PRESET_COLORS = [
  '#6B7280', '#3B82F6', '#10B981', '#EF4444', '#F59E0B',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F97316',
]

export default function AdminPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'brands' | 'statuses' | 'members'>('brands')

  // Auth check
  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(data => {
      if (!data.user || data.user.role !== 'ADMIN') {
        router.push('/')
      }
    })
  }, [router])

  // --- Brands ---
  const [brands, setBrands] = useState<Brand[]>([])
  const [brandsLoading, setBrandsLoading] = useState(true)
  const [newBrandName, setNewBrandName] = useState('')
  const [addingBrand, setAddingBrand] = useState(false)
  const [brandError, setBrandError] = useState('')
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null)
  const [editingBrandName, setEditingBrandName] = useState('')

  function fetchBrands() {
    setBrandsLoading(true)
    fetch('/api/brands').then(r => r.json()).then(data => {
      setBrands(data.brands || [])
      setBrandsLoading(false)
    })
  }

  useEffect(() => { fetchBrands() }, [])

  async function handleAddBrand(e: React.FormEvent) {
    e.preventDefault()
    setBrandError('')
    setAddingBrand(true)
    const res = await fetch('/api/brands', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newBrandName }),
    })
    const data = await res.json()
    if (!res.ok) { setBrandError(data.error); setAddingBrand(false); return }
    setNewBrandName('')
    setAddingBrand(false)
    fetchBrands()
  }

  async function handleToggleBrand(id: string, active: boolean) {
    await fetch(`/api/brands/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !active }),
    })
    fetchBrands()
  }

  async function handleSaveBrandName(id: string) {
    await fetch(`/api/brands/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editingBrandName }),
    })
    setEditingBrandId(null)
    fetchBrands()
  }

  // --- Statuses ---
  const [statuses, setStatuses] = useState<Status[]>([])
  const [statusesLoading, setStatusesLoading] = useState(true)
  const [newStatusName, setNewStatusName] = useState('')
  const [newStatusColor, setNewStatusColor] = useState('#6B7280')
  const [addingStatus, setAddingStatus] = useState(false)
  const [statusError, setStatusError] = useState('')
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null)
  const [editingStatusName, setEditingStatusName] = useState('')
  const [editingStatusColor, setEditingStatusColor] = useState('')

  function fetchStatuses() {
    setStatusesLoading(true)
    fetch('/api/statuses').then(r => r.json()).then(data => {
      setStatuses(data.statuses || [])
      setStatusesLoading(false)
    })
  }

  useEffect(() => { fetchStatuses() }, [])

  async function handleAddStatus(e: React.FormEvent) {
    e.preventDefault()
    setStatusError('')
    setAddingStatus(true)
    const maxOrder = statuses.reduce((max, s) => Math.max(max, s.order), -1)
    const res = await fetch('/api/statuses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newStatusName, color: newStatusColor, order: maxOrder + 1 }),
    })
    const data = await res.json()
    if (!res.ok) { setStatusError(data.error); setAddingStatus(false); return }
    setNewStatusName('')
    setNewStatusColor('#6B7280')
    setAddingStatus(false)
    fetchStatuses()
  }

  async function handleSaveStatus(id: string) {
    await fetch(`/api/statuses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editingStatusName, color: editingStatusColor }),
    })
    setEditingStatusId(null)
    fetchStatuses()
  }

  async function handleMoveStatus(id: string, direction: 'up' | 'down') {
    const idx = statuses.findIndex(s => s.id === id)
    if (direction === 'up' && idx === 0) return
    if (direction === 'down' && idx === statuses.length - 1) return

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    const current = statuses[idx]
    const swap = statuses[swapIdx]

    await Promise.all([
      fetch(`/api/statuses/${current.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: swap.order }),
      }),
      fetch(`/api/statuses/${swap.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: current.order }),
      }),
    ])
    fetchStatuses()
  }

  // --- Members ---
  const [users, setUsers] = useState<User[]>([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [showAddMember, setShowAddMember] = useState(false)
  const [newMemberName, setNewMemberName] = useState('')
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [newMemberPassword, setNewMemberPassword] = useState('')
  const [newMemberArea, setNewMemberArea] = useState('')
  const [newMemberRole, setNewMemberRole] = useState('MEMBER')
  const [addingMember, setAddingMember] = useState(false)
  const [memberError, setMemberError] = useState('')

  function fetchUsers() {
    setUsersLoading(true)
    fetch('/api/users').then(r => r.json()).then(data => {
      setUsers(data.users || [])
      setUsersLoading(false)
    })
  }

  useEffect(() => { fetchUsers() }, [])

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault()
    setMemberError('')
    setAddingMember(true)
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newMemberName,
        email: newMemberEmail,
        password: newMemberPassword,
        area: newMemberArea || null,
        role: newMemberRole,
      }),
    })
    const data = await res.json()
    if (!res.ok) { setMemberError(data.error); setAddingMember(false); return }
    setNewMemberName('')
    setNewMemberEmail('')
    setNewMemberPassword('')
    setNewMemberArea('')
    setNewMemberRole('MEMBER')
    setShowAddMember(false)
    setAddingMember(false)
    fetchUsers()
  }

  async function handleToggleUser(id: string, active: boolean) {
    await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !active }),
    })
    fetchUsers()
  }

  async function handleToggleRole(id: string, role: string) {
    const newRole = role === 'ADMIN' ? 'MEMBER' : 'ADMIN'
    await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    })
    fetchUsers()
  }

  const tabs = [
    { id: 'brands', label: 'Marcas' },
    { id: 'statuses', label: 'Status' },
    { id: 'members', label: 'Membros' },
  ] as const

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Painel Admin</h1>
        <p className="text-gray-500 text-sm mt-1">Gerencie marcas, status e membros do time</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 text-sm font-medium transition border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Brands Tab */}
      {activeTab === 'brands' && (
        <div className="max-w-2xl">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Marcas</h2>
            </div>

            {/* Add brand form */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
              <form onSubmit={handleAddBrand} className="flex gap-3">
                <input
                  type="text"
                  value={newBrandName}
                  onChange={e => setNewBrandName(e.target.value)}
                  required
                  placeholder="Nome da marca"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="submit"
                  disabled={addingBrand}
                  className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-50"
                >
                  {addingBrand ? 'Adicionando...' : '+ Adicionar'}
                </button>
              </form>
              {brandError && <p className="text-red-600 text-sm mt-2">{brandError}</p>}
            </div>

            {brandsLoading ? (
              <div className="p-8 text-center text-gray-400">Carregando...</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {brands.map(brand => (
                  <div key={brand.id} className="px-6 py-4 flex items-center gap-4">
                    {editingBrandId === brand.id ? (
                      <>
                        <input
                          type="text"
                          value={editingBrandName}
                          onChange={e => setEditingBrandName(e.target.value)}
                          className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <button
                          onClick={() => handleSaveBrandName(brand.id)}
                          className="text-sm text-green-600 hover:text-green-800 font-medium"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => setEditingBrandId(null)}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <span className={`flex-1 font-medium ${!brand.active ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                          {brand.name}
                        </span>
                        <button
                          onClick={() => { setEditingBrandId(brand.id); setEditingBrandName(brand.name) }}
                          className="text-sm text-primary-600 hover:text-primary-800"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleToggleBrand(brand.id, brand.active)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${brand.active ? 'bg-primary-600' : 'bg-gray-200'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${brand.active ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </>
                    )}
                  </div>
                ))}
                {brands.length === 0 && (
                  <div className="p-8 text-center text-gray-400">Nenhuma marca cadastrada</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Statuses Tab */}
      {activeTab === 'statuses' && (
        <div className="max-w-2xl">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Status</h2>
            </div>

            {/* Add status form */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
              <form onSubmit={handleAddStatus} className="space-y-3">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newStatusName}
                    onChange={e => setNewStatusName(e.target.value)}
                    required
                    placeholder="Nome do status"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    type="submit"
                    disabled={addingStatus}
                    className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-50"
                  >
                    {addingStatus ? 'Adicionando...' : '+ Adicionar'}
                  </button>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2">Cor:</p>
                  <div className="flex gap-2 flex-wrap">
                    {PRESET_COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewStatusColor(color)}
                        className={`w-7 h-7 rounded-full border-2 transition ${newStatusColor === color ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                {statusError && <p className="text-red-600 text-sm">{statusError}</p>}
              </form>
            </div>

            {statusesLoading ? (
              <div className="p-8 text-center text-gray-400">Carregando...</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {statuses.map((status, idx) => (
                  <div key={status.id} className="px-6 py-4 flex items-center gap-4">
                    {editingStatusId === status.id ? (
                      <>
                        <input
                          type="text"
                          value={editingStatusName}
                          onChange={e => setEditingStatusName(e.target.value)}
                          className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <div className="flex gap-1.5">
                          {PRESET_COLORS.map(color => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setEditingStatusColor(color)}
                              className={`w-5 h-5 rounded-full border-2 transition ${editingStatusColor === color ? 'border-gray-900' : 'border-transparent'}`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <button
                          onClick={() => handleSaveStatus(status.id)}
                          className="text-sm text-green-600 hover:text-green-800 font-medium"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => setEditingStatusId(null)}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => handleMoveStatus(status.id, 'up')}
                            disabled={idx === 0}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-20"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleMoveStatus(status.id, 'down')}
                            disabled={idx === statuses.length - 1}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-20"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: status.color }}
                        />
                        <span className="flex-1 font-medium text-gray-900">{status.name}</span>
                        {status.isDefault && (
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Padrão</span>
                        )}
                        <button
                          onClick={() => { setEditingStatusId(status.id); setEditingStatusName(status.name); setEditingStatusColor(status.color) }}
                          className="text-sm text-primary-600 hover:text-primary-800"
                        >
                          Editar
                        </button>
                      </>
                    )}
                  </div>
                ))}
                {statuses.length === 0 && (
                  <div className="p-8 text-center text-gray-400">Nenhum status cadastrado</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Membros</h2>
              <button
                onClick={() => setShowAddMember(!showAddMember)}
                className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
              >
                + Novo Membro
              </button>
            </div>

            {/* Add member form */}
            {showAddMember && (
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                <form onSubmit={handleAddMember} className="space-y-4">
                  <h3 className="font-medium text-gray-900">Novo Membro</h3>
                  {memberError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {memberError}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Nome *</label>
                      <input
                        type="text"
                        value={newMemberName}
                        onChange={e => setNewMemberName(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
                      <input
                        type="email"
                        value={newMemberEmail}
                        onChange={e => setNewMemberEmail(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Senha inicial *</label>
                      <input
                        type="password"
                        value={newMemberPassword}
                        onChange={e => setNewMemberPassword(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Área</label>
                      <select
                        value={newMemberArea}
                        onChange={e => setNewMemberArea(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Sem área</option>
                        {AREAS.map(a => (
                          <option key={a.value} value={a.value}>{a.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Papel</label>
                      <select
                        value={newMemberRole}
                        onChange={e => setNewMemberRole(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="MEMBER">Membro</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={addingMember}
                      className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-50"
                    >
                      {addingMember ? 'Criando...' : 'Criar Membro'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddMember(false)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}

            {usersLoading ? (
              <div className="p-8 text-center text-gray-400">Carregando...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="px-6 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Nome</th>
                      <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Email</th>
                      <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Área</th>
                      <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Papel</th>
                      <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Ativo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((user, i) => (
                      <tr key={user.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                        <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                        <td className="px-4 py-4 text-gray-600">{user.email}</td>
                        <td className="px-4 py-4 text-gray-600">{user.area ? AREA_LABELS[user.area] || user.area : '—'}</td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => handleToggleRole(user.id, user.role)}
                            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer transition ${
                              user.role === 'ADMIN'
                                ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {user.role === 'ADMIN' ? 'Admin' : 'Membro'}
                          </button>
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => handleToggleUser(user.id, user.active)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${user.active ? 'bg-primary-600' : 'bg-gray-200'}`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${user.active ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && (
                  <div className="p-8 text-center text-gray-400">Nenhum membro cadastrado</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
