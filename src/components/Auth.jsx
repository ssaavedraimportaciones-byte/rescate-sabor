import { useState } from 'react'
import { supabase } from '../lib/supabase'

/* Wrapper de pantalla con fondo degradado de marca */
function Screen({ children }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(160deg, #1b7a30 0%, #2d9d47 45%, #f57c00 100%)' }}
    >
      {children}
    </div>
  )
}

/* Tarjeta con cabecera de marca + cuerpo blanco */
function Card({ title, subtitle, children }) {
  return (
    <div className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
      {/* Cabecera con degradado */}
      <div
        className="flex flex-col items-center py-8 px-6"
        style={{ background: 'linear-gradient(135deg, #1b7a30 0%, #f57c00 100%)' }}
      >
        <div className="bg-white rounded-2xl p-3 shadow-lg mb-3">
          <img src="/logo.svg" alt="Rescate Sabor" className="w-20 h-16" />
        </div>
        <p className="font-black text-lg leading-tight tracking-tight">
          <span style={{ color: '#ffe0b2' }}>Rescate</span>
          <span className="text-white"> Sabor</span>
        </p>
        {title && <h2 className="text-white font-semibold mt-2 text-base">{title}</h2>}
        {subtitle && <p className="text-green-100 text-xs mt-0.5 opacity-80">{subtitle}</p>}
      </div>
      {/* Cuerpo blanco */}
      <div className="bg-white p-7">
        {children}
      </div>
    </div>
  )
}

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
  const [resetSent, setResetSent] = useState(false)

  async function handleRegister() {
    if (!name || !role) { setError('Completa todos los campos'); return }
    setLoading(true)
    setError('')

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
    if (signUpError) { setError(signUpError.message); setLoading(false); return }

    if (!data.session) {
      setConfirmationSent(true)
      setLoading(false)
      return
    }

    await supabase.from('profiles').upsert({ id: data.user.id, email, name, role })

    const { data: profile } = await supabase
      .from('profiles').select('*').eq('id', data.user.id).single()

    onAuth(profile)
    setLoading(false)
  }

  async function handleLogin() {
    if (!email || !password) { setError('Ingresa email y contraseña'); return }
    setLoading(true)
    setError('')

    const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password })
    if (loginError) { setError('Email o contraseña incorrectos'); setLoading(false); return }

    const { data: profile } = await supabase
      .from('profiles').select('*').eq('id', data.user.id).single()

    onAuth(profile)
    setLoading(false)
  }

  async function handleForgotPassword() {
    if (!email) { setError('Ingresa tu email'); return }
    setLoading(true)
    setError('')

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/`,
    })

    if (resetError) { setError(resetError.message) } else { setResetSent(true) }
    setLoading(false)
  }

  function goToLogin() {
    setMode('login'); setStep(1); setError('')
    setResetSent(false); setConfirmationSent(false)
  }

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
  const btnPrimary = "w-full text-white font-semibold py-3 rounded-xl transition-all active:scale-95 shadow-sm"

  if (confirmationSent) {
    return (
      <Screen>
        <Card title="Revisa tu correo">
          <div className="text-center">
            <div className="text-5xl mb-4">📧</div>
            <p className="text-gray-600 text-sm">
              Enviamos un enlace de confirmación a <strong className="text-gray-900">{email}</strong>.
              Haz clic en el enlace y luego inicia sesión.
            </p>
            <button onClick={goToLogin} className="mt-5 text-orange-500 font-semibold text-sm">
              Ir al inicio de sesión
            </button>
          </div>
        </Card>
      </Screen>
    )
  }

  if (resetSent) {
    return (
      <Screen>
        <Card title="Revisa tu correo">
          <div className="text-center">
            <div className="text-5xl mb-4">🔑</div>
            <p className="text-gray-600 text-sm">
              Enviamos un enlace para restablecer tu contraseña a <strong className="text-gray-900">{email}</strong>.
            </p>
            <button onClick={goToLogin} className="mt-5 text-orange-500 font-semibold text-sm">
              Volver al inicio de sesión
            </button>
          </div>
        </Card>
      </Screen>
    )
  }

  /* FORGOT PASSWORD */
  if (mode === 'forgot') {
    return (
      <Screen>
        <Card title="Recuperar contraseña" subtitle="Te enviamos un enlace a tu email">
          {error && <div className="bg-red-50 text-red-600 rounded-xl p-3 mb-4 text-sm">{error}</div>}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com" onKeyDown={e => e.key === 'Enter' && handleForgotPassword()}
                className={inputCls} />
            </div>
            <button onClick={handleForgotPassword} disabled={loading}
              className={btnPrimary} style={{ background: 'linear-gradient(90deg, #1b7a30, #f57c00)' }}>
              {loading ? 'Enviando...' : 'Enviar enlace'}
            </button>
            <button onClick={goToLogin} className="w-full text-gray-400 py-2 hover:text-gray-600 text-sm">
              Volver al inicio de sesión
            </button>
          </div>
        </Card>
      </Screen>
    )
  }

  /* REGISTER step 2 */
  if (mode === 'register' && step === 2) {
    return (
      <Screen>
        <Card title="Cuéntanos sobre ti">
          {error && <div className="bg-red-50 text-red-600 rounded-xl p-3 mb-4 text-sm">{error}</div>}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tu nombre</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="¿Cómo te llamamos?" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">¿Cómo usarás la app?</label>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setRole('buyer')}
                  className={`border-2 rounded-2xl p-4 text-center transition-all ${
                    role === 'buyer'
                      ? 'border-orange-500 bg-orange-50 shadow-inner'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}>
                  <div className="text-3xl mb-1">🛍️</div>
                  <div className="font-semibold text-gray-900 text-sm">Comprador</div>
                  <div className="text-xs text-gray-500 mt-0.5">Reservo bolsas</div>
                </button>
                <button onClick={() => setRole('seller')}
                  className={`border-2 rounded-2xl p-4 text-center transition-all ${
                    role === 'seller'
                      ? 'border-green-600 bg-green-50 shadow-inner'
                      : 'border-gray-200 hover:border-green-400'
                  }`}>
                  <div className="text-3xl mb-1">🏪</div>
                  <div className="font-semibold text-gray-900 text-sm">Vendedor</div>
                  <div className="text-xs text-gray-500 mt-0.5">Vendo excedentes</div>
                </button>
              </div>
            </div>
            <button onClick={handleRegister} disabled={loading || !name || !role}
              className={`${btnPrimary} disabled:opacity-50`}
              style={{ background: 'linear-gradient(90deg, #1b7a30, #f57c00)' }}>
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
            <button onClick={() => setStep(1)} className="w-full text-gray-400 py-2 hover:text-gray-600 text-sm">
              Atrás
            </button>
          </div>
        </Card>
      </Screen>
    )
  }

  /* REGISTER step 1 */
  if (mode === 'register') {
    return (
      <Screen>
        <Card title="Crea tu cuenta">
          {error && <div className="bg-red-50 text-red-600 rounded-xl p-3 mb-4 text-sm">{error}</div>}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres" className={inputCls} />
            </div>
            <button onClick={() => {
              if (!email || !password) { setError('Completa todos los campos'); return }
              if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
              setError(''); setStep(2)
            }} className={btnPrimary} style={{ background: 'linear-gradient(90deg, #1b7a30, #f57c00)' }}>
              Continuar
            </button>
            <p className="text-center text-gray-500 text-sm">
              ¿Ya tienes cuenta?{' '}
              <button onClick={goToLogin} className="font-semibold" style={{ color: '#f57c00' }}>
                Inicia sesión
              </button>
            </p>
          </div>
        </Card>
      </Screen>
    )
  }

  /* LOGIN */
  return (
    <Screen>
      <Card title="Bienvenido de vuelta">
        {error && <div className="bg-red-50 text-red-600 rounded-xl p-3 mb-4 text-sm">{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com" className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Tu contraseña" className={inputCls}
              onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          </div>
          <div className="text-right -mt-2">
            <button onClick={() => { setMode('forgot'); setError('') }}
              className="text-sm font-medium" style={{ color: '#f57c00' }}>
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          <button onClick={handleLogin} disabled={loading}
            className={`${btnPrimary} disabled:opacity-50`}
            style={{ background: 'linear-gradient(90deg, #1b7a30, #f57c00)' }}>
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
          <p className="text-center text-gray-500 text-sm">
            ¿No tienes cuenta?{' '}
            <button onClick={() => { setMode('register'); setStep(1); setError('') }}
              className="font-semibold" style={{ color: '#1b7a30' }}>
              Regístrate
            </button>
          </p>
        </div>
      </Card>
    </Screen>
  )
}
