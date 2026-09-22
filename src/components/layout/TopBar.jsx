import { useState, useEffect, useRef } from 'react'
import { useDashboard } from '../../hooks/useDashboard'
import { useTheme } from '../../context/ThemeContext'
import { Search, Mail, CheckSquare, Sun, Moon, Sparkles, Bell } from 'lucide-react'

export default function TopBar() {
  const { stats, emails, tasks, setActiveSection } = useDashboard()
  const { isDark, toggleTheme } = useTheme()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const q = query.toLowerCase()
    const found = []
    emails.forEach(e => {
      if (e.subject?.toLowerCase().includes(q) || e.sender?.toLowerCase().includes(q) || e.preview?.toLowerCase().includes(q)) {
        found.push({ type: 'email', icon: Mail, label: e.subject, sub: e.sender, section: 'emails', color: 'text-accent' })
      }
    })
    tasks.forEach(t => {
      if (t.title?.toLowerCase().includes(q)) {
        found.push({ type: 'task', icon: CheckSquare, label: t.title, sub: t.due_date || 'Pas de date', section: 'tasks', color: 'text-warning' })
      }
    })
    setResults(found.slice(0, 8))
  }, [query, emails, tasks])

  const handleSelect = (item) => {
    setActiveSection(item.section)
    setQuery('')
    setOpen(false)
  }

  return (
    <header className="sticky top-0 z-30 h-14 md:h-16 flex items-center justify-between px-3 md:px-6 border-b backdrop-blur-xl" style={{ background: 'var(--color-surface-solid)', borderColor: 'var(--color-border)' }}>
      <div className="relative flex-1 md:w-80 ml-10 md:ml-0">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 focus-within:ring-1 focus-within:ring-accent/30" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
          <Search size={14} className="text-muted shrink-0" />
          <input ref={inputRef} type="text" placeholder="Rechercher..." value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 200)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-text placeholder:text-muted min-w-0" />
          <kbd className="hidden md:inline text-[10px] text-muted font-mono px-1.5 py-0.5 rounded-md shrink-0" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>Ctrl+K</kbd>
        </div>
        {open && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 rounded-xl shadow-2xl overflow-hidden z-50 animate-scale-in" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>
            {results.map((item, i) => (
              <button key={i} onClick={() => handleSelect(item)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/5 transition-all duration-150 text-left border-b last:border-0"
                style={{ borderColor: 'var(--color-border)' }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--color-accent/10)' }}>
                  <item.icon size={12} className={item.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{item.label}</p>
                  <p className="text-[10px] text-muted truncate">{item.sub}</p>
                </div>
                <span className="text-[10px] text-muted capitalize font-mono shrink-0">{item.type}</span>
              </button>
            ))}
          </div>
        )}
        {open && query.trim() && results.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 rounded-xl shadow-2xl p-4 z-50 animate-scale-in" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>
            <p className="text-xs text-muted text-center">Aucun resultat</p>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1.5 md:gap-2">
        <button onClick={toggleTheme}
          data-tutorial="theme-toggle"
          className="p-2 md:p-2.5 rounded-xl text-muted hover:text-accent transition-all duration-200 hover:scale-105"
          aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}>
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-accent text-xs font-medium transition-all duration-200 hover:scale-105" style={{ background: 'rgba(125,211,252,0.1)', border: '1px solid rgba(125,211,252,0.2)' }}>
          <Sparkles size={12} />Filtre intelligent
        </button>
        <button className="relative p-2 md:p-2.5 rounded-xl text-muted hover:text-accent transition-all duration-200 hover:scale-105" aria-label={`Notifications${stats.unreadEmails > 0 ? ` (${stats.unreadEmails} non lus)` : ''}`}>
          <Bell size={16} />
          {stats.unreadEmails > 0 && (
            <span className="absolute top-0.5 right-0.5 md:top-1 md:right-1 w-4 h-4 text-[8px] font-mono font-bold bg-accentSec text-white rounded-full flex items-center justify-center animate-glow-pulse">{stats.unreadEmails}</span>
          )}
        </button>
      </div>
    </header>
  )
}
