import { useDashboard } from '../../hooks/useDashboard'
import { Mail, CheckSquare, Calendar, List } from 'lucide-react'

const statCards = [
  { id: 'emails', label: 'Emails importants', icon: Mail, key: 'unreadEmails', accent: '#2563EB' },
  { id: 'tasks', label: 'Taches en cours', icon: CheckSquare, key: 'pendingTasks', accent: '#2563EB' },
  { id: 'activity', label: "Activite aujourd'hui", icon: Calendar, key: 'activity', accent: '#10B981' },
  { id: 'totalTasks', label: 'Total taches', icon: List, key: 'totalTasks', accent: '#F59E0B' },
]

export default function StatsGrid() {
  const { stats } = useDashboard()
  const [first, ...rest] = statCards
  const firstValue = stats[first.key]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      <div className="col-span-2 lg:col-span-1 rounded-xl p-4 md:p-5 relative overflow-hidden"
        style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>
        <div className="absolute top-0 left-0 w-full h-[2px]" style={{ background: '#2563EB' }} />
        <div className="flex items-center gap-2 mb-2">
          <first.icon size={13} style={{ color: first.accent }} />
          <span className="text-[11px]" style={{ color: 'var(--color-muted)' }}>{first.label}</span>
        </div>
        <div className="text-3xl md:text-4xl font-display font-semibold tracking-tight leading-none">
          {firstValue ?? 0}
        </div>
      </div>

      {rest.map((card) => {
        const value = stats[card.key]
        return (
          <div key={card.id}
            className="rounded-xl p-4 md:p-5 transition-colors duration-200"
            style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>
            <div className="flex items-center gap-2 mb-2">
              <card.icon size={13} style={{ color: card.accent }} />
              <span className="text-[11px]" style={{ color: 'var(--color-muted)' }}>{card.label}</span>
            </div>
            <div className="text-2xl md:text-3xl font-display font-semibold tracking-tight leading-none">
              {value ?? 0}
            </div>
          </div>
        )
      })}
    </div>
  )
}
