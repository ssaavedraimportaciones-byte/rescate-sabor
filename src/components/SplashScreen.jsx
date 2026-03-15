import { useEffect, useState } from 'react'

export default function SplashScreen() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center select-none"
      style={{ background: 'linear-gradient(150deg, #f97316 0%, #ea580c 45%, #b91c1c 100%)' }}
    >
      {/* Decoración de fondo */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white opacity-[0.04]" />
      <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-white opacity-[0.04]" />
      <div className="absolute top-1/4 -left-10 w-48 h-48 rounded-full bg-orange-300 opacity-10" />
      <div className="absolute bottom-1/3 -right-8 w-36 h-36 rounded-full bg-red-300 opacity-10" />

      {/* Contenido */}
      <div
        className={`relative z-10 text-white text-center px-6 flex flex-col items-center transition-all duration-700 ease-out ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        {/* Logo prominente */}
        <img
          src="/logo.svg"
          alt="Rescate Sabor"
          className="w-52 h-52 mb-5"
          style={{ filter: 'drop-shadow(0 16px 32px rgba(0,0,0,0.4))' }}
        />

        {/* Título */}
        <h1 className="text-6xl font-black tracking-tight leading-none drop-shadow-lg">
          RESCATE
        </h1>
        <h2
          className="text-5xl font-black tracking-widest leading-none mt-1 drop-shadow-lg"
          style={{ color: '#fde68a' }}
        >
          SABOR
        </h2>

        {/* Separador */}
        <div className="flex items-center gap-3 my-4">
          <div className="h-px w-14 bg-white opacity-40" />
          <span className="text-xl opacity-80">🌿</span>
          <div className="h-px w-14 bg-white opacity-40" />
        </div>

        {/* Tagline */}
        <p className="text-xl text-orange-100 font-light">Menos desperdicio.</p>
        <p className="text-xl text-white font-semibold">Más sabor.</p>

        {/* Descripción */}
        <p className="mt-4 text-sm text-orange-200 opacity-75 max-w-[280px] leading-relaxed">
          Bolsas sorpresa de comida de tiendas locales a precio justo.
        </p>

        {/* Iconos de valor */}
        <div className="flex gap-8 mt-5">
          {[
            { icon: '🏪', label: 'Tiendas' },
            { icon: '🥡', label: 'Bolsas' },
            { icon: '💚', label: 'Planeta' },
          ].map(({ icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <span className="text-2xl">{icon}</span>
              <span className="text-[11px] text-orange-100 opacity-80">{label}</span>
            </div>
          ))}
        </div>

        {/* Carga */}
        <div className="flex space-x-2 mt-10">
          {[0, 180, 360].map((delay) => (
            <div
              key={delay}
              className="w-2 h-2 bg-white rounded-full animate-bounce opacity-80"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      </div>

      {/* Olas en el pie */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg viewBox="0 0 400 70" className="w-full" preserveAspectRatio="none">
          <path d="M0 70 C80 30 200 55 400 10 L400 70 Z" fill="rgba(255,255,255,0.06)" />
          <path d="M0 70 C140 40 280 60 400 25 L400 70 Z" fill="rgba(255,255,255,0.04)" />
        </svg>
      </div>
    </div>
  )
}
