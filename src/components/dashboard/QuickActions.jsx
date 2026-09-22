import { useDashboard } from '../../hooks/useDashboard'
import { Sparkles, Mail, CheckSquare, Calendar, MessageSquare } from 'lucide-react'

export default function QuickActions() {
  const { setActiveSection } = useDashboard()

  const actions = [
    { id: 'emails', label: 'Emails', icon: Mail, section: 'emails', color: '#DC2626' },
    { id: 'tasks', label: 'Taches', icon: CheckSquare, section: 'tasks', color: '#7F1D1D' },
    { id: 'calendar', label: 'Calendrier', icon: Calendar, section: 'calendar', color: '#E5E5E5' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, section: 'messages', color: '#A3A3A3' },
  ]

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>
      <div className="flex items-center gap-2 p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <Sparkles size={14} style={{ color: '#DC2626' }} />
        <h3 className="text-sm font-display font-medium">Actions rapides</h3>
      </div>
      <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        {actions.map((a) => (
          <button key={a.id} onClick={() => setActiveSection(a.section)}
            className="group relative flex flex-col items-center gap-2.5 p-5 md:p-6 rounded-xl transition-all duration-300 hover:scale-[1.03] hover:shadow-lg"
            style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110" style={{ background: `${a.color}15` }}>
              <a.icon size={18} style={{ color: a.color }} className="transition-transform duration-300 group-hover:scale-110" />
            </div>
            <span className="text-xs font-medium">{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
