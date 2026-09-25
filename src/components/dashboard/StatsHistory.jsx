import { useState, useEffect } from 'react'
import { useDashboard } from '../../hooks/useDashboard'
import { apiFetch } from '../../utils/api'
import { Timer, Layers, CheckSquare, Flame, RefreshCw, Lock } from 'lucide-react'
import UpgradeButton from './UpgradeButton'

const kpis = [
  { key: 'focusMinutes', label: 'Minutes de focus', icon: Timer, accent: '#2563EB', suffix: 'min' },
  { key: 'sessions', label: 'Sessions terminees', icon: Layers, accent: '#1E40AF', suffix: '' },
  { key: 'tasksDone', label: 'Taches terminees', icon: CheckSquare, accent: '#10B981', suffix: '' },
  { key: 'streak', label: 'Jours d\'affilee', icon: Flame, accent: '#F59E0B', suffix: 'j' },
]

function dayLabel(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('fr-FR', { weekday: 'short' }).slice(0, 3)
}

export default function StatsHistory() {
  const { plan } = useDashboard()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await apiFetch('/api/stats/overview?days=30')
      setData(res)
    } catch (err) {
      setError(err.message || 'Impossible de charger les statistiques')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const focus = data?.focus || []
  const tasks = data?.tasks || []
  const totals = data?.totals || { focusMinutes: 0, sessions: 0, tasksDone: 0 }
  const maxMinutes = Math.max(1, ...focus.map((f) => f.minutes))
  const maxTasks = Math.max(1, ...tasks.map((t) => t.count))
  const hasData = totals.sessions > 0 || totals.tasksDone > 0

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg md:text-xl font-display font-semibold tracking-tight">Statistiques</h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
            {data ? `Derniers ${data.days} jours` : 'Historique de concentration'}
          </p>
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors duration-150 disabled:opacity-50"
          style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}>
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      {plan === 'free' && (
        <div className="flex flex-wrap items-center gap-3 px-3.5 py-3 rounded-lg text-xs"
          style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.25)', color: '#2563EB' }}>
          <Lock size={14} className="shrink-0" />
          <span className="flex-1 min-w-[200px]">
            Formule gratuite : 7 derniers jours d'historique. Pro garde 365 jours — 2 000 FCFA / 31 jours.
          </span>
          <UpgradeButton size="sm" />
        </div>
      )}

      {error && (
        <div className="px-3.5 py-2.5 rounded-lg text-xs"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}>
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {kpis.map((card) => {
          const value = card.key === 'streak' ? data?.streak ?? 0 : totals[card.key] ?? 0
          return (
            <div key={card.key} className="rounded-xl p-4 md:p-5"
              style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>
              <div className="flex items-center gap-2 mb-2">
                <card.icon size={13} style={{ color: card.accent }} />
                <span className="text-[11px]" style={{ color: 'var(--color-muted)' }}>{card.label}</span>
              </div>
              <div className="text-2xl md:text-3xl font-display font-semibold tracking-tight leading-none">
                {loading ? '...' : value}
                {!loading && card.suffix && <span className="text-sm font-medium ml-1" style={{ color: 'var(--color-muted)' }}>{card.suffix}</span>}
              </div>
            </div>
          )
        })}
      </div>

      <div className="rounded-xl p-4 md:p-5"
        style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px]" style={{ color: 'var(--color-muted)' }}>Minutes de focus par jour</span>
          <span className="text-[11px]" style={{ color: 'var(--color-muted)' }}>max {maxMinutes} min</span>
        </div>
        {loading ? (
          <div className="h-40 flex items-center justify-center text-xs" style={{ color: 'var(--color-muted)' }}>Chargement...</div>
        ) : !hasData ? (
          <div className="h-40 flex flex-col items-center justify-center gap-1.5 text-center">
            <Timer size={20} style={{ color: 'var(--color-muted)' }} />
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Aucune session enregistree</p>
            <p className="text-[11px]" style={{ color: 'var(--color-muted)' }}>Lance un Pomodoro dans Concentration</p>
          </div>
        ) : (
          <>
            <div className="flex items-end gap-1 h-40">
              {focus.map((f) => (
                <div key={f.date} className="flex-1 h-full flex flex-col justify-end items-center gap-1">
                  {f.minutes > 0 && <span className="text-[9px]" style={{ color: 'var(--color-muted)' }}>{f.minutes}</span>}
                  <div
                    className="w-full rounded-t"
                    title={`${f.date} : ${f.minutes} min`}
                    style={{
                      height: f.minutes > 0 ? `${Math.max((f.minutes / maxMinutes) * 88, 6)}%` : '2px',
                      background: f.minutes > 0 ? '#2563EB' : 'var(--color-border)',
                    }} />
                </div>
              ))}
            </div>
            <div className="flex gap-1 mt-2">
              {focus.map((f) => (
                <span key={f.date} className="flex-1 text-center text-[9px]" style={{ color: 'var(--color-muted)' }}>
                  {dayLabel(f.date)}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {!loading && hasData && (
        <div className="rounded-xl p-4 md:p-5"
          style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>
          <span className="text-[11px]" style={{ color: 'var(--color-muted)' }}>Taches terminees par jour</span>
          <div className="flex items-end gap-1 h-20 mt-4">
            {tasks.map((t) => (
              <div key={t.date} className="flex-1 h-full flex flex-col justify-end items-center gap-1">
                {t.count > 0 && <span className="text-[9px]" style={{ color: 'var(--color-muted)' }}>{t.count}</span>}
                <div
                  className="w-full rounded-t"
                  title={`${t.date} : ${t.count} tache(s)`}
                  style={{
                    height: t.count > 0 ? `${Math.max((t.count / maxTasks) * 88, 6)}%` : '2px',
                    background: t.count > 0 ? '#10B981' : 'var(--color-border)',
                  }} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
