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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl animate-scale-in"
        style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>

        <div className="flex items-start justify-between gap-4 px-6 sm:px-8 pt-6 pb-5" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(37,99,235,0.1)', color: '#2563EB' }}>
              <Sparkles size={20} />
            </span>
            <div>
              <h4 className="text-base sm:text-lg font-display font-medium leading-tight">Passer en Pro</h4>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>Formule mensuelle, sans engagement</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer"
            className="p-2 rounded-lg transition-colors shrink-0" style={{ color: 'var(--color-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 sm:px-8 py-6">
          <div className="space-y-5">
            <div>
              <div className="flex items-baseline flex-wrap gap-x-2">
                <span className="text-4xl sm:text-5xl font-display font-semibold tracking-tight" style={{ color: 'var(--color-text)' }}>2000</span>
                <span className="text-base font-medium" style={{ color: 'var(--color-text)' }}>FCFA</span>
                <span className="text-xs" style={{ color: 'var(--color-muted)' }}>/ 1er mois</span>
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>puis 2500 FCFA / mois</p>
            </div>

            <div>
              <p className="text-xs mb-2.5 font-medium" style={{ color: 'var(--color-muted)' }}>Ce que tu debloques :</p>
              <ProPerks size="text-[13px]" />
            </div>

            <div className="rounded-xl p-4" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
              <p className="text-xs font-medium mb-2.5">Comment ca marche</p>
              <ol className="space-y-2.5">
                {STEPS.map((step, i) => (
                  <li key={step} className="flex items-start gap-2.5 text-[13px] leading-snug" style={{ color: 'var(--color-muted)' }}>
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-medium shrink-0 mt-px"
                      style={{ background: 'rgba(37,99,235,0.1)', color: '#2563EB' }}>{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-xs mb-2.5 font-medium" style={{ color: 'var(--color-muted)' }}>Moyens de paiement</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-2">
                {METHODS.map((m) => (
                  <div key={m.label} className="flex items-center gap-3 px-3 py-3 rounded-xl"
                    style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(37,99,235,0.1)', color: '#2563EB' }}>
                      <m.icon size={15} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium leading-tight truncate">{m.label}</p>
                      <p className="text-[11px] leading-tight truncate" style={{ color: 'var(--color-muted)' }}>{m.hint}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-xl p-4"
              style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.25)' }}>
              <ShieldCheck size={16} style={{ color: '#10B981' }} className="shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                Paiement securise. Pas de prelevement automatique : tu gardes Pro 31 jours, puis tu choisis si tu renouvelles.
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 sm:px-8 pb-6 pt-1 space-y-3">
          {error && (
            <p className="text-xs px-3 py-2.5 rounded-lg" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#F59E0B' }}>
              {error}
            </p>
          )}
          <button type="button" onClick={pay} disabled={loading}
            className="w-full flex items-center justify-center gap-2 font-medium text-sm sm:text-base py-3.5 rounded-xl transition-colors duration-150 disabled:opacity-60"
            style={{ background: '#2563EB', color: '#FFF' }}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {loading ? 'Ouverture du paiement...' : 'Payer 2000 FCFA'}
          </button>
        </div>
      </div>
    </div>
  )
}
