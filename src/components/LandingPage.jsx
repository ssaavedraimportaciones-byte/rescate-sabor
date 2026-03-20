import { useEffect, useState } from 'react'

const GREEN = '#1b7a30'
const GREEN_MID = '#2d9d47'
const ORANGE = '#f57c00'

function useScrolled(threshold = 60) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > threshold)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [threshold])
  return scrolled
}

function FadeIn({ children, delay = 0, className = '' }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])
  return (
    <div
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: 'opacity 0.65s ease, transform 0.65s ease',
      }}
    >
      {children}
    </div>
  )
}

export default function LandingPage({ onStart }) {
  const scrolled = useScrolled()

  return (
    <div className="min-h-screen font-sans overflow-x-hidden" style={{ background: '#fafafa' }}>

      {/* ── NAVBAR ─────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          boxShadow: scrolled ? '0 1px 16px rgba(0,0,0,0.08)' : 'none',
        }}
      >
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="Rescate Sabor" className="w-9 h-8" />
          <span className="font-black text-lg leading-none">
            <span style={{ color: ORANGE }}>Rescate</span>
            <span style={{ color: GREEN }}> Sabor</span>
          </span>
        </div>
        <button
          onClick={onStart}
          className="text-sm font-bold px-5 py-2 rounded-xl text-white transition-all active:scale-95"
          style={{ background: `linear-gradient(90deg, ${GREEN}, ${GREEN_MID})` }}
        >
          Entrar
        </button>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-32 overflow-hidden"
        style={{ background: `linear-gradient(150deg, ${GREEN} 0%, ${GREEN_MID} 45%, #e65100 100%)` }}
      >
        {/* Blobs decorativos */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-20 left-0 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(245,124,0,0.15) 0%, transparent 70%)', transform: 'translateX(-30%)' }} />

        {/* Logo card */}
        <FadeIn delay={100}>
          <div className="bg-white rounded-3xl p-6 shadow-2xl mb-8 inline-block">
            <img src="/logo.svg" alt="Rescate Sabor" className="w-36 h-28 mx-auto" />
            <p className="font-black text-2xl mt-3 leading-tight">
              <span style={{ color: ORANGE }}>Rescate</span>
              <span style={{ color: GREEN }}> Sabor</span>
            </p>
          </div>
        </FadeIn>

        {/* Headline */}
        <FadeIn delay={250} className="max-w-xl">
          <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4">
            Menos desperdicio.<br />
            <span style={{ color: '#ffe0b2' }}>Más sabor.</span>
          </h1>
          <p className="text-green-100 text-lg font-light leading-relaxed mb-8">
            Conectamos tiendas locales con excedente de comida y compradores
            que quieren bolsas sorpresa a precio justo.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onStart}
              className="bg-white font-bold text-lg px-10 py-4 rounded-2xl shadow-xl transition-all active:scale-95 hover:shadow-2xl"
              style={{ color: GREEN }}
            >
              Empezar gratis →
            </button>
            <a
              href="#como-funciona"
              className="border-2 border-white border-opacity-50 text-white font-semibold text-lg px-8 py-4 rounded-2xl transition-all hover:bg-white hover:bg-opacity-10"
            >
              Cómo funciona
            </a>
          </div>
          <p className="mt-4 text-green-100 text-sm opacity-60">Sin tarjeta de crédito · 100% gratis</p>
        </FadeIn>

        {/* Stats */}
        <FadeIn delay={450}>
          <div className="flex flex-wrap justify-center gap-10 mt-14">
            {[
              { num: '40%', label: 'de la comida se desperdicia' },
              { num: '50-70%', label: 'de descuento en bolsas' },
              { num: '100%', label: 'impacto positivo' },
            ].map(({ num, label }) => (
              <div key={label} className="text-center">
                <div className="text-3xl sm:text-4xl font-black text-white">{num}</div>
                <div className="text-xs text-green-100 opacity-70 mt-1 max-w-[110px]">{label}</div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 90" className="w-full" preserveAspectRatio="none">
            <path d="M0 90 C360 35 720 70 1080 25 L1440 0 L1440 90 Z" fill="#fafafa" />
          </svg>
        </div>
      </section>

      {/* ── COMO FUNCIONA ──────────────────────────────────────── */}
      <section id="como-funciona" className="py-24 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-3"
            style={{ color: ORANGE, background: '#fff3e0' }}>¿Cómo funciona?</span>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900">Tres pasos, mucho impacto</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {[
            {
              step: '01',
              icon: '🏪',
              title: 'La tienda publica',
              desc: 'El vendedor crea una bolsa sorpresa con el excedente del día y la publica con precio reducido.',
              color: GREEN,
            },
            {
              step: '02',
              icon: '🥡',
              title: 'Tú reservas',
              desc: 'Elige la bolsa que quieres y reserva en segundos desde tu móvil. Sin complicaciones.',
              color: ORANGE,
            },
            {
              step: '03',
              icon: '✅',
              title: 'Retiras y disfrutas',
              desc: 'Pasa por la tienda en el horario acordado y recoge tu bolsa. ¡La sorpresa es parte del sabor!',
              color: GREEN,
            },
          ].map(({ step, icon, title, desc, color }, i) => (
            <div key={step} className="relative text-center group">
              {/* Línea conectora en desktop */}
              {i < 2 && (
                <div className="hidden md:block absolute top-10 left-[60%] right-0 h-0.5 opacity-20"
                  style={{ background: 'linear-gradient(90deg, #1b7a30, #f57c00)' }} />
              )}
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-5 shadow-md transition-transform group-hover:-translate-y-1"
                style={{ background: `linear-gradient(135deg, ${color}15, ${color}30)` }}
              >
                {icon}
              </div>
              <span className="text-5xl font-black opacity-10 absolute -top-3 left-1/2 -translate-x-1/2 select-none"
                style={{ color }}>
                {step}
              </span>
              <h3 className="font-black text-gray-900 text-lg mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── BENEFICIOS ─────────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ background: '#f0fdf4' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-3"
              style={{ color: GREEN, background: '#dcfce7' }}>Para todos</span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">Todos ganan</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Compradores */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-green-100 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                  style={{ background: '#dcfce7' }}>🛍️</div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">Compradores</h3>
                  <p className="text-sm text-gray-400">Come rico, gasta menos</p>
                </div>
              </div>
              <ul className="space-y-3 flex-1 mb-6">
                {[
                  'Bolsas sorpresa 50-70% más baratas',
                  'Reserva en segundos desde el móvil',
                  'Ticket digital actualizado en tiempo real',
                  'Variedad de tiendas y tipos de comida',
                  'Ayudas al planeta sin esfuerzo extra',
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-600">
                    <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: GREEN }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={onStart}
                className="w-full py-3.5 rounded-xl text-white font-bold transition-all active:scale-95 hover:opacity-90"
                style={{ background: `linear-gradient(90deg, ${GREEN}, ${GREEN_MID})` }}
              >
                Soy comprador →
              </button>
            </div>

            {/* Vendedores */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-orange-100 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                  style={{ background: '#fff3e0' }}>🏪</div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">Vendedores</h3>
                  <p className="text-sm text-gray-400">Convierte excedentes en ingresos</p>
                </div>
              </div>
              <ul className="space-y-3 flex-1 mb-6">
                {[
                  'Recupera valor de la comida excedente',
                  'Gestión de reservas en tiempo real',
                  'Dashboard sencillo e intuitivo',
                  'Nuevos clientes descubren tu tienda',
                  'Mejora tu imagen con responsabilidad social',
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-600">
                    <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: ORANGE }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={onStart}
                className="w-full py-3.5 rounded-xl text-white font-bold transition-all active:scale-95 hover:opacity-90"
                style={{ background: `linear-gradient(90deg, ${ORANGE}, #e65100)` }}
              >
                Soy vendedor →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── IMPACTO ────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-3"
            style={{ color: ORANGE, background: '#fff3e0' }}>Impacto real</span>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-14">
            Cada bolsa hace la diferencia
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: '🌍', title: '1/3 de la comida', subtitle: 'del mundo se desperdicia cada año', color: GREEN },
              { icon: '💸', title: 'Ahorra hasta 70%', subtitle: 'en cada compra comparado con precio normal', color: ORANGE },
              { icon: '🌱', title: 'Menos CO₂', subtitle: 'al rescatar comida reduces tu huella de carbono', color: GREEN },
            ].map(({ icon, title, subtitle, color }) => (
              <div key={title}
                className="rounded-3xl p-8 text-center shadow-sm border border-gray-100 bg-white hover:shadow-md transition-shadow">
                <div className="text-5xl mb-4">{icon}</div>
                <div className="font-black text-xl text-gray-900 mb-1">{title}</div>
                <div className="text-sm text-gray-500 leading-relaxed">{subtitle}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIOS ────────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ background: '#f9fafb' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-3"
              style={{ color: GREEN, background: '#dcfce7' }}>Testimonios</span>
            <h2 className="text-3xl font-black text-gray-900">Lo que dicen nuestros usuarios</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                name: 'María G.',
                role: 'Compradora',
                text: 'Compro mi bolsa sorpresa cada viernes. Siempre viene llena y a un precio increíble. ¡Nunca me ha decepcionado!',
                avatar: '👩‍💼',
                color: GREEN,
              },
              {
                name: 'Carlos R.',
                role: 'Panadería El Trigo',
                text: 'Antes tirábamos pan sobrante cada noche. Ahora lo vendemos en bolsas sorpresa y es un ingreso extra real.',
                avatar: '👨‍🍳',
                color: ORANGE,
              },
              {
                name: 'Ana P.',
                role: 'Compradora',
                text: 'La app es súper fácil. Reservo en 30 segundos, paso a buscar y listo. Siento que hago algo bueno por el planeta.',
                avatar: '👩',
                color: GREEN,
              },
            ].map(({ name, role, text, avatar, color }) => (
              <div key={name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                    style={{ background: `${color}18` }}>{avatar}</div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{name}</div>
                    <div className="text-xs text-gray-400">{role}</div>
                  </div>
                  <div className="ml-auto text-yellow-400 text-sm">★★★★★</div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">"{text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ──────────────────────────────────────────── */}
      <section
        className="py-24 px-6 text-center relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${GREEN} 0%, #f57c00 100%)` }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.06) 0%, transparent 70%)' }} />
        <div className="relative z-10 max-w-xl mx-auto">
          <div className="bg-white bg-opacity-10 rounded-3xl p-3 inline-block mb-6">
            <img src="/logo.svg" alt="Rescate Sabor" className="w-20 h-16 mx-auto" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
            ¿Listo para rescatar sabor?
          </h2>
          <p className="text-green-100 text-lg mb-8 opacity-90">
            Únete gratis hoy. Sin tarjeta. Sin complicaciones.
          </p>
          <button
            onClick={onStart}
            className="bg-white font-black text-xl px-14 py-5 rounded-2xl shadow-2xl transition-all active:scale-95 hover:shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
            style={{ color: GREEN }}
          >
            Crear cuenta gratis
          </button>
          <p className="mt-5 text-green-100 text-sm opacity-60">
            Ya somos parte de la solución 🌱
          </p>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────── */}
      <footer className="py-10 px-6 bg-gray-950">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Rescate Sabor" className="w-8 h-7" />
            <span className="font-black text-lg">
              <span style={{ color: ORANGE }}>Rescate</span>
              <span className="text-white"> Sabor</span>
            </span>
          </div>
          <p className="text-gray-500 text-sm">Menos desperdicio. Más sabor. 🌱</p>
          <button
            onClick={onStart}
            className="text-sm font-bold px-4 py-2 rounded-lg transition-all hover:bg-white hover:bg-opacity-10"
            style={{ color: ORANGE }}
          >
            Entrar a la app →
          </button>
        </div>
      </footer>

    </div>
  )
}
