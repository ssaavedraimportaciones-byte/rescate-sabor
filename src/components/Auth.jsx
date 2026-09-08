import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { LogoMark } from './Logo'
import { Mail, KeyRound, ShoppingBag, Store, Check, AlertTriangle } from 'lucide-react'
import { SURFACE_GRADIENT, HEADER_GRADIENT, CTA_GRADIENT } from '../lib/brand'

const G = '#1b7a30'
const GM = '#2d9d47'
const O = '#f57c00'

/* ─── Fondo animado ─── */
function Screen({ children }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: SURFACE_GRADIENT }}
    >
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full pointer-events-none opacity-[0.05]"
        style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)' }} />
      <div className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full pointer-events-none opacity-[0.05]"
        style={{ background: `radial-gradient(circle, ${O} 0%, transparent 70%)` }} />
      {children}
    </div>
  )
}

/* ─── Card ─── */
function Card({ title, subtitle, step, totalSteps, children }) {
  return (
    <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-scaleIn">
      {/* Header */}
      <div className="flex flex-col items-center py-8 px-6 relative"
        style={{ background: HEADER_GRADIENT }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 60%)' }} />
        <div className="bg-white rounded-2xl p-3 shadow-lg mb-3 relative z-10">
          <LogoMark size="lg" />
        </div>
        <p className="font-black text-base leading-tight tracking-tight relative z-10">
          <span style={{ color: '#ffe0b2' }}>Rescate</span>
          <span className="text-white"> Sabor</span>
        </p>
        {title && <h2 className="text-white font-bold mt-2 text-base relative z-10">{title}</h2>}
        {subtitle && <p className="text-green-100/70 text-xs mt-0.5 relative z-10">{subtitle}</p>}

        {/* Barra de progreso pasos */}
        {totalSteps && (
          <div className="flex gap-1.5 mt-4 relative z-10">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: i < step ? 28 : 18,
                  background: i < step ? '#fff' : 'rgba(255,255,255,0.3)',
                }} />
            ))}
          </div>
        )}
      </div>
      {/* Body */}
      <div className="bg-white p-7">{children}</div>
    </div>
  )
}

/* ─── Input con ícono opcional ─── */
function Input({ label, type = 'text', value, onChange, placeholder, onKeyDown, right }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={type} value={value} onChange={onChange} placeholder={placeholder} onKeyDown={onKeyDown}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:border-transparent transition-all"
          style={{ '--tw-ring-color': O }}
        />
        {right && <div className="absolute right-3 top-1/2 -translate-y-1/2">{right}</div>}
      </div>
    </div>
  )
}

/* ─── Botón toggle mostrar contraseña ─── */
function EyeBtn({ show, onToggle }) {
  return (
    <button type="button" onClick={onToggle} className="text-gray-400 hover:text-gray-600 transition p-1">
      {show
        ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
        : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
      }
    </button>
  )
}

/* ─── Botón principal ─── */
function Btn({ onClick, disabled, loading, children, style }) {
  return (
    <button
      onClick={onClick} disabled={disabled}
      className="w-full text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      style={{ background: CTA_GRADIENT, ...style }}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {children}
        </span>
      ) : children}
    </button>
  )
}

