import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import PaymentModal from './PaymentModal'

export default function UpgradeButton({ label, plan = 'pro', size = 'md', full = false }) {
  const [open, setOpen] = useState(false)
  const text = label || (plan === 'entreprise' ? 'Passer en Entreprise' : 'Passer en Pro')

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1.5 font-medium rounded-xl transition-colors duration-150 ${full ? 'w-full justify-center px-4 py-2.5 text-xs' : size === 'sm' ? 'px-3 py-1.5 text-[11px]' : 'px-4 py-2 text-xs'}`}
        style={{ background: '#2563EB', color: '#FFF' }}>
        <Sparkles size={13} />
        {text}
      </button>
      {open && <PaymentModal plan={plan} onClose={() => setOpen(false)} />}
    </>
  )
}
