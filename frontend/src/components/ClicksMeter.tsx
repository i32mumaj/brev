import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import type { Theme } from '../types/theme'
import { CLICKS_SCALE_CAP, clicksFillColor, clicksRatio, clicksTrackColor } from '../lib/clicksScale'

interface ClicksMeterProps {
  clicks: number
  theme: Theme
}

const THICKNESS = 20

// Un solo valor, sin serie temporal (el backend no la expone): una barra cuyo
// ancho y color escalan con el número de clics, sobre un carril del mismo hue.
// El contenedor recorta a pastilla con CSS — más simple y fiable que perseguir
// las esquinas redondeadas dentro del shape interno de recharts.
export function ClicksMeter({ clicks, theme }: ClicksMeterProps) {
  const ratio = clicksRatio(clicks)
  const data = [{ name: 'clicks', value: clicks }]

  return (
    <div
      className="clicks-meter"
      style={{ height: THICKNESS, borderRadius: THICKNESS / 2, overflow: 'hidden' }}
      role="img"
      aria-label={`${clicks} clics sobre una escala de ${CLICKS_SCALE_CAP}`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <XAxis type="number" domain={[0, CLICKS_SCALE_CAP]} hide />
          <YAxis type="category" dataKey="name" hide />
          <Bar
            dataKey="value"
            fill={clicksFillColor(theme, ratio)}
            background={{ fill: clicksTrackColor(theme) }}
            barSize={THICKNESS}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
