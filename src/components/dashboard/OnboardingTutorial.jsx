import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X, ChevronRight, ChevronLeft, ArrowUpRight, Sparkles, Plug, LayoutGrid, BarChart3, CreditCard, Rocket } from 'lucide-react'
import { useDashboard } from '../../hooks/useDashboard'

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
    desc: "Minutes de focus, taches du jour et streak. 7 jours en gratuit, 90 avec la formule Pro, 365 avec Entreprise.",
    action: { section: 'stats', label: 'Voir mes statistiques' },
  },
  {
    icon: CreditCard,
    target: '[data-tutorial="sidebar-settings"]',
    position: 'right',
    title: 'Ton abonnement',
    desc: "Settings affiche ta formule et tes quotas. Le bouton Passer en Pro ouvre le paiement : 2000 FCFA le 1er mois, puis 2500 / mois (7500 / mois en Entreprise).",
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
const MIN_GAP = 12

function placeTooltip(targetRect, position, w, h) {
  const gap = MIN_GAP
  const vw = window.innerWidth
  const vh = window.innerHeight
  const narrow = vw < 768

  // Petits ecrans : le cartouche se place sous la cible, sinon au-dessus,
  // sinon il est colle en bas (la cible est alors remontee par locate())
  if (narrow) {
    const wN = Math.min(480, vw - gap * 2)
    const centered = { left: '50%', transform: 'translateX(-50%)', width: wN, arrow: null }
    if (targetRect) {
      const bottomOfTarget = targetRect.top + targetRect.height
      if (bottomOfTarget + gap + h <= vh - gap) return { top: bottomOfTarget + gap, ...centered }
      if (targetRect.top - gap - h >= gap) return { top: targetRect.top - gap - h, ...centered }
    }
    return { top: 'auto', bottom: gap, ...centered }
  }

  const sides = position === 'right' ? ['right', 'left', 'bottom', 'top'] : position === 'bottom' ? ['bottom', 'top'] : ['top', 'bottom']

  const candidates = []
  if (targetRect) {
    const r = {
      top: targetRect.top,
      left: targetRect.left,
      right: targetRect.left + targetRect.width,
      bottom: targetRect.top + targetRect.height,
      width: targetRect.width,
      height: targetRect.height,
    }
    for (const side of sides) {
      if (side === 'right') candidates.push({ top: r.top + r.height / 2 - h / 2, left: r.right + gap, arrow: 'left' })
      else if (side === 'left') candidates.push({ top: r.top + r.height / 2 - h / 2, left: r.left - gap - w, arrow: 'right' })
      else if (side === 'bottom') candidates.push({ top: r.bottom + gap, left: r.left + r.width / 2 - w / 2, arrow: 'top' })
      else candidates.push({ top: r.top - gap - h, left: r.left + r.width / 2 - w / 2, arrow: 'bottom' })
    }
  }

  for (const c of candidates) {
    if (c.left >= gap && c.left + w <= vw - gap && c.top >= gap && c.top + h <= vh - gap) return c
  }

  const fallback = candidates.find((c) => Number.isFinite(c.top) && Number.isFinite(c.left))
  if (fallback) {
    return {
      top: Math.min(Math.max(gap, fallback.top), Math.max(gap, vh - h - gap)),
      left: Math.min(Math.max(gap, fallback.left), Math.max(gap, vw - w - gap)),
      arrow: null,
    }
  }

  return { top: (vh - h) / 2, left: (vw - w) / 2, arrow: null }
}

export default function OnboardingTutorial() {
  const [show, setShow] = useState(false)
  const [step, setStep] = useState(0)
  const [targetRect, setTargetRect] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  const [vw, setVw] = useState(() => (typeof window === 'undefined' ? 1024 : window.innerWidth))
  const [cardH, setCardH] = useState(0)
  const { setActiveSection } = useDashboard()
  const cardRef = useRef(null)

  const current = STEPS[step]

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 768)
      setVw(window.innerWidth)
    }
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
      // Plusieurs cibles existent (aside desktop masque + tiroir mobile) : on prend la visible
      const nodes = document.querySelectorAll(s.target)
      let el = null
      for (const n of nodes) {
        if (n.offsetWidth > 0 && n.offsetHeight > 0) { el = n; break }
      }
      if (!el) { setTargetRect(null); return }

      // Ramene la cible dans la zone visible (scroll bloque pendant le tutoriel)
      const narrow = window.innerWidth < 768
      const pad = 16
      const before = el.getBoundingClientRect()
      const out = before.top < pad || before.bottom > window.innerHeight - pad
      const inLowerHalf = narrow && before.bottom > window.innerHeight * 0.55
      if (out || inLowerHalf) {
        const prev = document.body.style.overflow
        document.body.style.overflow = ''
        el.scrollIntoView({ block: narrow ? 'start' : 'center', behavior: 'auto' })
        document.body.style.overflow = prev
      }

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
    setCardH(0)
    localStorage.setItem('personalplace_onboarding_seen', 'true')
    window.dispatchEvent(new Event('tutorial:close-sidebar'))
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

  // Hauteur reelle du cartouche pour le calage (mesure a chaque rendu, sans boucle)
  useLayoutEffect(() => {
    if (!show) { setCardH(0); return }
    const el = cardRef.current
    if (!el) return
    const nh = el.offsetHeight
    setCardH((prev) => (Math.abs(prev - nh) > 1 ? nh : prev))
  })

  if (!show) return null

  const Icon = current.icon
  const isCenter = !current.target || !targetRect
  const w = Math.max(240, Math.min(360, vw - MIN_GAP * 2))
  const h = cardH || 320
  const pos = isCenter
    ? { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', arrow: null }
    : placeTooltip(targetRect, current.position, w, h)
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

      {targetRect && !isCenter && (() => {
        const vw = window.innerWidth
        const vh = window.innerHeight
        const left = Math.min(Math.max(0, targetRect.left - SPOT_RADIUS), Math.max(0, vw - targetRect.width - SPOT_RADIUS * 2))
        const top = Math.min(Math.max(0, targetRect.top - SPOT_RADIUS), Math.max(0, vh - targetRect.height - SPOT_RADIUS * 2))
        return (
          <div
            className="fixed transition-all duration-300"
            style={{
              top,
              left,
              width: targetRect.width + SPOT_RADIUS * 2,
              height: targetRect.height + SPOT_RADIUS * 2,
              borderRadius: 14,
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.72), 0 0 0 2px rgba(37,99,235,0.9)',
              zIndex: 10001,
              pointerEvents: 'none',
            }}
          />
        )
      })()}

      <div
        ref={cardRef}
        key={step}
        className="fixed rounded-2xl shadow-2xl animate-scale-in overflow-hidden"
        style={{
          ...pos,
          zIndex: 10002,
          width: pos.width ?? w,
          maxWidth: `calc(100vw - ${MIN_GAP * 2}px)`,
          maxHeight: `calc(100vh - ${MIN_GAP * 2}px)`,
          overflowY: 'auto',
          background: 'var(--color-surface-solid)',
          border: '1px solid var(--color-border)',
        }}
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
              className="w-full mt-4 px-3 py-2.5 min-h-[40px] text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              style={{ background: 'rgba(37,99,235,0.12)', color: '#2563EB' }}>
              {current.action.label} <ArrowUpRight size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 px-4 sm:px-5 py-3" style={{ borderTop: '1px solid var(--color-border)' }}>
          <button type="button" onClick={close} className="text-[12px] transition-colors py-2.5 px-1.5 -ml-1.5 rounded-lg" style={{ color: 'var(--color-muted)' }}>
            Passer
          </button>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button type="button" onClick={prev}
                className="px-3.5 py-2.5 text-xs rounded-xl transition-colors flex items-center gap-1 min-h-[40px]"
                style={{ color: 'var(--color-muted)', background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                <ChevronLeft size={13} /> Retour
              </button>
            )}
            <button type="button" onClick={next}
              className="px-4 py-2.5 text-xs font-medium rounded-xl transition-colors duration-150 flex items-center gap-1 min-h-[40px]"
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
