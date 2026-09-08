import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { LogoMark } from './Logo'
import { SURFACE_GRADIENT, HEADER_GRADIENT, CTA_GRADIENT } from '../lib/brand'

const G = '#1b7a30'
const GM = '#2d9d47'
const O = '#f57c00'

export default function ResetPassword({ onDone }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    if (password !== confirm) { setError('Las contraseñas no coinciden'); return }
    setLoading(true); setError('')
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (updateError) { setError(updateError.message); return }
    onDone()
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: SURFACE_GRADIENT }}
    >
      <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl">
        <div className="flex flex-col items-center py-8 px-6 relative"
          style={{ background: HEADER_GRADIENT }}>
          <div className="bg-white rounded-2xl p-3 shadow-lg mb-3 relative z-10">
            <LogoMark size="lg" />
          </div>
          <h2 className="text-white font-bold mt-2 text-base relative z-10">Crea una nueva contraseña</h2>
        </div>

        <div className="bg-white p-7 space-y-4">
          {error && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm border border-red-100">{error}</div>}

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Nueva contraseña</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:border-transparent transition-all"
              />
              <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Confirmar contraseña</label>
            <input
              type={showPw ? 'text' : 'password'} value={confirm}
              onChange={e => setConfirm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="Repite la contraseña"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:border-transparent transition-all"
            />
          </div>

          <button
            onClick={handleSubmit} disabled={loading}
            className="w-full text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 shadow-md hover:shadow-lg disabled:opacity-50 text-sm"
            style={{ background: CTA_GRADIENT }}
          >
            {loading ? 'Guardando...' : 'Guardar contraseña'}
          </button>
        </div>
      </div>
    </div>
  )
}
