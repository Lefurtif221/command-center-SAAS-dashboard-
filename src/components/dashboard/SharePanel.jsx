import { useEffect, useState } from 'react'
import { useDashboard } from '../../hooks/useDashboard'
import { Share2, Copy, Check, Users, ArrowRight, Heart } from 'lucide-react'
import { apiFetch } from '../../utils/api'

export default function SharePanel({ compact = false }) {
  const { setActiveSection } = useDashboard()
  const [url, setUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [thanks, setThanks] = useState('')
  const [hint, setHint] = useState('')

  useEffect(() => {
    let alive = true
    apiFetch('/api/me/referral')
      .then(({ code }) => { if (alive) setUrl(`${window.location.origin}/?ref=${code}`) })
      .catch(() => { /* lien indisponible, on masque le champ */ })
    return () => { alive = false }
  }, [])

  const showThanks = (msg) => {
    setThanks(msg)
    setHint('')
    setTimeout(() => setThanks(''), 3000)
  }

  const copyLink = async () => {
    if (!url) return
    let ok = false
    try {
      await navigator.clipboard.writeText(url)
      ok = true
    } catch {
      // Presse-papiers refuse : zone de texte invisible + execCommand (marche partout)
      const ta = document.createElement('textarea')
      ta.value = url
      ta.setAttribute('readonly', '')
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      try { ok = document.execCommand('copy') } catch { ok = false }
      document.body.removeChild(ta)
    }
    if (ok) {
      setCopied(true)
      showThanks('Lien copié — merci de faire découvrir Personal Place !')
      setTimeout(() => setCopied(false), 1500)
    } else {
      setThanks('')
      setHint('Copie manuelle : sélectionne le lien dans le champ puis Ctrl+C')
      setTimeout(() => setHint(''), 3000)
    }
  }

  const share = async () => {
    if (!url) return
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Personal Place', text: 'Mon espace pour mes emails, tâches et agenda — regarde :', url })
        showThanks('Merci d’avoir partagé !')
      } catch { /* partage annule par l'utilisateur */ }
    } else {
      copyLink()
    }
  }

  const goTeam = () => setActiveSection('team')

  if (compact) {
    return (
      <div className="rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 animate-fade-in"
        style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>
        <span className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center"
          style={{ background: 'rgba(37,99,235,0.1)', color: '#2563EB' }}>
          <Share2 size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-display font-medium">Invite tes amis</p>
          <p className="text-xs mt-0.5" style={{ color: hint ? '#F59E0B' : 'var(--color-muted)' }}>
            {thanks || hint || 'Partage ton lien : vous formerez une équipe pour bosser sur vos projets ensemble.'}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={copyLink} disabled={!url}
            className="px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 flex items-center gap-1.5 disabled:opacity-50"
            style={{ background: '#2563EB', color: '#FFF' }}>
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? 'Copié !' : 'Copier mon lien'}
          </button>
          <button onClick={share} disabled={!url}
            className="px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 disabled:opacity-50"
            style={{ border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
            Partager
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl overflow-hidden animate-fade-in" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>
      <div className="flex items-center gap-2 p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <Share2 size={14} style={{ color: '#2563EB' }} />
        <h3 className="text-sm font-display font-medium">Invite &amp; partage</h3>
      </div>

      <div className="p-4 md:p-5 space-y-4">
        <p className="text-[13px] leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          Envoie ton lien à tes amis : ils découvrent Personal Place, et vous créez une
          équipe pour travailler sur vos projets ensemble.
        </p>

        <div>
          <label className="block text-xs mb-2" style={{ color: 'var(--color-muted)' }}>Ton lien d’invitation</label>
          <div className="flex gap-2">
            <input
              type="text" readOnly value={url} placeholder="Chargement du lien..."
              onFocus={(e) => e.target.select()}
              className="flex-1 min-w-0 px-3 py-2.5 rounded-xl text-xs focus:outline-none"
              style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}
            />
            <button onClick={copyLink} disabled={!url}
              className="px-3.5 rounded-xl text-xs font-medium transition-all duration-150 flex items-center gap-1.5 disabled:opacity-50 shrink-0"
              style={copied
                ? { background: 'rgba(16,185,129,0.12)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }
                : { background: '#2563EB', color: '#FFF' }}>
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? 'Copié !' : 'Copier'}
            </button>
          </div>
        </div>

        <button onClick={share} disabled={!url}
          className="w-full px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
          <Share2 size={13} />
          Partager maintenant
        </button>

        <div className="flex items-center gap-2 min-h-[20px] text-xs">
          {thanks && (
            <span className="flex items-center gap-1.5" style={{ color: '#10B981' }}>
              <Heart size={12} className="shrink-0" /> {thanks}
            </span>
          )}
          {!thanks && hint && (
            <span style={{ color: '#F59E0B' }}>{hint}</span>
          )}
        </div>

        <div className="rounded-xl p-3.5" style={{ background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.2)' }}>
          <div className="flex items-center gap-2 mb-1.5">
            <Users size={13} style={{ color: '#2563EB' }} />
            <span className="text-xs font-medium">Le mode équipe</span>
          </div>
          <p className="text-[11px] leading-relaxed mb-2.5" style={{ color: 'var(--color-muted)' }}>
            Ajoute tes amis, formez un groupe et construisez vos projets ensemble : tâches partagées, chat et planning commun.
          </p>
          <button onClick={goTeam}
            className="text-xs font-medium flex items-center gap-1 transition-colors hover:opacity-80"
            style={{ color: '#2563EB' }}>
            Ouvrir le mode équipe <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  )
}
