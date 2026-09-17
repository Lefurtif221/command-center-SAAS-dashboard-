import { useState, useMemo } from 'react'
import { useDashboard } from '../../hooks/useDashboard'

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
  const { events, tasks, addEvent, removeEvent } = useDashboard()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [newEvent, setNewEvent] = useState({ title: '', color: 'accent' })

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

  const handleAddEvent = async () => {
    if (!selectedSlot || !newEvent.title.trim()) return
    await addEvent(newEvent.title.trim(), selectedSlot.date, selectedSlot.hour, newEvent.color)
    setNewEvent({ title: '', color: 'accent' })
    setModalOpen(false)
    setSelectedSlot(null)
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
    <div className="glass rounded-xl overflow-hidden" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <span className="iconify text-accent" data-icon="lucide:calendar" data-width="16"></span>
          <h3 className="text-sm font-display font-medium">Calendrier</h3>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="text-xs sm:text-sm font-display font-medium text-text mr-1 sm:mr-2">{weekLabel}</span>
          <button onClick={goToToday} className="px-1.5 sm:px-2 py-1 text-[10px] sm:text-xs text-accent border border-accent/20 rounded-lg hover:bg-accent/10 transition-all duration-200 font-mono">Aujourd'hui</button>
          <button onClick={() => navigateWeek(-1)} className="p-1 rounded-lg text-muted hover:text-text hover:bg-white/5 transition-colors">
            <span className="iconify" data-icon="lucide:chevron-left" data-width="16"></span>
          </button>
          <button onClick={() => navigateWeek(1)} className="p-1 rounded-lg text-muted hover:text-text hover:bg-white/5 transition-colors">
            <span className="iconify" data-icon="lucide:chevron-right" data-width="16"></span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr>
              <th className="w-14 p-2 border-b border-r border-border/50"></th>
              {weekDates.map((d, i) => {
                const isToday = isSameDay(d, today)
                return (
                  <th key={i} className={`p-2 border-b border-r border-border/50 text-center ${isToday ? 'bg-accent/5' : ''}`}>
                    <div className="text-[10px] text-muted uppercase font-mono">{DAYS[i]}</div>
                    <div className={`text-sm font-display font-medium mt-0.5 ${isToday ? 'text-accent' : 'text-text'}`}>{d.getDate()}</div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {HOURS.map(hour => (
              <tr key={hour}>
                <td className="p-2 border-b border-r border-border/50 text-right">
                  <span className="text-[10px] text-muted font-mono">{String(hour).padStart(2, '0')}:00</span>
                </td>
                {weekDates.map((d, di) => {
                  const dateStr = formatDate(d)
                  const event = getEventAt(dateStr, hour)
                  const isToday = isSameDay(d, today)
                  return (
                    <td key={di} onClick={() => !event && handleSlotClick(dateStr, hour)}
                      className={`border-b border-r border-border/50 h-10 relative ${isToday ? 'bg-accent/5' : 'hover:bg-white/[0.02]'} ${event ? '' : 'cursor-pointer'}`}>
                      {event && (
                        <div className={`absolute inset-0.5 rounded-lg flex items-center justify-between px-1.5 ${colors[event.color]}`}>
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
          <div className="glass rounded-2xl p-5 w-full max-w-sm mx-4 shadow-2xl" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-display font-medium">Nouvel événement</h4>
              <button onClick={() => setModalOpen(false)} className="text-muted hover:text-text transition-colors"><span className="iconify" data-icon="lucide:x" data-width="16"></span></button>
            </div>
            <p className="text-xs text-muted mb-4 font-mono">{selectedSlot && `${new Date(selectedSlot.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} à ${String(selectedSlot.hour).padStart(2, '0')}:00`}</p>
            <div className="space-y-3">
              <input type="text" placeholder="Titre de l'événement" value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                className="glass w-full px-3 py-2.5 rounded-xl text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent/50 transition-all duration-200" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }} autoFocus
                onKeyDown={e => e.key === 'Enter' && handleAddEvent()} />
              <div>
                <label className="block text-xs text-muted mb-1.5 font-mono">Couleur</label>
                <div className="flex gap-2">
                  {Object.entries(colorLabels).map(([key, label]) => (
                    <button key={key} onClick={() => setNewEvent({ ...newEvent, color: key })}
                      className={`w-7 h-7 rounded-lg ${colors[key]} ${newEvent.color === key ? 'ring-2 ring-offset-2 ring-offset-surface ring-accent' : 'opacity-50 hover:opacity-80'} transition-all duration-200`} title={label} />
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={handleAddEvent} disabled={!newEvent.title.trim()} className="flex-1 px-3 py-2.5 bg-accent text-bg text-sm font-medium rounded-xl hover:bg-[#8dd8fc] transition-all duration-200 disabled:opacity-50 shadow-[0_0_15px_-3px_rgba(125,211,252,0.3)]">Ajouter</button>
                <button onClick={() => setModalOpen(false)} className="glass px-3 py-2.5 text-sm text-muted rounded-xl hover:text-text transition-all duration-200" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>Annuler</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