/* ━━━ COMPONENTE PRINCIPAL ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function Auth({ onAuth }) {
  const [mode, setMode] = useState('login')
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmationSent, setConfirmationSent] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  function friendlyError(err) {
    if (!err) return ''
    if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
      return 'No se pudo conectar con el servidor. Revisa tu conexión a internet e inténtalo de nuevo.'
    }
    return err.message
  }

  async function handleRegister() {
    if (!name || !role) { setError('Completa todos los campos'); return }
    if (loading) return
    setLoading(true); setError('')
    try {
      // name y role se guardan en el perfil desde el trigger handle_new_user()
      // usando este metadata, así funciona aunque la confirmación de email esté pendiente.
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password, options: { data: { name, role } } })
      if (signUpError) { setError(friendlyError(signUpError)); setLoading(false); return }
      const userId = data?.user?.id
      if (!userId || !data.session) { setConfirmationSent(true); setLoading(false); return }
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single()
      if (!profile) { setError('Error al cargar perfil'); setLoading(false); return }
      onAuth(profile); setLoading(false)
    } catch (err) {
      setError(friendlyError(err)); setLoading(false)
    }
  }

  async function handleLogin() {
    if (!email || !password) { setError('Ingresa email y contraseña'); return }
    if (loading) return
    setLoading(true); setError('')
    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password })
      if (loginError) {
        setError(loginError.message === 'Failed to fetch' ? friendlyError(loginError) : 'Email o contraseña incorrectos')
        setLoading(false); return
      }
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()
      if (!profile) { setError('Error al cargar perfil'); setLoading(false); return }
      onAuth(profile); setLoading(false)
    } catch (err) {
      setError(friendlyError(err)); setLoading(false)
    }
  }

  async function handleForgotPassword() {
    if (!email) { setError('Ingresa tu email'); return }
    setLoading(true); setError('')
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/` })
      if (resetError) { setError(friendlyError(resetError)) } else { setResetSent(true) }
    } catch (err) {
      setError(friendlyError(err))
    }
    setLoading(false)
  }

  function goToLogin() {
    setMode('login'); setStep(1); setError('')
    setResetSent(false); setConfirmationSent(false)
  }

  /* ── Confirmación enviada ── */
  if (confirmationSent) return (
    <Screen>
      <Card title="Revisa tu correo">
        <div className="text-center py-4">
          <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-9 h-9" style={{ color: O }} strokeWidth={1.75} />
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">
            Enviamos un enlace de confirmación a<br />
            <strong className="text-gray-900">{email}</strong>
          </p>
          <button onClick={goToLogin} className="mt-6 font-bold text-sm" style={{ color: O }}>
            ← Ir al inicio de sesión
          </button>
        </div>
      </Card>
    </Screen>
  )

  /* ── Reset enviado ── */
  if (resetSent) return (
    <Screen>
      <Card title="Revisa tu correo">
        <div className="text-center py-4">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-9 h-9" style={{ color: G }} strokeWidth={1.75} />
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">
            Enviamos un enlace para restablecer tu contraseña a<br />
            <strong className="text-gray-900">{email}</strong>
          </p>
          <button onClick={goToLogin} className="mt-6 font-bold text-sm" style={{ color: O }}>
            ← Volver al inicio de sesión
          </button>
        </div>
      </Card>
    </Screen>
  )

  /* ── Recuperar contraseña ── */
  if (mode === 'forgot') return (
    <Screen>
      <Card title="Recuperar contraseña" subtitle="Te enviamos un enlace a tu email">
        <div className="space-y-4">
          {error && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm border border-red-100">{error}</div>}
          <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="tu@email.com" onKeyDown={e => e.key === 'Enter' && handleForgotPassword()} />
          <Btn onClick={handleForgotPassword} loading={loading}>
            {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
          </Btn>
          <button onClick={goToLogin} className="w-full text-gray-400 hover:text-gray-600 py-2 text-sm transition">
            ← Volver al inicio de sesión
          </button>
        </div>
      </Card>
    </Screen>
  )

  /* ── Registro paso 2 ── */
  if (mode === 'register' && step === 2) return (
    <Screen>
      <Card title="Cuéntanos sobre ti" step={2} totalSteps={2}>
        <div className="space-y-5">
          {error && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm border border-red-100">{error}</div>}
          <Input label="Tu nombre" value={name} onChange={e => setName(e.target.value)} placeholder="¿Cómo te llamamos?" />

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">¿Cómo usarás la app?</label>
            {/* Admin no es una opción de auto-registro: se otorga desde el panel de
                administración o directamente en la base, nunca por el propio usuario. */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'buyer', Icon: ShoppingBag, title: 'Comprador', desc: 'Reservo bolsas', color: O, bg: '#fff3e0', border: O },
                { key: 'seller', Icon: Store, title: 'Vendedor', desc: 'Vendo excedentes', color: G, bg: '#f0fdf4', border: G },
              ].map(({ key, Icon, title, desc, color, bg, border }) => (
                <button key={key} onClick={() => setRole(key)}
                  className="border-2 rounded-2xl p-4 text-center transition-all hover:scale-[1.02]"
                  style={{
                    borderColor: role === key ? border : '#e5e7eb',
                    background: role === key ? bg : '#fff',
                    boxShadow: role === key ? `0 0 0 3px ${border}20` : 'none',
                  }}>
                  <div className="flex justify-center mb-2">
                    <Icon className="w-7 h-7" style={{ color: role === key ? border : '#9ca3af' }} strokeWidth={1.9} />
                  </div>
                  <div className="font-bold text-gray-900 text-sm">{title}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{desc}</div>
                  {role === key && (
                    <div className="mt-2 w-5 h-5 rounded-full flex items-center justify-center mx-auto" style={{ background: border }}>
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <Btn onClick={handleRegister} disabled={!name || !role} loading={loading}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta →'}
          </Btn>
          <button onClick={() => setStep(1)} className="w-full text-gray-400 hover:text-gray-600 py-2 text-sm transition">
            ← Atrás
          </button>
        </div>
      </Card>
    </Screen>
  )

  /* ── Registro paso 1 ── */
  if (mode === 'register') return (
    <Screen>
      <Card title="Crea tu cuenta" subtitle="Gratis, sin complicaciones" step={1} totalSteps={2}>
        <div className="space-y-4">
          {error && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm border border-red-100">{error}</div>}
          <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" />
          <Input label="Contraseña" type={showPw ? 'text' : 'password'} value={password}
            onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres"
            right={<EyeBtn show={showPw} onToggle={() => setShowPw(v => !v)} />} />

          {/* Indicador fuerza contraseña */}
          {password.length > 0 && (
            <div className="space-y-1">
              <div className="flex gap-1">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                    style={{ background: password.length >= i * 2 ? (password.length >= 8 ? G : O) : '#e5e7eb' }} />
                ))}
              </div>
              <p className="text-xs text-gray-400">
                {password.length < 6 ? 'Muy corta' : password.length < 8 ? 'Aceptable' : 'Segura'}
              </p>
            </div>
          )}

          <Btn onClick={() => {
            if (!email || !password) { setError('Completa todos los campos'); return }
            if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
            setError(''); setStep(2)
          }}>
            Continuar →
          </Btn>
          <p className="text-center text-gray-400 text-sm">
            ¿Ya tienes cuenta?{' '}
            <button onClick={goToLogin} className="font-bold transition hover:opacity-80" style={{ color: O }}>
              Inicia sesión
            </button>
          </p>
        </div>
      </Card>
    </Screen>
  )

  /* ── Login ── */
  return (
    <Screen>
      <Card title="Bienvenido de vuelta" subtitle="Inicia sesión en tu cuenta">
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm border border-red-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" strokeWidth={2} />{error}
            </div>
          )}
          <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" />
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contraseña</label>
              <button onClick={() => { setMode('forgot'); setError('') }}
                className="text-xs font-semibold transition hover:opacity-70" style={{ color: O }}>
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Tu contraseña"
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:border-transparent transition-all"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <EyeBtn show={showPw} onToggle={() => setShowPw(v => !v)} />
              </div>
            </div>
          </div>

          <Btn onClick={handleLogin} disabled={loading} loading={loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión →'}
          </Btn>

          <p className="text-center text-gray-400 text-sm">
            ¿No tienes cuenta?{' '}
            <button onClick={() => { setMode('register'); setStep(1); setError('') }}
              className="font-bold transition hover:opacity-80" style={{ color: G }}>
              Regístrate gratis
            </button>
          </p>

          {/* Accesibles sin iniciar sesión: Google revisa que la política de
              privacidad se pueda consultar antes de crear una cuenta. */}
          <div className="flex justify-center gap-4 pt-1">
            <a href="/privacidad.html" className="text-xs text-gray-400 hover:text-gray-600 transition">
              Privacidad
            </a>
            <a href="/terminos.html" className="text-xs text-gray-400 hover:text-gray-600 transition">
              Términos
            </a>
          </div>
        </div>
      </Card>
    </Screen>
  )
}
