import { useState, useEffect } from 'react'
import { useDashboard } from '../../hooks/useDashboard'
import { apiFetch } from '../../utils/api'

export default function ConnectedServices() {
  const { disconnectService } = useDashboard()
  const [connectedList, setConnectedList] = useState([])
  const [loading, setLoading] = useState(null)
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)
  const [whatsappToken, setWhatsAppToken] = useState('')
  const [whatsappPhoneId, setWhatsAppPhoneId] = useState('')
  const [whatsappStatus, setWhatsAppStatus] = useState('')

  useEffect(() => { fetchServices() }, [])

  const fetchServices = async () => {
    try {
      const data = await apiFetch('/api/services')
      setConnectedList(data.services || [])
    } catch (err) {
      console.error('Failed to fetch services:', err)
    }
  }

  const handleConnect = async (serviceName) => {
    if (serviceName === 'whatsapp') { setShowWhatsAppModal(true); return }
    setLoading(serviceName)
    try {
      const data = await apiFetch(`/api/services/${serviceName}/authorize`)
      if (data.url) window.location.href = data.url
    } catch (err) {
      console.error('OAuth error:', err); setLoading(null)
    }
  }

  const handleWhatsAppConnect = async () => {
    if (!whatsappToken.trim() || !whatsappPhoneId.trim()) return
    setLoading('whatsapp'); setWhatsAppStatus('')
    try {
      await apiFetch('/api/services/whatsapp/connect', {
        method: 'POST',
        body: JSON.stringify({ accessToken: whatsappToken.trim(), phoneNumberId: whatsappPhoneId.trim() }),
      })
      setConnectedList(prev => [...prev, 'whatsapp'])
      setShowWhatsAppModal(false); setWhatsAppToken(''); setWhatsAppPhoneId('')
    } catch (err) {
      setWhatsAppStatus(err.message || 'Erreur de connexion')
    } finally { setLoading(null) }
  }

  const handleDisconnect = async (serviceName) => {
    if (!window.confirm(`Déconnecter ${serviceName} ?`)) return
    try {
      if (serviceName === 'whatsapp') await apiFetch('/api/services/whatsapp', { method: 'DELETE' })
      else await apiFetch(`/api/services/${serviceName}`, { method: 'DELETE' })
      setConnectedList(prev => prev.filter(s => s !== serviceName))
      disconnectService(serviceName)
    } catch (err) { console.error('Disconnect error:', err) }
  }

  const allServices = [
    { id: 'gmail', name: 'Gmail', icon: '📧', desc: 'Emails, calendrier, contacts' },
    { id: 'whatsapp', name: 'WhatsApp', icon: '💬', desc: 'Messages WhatsApp Business' },
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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={() => setShowWhatsAppModal(false)}>
          <div className="w-full max-w-md rounded-2xl p-5 shadow-2xl" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }} onClick={e => e.stopPropagation()}>
            <h4 className="text-sm font-medium mb-2">Connecter WhatsApp Business</h4>
            <p className="text-[11px] text-muted mb-4 leading-relaxed">
              1. Va sur <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent/80 underline">developers.facebook.com</a><br/>
              2. Crée une app → Ajoute le produit WhatsApp<br/>
              3. Va dans <strong>API Setup</strong> → Génère un token permanent<br/>
              4. Copie le <strong>Phone Number ID</strong> et le <strong>Token</strong> ci-dessous
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] text-muted mb-1 font-mono">Phone Number ID</label>
                <input type="text" placeholder="Ex: 1407552145764653" value={whatsappPhoneId} onChange={(e) => setWhatsAppPhoneId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-xs text-text placeholder:text-muted focus:outline-none focus:border-accent transition-colors" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }} />
              </div>
              <div>
                <label className="block text-[10px] text-muted mb-1 font-mono">Permanent Access Token</label>
                <input type="password" placeholder="EAA..." value={whatsappToken} onChange={(e) => setWhatsAppToken(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-xs text-text placeholder:text-muted focus:outline-none focus:border-accent transition-colors" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }} />
              </div>
              {whatsappStatus && <p className="text-xs text-accentSec">{whatsappStatus}</p>}
              <div className="flex gap-2 justify-end pt-2">
                <button onClick={() => setShowWhatsAppModal(false)} className="px-3 py-2 text-xs text-muted rounded-lg hover:text-text transition-colors" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>Annuler</button>
                <button onClick={handleWhatsAppConnect} disabled={!whatsappToken.trim() || !whatsappPhoneId.trim() || loading === 'whatsapp'}
                  className="px-3 py-2 bg-accent text-bg text-xs font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
                  {loading === 'whatsapp' ? 'Connexion...' : 'Connecter'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
