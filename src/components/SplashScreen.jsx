import { LogoMark } from './Logo'
import { useEffect, useState } from 'react'

export default function SplashScreen() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'white', flexDirection: 'column', gap: '24px' }}>
      <div className={`flex flex-col items-center gap-6 transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <LogoMark size="2xl" />

        <div className="text-center">
          <p className="text-gray-800 font-semibold text-lg">Rescate Sabor</p>
          <p className="text-gray-500 text-sm mt-1">Menos desperdicio. Más sabor.</p>
        </div>

        <div className="flex space-x-2">
          {[0, 180, 360].map((delay) => (
            <div
              key={delay}
              className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
