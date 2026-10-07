import { useEffect, useState } from 'react'
import { useDashboard } from '../../hooks/useDashboard'
import { PartyPopper, Calendar, ArrowRight, X, Loader2, Plus } from 'lucide-react'

const DONE = 'pp_first_task_done'
const LATER = 'pp_first_task_later'
const SUGGESTIONS = ['Repondre a mes emails', 'Faire les courses', 'Appeler un ami', 'Sport 30 min']

export default function FirstTaskModal() {
  const { tasks, addTask, tasksLoaded } = useDashboard()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [adding, setAdding] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!tasksLoaded) return
    if (localStorage.getItem(DONE) || sessionStorage.getItem(LATER)) return
    if (tasks.length > 0) { localStorage.setItem(DONE, '1'); return }
    // Apres le tutoriel d onboarding pour ne pas superposer les overlays
    if (!localStorage.getItem('personalplace_onboarding_seen')) return
    setOpen(true)
  }, [tasksLoaded, tasks])

  useEffect(() => {
    const hide = () => setOpen(false)
    window.addEventListener('tutorial:restart', hide)
    return () => window.removeEventListener('tutorial:restart', hide)
  }, [])

  if (!open) return null

  const dismiss = () => {
    sessionStorage.setItem(LATER, '1')
    setOpen(false)
  }

  const submit = async (e) => {
    if (e) e.preventDefault()
    const t = title.trim()
    if (!t || adding) return
    setAdding(true)
    const created = await addTask(t, 'medium', new Date().toLocaleDateString('sv-SE'), null, null)
    setAdding(false)
    if (!created) return
    localStorage.setItem(DONE, '1')
    setDone(true)
    // Suggere les notifications au moment ou la premiere tache existe
    setTimeout(() => window.dispatchEvent(new Event('push:prompt')), 1800)
    setTimeout(() => setOpen(false), 2600)
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-toast-in" style={{ background: 'rgba(0,0,0,0.55)' }}>
      <div className="w-full max-w-md rounded-2xl p-5 md:p-6 relative" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>
        {!done && (
          <button onClick={dismiss} aria-label="Plus tard"
            className="absolute top-3 right-3 p-1 rounded-lg transition-colors" style={{ color: 'var(--color-muted)' }}>
            <X size={16} />
          </button>
        )}

        {!done ? (
          <>
            <span className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ background: 'rgba(37,99,235,0.12)', color: '#2563EB' }}>
              <Plus size={18} />
            </span>
            <h2 className="text-base font-display font-semibold mb-1">Ta premiere tache ?</h2>
            <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--color-muted)' }}>
              Un espace utile, ca commence par une action. Ecris ta tache la plus simple et coche-la.
            </p>

            <form onSubmit={submit}>
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex : Repondre a mes emails"
                maxLength={120}
                className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-accent transition-all duration-200"
                style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
              />
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {SUGGESTIONS.map((s) => (
                  <button key={s} type="button"
                    onClick={() => { setTitle(s) }}
                    className="px-2.5 py-1 rounded-lg text-[11px] transition-colors"
                    style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}>
                    {s}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between gap-3 mt-4 flex-wrap">
                <span className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--color-muted)' }}>
                  <Calendar size={12} /> Prevue aujourd'hui
                </span>
                <button type="submit" disabled={adding || !title.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 disabled:opacity-50 ml-auto"
                  style={{ background: '#2563EB', color: '#ffffff' }}>
                  {adding ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
                  {adding ? 'Ajout...' : 'Creer ma tache'}
                </button>
              </div>
            </form>

            <button onClick={dismiss} className="w-full mt-3 text-[11px] text-center transition-colors py-0.5" style={{ color: 'var(--color-muted)' }}>
              Plus tard
            </button>
          </>
        ) : (
          <div className="text-center py-2">
            <span className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center mb-3"
              style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981' }}>
              <PartyPopper size={22} />
            </span>
            <h2 className="text-base font-display font-semibold mb-1">Premiere tache creee !</h2>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              C'est parti. Active les notifications pour ne pas rater les retards et les taches du jour.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
