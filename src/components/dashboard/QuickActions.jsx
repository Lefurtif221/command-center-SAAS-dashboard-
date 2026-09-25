import { useDashboard } from '../../hooks/useDashboard'
import { Mail, CheckSquare, Calendar, MessageSquare } from 'lucide-react'

export default function QuickActions() {
  const { setActiveSection } = useDashboard()

  const actions = [
    { id: 'emails', label: 'Emails', icon: Mail, section: 'emails' },
    { id: 'tasks', label: 'Taches', icon: CheckSquare, section: 'tasks' },
    { id: 'calendar', label: 'Calendrier', icon: Calendar, section: 'calendar' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, section: 'messages' },
  ]

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>
      <div className="px-4 pt-4 pb-2">
        <h3 className="text-sm font-display font-medium">Actions rapides</h3>
      </div>
      <div className="px-4 pb-4 grid grid-cols-2 md:grid-cols-4 gap-2">
        {actions.map((a) => (
          <button key={a.id} onClick={() => setActiveSection(a.section)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors duration-150 text-left"
            style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
            <a.icon size={15} style={{ color: 'var(--color-muted)' }} />
            <span className="text-xs font-medium">{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
