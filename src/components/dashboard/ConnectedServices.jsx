import { useState, useEffect, useRef } from 'react'
import { useDashboard } from '../../hooks/useDashboard'
import { apiFetch } from '../../utils/api'

export default function ConnectedServices() {
  const { disconnectService } = useDashboard()
  const [connectedList, setConnectedList] = useState([])
  const [loading, setLoading] = useState(null)
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)
  const [showGoogleModal, setShowGoogleModal] = useState(false)
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
      setWhatsAppStatus('Generation du QR code...')
      setLoading('whatsapp')
      try {
        const data = await apiFetch('/api/whatsapp/connect', { method: 'POST' })
        if (data.qr) {
          setWhatsAppQR(data.qr)
          setWhatsAppStatus('Scan le QR code avec ton telephone')
          startPolling()
        } else if (data.status === 'connected') {
          setWhatsAppStatus('Connecte !')
          setConnectedList(prev => [...prev, 'whatsapp'])
          setTimeout(() => setShowWhatsAppModal(false), 1500)
        }
      } catch (err) {
        setWhatsAppStatus(err.message || 'Erreur de connexion')
      } finally { setLoading(null) }
      return
    }
    if (serviceName === 'gmail') {
      setShowGoogleModal(true)
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

  const proceedGoogleConnect = async () => {
    setShowGoogleModal(false)
    setLoading('gmail')
    try {
      const data = await apiFetch('/api/services/gmail/authorize')
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
          setWhatsAppStatus('Connecte !')
          setConnectedList(prev => prev.includes('whatsapp') ? prev : [...prev, 'whatsapp'])
          setTimeout(() => setShowWhatsAppModal(false), 1500)
        } else if (data.status === 'disconnected') {
          clearInterval(pollingRef.current)
          pollingRef.current = null
          setWhatsAppStatus('Deconnecte')
        }
      } catch (err) {
        console.error('Status poll error:', err)
      }
    }, 2000)
  }

  const handleDisconnect = async (serviceName) => {
    if (!window.confirm(`Deconnecter ${serviceName} ?`)) return
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
        <h3 className="text-sm font-display font-medium">Services connectes</h3>
      </div>
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3" data-tutorial="connected-services">
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
                  <button onClick={() => handleDisconnect(service.id)} className="glass flex-1 px-2 py-2.5 rounded-xl text-xs text-accentSec hover:bg-accentSec/5 transition-all duration-200" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>Deconnecter</button>
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

      {showGoogleModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={() => setShowGoogleModal(false)}>
          <div className="w-full max-w-lg rounded-2xl p-5 shadow-2xl" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">📧</span>
              <h4 className="text-sm font-medium">Connecter Gmail</h4>
            </div>
            <div className="space-y-3 mb-4">
              <p className="text-[11px] text-muted leading-relaxed">
                Pour connecter ton compte Gmail, tu vas etre redirige vers <strong>Google</strong> pour autoriser l'acces.
              </p>
              <div className="rounded-xl p-3" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                <p className="text-[10px] font-medium text-text mb-2">Ce que l'app pourra faire :</p>
                <ul className="text-[10px] text-muted space-y-1">
                  <li className="flex items-start gap-1.5"><span className="text-success mt-0.5">✓</span> Lire tes emails</li>
                  <li className="flex items-start gap-1.5"><span className="text-success mt-0.5">✓</span> Envoyer des emails</li>
                  <li className="flex items-start gap-1.5"><span className="text-success mt-0.5">✓</span> Acceder a ton calendrier</li>
                  <li className="flex items-start gap-1.5"><span className="text-accentSec mt-0.5">✗</span> Supprimer des emails</li>
                </ul>
              </div>
              <div className="rounded-xl p-3" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                <p className="text-[10px] font-medium text-text mb-2">Etapes :</p>
                <ol className="text-[10px] text-muted space-y-1 list-decimal list-inside leading-relaxed">
                  <li>Clique <strong>"Continuer"</strong> ci-dessous</li>
                  <li>Connecte-toi avec ton compte Google</li>
                  <li>Si un avertissement apparait, clique <strong>"Parametres avances"</strong></li>
                  <li>Puis clique <strong>"Aller sur Personal Place (non verify)"</strong></li>
                  <li>Autorise l'acces et c'est fait !</li>
                </ol>
              </div>
              <p className="text-[10px] text-accentSec leading-relaxed">
                ⚠️ Si Google affiche "App non verifye" : c'est normal en phase de developpement. Clique sur "Parametres avances" puis "Aller sur Personal Place".
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowGoogleModal(false)} className="px-3 py-2 text-xs text-muted rounded-lg hover:text-text transition-colors" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>Annuler</button>
              <button onClick={proceedGoogleConnect} className="px-3 py-2 bg-accent text-bg text-xs font-medium rounded-lg hover:opacity-90 transition-opacity">
                Continuer
              </button>
            </div>
          </div>
        </div>
      )}

      {showWhatsAppModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={() => { setShowWhatsAppModal(false); if (pollingRef.current) clearInterval(pollingRef.current) }}>
          <div className="w-full max-w-2xl rounded-2xl p-5 shadow-2xl" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }} onClick={e => e.stopPropagation()}>
            <h4 className="text-sm font-medium mb-4">Connecter WhatsApp</h4>
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="flex flex-col items-center gap-3">
                {whatsappQR ? (
                  <>
                    <div className="bg-white p-3 rounded-xl">
                      <img src={whatsappQR} alt="QR Code WhatsApp" className="w-44 h-44" />
                    </div>
                    {whatsappStatus && <p className="text-xs text-accent text-center">{whatsappStatus}</p>}
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                    <p className="text-xs text-muted text-center">{whatsappStatus || 'Connexion en cours...'}</p>
                  </>
                )}
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-[11px] font-medium text-text mb-1.5">Comment scanner :</p>
                  <ol className="text-[10px] text-muted space-y-1 list-decimal list-inside leading-relaxed">
                    <li>Ouvre <strong>WhatsApp</strong> sur ton telephone</li>
                    <li>Menu ⋮ → <strong>Appareils connectes</strong></li>
                    <li>Clique <strong>Connecter un appareil</strong></li>
                    <li>Scan le QR code a gauche</li>
                  </ol>
                </div>
                <div className="pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <p className="text-[10px] text-muted leading-relaxed">
                    <span className="text-success font-medium">✓</span> Lecture seule recommandee<br/>
                    <span className="text-success font-medium">✓</span> Pas plus de 50 messages/heure<br/>
                    <span className="text-success font-medium">✓</span> Session stable, pas de reconnexion frequente<br/>
                    <span className="text-accentSec font-medium">✗</span> Evite l'envoi massif de messages
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button onClick={() => { setShowWhatsAppModal(false); if (pollingRef.current) clearInterval(pollingRef.current) }} className="px-3 py-2 text-xs text-muted rounded-lg hover:text-text transition-colors" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
