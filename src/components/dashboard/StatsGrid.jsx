import { useDashboard } from '../../hooks/useDashboard'

const statCards = [
  { id: 'emails', label: 'Emails importants', icon: 'lucide:mail', key: 'unreadEmails' },
  { id: 'tasks', label: 'Tâches à faire', icon: 'lucide:check-square', key: 'pendingTasks' },
  { id: 'activity', label: "Activité aujourd'hui", icon: 'lucide:calendar', key: 'activity' },
  { id: 'totalTasks', label: 'Total tâches', icon: 'lucide:list', key: 'totalTasks' },
]

export default function StatsGrid() {
  const { stats } = useDashboard()
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((card) => {
        const value = stats[card.key]
        return (
          <div key={card.id} className="bg-surface border border-border p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="iconify text-accent" data-icon={card.icon} data-width="14"></span>
              <span className="text-xs text-muted">{card.label}</span>
            </div>
            <div className="text-xl font-semibold tracking-tight">{value}</div>
          </div>
        )
      })}
    </div>
  )
}
