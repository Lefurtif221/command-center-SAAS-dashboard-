import { useState } from 'react'
import { Heart, X } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const DISMISS_KEY = 'pp_thank_you_dismissed'

export default function ThankYouBanner() {
  const { user } = useAuth()
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(DISMISS_KEY) === '1' } catch { return false }
  })

  if (!user?.thank_you || dismissed) return null

  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, '1') } catch { /* stockage indisponible */ }
    setDismissed(true)
  }

  return (
    <div
      className="mx-3 md:mx-6 mt-3 flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs animate-toast-in"
      style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#10B981' }}
    >
      <Heart size={14} className="shrink-0" />
      <span>{user.thank_you}</span>
      <button
        onClick={dismiss}
        aria-label="Masquer le message"
        className="ml-auto shrink-0 opacity-70 hover:opacity-100 transition-opacity"
      >
        <X size={14} />
      </button>
    </div>
  )
}
