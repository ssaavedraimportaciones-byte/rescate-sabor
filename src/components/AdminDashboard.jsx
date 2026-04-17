import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Header from './Header'

function clp(n) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)
}

const STATUS = {
  pending: { label: 'Pendiente', cls: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Confirmado', cls: 'bg-blue-100 text-blue-800' },
  delivered: { label: 'Entregado', cls: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelado', cls: 'bg-gray-100 text-gray-600' },
}

const ROLE = {
  buyer: { label: 'Comprador', cls: 'bg-blue-100 text-blue-700' },
  seller: { label: 'Vendedor', cls: 'bg-green-100 text-green-700' },
  admin: { label: 'Admin', cls: 'bg-purple-100 text-purple-700' },
}

const TABS = ['Resumen', 'Usuarios', 'Tiendas', 'Reservas']

export default function AdminDashboard({ user, profile }) {
  const [tab, setTab] = useState('Resumen')
  const [stats, setStats] = useState({ users: 0, stores: 0, bags: 0, reservations: 0 })
  const [users, setUsers] = useState([])
  const [stores, setStores] = useState([])
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    const [
      { data: usersData },
      { data: storesData },
      { data: bagsData },
      { data: resData },
    ] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('stores').select('*, profiles(name, email)').order('created_at', { ascending: false }),
      supabase.from('bags').select('id'),
      supabase.from('reservations').select('*, profiles(name, email), stores(name), bags(title, discount_price)').order('created_at', { ascending: false }),
    ])
    setUsers(usersData || [])
    setStores(storesData || [])
    setReservations(resData || [])
    setStats({
      users: usersData?.length || 0,
      stores: storesData?.length || 0,
      bags: bagsData?.length || 0,
      reservations: resData?.length || 0,
    })
    setLoading(false)
  }

  async function changeRole(userId, newRole) {
    await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
  }

  const filteredUsers = users.filter(u =>
    (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  )

  const filteredStores = stores.filter(s =>
    (s.name || '').toLowerCase().includes(search.toLowerCase())
  )

  const filteredRes = reservations.filter(r =>
    (r.profiles?.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.stores?.name || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} profile={profile} />

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-gray-900">Panel Administrador</h1>
          <p className="text-sm text-gray-500 mt-1">Gestión completa de Rescate Sabor</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-gray-200 rounded-2xl p-1 mb-6 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setSearch('') }}
              className={`flex-1 min-w-[80px] py-2 px-3 rounded-xl text-sm font-semibold transition-all ${
                tab === t ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* RESUMEN */}
            {tab === 'Resumen' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Usuarios', value: stats.users, icon: '👥', color: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
                    { label: 'Tiendas', value: stats.stores, icon: '🏪', color: 'bg-green-50 border-green-200', text: 'text-green-700' },
                    { label: 'Bolsas', value: stats.bags, icon: '🥡', color: 'bg-orange-50 border-orange-200', text: 'text-orange-700' },
                    { label: 'Reservas', value: stats.reservations, icon: '📋', color: 'bg-purple-50 border-purple-200', text: 'text-purple-700' },
                  ].map(({ label, value, icon, color, text }) => (
                    <div key={label} className={`${color} border rounded-2xl p-5`}>
                      <div className="text-2xl mb-2">{icon}</div>
                      <div className={`text-3xl font-black ${text}`}>{value}</div>
                      <div className="text-sm text-gray-500 mt-1">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Reservas recientes */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                  <h2 className="font-bold text-gray-800 mb-4">Reservas recientes</h2>
                  {reservations.slice(0, 8).map(r => (
                    <div key={r.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{r.profiles?.name || r.profiles?.email || '—'}</p>
                        <p className="text-xs text-gray-500">{r.stores?.name} · {r.bags?.title}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-700">{r.bags?.discount_price ? clp(r.bags.discount_price) : ''}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS[r.status]?.cls}`}>
                          {STATUS[r.status]?.label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* USUARIOS */}
            {tab === 'Usuarios' && (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar por nombre o email..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="divide-y divide-gray-100">
                  {filteredUsers.map(u => (
                    <div key={u.id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{u.name || <span className="text-gray-400 italic">Sin nombre</span>}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                        <p className="text-xs text-gray-400">{new Date(u.created_at).toLocaleDateString('es-CL')}</p>
                      </div>
                      <select
                        value={u.role || ''}
                        onChange={e => changeRole(u.id, e.target.value)}
                        className={`text-xs font-medium px-2 py-1 rounded-lg border-0 cursor-pointer ${ROLE[u.role]?.cls || 'bg-gray-100 text-gray-600'}`}
                      >
                        <option value="buyer">Comprador</option>
                        <option value="seller">Vendedor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  ))}
                  {filteredUsers.length === 0 && (
                    <p className="text-center text-gray-400 text-sm py-8">Sin resultados</p>
                  )}
                </div>
              </div>
            )}

            {/* TIENDAS */}
            {tab === 'Tiendas' && (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar tienda..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="divide-y divide-gray-100">
                  {filteredStores.map(s => (
                    <div key={s.id} className="px-4 py-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-800">🏪 {s.name}</p>
                        <p className="text-xs text-gray-400">{new Date(s.created_at).toLocaleDateString('es-CL')}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{s.description || '—'}</p>
                      <p className="text-xs text-gray-400 mt-0.5">📍 {s.address || 'Sin dirección'} · Vendedor: {s.profiles?.name || s.profiles?.email || '—'}</p>
                    </div>
                  ))}
                  {filteredStores.length === 0 && (
                    <p className="text-center text-gray-400 text-sm py-8">Sin tiendas registradas</p>
                  )}
                </div>
              </div>
            )}

            {/* RESERVAS */}
            {tab === 'Reservas' && (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar por cliente o tienda..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="divide-y divide-gray-100">
                  {filteredRes.map(r => (
                    <div key={r.id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{r.profiles?.name || r.profiles?.email || '—'}</p>
                        <p className="text-xs text-gray-500">{r.stores?.name} · {r.bags?.title}</p>
                        <p className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString('es-CL', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-700">{r.bags?.discount_price ? clp(r.bags.discount_price) : ''}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS[r.status]?.cls}`}>
                          {STATUS[r.status]?.label}
                        </span>
                      </div>
                    </div>
                  ))}
                  {filteredRes.length === 0 && (
                    <p className="text-center text-gray-400 text-sm py-8">Sin reservas</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        <button
          onClick={loadAll}
          className="mt-6 w-full py-3 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-100 transition-all"
        >
          Actualizar datos
        </button>
      </div>
    </div>
  )
}
