import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X, ChevronRight, ChevronLeft, ArrowUpRight, Sparkles, Plug, LayoutGrid, BarChart3, CreditCard, Rocket } from 'lucide-react'
import { useDashboard } from '../../hooks/useDashboard'

const WIDTH = 360

const STEPS = [
  {
    icon: Sparkles,
    target: null,
    title: 'Bienvenue sur Personal Place',
    desc: "Ton espace productivite : emails, messages, taches, calendrier et focus au meme endroit. 6 etapes, 30 secondes, et tu connais tout.",
  },
  {
    icon: Plug,
    target: '[data-tutorial="connected-services"]',
    position: 'bottom',
    section: 'dashboard',
    title: 'Connecte tes services',
    desc: "Connecte Gmail et WhatsApp ici. Tes emails sont filtres par priorite, tes messages arrivent en direct.",
    action: { section: 'dashboard', label: 'Voir les services connectes' },
  },
  {
    icon: LayoutGrid,
    target: '[data-tutorial="sidebar-emails"]',
    position: 'right',
    title: 'Toute ta navigation',
    desc: "A gauche : Emails, Messages, Calendrier, Taches, Statistiques et Equipe. Chaque module reste synchronise avec tes comptes.",
    action: { section: 'emails', label: 'Ouvrir mes emails' },
  },
  {
    icon: BarChart3,
    target: '[data-tutorial="sidebar-stats"]',
    position: 'right',
    title: 'Tes statistiques',
    desc: "Minutes de focus, taches du jour et streak. Les 7 derniers jours sont gratuits, 365 jours avec la formule Pro.",
    action: { section: 'stats', label: 'Voir mes statistiques' },
  },
  {
    icon: CreditCard,
    target: '[data-tutorial="sidebar-settings"]',
    position: 'right',
    title: 'Ton abonnement',
    desc: "Settings affiche ta formule et tes quotas. Le bouton Passer en Pro ouvre le paiement : 2000 FCFA le 1er mois, puis 2500 / mois.",
    action: { section: 'settings', label: "Voir mon abonnement" },
  },
  {
    icon: Rocket,
    target: null,
    title: "C'est pret !",
    desc: "Commence par connecter Gmail dans les services connectes. Tu peux revoir ce guide quand tu veux depuis Settings.",
  },
]

const SPOT_RADIUS = 10

function placeTooltip(targetRect, position) {
  const gap = 18
  const vw = window.innerWidth
  const vh = window.innerHeight
  const w = WIDTH
  const h = 320

  const candidates = []
  if (targetRect) {
    if (position === 'right') {
      candidates.push({ top: targetRect.top + targetRect.height / 2 - h / 2, left: targetRect.right + gap, arrow: 'left' })
      candidates.push({ top: targetRect.top + targetRect.height / 2 - h / 2, left: targetRect.left - gap - w, arrow: 'right' })
    } else if (position === 'bottom') {
      candidates.push({ top: targetRect.bottom + gap, left: targetRect.left + targetRect.width / 2 - w / 2, arrow: 'top' })
      candidates.push({ top: targetRect.top - gap - h, left: targetRect.left + targetRect.width / 2 - w / 2, arrow: 'bottom' })
    } else {
      candidates.push({ top: targetRect.top - gap - h, left: targetRect.left + targetRect.width / 2 - w / 2, arrow: 'bottom' })
      candidates.push({ top: targetRect.bottom + gap, left: targetRect.left + targetRect.width / 2 - w / 2, arrow: 'top' })
    }
  }

  for (const c of candidates) {
    if (c.left >= gap && c.left + w <= vw - gap && c.top >= gap && c.top + h <= vh - gap) return c
  }

  if (targetRect && candidates.length) {
    const c = candidates[0]
    return {
      top: Math.min(Math.max(gap, c.top), vh - h - gap),
      left: Math.min(Math.max(gap, c.left), vw - w - gap),
      arrow: c.arrow,
    }
  }

  return { top: (vh - h) / 2, left: (vw - w) / 2, arrow: null }
}

