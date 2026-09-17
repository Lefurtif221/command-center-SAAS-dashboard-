import { useDashboard } from '../../hooks/useDashboard'

export default function QuickActions() {
  const { setActiveSection } = useDashboard()

  const actions = [
    { id: 'emails', label: 'Voir les emails', icon: 'lucide:mail', section: 'emails' },
    { id: 'tasks', label: 'Nouvelle tâche', icon: 'lucide:check-square', section: 'tasks' },
    { id: 'calendar', label: 'Calendrier', icon: 'lucide:calendar', section: 'calendar' },
    { id: 'messages', label: 'Messages', icon: 'lucide:message-square', section: 'messages' },
  ]

  return (
    <div className="glass rounded-xl" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>
      <div className="flex items-center gap-2 p-4 border-b border-border/50">
        <span className="iconify text-accent" data-icon="lucide:sparkles" data-width="14"></span>
        <h3 className="text-sm font-display font-medium">Actions rapides</h3>
      </div>
      <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        {actions.map((a) => (
          <button key={a.id} onClick={() => setActiveSection(a.section)}
            className="glass flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-accent/5 hover:border-accent/30 transition-all duration-200 group gradient-border" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>
            <span className="iconify text-muted group-hover:text-accent transition-colors" data-icon={a.icon} data-width="20"></span>
            <span className="text-xs font-medium">{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
