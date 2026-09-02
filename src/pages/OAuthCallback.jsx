import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function OAuthCallback() {
  const { service } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [status, setStatus] = useState('Connexion en cours...')

  useEffect(() => {
    if (!user) { navigate('/auth'); return }

    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const error = params.get('error')

    if (error) {
      setStatus(`Erreur: ${error}`)
      setTimeout(() => navigate('/dashboard'), 3000)
      return
    }

    if (!code) {
      setStatus('Code manquant')
      setTimeout(() => navigate('/dashboard'), 3000)
      return
    }

    const token = localStorage.getItem('command_center_token')
    fetch(`${API_URL}/api/services/${service}/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ code }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStatus(`${service} connecté avec succès !`)
        } else {
          setStatus(`Erreur: ${data.error || 'Inconnue'}`)
        }
      })
      .catch(err => {
        setStatus(`Erreur de connexion: ${err.message}`)
      })
      .finally(() => {
        setTimeout(() => navigate('/dashboard'), 2000)
      })
  }, [service, user, navigate])

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm text-muted">{status}</p>
      </div>
    </div>
  )
}