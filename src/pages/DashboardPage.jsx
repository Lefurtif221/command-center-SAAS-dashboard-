import { useState } from 'react'
import Sidebar from '../components/layout/Sidebar'
import TopBar from '../components/layout/TopBar'
import StatsGrid from '../components/dashboard/StatsGrid'
import ConnectedServices from '../components/dashboard/ConnectedServices'
import EmailFilter from '../components/dashboard/EmailFilter'
import TodayFocus from '../components/dashboard/TodayFocus'
import QuickActions from '../components/dashboard/QuickActions'
import Calendar from '../components/dashboard/Calendar'
import Tasks from '../components/dashboard/Tasks'
import Concentration from '../components/dashboard/Concentration'
import { useDashboard } from '../hooks/useDashboard'
import { useAuth } from '../hooks/useAuth'

export default function DashboardPage() {
  const { activeSection } = useDashboard()
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
    <div className="min-h-screen bg-bg">
      <Sidebar />

      <div className="md:ml-56">
        <TopBar />

        <main className="p-4 md:p-6">
          {activeSection === 'dashboard' && (
            <div className="space-y-4 md:space-y-6 animate-fade-in">
              <StatsGrid />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="lg:col-span-2">
                  <ConnectedServices />
                </div>
                <TodayFocus />
              </div>
              <EmailFilter />
              <QuickActions />
            </div>
          )}

          {activeSection === 'emails' && (
            <div>
              <EmailFilter />
            </div>
          )}

          {activeSection === 'messages' && (
            <div className="animate-fade-in">
              <div className="bg-surface border border-border rounded-lg p-6 md:p-8 text-center">
                <span className="iconify text-muted mx-auto mb-3" data-icon="lucide:message-square" data-width="48"></span>
                <h3 className="text-lg font-medium mb-2">Messages</h3>
                <p className="text-sm text-muted mb-4">WhatsApp et autres services de messagerie.</p>
                <a href="https://web.whatsapp.com" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-bg text-sm font-medium rounded-lg hover:bg-[#33c2ff] transition-colors">
                  <span className="iconify" data-icon="lucide:external-link" data-width="14"></span>
                  Ouvrir WhatsApp Web
                </a>
              </div>
            </div>
          )}

          {activeSection === 'calendar' && (
            <div className="animate-fade-in">
              <Calendar />
            </div>
          )}

          {activeSection === 'tasks' && (
            <div className="animate-fade-in">
              <Tasks />
            </div>
          )}

          {activeSection === 'concentration' && (
            <div className="animate-fade-in">
              <Concentration />
            </div>
          )}

          {activeSection === 'settings' && (
            <div className="animate-fade-in">
              <div className="bg-surface border border-border rounded-lg p-4 md:p-6 max-w-2xl">
                <h3 className="text-sm font-medium mb-6">Paramètres</h3>
                <div className="space-y-4 md:space-y-6">
                  <div>
                    <label className="block text-xs text-muted mb-1.5">Nom</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm text-text focus:outline-none focus:border-accent transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1.5">Email</label>
                    <input type="email" value={user?.email || ''} disabled className="w-full px-3 py-2 bg-bg/50 border border-border rounded-lg text-sm text-muted cursor-not-allowed" />
                    <p className="text-[10px] text-muted mt-1">L'email ne peut pas être modifié</p>
                  </div>
                  <button onClick={handleSave} disabled={saving || !name.trim()} className="px-4 py-2 bg-accent text-bg text-sm font-medium rounded-lg hover:bg-[#33c2ff] transition-colors disabled:opacity-50">
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
