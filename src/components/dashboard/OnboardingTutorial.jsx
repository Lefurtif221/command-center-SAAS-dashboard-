import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X, ChevronRight, ChevronLeft } from 'lucide-react'

const mobileSteps = [
  {
    target: null,
    title: 'Bienvenue sur Personal Place !',
    desc: "Ton espace productivite personnel. Sur mobile, utilise le menu en haut a gauche pour naviguer. Clique 'Suivant' pour commencer.",
    position: 'center',
  },
  {
    target: '[data-tutorial="connected-services"]',
    title: 'Connecte tes services',
    desc: "Clique 'Connecter' sur Gmail et WhatsApp pour synchroniser tes donnees. C'est ici que tout commence !",
    position: 'bottom',
  },
  {
    target: '[data-tutorial="theme-toggle"]',
    title: 'Mode Sombre / Clair',
    desc: "Bascule entre le mode sombre et clair selon ta preference.",
    position: 'left',
  },
  {
    target: null,
    title: 'Navigation mobile',
    desc: "Utilise le menu hamburger (≡) en haut a gauche pour acceder a tes Emails, Messages, Calendrier, Taches et Concentration.",
    position: 'center',
  },
  {
    target: null,
    title: "C'est tout !",
    desc: "Tu es pret. Explore l'app et connecte tes services pour commencer. Tu peux revoir ce tutoriel en cliquant sur ton profil.",
    position: 'center',
  },
]

const desktopSteps = [
  {
    target: null,
    title: 'Bienvenue sur Personal Place !',
    desc: "Ton espace productivite personnel. Ce guide va te montrer comment utiliser chaque fonctionnalite. Clique 'Suivant' pour commencer.",
    position: 'center',
  },
  {
    target: '[data-tutorial="sidebar-emails"]',
    title: 'Tes Emails',
    desc: "Clique ici pour voir tous tes emails. Le filtre intelligent les classe automatiquement par priorite.",
    position: 'right',
  },
  {
    target: '[data-tutorial="sidebar-messages"]',
    title: 'Messages WhatsApp',
    desc: "Ici tu vois tes messages WhatsApp, comme sur WhatsApp Web. Connecte d'abord ton WhatsApp dans les services.",
    position: 'right',
  },
  {
    target: '[data-tutorial="sidebar-calendar"]',
    title: 'Calendrier',
    desc: "Tes evenements Google Calendar s'affichent ici. Sync automatique avec ton compte Google.",
    position: 'right',
  },
  {
    target: '[data-tutorial="sidebar-tasks"]',
    title: 'Taches',
    desc: "Gere tes taches du jour. Ajoute, complete, et garde un oeil sur ta productivite.",
    position: 'right',
  },
  {
    target: '[data-tutorial="connected-services"]',
    title: 'Connecte tes services',
    desc: "Clique 'Connecter' sur Gmail et WhatsApp pour synchroniser tes donnees. C'est ici que tout commence !",
    position: 'bottom',
  },
  {
    target: '[data-tutorial="theme-toggle"]',
    title: 'Mode Sombre / Clair',
    desc: "Bascule entre le mode sombre et clair selon ta preference.",
    position: 'left',
  },
  {
    target: null,
    title: "C'est tout !",
    desc: "Tu es pret. Explore l'app et connecte tes services pour commencer. Tu peux revoir ce tutoriel en cliquant sur ton profil.",
    position: 'center',
  },
]

