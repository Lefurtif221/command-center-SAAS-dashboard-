import { useDashboard } from '../../hooks/useDashboard'

const pCfg = { high: { label: 'Urgent', border: 'border-accentSec', dot: 'bg-accentSec' }, medium: { label: 'Moyen', border: 'border-warning', dot: 'bg-warning' }, low: { label: 'Faible', border: 'border-success', dot: 'bg-success' } }

export default function TodayFocus() {
  const { tasks, toggleTask } = useDashboard()
  const today = new Date().toLocaleDateString('sv-SE')
  const todayLabel = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

  const todayTasks = tasks.filter(t => !t.completed && t.due_date === today)
  const overdueTasks = tasks.filter(t => !t.completed && t.due_date && t.due_date < today).slice(0, 2)

  return (
    <div className="glass rounded-xl">
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <span className="iconify text-accent" data-icon="lucide:target" data-width="14"></span>
          <h3 className="text-sm font-display font-medium">Focus du jour</h3>
        </div>
        <span className="text-[10px] text-muted capitalize font-mono">{todayLabel}</span>
      </div>
      <div className="p-4 space-y-3">
        {todayTasks.length === 0 && overdueTasks.length === 0 && (
          <div className="py-6 text-center">
            <span className="iconify text-muted mx-auto mb-2 block" data-icon="lucide:check-circle" data-width="24"></span>
            <p className="text-xs text-muted">Rien de prévu pour aujourd'hui</p>
          </div>
        )}

        {overdueTasks.length > 0 && (
          <div>
            <p className="text-[10px] text-accentSec font-mono font-medium uppercase tracking-wider mb-2">En retard</p>
            {overdueTasks.map((task) => {
              const c = pCfg[task.priority] || pCfg.medium
              return (
                <div key={task.id} className={`flex items-center gap-3 p-3 glass rounded-xl border-l-2 ${c.border} mb-2`}>
                  <button onClick={() => toggleTask(task.id, task.completed)} className="w-6 h-6 rounded-lg border border-border/50 flex-shrink-0 hover:border-accent/50 hover:bg-accent/5 transition-all duration-200 flex items-center justify-center" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text">{task.title}</p>
                    <p className="text-[10px] text-accentSec font-mono">{task.due_date}</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${c.dot}`} />
                </div>
              )
            })}
          </div>
        )}

        {todayTasks.length > 0 && (
          <div>
            {overdueTasks.length > 0 && <p className="text-[10px] text-accent font-mono font-medium uppercase tracking-wider mb-2">Aujourd'hui</p>}
            {todayTasks.map((task) => {
              const c = pCfg[task.priority] || pCfg.medium
              return (
                <div key={task.id} className={`flex items-center gap-3 p-3 glass rounded-xl border-l-2 ${c.border} mb-2`}>
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
