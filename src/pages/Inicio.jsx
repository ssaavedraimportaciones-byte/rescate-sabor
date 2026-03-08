import { useState, useMemo } from 'react'
import TarjetaReceta from '../components/TarjetaReceta'
import Filtros from '../components/Filtros'

export default function Inicio({ recetas, toggleFavorito, esFavorito }) {
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('Todas')
  const [pais, setPais] = useState('Todos')

  const recetasFiltradas = useMemo(() => {
    return recetas.filter((r) => {
      const coincideBusqueda =
        r.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        r.descripcion.toLowerCase().includes(busqueda.toLowerCase())
      const coincideCategoria = categoria === 'Todas' || r.categoria === categoria
      const coincidePais = pais === 'Todos' || r.origen === pais
      return coincideBusqueda && coincideCategoria && coincidePais
    })
  }, [recetas, busqueda, categoria, pais])

  return (
    <div className="pagina-inicio">
      <div className="hero">
        <h1>Rescatando los sabores tradicionales de Latinoamerica</h1>
        <p>Descubre, preserva y comparte recetas que cuentan la historia de nuestros pueblos</p>
      </div>

      <Filtros
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        categoria={categoria}
        setCategoria={setCategoria}
        pais={pais}
        setPais={setPais}
      />

      <div className="contador-resultados">
        {recetasFiltradas.length} {recetasFiltradas.length === 1 ? 'receta encontrada' : 'recetas encontradas'}
      </div>

      <div className="lista-recetas">
        {recetasFiltradas.length === 0 ? (
          <div className="sin-resultados">
            <span className="sin-resultados-emoji">🔍</span>
            <p>No se encontraron recetas con esos filtros.</p>
            <button className="boton-limpiar" onClick={() => { setBusqueda(''); setCategoria('Todas'); setPais('Todos') }}>
              Limpiar filtros
            </button>
          </div>
        ) : (
          recetasFiltradas.map((receta) => (
            <TarjetaReceta
              key={receta.id}
              receta={receta}
              esFavorito={esFavorito(receta.id)}
              onToggleFavorito={toggleFavorito}
            />
          ))
        )}
      </div>
    </div>
  )
}
