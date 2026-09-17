// Escala del meter de clics de la vista de detalle. El backend sólo da el total
// de clics (sin fecha por clic), así que en vez de una serie temporal se pinta un
// único valor cuyo tamaño y color escalan con la magnitud.
import type { Theme } from '../types/theme'

// Tope de la escala: pensado para el volumen de este proyecto (el seed de ejemplo
// llega hasta ~50 clics por enlace). Por encima del tope la barra queda al máximo.
export const CLICKS_SCALE_CAP = 100

// Rampa secuencial de un solo hue — el mismo que --accent — variando sólo
// luminosidad y croma. El ancla "baja" se funde con la superficie del tema; la
// "alta" es el acento real, así que más clics siempre se ve más saturado y vivo.
const RAMPS: Record<Theme, { hue: number; low: [number, number]; high: [number, number] }> = {
  dark: { hue: 165, low: [0.32, 0.03], high: [0.78, 0.145] },
  light: { hue: 165, low: [0.9, 0.02], high: [0.52, 0.15] },
}

const TRACK_COLOR: Record<Theme, string> = {
  dark: 'oklch(0.27 0.02 165)',
  light: 'oklch(0.94 0.015 165)',
}

export function clicksRatio(clicks: number): number {
  return Math.max(0, Math.min(1, clicks / CLICKS_SCALE_CAP))
}

export function clicksFillColor(theme: Theme, ratio: number): string {
  const { hue, low, high } = RAMPS[theme]
  const l = low[0] + (high[0] - low[0]) * ratio
  const c = low[1] + (high[1] - low[1]) * ratio
  return `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${hue})`
}

export function clicksTrackColor(theme: Theme): string {
  return TRACK_COLOR[theme]
}
