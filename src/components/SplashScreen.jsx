import { useEffect, useState } from 'react'

export default function SplashScreen() {
  const [phase, setPhase] = useState(0) // 0=hidden 1=visible 2=loaded
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 80)
    const t2 = setTimeout(() => setPhase(2), 2200)

    let p = 0
    const id = setInterval(() => {
      p += Math.random() * 18
      if (p >= 100) { p = 100; clearInterval(id) }
      setProgress(Math.round(p))
    }, 120)

    return () => { clearTimeout(t1); clearTimeout(t2); clearInterval(id) }
  }, [])

  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center select-none"
      style={{ background: 'linear-gradient(155deg, #0d5c1f 0%, #1b7a30 25%, #2d9d47 55%, #f57c00 100%)' }}
    >
      {/* Decoración */}
      <div className="absolute -top-32 -right-32 w-[28rem] h-[28rem] rounded-full pointer-events-none opacity-[0.05]"
        style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)' }} />
      <div className="absolute -bottom-20 -left-16 w-80 h-80 rounded-full pointer-events-none opacity-[0.06]"
        style={{ background: 'radial-gradient(circle, #f57c00 0%, transparent 70%)' }} />
      <div className="absolute top-1/4 left-10 w-2 h-2 bg-white/20 rounded-full animate-pulse" />
      <div className="absolute top-2/3 right-16 w-3 h-3 bg-white/15 rounded-full animate-pulse" style={{ animationDelay: '0.8s' }} />

      {/* Contenido principal */}
      <div
        className="relative z-10 text-white text-center px-8 flex flex-col items-center transition-all duration-700 ease-out"
        style={{
          opacity: phase >= 1 ? 1 : 0,
          transform: phase >= 1 ? 'translateY(0)' : 'translateY(24px)',
        }}
      >
        {/* Logo card */}
        <div className="bg-white rounded-3xl px-8 py-6 shadow-2xl mb-7"
          style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.1)' }}>
          <img src="/logo.svg" alt="Rescate Sabor" className="w-44 h-36 mx-auto" />
          <p className="font-black text-2xl mt-3 tracking-tight text-center leading-tight">
            <span style={{ color: '#f57c00' }}>Rescate</span>
            <span style={{ color: '#1b7a30' }}> Sabor</span>
          </p>
        </div>

        {/* Tagline */}
        <p className="text-2xl font-light text-green-100/90 leading-snug">
          Menos desperdicio.
        </p>
        <p className="text-2xl font-black text-white mb-3">
          Más sabor.
        </p>
        <p className="text-sm text-green-100/60 max-w-[260px] leading-relaxed">
          Bolsas sorpresa de comida local a precio justo.
        </p>

        {/* Iconos */}
        <div className="flex gap-10 mt-7">
          {[
            { icon: '🏪', label: 'Tiendas' },
            { icon: '🥡', label: 'Bolsas' },
            { icon: '🌱', label: 'Planeta' },
          ].map(({ icon, label }, i) => (
            <div key={label} className="flex flex-col items-center gap-1.5 transition-all duration-500"
              style={{ opacity: phase >= 1 ? 1 : 0, transitionDelay: `${0.3 + i * 0.15}s` }}>
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-2xl">
                {icon}
              </div>
              <span className="text-[11px] text-green-100/70 font-medium">{label}</span>
            </div>
          ))}
        </div>

        {/* Barra de progreso */}
        <div className="mt-10 w-48">
          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-150"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, rgba(255,255,255,0.6), #fff)',
              }}
            />
          </div>
          <p className="text-center text-white/30 text-xs mt-2">
            {progress < 100 ? 'Cargando...' : '¡Listo!'}
          </p>
        </div>
      </div>

      {/* Ola inferior */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg viewBox="0 0 1440 80" className="w-full" preserveAspectRatio="none">
          <path d="M0 80 C360 30 720 60 1080 20 C1260 0 1380 40 1440 15 L1440 80 Z"
            fill="rgba(255,255,255,0.05)" />
          <path d="M0 80 C480 50 960 70 1440 35 L1440 80 Z"
            fill="rgba(255,255,255,0.03)" />
        </svg>
      </div>
    </div>
  )
}
