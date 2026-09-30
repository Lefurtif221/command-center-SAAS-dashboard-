import { useState, useEffect } from 'react'
import { useDashboard } from '../../hooks/useDashboard'
import { Bell, BellOff, Loader2, Check, Send } from 'lucide-react'
import { subscribeToPush, unsubscribeFromPush, sendTestPush } from '../../utils/push'

export default function PushToggle() {
  const { user } = useDashboard()
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [testing, setTesting] = useState(false)
  const [testMsg, setTestMsg] = useState('')
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

  const runTest = async () => {
    if (testing) return
    setTesting(true)
    setTestMsg('')
    setError('')
    try {
      const data = await sendTestPush()
      if (data.devices === 0) {
        setTestMsg('Aucun appareil abonné')
      } else {
        const ok = data.results.filter(r => r.ok)
        const ko = data.results.filter(r => !r.ok)
        if (ko.length === 0) {
          setTestMsg(`Envoyé à ${ok.length} appareil${ok.length > 1 ? 's' : ''} — regarde ta barre de notifications`)
        } else {
          setTestMsg(`Échec : ${ko.map(r => `${r.host} (${r.error})`).join(', ')}`)
        }
      }
    } catch (err) {
      setTestMsg(err.message || 'Test impossible')
    } finally {
      setTesting(false)
    }
  }

  if (!supported) return null

  const perm = Notification.permission
  const isDenied = perm === 'denied'

  return (
    <div className="flex flex-col gap-1.5">
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
      {enabled && (
        <div className="flex items-center gap-2 px-1">
          <button
            onClick={runTest}
            disabled={testing}
            className="inline-flex items-center gap-1.5 text-[11px] font-medium transition-colors disabled:opacity-60"
            style={{ color: '#2563EB' }}
            title="Envoyer une notification de test sur tes appareils"
          >
            {testing ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />}
            {testing ? 'Envoi…' : 'Tester la notification'}
          </button>
          {testMsg && <span className="text-[10px]" style={{ color: testMsg.startsWith('Échec') || testMsg.startsWith('Aucun') ? '#EF4444' : '#10B981' }}>{testMsg}</span>}
        </div>
      )}
    </div>
  )
}