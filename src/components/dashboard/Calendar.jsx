import { useState, useMemo } from 'react'

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

const HOURS = Array.from({ length: 24 }, (_, i) => i)

const EVENTS_KEY = 'personalplace_calendar_events'

function getEvents() {
  try { return JSON.parse(localStorage.getItem(EVENTS_KEY)) || [] }
  catch { return [] }
}

function saveEvents(events) {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events))
}

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
  const [events, setEvents] = useState(getEvents)
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

  const addEvent = () => {
    if (!selectedSlot || !newEvent.title.trim()) return
    const event = {
      id: Date.now(),
      date: selectedSlot.date,
      hour: selectedSlot.hour,
      title: newEvent.title.trim(),
      color: newEvent.color,
    }
    const updated = [...events, event]
    setEvents(updated)
    saveEvents(updated)
    setNewEvent({ title: '', color: 'accent' })
    setModalOpen(false)
    setSelectedSlot(null)
  }

  const removeEvent = (id) => {
    const updated = events.filter(e => e.id !== id)
    setEvents(updated)
    saveEvents(updated)
  }

  const getEventAt = (dateStr, hour) => events.find(e => e.date === dateStr && e.hour === hour)

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
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text mr-2">{weekLabel}</span>
          <button onClick={goToToday} className="px-2 py-1 text-xs text-accent border border-accent/30 rounded hover:bg-accent/10 transition-colors">Aujourd'hui</button>
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
                    <td key={di} onClick={() => handleSlotClick(dateStr, hour)}
                      className={`border-b border-r border-border h-10 relative ${isToday ? 'bg-accent/5' : 'hover:bg-bg/50'} ${event ? '' : 'cursor-pointer'}`}>
                      {event && (
                        <div className={`absolute inset-0.5 rounded flex items-center justify-between px-1.5 ${colors[event.color]}`}>
                          <span className="text-[10px] font-medium truncate">{event.title}</span>
                          <button onClick={(e) => { e.stopPropagation(); removeEvent(event.id) }} className="text-[10px] opacity-70 hover:opacity-100 ml-1 flex-shrink-0">✕</button>
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
