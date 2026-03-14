export default function BagCard({ bag, onReserve, reserved }) {
  const savings = bag.original_price - bag.discount_price
  const savingsPercent = Math.round((savings / bag.original_price) * 100)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-orange-400 to-orange-500 p-4 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg leading-tight">{bag.title}</h3>
            <p className="text-orange-100 text-sm mt-0.5">{bag.stores?.name}</p>
          </div>
          <span className="bg-white text-orange-500 text-xs font-bold px-2 py-1 rounded-full ml-2 shrink-0">
            -{savingsPercent}%
          </span>
        </div>
      </div>
      <div className="p-4">
        {bag.description && (
          <p className="text-gray-600 text-sm mb-3">{bag.description}</p>
        )}
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-2xl font-bold text-gray-900">${bag.discount_price}</span>
            <span className="text-gray-400 line-through text-sm ml-2">${bag.original_price}</span>
          </div>
          <span className="text-green-600 text-sm font-medium">Ahorras ${savings.toFixed(2)}</span>
        </div>
        {bag.pickup_start && bag.pickup_end && (
          <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
            <span>🕒</span>
            <span>Retiro: {bag.pickup_start} - {bag.pickup_end}</span>
          </div>
        )}
        {bag.stores?.address && (
          <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
            <span>📍</span>
            <span>{bag.stores.address}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">
            {bag.quantity} disponible{bag.quantity !== 1 ? 's' : ''}
          </span>
          {reserved ? (
            <span className="bg-green-100 text-green-700 text-sm font-medium px-4 py-2 rounded-xl">
              ✅ Reservado
            </span>
          ) : (
            <button
              onClick={() => onReserve(bag)}
              className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
            >
              Reservar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
