import { useDashboard } from '../../hooks/useDashboard'

const statCards = [
  { id: 'emails', label: 'Emails importants', icon: 'lucide:mail', key: 'unreadEmails', trend: '+3', trendType: 'positive' },
  { id: 'tasks', label: 'Tâches à faire', icon: 'lucide:check-square', key: 'pendingTasks', trend: '-2', trendType: 'negative' },
  { id: 'events', label: 'Événements', icon: 'lucide:calendar', key: 'todayEvents', trend: '0', trendType: 'neutral' },
  { id: 'messages', label: 'Messages', icon: 'lucide:message-square', key: 'unreadMessages', trend: '+1', trendType: 'positive' }
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
            <div className={`text-xs mt-1 flex items-center gap-1 ${card.trendType === 'positive' ? 'text-success' : card.trendType === 'negative' ? 'text-accentSec' : 'text-muted'}`}>
              {card.trendType === 'positive' && <span className="iconify" data-icon="lucide:trending-up" data-width="10"></span>}
              {card.trend}
            </div>
          </div>
        )
      })}
    </div>
  )
}