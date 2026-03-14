import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import Header from './Header'

const STATUS_CONFIG = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Confirmado', color: 'bg-blue-100 text-blue-700' },
  delivered: { label: 'Entregado', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelado', color: 'bg-gray-100 text-gray-500' },
}

const EMPTY_BAG = { title: '', description: '', original_price: '', discount_price: '', quantity: 1, pickup_start: '', pickup_end: '' }

export default function SellerDashboard({ user, profile }) {
  const [tab, setTab] = useState('reservations')
  const [store, setStore] = useState(null)
  const [bags, setBags] = useState([])
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddBag, setShowAddBag] = useState(false)
  const [showCreateStore, setShowCreateStore] = useState(false)
  const [storeName, setStoreName] = useState('')
  const [storeDesc, setStoreDesc] = useState('')
  const [storeAddr, setStoreAddr] = useState('')
  const [newBag, setNewBag] = useState(EMPTY_BAG)
  const channelRef = useRef(null)

  useEffect(() => {
    loadStore()
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current)
    }
  }, [])

  async function loadStore() {
    const { data } = await supabase
      .from('stores')
      .select('*')
      .eq('seller_id', user.id)
      .single()

    if (data) {
      setStore(data)
      loadBags(data.id)
      loadReservations(data.id)
      subscribeToChanges(data.id)
    } else {
      setShowCreateStore(true)
    }
    setLoading(false)
  }

  function subscribeToChanges(storeId) {
    if (channelRef.current) supabase.removeChannel(channelRef.current)
    channelRef.current = supabase
      .channel('seller-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations', filter: `store_id=eq.${storeId}` }, () => loadReservations(storeId))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bags', filter: `store_id=eq.${storeId}` }, () => loadBags(storeId))
      .subscribe()
  }

  async function loadBags(storeId) {
    const { data } = await supabase
      .from('bags')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })
    setBags(data || [])
  }

  async function loadReservations(storeId) {
    const { data } = await supabase
      .from('reservations')
      .select('*, bags(title, discount_price), profiles(name, email)')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })
    setReservations(data || [])
  }

  async function handleCreateStore() {
    if (!storeName.trim()) return
    const { data } = await supabase
      .from('stores')
      .insert({ seller_id: user.id, name: storeName, description: storeDesc, address: storeAddr })
      .select()
      .single()
    if (data) {
      setStore(data)
      setShowCreateStore(false)
      subscribeToChanges(data.id)
    }
  }

  async function handleAddBag() {
    if (!newBag.title || !newBag.original_price || !newBag.discount_price) return
    await supabase.from('bags').insert({
      store_id: store.id,
      title: newBag.title,
      description: newBag.description || null,
      original_price: parseFloat(newBag.original_price),
      discount_price: parseFloat(newBag.discount_price),
      quantity: parseInt(newBag.quantity) || 1,
      pickup_start: newBag.pickup_start || null,
      pickup_end: newBag.pickup_end || null,
      available: true,
    })
    setNewBag(EMPTY_BAG)
    setShowAddBag(false)
    loadBags(store.id)
  }

  async function handleUpdateStatus(reservationId, status) {
    await supabase.from('reservations').update({ status }).eq('id', reservationId)
    loadReservations(store.id)
  }

  async function handleToggleBag(bag) {
    await supabase.from('bags').update({ available: !bag.available }).eq('id', bag.id)
    loadBags(store.id)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">Cargando...</div>
      </div>
    )
  }

  if (showCreateStore) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🏪</div>
            <h2 className="text-2xl font-bold text-gray-900">Crea tu tienda</h2>
            <p className="text-gray-500 mt-1">Configura tu perfil de vendedor</p>
          </div>
          <div className="space-y-4">
            <input
              type="text"
              value={storeName}
              onChange={e => setStoreName(e.target.value)}
              placeholder="Nombre de tu tienda *"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="text"
              value={storeAddr}
              onChange={e => setStoreAddr(e.target.value)}
              placeholder="Dirección (opcional)"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <textarea
              value={storeDesc}
              onChange={e => setStoreDesc(e.target.value)}
              placeholder="Descripción (opcional)"
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
            <button
              onClick={handleCreateStore}
              disabled={!storeName.trim()}
              className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Crear tienda
            </button>
          </div>
        </div>
      </div>
    )
  }

  const pendingCount = reservations.filter(r => r.status === 'pending').length

  return (
    <div className="min-h-screen bg-gray-50">
      <Header profile={profile} title={store?.name || 'Mi Tienda'} />

      <div className="bg-white border-b border-gray-100">
        <div className="flex">
          <button
            onClick={() => setTab('reservations')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === 'reservations'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500'
            }`}
          >
            📋 Reservas
            {pendingCount > 0 && (
              <span className="ml-1 bg-green-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab('bags')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === 'bags'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500'
            }`}
          >
            🥡 Mis bolsas
          </button>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        {tab === 'reservations' ? (
          reservations.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">📋</div>
              <p className="text-gray-500 font-medium">Sin reservas todavía</p>
              <p className="text-gray-400 text-sm mt-1">Aparecerán aquí en tiempo real</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reservations.map(reservation => (
                <div key={reservation.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="font-bold text-gray-900">{reservation.bags?.title}</h3>
                        <p className="text-gray-500 text-sm">
                          {reservation.profiles?.name || reservation.profiles?.email || 'Comprador'}
                        </p>
                        <p className="text-gray-400 text-xs mt-0.5">
                          {new Date(reservation.created_at).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${STATUS_CONFIG[reservation.status]?.color}`}>
                        {STATUS_CONFIG[reservation.status]?.label}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 flex gap-2">
                    {reservation.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(reservation.id, 'confirmed')}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 rounded-xl transition-colors"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(reservation.id, 'cancelled')}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm py-2 rounded-xl transition-colors"
                        >
                          Cancelar
                        </button>
                      </>
                    )}
                    {reservation.status === 'confirmed' && (
                      <button
                        onClick={() => handleUpdateStatus(reservation.id, 'delivered')}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm py-2 rounded-xl transition-colors"
                      >
                        ✅ Marcar como entregado
                      </button>
                    )}
                    {(reservation.status === 'delivered' || reservation.status === 'cancelled') && (
                      <span className="text-gray-400 text-sm py-2 text-center flex-1">
                        {reservation.status === 'delivered' ? '✅ Completado' : '❌ Cancelado'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div>
            <button
              onClick={() => setShowAddBag(!showAddBag)}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors mb-4"
            >
              {showAddBag ? '✕ Cancelar' : '+ Agregar bolsa'}
            </button>

            {showAddBag && (
              <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 space-y-3">
                <h3 className="font-bold text-gray-900">Nueva bolsa</h3>
                <input
                  type="text"
                  value={newBag.title}
                  onChange={e => setNewBag({ ...newBag, title: e.target.value })}
                  placeholder="Nombre de la bolsa *"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <textarea
                  value={newBag.description}
                  onChange={e => setNewBag({ ...newBag, description: e.target.value })}
                  placeholder="Descripción (qué incluye)"
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Precio original *</label>
                    <input
                      type="number"
                      value={newBag.original_price}
                      onChange={e => setNewBag({ ...newBag, original_price: e.target.value })}
                      placeholder="0.00"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Precio rescate *</label>
                    <input
                      type="number"
                      value={newBag.discount_price}
                      onChange={e => setNewBag({ ...newBag, discount_price: e.target.value })}
                      placeholder="0.00"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Cantidad disponible</label>
                  <input
                    type="number"
                    value={newBag.quantity}
                    onChange={e => setNewBag({ ...newBag, quantity: e.target.value })}
                    min="1"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Retiro desde</label>
                    <input
                      type="time"
                      value={newBag.pickup_start}
                      onChange={e => setNewBag({ ...newBag, pickup_start: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Retiro hasta</label>
                    <input
                      type="time"
                      value={newBag.pickup_end}
                      onChange={e => setNewBag({ ...newBag, pickup_end: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAddBag}
                  disabled={!newBag.title || !newBag.original_price || !newBag.discount_price}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-semibold py-2 rounded-xl transition-colors text-sm"
                >
                  Publicar bolsa
                </button>
              </div>
            )}

            {bags.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">🥡</div>
                <p className="text-gray-500 font-medium">Sin bolsas publicadas</p>
                <p className="text-gray-400 text-sm mt-1">Agrega tu primera bolsa arriba</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bags.map(bag => (
                  <div key={bag.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="font-bold text-gray-900">{bag.title}</h3>
                        <p className="text-gray-500 text-sm">
                          ${bag.discount_price} · {bag.quantity} disponible{bag.quantity !== 1 ? 's' : ''}
                        </p>
                        {bag.description && (
                          <p className="text-gray-400 text-sm mt-1">{bag.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleToggleBag(bag)}
                        className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${
                          bag.available
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {bag.available ? '✓ Activa' : '✕ Inactiva'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
