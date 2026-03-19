export default function LandingPage({ onStart }) {
  return (
    <div className="min-h-screen font-sans" style={{ background: '#f9fafb' }}>

      {/* HERO */}
      <section
        className="relative overflow-hidden flex flex-col items-center justify-center text-center px-6 py-24 min-h-screen"
        style={{ background: 'linear-gradient(150deg, #1b7a30 0%, #2d9d47 40%, #f57c00 100%)' }}
      >
        {/* Decoración */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #f57c00 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

        {/* Logo */}
        <div className="relative z-10 bg-white rounded-3xl p-5 shadow-2xl mb-6">
          <img src="/logo.svg" alt="Rescate Sabor" className="w-32 h-24 mx-auto" />
          <p className="font-black text-2xl mt-2 leading-tight">
            <span style={{ color: '#f57c00' }}>Rescate</span>
            <span style={{ color: '#1b7a30' }}> Sabor</span>
          </p>
        </div>

        {/* Headline */}
        <div className="relative z-10 text-white max-w-lg">
          <h1 className="text-4xl font-black leading-tight mb-3">
            Menos desperdicio.<br />
            <span style={{ color: '#ffe0b2' }}>Más sabor.</span>
          </h1>
          <p className="text-green-100 text-lg font-light mb-8 leading-relaxed">
            Conectamos tiendas con excedente de comida y compradores que quieren bolsas sorpresa a precio justo.
          </p>

          {/* CTA */}
          <button
            onClick={onStart}
            className="bg-white font-bold text-lg px-10 py-4 rounded-2xl shadow-xl transition-all active:scale-95 hover:shadow-2xl"
            style={{ color: '#1b7a30' }}
          >
            Empezar ahora →
          </button>
          <p className="mt-4 text-green-100 text-sm opacity-75">
            Gratis · Sin tarjeta de crédito
          </p>
        </div>

        {/* Stats */}
        <div className="relative z-10 flex gap-10 mt-14">
          {[
            { num: '40%', label: 'comida desperdiciada' },
            { num: '50-70%', label: 'de descuento' },
            { num: '🌱', label: 'impacto positivo' },
          ].map(({ num, label }) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-black text-white">{num}</div>
              <div className="text-xs text-green-100 opacity-75 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Olas */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 80" className="w-full" preserveAspectRatio="none">
            <path d="M0 80 C360 30 720 60 1080 20 L1440 0 L1440 80 Z" fill="#f9fafb" />
          </svg>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <h2 className="text-3xl font-black text-center text-gray-900 mb-2">¿Cómo funciona?</h2>
        <p className="text-center text-gray-500 mb-12">Tres pasos, mucho impacto.</p>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: '1', icon: '🏪', title: 'Tienda publica', desc: 'El vendedor crea su bolsa sorpresa con el excedente del día a precio reducido.' },
            { step: '2', icon: '🥡', title: 'Tú reservas', desc: 'Elige la bolsa que quieres, reserva en segundos desde tu teléfono.' },
            { step: '3', icon: '✅', title: 'Retiras y disfrutas', desc: 'Pasa por la tienda en el horario acordado y recoge tu bolsa sorpresa.' },
          ].map(({ step, icon, title, desc }) => (
            <div key={step} className="text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-md"
                style={{ background: 'linear-gradient(135deg, #e8f5e9, #fff3e0)' }}
              >
                {icon}
              </div>
              <div className="inline-flex items-center gap-2 mb-2">
                <span
                  className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center"
                  style={{ background: '#f57c00' }}
                >{step}</span>
                <h3 className="font-bold text-gray-900">{title}</h3>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PARA QUIEN */}
      <section className="py-16 px-6" style={{ background: '#f0fdf4' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-center text-gray-900 mb-10">Para todos</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Compradores */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-green-100">
              <div className="text-4xl mb-4">🛍️</div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Compradores</h3>
              <p className="text-gray-500 text-sm mb-5">Come rico, gasta menos y ayuda al planeta.</p>
              <ul className="space-y-2">
                {['Bolsas sorpresa 50-70% más baratas', 'Reserva en segundos', 'Ticket digital en tiempo real', 'Variedad de tiendas locales'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                    <span style={{ color: '#1b7a30' }}>✓</span> {item}
                  </li>
                ))}
              </ul>
              <button onClick={onStart}
                className="mt-6 w-full py-3 rounded-xl text-white font-semibold transition-all active:scale-95"
                style={{ background: 'linear-gradient(90deg, #1b7a30, #2d9d47)' }}>
                Soy comprador →
              </button>
            </div>

            {/* Vendedores */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-orange-100">
              <div className="text-4xl mb-4">🏪</div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Vendedores</h3>
              <p className="text-gray-500 text-sm mb-5">Convierte excedentes en ingresos extra.</p>
              <ul className="space-y-2">
                {['Recupera valor de excedentes', 'Gestión de reservas en tiempo real', 'Dashboard sencillo e intuitivo', 'Visibilidad entre clientes nuevos'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                    <span style={{ color: '#f57c00' }}>✓</span> {item}
                  </li>
                ))}
              </ul>
              <button onClick={onStart}
                className="mt-6 w-full py-3 rounded-xl text-white font-semibold transition-all active:scale-95"
                style={{ background: 'linear-gradient(90deg, #f57c00, #e65100)' }}>
                Soy vendedor →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section
        className="py-20 px-6 text-center"
        style={{ background: 'linear-gradient(135deg, #1b7a30 0%, #f57c00 100%)' }}
      >
        <h2 className="text-3xl font-black text-white mb-3">¿Listo para rescatar sabor?</h2>
        <p className="text-green-100 mb-8 text-lg">Únete gratis hoy.</p>
        <button
          onClick={onStart}
          className="bg-white font-bold text-lg px-12 py-4 rounded-2xl shadow-xl transition-all active:scale-95"
          style={{ color: '#1b7a30' }}
        >
          Crear cuenta gratis
        </button>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-6 text-center bg-gray-900">
        <p className="font-black text-lg">
          <span style={{ color: '#f57c00' }}>Rescate</span>
          <span className="text-white"> Sabor</span>
        </p>
        <p className="text-gray-500 text-sm mt-1">Menos desperdicio. Más sabor. 🌱</p>
      </footer>

    </div>
  )
}
