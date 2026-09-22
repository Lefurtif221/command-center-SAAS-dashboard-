import { useDashboard } from '../../hooks/useDashboard'
import { Mail, CheckSquare, Calendar, List } from 'lucide-react'
import { useState, useEffect } from 'react'

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const target = parseInt(value) || 0
    if (display === target) return
    const step = Math.max(1, Math.floor(Math.abs(target - display) / 10))
    const timer = setTimeout(() => {
      setDisplay(prev => {
        if (prev < target) return Math.min(prev + step, target)
        if (prev > target) return Math.max(prev - step, target)
        return prev
      })
    }, 30)
    return () => clearTimeout(timer)
  }, [value, display])
  return <>{display}</>
}

const statCards = [
  { id: 'emails', label: 'Emails importants', icon: Mail, key: 'unreadEmails', gradient: 'from-accent/20 to-accent/5' },
  { id: 'tasks', label: 'Taches a faire', icon: CheckSquare, key: 'pendingTasks', gradient: 'from-accentSec/20 to-accentSec/5' },
  { id: 'activity', label: "Activite aujourd'hui", icon: Calendar, key: 'activity', gradient: 'from-success/20 to-success/5' },
  { id: 'totalTasks', label: 'Total taches', icon: List, key: 'totalTasks', gradient: 'from-warning/20 to-warning/5' },
]

export default function StatsGrid() {
  const { stats } = useDashboard()
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {statCards.map((card, i) => {
        const value = stats[card.key]
        return (
          <div key={card.id}
            className="group relative rounded-2xl p-4 md:p-5 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-default"
            style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}
            style={{ animationDelay: `${i * 60}ms` }}>
            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-accent/10)' }}>
                  <card.icon size={14} className="text-accent" />
                </div>
                <span className="text-[10px] md:text-[11px] text-muted font-mono">{card.label}</span>
              </div>
              <div className="text-2xl md:text-3xl font-display font-bold tracking-tight">
                <AnimatedNumber value={value} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
