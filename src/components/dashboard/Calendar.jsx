import { useState, useMemo } from 'react'
import { useDashboard } from '../../hooks/useDashboard'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Plus } from 'lucide-react'

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const MONTHS = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre']

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
  const [mobileDay, setMobileDay] = useState(0)
  const [expandedEvents, setExpandedEvents] = useState({})

  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate])
  const today = new Date()

  const colors = {
    accent: { bg: '#2563EB', text: '#FFFFFF' },
    success: { bg: '#10B981', text: '#FFFFFF' },
    warning: { bg: '#F59E0B', text: '#FFFFFF' },
    accentSec: { bg: '#1E40AF', text: '#FFFFFF' },
    purple: { bg: '#8B5CF6', text: '#FFFFFF' },
  }
  const colorLabels = { accent: 'Bleu', success: 'Vert', warning: 'Orange', accentSec: 'Bleu fonce', purple: 'Violet' }

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
        return { type: 'task', id: 'tasks-' + dateStr, title: `${dayTasks.length} tache${dayTasks.length > 1 ? 's' : ''}`, color: 'warning', date: dateStr, hour: 8 }
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

  const toggleExpand = (id, e) => {
    e.stopPropagation()
    setExpandedEvents(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const getDayEvents = (dateStr) => {
    const dayEvents = []
    for (let h = 0; h < 24; h++) {
      const ev = getEventAt(dateStr, h)
      if (ev) dayEvents.push({ hour: h, ...ev })
    }
    return dayEvents
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-3">
          <CalendarIcon size={14} style={{ color: '#2563EB' }} />
          <h3 className="text-sm font-display font-medium">Calendrier</h3>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="text-xs sm:text-sm font-display font-medium mr-1 sm:mr-2">{weekLabel}</span>
          <button onClick={goToToday} className="px-1.5 sm:px-2 py-1 text-[10px] sm:text-xs rounded-lg transition-all duration-200" style={{ color: '#2563EB', border: '1px solid rgba(37,99,235,0.2)' }}>Auj.</button>
          <button onClick={() => navigateWeek(-1)} className="p-1 rounded-lg transition-colors" style={{ color: 'var(--color-muted)' }}>
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => navigateWeek(1)} className="p-1 rounded-lg transition-colors" style={{ color: 'var(--color-muted)' }}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Desktop: full week grid */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr>
              <th className="w-14 p-2 border-b border-r" style={{ borderColor: 'var(--color-border)' }}></th>
              {weekDates.map((d, i) => {
                const isToday = isSameDay(d, today)
                return (
                  <th key={i} className="p-2 border-b border-r" style={{ borderColor: 'var(--color-border)', background: isToday ? 'rgba(37,99,235,0.05)' : 'transparent' }}>
                    <div className="text-[10px] uppercase" style={{ color: 'var(--color-muted)' }}>{DAYS[i]}</div>
                    <div className={`text-sm font-display font-medium mt-0.5`} style={{ color: isToday ? '#2563EB' : 'var(--color-text)' }}>{d.getDate()}</div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {HOURS.map(hour => (
              <tr key={hour}>
                <td className="p-2 border-b border-r text-right" style={{ borderColor: 'var(--color-border)' }}>
                  <span className="text-[10px]" style={{ color: 'var(--color-muted)' }}>{String(hour).padStart(2, '0')}:00</span>
                </td>
                {weekDates.map((d, di) => {
                  const dateStr = formatDate(d)
                  const event = getEventAt(dateStr, hour)
                  const isToday = isSameDay(d, today)
                  const c = event ? colors[event.color] : null
                  return (
                    <td key={di} onClick={() => !event && handleSlotClick(dateStr, hour)}
                      className="border-b border-r h-10 relative transition-colors"
                      style={{ borderColor: 'var(--color-border)', background: isToday ? 'rgba(37,99,235,0.05)' : 'transparent', cursor: event ? 'default' : 'pointer' }}>
                      {event && (
                        <div className="absolute inset-0.5 rounded-lg flex items-center justify-between px-1.5 transition-colors duration-150 "
                          style={{ background: c?.bg || '#2563EB', color: c?.text || '#FFF' }}>
                          <span className={`text-[10px] font-medium ${expandedEvents[event.id] ? 'whitespace-normal break-words' : 'truncate'}`}
                            onClick={(e) => toggleExpand(event.id, e)}
                            style={{ cursor: event.title.length > 15 ? 'pointer' : 'default' }}>
                            {event.title}
                          </span>
                          {event.type === 'event' && (
                            <button onClick={(e) => { e.stopPropagation(); removeEvent(event.id) }} className="text-[10px] opacity-70 hover:opacity-100 ml-1 flex-shrink-0">x</button>
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

      {/* Mobile: day cards */}
      <div className="md:hidden">
        <div className="flex overflow-x-auto border-b" style={{ borderColor: 'var(--color-border)' }}>
          {weekDates.map((d, i) => {
            const isToday = isSameDay(d, today)
            const isSelected = mobileDay === i
            return (
              <button key={i} onClick={() => setMobileDay(i)}
                className="flex-1 min-w-[60px] py-3 flex flex-col items-center gap-1 transition-all duration-200"
                style={{ borderBottom: isSelected ? '2px solid #2563EB' : '2px solid transparent', background: isToday ? 'rgba(37,99,235,0.05)' : 'transparent' }}>
                <span className="text-[10px] uppercase" style={{ color: 'var(--color-muted)' }}>{DAYS[i]}</span>
                <span className="text-sm font-display font-medium" style={{ color: isToday ? '#2563EB' : isSelected ? 'var(--color-text)' : 'var(--color-muted)' }}>{d.getDate()}</span>
              </button>
            )
          })}
        </div>
        <div className="p-3 space-y-1 max-h-[500px] overflow-y-auto">
          {getDayEvents(formatDate(weekDates[mobileDay])).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Aucun evenement</p>
              <button onClick={() => { setSelectedSlot({ date: formatDate(weekDates[mobileDay]), hour: 9 }); setModalOpen(true) }}
                className="mt-3 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200"
                style={{ background: 'rgba(37,99,235,0.1)', color: '#2563EB', border: '1px solid rgba(37,99,235,0.2)' }}>
                <Plus size={12} className="inline mr-1" /> Ajouter
              </button>
            </div>
          ) : (
            <>
              {getDayEvents(formatDate(weekDates[mobileDay])).map((ev, i) => {
                const c = colors[ev.color] || colors.accent
                return (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200"
                    style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                    <div className="w-1 h-10 rounded-full" style={{ background: c.bg }} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${expandedEvents[ev.id + '-' + i] ? 'whitespace-normal break-words' : 'truncate cursor-pointer'}`}
                        onClick={() => setExpandedEvents(prev => ({ ...prev, [ev.id + '-' + i]: !prev[ev.id + '-' + i] }))}>
                        {ev.title}
                      </p>
                      <p className="text-[10px]" style={{ color: 'var(--color-muted)' }}>{String(ev.hour).padStart(2, '0')}:00</p>
                    </div>
                    {ev.type === 'event' && (
                      <button onClick={() => removeEvent(ev.id)} className="text-[10px] px-2 py-1 rounded-lg transition-colors"
                        style={{ color: 'var(--color-muted)' }}>x</button>
                    )}
                  </div>
                )
              })}
              <button onClick={() => { setSelectedSlot({ date: formatDate(weekDates[mobileDay]), hour: new Date().getHours() }); setModalOpen(true) }}
                className="w-full py-3 rounded-xl text-xs font-medium transition-all duration-200"
                style={{ background: 'rgba(37,99,235,0.1)', color: '#2563EB', border: '1px solid rgba(37,99,235,0.2)' }}>
                <Plus size={12} className="inline mr-1" /> Ajouter un evenement
              </button>
            </>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={() => setModalOpen(false)}>
          <div className="rounded-2xl p-5 w-full max-w-sm shadow-2xl animate-scale-in" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-display font-medium">Nouvel evenement</h4>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg transition-colors" style={{ color: 'var(--color-muted)' }}><X size={16} /></button>
            </div>
            <p className="text-xs mb-4" style={{ color: 'var(--color-muted)' }}>{selectedSlot && `${new Date(selectedSlot.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} a ${String(selectedSlot.hour).padStart(2, '0')}:00`}</p>
            <div className="space-y-3">
              <input type="text" placeholder="Titre de l'evenement" value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-all duration-200" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }} autoFocus
                onKeyDown={e => e.key === 'Enter' && handleAddEvent()} />
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--color-muted)' }}>Couleur</label>
                <div className="flex gap-2">
                  {Object.entries(colorLabels).map(([key, label]) => (
                    <button key={key} onClick={() => setNewEvent({ ...newEvent, color: key })}
                      className="w-7 h-7 rounded-lg transition-colors duration-150 "
                      style={{ background: colors[key].bg, opacity: newEvent.color === key ? 1 : 0.4, outline: newEvent.color === key ? '2px solid var(--color-text)' : 'none', outlineOffset: '2px' }} title={label} />
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={handleAddEvent} disabled={!newEvent.title.trim()} className="flex-1 px-3 py-2.5 text-sm font-medium rounded-xl transition-colors duration-150 disabled:opacity-50" style={{ background: '#2563EB', color: '#FFF' }}>Ajouter</button>
                <button onClick={() => setModalOpen(false)} className="px-3 py-2.5 text-sm rounded-xl transition-all duration-200" style={{ color: 'var(--color-muted)', background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>Annuler</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
