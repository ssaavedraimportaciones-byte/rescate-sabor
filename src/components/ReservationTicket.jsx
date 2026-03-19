const STATUS_CONFIG = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800 border border-yellow-200', icon: '⏳' },
  confirmed: { label: 'Confirmado', color: 'bg-blue-100 text-blue-800 border border-blue-200', icon: '✅' },
  delivered: { label: 'Entregado', color: 'bg-green-100 text-green-800 border border-green-200', icon: '🎉' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700 border border-red-200', icon: '❌' },
}

function clp(amount) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount)
}

export default function ReservationTicket({ reservation, onCancel }) {
  const status = STATUS_CONFIG[reservation.status] || STATUS_CONFIG.pending
  const date = new Date(reservation.created_at).toLocaleDateString('es-CL', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" style={{ borderTop: '3px solid #f57c00' }}>
      <div className="p-4 border-b border-dashed border-gray-200">
        <div className="flex justify-between items-start gap-2">
          <div>
            <h3 className="font-bold text-gray-900 text-base">{reservation.bags?.title}</h3>
            <p className="text-gray-600 text-sm mt-0.5">{reservation.bags?.stores?.name}</p>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${status.color}`}>
            {status.icon} {status.label}
          </span>
        </div>
      </div>
      <div className="px-4 py-3 flex justify-between items-center">
        <div>
          <p className="text-xs text-gray-400 font-mono">#{reservation.id.slice(0, 8).toUpperCase()}</p>
          <p className="text-xs text-gray-500 mt-0.5">{date}</p>
        </div>
        {reservation.bags?.discount_price && (
          <div className="text-right">
            <span className="text-lg font-bold text-gray-900">{clp(reservation.bags.discount_price)}</span>
            <p className="text-xs text-gray-400">pagado</p>
          </div>
        )}
      </div>
      {reservation.status === 'pending' && onCancel && (
        <div className="px-4 pb-3">
          <button
            onClick={() => onCancel(reservation)}
            className="w-full text-sm text-red-500 hover:text-red-600 font-medium py-2 border border-red-100 hover:border-red-200 rounded-xl transition-colors"
          >
            Cancelar reserva
          </button>
        </div>
      )}
    </div>
  )
}
