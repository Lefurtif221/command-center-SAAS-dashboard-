import { useEffect, useState } from 'react'
import { Sparkles, ShieldCheck, X, Loader2, Smartphone, CreditCard, Wallet } from 'lucide-react'
import { apiFetch } from '../../utils/api'
import ProPerks from './ProPerks'

const METHODS = [
  { icon: Smartphone, label: 'Wave', hint: 'Numero Wave' },
  { icon: Wallet, label: 'Orange Money', hint: 'Numero OM' },
  { icon: Wallet, label: 'Free Money', hint: 'Numero Free' },
  { icon: CreditCard, label: 'Carte bancaire', hint: 'Visa / Mastercard' },
]

const STEPS = [
  'Choisis ton moyen de paiement',
  'Valide sur ton telephone (OTP)',
  'Ta formule Pro est activee tout de suite',
]

export default function PaymentModal({ onClose }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const pay = async () => {
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
        setError('Le service de paiement n a pas repondu. Reessaie dans un instant.')
      } else {
        setError(err.message || 'Une erreur est survenue')
      }
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-scale-in"
        style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>

        <div className="flex items-start justify-between gap-3 px-5 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'rgba(37,99,235,0.1)', color: '#2563EB' }}>
              <Sparkles size={16} />
            </span>
            <div>
              <h4 className="text-sm font-medium leading-tight">Passer en Pro</h4>
              <p className="text-[10px]" style={{ color: 'var(--color-muted)' }}>Formule mensuelle, sans engagement</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer"
            className="p-1 rounded-lg transition-colors" style={{ color: 'var(--color-muted)' }}>
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div className="flex items-baseline flex-wrap gap-x-1.5">
            <span className="text-3xl font-display font-semibold tracking-tight" style={{ color: 'var(--color-text)' }}>2000</span>
            <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>FCFA</span>
            <span className="text-[11px]" style={{ color: 'var(--color-muted)' }}>/ 1er mois</span>
            <span className="text-[11px] w-full" style={{ color: 'var(--color-muted)' }}>puis 2500 FCFA / mois</span>
          </div>

          <div>
            <p className="text-[11px] mb-2 font-medium" style={{ color: 'var(--color-muted)' }}>Ce que tu debloques :</p>
            <ProPerks />
          </div>

          <div>
            <p className="text-[11px] mb-2 font-medium" style={{ color: 'var(--color-muted)' }}>Moyens de paiement</p>
            <div className="grid grid-cols-2 gap-1.5">
              {METHODS.map((m) => (
                <div key={m.label} className="flex items-center gap-2 px-2.5 py-2 rounded-lg"
                  style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                  <m.icon size={14} style={{ color: '#2563EB' }} className="shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium leading-tight truncate">{m.label}</p>
                    <p className="text-[9px] leading-tight truncate" style={{ color: 'var(--color-muted)' }}>{m.hint}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl p-3" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
            <ol className="space-y-1.5">
              {STEPS.map((step, i) => (
                <li key={step} className="flex items-start gap-2 text-[11px] leading-snug" style={{ color: 'var(--color-muted)' }}>
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-medium shrink-0 mt-px"
                    style={{ background: 'rgba(37,99,235,0.1)', color: '#2563EB' }}>{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {error && (
            <p className="text-[11px] px-3 py-2 rounded-lg" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#F59E0B' }}>
              {error}
            </p>
          )}
        </div>

        <div className="px-5 pb-5 space-y-2.5">
          <button type="button" onClick={pay} disabled={loading}
            className="w-full flex items-center justify-center gap-2 font-medium text-sm py-2.5 rounded-xl transition-colors duration-150 disabled:opacity-60"
            style={{ background: '#2563EB', color: '#FFF' }}>
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {loading ? 'Ouverture du paiement...' : 'Payer 2000 FCFA'}
          </button>
          <p className="flex items-start gap-1.5 text-[10px] leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            <ShieldCheck size={12} className="shrink-0 mt-px" />
            Paiement securise. Pas de prelevement automatique : tu gardes Pro 31 jours, puis tu choisis si tu renouvelles.
          </p>
        </div>
      </div>
    </div>
  )
}
