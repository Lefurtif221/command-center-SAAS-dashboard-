import { useState, useMemo } from 'react'
import { useDashboard } from '../../hooks/useDashboard'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Plus, Trash2 } from 'lucide-react'

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const MONTHS = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre']
const START_H = 0
const END_H = 24
const PX_PER_MIN = 0.85
const GRID_H = (END_H - START_H) * 60 * PX_PER_MIN
const COLORS = { accent: '#2563EB', success: '#10B981', warning: '#F59E0B', accentSec: '#1E40AF', purple: '#8B5CF6' }
const COLOR_LABELS = { accent: 'Bleu', success: 'Vert', warning: 'Orange', accentSec: 'Bleu fonce', purple: 'Violet' }

const formatDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const minToTime = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
const timeToMin = (t) => {
  const [h, m] = t.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}
const isSameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

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

// Chevauchements : chaque bloc reoit une colonne (lane) dans son cluster
function layoutDay(items) {
  const sorted = [...items].sort((a, b) => a.start - b.start || b.end - a.end)
  const result = []
  let cluster = []
  let clusterEnd = -1
  const flush = () => {
    if (!cluster.length) return
    const lanes = []
    for (const ev of cluster) {
      let l = lanes.findIndex(lane => lane[lane.length - 1].end <= ev.start)
      if (l === -1) { lanes.push([ev]); l = lanes.length - 1 } else lanes[l].push(ev)
      ev._lane = l
    }
    const total = lanes.length
    cluster.forEach(ev => result.push({ ...ev, lane: ev._lane, total }))
    cluster = []
    clusterEnd = -1
  }
  for (const ev of sorted) {
    if (cluster.length && ev.start >= clusterEnd) flush()
    cluster.push(ev)
    clusterEnd = Math.max(clusterEnd, ev.end)
  }
  flush()
  return result
}

