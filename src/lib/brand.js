/**
 * Tokens de marca — Rescate Sabor
 *
 * Regla de color: el VERDE es la marca (superficies, fondos) y el NARANJA es la
 * acción (botones, acentos). Nunca se interpola verde -> naranja en un mismo
 * degradado: en sRGB ese recorrido pasa por un oliva/mostaza apagado que ensucia
 * toda la pantalla. Cada degradado se queda dentro de su propia familia.
 */

export const BRAND = {
  greenDeep:  '#0b4a24',
  greenDark:  '#14612a',
  green:      '#1b7a30',
  greenMid:   '#2d9d47',
  greenLight: '#4ade80',
  orange:     '#f57c00',
  orangeLight:'#ff9800',
  cream:      '#ffe0b2',
}

/** Fondo de pantalla completo (hero, portales de auth). */
export const SURFACE_GRADIENT =
  'linear-gradient(155deg, #0b4a24 0%, #14612a 38%, #1b7a30 72%, #2d9d47 100%)'

/** Cabecera de tarjeta / banda de marca. */
export const HEADER_GRADIENT =
  'linear-gradient(135deg, #14612a 0%, #1b7a30 55%, #2d9d47 100%)'

/** Botón principal y acentos de acción. */
export const CTA_GRADIENT =
  'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)'
