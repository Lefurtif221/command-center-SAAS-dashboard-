import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useDashboard } from '../../hooks/useDashboard'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'lucide:layout-grid' },
  { id: 'emails', label: 'Emails', icon: 'lucide:mail', badge: 'emails' },
  { id: 'messages', label: 'Messages', icon: 'lucide:message-square', badge: 'messages' },
  { id: 'calendar', label: 'Calendrier', icon: 'lucide:calendar' },
  { id: 'tasks', label: 'Tâches', icon: 'lucide:check-square' },
  { id: 'investments', label: 'Investissements', icon: 'lucide:trending-up' },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuth()
  const { activeSection, setActiveSection, stats } = useDashboard()
  const getBadge = (t) => t === 'emails' ? stats.unreadEmails : t === 'messages' ? stats.unreadMessages : 0

  return (
    <aside className={`fixed left-0 top-0 bottom-0 z-50 flex flex-col bg-surface border-r border-border transition-all duration-300 ${collapsed ? 'w-16' : 'w-56'}`}>
      <div className="h-14 flex items-center justify-between px-4 border-b border-border">
        {!collapsed && <div className="flex items-center gap-2"><span className="iconify text-accent" data-icon="lucide:zap" data-width="18"></span><span className="font-medium tracking-tight text-sm">Personal Place</span></div>}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded-md text-muted hover:text-text hover:bg-bg/50 transition-colors">
          <span className="iconify" data-icon={collapsed ? "lucide:chevron-right" : "lucide:chevron-left"} data-width="16"></span>
        </button>
      </div>
      <nav className="flex-1 py-4 px-2">
        <div className="flex flex-col gap-1">
          {!collapsed && <div className="text-[10px] font-medium text-muted/50 px-2 mb-2 uppercase tracking-wider">Modules</div>}
          {navItems.map((item) => {
            const b = item.badge ? getBadge(item.badge) : 0
            return (
              <button key={item.id} onClick={() => setActiveSection(item.id)} className={`flex items-center gap-3 px-2 py-2 rounded-md transition-colors ${activeSection === item.id ? 'bg-bg text-accent border border-border' : 'text-muted hover:text-text hover:bg-bg/50'}`}>
                <span className="iconify" data-icon={item.icon} data-width="18"></span>
                {!collapsed && <><span className="flex-1 text-left text-sm">{item.label}</span>{b > 0 && <span className="text-[10px] font-medium bg-accent/10 text-accent px-1.5 py-0.5 rounded-full">{b}</span>}</>}
              </button>
            )
          })}
        </div>
      </nav>
      <div className="px-2 pb-4 space-y-1">
        <button onClick={() => setActiveSection('settings')} className={`w-full flex items-center gap-3 px-2 py-2 rounded-md transition-colors ${activeSection === 'settings' ? 'bg-bg text-accent border border-border' : 'text-muted hover:text-text hover:bg-bg/50'}`}>
          <span className="iconify" data-icon="lucide:settings" data-width="18"></span>
          {!collapsed && <span className="text-sm">Settings</span>}
        </button>
        <button onClick={logout} className="w-full flex items-center gap-3 px-2 py-2 rounded-md text-muted hover:text-accentSec hover:bg-accentSec/5 transition-colors">
          <span className="iconify" data-icon="lucide:log-out" data-width="18"></span>
          {!collapsed && <span className="text-sm">Déconnexion</span>}
        </button>
      </div>
      {!collapsed && (
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-semibold">{user?.initials || 'U'}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || 'Utilisateur'}</p>
              <p className="text-[10px] text-muted capitalize">{user?.plan || 'free'} plan</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}