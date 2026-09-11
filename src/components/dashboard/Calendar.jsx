import { useState, useMemo, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

const HOURS = Array.from({ length: 24 }, (_, i) => i)

function getWeekDates(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d)
  monday.setDate(diff)
  return Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(monday)
    dt.setDate(monday.getDate() + i)
    return dt
  })
}

function formatDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState([])
  const [tasks, setTasks] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [newEvent, setNewEvent] = useState({ title: '', color: 'accent' })

  useEffect(() => { fetchEvents(); fetchTasks() }, [])

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('command_center_token')
      const res = await fetch(`${API_URL}/api/calendar`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setEvents(data.events || [])
    } catch (err) { console.error(err) }
  }

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('command_center_token')
      const res = await fetch(`${API_URL}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setTasks(data.tasks || [])
    } catch (err) { console.error(err) }
  }

  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate])
  const today = new Date()

  const colors = {
    accent: 'bg-accent text-bg',
    success: 'bg-success text-bg',
    warning: 'bg-warning text-bg',
    accentSec: 'bg-accentSec text-bg',
    purple: 'bg-purple-500 text-white',
  }
  const colorLabels = { accent: 'Bleu', success: 'Vert', warning: 'Orange', accentSec: 'Rouge', purple: 'Violet' }

  const addEvent = async () => {
    if (!selectedSlot || !newEvent.title.trim()) return
    try {
      const token = localStorage.getItem('command_center_token')
      const res = await fetch(`${API_URL}/api/calendar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: newEvent.title.trim(), date: selectedSlot.date, hour: selectedSlot.hour, color: newEvent.color }),
      })
      const data = await res.json()
      if (data.event) setEvents(prev => [...prev, data.event])
      setNewEvent({ title: '', color: 'accent' })
      setModalOpen(false)
      setSelectedSlot(null)
    } catch (err) { console.error(err) }
  }

  const removeEvent = async (id) => {
    try {
      const token = localStorage.getItem('command_center_token')
      await fetch(`${API_URL}/api/calendar/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      setEvents(prev => prev.filter(e => e.id !== id))
    } catch (err) { console.error(err) }
  }

  const getEventAt = (dateStr, hour) => {
    const event = events.find(e => e.date === dateStr && e.hour === hour)
    if (event) return { type: 'event', ...event }

    if (hour === 8) {
      const dayTasks = tasks.filter(t => t.due_date === dateStr && !t.completed)
      if (dayTasks.length > 0) {
        return { type: 'task', id: 'tasks-' + dateStr, title: `${dayTasks.length} tâche${dayTasks.length > 1 ? 's' : ''}`, color: 'warning', date: dateStr, hour: 8 }
      }
    }
    return null
  }

  const navigateWeek = (dir) => {
    const d = new Date(currentDate)
    d.setDate(d.getDate() + dir * 7)
    setCurrentDate(d)
  }

  const goToToday = () => setCurrentDate(new Date())

  const handleSlotClick = (dateStr, hour) => {
    const existing = getEventAt(dateStr, hour)
    if (existing) return
    setSelectedSlot({ date: dateStr, hour })
    setModalOpen(true)
  }

  const weekLabel = `${MONTHS[weekDates[0].getMonth()]} ${weekDates[0].getFullYear()}`

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <span className="iconify text-accent" data-icon="lucide:calendar" data-width="16"></span>
          <h3 className="text-sm font-medium">Calendrier</h3>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="text-xs sm:text-sm font-medium text-text mr-1 sm:mr-2">{weekLabel}</span>
          <button onClick={goToToday} className="px-1.5 sm:px-2 py-1 text-[10px] sm:text-xs text-accent border border-accent/30 rounded hover:bg-accent/10 transition-colors">Aujourd'hui</button>
          <button onClick={() => navigateWeek(-1)} className="p-1 rounded text-muted hover:text-text hover:bg-bg/50 transition-colors">
            <span className="iconify" data-icon="lucide:chevron-left" data-width="16"></span>
          </button>
          <button onClick={() => navigateWeek(1)} className="p-1 rounded text-muted hover:text-text hover:bg-bg/50 transition-colors">
            <span className="iconify" data-icon="lucide:chevron-right" data-width="16"></span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr>
              <th className="w-14 p-2 border-b border-r border-border"></th>
              {weekDates.map((d, i) => {
                const isToday = isSameDay(d, today)
                return (
                  <th key={i} className={`p-2 border-b border-r border-border text-center ${isToday ? 'bg-accent/5' : ''}`}>
                    <div className="text-[10px] text-muted uppercase">{DAYS[i]}</div>
                    <div className={`text-sm font-medium mt-0.5 ${isToday ? 'text-accent' : 'text-text'}`}>{d.getDate()}</div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {HOURS.map(hour => (
              <tr key={hour}>
                <td className="p-2 border-b border-r border-border text-right">
                  <span className="text-[10px] text-muted">{String(hour).padStart(2, '0')}:00</span>
                </td>
                {weekDates.map((d, di) => {
                  const dateStr = formatDate(d)
                  const event = getEventAt(dateStr, hour)
                  const isToday = isSameDay(d, today)
                  return (
                    <td key={di} onClick={() => !event && handleSlotClick(dateStr, hour)}
                      className={`border-b border-r border-border h-10 relative ${isToday ? 'bg-accent/5' : 'hover:bg-bg/50'} ${event ? '' : 'cursor-pointer'}`}>
                      {event && (
                        <div className={`absolute inset-0.5 rounded flex items-center justify-between px-1.5 ${colors[event.color]}`}>
                          <span className="text-[10px] font-medium truncate">{event.title}</span>
                          {event.type === 'event' && (
                            <button onClick={(e) => { e.stopPropagation(); removeEvent(event.id) }} className="text-[10px] opacity-70 hover:opacity-100 ml-1 flex-shrink-0">✕</button>
                          )}
                        </div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setModalOpen(false)}>
          <div className="bg-surface border border-border rounded-lg p-5 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium">Nouvel événement</h4>
              <button onClick={() => setModalOpen(false)} className="text-muted hover:text-text"><span className="iconify" data-icon="lucide:x" data-width="16"></span></button>
            </div>
            <p className="text-xs text-muted mb-4">{selectedSlot && `${new Date(selectedSlot.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} à ${String(selectedSlot.hour).padStart(2, '0')}:00`}</p>
            <div className="space-y-3">
              <input type="text" placeholder="Titre de l'événement" value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent transition-colors" autoFocus
                onKeyDown={e => e.key === 'Enter' && addEvent()} />
              <div>
                <label className="block text-xs text-muted mb-1.5">Couleur</label>
                <div className="flex gap-2">
                  {Object.entries(colorLabels).map(([key, label]) => (
                    <button key={key} onClick={() => setNewEvent({ ...newEvent, color: key })}
                      className={`w-6 h-6 rounded-full ${colors[key]} ${newEvent.color === key ? 'ring-2 ring-offset-2 ring-offset-surface ring-text' : 'opacity-50 hover:opacity-80'} transition-all`} title={label} />
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={addEvent} disabled={!newEvent.title.trim()} className="flex-1 px-3 py-2 bg-accent text-bg text-sm font-medium rounded-lg hover:bg-[#33c2ff] transition-colors disabled:opacity-50">Ajouter</button>
                <button onClick={() => setModalOpen(false)} className="px-3 py-2 bg-bg border border-border text-sm text-muted rounded-lg hover:text-text transition-colors">Annuler</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
