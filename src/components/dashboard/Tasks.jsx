import { useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [newTitle, setNewTitle] = useState('')
  const [newDate, setNewDate] = useState('')
  const [newPriority, setNewPriority] = useState('medium')
  const [adding, setAdding] = useState(false)

  useEffect(() => { fetchTasks() }, [])

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('command_center_token')
      const res = await fetch(`${API_URL}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setTasks(data.tasks || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const addTask = async () => {
    if (!newTitle.trim()) return
    setAdding(true)
    try {
      const token = localStorage.getItem('command_center_token')
      const res = await fetch(`${API_URL}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: newTitle.trim(), priority: newPriority, due_date: newDate || null }),
      })
      const data = await res.json()
      if (data.task) setTasks(prev => [data.task, ...prev])
      setNewTitle(''); setNewDate(''); setNewPriority('medium')
    } catch (err) { console.error(err) }
    finally { setAdding(false) }
  }

  const toggleTask = async (id, completed) => {
    try {
      const token = localStorage.getItem('command_center_token')
      const res = await fetch(`${API_URL}/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ completed: !completed }),
      })
      const data = await res.json()
      if (data.task) setTasks(prev => prev.map(t => t.id === id ? data.task : t))
    } catch (err) { console.error(err) }
  }

  const deleteTask = async (id) => {
    try {
      const token = localStorage.getItem('command_center_token')
      await fetch(`${API_URL}/api/tasks/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      setTasks(prev => prev.filter(t => t.id !== id))
    } catch (err) { console.error(err) }
  }

  const today = new Date().toISOString().split('T')[0]
  const todayTasks = tasks.filter(t => !t.completed && t.due_date === today)
  const upcomingTasks = tasks.filter(t => !t.completed && t.due_date && t.due_date > today)
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
      <button onClick={() => toggleTask(task.id, task.completed)} className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${task.completed ? 'bg-accent border-accent' : 'border-border hover:border-accent'}`}>
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
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
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
            <button onClick={addTask} disabled={adding || !newTitle.trim()}
              className="px-3 py-2 bg-accent text-bg text-sm font-medium rounded-lg hover:bg-[#33c2ff] transition-colors disabled:opacity-50">
              {adding ? '...' : '+'}
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {loading ? (
          <p className="text-sm text-muted text-center py-4">Chargement...</p>
        ) : tasks.length === 0 ? (
          <p className="text-sm text-muted text-center py-4">Aucune tâche. Ajoute-en une !</p>
        ) : (
          <>
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
