import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const features = [
  { icon: 'lucide:mail', title: 'Emails intelligents', desc: 'Filtre automatique des emails importants. Zéro distraction, tout le signal.' },
  { icon: 'lucide:file-text', title: 'Notes & Documents', desc: 'Sync avec Notion, Google Docs, Evernote. Vos idées toujours accessibles.' },
  { icon: 'lucide:message-square', title: 'Messages unifiés', desc: 'WhatsApp, Slack, Discord - tous vos messages au même endroit.' },
  { icon: 'lucide:calendar', title: 'Calendrier sync', desc: 'Google Calendar, Outlook - vue unifiée de vos événements.' },
  { icon: 'lucide:check-square', title: 'Tâches & Projets', desc: "Trello, Asana, Todoist - suivez tout sans changer d'outil." },
  { icon: 'lucide:trending-up', title: 'Investissements', desc: 'Suivez votre portfolio, actions, crypto et métaux en temps réel.' }
]

const pricingPlans = [
  { name: 'Gratuit', price: '0€', period: 'pour toujours', features: ['3 services connectés', 'Filtrage email de base', '1 tableau de bord', 'Support communautaire'], cta: 'Commencer', featured: false },
  { name: 'Pro', price: '9€', period: 'par mois', features: ['Services illimités', 'Filtrage IA avancé', 'Tableaux de bord multiples', 'Support prioritaire', 'API accès'], cta: 'Essayer 14 jours', featured: true },
  { name: 'Équipe', price: '29€', period: 'par mois', features: ['Tout dans Pro', '5 membres d\'équipe', 'Espaces partagés', 'Admin & permissions', 'Support dédié'], cta: 'Contacter', featured: false }
]

