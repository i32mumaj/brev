interface StatCardProps {
  label: string
  value: string
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="stat-card">
      <span className="stat-card__label mono">{label}</span>
      <span className="stat-card__value">{value}</span>
    </div>
  )
}
