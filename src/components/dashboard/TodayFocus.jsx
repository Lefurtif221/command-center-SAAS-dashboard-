import { useDashboard } from '../../hooks/useDashboard'

const pCfg = { high: { label: 'Haute priorité', border: 'border-accentSec' }, medium: { label: 'Moyenne priorité', border: 'border-warning' }, low: { label: 'Basse priorité', border: 'border-success' } }

export default function TodayFocus() {
  const { events, tasks } = useDashboard()
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  const items = [...events.slice(0, 2).map(e => ({ id: e.id, title: e.title, time: e.time, type: 'event', priority: 'high' })), ...tasks.filter(t => !t.completed).slice(0, 2).map(t => ({ id: t.id, title: t.title, time: t.dueDate, type: 'task', priority: t.priority }))].slice(0, 3)

  return (
    <div className="bg-surface border border-border rounded-lg">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="iconify text-accent" data-icon="lucide:target" data-width="14"></span>
          <h3 className="text-sm font-medium">Focus du jour</h3>
        </div>
        <span className="text-[10px] text-muted capitalize">{today}</span>
      </div>
      <div className="p-4 space-y-3">
        {items.map((item) => {
          const c = pCfg[item.priority]
          return (
            <div key={item.id} className={`p-3 bg-bg rounded-lg border-l-2 ${c.border} border border-border`}>
              <p className="text-[10px] text-muted mb-1">{c.label}</p>
              <p className="text-sm font-medium">{item.title}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-muted">{item.time}</span>
                <button className="text-[10px] text-muted hover:text-text transition-colors">{item.type === 'event' ? 'Préparer' : 'Commencer'}</button>
              </div>
            </div>
          )
        })}
        {items.length === 0 && <div className="py-6 text-center"><p className="text-xs text-muted">Rien de prévu pour aujourd'hui</p></div>}
      </div>
    </div>
  )
}