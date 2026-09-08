import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import Header from './Header'
import BagCard from './BagCard'
import ReservationTicket from './ReservationTicket'
import { ShoppingBag, Ticket, Search, PackageOpen } from 'lucide-react'

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
      <div className="bg-gray-200 h-16 w-full" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-9 bg-gray-200 rounded-xl w-24" />
        </div>
      </div>
    </div>
  )
}

export default function BuyerDashboard({ user, profile }) {
  const [tab, setTab] = useState('browse')
  const [bags, setBags] = useState([])
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [reservedBagIds, setReservedBagIds] = useState(new Set())
  const [reservingId, setReservingId] = useState(null)
  const [toast, setToast] = useState(null)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    loadBags()
    loadReservations()

    const bagsChannel = supabase
      .channel('buyer-bags')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bags' }, loadBags)
      .subscribe()

    const resChannel = supabase
      .channel('buyer-reservations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, loadReservations)
      .subscribe()

    return () => {
      supabase.removeChannel(bagsChannel)
      supabase.removeChannel(resChannel)
    }
  }, [])

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function loadBags() {
    const { data, error } = await supabase
      .from('bags')
      .select('*, stores(name, address)')
      .eq('available', true)
      .gt('quantity', 0)
      .order('created_at', { ascending: false })
    if (error) showToast('Error cargando bolsas', 'error')
    setBags(data || [])
    setLoading(false)
  }

  async function loadReservations() {
    const { data, error } = await supabase
      .from('reservations')
      .select('*, bags(title, discount_price, stores(name))')
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false })
    if (error) return
    setReservations(data || [])
    const ids = new Set(data?.filter(r => r.status !== 'cancelled').map(r => r.bag_id) || [])
    setReservedBagIds(ids)
  }

  async function handleReserve(bag) {
    setReservingId(bag.id)
    const { error } = await supabase.rpc('reserve_bag', {
      p_bag_id: bag.id,
      p_store_id: bag.store_id,
    })
    if (error) {
      showToast(error.message === 'Sin stock disponible' ? 'Ya no hay stock disponible' : 'No se pudo reservar. Intenta de nuevo.', 'error')
    } else {
      showToast('¡Reserva realizada con éxito!')
      loadReservations()
      loadBags()
    }
    setReservingId(null)
  }

  async function handleCancelReservation(reservation) {
    const { error } = await supabase.rpc('cancel_reservation', {
      p_reservation_id: reservation.id,
    })
    if (error) {
      showToast('No se pudo cancelar', 'error')
      return
    }
    showToast('Reserva cancelada')
    loadReservations()
    loadBags()
  }

  const filteredBags = useMemo(() => {
    let result = bags
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(b =>
        b.title?.toLowerCase().includes(q) ||
        b.stores?.name?.toLowerCase().includes(q) ||
        b.description?.toLowerCase().includes(q)
      )
    }
    switch (sortBy) {
      case 'cheapest':
        return [...result].sort((a, b) => a.discount_price - b.discount_price)
      case 'most_discount':
        return [...result].sort((a, b) => {
          const discA = (a.original_price - a.discount_price) / a.original_price
          const discB = (b.original_price - b.discount_price) / b.original_price
          return discB - discA
        })
      default:
        return result
    }
  }, [bags, search, sortBy])

  const pendingCount = reservations.filter(r => r.status === 'pending').length

  return (
    <div className="min-h-screen bg-gray-50">
      <Header profile={profile} title="Rescate Sabor" />

      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-lg text-sm font-medium transition-all ${
          toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
        }`}>
          {toast.msg}
        </div>
      )}

      <div className="bg-white border-b border-gray-100">
        <div className="flex">
          <button
            onClick={() => setTab('browse')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === 'browse' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500'
            }`}
          >
            <ShoppingBag className="w-4 h-4 inline -mt-0.5 mr-1.5" strokeWidth={2} />Bolsas disponibles
          </button>
          <button
            onClick={() => setTab('reservations')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === 'reservations' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500'
            }`}
          >
            <Ticket className="w-4 h-4 inline -mt-0.5 mr-1.5" strokeWidth={2} />Mis reservas
            {pendingCount > 0 && (
              <span className="ml-1 bg-orange-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {pendingCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {tab === 'browse' && (
        <div className="bg-white border-b border-gray-100 px-4 py-3">
          <div className="max-w-2xl mx-auto space-y-2">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar bolsas o tiendas..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <div className="flex gap-2">
              {[
                { key: 'newest', label: 'Más nuevas' },
                { key: 'cheapest', label: 'Más baratas' },
                { key: 'most_discount', label: 'Mayor descuento' },
              ].map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setSortBy(opt.key)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                    sortBy === opt.key
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="p-4 max-w-2xl mx-auto">
        {tab === 'browse' ? (
          loading ? (
            <div className="space-y-4">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : filteredBags.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                {search
                  ? <Search className="w-7 h-7 text-gray-400" strokeWidth={1.8} />
                  : <PackageOpen className="w-7 h-7 text-gray-400" strokeWidth={1.8} />}
              </div>
              <p className="text-gray-500 font-medium">
                {search ? `Sin resultados para "${search}"` : 'No hay bolsas disponibles'}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {search ? 'Probá con otro término' : 'Vuelve más tarde'}
              </p>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="mt-3 text-orange-500 text-sm font-medium"
                >
                  Limpiar búsqueda
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {search && (
                <p className="text-xs text-gray-500">
                  {filteredBags.length} resultado{filteredBags.length !== 1 ? 's' : ''} para "{search}"
                </p>
              )}
              {filteredBags.map(bag => (
                <BagCard
                  key={bag.id}
                  bag={bag}
                  onReserve={handleReserve}
                  reserved={reservedBagIds.has(bag.id)}
                  loading={reservingId === bag.id}
                />
              ))}
            </div>
          )
        ) : (
          reservations.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Ticket className="w-7 h-7 text-gray-400" strokeWidth={1.8} />
              </div>
              <p className="text-gray-500 font-medium">Sin reservas todavía</p>
              <p className="text-gray-400 text-sm mt-1">¡Reserva tu primera bolsa!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reservations.map(r => (
                <ReservationTicket
                  key={r.id}
                  reservation={r}
                  onCancel={handleCancelReservation}
                />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}
