import { useState } from 'react'
import { WifiOff } from 'lucide-react'
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
import Concentration from '../components/dashboard/Concentration'
import OnboardingTutorial from '../components/dashboard/OnboardingTutorial'
import { useDashboard } from '../hooks/useDashboard'
import { useAuth } from '../hooks/useAuth'

export default function DashboardPage() {
  const { activeSection, apiError } = useDashboard()
  const { user, updateProfile } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [saving, setSaving] = useState(false)

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
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
