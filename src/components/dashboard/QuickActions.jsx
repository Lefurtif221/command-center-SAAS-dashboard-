import { useDashboard } from '../../hooks/useDashboard'

export default function QuickActions() {
  const { setActiveSection } = useDashboard()

  const actions = [
    { id: 'emails', label: 'Voir les emails', icon: 'lucide:mail', section: 'emails' },
    { id: 'tasks', label: 'Nouvelle tâche', icon: 'lucide:check-square', section: 'tasks' },
    { id: 'calendar', label: 'Calendrier', icon: 'lucide:calendar', section: 'calendar' },
    { id: 'investments', label: 'Investissements', icon: 'lucide:trending-up', section: 'investments' },
  ]

  return (
    <div className="bg-surface border border-border rounded-lg">
      <div className="flex items-center gap-2 p-4 border-b border-border">
        <span className="iconify text-accent" data-icon="lucide:zap" data-width="14"></span>
        <h3 className="text-sm font-medium">Actions rapides</h3>
      </div>
      <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        {actions.map((a) => (
          <button key={a.id} onClick={() => setActiveSection(a.section)}
            className="flex flex-col items-center gap-2 p-4 bg-bg border border-border rounded-lg hover:border-accent/30 hover:bg-accent/5 transition-all group">
            <span className="iconify text-muted group-hover:text-accent transition-colors" data-icon={a.icon} data-width="20"></span>
            <span className="text-xs font-medium">{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
