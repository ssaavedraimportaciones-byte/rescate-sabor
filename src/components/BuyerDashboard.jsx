import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Header from './Header'
import BagCard from './BagCard'
import ReservationTicket from './ReservationTicket'

export default function BuyerDashboard({ user, profile }) {
  const [tab, setTab] = useState('browse')
  const [bags, setBags] = useState([])
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [reservedBagIds, setReservedBagIds] = useState(new Set())
  const [reservingId, setReservingId] = useState(null)
  const [toast, setToast] = useState(null)

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
    const { data } = await supabase
      .from('bags')
      .select('*, stores(name, address)')
      .eq('available', true)
      .gt('quantity', 0)
      .order('created_at', { ascending: false })
    setBags(data || [])
    setLoading(false)
  }

  async function loadReservations() {
    const { data } = await supabase
      .from('reservations')
      .select('*, bags(title, discount_price, stores(name))')
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false })
    setReservations(data || [])
    const ids = new Set(data?.filter(r => r.status !== 'cancelled').map(r => r.bag_id) || [])
    setReservedBagIds(ids)
  }

  async function handleReserve(bag) {
    setReservingId(bag.id)
    const { error } = await supabase
      .from('reservations')
      .insert({ bag_id: bag.id, buyer_id: user.id, store_id: bag.store_id })

    if (error) {
      showToast('No se pudo reservar. Intenta de nuevo.', 'error')
    } else {
      await supabase
        .from('bags')
        .update({ quantity: bag.quantity - 1, available: bag.quantity - 1 > 0 })
        .eq('id', bag.id)
      showToast('¡Reserva realizada con éxito!')
      loadReservations()
      loadBags()
    }
    setReservingId(null)
  }

  async function handleCancelReservation(reservation) {
    const { error } = await supabase
      .from('reservations')
      .update({ status: 'cancelled' })
      .eq('id', reservation.id)

    if (!error) {
      // Devolver stock a la bolsa
      const { data: bag } = await supabase
        .from('bags')
        .select('quantity')
        .eq('id', reservation.bag_id)
        .single()
      if (bag) {
        await supabase
          .from('bags')
          .update({ quantity: bag.quantity + 1, available: true })
          .eq('id', reservation.bag_id)
      }
      showToast('Reserva cancelada')
      loadReservations()
      loadBags()
    }
  }

  const pendingCount = reservations.filter(r => r.status === 'pending').length

  return (
    <div className="min-h-screen bg-gray-50">
      <Header profile={profile} title="Rescate Sabor" />

      {/* Toast */}
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
            🛍️ Bolsas disponibles
          </button>
          <button
            onClick={() => setTab('reservations')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === 'reservations' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500'
            }`}
          >
            🎫 Mis reservas
            {pendingCount > 0 && (
              <span className="ml-1 bg-orange-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {pendingCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        {tab === 'browse' ? (
          loading ? (
            <div className="text-center py-12 text-gray-400">Cargando bolsas...</div>
          ) : bags.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">🥡</div>
              <p className="text-gray-500 font-medium">No hay bolsas disponibles</p>
              <p className="text-gray-400 text-sm mt-1">Vuelve más tarde</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bags.map(bag => (
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
              <div className="text-5xl mb-3">🎫</div>
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
