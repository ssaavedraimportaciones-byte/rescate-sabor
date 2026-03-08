import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useRecetas } from './hooks/useRecetas'
import Navbar from './components/Navbar'
import Inicio from './pages/Inicio'
import DetalleReceta from './pages/DetalleReceta'
import NuevaReceta from './pages/NuevaReceta'
import Favoritos from './pages/Favoritos'
import AcercaDe from './pages/AcercaDe'
import './App.css'

function App() {
  const {
    recetas,
    favoritos,
    agregarReceta,
    editarReceta,
    eliminarReceta,
    toggleFavorito,
    esFavorito,
    obtenerReceta,
  } = useRecetas()

  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <main className="contenido">
          <Routes>
            <Route
              path="/"
              element={
                <Inicio
                  recetas={recetas}
                  toggleFavorito={toggleFavorito}
                  esFavorito={esFavorito}
                />
              }
            />
            <Route
              path="/receta/:id"
              element={
                <DetalleReceta
                  obtenerReceta={obtenerReceta}
                  editarReceta={editarReceta}
                  eliminarReceta={eliminarReceta}
                  esFavorito={esFavorito}
                  toggleFavorito={toggleFavorito}
                />
              }
            />
            <Route
              path="/nueva"
              element={<NuevaReceta agregarReceta={agregarReceta} />}
            />
            <Route
              path="/favoritos"
              element={
                <Favoritos
                  recetas={recetas}
                  favoritos={favoritos}
                  toggleFavorito={toggleFavorito}
                  esFavorito={esFavorito}
                />
              }
            />
            <Route path="/acerca" element={<AcercaDe />} />
          </Routes>
        </main>
        <footer className="pie">
          <p>Rescate Sabor &copy; 2026 — Preservando nuestra herencia culinaria</p>
        </footer>
      </div>
    </BrowserRouter>
  )
}

export default App
