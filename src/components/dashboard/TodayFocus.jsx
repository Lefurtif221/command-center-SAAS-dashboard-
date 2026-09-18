import { useState } from 'react'
import { useDashboard } from '../../hooks/useDashboard'
import { Target, CheckCircle, Calendar } from 'lucide-react'

const pCfg = { high: { label: 'Urgent', border: 'border-accentSec', dot: 'bg-accentSec' }, medium: { label: 'Moyen', border: 'border-warning', dot: 'bg-warning' }, low: { label: 'Faible', border: 'border-success', dot: 'bg-success' } }

const colorMap = { blue: 'bg-accent', rose: 'bg-accentSec', green: 'bg-success', yellow: 'bg-warning', purple: 'bg-purple-400' }

export default function TodayFocus() {
  const { tasks, events, toggleTask } = useDashboard()
  const [showAllOverdue, setShowAllOverdue] = useState(false)
  const today = new Date().toLocaleDateString('sv-SE')
  const todayLabel = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

  const todayTasks = tasks.filter(t => !t.completed && t.due_date === today)
  const allOverdueTasks = tasks.filter(t => !t.completed && t.due_date && t.due_date < today)
  const overdueTasks = showAllOverdue ? allOverdueTasks : allOverdueTasks.slice(0, 3)
  const hasMoreOverdue = allOverdueTasks.length > 3

  const todayEvents = events.filter(e => e.date === today).sort((a, b) => (a.hour || '').localeCompare(b.hour || ''))

  return (
    <div className="glass rounded-xl" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Target size={14} className="text-accent" />
          <h3 className="text-sm font-display font-medium">Focus du jour</h3>
        </div>
        <span className="text-[10px] text-muted capitalize font-mono">{todayLabel}</span>
      </div>
      <div className="p-4 space-y-4">
        {todayTasks.length === 0 && allOverdueTasks.length === 0 && todayEvents.length === 0 && (
          <div className="py-6 text-center">
            <CheckCircle size={24} className="text-muted mx-auto mb-2 block" />
            <p className="text-xs text-muted">Rien de prévu pour aujourd'hui</p>
          </div>
        )}

        {overdueTasks.length > 0 && (
          <div>
            <p className="text-[10px] text-accentSec font-mono font-medium uppercase tracking-wider mb-2">En retard ({allOverdueTasks.length})</p>
            {overdueTasks.map((task) => {
              const c = pCfg[task.priority] || pCfg.medium
              return (
                <div key={task.id} className={`glass flex items-center gap-3 p-3 rounded-xl border-l-2 ${c.border} mb-2`} style={{ background: 'var(--color-surface-solid)' }}>
                  <button onClick={() => toggleTask(task.id, task.completed)} className="w-6 h-6 rounded-lg border border-border/50 flex-shrink-0 hover:border-accent/50 hover:bg-accent/5 transition-all duration-200 flex items-center justify-center" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text">{task.title}</p>
                    <p className="text-[10px] text-accentSec font-mono">{task.due_date}</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${c.dot}`} />
                </div>
              )
            })}
            {hasMoreOverdue && !showAllOverdue && (
              <button onClick={() => setShowAllOverdue(true)} className="w-full text-center text-[10px] text-accent font-mono py-1.5 hover:bg-accent/5 rounded-lg transition-colors">
                +{allOverdueTasks.length - 3} de plus
              </button>
            )}
          </div>
        )}

        {todayEvents.length > 0 && (
          <div>
            <p className="text-[10px] text-accent font-mono font-medium uppercase tracking-wider mb-2">Événements ({todayEvents.length})</p>
            {todayEvents.map((event) => (
              <div key={event.id} className="glass flex items-center gap-3 p-3 rounded-xl border-l-2 border-accent mb-2" style={{ background: 'var(--color-surface-solid)' }}>
                <Calendar size={16} className={`flex-shrink-0 ${colorMap[event.color] || 'bg-accent'} text-bg rounded p-0.5`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text">{event.title}</p>
                  {event.hour && <p className="text-[10px] text-muted font-mono">{event.hour}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {todayTasks.length > 0 && (
          <div>
            <p className="text-[10px] text-accent font-mono font-medium uppercase tracking-wider mb-2">Tâches ({todayTasks.length})</p>
            {todayTasks.map((task) => {
              const c = pCfg[task.priority] || pCfg.medium
              return (
                <div key={task.id} className={`glass flex items-center gap-3 p-3 rounded-xl border-l-2 ${c.border} mb-2`} style={{ background: 'var(--color-surface-solid)' }}>
                  <button onClick={() => toggleTask(task.id, task.completed)} className="w-6 h-6 rounded-lg border border-border/50 flex-shrink-0 hover:border-accent/50 hover:bg-accent/5 transition-all duration-200 flex items-center justify-center" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text">{task.title}</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${c.dot}`} />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
