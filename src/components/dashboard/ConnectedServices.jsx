import { useState, useEffect } from 'react'
import { useDashboard } from '../../hooks/useDashboard'
import { useAuth } from '../../hooks/useAuth'
import { apiFetch } from '../../utils/api'

export default function ConnectedServices() {
  const { services, disconnectService } = useDashboard()
  const { user } = useAuth()
  const [connectedList, setConnectedList] = useState([])
  const [loading, setLoading] = useState(null)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const data = await apiFetch('/api/services')
      setConnectedList(data.services || [])
    } catch (err) {
      console.error('Failed to fetch services:', err)
    }
  }

  const handleConnect = async (serviceName) => {
    setLoading(serviceName)
    try {
      const data = await apiFetch(`/api/services/${serviceName}/authorize`)
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error('OAuth error:', err)
      setLoading(null)
    }
  }

  const handleDisconnect = async (serviceName) => {
    if (!window.confirm(`Déconnecter ${serviceName} ?`)) return
    try {
      await apiFetch(`/api/services/${serviceName}`, { method: 'DELETE' })
      setConnectedList(prev => prev.filter(s => s !== serviceName))
      disconnectService(serviceName)
    } catch (err) {
      console.error('Disconnect error:', err)
    }
  }

  const allServices = [
    { id: 'gmail', name: 'Gmail', icon: '📧', desc: 'Emails, calendrier, contacts' },
    { id: 'whatsapp', name: 'WhatsApp', icon: '💬', desc: 'Messages WhatsApp Web', external: true, url: 'https://web.whatsapp.com' },
  ]

  return (
    <div className="glass rounded-xl" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <h3 className="text-sm font-display font-medium">Services connectés</h3>
      </div>
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {allServices.map((service) => {
          const isConnected = connectedList.includes(service.id) || service.external
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
                {service.external ? (
                  <a href={service.url} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 bg-accent/10 border border-accent/20 rounded-xl text-xs text-accent hover:bg-accent/15 transition-all duration-200 text-center">
                    Ouvrir
                  </a>
                ) : isConnected ? (
                  <button onClick={() => handleDisconnect(service.id)} className="glass flex-1 px-2 py-2.5 rounded-xl text-xs text-accentSec hover:bg-accentSec/5 transition-all duration-200" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>
                    Déconnecter
                  </button>
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
    </div>
  )
}
