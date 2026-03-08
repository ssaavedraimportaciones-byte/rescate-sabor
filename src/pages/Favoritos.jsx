import { Link } from 'react-router-dom'
import TarjetaReceta from '../components/TarjetaReceta'

export default function Favoritos({ recetas, favoritos, toggleFavorito, esFavorito }) {
  const recetasFavoritas = recetas.filter((r) => favoritos.includes(r.id))

  return (
    <div className="pagina-favoritos">
      <h1>Mis Recetas Favoritas</h1>

      {recetasFavoritas.length === 0 ? (
        <div className="sin-resultados">
          <span className="sin-resultados-emoji">❤️</span>
          <p>Aun no tienes recetas favoritas.</p>
          <p className="sin-resultados-sub">Explora las recetas y marca tus favoritas con el corazon.</p>
          <Link to="/" className="boton-explorar">Explorar recetas</Link>
        </div>
      ) : (
        <div className="lista-recetas">
          {recetasFavoritas.map((receta) => (
            <TarjetaReceta
              key={receta.id}
              receta={receta}
              esFavorito={esFavorito(receta.id)}
              onToggleFavorito={toggleFavorito}
            />
          ))}
        </div>
      )}
    </div>
  )
}
