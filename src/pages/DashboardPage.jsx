import Sidebar from '../components/layout/Sidebar'
import TopBar from '../components/layout/TopBar'
import StatsGrid from '../components/dashboard/StatsGrid'
import ConnectedServices from '../components/dashboard/ConnectedServices'
import EmailFilter from '../components/dashboard/EmailFilter'
import TodayFocus from '../components/dashboard/TodayFocus'
import QuickActions from '../components/dashboard/QuickActions'
import Investments from '../components/dashboard/Investments'
import { useDashboard } from '../hooks/useDashboard'

export default function DashboardPage() {
  const { activeSection } = useDashboard()
  
  return (
    <div className="min-h-screen bg-bg">
      <Sidebar />
      
      <div className="ml-56">
        <TopBar />
        
        <main className="p-6">
          {activeSection === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              <StatsGrid />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
            <div className="animate-fade-in">
              <EmailFilter />
            </div>
          )}
          
          {activeSection === 'messages' && (
            <div className="animate-fade-in">
              <div className="bg-surface border border-border rounded-lg p-8 text-center">
                <span className="iconify text-muted mx-auto mb-3" data-icon="lucide:message-square" data-width="48"></span>
                <h3 className="text-lg font-medium mb-2">Messages</h3>
                <p className="text-sm text-muted">WhatsApp, Slack, Discord - tous vos messages au même endroit.</p>
                <button className="mt-4 px-4 py-2 bg-accent text-bg text-sm font-medium rounded-lg hover:bg-[#33c2ff] transition-colors">
                  Connecter un service
                </button>
              </div>
            </div>
          )}
          
          {activeSection === 'calendar' && (
            <div className="animate-fade-in">
              <div className="bg-surface border border-border rounded-lg p-8 text-center">
                <span className="iconify text-muted mx-auto mb-3" data-icon="lucide:calendar" data-width="48"></span>
                <h3 className="text-lg font-medium mb-2">Calendrier</h3>
                <p className="text-sm text-muted">Google Calendar, Outlook - vue unifiée de vos événements.</p>
                <button className="mt-4 px-4 py-2 bg-accent text-bg text-sm font-medium rounded-lg hover:bg-[#33c2ff] transition-colors">
                  Connecter un service
                </button>
              </div>
            </div>
          )}
          
          {activeSection === 'tasks' && (
            <div className="animate-fade-in">
              <div className="bg-surface border border-border rounded-lg p-8 text-center">
                <span className="iconify text-muted mx-auto mb-3" data-icon="lucide:check-square" data-width="48"></span>
                <h3 className="text-lg font-medium mb-2">Tâches</h3>
                <p className="text-sm text-muted">Trello, Asana, Todoist - suivez tout sans changer d'outil.</p>
                <button className="mt-4 px-4 py-2 bg-accent text-bg text-sm font-medium rounded-lg hover:bg-[#33c2ff] transition-colors">
                  Connecter un service
                </button>
              </div>
            </div>
          )}
          
          {activeSection === 'investments' && (
            <div className="animate-fade-in">
              <Investments />
            </div>
          )}
          
          {activeSection === 'settings' && (
            <div className="animate-fade-in">
              <div className="bg-surface border border-border rounded-lg p-6 max-w-2xl">
                <h3 className="text-sm font-medium mb-6">Paramètres</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs text-muted mb-1.5">Nom</label>
                    <input
                      type="text"
                      defaultValue="Mouhamadou Touré"
                      className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm text-text focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-muted mb-1.5">Email</label>
                    <input
                      type="email"
                      defaultValue="mouhamadou@example.com"
                      className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm text-text focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                  
                  <button className="px-4 py-2 bg-accent text-bg text-sm font-medium rounded-lg hover:bg-[#33c2ff] transition-colors">
                    Sauvegarder
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