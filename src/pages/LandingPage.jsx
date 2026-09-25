import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ArrowRight, Mail, MessageSquare, Calendar, CheckSquare, Timer, FileText, Check } from 'lucide-react'

const features = [
  { icon: Mail, title: 'Emails filtres', desc: 'Gmail connecte en un clic. Les emails importants remontent en haut, le reste attend.' },
  { icon: MessageSquare, title: 'WhatsApp integre', desc: 'Tes conversations directement dans l app, comme WhatsApp Web mais au meme endroit que tout le reste.' },
  { icon: Calendar, title: 'Calendrier', desc: 'Tes evenements de la semaine en un coup d oeil. Ajoute un evenement en un clic.' },
  { icon: CheckSquare, title: 'Taches', desc: 'Ajoute, complete, priorise. Le focus du jour te montre ce qui compte maintenant.' },
  { icon: Timer, title: 'Pomodoro', desc: 'Timer configurable avec presets. 25/5/15 pour le classique, 45/10/15 pour les longues sessions.' },
  { icon: FileText, title: 'Notes rapides', desc: 'Une idee, un truc a retenir. Note le sans quitter le dashboard.' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const go = () => navigate(isAuthenticated ? '/dashboard' : '/auth')

  return (
    <div className="min-h-screen bg-bg">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b" style={{ background: 'rgba(17,17,17,0.85)', backdropFilter: 'blur(16px)', borderColor: 'var(--color-border)' }}>
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Personal Place" className="w-7 h-7 rounded-lg" />
            <span className="font-display font-semibold tracking-tight text-sm">Personal Place</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted">
            <a href="#features" className="hover:text-text transition-colors">Fonctionnalites</a>
            <a href="#how" className="hover:text-text transition-colors">Comment ca marche</a>
            <a href="#pricing" className="hover:text-text transition-colors">Tarifs</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={go} className="text-xs font-medium text-muted hover:text-text hidden sm:block transition-colors">{isAuthenticated ? 'Dashboard' : 'Connexion'}</button>
            <button onClick={go} className="text-xs font-medium px-4 py-2 rounded-lg transition-colors" style={{ background: '#2563EB', color: '#FFF' }}>
              {isAuthenticated ? 'Mon espace' : 'Commencer'}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="pt-28 pb-16 md:pt-36 md:pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl">
            <p className="text-xs font-medium mb-4" style={{ color: '#2563EB' }}>Gratuit pour demarrer</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold tracking-tighter-custom mb-5 leading-[1.05]">
              Tes emails, messages,<br />taches et calendrier<br />
              <span style={{ color: '#2563EB' }}>au meme endroit.</span>
            </h1>
            <p className="text-muted text-base md:text-lg max-w-xl mb-8 leading-relaxed">
              Personal Place connecte Gmail et WhatsApp dans un seul dashboard. Filtrage intelligent, timer Pomodoro, focus du jour. Pas de bruit, juste l essentiel.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={go} className="w-full sm:w-auto text-sm font-medium px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2" style={{ background: '#2563EB', color: '#FFF' }}>
                {isAuthenticated ? 'Acceder au dashboard' : 'Creer mon espace gratuit'}
                <ArrowRight size={16} />
              </button>
              <button onClick={() => navigate(isAuthenticated ? '/dashboard' : '/auth')} className="w-full sm:w-auto text-sm font-medium px-6 py-3 rounded-lg transition-colors" style={{ border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
                {isAuthenticated ? 'Voir le dashboard' : 'Se connecter'}
              </button>
            </div>
            <p className="mt-6 text-xs" style={{ color: 'var(--color-muted)' }}>Pas de carte bancaire. Setup en 2 minutes.</p>
          </div>
        </div>
      </header>

      {/* Features */}
      <section id="features" className="py-16 px-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <h2 className="text-2xl md:text-3xl font-display font-semibold tracking-tight mb-3">Ce que ca fait</h2>
            <p className="text-muted max-w-xl">Six modules, un seul dashboard. Pas de surcharge, pas d options inutiles.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div key={i} className="p-5 rounded-xl transition-colors duration-150" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>
                <f.icon size={18} style={{ color: '#2563EB' }} className="mb-3" />
                <h3 className="text-sm font-display font-medium mb-1.5">{f.title}</h3>
                <p className="text-[13px] leading-relaxed" style={{ color: 'var(--color-muted)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-16 px-6 border-t" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-solid)' }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-display font-semibold tracking-tight mb-10">Comment ca marche</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <span className="text-3xl font-display font-semibold mb-3 block" style={{ color: 'var(--color-border)' }}>01</span>
              <h4 className="text-sm font-display font-medium mb-2">Connecte Gmail</h4>
              <p className="text-[13px] leading-relaxed" style={{ color: 'var(--color-muted)' }}>Autorise l acces a tes emails. Le filtre les trie automatiquement par priorite.</p>
            </div>
            <div>
              <span className="text-3xl font-display font-semibold mb-3 block" style={{ color: 'var(--color-border)' }}>02</span>
              <h4 className="text-sm font-display font-medium mb-2">Scanne le QR WhatsApp</h4>
              <p className="text-[13px] leading-relaxed" style={{ color: 'var(--color-muted)' }}>Comme WhatsApp Web. Tes conversations apparaissent dans le dashboard.</p>
            </div>
            <div>
              <span className="text-3xl font-display font-semibold mb-3 block" style={{ color: 'var(--color-border)' }}>03</span>
              <h4 className="text-sm font-display font-medium mb-2">Travaille au calme</h4>
              <p className="text-[13px] leading-relaxed" style={{ color: 'var(--color-muted)' }}>Focus du jour, taches, calendrier, Pomodoro. Tout au meme endroit.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 px-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <h2 className="text-2xl md:text-3xl font-display font-semibold tracking-tight mb-3">Deux formules</h2>
            <p className="text-muted">Commence gratuitement, passe en Pro quand tu as besoin de plus d espace.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 rounded-xl" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: 'rgba(37,99,235,0.1)', color: '#2563EB' }}>Gratuit</span>
              <div className="mt-3 mb-5">
                <span className="text-4xl font-display font-semibold tracking-tight">0 FCFA</span>
                <span className="text-sm ml-1" style={{ color: 'var(--color-muted)' }}>/ pour toujours</span>
              </div>
              <div className="space-y-2.5">
                {[
                  '1 equipe, 3 membres max',
                  '1 compte Gmail connecte',
                  'Statistiques sur 7 jours',
                  'Calendrier, taches, Pomodoro, notes',
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-[13px]" style={{ color: 'var(--color-muted)' }}>
                    <Check size={14} style={{ color: '#10B981' }} className="shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              <button onClick={go} className="w-full mt-6 text-sm font-medium px-5 py-2.5 rounded-lg transition-colors" style={{ border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
                Commencer
              </button>
            </div>

            <div className="p-6 rounded-xl" style={{ background: 'var(--color-surface-solid)', border: '1px solid rgba(37,99,235,0.45)' }}>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: '#2563EB', color: '#FFF' }}>Pro</span>
              <div className="mt-3 mb-5">
                <span className="text-4xl font-display font-semibold tracking-tight">2000 FCFA</span>
                <span className="text-sm ml-1" style={{ color: 'var(--color-muted)' }}>/ 1er mois</span>
                <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>puis 2500 FCFA / mois</p>
              </div>
              <div className="space-y-2.5">
                {[
                  'Jusqu a 20 equipes',
                  'Jusqu a 50 membres par equipe',
                  'Statistiques sur 365 jours',
                  'Toutes les fonctions de la formule gratuite',
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-[13px]" style={{ color: 'var(--color-muted)' }}>
                    <Check size={14} style={{ color: '#10B981' }} className="shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              <button onClick={go} className="w-full mt-6 text-sm font-medium px-5 py-2.5 rounded-lg transition-colors" style={{ background: '#2563EB', color: '#FFF' }}>
                Passer en Pro
              </button>
            </div>
          </div>
          <p className="mt-6 text-xs text-center" style={{ color: 'var(--color-muted)' }}>
            Paiement securise. Tu peux upgrader depuis Settings a tout moment.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-10 px-6" style={{ borderColor: 'var(--color-border)' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Personal Place" className="w-5 h-5 rounded" />
            <span className="text-xs" style={{ color: 'var(--color-muted)' }}>Personal Place</span>
          </div>
          <div className="flex gap-5 text-xs" style={{ color: 'var(--color-muted)' }}>
            <a href="/confidentialite" className="hover:text-text transition-colors">Confidentialite</a>
            <a href="/conditions" className="hover:text-text transition-colors">Conditions</a>
            <a href="/contact" className="hover:text-text transition-colors">Contact</a>
          </div>
          <div className="text-xs" style={{ color: 'var(--color-muted)', opacity: 0.5 }}>&copy; 2026 Personal Place</div>
        </div>
      </footer>
    </div>
  )
}
