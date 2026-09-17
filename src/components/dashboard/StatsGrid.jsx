import { useDashboard } from '../../hooks/useDashboard'
import { Mail, CheckSquare, Calendar, List } from 'lucide-react'

const statCards = [
  { id: 'emails', label: 'Emails importants', icon: Mail, key: 'unreadEmails' },
  { id: 'tasks', label: 'Tâches à faire', icon: CheckSquare, key: 'pendingTasks' },
  { id: 'activity', label: "Activité aujourd'hui", icon: Calendar, key: 'activity' },
  { id: 'totalTasks', label: 'Total tâches', icon: List, key: 'totalTasks' },
]

export default function StatsGrid() {
  const { stats } = useDashboard()
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((card) => {
        const value = stats[card.key]
        return (
          <div key={card.id} className="glass rounded-xl p-4 gradient-border group hover:bg-accent/5 transition-all duration-200" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>
            <div className="flex items-center gap-2 mb-2">
              <card.icon size={14} className="text-accent" />
              <span className="text-xs text-muted font-mono">{card.label}</span>
            </div>
            <div className="text-xl font-display font-semibold tracking-tight">{value}</div>
          </div>
        )
      })}
    </div>
  )
}
