import { useState, useEffect } from 'react'
import { WifiOff, Sparkles, ShieldCheck } from 'lucide-react'
import Sidebar from '../components/layout/Sidebar'
import TopBar from '../components/layout/TopBar'
import StatsGrid from '../components/dashboard/StatsGrid'
import ConnectedServices from '../components/dashboard/ConnectedServices'
import EmailFilter from '../components/dashboard/EmailFilter'
import WhatsAppMessages from '../components/dashboard/WhatsAppMessages'
import TodayFocus from '../components/dashboard/TodayFocus'
import QuickActions from '../components/dashboard/QuickActions'
import Calendar from '../components/dashboard/Calendar'
import Tasks from '../components/dashboard/Tasks'
import Team from '../components/dashboard/Team'
import StatsHistory from '../components/dashboard/StatsHistory'
import Concentration from '../components/dashboard/Concentration'
import OnboardingTutorial from '../components/dashboard/OnboardingTutorial'
import UpgradeButton from '../components/dashboard/UpgradeButton'
import ProPerks from '../components/dashboard/ProPerks'
import { useDashboard } from '../hooks/useDashboard'
import { useAuth } from '../hooks/useAuth'
import { apiFetch } from '../utils/api'

export default function DashboardPage() {
  const { activeSection, apiError, plan, planLimits } = useDashboard()
  const { user, updateProfile } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [saving, setSaving] = useState(false)
  const [subscription, setSubscription] = useState(undefined)

  const expiresAt = subscription?.subscription?.expires_at || null
  const daysLeft = expiresAt ? Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000)) : null
  const daysPct = daysLeft != null ? Math.max(6, Math.min(100, Math.round((daysLeft / 31) * 100))) : 0

  useEffect(() => {
    if (activeSection !== 'settings') return
    let alive = true
    apiFetch('/api/pay/subscription')
      .then((data) => { if (alive) setSubscription(data) })
      .catch(() => { if (alive) setSubscription(null) })
    return () => { alive = false }
  }, [activeSection])

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    try { await updateProfile({ name: name.trim() }) }
    finally { setSaving(false) }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <OnboardingTutorial />
      <Sidebar />

      <div className="md:ml-56 overflow-x-hidden min-h-screen">
        <TopBar />

        {apiError && (
          <div className="mx-3 md:mx-6 mt-3 flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#F59E0B' }}>
            <WifiOff size={14} className="shrink-0" />
            <span>{apiError}</span>
            <button onClick={() => window.location.reload()} className="ml-auto font-medium underline underline-offset-2 shrink-0">Reessayer</button>
          </div>
        )}

        <main className="p-3 md:p-6 max-w-[1400px] mx-auto">
          {activeSection === 'dashboard' && (
            <div className="space-y-4 md:space-y-6 page-enter">
              <StatsGrid />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="lg:col-span-2 space-y-4 md:space-y-6">
                  <ConnectedServices />
                  <EmailFilter />
                </div>
                <div className="space-y-4 md:space-y-6">
                  <TodayFocus />
                  <QuickActions />
                </div>
              </div>
              <WhatsAppMessages />
            </div>
          )}

          {activeSection === 'emails' && (
            <div className="page-enter">
              <EmailFilter />
            </div>
          )}

          {activeSection === 'messages' && (
            <div className="page-enter">
              <WhatsAppMessages />
            </div>
          )}

          {activeSection === 'calendar' && (
            <div className="page-enter">
              <Calendar />
            </div>
          )}

          {activeSection === 'tasks' && (
            <div className="page-enter">
              <Tasks />
            </div>
          )}

          {activeSection === 'stats' && (
            <div className="page-enter">
              <StatsHistory />
            </div>
          )}

          {activeSection === 'team' && (
            <div className="page-enter max-w-2xl">
              <Team />
            </div>
          )}

          {activeSection === 'concentration' && (
            <div className="page-enter">
              <Concentration />
            </div>
          )}

          {activeSection === 'settings' && (
            <div className="page-enter max-w-xl">
              <div className="rounded-2xl p-5 md:p-6" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>
                <h3 className="text-base font-display font-medium mb-6">Parametres</h3>
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs text-muted mb-1.5">Nom</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-accent transition-all duration-200"
                      style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }} />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1.5">Email</label>
                    <input type="email" value={user?.email || ''} disabled
                      className="w-full px-4 py-2.5 rounded-xl text-sm cursor-not-allowed opacity-60"
                      style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }} />
                    <p className="text-[10px] text-muted mt-1">L'email ne peut pas etre modifie</p>
                  </div>
                  <button onClick={handleSave} disabled={saving || !name.trim()}
                    className="px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 hover:opacity-90 disabled:opacity-50"
                    style={{ background: 'var(--color-accent)', color: 'var(--color-bg)' }}>
                    {saving ? 'Enregistrement...' : 'Sauvegarder'}
                  </button>
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>
                <div className="flex items-center justify-between px-5 md:px-6 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: plan === 'pro' ? 'rgba(16,185,129,0.12)' : 'rgba(37,99,235,0.1)', color: plan === 'pro' ? '#10B981' : '#2563EB' }}>
                      <Sparkles size={14} />
                    </span>
                    <h3 className="text-base font-display font-medium">Abonnement</h3>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={plan === 'pro'
                    ? { background: 'rgba(16,185,129,0.12)', color: '#10B981' }
                    : { background: 'rgba(37,99,235,0.1)', color: '#2563EB' }}>
                    {plan === 'pro' ? 'Pro' : 'Gratuit'}
                  </span>
                </div>

                {plan === 'pro' ? (
                  <div className="px-5 md:px-6 py-5 space-y-5">
                    <div>
                      <div className="flex items-baseline justify-between gap-3 mb-2">
                        <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Formule Pro active</span>
                        <span className="text-[11px] shrink-0" style={{ color: 'var(--color-muted)' }}>
                          {expiresAt
                            ? `Expire le ${new Date(expiresAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`
                            : 'Duree illimitee'}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
                        <div className="h-full rounded-full" style={{ width: `${expiresAt ? daysPct : 100}%`, background: '#10B981' }} />
                      </div>
                      <p className="text-[11px] mt-1.5" style={{ color: 'var(--color-muted)' }}>
                        {expiresAt
                          ? daysLeft > 0
                            ? `Il reste ${daysLeft} jour${daysLeft > 1 ? 's' : ''} avant le retour en formule gratuite`
                            : 'Dernier jour de ta formule Pro'
                          : 'Acces complet debloque'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] mb-2 font-medium" style={{ color: 'var(--color-muted)' }}>Ce que tu as :</p>
                      <ProPerks />
                    </div>
                  </div>
                ) : (
                  <div className="px-5 md:px-6 py-5 space-y-4">
                    <div>
                      <p className="text-[11px] mb-2 font-medium" style={{ color: 'var(--color-muted)' }}>Ta formule gratuite</p>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          `${planLimits ? planLimits.teams : 1} equipe${(planLimits ? planLimits.teams : 1) > 1 ? 's' : ''} max`,
                          `${planLimits ? planLimits.teamMembers : 3} membres max`,
                          '1 compte Gmail',
                          `stats ${planLimits ? planLimits.focusDays : 7} jours`,
                        ].map((chip) => (
                          <span key={chip} className="px-2 py-1 rounded-lg text-[11px]"
                            style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}>
                            {chip}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl p-4" style={{ background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.25)' }}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: '#2563EB' }}>
                          <Sparkles size={12} /> Passer en Pro
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(37,99,235,0.12)', color: '#2563EB' }}>
                          offre decouverte
                        </span>
                      </div>

                      <div className="flex items-baseline flex-wrap gap-x-1.5 mb-3">
                        <span className="text-3xl font-display font-semibold tracking-tight" style={{ color: 'var(--color-text)' }}>2000</span>
                        <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>FCFA</span>
                        <span className="text-[11px]" style={{ color: 'var(--color-muted)' }}>/ 1er mois</span>
                        <span className="text-[11px] w-full sm:w-auto sm:ml-1" style={{ color: 'var(--color-muted)' }}>puis 2500 FCFA / mois</span>
                      </div>

                      <ProPerks className="mb-4" />

                      <UpgradeButton full />

                      <p className="flex items-start gap-1.5 text-[10px] leading-relaxed mt-2.5" style={{ color: 'var(--color-muted)' }}>
                        <ShieldCheck size={12} className="shrink-0 mt-px" />
                        Paiement securise. Pas de prelevement automatique : tu gardes Pro 31 jours, puis tu choisis si tu renouvelles.
                      </p>
                    </div>
                  </div>
                )}

                <div className="px-5 md:px-6 py-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                  <button type="button"
                    onClick={() => {
                      localStorage.removeItem('personalplace_onboarding_seen')
                      window.dispatchEvent(new Event('tutorial:restart'))
                    }}
                    className="w-full text-[11px] text-center transition-colors py-0.5"
                    style={{ color: 'var(--color-muted)' }}>
                    Revoir le tutoriel
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
