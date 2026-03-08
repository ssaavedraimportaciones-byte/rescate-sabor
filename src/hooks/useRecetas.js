import { useState, useEffect } from 'react'
import { recetasIniciales } from '../data/recetas'

const STORAGE_KEY = 'rescate-sabor-recetas'
const FAVORITOS_KEY = 'rescate-sabor-favoritos'

function cargarRecetas() {
  try {
    const guardadas = localStorage.getItem(STORAGE_KEY)
    if (guardadas) return JSON.parse(guardadas)
  } catch (e) {
    console.error('Error cargando recetas:', e)
  }
  return recetasIniciales
}

function cargarFavoritos() {
  try {
    const guardados = localStorage.getItem(FAVORITOS_KEY)
    if (guardados) return JSON.parse(guardados)
  } catch (e) {
    console.error('Error cargando favoritos:', e)
  }
  return []
}

export function useRecetas() {
  const [recetas, setRecetas] = useState(cargarRecetas)
  const [favoritos, setFavoritos] = useState(cargarFavoritos)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recetas))
  }, [recetas])

  useEffect(() => {
    localStorage.setItem(FAVORITOS_KEY, JSON.stringify(favoritos))
  }, [favoritos])

  const agregarReceta = (nueva) => {
    const receta = {
      id: Date.now(),
      ...nueva,
      imagen: nueva.imagen || '📖',
      ingredientes: nueva.ingredientes || [],
      instrucciones: nueva.instrucciones || '',
      tiempoPreparacion: nueva.tiempoPreparacion || 0,
      porciones: nueva.porciones || 0,
    }
    setRecetas((prev) => [...prev, receta])
    return receta
  }

  const editarReceta = (id, datos) => {
    setRecetas((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...datos } : r))
    )
  }

  const eliminarReceta = (id) => {
    setRecetas((prev) => prev.filter((r) => r.id !== id))
    setFavoritos((prev) => prev.filter((fid) => fid !== id))
  }

  const toggleFavorito = (id) => {
    setFavoritos((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    )
  }

  const esFavorito = (id) => favoritos.includes(id)

  const obtenerReceta = (id) => recetas.find((r) => r.id === Number(id))

  const resetearRecetas = () => {
    setRecetas(recetasIniciales)
    setFavoritos([])
  }

  return {
    recetas,
    favoritos,
    agregarReceta,
    editarReceta,
    eliminarReceta,
    toggleFavorito,
    esFavorito,
    obtenerReceta,
    resetearRecetas,
  }
}
