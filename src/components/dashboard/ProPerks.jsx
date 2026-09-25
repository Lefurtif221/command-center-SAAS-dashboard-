import { Check } from 'lucide-react'

export const PRO_PERKS = [
  'Jusqu a 20 equipes',
  'Jusqu a 50 membres par equipe',
  'Statistiques sur 365 jours (7 en gratuit)',
  'Toutes les fonctions gratuites, en plus grand',
]

export default function ProPerks({ className = '' }) {
  return (
    <ul className={`space-y-1.5 ${className}`}>
      {PRO_PERKS.map((perk) => (
        <li key={perk} className="flex items-start gap-2 text-[12px] leading-snug" style={{ color: 'var(--color-muted)' }}>
          <Check size={13} style={{ color: '#10B981' }} className="shrink-0 mt-0.5" />
          {perk}
        </li>
      ))}
    </ul>
  )
}
