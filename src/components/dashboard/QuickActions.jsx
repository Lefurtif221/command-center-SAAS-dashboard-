export default function QuickActions() {
  const actions = [
    { id: 'email', label: 'Nouvel email', icon: 'lucide:mail', shortcut: '⌘N' },
    { id: 'task', label: 'Nouvelle tâche', icon: 'lucide:check-square', shortcut: '⌘T' },
    { id: 'event', label: 'Nouvel événement', icon: 'lucide:calendar', shortcut: '⌘E' },
    { id: 'note', label: 'Nouvelle note', icon: 'lucide:file-text', shortcut: '⌘D' }
  ]
  return (
    <div className="bg-surface border border-border rounded-lg">
      <div className="flex items-center gap-2 p-4 border-b border-border">
        <span className="iconify text-accent" data-icon="lucide:zap" data-width="14"></span>
        <h3 className="text-sm font-medium">Actions rapides</h3>
      </div>
      <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        {actions.map((a) => (
          <button key={a.id} className="flex flex-col items-center gap-2 p-4 bg-bg border border-border rounded-lg hover:border-accent/30 hover:bg-accent/5 transition-all group">
            <span className="iconify text-muted group-hover:text-accent transition-colors" data-icon={a.icon} data-width="20"></span>
            <span className="text-xs font-medium">{a.label}</span>
            <kbd className="text-[10px] text-muted bg-surface px-1.5 py-0.5 rounded border border-border">{a.shortcut}</kbd>
          </button>
        ))}
      </div>
    </div>
  )
}