import { useState, useEffect } from 'react'
import { useDashboard } from '../../hooks/useDashboard'
import { Bell, BellOff, Loader2, Check } from 'lucide-react'
import { subscribeToPush, unsubscribeFromPush, isPushSupported, getNotificationPermission } from '../../utils/push'

export default function PushToggle() {
  const { user } = useDashboard()
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [supported] = useState(() => typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window)

  useEffect(() => {
    if (!supported) return
    const check = async () => {
      try {
        const perm = Notification.permission
        if (perm === 'granted') {
          const reg = await navigator.serviceWorker.ready
          const sub = await navigator.serviceWorker.ready.then(r => r.pushManager.getSubscription())
          setEnabled(!!sub)
        }
      } catch (err) {
        console.error('Check push status error:', err)
      }
    }
    check()
  }, [supported])

  const toggle = async () => {
    if (!supported) {
      setError('Notifications push non supportées sur ce navigateur')
      return
    }
    if (loading) return
    setLoading(true)
    setError('')

    try {
      if (Notification.permission === 'denied') {
        setError('Permission bloquée — activez les notifications dans les réglages du navigateur')
        return
      }

      if (enabled) {
        await unsubscribeFromPush()
        setEnabled(false)
      } else {
        await subscribeToPush()
        setEnabled(true)
      }
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'activation')
    } finally {
      setLoading(false)
    }
  }

  if (!supported) return null

  const perm = Notification.permission
  const isDenied = perm === 'denied'

  return (
    <button
      onClick={toggle}
      disabled={loading || isDenied}
      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors"
      style={{
        background: enabled ? 'rgba(16,185,129,0.15)' : isDenied ? 'rgba(239,68,68,0.1)' : 'rgba(37,99,235,0.1)',
        border: enabled ? '1px solid rgba(16,185,129,0.3)' : isDenied ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(37,99,235,0.25)',
        color: enabled ? '#10B981' : isDenied ? '#EF4444' : '#2563EB',
      }}
      title={isDenied ? 'Permission bloquée dans les réglages du navigateur' : enabled ? 'Désactiver les notifications' : 'Activer les notifications push'}
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : enabled ? (
        <>
          <Bell size={14} />
          <span className="hidden sm:inline">Notifications activées</span>
          <Check size={12} className="shrink-0" />
        </>
      ) : (
        <>
          <BellOff size={14} />
          <span className="hidden sm:inline">{isDenied ? 'Bloqué' : 'Activer notifications'}</span>
        </>
      )}
      {error && <span className="text-[10px]" style={{ color: '#EF4444' }}>{error}</span>}
    </button>
  )
}