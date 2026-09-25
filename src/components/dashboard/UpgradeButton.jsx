import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { apiFetch } from '../../utils/api'

export default function UpgradeButton({ label = 'Passer en Pro', size = 'md' }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const start = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await apiFetch('/api/pay/init', {
        method: 'POST',
        body: JSON.stringify({ plan: 'pro' }),
      })
      window.location.href = data.payment_url
    } catch (err) {
      if (err.status === 503 || err.apiCode === 'PAY_NOT_CONFIGURED') {
        setError('Le paiement en ligne arrive bientot.')
      } else if (err.apiCode === 'PAY_INIT_FAILED') {
        setError("Le guichet CinetPay n'a pas repondu. Reessaie dans un instant.")
      } else {
        setError(err.message || 'Une erreur est survenue')
      }
      setLoading(false)
    }
  }

  return (
    <span className="inline-flex flex-col gap-1.5 items-start">
      <button type="button" onClick={start} disabled={loading}
        className={`inline-flex items-center gap-1.5 font-medium rounded-xl transition-colors duration-150 disabled:opacity-60 ${size === 'sm' ? 'px-3 py-1.5 text-[11px]' : 'px-4 py-2 text-xs'}`}
        style={{ background: '#2563EB', color: '#FFF' }}>
        {loading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
        {loading ? 'Ouverture du paiement...' : label}
      </button>
      {error && <span className="text-[11px]" style={{ color: '#F59E0B' }}>{error}</span>}
    </span>
  )
}
