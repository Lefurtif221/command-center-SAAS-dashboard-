import { useState, useEffect, useRef } from 'react'
import { useDashboard } from '../../hooks/useDashboard'
import { apiFetch } from '../../utils/api'

export default function ConnectedServices() {
  const { disconnectService } = useDashboard()
  const [connectedList, setConnectedList] = useState([])
  const [loading, setLoading] = useState(null)
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)
  const [whatsappQR, setWhatsAppQR] = useState('')
  const [whatsappStatus, setWhatsAppStatus] = useState('')
  const pollingRef = useRef(null)

  useEffect(() => { fetchServices(); return () => { if (pollingRef.current) clearInterval(pollingRef.current) } }, [])

  const fetchServices = async () => {
    try {
      const data = await apiFetch('/api/services')
      setConnectedList(data.services || [])
    } catch (err) {
      console.error('Failed to fetch services:', err)
    }
  }

  const handleConnect = async (serviceName) => {
    if (serviceName === 'whatsapp') {
      setShowWhatsAppModal(true)
      setWhatsAppQR('')
      setWhatsAppStatus('Génération du QR code...')
      setLoading('whatsapp')
      try {
        const data = await apiFetch('/api/whatsapp/connect', { method: 'POST' })
        if (data.qr) {
          setWhatsAppQR(data.qr)
          setWhatsAppStatus('Scan le QR code avec ton téléphone')
          startPolling()
        } else if (data.status === 'connected') {
          setWhatsAppStatus('Connecté !')
          setConnectedList(prev => [...prev, 'whatsapp'])
          setTimeout(() => setShowWhatsAppModal(false), 1500)
        }
      } catch (err) {
        setWhatsAppStatus(err.message || 'Erreur de connexion')
      } finally { setLoading(null) }
      return
    }
    setLoading(serviceName)
    try {
      const data = await apiFetch(`/api/services/${serviceName}/authorize`)
      if (data.url) window.location.href = data.url
    } catch (err) {
      console.error('OAuth error:', err); setLoading(null)
    }
  }

  const startPolling = () => {
    if (pollingRef.current) clearInterval(pollingRef.current)
    pollingRef.current = setInterval(async () => {
      try {
        const data = await apiFetch('/api/whatsapp/status')
        if (data.status === 'connected') {
          clearInterval(pollingRef.current)
          pollingRef.current = null
          setWhatsAppStatus('Connecté !')
          setConnectedList(prev => prev.includes('whatsapp') ? prev : [...prev, 'whatsapp'])
          setTimeout(() => setShowWhatsAppModal(false), 1500)
        } else if (data.status === 'disconnected') {
          clearInterval(pollingRef.current)
          pollingRef.current = null
          setWhatsAppStatus('Déconnecté')
        }
      } catch (err) {
        console.error('Status poll error:', err)
      }
    }, 2000)
  }

  const handleDisconnect = async (serviceName) => {
    if (!window.confirm(`Déconnecter ${serviceName} ?`)) return
    try {
      if (serviceName === 'whatsapp') {
        await apiFetch('/api/whatsapp/disconnect', { method: 'POST' })
      } else {
        await apiFetch(`/api/services/${serviceName}`, { method: 'DELETE' })
      }
      setConnectedList(prev => prev.filter(s => s !== serviceName))
      disconnectService(serviceName)
    } catch (err) { console.error('Disconnect error:', err) }
  }

  const allServices = [
    { id: 'gmail', name: 'Gmail', icon: '📧', desc: 'Emails, calendrier, contacts' },
    { id: 'whatsapp', name: 'WhatsApp', icon: '💬', desc: 'Messages WhatsApp (comme WhatsApp Web)' },
  ]

  return (
    <div className="glass rounded-xl" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <h3 className="text-sm font-display font-medium">Services connectés</h3>
      </div>
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {allServices.map((service) => {
          const isConnected = connectedList.includes(service.id)
          return (
            <div key={service.id} className={`glass p-3 rounded-xl border transition-all duration-200 ${isConnected ? 'border-success/20' : 'hover:border-muted/50'}`} style={{ background: 'var(--color-surface-solid)' }}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xl">{service.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-display font-medium">{service.name}</p>
                  <p className="text-[10px] text-muted font-mono">{service.desc}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {isConnected ? (
                  <button onClick={() => handleDisconnect(service.id)} className="glass flex-1 px-2 py-2.5 rounded-xl text-xs text-accentSec hover:bg-accentSec/5 transition-all duration-200" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>Déconnecter</button>
                ) : (
                  <button onClick={() => handleConnect(service.id)} disabled={loading === service.id} className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 bg-accent/10 border border-accent/20 rounded-xl text-xs text-accent hover:bg-accent/15 transition-all duration-200 disabled:opacity-50">
                    {loading === service.id ? '...' : 'Connecter'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {showWhatsAppModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={() => { setShowWhatsAppModal(false); if (pollingRef.current) clearInterval(pollingRef.current) }}>
          <div className="w-full max-w-sm rounded-2xl p-5 shadow-2xl" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }} onClick={e => e.stopPropagation()}>
            <h4 className="text-sm font-medium mb-3">Connecter WhatsApp</h4>
            {whatsappQR ? (
              <div className="flex flex-col items-center gap-3">
                <div className="bg-white p-3 rounded-xl">
                  <img src={whatsappQR} alt="QR Code WhatsApp" className="w-48 h-48" />
                </div>
                <p className="text-[11px] text-muted text-center leading-relaxed">
                  Ouvre <strong>WhatsApp</strong> sur ton téléphone<br/>
                  → Menu ⋮ → <strong>Appareils connectés</strong><br/>
                  → <strong>Connecter un appareil</strong><br/>
                  → Scan le QR code ci-dessus
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 py-6">
                <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                <p className="text-xs text-muted">{whatsappStatus || 'Connexion en cours...'}</p>
              </div>
            )}
            {whatsappStatus && whatsappQR && (
              <p className="text-xs text-accent text-center mt-3">{whatsappStatus}</p>
            )}
            <div className="flex justify-end pt-4">
              <button onClick={() => { setShowWhatsAppModal(false); if (pollingRef.current) clearInterval(pollingRef.current) }} className="px-3 py-2 text-xs text-muted rounded-lg hover:text-text transition-colors" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
