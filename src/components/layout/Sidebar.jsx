import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useDashboard } from '../../hooks/useDashboard'
import { LayoutGrid, Mail, MessageSquare, Calendar, CheckSquare, Timer, Sparkles, ChevronLeft, ChevronRight, X, Settings, LogOut, Menu } from 'lucide-react'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { id: 'emails', label: 'Emails', icon: Mail, badge: 'emails' },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'calendar', label: 'Calendrier', icon: Calendar },
  { id: 'tasks', label: 'Taches', icon: CheckSquare },
  { id: 'concentration', label: 'Concentration', icon: Timer },
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

  useEffect(() => {
    const handler = () => setMobileOpen(true)
    window.addEventListener('tutorial:open-sidebar', handler)
    return () => window.removeEventListener('tutorial:open-sidebar', handler)
  }, [])

  const sidebarContent = (
    <>
      <div className="h-14 md:h-16 flex items-center justify-between px-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Personal Place" className="w-8 h-8 rounded-xl" />
            <span className="font-display font-semibold tracking-tight text-sm">Personal Place</span>
          </div>
        )}
        <button onClick={() => { setCollapsed(!collapsed); onToggle && onToggle(!collapsed) }}
          className="p-1.5 rounded-lg transition-colors duration-150 hidden md:block"
          style={{ color: 'var(--color-muted)' }}
          aria-label={collapsed ? 'Developper la sidebar' : 'Reduire la sidebar'}>
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
        <button onClick={() => setMobileOpen(false)}
          className="p-1.5 rounded-lg transition-colors duration-150 md:hidden"
          style={{ color: 'var(--color-muted)' }}
          aria-label="Fermer le menu">
          <X size={16} />
        </button>
      </div>
      <nav className="flex-1 py-4 px-2 overflow-y-auto">
        <div className="flex flex-col gap-0.5">
          {!collapsed && <div className="text-[10px] font-medium px-3 mb-2 uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>Modules</div>}
          {navItems.map((item) => {
            const b = item.badge ? getBadge(item.badge) : 0
            const isActive = activeSection === item.id
            return (
              <button key={item.id} onClick={() => handleNav(item.id)}
                data-tutorial={`sidebar-${item.id}`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200`}
                style={isActive
                  ? { background: 'rgba(37,99,235,0.15)', color: '#2563EB' }
                  : { color: 'var(--color-muted)' }}>
                <item.icon size={18} className="shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                    {b > 0 && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(37,99,235,0.1)', color: '#2563EB' }}>
                        {b}
                      </span>
                    )}
                  </>
                )}
              </button>
            )
          })}
        </div>
      </nav>
      <div className="px-2 pb-4 space-y-0.5">
        <button onClick={() => handleNav('settings')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
          style={activeSection === 'settings'
            ? { background: 'rgba(37,99,235,0.15)', color: '#2563EB' }
            : { color: 'var(--color-muted)' }}>
          <Settings size={18} className="shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Settings</span>}
        </button>
        <button onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-150 hover:bg-red-500/10"
          style={{ color: 'var(--color-muted)' }}>
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Deconnexion</span>}
        </button>
      </div>
      {!collapsed && (
        <div className="p-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-display font-semibold shrink-0"
              style={{ background: 'rgba(37,99,235,0.15)', color: '#2563EB', border: '1px solid rgba(37,99,235,0.2)' }}>
              {user?.initials || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || 'Utilisateur'}</p>
              <p className="text-[10px]" style={{ color: 'var(--color-muted)' }}>{user?.plan || 'free'} plan</p>
            </div>
          </div>
        </div>
      )}
    </>
  )

  return (
    <>
      <button onClick={() => setMobileOpen(true)}
        className="fixed top-3 left-3 z-50 p-2.5 rounded-xl transition-colors duration-150 md:hidden "
        style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}>
        <Menu size={20} />
      </button>

      <aside className={`hidden md:flex fixed left-0 top-0 bottom-0 z-40 flex-col transition-colors duration-200 ease-out ${collapsed ? 'w-16' : 'w-56'}`}
        style={{ background: 'var(--color-surface-solid)', borderRight: '1px solid var(--color-border)' }}>
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 flex flex-col animate-slide-in" style={{ background: 'var(--color-surface-solid)', borderRight: '1px solid var(--color-border)' }}>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}
