const STATUS_CONFIG = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700', icon: '⏳' },
  confirmed: { label: 'Confirmado', color: 'bg-blue-100 text-blue-700', icon: '✅' },
  delivered: { label: 'Entregado', color: 'bg-green-100 text-green-700', icon: '🎉' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700', icon: '❌' },
}

export default function ReservationTicket({ reservation }) {
  const status = STATUS_CONFIG[reservation.status] || STATUS_CONFIG.pending
  const date = new Date(reservation.created_at).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-dashed border-gray-200">
        <div className="flex justify-between items-start gap-2">
          <div>
            <h3 className="font-bold text-gray-900">{reservation.bags?.title}</h3>
            <p className="text-gray-500 text-sm">{reservation.bags?.stores?.name}</p>
          </div>
          <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${status.color}`}>
            {status.icon} {status.label}
          </span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between text-sm text-gray-400">
          <span>#{reservation.id.slice(0, 8).toUpperCase()}</span>
          <span>{date}</span>
        </div>
        {reservation.bags?.discount_price && (
          <div className="mt-1 text-sm">
            <span className="font-semibold text-gray-900">${reservation.bags.discount_price}</span>
            <span className="text-gray-400 ml-1">pagado</span>
          </div>
        )}
      </div>
    </div>
  )
}
