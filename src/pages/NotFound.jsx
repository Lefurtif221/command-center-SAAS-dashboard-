import { useNavigate } from 'react-router-dom'
import { ArrowLeft, SearchX } from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: 'var(--color-bg)' }}>
      <div className="text-center max-w-md">
        <SearchX size={40} className="mx-auto mb-4" style={{ color: '#2563EB' }} />
        <p className="text-5xl font-display font-semibold tracking-tighter-custom mb-3">404</p>
        <h1 className="text-lg font-display font-medium mb-2">Page introuvable</h1>
        <p className="text-sm mb-8 leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          Cette page n'existe pas ou a ete deplacee.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => navigate('/')} className="flex items-center justify-center gap-2 text-sm font-medium px-5 py-2.5 rounded-lg transition-colors" style={{ background: '#2563EB', color: '#FFF' }}>
            <ArrowLeft size={16} /> Retour a l'accueil
          </button>
          <button onClick={() => navigate('/dashboard')} className="text-sm font-medium px-5 py-2.5 rounded-lg transition-colors" style={{ border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
            Mon dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
