import { useEffect, useState, useRef } from 'react'
import { LogoMark } from './Logo'
import { SURFACE_GRADIENT, CTA_GRADIENT } from '../lib/brand'

const G = '#1b7a30'
const GM = '#2d9d47'
const O = '#f57c00'

/* ─── Intersection Observer hook ─── */
function useOnScreen(opts = {}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold: 0.15, ...opts })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return [ref, visible]
}

/* ─── Animated counter ─── */
function Counter({ end, suffix = '', prefix = '', duration = 1800 }) {
  const [val, setVal] = useState(0)
  const [ref, visible] = useOnScreen()
  useEffect(() => {
    if (!visible) return
    let start = 0
    const step = Math.ceil(end / (duration / 16))
    const id = setInterval(() => {
      start += step
      if (start >= end) { setVal(end); clearInterval(id) } else setVal(start)
    }, 16)
    return () => clearInterval(id)
  }, [visible, end, duration])
  return <span ref={ref}>{prefix}{val.toLocaleString('es-CL')}{suffix}</span>
}

/* ─── Scroll-aware navbar ─── */
function useScrolled(y = 50) {
  const [s, setS] = useState(false)
  useEffect(() => {
    const h = () => setS(window.scrollY > y)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [y])
  return s
}

export default function LandingPage({ onStart }) {
  const scrolled = useScrolled()

  return (
    <div className="min-h-screen font-sans overflow-x-hidden" style={{ background: '#fafafa' }}>

      {/* ━━━ NAVBAR ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 sm:px-8 transition-all duration-300"
        style={{
          height: scrolled ? 56 : 64,
          background: scrolled ? 'rgba(255,255,255,0.97)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          boxShadow: scrolled ? '0 1px 24px rgba(0,0,0,0.07)' : 'none',
        }}
      >
        <div className="flex items-center gap-2.5">
          <LogoMark size="sm" />
          {/* Sobre el hero verde el navbar es transparente: el logotipo se aclara
              para no quedar verde-sobre-verde e ilegible. */}
          <span className="font-black text-lg tracking-tight">
            <span style={{ color: scrolled ? O : '#FFB74D' }}>Rescate</span>
            <span style={{ color: scrolled ? G : '#ffffff' }}> Sabor</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a href="#como-funciona" className={`hidden sm:inline text-sm font-medium transition ${scrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white/80 hover:text-white'}`}>
            Cómo funciona
          </a>
          <a href="#negocios" className={`hidden sm:inline text-sm font-medium transition ${scrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white/80 hover:text-white'}`}>
            Para negocios
          </a>
          <button
            onClick={onStart}
            className="text-sm font-bold px-5 py-2.5 rounded-xl text-white transition-all active:scale-95 shadow-md hover:shadow-lg"
            style={{ background: `linear-gradient(135deg, ${G}, ${GM})` }}
          >
            Ingresar
          </button>
        </div>
      </nav>

      {/* ━━━ HERO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-36 overflow-hidden"
        style={{ background: SURFACE_GRADIENT }}
      >
        {/* Decoración */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)', transform: 'translate(25%, -30%)' }} />
        <div className="absolute bottom-32 left-0 w-80 h-80 rounded-full pointer-events-none opacity-[0.08]"
          style={{ background: 'radial-gradient(circle, #f57c00 0%, transparent 70%)', transform: 'translateX(-35%)' }} />
        <div className="absolute top-1/3 right-10 w-3 h-3 bg-white/20 rounded-full animate-float" />
        <div className="absolute top-1/2 left-14 w-2 h-2 bg-white/15 rounded-full animate-float" style={{ animationDelay: '1s' }} />

        {/* Logo */}
        <div className="animate-scaleIn">
          <div className="bg-white rounded-3xl p-6 shadow-2xl mb-8 inline-block animate-float" style={{ animationDuration: '5s' }}>
            <LogoMark size="2xl" className="mx-auto" />
            <p className="font-black text-2xl mt-3 tracking-tight">
              <span style={{ color: O }}>Rescate</span>
              <span style={{ color: G }}> Sabor</span>
            </p>
          </div>
        </div>

        {/* Copy */}
        <div className="animate-fadeUp delay-200 max-w-2xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-5">
            Rescata comida.<br />
            <span style={{ color: '#ffe0b2' }}>Reduce el desperdicio.</span>
          </h1>
          <p className="text-green-100/90 text-lg sm:text-xl font-light leading-relaxed mb-10 max-w-xl mx-auto">
            La plataforma que conecta negocios con excedente de comida
            y personas que quieren <strong className="text-white font-semibold">bolsas sorpresa a precio justo</strong>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onStart}
              className="animate-pulse-glow bg-white font-black text-lg px-10 py-4 rounded-2xl shadow-xl transition-all active:scale-95 hover:shadow-2xl"
              style={{ color: G }}
            >
              Comenzar gratis →
            </button>
            <a href="#negocios"
              className="border-2 border-white/40 text-white font-semibold text-lg px-8 py-4 rounded-2xl transition-all hover:bg-white/10 hover:border-white/60"
            >
              Soy un negocio
            </a>
          </div>
          <p className="mt-5 text-green-100/50 text-sm">Sin tarjeta de crédito · Registro en 30 segundos</p>
        </div>

        {/* Stats hero */}
        <div className="animate-fadeUp delay-500 flex flex-wrap justify-center gap-8 sm:gap-14 mt-16">
          {[
            { num: <Counter end={40} suffix="%" />, label: 'comida se desperdicia en Chile' },
            { num: <Counter end={70} suffix="%" />, label: 'de ahorro por bolsa' },
            { num: <Counter end={0} suffix="" prefix="" />, sub: 'CO₂', label: 'emisiones evitadas' },
          ].map(({ num, sub, label }, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl sm:text-4xl font-black text-white">{num}{sub && <span className="text-xl ml-1">{sub}</span>}</div>
              <div className="text-xs text-green-100/60 mt-1 max-w-[120px]">{label}</div>
            </div>
          ))}
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 100" className="w-full" preserveAspectRatio="none">
            <path d="M0 100 C240 40 480 80 720 35 C960 -10 1200 50 1440 20 L1440 100 Z" fill="#fafafa" />
          </svg>
        </div>
      </section>

      {/* ━━━ PROBLEMA / SOLUCIÓN ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <SectionObserver className="py-24 px-6" animClass="animate-fadeUp">
        <div className="max-w-5xl mx-auto">
          <Badge color={O} bg="#fff3e0">El problema</Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 text-center mb-6">
            Cada año se pierden <span style={{ color: O }}>3.7 millones de toneladas</span> de comida en Chile
          </h2>
          <p className="text-center text-gray-500 max-w-2xl mx-auto mb-14 text-lg leading-relaxed">
            Restaurantes, panaderías y tiendas tiran excedentes diariamente. Al mismo tiempo, familias buscan opciones accesibles y de calidad.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '🗑️', stat: '40%', desc: 'de la comida producida se desperdicia antes de llegar al consumidor' },
              { icon: '💸', stat: '$2.500M', desc: 'en pérdidas anuales para negocios de alimentos en Chile' },
              { icon: '🌍', stat: '8-10%', desc: 'de las emisiones de CO₂ globales vienen del desperdicio alimentario' },
            ].map(({ icon, stat, desc }) => (
              <div key={stat} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center hover:shadow-md transition-shadow">
                <div className="text-4xl mb-3">{icon}</div>
                <div className="text-2xl font-black text-gray-900 mb-2">{stat}</div>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionObserver>

      {/* ━━━ CÓMO FUNCIONA ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <SectionObserver id="como-funciona" className="py-24 px-6 bg-white" animClass="animate-fadeUp">
        <div className="max-w-5xl mx-auto">
          <Badge color={G} bg="#dcfce7">Cómo funciona</Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 text-center mb-4">Simple, rápido, con impacto</h2>
          <p className="text-center text-gray-500 mb-14">Tres pasos para rescatar comida y ahorrar.</p>

          <div className="grid md:grid-cols-3 gap-10 relative">
            {/* Línea conectora desktop */}
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5"
              style={{ background: `linear-gradient(90deg, ${G}30, ${O}30)` }} />

            {[
              { n: '1', icon: '🏪', title: 'El negocio publica', desc: 'El restaurante, panadería o tienda crea una bolsa sorpresa con el excedente del día a precio reducido.', color: G },
              { n: '2', icon: '📱', title: 'Tú reservas', desc: 'Abre la app, elige la bolsa que te guste y reserva en 30 segundos. Sin filas, sin complicaciones.', color: O },
              { n: '3', icon: '🎉', title: 'Retiras y disfrutas', desc: 'Pasa por el local en el horario indicado, muestra tu ticket digital y recoge tu bolsa sorpresa.', color: G },
            ].map(({ n, icon, title, desc, color }) => (
              <div key={n} className="text-center relative z-10">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-5 shadow-lg bg-white border border-gray-100">
                  {icon}
                </div>
                <div className="w-8 h-8 rounded-full text-white text-sm font-black flex items-center justify-center mx-auto -mt-3 mb-3 shadow-md" style={{ background: color }}>
                  {n}
                </div>
                <h3 className="font-black text-gray-900 text-lg mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">{desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-14">
            <button
              onClick={onStart}
              className="font-bold text-lg px-10 py-4 rounded-2xl text-white shadow-lg transition-all active:scale-95 hover:shadow-xl"
              style={{ background: CTA_GRADIENT }}
            >
              Probar ahora — es gratis
            </button>
          </div>
        </div>
      </SectionObserver>

      {/* ━━━ PARA NEGOCIOS (CORFO / Restaurantes) ━━━━━━━━━━━━ */}
      <SectionObserver id="negocios" className="py-24 px-6" style={{ background: '#f0fdf4' }} animClass="animate-fadeUp">
        <div className="max-w-5xl mx-auto">
          <Badge color={G} bg="#dcfce7">Para negocios</Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 text-center mb-4">
            Convierte excedentes en <span style={{ color: G }}>ingresos</span>
          </h2>
          <p className="text-center text-gray-500 max-w-2xl mx-auto mb-14 text-lg">
            Restaurantes, panaderías, cafeterías, supermercados — cualquier negocio de alimentos puede unirse.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Card negocio */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-green-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ background: '#dcfce7' }}>📈</div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">Beneficios comerciales</h3>
                  <p className="text-sm text-gray-400">ROI desde el primer día</p>
                </div>
              </div>
              <ul className="space-y-3">
                {[
                  'Recupera hasta 70% del valor de excedentes',
                  'Nuevos clientes descubren tu negocio',
                  'Dashboard con métricas en tiempo real',
                  'Gestión de reservas automatizada',
                  'Cero inversión — registro gratuito',
                  'Mejora tu reputación con RSE',
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-600">
                    <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: G }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <button onClick={onStart}
                className="mt-8 w-full py-4 rounded-xl text-white font-bold text-lg transition-all active:scale-95 hover:opacity-90 shadow-md"
                style={{ background: `linear-gradient(90deg, ${G}, ${GM})` }}>
                Registrar mi negocio →
              </button>
            </div>

            {/* Card compradores */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-orange-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ background: '#fff3e0' }}>🛍️</div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">Para compradores</h3>
                  <p className="text-sm text-gray-400">Come rico, gasta menos</p>
                </div>
              </div>
              <ul className="space-y-3">
                {[
                  'Bolsas sorpresa con 50-70% de descuento',
                  'Reserva en 30 segundos desde el móvil',
                  'Ticket digital actualizado en tiempo real',
                  'Variedad de locales y tipos de comida',
                  'Ayudas al planeta con cada compra',
                  'Descubre nuevos restaurantes y tiendas',
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-600">
                    <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: O }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <button onClick={onStart}
                className="mt-8 w-full py-4 rounded-xl text-white font-bold text-lg transition-all active:scale-95 hover:opacity-90 shadow-md"
                style={{ background: `linear-gradient(90deg, ${O}, #e65100)` }}>
                Crear mi cuenta →
              </button>
            </div>
          </div>

          {/* Tipos de negocio */}
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
            <h3 className="font-black text-gray-900 text-center text-lg mb-6">Ideal para todo tipo de negocios</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: '🍞', name: 'Panaderías' },
                { icon: '🍕', name: 'Restaurantes' },
                { icon: '☕', name: 'Cafeterías' },
                { icon: '🛒', name: 'Supermercados' },
                { icon: '🍣', name: 'Sushi & delivery' },
                { icon: '🥗', name: 'Comida saludable' },
                { icon: '🎂', name: 'Pastelerías' },
                { icon: '🥩', name: 'Carnicerías' },
              ].map(({ icon, name }) => (
                <div key={name} className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-4 py-3">
                  <span className="text-2xl">{icon}</span>
                  <span className="text-sm font-medium text-gray-700">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionObserver>

      {/* ━━━ IMPACTO / MÉTRICAS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <SectionObserver className="py-24 px-6 bg-white" animClass="animate-fadeUp">
        <div className="max-w-5xl mx-auto text-center">
          <Badge color={O} bg="#fff3e0">Impacto</Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-14">Cada bolsa hace la diferencia</h2>

          <div className="grid sm:grid-cols-4 gap-5">
            {[
              { icon: '🌱', value: <Counter end={100} suffix="%" />, label: 'Gratis para negocios', color: G },
              { icon: '💰', value: <Counter end={70} suffix="%" />, label: 'Ahorro promedio', color: O },
              { icon: '⚡', value: '30s', label: 'Tiempo de reserva', color: G },
              { icon: '📱', value: '24/7', label: 'Disponible siempre', color: O },
            ].map(({ icon, value, label, color }) => (
              <div key={label} className="rounded-2xl p-6 text-center border border-gray-100 shadow-sm hover:shadow-md transition-shadow bg-white">
                <div className="text-4xl mb-3">{icon}</div>
                <div className="text-2xl font-black mb-1" style={{ color }}>{value}</div>
                <div className="text-sm text-gray-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </SectionObserver>

      {/* ━━━ TESTIMONIOS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <SectionObserver className="py-24 px-6" style={{ background: '#f9fafb' }} animClass="animate-fadeUp">
        <div className="max-w-5xl mx-auto">
          <Badge color={G} bg="#dcfce7">Testimonios</Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 text-center mb-12">Lo que dicen nuestros usuarios</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'María G.', role: 'Compradora', text: 'Compro mi bolsa sorpresa cada viernes. Siempre viene llena de cosas ricas a un precio increíble. Ya no compro snacks en el supermercado.', avatar: '👩‍💼', stars: 5 },
              { name: 'Carlos R.', role: 'Panadería El Trigo', text: 'Antes tirábamos 20 kilos de pan cada noche. Ahora vendemos todo en bolsas sorpresa y recuperamos un ingreso que dábamos por perdido.', avatar: '👨‍🍳', stars: 5 },
              { name: 'Ana P.', role: 'Compradora', text: 'La app es súper fácil. Reservo en 30 segundos, paso a buscar y listo. Siento que hago algo bueno por el planeta cada vez que compro.', avatar: '👩', stars: 5 },
            ].map(({ name, role, text, avatar, stars }) => (
              <div key={name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl bg-gray-50">{avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 text-sm">{name}</div>
                    <div className="text-xs text-gray-400">{role}</div>
                  </div>
                  <div className="text-yellow-400 text-sm">{'★'.repeat(stars)}</div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed italic">"{text}"</p>
              </div>
            ))}
          </div>
        </div>
      </SectionObserver>

      {/* ━━━ RESPALDO CORFO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <SectionObserver className="py-20 px-6 bg-white" animClass="animate-fadeUp">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl p-8 sm:p-12 text-center border-2 border-dashed" style={{ borderColor: `${G}40`, background: `${G}05` }}>
            <div className="text-5xl mb-4">🇨🇱</div>
            <h3 className="text-2xl font-black text-gray-900 mb-3">Proyecto con impacto social</h3>
            <p className="text-gray-500 leading-relaxed max-w-xl mx-auto mb-6">
              Rescate Sabor nace con la misión de <strong className="text-gray-700">reducir el desperdicio alimentario en Chile</strong> conectando
              negocios y consumidores a través de tecnología. Alineado con los Objetivos de Desarrollo Sostenible de la ONU
              (ODS 2: Hambre Cero y ODS 12: Producción y Consumo Responsables).
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {['ODS 2 — Hambre Cero', 'ODS 12 — Consumo responsable', 'ODS 13 — Acción por el clima', 'Economía circular'].map(tag => (
                <span key={tag} className="text-xs font-bold px-4 py-2 rounded-full text-white" style={{ background: G }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </SectionObserver>

      {/* ━━━ CTA FINAL ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section
        className="py-28 px-6 text-center relative overflow-hidden"
        style={{ background: SURFACE_GRADIENT }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(255,255,255,0.06) 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-block mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-4 inline-block">
              <LogoMark size="xl" className="mx-auto" />
            </div>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 leading-tight">
            ¿Listo para rescatar sabor?
          </h2>
          <p className="text-green-100/80 text-lg sm:text-xl mb-10 leading-relaxed">
            Únete gratis. Sin complicaciones. Empieza a ahorrar y a reducir el desperdicio hoy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onStart}
              className="animate-pulse-glow bg-white font-black text-xl px-14 py-5 rounded-2xl shadow-2xl transition-all active:scale-95"
              style={{ color: G }}
            >
              Crear cuenta gratis
            </button>
            <button
              onClick={onStart}
              className="border-2 border-white/40 text-white font-bold text-xl px-10 py-5 rounded-2xl transition-all hover:bg-white/10"
            >
              Registrar mi negocio
            </button>
          </div>
          <p className="mt-6 text-green-100/40 text-sm">
            Más de 0 negocios ya confían en Rescate Sabor
          </p>
        </div>
      </section>

      {/* ━━━ FOOTER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <footer className="bg-gray-950 py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-2.5">
              <LogoMark size="xs" />
              <span className="font-black text-lg tracking-tight">
                <span style={{ color: O }}>Rescate</span>
                <span className="text-white"> Sabor</span>
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              <a href="#como-funciona" className="text-gray-400 hover:text-white text-sm transition">Cómo funciona</a>
              <a href="#negocios" className="text-gray-400 hover:text-white text-sm transition">Para negocios</a>
              <button onClick={onStart} className="text-sm font-bold transition" style={{ color: O }}>Ingresar →</button>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-gray-500 text-sm">Menos desperdicio. Más sabor.</p>
            <p className="text-gray-600 text-xs">© {new Date().getFullYear()} Rescate Sabor. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ─── Helper components ─── */
function Badge({ children, color, bg }) {
  return (
    <div className="text-center mb-4">
      <span className="inline-block text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full"
        style={{ color, background: bg }}>{children}</span>
    </div>
  )
}

function SectionObserver({ children, className = '', animClass, id, style }) {
  const [ref, visible] = useOnScreen()
  return (
    <section
      id={id}
      ref={ref}
      className={`${className} ${visible ? animClass : 'opacity-0'}`}
      style={{ ...style, transition: 'opacity 0.1s' }}
    >
      {children}
    </section>
  )
}
