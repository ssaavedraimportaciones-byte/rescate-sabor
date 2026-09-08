/**
 * Logo de marca — punto único de verdad.
 *
 * El SVG del logo es cuadrado (512x512). Antes cada pantalla lo metía en una caja
 * con proporción distinta e inventada (w-16 h-12, w-36 h-28, w-10 h-9...), lo que
 * lo dejaba descuadrado y de tamaño inconsistente en toda la app. Aquí la caja es
 * siempre cuadrada y el tamaño sale de una escala fija.
 */

const SIZES = { xs: 28, sm: 36, md: 44, lg: 64, xl: 104, '2xl': 136 }

export function LogoMark({ size = 'md', className = '' }) {
  const px = SIZES[size] ?? SIZES.md
  return (
    <img
      src="/logo.svg"
      alt="Rescate Sabor"
      width={px}
      height={px}
      style={{ width: px, height: px }}
      className={`shrink-0 select-none ${className}`}
      draggable="false"
    />
  )
}

/** Marca + tipografía. `tone="light"` para fondos oscuros. */
export default function Logo({ size = 'md', tone = 'dark', tagline = false, className = '' }) {
  const px = SIZES[size] ?? SIZES.md
  const titleSize =
    px >= 104 ? 'text-3xl' : px >= 64 ? 'text-2xl' : px >= 44 ? 'text-xl' : 'text-base'

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />
      <div className="leading-none">
        <p className={`font-black tracking-tight ${titleSize}`}>
          <span style={{ color: tone === 'light' ? '#ffe0b2' : '#f57c00' }}>Rescate</span>
          <span style={{ color: tone === 'light' ? '#ffffff' : '#1b7a30' }}> Sabor</span>
        </p>
        {tagline && (
          <p
            className="text-[11px] mt-1 font-medium tracking-wide"
            style={{ color: tone === 'light' ? 'rgba(255,255,255,0.75)' : '#6b7280' }}
          >
            Menos desperdicio. Más sabor.
          </p>
        )}
      </div>
    </div>
  )
}
