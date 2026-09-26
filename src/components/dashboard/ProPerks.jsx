import { Check } from 'lucide-react'

export const PRO_PERKS = [
  'Jusqu a 7 equipes',
  'Jusqu a 10 membres par equipe',
  'Statistiques sur 90 jours (7 en gratuit)',
  'Toutes les fonctions gratuites, en plus grand',
]

export const ENTREPRISE_PERKS = [
  'Jusqu a 20 equipes',
  'Jusqu a 50 membres par equipe',
  'Statistiques sur 365 jours (90 en Pro)',
  'Tout le palier Pro, pour toute la structure',
]

export default function ProPerks({ className = '', size = 'text-[12px]', perks = PRO_PERKS }) {
  return (
    <ul className={`space-y-1.5 ${className}`}>
      {perks.map((perk) => (
        <li key={perk} className={`flex items-start gap-2 ${size} leading-snug`} style={{ color: 'var(--color-muted)' }}>
          <Check size={13} style={{ color: '#10B981' }} className="shrink-0 mt-0.5" />
          {perk}
        </li>
      ))}
    </ul>
  )
}
