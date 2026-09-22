import { useState } from 'react'
import { useDashboard } from '../../hooks/useDashboard'
import { Target, CheckCircle, Calendar, ChevronDown, ChevronUp } from 'lucide-react'

const pCfg = {
  high: { label: 'Urgent', color: '#2563EB' },
  medium: { label: 'Moyen', color: '#A3A3A3' },
  low: { label: 'Faible', color: '#525252' }
}
const colorMap = { red: '#2563EB', gray: '#A3A3A3', dark: '#1E40AF', light: '#E5E5E5', white: '#F5F5F5' }

export default function TodayFocus() {
  const { tasks, events, toggleTask } = useDashboard()
  const [showAllOverdue, setShowAllOverdue] = useState(false)
  const today = new Date().toLocaleDateString('sv-SE')
  const todayLabel = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

  const todayTasks = tasks.filter(t => !t.completed && t.due_date === today)
  const allOverdueTasks = tasks.filter(t => !t.completed && t.due_date && t.due_date < today)
  const overdueTasks = showAllOverdue ? allOverdueTasks : allOverdueTasks.slice(0, 3)
  const todayEvents = events.filter(e => e.date === today).sort((a, b) => (a.hour || '').localeCompare(b.hour || ''))

  const isEmpty = todayTasks.length === 0 && allOverdueTasks.length === 0 && todayEvents.length === 0

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(37,99,235,0.1)' }}>
            <Target size={14} style={{ color: '#2563EB' }} />
          </div>
          <h3 className="text-sm font-display font-medium">Focus du jour</h3>
        </div>
        <span className="text-[10px] font-mono" style={{ color: 'var(--color-muted)' }}>{todayLabel}</span>
      </div>
      <div className="p-4 space-y-4">
        {isEmpty && (
          <div className="py-8 text-center">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: 'rgba(229,229,229,0.1)' }}>
              <CheckCircle size={24} style={{ color: '#E5E5E5' }} />
            </div>
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Tout est fait pour aujourd'hui !</p>
          </div>
        )}

        {overdueTasks.length > 0 && (
          <div>
            <p className="text-[10px] font-mono font-medium uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: '#2563EB' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#2563EB' }} />
              En retard ({allOverdueTasks.length})
            </p>
            <div className="space-y-2">
              {overdueTasks.map((task) => {
                const c = pCfg[task.priority] || pCfg.medium
                return (
                  <div key={task.id} className="group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-white/5"
                    style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                    <button onClick={() => toggleTask(task.id, task.completed)}
                      className="w-5 h-5 rounded-lg border flex-shrink-0 transition-all duration-200 flex items-center justify-center hover:scale-110"
                      style={{ borderColor: 'var(--color-border)' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{task.title}</p>
                      <p className="text-[10px] font-mono" style={{ color: '#2563EB' }}>{task.due_date}</p>
                    </div>
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color }} />
                  </div>
                )
              })}
            </div>
            {allOverdueTasks.length > 3 && (
              <button onClick={() => setShowAllOverdue(!showAllOverdue)}
                className="w-full flex items-center justify-center gap-1 text-[10px] font-mono py-2 mt-1 rounded-xl transition-all"
                style={{ color: '#2563EB' }}>
                {showAllOverdue ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                {showAllOverdue ? 'Voir moins' : `+${allOverdueTasks.length - 3} de plus`}
              </button>
            )}
          </div>
        )}

        {todayEvents.length > 0 && (
          <div>
            <p className="text-[10px] font-mono font-medium uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: '#2563EB' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#2563EB' }} />
              Evenements ({todayEvents.length})
            </p>
            <div className="space-y-2">
              {todayEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-white/5"
                  style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: colorMap[event.color] || '#2563EB' }}>
                    <Calendar size={12} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{event.title}</p>
                    {event.hour && <p className="text-[10px] font-mono" style={{ color: 'var(--color-muted)' }}>{event.hour}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {todayTasks.length > 0 && (
          <div>
            <p className="text-[10px] font-mono font-medium uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: '#2563EB' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#2563EB' }} />
              Taches ({todayTasks.length})
            </p>
            <div className="space-y-2">
              {todayTasks.map((task) => {
                const c = pCfg[task.priority] || pCfg.medium
                return (
                  <div key={task.id} className="group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-white/5"
                    style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                    <button onClick={() => toggleTask(task.id, task.completed)}
                      className="w-5 h-5 rounded-lg border flex-shrink-0 transition-all duration-200 flex items-center justify-center hover:scale-110"
                      style={{ borderColor: 'var(--color-border)' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{task.title}</p>
                    </div>
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color }} />
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