export default function OnboardingTutorial() {
  const [show, setShow] = useState(false)
  const [step, setStep] = useState(0)
  const [targetRect, setTargetRect] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  const { setActiveSection } = useDashboard()
  const cardRef = useRef(null)

  const current = STEPS[step]

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (!localStorage.getItem('personalplace_onboarding_seen')) {
      const t = setTimeout(() => setShow(true), 1200)
      return () => clearTimeout(t)
    }
  }, [])

  useEffect(() => {
    const restart = () => { setStep(0); setShow(true) }
    window.addEventListener('tutorial:restart', restart)
    return () => window.removeEventListener('tutorial:restart', restart)
  }, [])

  const findTarget = useCallback(() => {
    const s = STEPS[step]
    if (!s.target) { setTargetRect(null); return }

    const locate = () => {
      const el = document.querySelector(s.target)
      if (!el) { setTargetRect(null); return }
      const r = el.getBoundingClientRect()
      if (r.width === 0 && r.height === 0) { setTargetRect(null); return }
      setTargetRect({ top: r.top, left: r.left, width: r.width, height: r.height })
    }

    if (s.section) {
      setActiveSection(s.section)
      const t = setTimeout(locate, 300)
      return () => clearTimeout(t)
    }

    if (s.position === 'right' && isMobile) {
      window.dispatchEvent(new Event('tutorial:open-sidebar'))
      const t = setTimeout(locate, 420)
      return () => clearTimeout(t)
    }
    locate()
    return undefined
  }, [step, isMobile, setActiveSection])

  useEffect(() => {
    if (!show) return
    findTarget()
    window.addEventListener('resize', findTarget)
    window.addEventListener('scroll', findTarget, true)
    return () => {
      window.removeEventListener('resize', findTarget)
      window.removeEventListener('scroll', findTarget, true)
    }
  }, [show, findTarget])

  useEffect(() => {
    if (!show) return
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [show])

  const close = () => {
    setShow(false)
    localStorage.setItem('personalplace_onboarding_seen', 'true')
  }

  const next = () => (step < STEPS.length - 1 ? setStep(step + 1) : close())
  const prev = () => step > 0 && setStep(step - 1)

  useEffect(() => {
    if (!show) return
    const onKey = (e) => {
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (!show) return null

  const Icon = current.icon
  const isCenter = !current.target || !targetRect
  const pos = isCenter ? { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', arrow: null } : placeTooltip(targetRect, current.position)
  const pct = Math.round(((step + 1) / STEPS.length) * 100)

  const arrowStyle = (arrow) => {
    if (!arrow) return null
    const base = { position: 'absolute', width: 12, height: 12, background: 'var(--color-surface-solid)', transform: 'rotate(45deg)' }
    if (arrow === 'left') return { ...base, left: -6, top: '50%', marginTop: -6, borderLeft: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }
    if (arrow === 'right') return { ...base, right: -6, top: '50%', marginTop: -6, borderRight: '1px solid var(--color-border)', borderTop: '1px solid var(--color-border)' }
    if (arrow === 'top') return { ...base, top: -6, left: '50%', marginLeft: -6, borderLeft: '1px solid var(--color-border)', borderTop: '1px solid var(--color-border)' }
    return { ...base, bottom: -6, left: '50%', marginLeft: -6, borderRight: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }
  }

  return createPortal(
    <>
      <div className="fixed inset-0" style={{ background: 'rgba(0,0,0,0.72)', zIndex: 10000 }} onClick={close} />

      {targetRect && !isCenter && (
        <div
          className="fixed transition-all duration-300"
          style={{
            top: targetRect.top - SPOT_RADIUS,
            left: targetRect.left - SPOT_RADIUS,
            width: targetRect.width + SPOT_RADIUS * 2,
            height: targetRect.height + SPOT_RADIUS * 2,
            borderRadius: 14,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.72), 0 0 0 2px rgba(37,99,235,0.9)',
            zIndex: 10001,
            pointerEvents: 'none',
          }}
        />
      )}

      <div
        ref={cardRef}
        key={step}
        className="fixed rounded-2xl shadow-2xl animate-scale-in overflow-hidden"
        style={{ ...pos, zIndex: 10002, width: WIDTH, background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {pos.arrow && <span style={arrowStyle(pos.arrow)} />}

        <div className="px-5 pt-5 pb-4">
          <div className="flex items-start justify-between gap-3 mb-4">
            <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(37,99,235,0.1)', color: '#2563EB' }}>
              <Icon size={19} />
            </span>
            <button type="button" onClick={close} aria-label="Fermer le tutoriel"
              className="p-1.5 -m-1 rounded-lg transition-colors" style={{ color: 'var(--color-muted)' }}>
              <X size={15} />
            </button>
          </div>

          <p className="text-[11px] font-medium mb-1.5" style={{ color: '#2563EB' }}>
            Etape {step + 1} sur {STEPS.length}
          </p>
          <div className="h-1 rounded-full overflow-hidden mb-3.5" style={{ background: 'var(--color-border)' }}>
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, background: '#2563EB' }} />
          </div>

          <h3 className="text-base font-display font-medium mb-1.5 leading-snug">{current.title}</h3>
          <p className="text-[13px] leading-relaxed" style={{ color: 'var(--color-muted)' }}>{current.desc}</p>

          {current.action && (
            <button type="button"
              onClick={() => { setActiveSection(current.action.section); next() }}
              className="w-full mt-4 px-3 py-2.5 text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              style={{ background: 'rgba(37,99,235,0.12)', color: '#2563EB' }}>
              {current.action.label} <ArrowUpRight size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 px-5 py-3.5" style={{ borderTop: '1px solid var(--color-border)' }}>
          <button type="button" onClick={close} className="text-[11px] transition-colors py-1 pr-1" style={{ color: 'var(--color-muted)' }}>
            Passer
          </button>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button type="button" onClick={prev}
                className="px-3 py-2 text-xs rounded-xl transition-colors flex items-center gap-1"
                style={{ color: 'var(--color-muted)', background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                <ChevronLeft size={13} /> Retour
              </button>
            )}
            <button type="button" onClick={next}
              className="px-4 py-2 text-xs font-medium rounded-xl transition-colors duration-150 flex items-center gap-1"
              style={{ background: '#2563EB', color: '#FFF' }}>
              {step === STEPS.length - 1 ? 'Commencer' : 'Suivant'} <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}
