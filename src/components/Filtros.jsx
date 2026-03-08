import { categorias, paises } from '../data/recetas'

export default function Filtros({ busqueda, setBusqueda, categoria, setCategoria, pais, setPais }) {
  return (
    <div className="filtros">
      <input
        type="text"
        placeholder="Buscar receta..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="campo-busqueda"
      />
      <div className="filtros-selectores">
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="filtro-select">
          {categorias.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={pais} onChange={(e) => setPais(e.target.value)} className="filtro-select">
          {paises.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
