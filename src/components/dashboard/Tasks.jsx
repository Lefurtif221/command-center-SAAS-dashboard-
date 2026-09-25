import { useState, useEffect } from 'react'
import { useDashboard } from '../../hooks/useDashboard'
import { Trash2, CheckSquare, AlertTriangle, Plus } from 'lucide-react'

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

  const priorityColors = { high: '#1E40AF', medium: '#F59E0B', low: '#10B981' }

  const formatDate = (d) => {
    if (!d) return ''
    const date = new Date(d + 'T00:00:00')
    return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  const TaskItem = ({ task }) => (
    <div className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group hover:translate-x-1"
      style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderLeft: `3px solid ${priorityColors[task.priority] || '#9CA3AF'}` }}>
      <button onClick={() => toggleTask(task.id, task.completed)}
        className="w-6 h-6 rounded-md border flex-shrink-0 flex items-center justify-center transition-colors duration-150"
        style={{ borderColor: task.completed ? '#2563EB' : 'var(--color-border)', background: task.completed ? '#2563EB' : 'transparent' }}>
        {task.completed && <span className="text-white text-[10px]">âœ“</span>}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${task.completed ? 'line-through' : ''}`} style={{ color: task.completed ? 'var(--color-muted)' : 'var(--color-text)' }}>{task.title}</p>
        {task.due_date && <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-muted)' }}>{formatDate(task.due_date)}</p>}
      </div>
      <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 transition-opacity duration-150" style={{ color: 'var(--color-muted)' }}>
        <Trash2 size={14} />
      </button>
    </div>
  )

  return (
    <div className="rounded-xl" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        <CheckSquare size={14} style={{ color: '#2563EB' }} />
        <h3 className="text-sm font-display font-medium">Taches</h3>
        <span className="text-[11px] ml-auto" style={{ color: 'var(--color-muted)' }}>{tasks.filter(t => !t.completed).length} en cours</span>
      </div>

      <div className="px-4 pb-4 pt-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <input type="text" placeholder="Nouvelle tache..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className="flex-1 px-3 py-2.5 rounded-lg text-sm focus:outline-none transition-colors duration-150"
            style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }} />
          <div className="flex gap-2">
            <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)}
              className="flex-1 sm:flex-none px-2 py-2.5 rounded-lg text-xs focus:outline-none transition-colors duration-150"
              style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }} />
            <select value={newPriority} onChange={(e) => setNewPriority(e.target.value)}
              className="px-2 py-2.5 rounded-lg text-xs focus:outline-none cursor-pointer transition-colors duration-150"
              style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
              <option value="high">Urgent</option>
              <option value="medium">Moyen</option>
              <option value="low">Faible</option>
            </select>
            <button onClick={handleAdd} disabled={adding || !newTitle.trim()}
              className="px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-150 disabled:opacity-50"
              style={{ background: '#2563EB', color: '#FFF' }}>
              {adding ? '...' : <Plus size={16} />}
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {tasks.length === 0 ? (
          <p className="text-sm text-center py-4" style={{ color: 'var(--color-muted)' }}>Aucune tache. Ajoute-en une !</p>
        ) : (
          <>
            {lastWarningTasks.length > 0 && (
              <div className="rounded-xl p-3" style={{ background: 'rgba(37,99,235,0.05)', border: '1px solid rgba(37,99,235,0.1)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={14} style={{ color: '#F59E0B' }} />
                  <p className="text-[11px] font-medium" style={{ color: '#F59E0B' }}>Dernier rappel ({lastWarningTasks.length})</p>
                </div>
                <p className="text-[10px] mb-2" style={{ color: 'var(--color-muted)' }}>Supprimees demain automatiquement.</p>
                <div className="space-y-1">{lastWarningTasks.map(t => <TaskItem key={t.id} task={t} />)}</div>
              </div>
            )}
            {overdueTasks.length > 0 && (
              <div>
                <p className="text-[11px] font-medium mb-2" style={{ color: '#F59E0B' }}>En retard ({overdueTasks.length})</p>
                <div className="space-y-1">{overdueTasks.map(t => <TaskItem key={t.id} task={t} />)}</div>
              </div>
            )}
            {todayTasks.length > 0 && (
              <div>
                <p className="text-[11px] font-medium mb-2" style={{ color: '#2563EB' }}>Aujourd'hui</p>
                <div className="space-y-1">{todayTasks.map(t => <TaskItem key={t.id} task={t} />)}</div>
              </div>
            )}
            {upcomingTasks.length > 0 && (
              <div>
                <p className="text-[11px] font-medium mb-2" style={{ color: 'var(--color-muted)' }}>A venir</p>
                <div className="space-y-1">{upcomingTasks.map(t => <TaskItem key={t.id} task={t} />)}</div>
              </div>
            )}
            {noDateTasks.length > 0 && (
              <div>
                <p className="text-[11px] font-medium mb-2" style={{ color: 'var(--color-muted)' }}>Sans date</p>
                <div className="space-y-1">{noDateTasks.map(t => <TaskItem key={t.id} task={t} />)}</div>
              </div>
            )}
            {doneTasks.length > 0 && (
              <div>
                <p className="text-[11px] font-medium mb-2" style={{ color: 'var(--color-muted)' }}>Terminees ({doneTasks.length})</p>
                <div className="space-y-1">{doneTasks.slice(0, 3).map(t => <TaskItem key={t.id} task={t} />)}</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
