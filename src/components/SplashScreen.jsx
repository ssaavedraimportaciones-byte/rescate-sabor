import { useEffect, useState } from 'react'

export default function SplashScreen() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(150deg, #f97316 0%, #ea580c 45%, #b91c1c 100%)' }}
    >
      {/* Círculos decorativos de fondo */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white opacity-[0.04]" />
      <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-white opacity-[0.04]" />
      <div className="absolute top-1/4 -left-10 w-48 h-48 rounded-full bg-orange-300 opacity-10" />
      <div className="absolute bottom-1/3 -right-8 w-36 h-36 rounded-full bg-red-300 opacity-10" />

      {/* Contenido principal */}
      <div
        className={`relative z-10 text-white text-center px-8 flex flex-col items-center transition-all duration-700 ease-out ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        {/* Logo grande */}
        <div className="mb-6">
          <img
            src="/logo.svg"
            alt="Rescate Sabor"
            className="w-44 h-44 drop-shadow-2xl"
            style={{ filter: 'drop-shadow(0 12px 28px rgba(0,0,0,0.35))' }}
          />
        </div>

        {/* Nombre de la app */}
        <h1 className="text-6xl font-black tracking-tight leading-none drop-shadow-lg">
          RESCATE
        </h1>
        <h2
          className="text-5xl font-black tracking-widest leading-none mt-1"
          style={{ color: '#fde68a', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }}
        >
          SABOR
        </h2>

        {/* Separador con ícono */}
        <div className="flex items-center gap-3 my-5">
          <div className="h-px w-16 bg-orange-200 opacity-50" />
          <span className="text-2xl">🌿</span>
          <div className="h-px w-16 bg-orange-200 opacity-50" />
        </div>

        {/* Tagline principal */}
        <p className="text-xl font-light text-orange-100 tracking-wide">
          Menos desperdicio.
        </p>
        <p className="text-xl font-semibold text-white tracking-wide">
          Más sabor.
        </p>

        {/* Descripción corta */}
        <p className="mt-4 text-sm text-orange-200 opacity-80 max-w-xs leading-relaxed text-center">
          Conectamos tiendas con excedente de comida con compradores que quieren bolsas sorpresa a precio justo.
        </p>

        {/* Íconos de propuesta de valor */}
        <div className="flex gap-6 mt-6 text-center">
          {[
            { icon: '🏪', label: 'Tiendas' },
            { icon: '🥡', label: 'Bolsas' },
            { icon: '💚', label: 'Planeta' },
          ].map(({ icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1 opacity-90">
              <span className="text-2xl">{icon}</span>
              <span className="text-xs text-orange-100 tracking-wide">{label}</span>
            </div>
          ))}
        </div>

        {/* Puntos de carga */}
        <div className="flex space-x-2 mt-10">
          {[0, 180, 360].map((delay) => (
            <div
              key={delay}
              className="w-2.5 h-2.5 bg-white rounded-full animate-bounce"
              style={{ animationDelay: `${delay}ms`, opacity: 0.85 }}
            />
          ))}
        </div>
      </div>

      {/* Olas decorativas en la parte inferior */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg viewBox="0 0 400 70" className="w-full" preserveAspectRatio="none">
          <path d="M0 70 C80 30 200 55 400 10 L400 70 Z" fill="rgba(255,255,255,0.06)" />
          <path d="M0 70 C140 40 280 60 400 25 L400 70 Z" fill="rgba(255,255,255,0.04)" />
        </svg>
      </div>
    </div>
  )
}
