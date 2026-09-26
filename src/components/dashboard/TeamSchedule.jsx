import { useState, useEffect, useCallback } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { apiFetch } from '../../utils/api'

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const START_H = 6
const END_H = 22
const PX_PER_MIN = 0.85
const GRID_H = (END_H - START_H) * 60 * PX_PER_MIN
const COLORS = { blue: '#2563EB', green: '#10B981', amber: '#F59E0B', violet: '#8B5CF6', rose: '#F43F5E', gray: '#6B7280' }

const isoDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const mondayOf = (date) => {
  const x = new Date(date)
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7))
  x.setHours(0, 0, 0, 0)
  return x
}
const addDaysIso = (isoStr, n) => {
  const d = new Date(`${isoStr}T00:00:00`)
  d.setDate(d.getDate() + n)
  return isoDate(d)
}
const minToTime = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
const timeToMin = (t) => {
  const [h, m] = t.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}
const shortDay = (d) => d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }).replace('.', '')

export default function TeamSchedule({ teamId, canManage }) {
  const [weekStart, setWeekStart] = useState(() => isoDate(mondayOf(new Date())))
  const [entries, setEntries] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [form, setForm] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!teamId) { setEntries([]); setLoaded(true); return }
    setLoaded(false)
    try {
      const data = await apiFetch(`/api/teams/${teamId}/schedule?week=${weekStart}`)
      setEntries(data.entries)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoaded(true)
    }
  }, [teamId, weekStart])

  useEffect(() => { load() }, [load])

  const days = DAYS.map((label, idx) => {
    const date = new Date(`${addDaysIso(weekStart, idx)}T00:00:00`)
    const todayIso = isoDate(new Date())
    return { idx, label, num: date.getDate(), isToday: addDaysIso(weekStart, idx) === todayIso }
  })
  const weekLabel = `Semaine du ${shortDay(new Date(`${weekStart}T00:00:00`))} au ${shortDay(new Date(`${addDaysIso(weekStart, 6)}T00:00:00`))}`

  const openNew = (day, start) => {
    setError('')
    setForm({ id: null, day, start, end: Math.min(start + 60, END_H * 60), label: '', color: 'blue' })
  }

  const onCellClick = (e, dayIdx) => {
    if (!canManage) return
    const rect = e.currentTarget.getBoundingClientRect()
    const raw = START_H * 60 + Math.round(((e.clientY - rect.top) / PX_PER_MIN) / 15) * 15
    const start = Math.min(Math.max(raw, START_H * 60), END_H * 60 - 60)
    openNew(dayIdx, start)
  }

  const save = async () => {
    if (!form || !form.label.trim()) return
    if (form.end <= form.start) { setError('La fin doit être après le début'); return }
    setBusy(true); setError('')
    const body = JSON.stringify({ week: weekStart, day: form.day, start_minute: form.start, end_minute: form.end, label: form.label.trim(), color: form.color })
    try {
      if (form.id) {
        await apiFetch(`/api/teams/${teamId}/schedule/${form.id}`, { method: 'PUT', body })
      } else {
        await apiFetch(`/api/teams/${teamId}/schedule`, { method: 'POST', body })
      }
      setForm(null)
      await load()
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  const remove = async () => {
    if (!form?.id) return
    if (!window.confirm('Supprimer ce bloc ?')) return
    setBusy(true); setError('')
    try {
      await apiFetch(`/api/teams/${teamId}/schedule/${form.id}`, { method: 'DELETE' })
      setForm(null)
      await load()
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  const inputStyle = { background: 'var(--color-bg)', border: '1px solid var(--color-border)' }
  const hours = Array.from({ length: END_H - START_H }, (_, i) => START_H + i)

  if (!teamId) return null

  return (
    <div className="rounded-xl" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>
      <div className="flex items-center gap-2 px-4 pt-4 pb-3 flex-wrap">
        <CalendarDays size={14} style={{ color: '#2563EB' }} />
        <h3 className="text-sm font-display font-medium">Emploi du temps</h3>
        <div className="flex items-center gap-1 ml-2">
          <button onClick={() => setWeekStart(addDaysIso(weekStart, -7))} aria-label="Semaine précédente"
            className="p-1.5 rounded-lg transition-colors duration-150" style={{ color: 'var(--color-muted)', background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
            <ChevronLeft size={13} />
          </button>
          <span className="text-[11px] px-1.5" style={{ color: 'var(--color-muted)' }}>{weekLabel}</span>
          <button onClick={() => setWeekStart(addDaysIso(weekStart, 7))} aria-label="Semaine suivante"
            className="p-1.5 rounded-lg transition-colors duration-150" style={{ color: 'var(--color-muted)', background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
            <ChevronRight size={13} />
          </button>
        </div>
        <button onClick={() => setWeekStart(isoDate(mondayOf(new Date())))}
          className="text-[10px] px-2 py-1 rounded-lg transition-colors duration-150"
          style={{ color: '#2563EB', background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.25)' }}>
          Cette semaine
        </button>
        {canManage && (
          <button onClick={() => openNew((new Date().getDay() + 6) % 7, 9 * 60)}
            className="ml-auto px-3 py-1.5 text-xs font-medium rounded-lg transition-colors duration-150 flex items-center gap-1.5"
            style={{ background: '#2563EB', color: '#FFF' }}>
            <Plus size={13} /> Bloc
          </button>
        )}
      </div>

      {error && !form && (
        <div className="mx-4 mb-3 p-2.5 rounded-lg text-xs" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}>{error}</div>
      )}

      <div className="px-4 pb-4">
        {!loaded ? (
          <p className="text-xs py-6 text-center" style={{ color: 'var(--color-muted)' }}>Chargement…</p>
        ) : entries.length === 0 && !canManage ? (
          <p className="text-xs py-6 text-center" style={{ color: 'var(--color-muted)' }}>
            L'admin n'a pas encore publié de planning pour cette semaine.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <div style={{ minWidth: 760 }}>
              <div className="grid" style={{ gridTemplateColumns: '44px repeat(7, minmax(92px, 1fr))' }}>
                <div />
                {days.map(d => (
                  <div key={d.idx} className="text-center py-2 text-[11px] font-medium"
                    style={{
                      borderBottom: '1px solid var(--color-border)',
                      color: d.isToday ? '#2563EB' : 'var(--color-muted)',
                    }}>
                    {d.label} <span style={{ color: d.isToday ? '#2563EB' : 'var(--color-text)' }}>{d.num}</span>
                  </div>
                ))}
              </div>

              <div className="grid" style={{ gridTemplateColumns: '44px repeat(7, minmax(92px, 1fr))', borderBottom: '1px solid var(--color-border)' }}>
                <div className="relative" style={{ height: GRID_H }}>
                  {hours.map(h => (
                    <span key={h} className="absolute text-[9px] pr-1.5 text-right"
                      style={{ top: (h - START_H) * 60 * PX_PER_MIN - 5, right: 0, width: 36, color: 'var(--color-muted)' }}>
                      {h}h
                    </span>
                  ))}
                </div>

                {days.map(d => {
                  const dayEntries = entries.filter(e => e.day_of_week === d.idx)
                  return (
                    <div key={d.idx} className="relative" style={{ height: GRID_H, borderLeft: '1px solid var(--color-border)' }}
                      onClick={(e) => onCellClick(e, d.idx)}>
                      {hours.map(h => (
                        <div key={h} className="absolute left-0 right-0"
                          style={{ top: (h - START_H) * 60 * PX_PER_MIN, borderTop: '1px solid var(--color-border)', opacity: 0.55 }} />
                      ))}
                      {dayEntries.map(e => {
                        const c = COLORS[e.color] || COLORS.blue
                        return (
                          <div key={e.id}
                            onClick={(ev) => {
                              ev.stopPropagation()
                              if (!canManage) return
                              setError('')
                              setForm({ id: e.id, day: e.day_of_week, start: e.start_minute, end: e.end_minute, label: e.label, color: e.color })
                            }}
                            className="absolute rounded-md px-1.5 py-1 overflow-hidden cursor-pointer"
                            style={{
                              top: (e.start_minute - START_H * 60) * PX_PER_MIN + 1,
                              height: Math.max(20, (e.end_minute - e.start_minute) * PX_PER_MIN - 3),
                              left: 2,
                              right: 2,
                              background: `${c}1F`,
                              border: `1px solid ${c}66`,
                            }}
                            title={`${e.label} (${minToTime(e.start_minute)}–${minToTime(e.end_minute)})`}>
                            <span className="block text-[10px] font-medium truncate" style={{ color: c }}>{e.label}</span>
                            <span className="block text-[9px] truncate" style={{ color: 'var(--color-muted)' }}>
                              {minToTime(e.start_minute)}–{minToTime(e.end_minute)}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)' }} onClick={() => setForm(null)}>
          <div className="w-full max-w-sm rounded-xl p-4 space-y-3"
            style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}
            onClick={(e) => e.stopPropagation()}>
            <p className="text-sm font-display font-medium">{form.id ? 'Modifier le bloc' : 'Nouveau bloc'}</p>

            <input type="text" placeholder="Titre (Réunion, Congé, Focus…)" value={form.label} maxLength={120}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-xs focus:outline-none" style={inputStyle} />

            <div className="flex gap-2">
              <label className="flex-1 text-[10px]" style={{ color: 'var(--color-muted)' }}>
                Jour
                <select value={form.day} onChange={(e) => setForm({ ...form, day: Number(e.target.value) })}
                  className="mt-1 w-full px-2 py-2 rounded-lg text-xs cursor-pointer" style={inputStyle}>
                  {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
                </select>
              </label>
              <label className="flex-1 text-[10px]" style={{ color: 'var(--color-muted)' }}>
                Début
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
              {Object.entries(COLORS).map(([name, hex]) => (
                <button key={name} onClick={() => setForm({ ...form, color: name })} aria-label={`Couleur ${name}`}
                  className="w-5 h-5 rounded-full transition-transform duration-150"
                  style={{
                    background: hex,
                    boxShadow: form.color === name ? '0 0 0 2px var(--color-surface-solid), 0 0 0 3.5px' + hex : 'none',
                  }} />
              ))}
            </div>

            {error && <p className="text-[10px]" style={{ color: '#EF4444' }}>{error}</p>}

            <div className="flex items-center gap-2 pt-1">
              {form.id && (
                <button onClick={remove} disabled={busy}
                  className="px-3 py-2 text-xs rounded-lg flex items-center gap-1 disabled:opacity-50"
                  style={{ color: '#EF4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <Trash2 size={12} /> Supprimer
                </button>
              )}
              <div className="flex gap-2 ml-auto">
                <button onClick={() => setForm(null)}
                  className="px-3 py-2 text-xs rounded-lg" style={{ color: 'var(--color-muted)', background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                  Annuler
                </button>
                <button onClick={save} disabled={busy || !form.label.trim()}
                  className="px-3 py-2 text-xs font-medium rounded-lg disabled:opacity-50"
                  style={{ background: '#2563EB', color: '#FFF' }}>
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
