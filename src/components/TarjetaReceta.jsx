import { Link } from 'react-router-dom'

export default function TarjetaReceta({ receta, esFavorito, onToggleFavorito }) {
  return (
    <div className="tarjeta-receta">
      <Link to={`/receta/${receta.id}`} className="tarjeta-link">
        <span className="receta-imagen">{receta.imagen}</span>
        <div className="receta-info">
          <h3>{receta.nombre}</h3>
          <p className="receta-descripcion-corta">{receta.descripcion}</p>
          <div className="receta-meta">
            {receta.origen && <span className="receta-origen">📍 {receta.origen}</span>}
            {receta.categoria && <span className="receta-categoria">{receta.categoria}</span>}
            {receta.tiempoPreparacion > 0 && (
              <span className="receta-tiempo">⏱️ {receta.tiempoPreparacion} min</span>
            )}
          </div>
        </div>
      </Link>
      <button
        className={`boton-favorito ${esFavorito ? 'favorito-activo' : ''}`}
        onClick={(e) => {
          e.preventDefault()
          onToggleFavorito(receta.id)
        }}
        title={esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      >
        {esFavorito ? '❤️' : '🤍'}
      </button>
    </div>
  )
}
