import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Mail, MessageCircle, CheckSquare, Calendar, Zap, ChevronRight, ChevronLeft } from 'lucide-react'
import { apiFetch } from '../../utils/api'

const steps = [
  {
    icon: <Zap size={28} className="text-accent" />,
    title: 'Bienvenue sur Personal Place !',
    desc: "Ton espace productivite personnel. Voici comment ca marche.",
    detail: "Personal Place centralise tes emails, messages, taches et calendrier en un seul endroit. Commence par connecter tes services."
  },
  {
    icon: <Mail size={28} className="text-accent" />,
    title: '1. Connecte Gmail',
    desc: 'Pour voir et gerer tes emails directement sur le dashboard.',
    detail: "Clique sur 'Connecter' dans Services connectes. Tu seras redirige vers Google pour autoriser l'acces. Si Google affiche un avertissement, clique sur 'Parametres avances' puis 'Aller sur Personal Place'."
  },
  {
    icon: <MessageCircle size={28} className="text-accent" />,
    title: '2. Connecte WhatsApp',
    desc: 'Pour voir tes messages WhatsApp comme sur WhatsApp Web.',
    detail: "Clique sur 'Connecter' puis scan le QR code avec ton telephone (WhatsApp → Menu ⋮ → Appareils connectes → Connecter un appareil)."
  },
  {
    icon: <Mail size={28} className="text-accent" />,
    title: '3. Emails & Filtre intelligent',
    desc: 'Tes emails sont automatiquement filtres par priorite.',
    detail: "La section Emails affiche tes messages avec des filtres : Important, Non important, Tous. Tu peux marquer des expediteurs comme importants et l'IA resume automatiquement les longs emails."
  },
  {
    icon: <CheckSquare size={28} className="text-accent" />,
    title: '4. Taches & To-Do',
    desc: 'Gere tes taches du jour et ta productivite.',
    detail: "Ajoute des taches, marque-les comme terminees, et garde un oeil sur ton focus du jour dans le tableau de bord."
  },
  {
    icon: <Calendar size={28} className="text-accent" />,
    title: '5. Calendrier',
    desc: 'Vois tes evenements du jour et de la semaine.',
    detail: "Le calendrier se sync automatiquement avec ton compte Google. Tu peux voir tes evenements et ajouter des rappels."
  },
]

export default function OnboardingTutorial() {
  const [show, setShow] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const seen = localStorage.getItem('personalplace_onboarding_seen')
    if (!seen) {
      setTimeout(() => setShow(true), 1000)
    }
  }, [])

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

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-md rounded-2xl p-6 shadow-2xl relative" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>
        <button onClick={handleClose} className="absolute top-3 right-3 p-1 rounded-lg hover:bg-muted/10 text-muted hover:text-text transition-colors">
          <X size={14} />
        </button>

        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: 'var(--color-accent/10)' }}>
            {s.icon}
          </div>
          <h3 className="text-sm font-display font-medium mb-1">{s.title}</h3>
          <p className="text-[11px] text-muted leading-relaxed">{s.desc}</p>
        </div>

        <div className="rounded-xl p-3 mb-5" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
          <p className="text-[11px] text-muted leading-relaxed">{s.detail}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === step ? 'bg-accent w-4' : 'bg-muted/30'}`} />
            ))}
          </div>
          <div className="flex gap-2">
            {step > 0 && (
              <button onClick={handlePrev} className="px-3 py-1.5 text-[11px] text-muted rounded-lg hover:text-text transition-colors" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                <ChevronLeft size={12} className="inline mr-1" />Retour
              </button>
            )}
            <button onClick={handleNext} className="px-3 py-1.5 bg-accent text-bg text-[11px] font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1">
              {step === steps.length - 1 ? 'Commencer' : 'Suivant'} <ChevronRight size={12} />
            </button>
          </div>
        </div>

        <button onClick={handleClose} className="w-full mt-3 text-[10px] text-muted hover:text-text text-center transition-colors">
          Passer le tutoriel
        </button>
      </div>
    </div>,
    document.body
  )
}