export default function LandingPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const go = () => navigate(isAuthenticated ? '/dashboard' : '/auth')

  return (
    <div className="min-h-screen bg-bg">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-border bg-bg/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="iconify text-accent" data-icon="lucide:zap" data-width="20" data-stroke-width="1.5"></span>
            <span className="font-medium tracking-tight text-sm">Personal Place</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted">
            <a href="#features" className="hover:text-text transition-colors">Fonctionnalités</a>
            <a href="#pricing" className="hover:text-text transition-colors">Tarifs</a>
            <a href="#about" className="hover:text-text transition-colors">À propos</a>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={go} className="text-xs font-medium text-muted hover:text-text hidden sm:block">{isAuthenticated ? 'Dashboard' : 'Connexion'}</button>
            <button onClick={go} className="bg-surface border border-border hover:border-accent/50 text-text text-xs font-medium px-4 py-2 rounded-lg transition-all flex items-center gap-2 group">
              <span>{isAuthenticated ? 'Mon Espace' : 'Commencer gratuitement'}</span>
              <span className="iconify group-hover:translate-x-0.5 transition-transform" data-icon="lucide:arrow-right" data-width="14"></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative pt-32 pb-20 md:pt-40 md:pb-32 px-6 hero-glow overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/5 border border-accent/20 text-accent text-xs font-medium mb-6">
            <span className="iconify" data-icon="lucide:shield-check" data-width="12"></span>
            Privé & Sécurisé
          </div>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tighter-custom mb-6 leading-[1.1]">
            Votre productivité,<br />
            <span className="text-muted">unifiée et intelligente.</span>
          </h1>
          <p className="text-muted text-lg md:text-xl font-light max-w-2xl mx-auto mb-10 leading-relaxed">
            Connectez tous vos outils - emails, notes, tâches, messages, investissements - dans un seul tableau de bord intelligent.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={go} className="w-full sm:w-auto bg-accent text-bg hover:bg-[#33c2ff] font-semibold text-sm px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
              <span className="iconify" data-icon="lucide:layout-dashboard" data-width="18"></span>
              {isAuthenticated ? 'Accéder au Dashboard' : 'Créer mon espace gratuit'}
            </button>
            <button className="w-full sm:w-auto bg-surface border border-border text-text hover:border-muted font-medium text-sm px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
              <span className="iconify" data-icon="lucide:play" data-width="18"></span>
              Voir la démo
            </button>
          </div>
          <p className="mt-8 text-xs text-muted/60">Pas de carte de crédit requise • Configuration en 2 minutes</p>
        </div>
      </header>

      {/* Dashboard Preview */}
      <section className="px-4 md:px-6 pb-24 -mt-10">
        <div className="max-w-6xl mx-auto bg-bg border border-border rounded-xl shadow-2xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          <div className="h-8 bg-surface border-b border-border flex items-center px-3 gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-accentSec/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-warning/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-success/50"></div>
          </div>
          <div className="flex h-[500px] md:h-[600px]">
            <div className="w-16 md:w-56 bg-surface border-r border-border flex flex-col justify-between py-6">
              <div className="px-4 flex flex-col gap-6">
                <div className="flex items-center gap-3 px-2 text-accent">
                  <span className="iconify" data-icon="lucide:layout-grid" data-width="20"></span>
                  <span className="hidden md:block font-medium text-sm">Dashboard</span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="text-[10px] font-medium text-muted/50 px-2 mb-2 hidden md:block uppercase tracking-wider">MODULES</div>
                  <a href="#" className="flex items-center gap-3 px-2 py-2 text-muted hover:text-text hover:bg-white/5 rounded-md transition-colors">
                    <span className="iconify" data-icon="lucide:mail" data-width="18"></span>
                    <span className="hidden md:block text-sm">Emails</span>
                  </a>
                  <a href="#" className="flex items-center gap-3 px-2 py-2 text-muted hover:text-text hover:bg-white/5 rounded-md transition-colors">
                    <span className="iconify" data-icon="lucide:message-square" data-width="18"></span>
                    <span className="hidden md:block text-sm">Messages</span>
                  </a>
                  <a href="#" className="flex items-center gap-3 px-2 py-2 text-muted hover:text-text hover:bg-white/5 rounded-md transition-colors">
                    <span className="iconify" data-icon="lucide:calendar" data-width="18"></span>
                    <span className="hidden md:block text-sm">Calendrier</span>
                  </a>
                  <a href="#" className="flex items-center gap-3 px-2 py-2 text-accent hover:bg-white/5 rounded-md transition-colors">
                    <span className="iconify" data-icon="lucide:trending-up" data-width="18"></span>
                    <span className="hidden md:block text-sm">Investissements</span>
                  </a>
                </div>
              </div>
              <div className="px-4">
                <div className="flex items-center gap-3 px-2 py-2 text-muted hover:text-text cursor-pointer">
                  <span className="iconify" data-icon="lucide:settings" data-width="18"></span>
                  <span className="hidden md:block text-sm">Settings</span>
                </div>
              </div>
            </div>
            <div className="flex-1 bg-bg p-6 overflow-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-surface border border-border p-4 rounded-lg">
                  <div className="text-xs text-muted mb-1">Emails importants</div>
                  <div className="text-xl font-semibold tracking-tight">12</div>
                  <div className="text-xs text-success flex items-center gap-1 mt-1">
                    <span className="iconify" data-icon="lucide:trending-up" data-width="12"></span> +3
                  </div>
                </div>
                <div className="bg-surface border border-border p-4 rounded-lg">
                  <div className="text-xs text-muted mb-1">Tâches à faire</div>
                  <div className="text-xl font-semibold tracking-tight">8</div>
                  <div className="text-xs text-accentSec mt-1">-2</div>
                </div>
                <div className="bg-surface border border-border p-4 rounded-lg">
                  <div className="text-xs text-muted mb-1">Événements</div>
                  <div className="text-xl font-semibold tracking-tight">4</div>
                  <div className="text-xs text-muted mt-1">Aujourd'hui</div>
                </div>
                <div className="bg-surface border border-border p-4 rounded-lg">
                  <div className="text-xs text-muted mb-1">Portfolio</div>
                  <div className="text-xl font-semibold tracking-tight text-success">+12.4%</div>
                  <div className="text-xs text-muted mt-1">Ce mois</div>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-surface border border-border rounded-lg p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-medium">Activité récente</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-bg rounded-lg border border-border">
                      <span className="iconify text-accent" data-icon="lucide:mail" data-width="16"></span>
                      <div className="flex-1">
                        <p className="text-sm">Réunion client demain</p>
                        <p className="text-xs text-muted">Sophie Martin • Il y a 2h</p>
                      </div>
                      <span className="text-xs text-accentSec bg-accentSec/10 px-2 py-0.5 rounded-full">Urgent</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-bg rounded-lg border border-border">
                      <span className="iconify text-success" data-icon="lucide:check-circle" data-width="16"></span>
                      <div className="flex-1">
                        <p className="text-sm">Tâche complétée</p>
                        <p className="text-xs text-muted">Rapport hebdomadaire • Hier</p>
                      </div>
                      <span className="text-xs text-success bg-success/10 px-2 py-0.5 rounded-full">Fait</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-bg rounded-lg border border-border">
                      <span className="iconify text-warning" data-icon="lucide:trending-up" data-width="16"></span>
                      <div className="flex-1">
                        <p className="text-sm">Investissement: +5.2%</p>
                        <p className="text-xs text-muted">Portfolio Tech • Aujourd'hui</p>
                      </div>
                      <span className="text-xs text-success bg-success/10 px-2 py-0.5 rounded-full">+5.2%</span>
                    </div>
                  </div>
                </div>
                <div className="bg-surface border border-border rounded-lg p-5">
                  <h3 className="text-sm font-medium mb-4">Focus du jour</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-bg rounded-lg border-l-2 border-accentSec">
                      <p className="text-xs text-muted mb-1">Haute priorité</p>
                      <p className="text-sm">Réunion client - Approbation</p>
                      <p className="text-xs text-muted mt-2">14:00 - 15:30</p>
                    </div>
                    <div className="p-3 bg-bg rounded-lg border-l-2 border-warning">
                      <p className="text-xs text-muted mb-1">Moyenne priorité</p>
                      <p className="text-sm">Envoyer le rapport</p>
                      <p className="text-xs text-muted mt-2">Avant 17:00</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="mb-12">
          <h2 className="text-3xl font-semibold tracking-tight mb-4">Tout ce dont vous avez besoin</h2>
          <p className="text-muted max-w-2xl">Un seul endroit pour gérer votre vie numérique. Emails, messages, tâches, investissements.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="bg-surface border border-border p-6 rounded-xl hover:border-accent/30 transition-all duration-300 card-hover">
              <div className="w-10 h-10 rounded-lg bg-bg border border-border flex items-center justify-center mb-4 text-accent">
                <span className="iconify" data-icon={f.icon} data-width="20"></span>
              </div>
              <h3 className="text-lg font-medium mb-2">{f.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="border-y border-border bg-surface/30">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
            <div className="relative">
              <div className="text-4xl font-bold text-border absolute -top-8 -left-4 md:-left-6 opacity-40">01</div>
              <h4 className="text-lg font-medium mb-3 relative z-10">Connectez vos outils</h4>
              <p className="text-sm text-muted">Gmail, Notion, WhatsApp, Slack - connectez en quelques clics.</p>
            </div>
            <div className="relative">
              <div className="text-4xl font-bold text-border absolute -top-8 -left-4 md:-left-6 opacity-40">02</div>
              <h4 className="text-lg font-medium mb-3 relative z-10">Laissez l'IA trier</h4>
              <p className="text-sm text-muted">Filtre automatique des emails urgents et importants.</p>
            </div>
            <div className="relative">
              <div className="text-4xl font-bold text-border absolute -top-8 -left-4 md:-left-6 opacity-40">03</div>
              <h4 className="text-lg font-medium mb-3 relative z-10">Gérez votre vie</h4>
              <p className="text-sm text-muted">Tout centralisé: emails, tâches, calendrier, investissements.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 max-w-5xl mx-auto">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-semibold tracking-tight mb-4">Simple et transparent</h2>
          <p className="text-muted">Commencez gratuitement, évoluez quand vous êtes prêt</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pricingPlans.map((plan, i) => (
            <div key={i} className={`bg-surface border rounded-xl p-6 ${plan.featured ? 'border-accent shadow-[0_0_30px_-10px_rgba(0,209,255,0.2)]' : 'border-border'}`}>
              {plan.featured && <div className="text-xs text-accent bg-accent/10 px-2 py-0.5 rounded-full inline-block mb-4">Populaire</div>}
              <h3 className="text-lg font-medium mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-semibold tracking-tight">{plan.price}</span>
                <span className="text-sm text-muted">/{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-muted">
                    <span className="iconify text-success" data-icon="lucide:check" data-width="14"></span>{f}
                  </li>
                ))}
              </ul>
              <button onClick={go} className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${plan.featured ? 'bg-accent text-bg hover:bg-[#33c2ff]' : 'bg-bg border border-border text-text hover:border-accent/50'}`}>{plan.cta}</button>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto bg-bg border border-accent/20 rounded-2xl p-8 text-center shadow-[0_0_40px_-10px_rgba(0,209,255,0.1)]">
          <div className="inline-block p-3 rounded-full bg-surface mb-4">
            <span className="iconify text-accent" data-icon="lucide:fingerprint" data-width="24"></span>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight mb-3">Privé par défaut</h2>
          <p className="text-muted mb-8 leading-relaxed">Vos données vous appartiennent. Stockage local ou chiffré. Pas d'abonnement, pas de vente de données.</p>
          <a href="#" className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80 transition-colors">
            En savoir plus sur la sécurité <span className="iconify" data-icon="lucide:arrow-right" data-width="14"></span>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-bg py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="iconify text-muted" data-icon="lucide:zap" data-width="18"></span>
            <span className="text-sm font-medium text-muted">Personal Place</span>
          </div>
          <div className="flex gap-6 text-xs text-muted">
            <a href="#" className="hover:text-text transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-text transition-colors">Conditions</a>
            <a href="#" className="hover:text-text transition-colors">Contact</a>
          </div>
          <div className="text-xs text-muted/50">© 2024 Personal Place. Tous droits réservés.</div>
        </div>
      </footer>
    </div>
  )
}