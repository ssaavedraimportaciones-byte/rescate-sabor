import { useState, useEffect } from 'react'
import { categorias, paises } from '../data/recetas'

const emojis = ['📖', '🥟', '🫕', '🍲', '🐟', '🫓', '🥩', '🍛', '🍚', '🍰', '🥘', '🍪', '🌮', '🥗', '🍝', '🧁', '🥧', '🍜']

const recetaVacia = {
  nombre: '',
  descripcion: '',
  origen: '',
  categoria: '',
  imagen: '📖',
  ingredientes: [''],
  instrucciones: '',
  tiempoPreparacion: '',
  porciones: '',
}

export default function FormularioReceta({ recetaInicial, onGuardar, onCancelar }) {
  const [receta, setReceta] = useState(recetaVacia)

  useEffect(() => {
    if (recetaInicial) {
      setReceta({
        ...recetaInicial,
        ingredientes: recetaInicial.ingredientes?.length > 0 ? recetaInicial.ingredientes : [''],
        tiempoPreparacion: recetaInicial.tiempoPreparacion || '',
        porciones: recetaInicial.porciones || '',
      })
    }
  }, [recetaInicial])

  const actualizar = (campo, valor) => {
    setReceta((prev) => ({ ...prev, [campo]: valor }))
  }

  const actualizarIngrediente = (index, valor) => {
    const nuevos = [...receta.ingredientes]
    nuevos[index] = valor
    setReceta((prev) => ({ ...prev, ingredientes: nuevos }))
  }

  const agregarIngrediente = () => {
    setReceta((prev) => ({ ...prev, ingredientes: [...prev.ingredientes, ''] }))
  }

  const quitarIngrediente = (index) => {
    if (receta.ingredientes.length <= 1) return
    setReceta((prev) => ({
      ...prev,
      ingredientes: prev.ingredientes.filter((_, i) => i !== index),
    }))
  }

  const manejarEnvio = (e) => {
    e.preventDefault()
    if (!receta.nombre.trim() || !receta.descripcion.trim()) return
    onGuardar({
      ...receta,
      ingredientes: receta.ingredientes.filter((i) => i.trim()),
      tiempoPreparacion: Number(receta.tiempoPreparacion) || 0,
      porciones: Number(receta.porciones) || 0,
    })
  }

  return (
    <form className="formulario" onSubmit={manejarEnvio}>
      <h2>{recetaInicial ? 'Editar Receta' : 'Nueva Receta'}</h2>

      <div className="campo-grupo">
        <label>Nombre *</label>
        <input
          type="text"
          placeholder="Nombre de la receta"
          value={receta.nombre}
          onChange={(e) => actualizar('nombre', e.target.value)}
          required
        />
      </div>

      <div className="campo-grupo">
        <label>Descripcion *</label>
        <textarea
          placeholder="Describe la receta, su historia y tradicion..."
          value={receta.descripcion}
          onChange={(e) => actualizar('descripcion', e.target.value)}
          required
        />
      </div>

      <div className="campo-fila">
        <div className="campo-grupo">
          <label>Pais de origen</label>
          <select value={receta.origen} onChange={(e) => actualizar('origen', e.target.value)}>
            <option value="">Seleccionar...</option>
            {paises.filter((p) => p !== 'Todos').map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="campo-grupo">
          <label>Categoria</label>
          <select value={receta.categoria} onChange={(e) => actualizar('categoria', e.target.value)}>
            <option value="">Seleccionar...</option>
            {categorias.filter((c) => c !== 'Todas').map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="campo-fila">
        <div className="campo-grupo">
          <label>Tiempo (min)</label>
          <input
            type="number"
            placeholder="Minutos"
            value={receta.tiempoPreparacion}
            onChange={(e) => actualizar('tiempoPreparacion', e.target.value)}
            min="0"
          />
        </div>
        <div className="campo-grupo">
          <label>Porciones</label>
          <input
            type="number"
            placeholder="Cantidad"
            value={receta.porciones}
            onChange={(e) => actualizar('porciones', e.target.value)}
            min="0"
          />
        </div>
      </div>

      <div className="campo-grupo">
        <label>Icono</label>
        <div className="selector-emoji">
          {emojis.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className={`emoji-opcion ${receta.imagen === emoji ? 'emoji-seleccionado' : ''}`}
              onClick={() => actualizar('imagen', emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <div className="campo-grupo">
        <label>Ingredientes</label>
        {receta.ingredientes.map((ing, i) => (
          <div key={i} className="campo-ingrediente">
            <input
              type="text"
              placeholder={`Ingrediente ${i + 1}`}
              value={ing}
              onChange={(e) => actualizarIngrediente(i, e.target.value)}
            />
            {receta.ingredientes.length > 1 && (
              <button type="button" className="boton-quitar" onClick={() => quitarIngrediente(i)}>✕</button>
            )}
          </div>
        ))}
        <button type="button" className="boton-agregar-ingrediente" onClick={agregarIngrediente}>
          + Agregar ingrediente
        </button>
      </div>

      <div className="campo-grupo">
        <label>Instrucciones</label>
        <textarea
          className="textarea-grande"
          placeholder="Escribe los pasos de preparacion..."
          value={receta.instrucciones}
          onChange={(e) => actualizar('instrucciones', e.target.value)}
        />
      </div>

      <div className="formulario-acciones">
        <button type="submit" className="boton-guardar">
          {recetaInicial ? 'Guardar Cambios' : 'Agregar Receta'}
        </button>
        {onCancelar && (
          <button type="button" className="boton-cancelar" onClick={onCancelar}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
