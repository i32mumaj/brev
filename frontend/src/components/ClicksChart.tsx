import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatDay, formatNumber } from '../lib/format'
import type { DailyClicks } from '../types/link'

interface ClicksChartProps {
  data: DailyClicks[]
}

export function ClicksChart({ data }: ClicksChartProps) {
  const total = data.reduce((sum, day) => sum + day.count, 0)

  return (
    <div className="clicks-chart" role="img" aria-label={`${total} clics en los últimos ${data.length} días`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDay}
            tickLine={false}
            axisLine={false}
            minTickGap={24}
            tickMargin={8}
          />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={48} />
          <Tooltip
            content={({ active, payload }) => {
              const day = payload?.[0]?.payload as DailyClicks | undefined
              if (!active || !day) return null
              return (
                <div className="chart-tooltip">
                  <span className="chart-tooltip__day mono">{formatDay(day.date)}</span>
                  <span>
                    {formatNumber(day.count)} {day.count === 1 ? 'clic' : 'clics'}
                  </span>
                </div>
              )
            }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={18} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
