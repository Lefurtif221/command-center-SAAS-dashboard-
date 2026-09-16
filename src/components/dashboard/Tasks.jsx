import { useState, useEffect } from 'react'
import { useDashboard } from '../../hooks/useDashboard'

export default function Tasks() {
  const { tasks, addTask, toggleTask, deleteTask } = useDashboard()
  const [newTitle, setNewTitle] = useState('')
  const [newDate, setNewDate] = useState('')
  const [newPriority, setNewPriority] = useState('medium')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    const tracked = JSON.parse(localStorage.getItem('lastWarningTasks') || '{}')
    const today = new Date().toLocaleDateString('sv-SE')
    const now = Date.now()

    const lastWarning = tasks.filter(t => !t.completed && t.due_date && t.due_date < new Date(new Date().setDate(new Date().getDate() - 7)).toLocaleDateString('sv-SE'))

    lastWarning.forEach(t => {
      if (!tracked[t.id]) {
        tracked[t.id] = now
      } else if (now - tracked[t.id] > 24 * 60 * 60 * 1000) {
        deleteTask(t.id)
        delete tracked[t.id]
      }
    })

    Object.keys(tracked).forEach(id => {
      if (!lastWarning.find(t => String(t.id) === id)) {
        delete tracked[id]
      }
    })

    localStorage.setItem('lastWarningTasks', JSON.stringify(tracked))
  }, [tasks, deleteTask])

  const handleAdd = async () => {
    if (!newTitle.trim()) return
    setAdding(true)
    await addTask(newTitle.trim(), newPriority, newDate || null)
    setNewTitle(''); setNewDate(''); setNewPriority('medium')
    setAdding(false)
  }

  const today = new Date()
  const todayStr = today.toLocaleDateString('sv-SE')
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const sevenDaysAgoStr = sevenDaysAgo.toLocaleDateString('sv-SE')

  const overdueTasks = tasks.filter(t => !t.completed && t.due_date && t.due_date < todayStr && t.due_date >= sevenDaysAgoStr)
  const lastWarningTasks = tasks.filter(t => !t.completed && t.due_date && t.due_date < sevenDaysAgoStr)
  const todayTasks = tasks.filter(t => !t.completed && t.due_date === todayStr)
  const upcomingTasks = tasks.filter(t => !t.completed && t.due_date && t.due_date > todayStr)
  const noDateTasks = tasks.filter(t => !t.completed && !t.due_date)
  const doneTasks = tasks.filter(t => t.completed)

  const priorityColors = { high: 'border-l-accentSec', medium: 'border-l-warning', low: 'border-l-success' }
  const priorityDots = { high: 'bg-accentSec', medium: 'bg-warning', low: 'bg-success' }

  const formatDate = (d) => {
    if (!d) return ''
    const date = new Date(d + 'T00:00:00')
    return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  const TaskItem = ({ task }) => (
    <div className={`flex items-center gap-3 p-3 rounded-lg border-l-2 bg-bg hover:bg-bg/80 transition-colors group ${priorityColors[task.priority]}`}>
      <button onClick={() => toggleTask(task.id, task.completed)} className={`w-6 h-6 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${task.completed ? 'bg-accent border-accent' : 'border-border hover:border-accent'}`}>
        {task.completed && <span className="text-bg text-[10px]">✓</span>}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${task.completed ? 'text-muted line-through' : 'text-text'}`}>{task.title}</p>
        {task.due_date && <p className="text-[10px] text-muted mt-0.5">{formatDate(task.due_date)}</p>}
      </div>
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityDots[task.priority]}`} />
      <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-muted hover:text-accentSec transition-all">
        <span className="iconify" data-icon="lucide:trash-2" data-width="14"></span>
      </button>
    </div>
  )

  return (
    <div className="bg-surface border border-border rounded-lg">
      <div className="flex items-center gap-2 p-4 border-b border-border">
        <span className="iconify text-accent" data-icon="lucide:check-square" data-width="14"></span>
        <h3 className="text-sm font-medium">Tâches</h3>
        <span className="text-[10px] text-muted ml-auto">{tasks.filter(t => !t.completed).length} en cours</span>
      </div>

      <div className="p-4 border-b border-border">
        <div className="flex flex-col sm:flex-row gap-2">
          <input type="text" placeholder="Nouvelle tâche..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className="flex-1 px-3 py-2 bg-bg border border-border rounded-lg text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent transition-colors" />
          <div className="flex gap-2">
            <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)}
              className="flex-1 sm:flex-none px-2 py-2 bg-bg border border-border rounded-lg text-xs text-text focus:outline-none focus:border-accent transition-colors" />
            <select value={newPriority} onChange={(e) => setNewPriority(e.target.value)}
              className="px-2 py-2 bg-bg border border-border rounded-lg text-xs text-text focus:outline-none focus:border-accent cursor-pointer">
              <option value="high">Urgent</option>
              <option value="medium">Moyen</option>
              <option value="low">Faible</option>
            </select>
            <button onClick={handleAdd} disabled={adding || !newTitle.trim()}
              className="px-3 py-2 bg-accent text-bg text-sm font-medium rounded-lg hover:bg-[#33c2ff] transition-colors disabled:opacity-50">
              {adding ? '...' : '+'}
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {tasks.length === 0 ? (
          <p className="text-sm text-muted text-center py-4">Aucune tâche. Ajoute-en une !</p>
        ) : (
          <>
            {lastWarningTasks.length > 0 && (
              <div className="bg-accentSec/5 border border-accentSec/20 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="iconify text-accentSec" data-icon="lucide:alert-triangle" data-width="14"></span>
                  <p className="text-[10px] text-accentSec font-medium uppercase tracking-wider">Dernier rappel — supprimées demain ({lastWarningTasks.length})</p>
                </div>
                <p className="text-[10px] text-muted mb-2">Ces tâches datent de plus d'une semaine. Elles seront supprimées automatiquement.</p>
                <div className="space-y-1">{lastWarningTasks.map(t => <TaskItem key={t.id} task={t} />)}</div>
              </div>
            )}
            {overdueTasks.length > 0 && (
              <div>
                <p className="text-[10px] text-accentSec font-medium uppercase tracking-wider mb-2">En retard ({overdueTasks.length})</p>
                <div className="space-y-1">{overdueTasks.map(t => <TaskItem key={t.id} task={t} />)}</div>
              </div>
            )}
            {todayTasks.length > 0 && (
              <div>
                <p className="text-[10px] text-accent font-medium uppercase tracking-wider mb-2">Aujourd'hui</p>
                <div className="space-y-1">{todayTasks.map(t => <TaskItem key={t.id} task={t} />)}</div>
              </div>
            )}
            {upcomingTasks.length > 0 && (
              <div>
                <p className="text-[10px] text-muted font-medium uppercase tracking-wider mb-2">À venir</p>
                <div className="space-y-1">{upcomingTasks.map(t => <TaskItem key={t.id} task={t} />)}</div>
              </div>
            )}
            {noDateTasks.length > 0 && (
              <div>
                <p className="text-[10px] text-muted font-medium uppercase tracking-wider mb-2">Sans date</p>
                <div className="space-y-1">{noDateTasks.map(t => <TaskItem key={t.id} task={t} />)}</div>
              </div>
            )}
            {doneTasks.length > 0 && (
              <div>
                <p className="text-[10px] text-muted font-medium uppercase tracking-wider mb-2">Terminées ({doneTasks.length})</p>
                <div className="space-y-1">{doneTasks.slice(0, 3).map(t => <TaskItem key={t.id} task={t} />)}</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
