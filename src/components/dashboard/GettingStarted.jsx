import { useState } from 'react'
import { useDashboard } from '../../hooks/useDashboard'
import { apiFetch } from '../../utils/api'
import { Mail, CheckSquare, Calendar, Check, ArrowRight, Rocket } from 'lucide-react'

export default function GettingStarted() {
  const { services, tasks, events, setActiveSection } = useDashboard()
  const [busy, setBusy] = useState(false)

  const connectGmail = async () => {
    setBusy(true)
    try {
      const data = await apiFetch('/api/services/gmail/authorize')
      if (data.url) { window.location.href = data.url; return }
    } catch (err) { console.error('OAuth error:', err) }
    setBusy(false)
  }

  const steps = [
    {
      id: 'gmail',
      done: !!services.gmail.connected,
      icon: Mail,
      title: 'Connecte ton Gmail',
      desc: 'Tes emails arrivent ici et sont tries par priorite.',
      cta: 'Connecter',
      run: connectGmail,
    },
    {
      id: 'task',
      done: tasks.length > 0,
      icon: CheckSquare,
      title: 'Ajoute une tache',
      desc: 'Ce que tu dois faire aujourd’hui, au meme endroit.',
      cta: 'Ajouter une tache',
      run: () => setActiveSection('tasks'),
    },
    {
      id: 'cal',
      done: events.length > 0,
      icon: Calendar,
      title: 'Cale un bloc',
      desc: 'Reserve une heure dans ton calendrier en un clic.',
      cta: 'Ouvrir le calendrier',
      run: () => setActiveSection('calendar'),
    },
  ]

  const doneCount = steps.filter(s => s.done).length
  if (doneCount === steps.length) return null

  return (
    <div className="rounded-xl p-4 md:p-5 page-enter" style={{ background: 'var(--color-surface-solid)', border: '1px solid rgba(37,99,235,0.3)' }}>
      <div className="flex items-center gap-2 mb-1">
        <Rocket size={15} style={{ color: '#2563EB' }} />
        <h3 className="text-sm font-display font-medium">Par ou commencer ?</h3>
        <span className="text-[10px] px-2 py-0.5 rounded-full ml-auto" style={{ background: 'rgba(37,99,235,0.1)', color: '#2563EB' }}>
          {doneCount}/3 faits
        </span>
      </div>
      <p className="text-xs mb-4" style={{ color: 'var(--color-muted)' }}>
        Trois etapes et ton espace est pret : emails, taches et calendrier au meme endroit.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {steps.map((s, i) => (
          <div key={s.id} className="p-3 rounded-xl flex flex-col"
            style={{
              background: 'var(--color-bg)',
              border: s.done ? '1px solid rgba(16,185,129,0.35)' : '1px solid var(--color-border)',
            }}>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  background: s.done ? 'rgba(16,185,129,0.15)' : 'rgba(37,99,235,0.12)',
                  color: s.done ? '#10B981' : '#2563EB',
                }}>
                {s.done ? <Check size={13} /> : <s.icon size={13} />}
              </div>
              <span className="text-[10px] font-medium" style={{ color: 'var(--color-muted)' }}>Etape {i + 1}</span>
            </div>
            <p className="text-xs font-medium">{s.title}</p>
            <p className="text-[11px] leading-relaxed mt-0.5 flex-1" style={{ color: 'var(--color-muted)' }}>{s.desc}</p>
            {!s.done && (
              <button onClick={s.run} disabled={busy}
                className="mt-2.5 self-start px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-150 flex items-center gap-1.5 disabled:opacity-50"
                style={{ background: 'rgba(37,99,235,0.1)', color: '#2563EB', border: '1px solid rgba(37,99,235,0.25)' }}>
                {s.cta} <ArrowRight size={11} />
              </button>
            )}
            {s.done && (
              <p className="mt-2.5 text-[11px] font-medium" style={{ color: '#10B981' }}>Fait !</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
