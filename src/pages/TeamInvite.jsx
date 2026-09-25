import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { apiFetch } from '../utils/api'
import { ArrowLeft, Users, Check, Loader2 } from 'lucide-react'

export default function TeamInvite() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [invitation, setInvitation] = useState(null)
  const [error, setError] = useState('')
  const [accepting, setAccepting] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!token) { setError('Lien d invitation invalide'); setLoading(false); return }
    if (!isAuthenticated) { setLoading(false); return }

    apiFetch(`/api/teams/invitations/${token}`)
      .then(data => setInvitation(data.invitation))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [token, isAuthenticated, authLoading])

  const accept = async () => {
    setAccepting(true); setError('')
    try {
      await apiFetch(`/api/teams/invitations/${token}/accept`, { method: 'POST' })
      setAccepted(true)
    } catch (err) { setError(err.message) }
    finally { setAccepting(false) }
  }

  const goToAuth = () => {
    const next = encodeURIComponent(`/team/invite?token=${token}`)
    navigate(`/auth?next=${next}`)
  }

  const inputStyle = { background: 'var(--color-bg)', border: '1px solid var(--color-border)' }

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: 'var(--color-bg)' }}>
      <div className="w-full max-w-md">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm mb-8 transition-colors" style={{ color: 'var(--color-muted)' }}>
          <ArrowLeft size={16} /><span>Retour</span>
        </button>

        <div className="flex items-center gap-2.5 mb-8">
          <img src="/logo.png" alt="Personal Place" className="w-7 h-7 rounded-lg" />
          <span className="font-display font-semibold tracking-tight text-sm">Personal Place</span>
        </div>

        <div className="p-6 rounded-xl" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
            style={{ background: 'rgba(37,99,235,0.12)', color: '#2563EB', border: '1px solid rgba(37,99,235,0.2)' }}>
            <Users size={18} />
          </div>

          {accepted ? (
            <>
              <h1 className="text-lg font-display font-semibold mb-2">Vous avez rejoint l'equipe</h1>
              <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>
                Les taches partagees de « {invitation?.team_name} » apparaissent maintenant dans votre dashboard.
              </p>
              <button onClick={() => navigate('/dashboard')} className="w-full text-sm font-medium py-2.5 rounded-lg transition-colors"
                style={{ background: '#2563EB', color: '#FFF' }}>
                Aller au dashboard
              </button>
            </>
          ) : loading ? (
            <p className="text-sm flex items-center gap-2" style={{ color: 'var(--color-muted)' }}>
              <Loader2 size={14} className="animate-spin" /> Verification de l'invitation...
            </p>
          ) : error && !invitation ? (
            <>
              <h1 className="text-lg font-display font-semibold mb-2">Invitation invalide</h1>
              <p className="text-sm" style={{ color: '#EF4444' }}>{error}</p>
            </>
          ) : !isAuthenticated ? (
            <>
              <h1 className="text-lg font-display font-semibold mb-2">Invitation a « {invitation?.team_name || 'une equipe'} »</h1>
              <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>
                {invitation ? `Adressee a ${invitation.email}. ` : ''}
                Connectez-vous ou creez un compte avec cet email pour accepter.
              </p>
              <button onClick={goToAuth} className="w-full text-sm font-medium py-2.5 rounded-lg transition-colors"
                style={{ background: '#2563EB', color: '#FFF' }}>
                Se connecter pour accepter
              </button>
            </>
          ) : (
            <>
              <h1 className="text-lg font-display font-semibold mb-2">Rejoindre « {invitation?.team_name} »</h1>
              <p className="text-sm mb-1" style={{ color: 'var(--color-muted)' }}>
                Role : <span style={{ color: '#2563EB' }}>{invitation?.role === 'admin' ? 'Administrateur' : 'Membre'}</span>
              </p>
              <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>
                Invites a {invitation?.email}
              </p>
              {error && <div className="mb-4 p-2.5 rounded-lg text-xs" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}>{error}</div>}
              <button onClick={accept} disabled={accepting}
                className="w-full text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: '#2563EB', color: '#FFF' }}>
                {accepting ? <><Loader2 size={14} className="animate-spin" /> Acceptation...</> : <><Check size={15} /> Accepter l'invitation</>}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