export default function OnboardingTutorial() {
  const [show, setShow] = useState(false)
  const [step, setStep] = useState(0)
  const [targetRect, setTargetRect] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  const tooltipRef = useRef(null)

  const steps = isMobile ? mobileSteps : desktopSteps

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const seen = localStorage.getItem('personalplace_onboarding_seen')
    if (!seen) {
      setTimeout(() => setShow(true), 1500)
    }
  }, [])

  const findTarget = useCallback(() => {
    const s = steps[step]
    if (!s.target) { setTargetRect(null); return }
    const el = document.querySelector(s.target)
    if (el) {
      const r = el.getBoundingClientRect()
      if (r.width === 0 && r.height === 0) {
        setTargetRect(null)
      } else {
        setTargetRect({ top: r.top, left: r.left, width: r.width, height: r.height })
      }
    } else {
      setTargetRect(null)
    }
  }, [step, steps])

  useEffect(() => {
    if (!show) return
    findTarget()
    window.addEventListener('resize', findTarget)
    return () => window.removeEventListener('resize', findTarget)
  }, [show, findTarget])

  const handleClose = () => {
    setShow(false)
    localStorage.setItem('personalplace_onboarding_seen', 'true')
  }

  const handleNext = () => {
    if (step < steps.length - 1) setStep(step + 1)
    else handleClose()
  }

  const handlePrev = () => {
    if (step > 0) setStep(step - 1)
  }

  if (!show) return null

  const s = steps[step]
  const isCenter = !s.target || s.position === 'center'

  const getTooltipStyle = () => {
    if (isCenter || !targetRect) {
      return { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10002 }
    }
    const gap = 16
    let top, left
    const vw = window.innerWidth
    const vh = window.innerHeight

    if (s.position === 'right') {
      top = targetRect ? targetRect.top + targetRect.height / 2 : vh / 2
      left = targetRect ? targetRect.right + gap : vw / 2
      if (left + 340 > vw) left = (targetRect ? targetRect.left : vw / 2) - gap - 340
    } else if (s.position === 'left') {
      top = targetRect ? targetRect.top + targetRect.height / 2 : vh / 2
      left = targetRect ? targetRect.left - gap - 340 : vw / 2
      if (left < gap) left = targetRect ? targetRect.right + gap : vw / 2
    } else if (s.position === 'bottom') {
      top = targetRect ? targetRect.bottom + gap : vh / 2
      left = targetRect ? targetRect.left + targetRect.width / 2 : vw / 2
      left = Math.min(Math.max(left - 170, gap), vw - 340 - gap)
      if (top + 200 > vh) top = (targetRect ? targetRect.top : vh / 2) - gap - 200
    } else {
      top = targetRect ? targetRect.top - gap - 180 : vh / 2
      left = targetRect ? targetRect.left + targetRect.width / 2 : vw / 2
      left = Math.min(Math.max(left - 170, gap), vw - 340 - gap)
      if (top < gap) top = (targetRect ? targetRect.bottom : vh / 2) + gap
    }

    return { position: 'fixed', top: `${top}px`, left: `${left}px`, zIndex: 10002, maxWidth: '340px', width: '340px' }
  }

  return createPortal(
    <>
      <div className="fixed inset-0 z-[10000]" style={{ background: 'rgba(0,0,0,0.65)' }} onClick={handleClose} />

      {targetRect && !isCenter && (
        <div
          className="fixed z-[10001] rounded-xl transition-all duration-300"
          style={{
            top: `${targetRect.top - 4}px`,
            left: `${targetRect.left - 4}px`,
            width: `${targetRect.width + 8}px`,
            height: `${targetRect.height + 8}px`,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.65)',
            pointerEvents: 'none',
          }}
        />
      )}

      <div ref={tooltipRef} style={getTooltipStyle()}
        className="rounded-2xl p-5 shadow-2xl" onClick={e => e.stopPropagation()}
        key={step}
      >
        <div className="rounded-2xl p-5 shadow-2xl animate-scale-in" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono" style={{ color: '#2563EB' }}>{step + 1} / {steps.length}</span>
            <button onClick={handleClose} className="p-1 rounded-lg transition-colors hover:scale-110" style={{ color: 'var(--color-muted)' }}>
              <X size={14} />
            </button>
          </div>

          <h3 className="text-base sm:text-lg font-display font-medium mb-2">{s.title}</h3>
          <p className="text-xs sm:text-sm leading-relaxed mb-4" style={{ color: 'var(--color-muted)' }}>{s.desc}</p>

          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {steps.map((_, i) => (
                <div key={i} className="h-1.5 rounded-full transition-all duration-300"
                  style={{ background: i === step ? '#2563EB' : 'var(--color-border)', width: i === step ? '20px' : '6px' }} />
              ))}
            </div>
            <div className="flex gap-2">
              {step > 0 && (
                <button onClick={handlePrev} className="px-3 py-2 text-xs rounded-lg transition-colors flex items-center gap-1 hover:scale-105"
                  style={{ color: 'var(--color-muted)', background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                  <ChevronLeft size={12} /> Retour
                </button>
              )}
              <button onClick={handleNext} className="px-4 py-2 text-xs font-medium rounded-lg transition-all duration-200 flex items-center gap-1 hover:scale-105"
                style={{ background: '#2563EB', color: '#FFF' }}>
                {step === steps.length - 1 ? 'Commencer' : 'Suivant'} <ChevronRight size={12} />
              </button>
            </div>
          </div>

          <button onClick={handleClose} className="w-full mt-3 text-[10px] text-center transition-colors py-1 hover:scale-105"
            style={{ color: 'var(--color-muted)' }}>
            Passer le tutoriel
          </button>
        </div>
      </div>
    </>,
    document.body
  )
}
