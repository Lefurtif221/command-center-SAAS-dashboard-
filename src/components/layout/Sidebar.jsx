import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useDashboard } from '../../hooks/useDashboard'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'lucide:layout-grid' },
  { id: 'emails', label: 'Emails', icon: 'lucide:mail', badge: 'emails' },
  { id: 'messages', label: 'Messages', icon: 'lucide:message-square' },
  { id: 'calendar', label: 'Calendrier', icon: 'lucide:calendar' },
  { id: 'tasks', label: 'Tâches', icon: 'lucide:check-square' },
  { id: 'concentration', label: 'Concentration', icon: 'lucide:timer' },
]

export default function Sidebar({ onToggle }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout } = useAuth()
  const { activeSection, setActiveSection, stats } = useDashboard()
  const getBadge = (t) => t === 'emails' ? stats.unreadEmails : 0

  const handleNav = (id) => {
    setActiveSection(id)
    setMobileOpen(false)
  }

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 768) setMobileOpen(false) }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const sidebarContent = (
    <>
      <div className="h-14 flex items-center justify-between px-4 border-b border-border/50">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
              <span className="iconify text-accent" data-icon="lucide:zap" data-width="14"></span>
            </div>
            <span className="font-display font-semibold tracking-tight text-sm">Personal Place</span>
          </div>
        )}
        <button onClick={() => { setCollapsed(!collapsed); onToggle && onToggle(!collapsed) }} className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-white/5 transition-colors hidden md:block">
          <span className="iconify" data-icon={collapsed ? "lucide:chevron-right" : "lucide:chevron-left"} data-width="16"></span>
        </button>
        <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-white/5 transition-colors md:hidden">
          <span className="iconify" data-icon="lucide:x" data-width="16"></span>
        </button>
      </div>
      <nav className="flex-1 py-4 px-2 overflow-y-auto">
        <div className="flex flex-col gap-0.5">
          {!collapsed && <div className="text-[10px] font-medium text-muted/50 px-3 mb-2 uppercase tracking-wider">Modules</div>}
          {navItems.map((item) => {
            const b = item.badge ? getBadge(item.badge) : 0
            const isActive = activeSection === item.id
            return (
              <button key={item.id} onClick={() => handleNav(item.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-accent/10 text-accent shadow-[0_0_12px_-4px_rgba(125,211,252,0.3)]'
                    : 'text-muted hover:text-text hover:bg-white/5'
                }`}>
                <span className="iconify" data-icon={item.icon} data-width="18"></span>
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                    {b > 0 && <span className="text-[10px] font-mono font-medium bg-accentSec/10 text-accentSec px-2 py-0.5 rounded-full">{b}</span>}
                  </>
                )}
              </button>
            )
          })}
        </div>
      </nav>
      <div className="px-2 pb-4 space-y-0.5">
        <button onClick={() => handleNav('settings')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${activeSection === 'settings' ? 'bg-accent/10 text-accent' : 'text-muted hover:text-text hover:bg-white/5'}`}>
          <span className="iconify" data-icon="lucide:settings" data-width="18"></span>
          {!collapsed && <span className="text-sm font-medium">Settings</span>}
        </button>
        <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted hover:text-accentSec hover:bg-accentSec/5 transition-all duration-200">
          <span className="iconify" data-icon="lucide:log-out" data-width="18"></span>
          {!collapsed && <span className="text-sm font-medium">Déconnexion</span>}
        </button>
      </div>
      {!collapsed && (
        <div className="p-3 border-t border-border/50">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent/20 to-accentSec/20 flex items-center justify-center text-accent text-xs font-display font-semibold ring-1 ring-accent/20">{user?.initials || 'U'}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || 'Utilisateur'}</p>
              <p className="text-[10px] text-muted capitalize font-mono">{user?.plan || 'free'} plan</p>
            </div>
          </div>
        </div>
      )}
    </>
  )

  return (
    <>
      <button onClick={() => setMobileOpen(true)} className="fixed top-3 left-3 z-50 p-2.5 rounded-xl glass text-muted hover:text-text transition-all duration-200 md:hidden">
        <span className="iconify" data-icon="lucide:menu" data-width="20"></span>
      </button>

      <aside className={`hidden md:flex fixed left-0 top-0 bottom-0 z-40 flex-col glass-strong noise transition-all duration-300 ${collapsed ? 'w-16' : 'w-56'}`}>
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 flex flex-col glass-strong noise animate-slide-in">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}
