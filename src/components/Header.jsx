import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { LogoMark } from './Logo'
import { ChevronDown, LogOut, Trash2, AlertTriangle, X } from 'lucide-react'

const ROLE_LABEL = { buyer: 'Comprador', seller: 'Vendedor', admin: 'Administrador' }

/**
 * Modal de borrado de cuenta.
 *
 * Google Play exige que toda app con registro permita borrar la cuenta desde
 * dentro de la app (además de una URL pública, en /eliminar-cuenta.html).
 * Pide escribir ELIMINAR para que no se dispare por un toque accidental.
 */
function DeleteAccountModal({ onClose }) {
  const [texto, setTexto] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const confirmado = texto.trim().toUpperCase() === 'ELIMINAR'

  async function handleDelete() {
    if (!confirmado || loading) return
    setLoading(true); setError('')
    try {
      const { error: rpcError } = await supabase.rpc('delete_my_account')
      if (rpcError) {
        // La función rechaza el borrado si quedan reservas activas con terceros.
        setError(rpcError.message || 'No se pudo eliminar la cuenta.')
        setLoading(false)
        return
      }
      await supabase.auth.signOut()
      // onAuthStateChange en App.jsx devuelve al inicio automáticamente.
    } catch {
      setError('No se pudo conectar con el servidor. Inténtalo de nuevo.')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-start gap-3 p-5 border-b border-gray-100">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <h2 className="font-black text-gray-900">Eliminar mi cuenta</h2>
            <p className="text-sm text-gray-500 mt-0.5">Esta acción no se puede deshacer.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
            <p className="font-semibold text-gray-800 mb-2">Se borrará de forma permanente:</p>
            <ul className="space-y-1 list-disc pl-5">
              <li>Tu perfil y tu acceso</li>
              <li>Tu historial de reservas</li>
              <li>Si eres vendedor: tu tienda y todas tus bolsas</li>
            </ul>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Escribe ELIMINAR para confirmar
            </label>
            <input
              value={texto}
              onChange={e => setTexto(e.target.value)}
              placeholder="ELIMINAR"
              autoFocus
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={!confirmado || loading}
              className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm transition-colors"
            >
              {loading ? 'Eliminando...' : 'Eliminar cuenta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Header({ profile, title }) {
  const [open, setOpen] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function onDocClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  return (
    <>
      <header
        className="bg-white px-4 py-2 flex items-center justify-between sticky top-0 z-10 shadow-sm"
        style={{ borderBottom: '2.5px solid #f57c00' }}
      >
        <div className="flex items-center gap-2">
          <LogoMark size="md" />
          <div>
            <h1 className="font-black text-xl leading-tight tracking-tight">
              <span style={{ color: '#f57c00' }}>Rescate</span>
              <span style={{ color: '#1b7a30' }}> Sabor</span>
            </h1>
            {profile?.name && (
              <p className="text-xs text-gray-500 leading-tight">{profile.name}</p>
            )}
          </div>
        </div>

        <div className="relative" ref={menuRef}>
          {/* En móvil no cabe la etiqueta, pero un chevron suelto no se lee como
              "mi cuenta": se muestra siempre la inicial en un avatar. */}
          <button
            onClick={() => setOpen(v => !v)}
            aria-label="Menú de mi cuenta"
            aria-expanded={open}
            className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-sm"
              style={{ background: '#1b7a30' }}
            >
              {(profile?.name || profile?.email || '?').charAt(0).toUpperCase()}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
              strokeWidth={2}
            />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="font-semibold text-gray-800 text-sm truncate">
                  {profile?.name || 'Mi cuenta'}
                </p>
                <p className="text-xs text-gray-500 truncate">{profile?.email}</p>
                {profile?.role && (
                  <span className="inline-block mt-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700">
                    {ROLE_LABEL[profile.role] || profile.role}
                  </span>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <LogOut className="w-4 h-4 text-gray-400" strokeWidth={2} />
                Cerrar sesión
              </button>

              <button
                onClick={() => { setOpen(false); setShowDelete(true) }}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
              >
                <Trash2 className="w-4 h-4" strokeWidth={2} />
                Eliminar mi cuenta
              </button>

              <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 flex gap-3">
                <a href="/privacidad.html" className="text-[11px] text-gray-500 hover:text-gray-700">Privacidad</a>
                <a href="/terminos.html" className="text-[11px] text-gray-500 hover:text-gray-700">Términos</a>
              </div>
            </div>
          )}
        </div>
      </header>

      {showDelete && <DeleteAccountModal onClose={() => setShowDelete(false)} />}
    </>
  )
}
