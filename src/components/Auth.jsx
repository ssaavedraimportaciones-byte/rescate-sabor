import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth({ onAuth }) {
  const [mode, setMode] = useState('login')
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmationSent, setConfirmationSent] = useState(false)

  async function handleRegister() {
    if (!name || !role) {
      setError('Completa todos los campos')
      return
    }
    setLoading(true)
    setError('')

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (!data.session) {
      setConfirmationSent(true)
      setLoading(false)
      return
    }

    await supabase.from('profiles').upsert({ id: data.user.id, email, name, role })

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    onAuth(profile)
    setLoading(false)
  }

  async function handleLogin() {
    if (!email || !password) {
      setError('Ingresa email y contraseña')
      return
    }
    setLoading(true)
    setError('')

    const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password })
    if (loginError) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    onAuth(profile)
    setLoading(false)
  }

  if (confirmationSent) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Revisa tu correo</h2>
          <p className="text-gray-500">
            Te enviamos un enlace de confirmación a <strong>{email}</strong>.
            Haz clic en el enlace y luego inicia sesión.
          </p>
          <button
            onClick={() => { setConfirmationSent(false); setMode('login'); setStep(1) }}
            className="mt-6 text-orange-500 font-medium text-sm"
          >
            Ir al inicio de sesión
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.svg" alt="Rescate Sabor" className="w-20 h-20 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-gray-900">Rescate Sabor</h1>
          <p className="text-gray-500 mt-1">
            {mode === 'login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 rounded-xl p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {mode === 'register' && step === 2 ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tu nombre</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="¿Cómo te llamamos?"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">¿Cómo usarás la app?</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setRole('buyer')}
                  className={`border-2 rounded-xl p-4 text-center transition-all ${
                    role === 'buyer'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <div className="text-3xl mb-1">🛍️</div>
                  <div className="font-medium text-gray-900">Comprador</div>
                  <div className="text-xs text-gray-500 mt-1">Reservo bolsas</div>
                </button>
                <button
                  onClick={() => setRole('seller')}
                  className={`border-2 rounded-xl p-4 text-center transition-all ${
                    role === 'seller'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="text-3xl mb-1">🏪</div>
                  <div className="font-medium text-gray-900">Vendedor</div>
                  <div className="text-xs text-gray-500 mt-1">Vendo excedentes</div>
                </button>
              </div>
            </div>
            <button
              onClick={handleRegister}
              disabled={loading || !name || !role}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
            <button
              onClick={() => setStep(1)}
              className="w-full text-gray-400 py-2 hover:text-gray-600 text-sm"
            >
              Atrás
            </button>
          </div>
        ) : mode === 'register' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <button
              onClick={() => {
                if (!email || !password) { setError('Completa todos los campos'); return }
                if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
                setError('')
                setStep(2)
              }}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Continuar
            </button>
            <p className="text-center text-gray-500 text-sm">
              ¿Ya tienes cuenta?{' '}
              <button
                onClick={() => { setMode('login'); setStep(1); setError('') }}
                className="text-orange-500 font-medium"
              >
                Inicia sesión
              </button>
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Tu contraseña"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
            <p className="text-center text-gray-500 text-sm">
              ¿No tienes cuenta?{' '}
              <button
                onClick={() => { setMode('register'); setStep(1); setError('') }}
                className="text-orange-500 font-medium"
              >
                Regístrate
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
