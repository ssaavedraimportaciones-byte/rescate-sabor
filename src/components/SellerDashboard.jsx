import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import Header from './Header'

function clp(amount) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount)
}

const STATUS_CONFIG = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800 border border-yellow-200' },
  confirmed: { label: 'Confirmado', color: 'bg-blue-100 text-blue-800 border border-blue-200' },
  delivered: { label: 'Entregado', color: 'bg-green-100 text-green-800 border border-green-200' },
  cancelled: { label: 'Cancelado', color: 'bg-gray-100 text-gray-600 border border-gray-200' },
}

const EMPTY_BAG = { title: '', description: '', original_price: '', discount_price: '', quantity: 1, pickup_start: '', pickup_end: '' }

function BagForm({ value, onChange, onSubmit, onCancel, submitLabel, loading }) {
  const errors = {}
  if (value.original_price && value.discount_price && parseFloat(value.discount_price) >= parseFloat(value.original_price)) {
    errors.discount_price = 'El precio rescate debe ser menor al original'
  }
  if (value.discount_price && parseFloat(value.discount_price) <= 0) {
    errors.discount_price = 'El precio debe ser mayor a 0'
  }
  if (value.quantity && parseInt(value.quantity) < 1) {
    errors.quantity = 'La cantidad mínima es 1'
  }

  const isValid = value.title.trim() && value.original_price && value.discount_price && !Object.keys(errors).length

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={value.title}
        onChange={e => onChange({ ...value, title: e.target.value })}
        placeholder="Nombre de la bolsa *"
        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      />
      <textarea
        value={value.description}
        onChange={e => onChange({ ...value, description: e.target.value })}
        placeholder="Descripción (qué incluye)"
        rows={2}
        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
      />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Precio original *</label>
          <input
            type="number"
            value={value.original_price}
            onChange={e => onChange({ ...value, original_price: e.target.value })}
            placeholder="0"
            min="1"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Precio rescate *</label>
          <input
            type="number"
            value={value.discount_price}
            onChange={e => onChange({ ...value, discount_price: e.target.value })}
            placeholder="0"
            min="1"
            className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.discount_price ? 'border-red-400' : 'border-gray-200'}`}
          />
          {errors.discount_price && <p className="text-red-500 text-xs mt-1">{errors.discount_price}</p>}
        </div>
      </div>
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Cantidad disponible</label>
        <input
          type="number"
          value={value.quantity}
          onChange={e => onChange({ ...value, quantity: e.target.value })}
          min="1"
          className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.quantity ? 'border-red-400' : 'border-gray-200'}`}
        />
        {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Retiro desde</label>
          <input
            type="time"
            value={value.pickup_start}
            onChange={e => onChange({ ...value, pickup_start: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Retiro hasta</label>
          <input
            type="time"
            value={value.pickup_end}
            onChange={e => onChange({ ...value, pickup_end: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>
      <div className="flex gap-2">
        {onCancel && (
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold py-2 rounded-xl transition-colors text-sm"
          >
            Cancelar
          </button>
        )}
        <button
          onClick={onSubmit}
          disabled={!isValid || loading}
          className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-semibold py-2 rounded-xl transition-colors text-sm"
        >
          {loading ? 'Guardando...' : submitLabel}
        </button>
      </div>
    </div>
  )
}

export default function SellerDashboard({ user, profile }) {
  const [tab, setTab] = useState('reservations')
  const [store, setStore] = useState(null)
  const [bags, setBags] = useState([])
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showAddBag, setShowAddBag] = useState(false)
  const [showCreateStore, setShowCreateStore] = useState(false)
  const [showEditStore, setShowEditStore] = useState(false)
  const [editingBagId, setEditingBagId] = useState(null)
  const [editingBagData, setEditingBagData] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [storeName, setStoreName] = useState('')
  const [storeDesc, setStoreDesc] = useState('')
  const [storeAddr, setStoreAddr] = useState('')
  const [newBag, setNewBag] = useState(EMPTY_BAG)
  const [toast, setToast] = useState(null)
  const channelRef = useRef(null)

  useEffect(() => {
    loadStore()
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current)
    }
  }, [])

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

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
    setSubmitting(true)
    const { data, error } = await supabase
      .from('stores')
      .insert({ seller_id: user.id, name: storeName.trim(), description: storeDesc.trim() || null, address: storeAddr.trim() || null })
      .select()
      .single()
    setSubmitting(false)
    if (error) {
      showToast('Error al crear la tienda', 'error')
    } else if (data) {
      setStore(data)
      setShowCreateStore(false)
      subscribeToChanges(data.id)
      showToast('¡Tienda creada!')
    }
  }

  async function handleEditStore() {
    if (!storeName.trim()) return
    setSubmitting(true)
    const { data, error } = await supabase
      .from('stores')
      .update({ name: storeName.trim(), description: storeDesc.trim() || null, address: storeAddr.trim() || null })
      .eq('id', store.id)
      .select()
      .single()
    setSubmitting(false)
    if (error) {
      showToast('Error al guardar cambios', 'error')
    } else if (data) {
      setStore(data)
      setShowEditStore(false)
      showToast('Tienda actualizada')
    }
  }

  function openEditStore() {
    setStoreName(store.name || '')
    setStoreDesc(store.description || '')
    setStoreAddr(store.address || '')
    setShowEditStore(true)
  }

  async function handleAddBag() {
    setSubmitting(true)
    const { error } = await supabase.from('bags').insert({
      store_id: store.id,
      title: newBag.title.trim(),
      description: newBag.description.trim() || null,
      original_price: parseFloat(newBag.original_price),
      discount_price: parseFloat(newBag.discount_price),
      quantity: parseInt(newBag.quantity) || 1,
      pickup_start: newBag.pickup_start || null,
      pickup_end: newBag.pickup_end || null,
      available: true,
    })
    setSubmitting(false)
    if (error) {
      showToast('Error al publicar bolsa', 'error')
    } else {
      setNewBag(EMPTY_BAG)
      setShowAddBag(false)
      loadBags(store.id)
      showToast('Bolsa publicada')
    }
  }

  async function handleEditBag() {
    if (!editingBagData) return
    setSubmitting(true)
    const { error } = await supabase
      .from('bags')
      .update({
        title: editingBagData.title.trim(),
        description: editingBagData.description?.trim() || null,
        original_price: parseFloat(editingBagData.original_price),
        discount_price: parseFloat(editingBagData.discount_price),
        quantity: parseInt(editingBagData.quantity) || 1,
        pickup_start: editingBagData.pickup_start || null,
        pickup_end: editingBagData.pickup_end || null,
      })
      .eq('id', editingBagId)
    setSubmitting(false)
    if (error) {
      showToast('Error al guardar cambios', 'error')
    } else {
      setEditingBagId(null)
      setEditingBagData(null)
      loadBags(store.id)
      showToast('Bolsa actualizada')
    }
  }

  async function handleDeleteBag(bagId) {
    const { error } = await supabase.from('bags').delete().eq('id', bagId)
    setConfirmDeleteId(null)
    if (error) {
      showToast('No se puede eliminar (tiene reservas asociadas)', 'error')
    } else {
      loadBags(store.id)
      showToast('Bolsa eliminada')
    }
  }

  async function handleUpdateStatus(reservationId, status) {
    const { error } = await supabase.from('reservations').update({ status }).eq('id', reservationId)
    if (error) showToast('Error al actualizar estado', 'error')
    else loadReservations(store.id)
  }

  async function handleToggleBag(bag) {
    const { error } = await supabase.from('bags').update({ available: !bag.available }).eq('id', bag.id)
    if (error) showToast('Error al actualizar bolsa', 'error')
    else loadBags(store.id)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">Cargando...</div>
      </div>
    )
  }

  // ── Crear tienda ──
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
              disabled={!storeName.trim() || submitting}
              className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {submitting ? 'Creando...' : 'Crear tienda'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Stats ──
  const deliveredRevenue = reservations
    .filter(r => r.status === 'delivered')
    .reduce((sum, r) => sum + (r.bags?.discount_price || 0), 0)
  const pendingCount = reservations.filter(r => r.status === 'pending').length
  const confirmedCount = reservations.filter(r => r.status === 'confirmed').length
  const deliveredCount = reservations.filter(r => r.status === 'delivered').length

  return (
    <div className="min-h-screen bg-gray-50">
      <Header profile={profile} title={store?.name || 'Mi Tienda'} />

      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-lg text-sm font-medium transition-all ${
          toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Modal editar tienda */}
      {showEditStore && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Editar tienda</h2>
            <div className="space-y-3">
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
              <div className="flex gap-2">
                <button
                  onClick={() => setShowEditStore(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold py-3 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEditStore}
                  disabled={!storeName.trim() || submitting}
                  className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  {submitting ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmar eliminación */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm text-center">
            <div className="text-4xl mb-3">🗑️</div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">¿Eliminar bolsa?</h2>
            <p className="text-gray-500 text-sm mb-5">Esta acción no se puede deshacer.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold py-3 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteBag(confirmDeleteId)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border-b border-gray-100">
        <div className="flex">
          <button
            onClick={() => setTab('reservations')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === 'reservations' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500'
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
              tab === 'bags' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500'
            }`}
          >
            🥡 Mis bolsas
          </button>
          <button
            onClick={() => setTab('stats')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === 'stats' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500'
            }`}
          >
            📊 Stats
          </button>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto">

        {/* ── RESERVAS ── */}
        {tab === 'reservations' && (
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
                        <p className="text-gray-600 text-sm font-medium">
                          {reservation.profiles?.name || reservation.profiles?.email || 'Comprador'}
                        </p>
                        <p className="text-gray-500 text-xs mt-0.5">
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
        )}

        {/* ── MIS BOLSAS ── */}
        {tab === 'bags' && (
          <div>
            <button
              onClick={() => { setShowAddBag(!showAddBag); setNewBag(EMPTY_BAG) }}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors mb-4"
            >
              {showAddBag ? '✕ Cancelar' : '+ Agregar bolsa'}
            </button>

            {showAddBag && (
              <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
                <h3 className="font-bold text-gray-900 mb-3">Nueva bolsa</h3>
                <BagForm
                  value={newBag}
                  onChange={setNewBag}
                  onSubmit={handleAddBag}
                  submitLabel="Publicar bolsa"
                  loading={submitting}
                />
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
                  <div key={bag.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {editingBagId === bag.id ? (
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 mb-3">Editar bolsa</h3>
                        <BagForm
                          value={editingBagData}
                          onChange={setEditingBagData}
                          onSubmit={handleEditBag}
                          onCancel={() => { setEditingBagId(null); setEditingBagData(null) }}
                          submitLabel="Guardar cambios"
                          loading={submitting}
                        />
                      </div>
                    ) : (
                      <div className="p-4">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900">{bag.title}</h3>
                            <p className="text-gray-700 text-sm font-medium">
                              {clp(bag.discount_price)}
                              <span className="text-gray-400 line-through ml-2 text-xs">{clp(bag.original_price)}</span>
                              <span className="text-gray-500 ml-2">· {bag.quantity} disp.</span>
                            </p>
                            {bag.description && (
                              <p className="text-gray-500 text-sm mt-1 truncate">{bag.description}</p>
                            )}
                            {bag.pickup_start && bag.pickup_end && (
                              <p className="text-gray-400 text-xs mt-1">🕒 {bag.pickup_start} – {bag.pickup_end}</p>
                            )}
                          </div>
                          <button
                            onClick={() => handleToggleBag(bag)}
                            className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${
                              bag.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {bag.available ? '✓ Activa' : '✕ Inactiva'}
                          </button>
                        </div>
                        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                          <button
                            onClick={() => {
                              setEditingBagId(bag.id)
                              setEditingBagData({
                                title: bag.title,
                                description: bag.description || '',
                                original_price: bag.original_price,
                                discount_price: bag.discount_price,
                                quantity: bag.quantity,
                                pickup_start: bag.pickup_start || '',
                                pickup_end: bag.pickup_end || '',
                              })
                            }}
                            className="flex-1 text-sm text-blue-600 font-medium py-1.5 border border-blue-100 hover:border-blue-300 rounded-xl transition-colors"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(bag.id)}
                            className="flex-1 text-sm text-red-500 font-medium py-1.5 border border-red-100 hover:border-red-300 rounded-xl transition-colors"
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── STATS ── */}
        {tab === 'stats' && (
          <div className="space-y-4">
            {/* Store info card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">{store.name}</h2>
                  {store.address && <p className="text-gray-500 text-sm mt-0.5">📍 {store.address}</p>}
                  {store.description && <p className="text-gray-500 text-sm mt-1">{store.description}</p>}
                </div>
                <button
                  onClick={openEditStore}
                  className="text-sm text-blue-600 font-medium px-3 py-1.5 border border-blue-100 hover:border-blue-300 rounded-xl transition-colors shrink-0"
                >
                  ✏️ Editar
                </button>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                <p className="text-3xl font-black text-green-600">{clp(deliveredRevenue)}</p>
                <p className="text-xs text-gray-500 mt-1 font-medium">Ingresos totales</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                <p className="text-3xl font-black text-gray-900">{reservations.length}</p>
                <p className="text-xs text-gray-500 mt-1 font-medium">Reservas totales</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                <p className="text-3xl font-black text-yellow-500">{pendingCount}</p>
                <p className="text-xs text-gray-500 mt-1 font-medium">Pendientes</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                <p className="text-3xl font-black text-blue-500">{confirmedCount}</p>
                <p className="text-xs text-gray-500 mt-1 font-medium">Confirmadas</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                <p className="text-3xl font-black text-green-500">{deliveredCount}</p>
                <p className="text-xs text-gray-500 mt-1 font-medium">Entregadas</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                <p className="text-3xl font-black text-gray-400">{bags.filter(b => b.available).length}</p>
                <p className="text-xs text-gray-500 mt-1 font-medium">Bolsas activas</p>
              </div>
            </div>

            {/* Completion rate */}
            {reservations.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">Tasa de completado</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-green-500 h-3 rounded-full transition-all"
                      style={{ width: `${Math.round((deliveredCount / reservations.length) * 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-700 shrink-0">
                    {Math.round((deliveredCount / reservations.length) * 100)}%
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {deliveredCount} entregadas de {reservations.length} totales
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
