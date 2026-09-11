import { useDashboard } from '../../hooks/useDashboard'

export default function TopBar() {
  const { stats } = useDashboard()
  return (
    <header className="sticky top-0 z-40 h-14 flex items-center justify-between px-6 bg-bg/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-border rounded-lg w-72">
        <span className="iconify text-muted" data-icon="lucide:search" data-width="14"></span>
        <input type="text" placeholder="Rechercher..." className="flex-1 bg-transparent border-none outline-none text-sm text-text placeholder:text-muted" />
        <kbd className="text-[10px] text-muted bg-bg px-1.5 py-0.5 rounded border border-border">⌘K</kbd>
      </div>
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 px-3 py-1.5 bg-accent/5 border border-accent/20 rounded-lg text-accent text-xs font-medium hover:bg-accent/10 transition-colors">
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