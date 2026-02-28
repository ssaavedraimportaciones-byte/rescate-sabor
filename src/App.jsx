import { useState } from 'react'
import './App.css'

const recetasIniciales = [
  {
    id: 1,
    nombre: 'Empanadas de Pino',
    descripcion: 'Receta tradicional chilena con carne, cebolla, huevo y aceituna.',
    origen: 'Chile',
    imagen: '🥟',
  },
  {
    id: 2,
    nombre: 'Mole Poblano',
    descripcion: 'Salsa compleja con chiles, chocolate y especias, herencia prehispánica.',
    origen: 'México',
    imagen: '🫕',
  },
  {
    id: 3,
    nombre: 'Locro de Papa',
    descripcion: 'Sopa espesa de papa con queso, aguacate y maní.',
    origen: 'Ecuador',
    imagen: '🍲',
  },
]

function App() {
  const [recetas, setRecetas] = useState(recetasIniciales)
  const [busqueda, setBusqueda] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [nuevaReceta, setNuevaReceta] = useState({
    nombre: '',
    descripcion: '',
    origen: '',
  })

  const recetasFiltradas = recetas.filter(
    (r) =>
      r.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.origen.toLowerCase().includes(busqueda.toLowerCase())
  )

  const agregarReceta = (e) => {
    e.preventDefault()
    if (!nuevaReceta.nombre || !nuevaReceta.descripcion) return
    setRecetas([
      ...recetas,
      {
        id: Date.now(),
        ...nuevaReceta,
        imagen: '📖',
      },
    ])
    setNuevaReceta({ nombre: '', descripcion: '', origen: '' })
    setMostrarFormulario(false)
  }

  return (
    <div className="app">
      <header className="cabecera">
        <h1>🍽️ Rescate Sabor</h1>
        <p>Rescatando los sabores tradicionales de Latinoamérica</p>
      </header>

      <main className="contenido">
        <div className="barra-acciones">
          <input
            type="text"
            placeholder="Buscar receta o país..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="campo-busqueda"
          />
          <button
            className="boton-agregar"
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
          >
            {mostrarFormulario ? 'Cancelar' : '+ Agregar Receta'}
          </button>
        </div>

        {mostrarFormulario && (
          <form className="formulario" onSubmit={agregarReceta}>
            <h2>Nueva Receta</h2>
            <input
              type="text"
              placeholder="Nombre de la receta"
              value={nuevaReceta.nombre}
              onChange={(e) =>
                setNuevaReceta({ ...nuevaReceta, nombre: e.target.value })
              }
              required
            />
            <textarea
              placeholder="Descripción"
              value={nuevaReceta.descripcion}
              onChange={(e) =>
                setNuevaReceta({ ...nuevaReceta, descripcion: e.target.value })
              }
              required
            />
            <input
              type="text"
              placeholder="País de origen"
              value={nuevaReceta.origen}
              onChange={(e) =>
                setNuevaReceta({ ...nuevaReceta, origen: e.target.value })
              }
            />
            <button type="submit" className="boton-guardar">
              Guardar Receta
            </button>
          </form>
        )}

        <div className="lista-recetas">
          {recetasFiltradas.length === 0 ? (
            <p className="sin-resultados">No se encontraron recetas.</p>
          ) : (
            recetasFiltradas.map((receta) => (
              <div key={receta.id} className="tarjeta-receta">
                <span className="receta-imagen">{receta.imagen}</span>
                <div className="receta-info">
                  <h3>{receta.nombre}</h3>
                  <p>{receta.descripcion}</p>
                  {receta.origen && (
                    <span className="receta-origen">📍 {receta.origen}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <footer className="pie">
        <p>Rescate Sabor &copy; 2026 — Preservando nuestra herencia culinaria</p>
      </footer>
    </div>
  )
}

export default App
