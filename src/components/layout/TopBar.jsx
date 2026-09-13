import { useState, useEffect, useRef } from 'react'
import { useDashboard } from '../../hooks/useDashboard'
import { useTheme } from '../../context/ThemeContext'

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
        found.push({ type: 'email', icon: 'lucide:mail', label: e.subject, sub: e.sender, section: 'emails', color: 'text-accent' })
      }
    })

    tasks.forEach(t => {
      if (t.title?.toLowerCase().includes(q)) {
        found.push({ type: 'task', icon: 'lucide:check-square', label: t.title, sub: t.due_date || 'Pas de date', section: 'tasks', color: 'text-warning' })
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
    <header className="sticky top-0 z-30 h-14 flex items-center justify-between px-4 md:px-6 bg-bg/80 backdrop-blur-md border-b border-border">
        <div className="relative flex-1 md:w-72 ml-10 md:ml-0">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-border rounded-lg">
          <span className="iconify text-muted" data-icon="lucide:search" data-width="14"></span>
          <input ref={inputRef} type="text" placeholder="Rechercher..." value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 200)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-text placeholder:text-muted" />
          <kbd className="hidden md:inline text-[10px] text-muted bg-bg px-1.5 py-0.5 rounded border border-border">⌘K</kbd>
        </div>
        {open && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg overflow-hidden z-50">
            {results.map((item, i) => (
              <button key={i} onClick={() => handleSelect(item)}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-bg/50 transition-colors text-left">
                <span className={`iconify ${item.color}`} data-icon={item.icon} data-width="14"></span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text truncate">{item.label}</p>
                  <p className="text-[10px] text-muted truncate">{item.sub}</p>
                </div>
                <span className="text-[10px] text-muted capitalize">{item.type}</span>
              </button>
            ))}
          </div>
        )}
        {open && query.trim() && results.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg p-4 z-50">
            <p className="text-xs text-muted text-center">Aucun résultat</p>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        <button onClick={toggleTheme}
          className="p-2 rounded-lg text-muted hover:text-text hover:bg-surface transition-colors"
          title={isDark ? 'Mode clair' : 'Mode sombre'}>
          <span className="iconify" data-icon={isDark ? 'lucide:sun' : 'lucide:moon'} data-width="16"></span>
        </button>
        <button className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-accent/5 border border-accent/20 rounded-lg text-accent text-xs font-medium hover:bg-accent/10 transition-colors">
          <span className="iconify" data-icon="lucide:zap" data-width="12"></span>Filtre intelligent
        </button>
        <button className="relative p-2 rounded-lg text-muted hover:text-text hover:bg-surface transition-colors">
          <span className="iconify" data-icon="lucide:bell" data-width="16"></span>
          {stats.unreadEmails > 0 && (
            <span className="absolute top-1 right-1 w-3.5 h-3.5 text-[8px] font-bold bg-accentSec text-bg rounded-full flex items-center justify-center">{stats.unreadEmails}</span>
          )}
        </button>
      </div>
    </header>
  )
}
