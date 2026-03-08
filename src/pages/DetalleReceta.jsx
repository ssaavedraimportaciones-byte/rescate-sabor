import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import FormularioReceta from '../components/FormularioReceta'

export default function DetalleReceta({ obtenerReceta, editarReceta, eliminarReceta, esFavorito, toggleFavorito }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [editando, setEditando] = useState(false)
  const [confirmarEliminar, setConfirmarEliminar] = useState(false)

  const receta = obtenerReceta(id)

  if (!receta) {
    return (
      <div className="pagina-detalle">
        <div className="no-encontrada">
          <span>🍽️</span>
          <h2>Receta no encontrada</h2>
          <Link to="/" className="boton-volver">Volver al inicio</Link>
        </div>
      </div>
    )
  }

  const manejarGuardar = (datos) => {
    editarReceta(receta.id, datos)
    setEditando(false)
  }

  const manejarEliminar = () => {
    eliminarReceta(receta.id)
    navigate('/')
  }

  if (editando) {
    return (
      <div className="pagina-detalle">
        <FormularioReceta
          recetaInicial={receta}
          onGuardar={manejarGuardar}
          onCancelar={() => setEditando(false)}
        />
      </div>
    )
  }

  return (
    <div className="pagina-detalle">
      <Link to="/" className="enlace-volver">← Volver</Link>

      <div className="detalle-cabecera">
        <span className="detalle-imagen">{receta.imagen}</span>
        <div className="detalle-titulo">
          <h1>{receta.nombre}</h1>
          <div className="detalle-meta">
            {receta.origen && <span className="detalle-tag">📍 {receta.origen}</span>}
            {receta.categoria && <span className="detalle-tag">🏷️ {receta.categoria}</span>}
            {receta.tiempoPreparacion > 0 && <span className="detalle-tag">⏱️ {receta.tiempoPreparacion} min</span>}
            {receta.porciones > 0 && <span className="detalle-tag">🍽️ {receta.porciones} porciones</span>}
          </div>
        </div>
        <button
          className={`boton-favorito-grande ${esFavorito(receta.id) ? 'favorito-activo' : ''}`}
          onClick={() => toggleFavorito(receta.id)}
        >
          {esFavorito(receta.id) ? '❤️' : '🤍'}
        </button>
      </div>

      <div className="detalle-contenido">
        <section className="detalle-seccion">
          <h2>Descripcion</h2>
          <p>{receta.descripcion}</p>
        </section>

        {receta.ingredientes && receta.ingredientes.length > 0 && (
          <section className="detalle-seccion">
            <h2>Ingredientes</h2>
            <ul className="lista-ingredientes">
              {receta.ingredientes.map((ing, i) => (
                <li key={i}>{ing}</li>
              ))}
            </ul>
          </section>
        )}

        {receta.instrucciones && (
          <section className="detalle-seccion">
            <h2>Preparacion</h2>
            <div className="instrucciones">
              {receta.instrucciones.split('\n').map((paso, i) => (
                <p key={i} className="paso">{paso}</p>
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="detalle-acciones">
        <button className="boton-editar" onClick={() => setEditando(true)}>
          ✏️ Editar
        </button>
        {!confirmarEliminar ? (
          <button className="boton-eliminar" onClick={() => setConfirmarEliminar(true)}>
            🗑️ Eliminar
          </button>
        ) : (
          <div className="confirmar-eliminar">
            <span>¿Seguro?</span>
            <button className="boton-confirmar-si" onClick={manejarEliminar}>Si, eliminar</button>
            <button className="boton-confirmar-no" onClick={() => setConfirmarEliminar(false)}>No</button>
          </div>
        )}
      </div>
    </div>
  )
}
