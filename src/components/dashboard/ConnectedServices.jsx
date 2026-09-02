import { useState } from 'react'
import { useDashboard } from '../../hooks/useDashboard'

export default function ConnectedServices() {
  const { services, connectService, disconnectService, syncService } = useDashboard()
  const [connecting, setConnecting] = useState(null)
  const handleConnect = async (s) => { setConnecting(s); await connectService(s); setConnecting(null) }

  return (
    <div className="bg-surface border border-border rounded-lg">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="text-sm font-medium">Services connectés</h3>
      </div>
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {Object.entries(services).map(([key, service]) => (
          <div key={key} className={`p-3 rounded-lg border transition-all ${service.connected ? 'bg-bg border-success/20' : 'bg-bg border-border hover:border-muted'}`}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xl">{service.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-medium">{service.name}</p>
                <p className={`text-[10px] ${service.connected ? 'text-success' : 'text-muted'}`}>{service.connected ? 'Connecté' : 'Non connecté'}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {service.connected ? (
                <>
                  <button onClick={() => syncService(key)} className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-bg border border-border rounded text-xs text-muted hover:text-text hover:border-accent/30 transition-colors">
                    <span className="iconify" data-icon="lucide:refresh-cw" data-width="12"></span>Sync
                  </button>
                  <button onClick={() => { if (window.confirm(`Déconnecter ${service.name} ?`)) disconnectService(key) }} className="px-2 py-1.5 bg-bg border border-border rounded text-xs text-accentSec hover:bg-accentSec/5 transition-colors">
                    <span className="iconify" data-icon="lucide:unplug" data-width="12"></span>
                  </button>
                </>
              ) : (
                <button onClick={() => handleConnect(key)} disabled={connecting === key} className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-accent/10 border border-accent/30 rounded text-xs text-accent hover:bg-accent/20 transition-colors disabled:opacity-50">
                  <span className="iconify" data-icon="lucide:plug" data-width="12"></span>{connecting === key ? '...' : 'Connecter'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}