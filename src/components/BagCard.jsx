import { HEADER_GRADIENT } from '../lib/brand'
import { Clock, MapPin, Check } from 'lucide-react'

function clp(amount) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount)
}

export default function BagCard({ bag, onReserve, reserved, loading }) {
  const savings = (bag.original_price || 0) - (bag.discount_price || 0)
  const savingsPercent = bag.original_price > 0 ? Math.round((savings / bag.original_price) * 100) : 0

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 text-white" style={{ background: HEADER_GRADIENT }}>
        <div className="flex justify-between items-start gap-2">
          <div>
            <h3 className="font-bold text-lg leading-tight">{bag.title}</h3>
            <p className="text-green-100 text-sm mt-0.5 font-medium">{bag.stores?.name}</p>
          </div>
          <span className="bg-white text-xs font-bold px-2.5 py-1 rounded-full ml-2 shrink-0 shadow-sm" style={{ color: '#f57c00' }}>
            -{savingsPercent}%
          </span>
        </div>
      </div>
      <div className="p-4">
        {bag.description && (
          <p className="text-gray-600 text-sm mb-3 leading-relaxed">{bag.description}</p>
        )}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">{clp(bag.discount_price)}</span>
            <span className="text-gray-400 line-through text-sm">{clp(bag.original_price)}</span>
          </div>
          <span className="text-green-700 bg-green-50 text-xs font-semibold px-2 py-1 rounded-lg">
            Ahorras {clp(savings)}
          </span>
        </div>
        {bag.pickup_start && bag.pickup_end && (
          <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-2">
            <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" strokeWidth={2} />
            <span>Retiro: <strong>{bag.pickup_start}</strong> – <strong>{bag.pickup_end}</strong></span>
          </div>
        )}
        {bag.stores?.address && (
          <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-3">
            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" strokeWidth={2} />
            <span>{bag.stores.address}</span>
          </div>
        )}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <span className="text-sm text-gray-500 font-medium">
            {bag.quantity} disponible{bag.quantity !== 1 ? 's' : ''}
          </span>
          {reserved ? (
            <span className="bg-green-100 text-green-700 text-sm font-semibold px-4 py-2 rounded-xl">
              <Check className="w-4 h-4 inline -mt-0.5 mr-1" strokeWidth={3} />Reservado
            </span>
          ) : (
            <button
              onClick={() => onReserve(bag)}
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors shadow-sm"
            >
              {loading ? 'Reservando...' : 'Reservar'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
