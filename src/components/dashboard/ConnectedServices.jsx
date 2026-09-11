import { useState, useEffect } from 'react'
import { useDashboard } from '../../hooks/useDashboard'
import { useAuth } from '../../hooks/useAuth'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

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
      const token = localStorage.getItem('command_center_token')
      const res = await fetch(`${API_URL}/api/services`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setConnectedList(data.services || [])
    } catch (err) {
      console.error('Failed to fetch services:', err)
    }
  }

  const handleConnect = async (serviceName) => {
    setLoading(serviceName)
    try {
      const token = localStorage.getItem('command_center_token')
      const res = await fetch(`${API_URL}/api/services/${serviceName}/authorize`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
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
      const token = localStorage.getItem('command_center_token')
      await fetch(`${API_URL}/api/services/${serviceName}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
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
    <div className="bg-surface border border-border rounded-lg">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="text-sm font-medium">Services connectés</h3>
      </div>
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {allServices.map((service) => {
          const isConnected = connectedList.includes(service.id) || service.external
          return (
            <div key={service.id} className={`p-3 rounded-lg border transition-all ${isConnected ? 'bg-bg border-success/20' : 'bg-bg border-border hover:border-muted'}`}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xl">{service.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{service.name}</p>
                  <p className="text-[10px] text-muted">{service.desc}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {service.external ? (
                  <a href={service.url} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-accent/10 border border-accent/30 rounded text-xs text-accent hover:bg-accent/20 transition-colors text-center">
                    Ouvrir
                  </a>
                ) : isConnected ? (
                  <button onClick={() => handleDisconnect(service.id)} className="flex-1 px-2 py-1.5 bg-bg border border-border rounded text-xs text-accentSec hover:bg-accentSec/5 transition-colors">
                    Déconnecter
                  </button>
                ) : (
                  <button onClick={() => handleConnect(service.id)} disabled={loading === service.id} className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-accent/10 border border-accent/30 rounded text-xs text-accent hover:bg-accent/20 transition-colors disabled:opacity-50">
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