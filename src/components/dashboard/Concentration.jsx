import { useState, useEffect, useRef, useCallback } from 'react'
import { useDashboard } from '../../hooks/useDashboard'
import { List, CheckSquare, Calendar as CalendarIcon, Timer, Play, Pause, RotateCcw, BarChart3 } from 'lucide-react'

const WORK_DURATION = 25 * 60
const BREAK_DURATION = 5 * 60
const LONG_BREAK_DURATION = 15 * 60
const SESSIONS_BEFORE_LONG_BREAK = 4

const PHASES = { work: 'Travail', break: 'Pause', longBreak: 'Pause longue' }

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function playNotification() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 800
    gain.gain.value = 0.3
    osc.start()
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)
    osc.stop(ctx.currentTime + 0.8)
  } catch {}
}

function getTodayKey() {
  return new Date().toLocaleDateString('sv-SE')
}

export default function Concentration() {
  const { tasks, events } = useDashboard()
  const [selectedType, setSelectedType] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [selectedTitle, setSelectedTitle] = useState('')

  const [phase, setPhase] = useState('work')
  const [timeLeft, setTimeLeft] = useState(WORK_DURATION)
  const [isRunning, setIsRunning] = useState(false)
  const [sessionsCompleted, setSessionsCompleted] = useState(0)
  const [todaySessions, setTodaySessions] = useState([])

  const intervalRef = useRef(null)
  const phaseRef = useRef(phase)
  phaseRef.current = phase

  useEffect(() => { loadTodaySessions() }, [])

  const loadTodaySessions = () => {
    try {
      const all = JSON.parse(localStorage.getItem('pomodoro_sessions') || '[]')
      const today = getTodayKey()
      setTodaySessions(all.filter(s => s.date === today))
    } catch { setTodaySessions([]) }
  }

  const saveSession = (itemTitle, duration) => {
    const today = getTodayKey()
    const all = JSON.parse(localStorage.getItem('pomodoro_sessions') || '[]')
    const session = { date: today, title: itemTitle, duration, completedAt: new Date().toISOString() }
    all.push(session)
    localStorage.setItem('pomodoro_sessions', JSON.stringify(all))
    setTodaySessions(prev => [...prev, session])
  }

  const getDuration = useCallback(() => {
    if (phaseRef.current === 'work') return WORK_DURATION
    if (phaseRef.current === 'longBreak') return LONG_BREAK_DURATION
    return BREAK_DURATION
  }, [])

  const advancePhase = useCallback(() => {
    if (phaseRef.current === 'work') {
      const newCount = sessionsCompleted + 1
      setSessionsCompleted(newCount)
      saveSession(selectedTitle, WORK_DURATION)
      if (newCount % SESSIONS_BEFORE_LONG_BREAK === 0) {
        setPhase('longBreak')
        setTimeLeft(LONG_BREAK_DURATION)
      } else {
        setPhase('break')
        setTimeLeft(BREAK_DURATION)
      }
    } else {
      setPhase('work')
      setTimeLeft(WORK_DURATION)
    }
    playNotification()
  }, [sessionsCompleted, selectedTitle])

  useEffect(() => {
    if (!isRunning) { clearInterval(intervalRef.current); return }
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          setIsRunning(false)
          setTimeout(() => advancePhase(), 100)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [isRunning, advancePhase])

  const handleSelect = (type, id, title) => {
    setSelectedType(type)
    setSelectedId(id)
    setSelectedTitle(title)
    handleReset()
  }

  const handleStart = () => { if (selectedTitle) setIsRunning(true) }
  const handlePause = () => setIsRunning(false)
  const handleReset = () => {
    setIsRunning(false)
    setPhase('work')
    setTimeLeft(WORK_DURATION)
  }

  const totalDuration = phase === 'work' ? WORK_DURATION : phase === 'longBreak' ? LONG_BREAK_DURATION : BREAK_DURATION
  const progress = ((totalDuration - timeLeft) / totalDuration) * 100
  const circumference = 2 * Math.PI * 90
  const strokeDashoffset = circumference - (progress / 100) * circumference

  const phaseColor = phase === 'work' ? '#2563EB' : phase === 'break' ? '#E5E5E5' : '#1E40AF'
  const todayTotal = todaySessions.reduce((acc, s) => acc + (s.duration || 0), 0)

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Left: Selector */}
        <div className="glass rounded-xl p-4 md:p-5" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-2 mb-4">
            <List size={16} className="text-accent" />
            <h3 className="text-sm font-display font-medium">Sélectionner une cible</h3>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            <p className="text-[10px] text-muted uppercase tracking-wider font-medium font-mono">Tâches</p>
            {tasks.filter(t => !t.completed).length === 0 && (
              <p className="text-xs text-muted py-2">Aucune tâche en cours</p>
            )}
            {tasks.filter(t => !t.completed).map(task => (
              <button key={task.id} onClick={() => handleSelect('task', task.id, task.title)}
                className={`glass w-full text-left p-3 rounded-xl transition-all duration-200 ${selectedType === 'task' && selectedId === task.id ? 'border border-accent/30 bg-accent/5 shadow-[0_0_12px_-4px_rgba(37,99,235,0.2)]' : 'hover:bg-accent/5 hover:border-accent/20'}`} style={{ background: 'var(--color-surface-solid)' }}>
                <div className="flex items-center gap-2">
                  <CheckSquare size={14} className="text-warning" />
                  <span className="text-sm text-text truncate">{task.title}</span>
                </div>
                {task.due_date && <p className="text-[10px] text-muted mt-1 ml-5 font-mono">Échéance : {task.due_date}</p>}
              </button>
            ))}

            <p className="text-[10px] text-muted uppercase tracking-wider font-medium mt-4 font-mono">Événements calendrier</p>
            {events.length === 0 && (
              <p className="text-xs text-muted py-2">Aucun événement</p>
            )}
            {events.map(evt => (
              <button key={evt.id} onClick={() => handleSelect('event', evt.id, evt.title)}
                className={`glass w-full text-left p-3 rounded-xl transition-all duration-200 ${selectedType === 'event' && selectedId === evt.id ? 'border border-accent/30 bg-accent/5 shadow-[0_0_12px_-4px_rgba(37,99,235,0.2)]' : 'hover:bg-accent/5 hover:border-accent/20'}`} style={{ background: 'var(--color-surface-solid)' }}>
                <div className="flex items-center gap-2">
                  <CalendarIcon size={14} className="text-accent" />
                  <span className="text-sm text-text truncate">{evt.title}</span>
                </div>
                <p className="text-[10px] text-muted mt-1 ml-5 font-mono">{evt.date} à {String(evt.hour).padStart(2, '0')}:00</p>
              </button>
            ))}
          </div>
        </div>

        {/* Center: Timer */}
        <div className="glass rounded-xl p-4 md:p-5 flex flex-col items-center justify-center" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-2 mb-6 self-start">
            <Timer size={16} className="text-accent" />
            <h3 className="text-sm font-display font-medium">Pomodoro</h3>
          </div>

          {selectedTitle ? (
            <>
              <p className="text-xs text-muted mb-1 font-mono">Cible :</p>
              <p className="text-sm font-display font-medium text-accent mb-6 text-center">{selectedTitle}</p>
            </>
          ) : (
            <p className="text-xs text-muted mb-6">Choisissez une tâche ou un événement</p>
          )}

          {/* Circular timer */}
          <div className="relative w-48 h-48 mb-6">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="6"
                className="text-border opacity-20" />
              <circle cx="100" cy="100" r="90" fill="none" stroke={phaseColor} strokeWidth="6"
                strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 drop-shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-mono font-bold text-text">{formatTime(timeLeft)}</span>
              <span className="text-[10px] text-muted mt-1 uppercase tracking-wider font-mono">{PHASES[phase]}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 mb-4">
            {!isRunning ? (
              <button onClick={handleStart} disabled={!selectedTitle}
                className="flex items-center gap-2 px-5 py-2.5 bg-accent text-bg text-sm font-medium rounded-xl hover:bg-[#2563EB] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_-5px_rgba(37,99,235,0.4)]">
                <Play size={16} /> Démarrer
              </button>
            ) : (
              <button onClick={handlePause}
                className="flex items-center gap-2 px-5 py-2.5 bg-warning text-bg text-sm font-medium rounded-xl hover:opacity-90 transition-all duration-200">
                <Pause size={16} /> Pause
              </button>
            )}
            <button onClick={handleReset}
              className="glass flex items-center gap-2 px-4 py-2.5 text-sm text-muted rounded-xl hover:text-text transition-all duration-200" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>
              <RotateCcw size={16} /> Reset
            </button>
          </div>

          {/* Sessions */}
          <div className="flex items-center gap-2">
            {Array.from({ length: SESSIONS_BEFORE_LONG_BREAK }).map((_, i) => (
              <div key={i} className={`w-3 h-3 rounded-full transition-all duration-300 ${i < (sessionsCompleted % SESSIONS_BEFORE_LONG_BREAK) ? 'bg-accent shadow-[0_0_8px_rgba(37,99,235,0.5)]' : 'bg-border/50'}`} />
            ))}
            <span className="text-[10px] text-muted ml-2 font-mono">{sessionsCompleted % SESSIONS_BEFORE_LONG_BREAK}/{SESSIONS_BEFORE_LONG_BREAK}</span>
          </div>
        </div>

        {/* Right: Stats */}
        <div className="glass rounded-xl p-4 md:p-5" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="text-accent" />
            <h3 className="text-sm font-display font-medium">Aujourd'hui</h3>
          </div>

          <div className="space-y-4">
            <div className="glass rounded-xl p-4" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>
              <p className="text-[10px] text-muted uppercase tracking-wider font-mono">Sessions terminées</p>
              <p className="text-2xl font-display font-bold text-text mt-1">{todaySessions.length}</p>
            </div>
            <div className="glass rounded-xl p-4" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>
              <p className="text-[10px] text-muted uppercase tracking-wider font-mono">Temps total</p>
              <p className="text-2xl font-display font-bold text-text mt-1">{Math.floor(todayTotal / 60)}min</p>
            </div>
          </div>

          {todaySessions.length > 0 && (
            <div className="mt-4">
              <p className="text-[10px] text-muted uppercase tracking-wider font-medium mb-2 font-mono">Historique</p>
              <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                {[...todaySessions].reverse().map((s, i) => (
                  <div key={i} className="glass flex items-center justify-between p-2 rounded-lg" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>
                    <span className="text-xs text-text truncate">{s.title}</span>
                    <span className="text-[10px] text-muted flex-shrink-0 ml-2 font-mono">{Math.floor(s.duration / 60)}min</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