export default function Calendar() {
  const { events, tasks, addEvent, updateEvent, removeEvent } = useDashboard()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [form, setForm] = useState(null)
  const [formError, setFormError] = useState('')
  const [mobileDay, setMobileDay] = useState(() => (new Date().getDay() + 6) % 7)

  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate])
  const today = new Date()

  const eventStart = (e) => e.start_minute ?? (e.hour ?? 0) * 60
  const eventEnd = (e) => e.end_minute ?? eventStart(e) + 60

  const getDayItems = (dateStr) => {
    const items = events
      .filter(e => e.date === dateStr)
      .map(e => ({ ...e, type: 'event', start: eventStart(e), end: eventEnd(e) }))
    const dayTasks = tasks.filter(t => t.due_date === dateStr && !t.completed)
    if (dayTasks.length > 0) {
      items.push({
        id: 'tasks-' + dateStr,
        type: 'task',
        title: `${dayTasks.length} tache${dayTasks.length > 1 ? 's' : ''} a faire`,
        color: 'warning',
        start: 8 * 60,
        end: 8 * 60 + 35,
      })
    }
    return layoutDay(items)
  }

  const navigateWeek = (dir) => {
    const d = new Date(currentDate)
    d.setDate(d.getDate() + dir * 7)
    setCurrentDate(d)
  }

  const openNew = (dateStr, start) => {
    setFormError('')
    const s = Math.min(Math.max(start, START_H * 60), END_H * 60 - 60)
    setForm({ id: null, date: dateStr, start: s, end: Math.min(s + 60, END_H * 60), title: '', color: 'accent' })
  }

  const onCellClick = (e, dateStr) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const raw = START_H * 60 + Math.round(((e.clientY - rect.top) / PX_PER_MIN) / 15) * 15
    openNew(dateStr, raw)
  }

  const openEdit = (ev) => {
    if (ev.type !== 'event') return
    setFormError('')
    setForm({ id: ev.id, date: ev.date, start: ev.start, end: ev.end, title: ev.title, color: ev.color || 'accent' })
  }

  const save = async () => {
    if (!form || !form.title.trim()) return
    if (form.end <= form.start) { setFormError('La fin doit etre apres le debut'); return }
    if (form.id) {
      await updateEvent(form.id, form.title.trim(), form.date, form.start, form.end, form.color)
    } else {
      await addEvent(form.title.trim(), form.date, form.start, form.end, form.color)
    }
    setForm(null)
    setFormError('')
  }

  const remove = async () => {
    if (!form?.id) return
    if (!window.confirm('Supprimer ce bloc ?')) return
    await removeEvent(form.id)
    setForm(null)
  }

  const weekLabel = `${MONTHS[weekDates[0].getMonth()]} ${weekDates[0].getFullYear()}`
  const hours = Array.from({ length: END_H - START_H }, (_, i) => START_H + i)
  const inputStyle = { background: 'var(--color-bg)', border: '1px solid var(--color-border)' }

  const renderBlock = (ev, onOpen) => {
    const c = COLORS[ev.color] || COLORS.accent
    const height = Math.max(18, (ev.end - ev.start) * PX_PER_MIN - 3)
    const width = 100 / ev.total
    const isOpenable = ev.type === 'event'
    return (
      <div key={ev.id}
        onClick={(e) => { e.stopPropagation(); if (isOpenable) openEdit(ev) }}
        className="absolute rounded-md px-1.5 py-1 overflow-hidden"
        style={{
          top: (ev.start - START_H * 60) * PX_PER_MIN + 1,
          height,
          left: `calc(${ev.lane * width}% + 2px)`,
          width: `calc(${width}% - 4px)`,
          background: `${c}1F`,
          border: `1px solid ${c}66`,
          cursor: isOpenable ? 'pointer' : 'default',
        }}
        title={`${ev.title} (${minToTime(ev.start)}–${minToTime(ev.end)})`}>
        <span className={`block text-[10px] font-medium ${height >= 46 ? 'whitespace-pre-wrap break-words line-clamp-3' : 'truncate'}`}
          style={{ color: c }}>
          {ev.title}
        </span>
        {height >= 46 && (
          <span className="block text-[9px] truncate" style={{ color: 'var(--color-muted)' }}>
            {minToTime(ev.start)}–{minToTime(ev.end)}
          </span>
        )}
        {onOpen}
      </div>
    )
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
          <button onClick={() => setCurrentDate(new Date())} className="px-1.5 sm:px-2 py-1 text-[10px] sm:text-xs rounded-lg transition-all duration-200" style={{ color: '#2563EB', border: '1px solid rgba(37,99,235,0.2)' }}>Auj.</button>
          <button onClick={() => navigateWeek(-1)} aria-label="Semaine precedente" className="p-1 rounded-lg transition-colors" style={{ color: 'var(--color-muted)' }}>
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => navigateWeek(1)} aria-label="Semaine suivante" className="p-1 rounded-lg transition-colors" style={{ color: 'var(--color-muted)' }}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Desktop: grille continue a la minute */}
      <div className="hidden md:block overflow-x-auto">
        <div style={{ minWidth: 760 }}>
          <div className="grid" style={{ gridTemplateColumns: '44px repeat(7, minmax(92px, 1fr))' }}>
            <div />
            {weekDates.map((d, i) => {
              const isToday = isSameDay(d, today)
              return (
                <div key={i} className="text-center py-2 text-[11px] font-medium"
                  style={{ borderBottom: '1px solid var(--color-border)', color: isToday ? '#2563EB' : 'var(--color-muted)', background: isToday ? 'rgba(37,99,235,0.05)' : 'transparent' }}>
                  {DAYS[i]} <span style={{ color: isToday ? '#2563EB' : 'var(--color-text)' }}>{d.getDate()}</span>
                </div>
              )
            })}
          </div>

          <div className="grid" style={{ gridTemplateColumns: '44px repeat(7, minmax(92px, 1fr))' }}>
            <div className="relative" style={{ height: GRID_H, borderBottom: '1px solid var(--color-border)' }}>
              {hours.map(h => (
                <span key={h} className="absolute text-[9px] pr-1.5 text-right"
                  style={{ top: (h - START_H) * 60 * PX_PER_MIN - 5, right: 0, width: 36, color: 'var(--color-muted)' }}>
                  {h}h
                </span>
              ))}
            </div>

            {weekDates.map((d, di) => {
              const dateStr = formatDate(d)
              const isToday = isSameDay(d, today)
              const items = getDayItems(dateStr)
              return (
                <div key={di}
                  onClick={(e) => onCellClick(e, dateStr)}
                  className="relative"
                  style={{
                    height: GRID_H,
                    borderLeft: '1px solid var(--color-border)',
                    borderBottom: '1px solid var(--color-border)',
                    background: isToday ? 'rgba(37,99,235,0.05)' : 'transparent',
                    cursor: 'crosshair',
                  }}>
                  {hours.map(h => (
                    <div key={h} className="absolute left-0 right-0"
                      style={{ top: (h - START_H) * 60 * PX_PER_MIN, borderTop: '1px solid var(--color-border)', opacity: 0.55 }} />
                  ))}
                  {items.map(ev => renderBlock(ev))}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Mobile: day tabs + liste */}
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
          {getDayItems(formatDate(weekDates[mobileDay])).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Aucun evenement</p>
              <button onClick={() => openNew(formatDate(weekDates[mobileDay]), 9 * 60)}
                className="mt-3 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200"
                style={{ background: 'rgba(37,99,235,0.1)', color: '#2563EB', border: '1px solid rgba(37,99,235,0.2)' }}>
                <Plus size={12} className="inline mr-1" /> Ajouter
              </button>
            </div>
          ) : (
            <>
              {getDayItems(formatDate(weekDates[mobileDay])).map((ev) => {
                const c = COLORS[ev.color] || COLORS.accent
                return (
                  <div key={ev.id} onClick={() => openEdit(ev)}
                    className="flex items-start gap-3 p-3 rounded-xl transition-all duration-200"
                    style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', cursor: ev.type === 'event' ? 'pointer' : 'default' }}>
                    <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ background: c }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium whitespace-pre-wrap break-words">{ev.title}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-muted)' }}>{minToTime(ev.start)}–{minToTime(ev.end)}</p>
                    </div>
                    {ev.type === 'event' && (
                      <button onClick={(e) => { e.stopPropagation(); removeEvent(ev.id) }} className="text-[10px] px-2 py-1 rounded-lg transition-colors"
                        style={{ color: 'var(--color-muted)' }}>x</button>
                    )}
                  </div>
                )
              })}
              <button onClick={() => {
                const now = new Date()
                const cur = now.getHours() * 60 + Math.round(now.getMinutes() / 15) * 15
                openNew(formatDate(weekDates[mobileDay]), Math.min(Math.max(cur, START_H * 60), END_H * 60 - 60))
              }}
                className="w-full py-3 rounded-xl text-xs font-medium transition-all duration-200"
                style={{ background: 'rgba(37,99,235,0.1)', color: '#2563EB', border: '1px solid rgba(37,99,235,0.2)' }}>
                <Plus size={12} className="inline mr-1" /> Ajouter un bloc
              </button>
            </>
          )}
        </div>
      </div>

      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)' }} onClick={() => setForm(null)}>
          <div className="w-full max-w-sm rounded-xl p-4 space-y-3"
            style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}
            onClick={(e) => e.stopPropagation()}>
            <p className="text-sm font-display font-medium">{form.id ? 'Modifier le bloc' : 'Nouveau bloc'}</p>
            <p className="text-[11px]" style={{ color: 'var(--color-muted)' }}>
              {new Date(form.date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>

            <textarea placeholder="Titre ou message (le texte long s affiche en entier dans le bloc)"
              value={form.title} maxLength={500} rows={2}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-xs focus:outline-none resize-none"
              style={inputStyle} autoFocus />

            <div className="flex gap-2">
              <label className="flex-1 text-[10px]" style={{ color: 'var(--color-muted)' }}>
                Debut
                <input type="time" step={900} value={minToTime(form.start)}
                  onChange={(e) => setForm({ ...form, start: timeToMin(e.target.value) })}
                  className="mt-1 w-full px-2 py-2 rounded-lg text-xs cursor-pointer" style={inputStyle} />
              </label>
              <label className="flex-1 text-[10px]" style={{ color: 'var(--color-muted)' }}>
                Fin
                <input type="time" step={900} value={minToTime(form.end)}
                  onChange={(e) => setForm({ ...form, end: timeToMin(e.target.value) })}
                  className="mt-1 w-full px-2 py-2 rounded-lg text-xs cursor-pointer" style={inputStyle} />
              </label>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px]" style={{ color: 'var(--color-muted)' }}>Couleur</span>
              {Object.entries(COLOR_LABELS).map(([key, label]) => (
                <button key={key} onClick={() => setForm({ ...form, color: key })}
                  className="w-5 h-5 rounded-full transition-transform duration-150"
                  style={{
                    background: COLORS[key],
                    boxShadow: form.color === key ? `0 0 0 2px var(--color-surface-solid), 0 0 0 3.5px ${COLORS[key]}` : 'none',
                  }} title={label} aria-label={label} />
              ))}
            </div>

            {formError && <p className="text-[10px]" style={{ color: '#EF4444' }}>{formError}</p>}

            <div className="flex gap-2 pt-1">
              {form.id && (
                <button onClick={remove}
                  className="px-3 py-2 text-xs rounded-lg flex items-center gap-1"
                  style={{ color: '#EF4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <Trash2 size={12} /> Supprimer
                </button>
              )}
              <div className="flex gap-2 ml-auto">
                <button onClick={() => setForm(null)}
                  className="px-3 py-2 text-xs rounded-lg flex items-center gap-1.5"
                  style={{ color: 'var(--color-muted)', background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                  <X size={12} /> Fermer
                </button>
                <button onClick={save} disabled={!form.title.trim()}
                  className="px-3 py-2 text-xs font-medium rounded-lg disabled:opacity-50"
                  style={{ background: '#2563EB', color: '#FFF' }}>
                  {form.id ? 'Enregistrer' : 'Ajouter'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
