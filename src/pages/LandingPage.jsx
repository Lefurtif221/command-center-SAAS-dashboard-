import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Sparkles, ArrowRight, ShieldCheck, LayoutDashboard, Play, Mail, MessageSquare, Calendar, CheckSquare, TrendingUp, LayoutGrid, Settings, Check, FileText, CheckCircle } from 'lucide-react'

const features = [
  { icon: Mail, title: 'Emails intelligents', desc: 'Filtre automatique des emails importants. Zéro distraction, tout le signal.' },
  { icon: FileText, title: 'Notes & Documents', desc: 'Sync avec Notion, Google Docs, Evernote. Vos idées toujours accessibles.' },
  { icon: MessageSquare, title: 'Messages unifiés', desc: 'WhatsApp, Slack, Discord - tous vos messages au même endroit.' },
  { icon: Calendar, title: 'Calendrier sync', desc: 'Google Calendar, Outlook - vue unifiée de vos événements.' },
  { icon: CheckSquare, title: 'Tâches & Projets', desc: "Trello, Asana, Todoist - suivez tout sans changer d'outil." },
  { icon: TrendingUp, title: 'Investissements', desc: 'Suivez votre portfolio, actions, crypto et métaux en temps réel.' }
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
    <div className="min-h-screen bg-bg noise">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 glass-strong border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Personal Place" className="w-7 h-7 rounded-lg" />
            <span className="font-display font-semibold tracking-tight text-sm">Personal Place</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted">
            <a href="#features" className="hover:text-text transition-colors">Fonctionnalités</a>
            <a href="#pricing" className="hover:text-text transition-colors">Tarifs</a>
            <a href="#about" className="hover:text-text transition-colors">À propos</a>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={go} className="text-xs font-medium text-muted hover:text-text hidden sm:block transition-colors">{isAuthenticated ? 'Dashboard' : 'Connexion'}</button>
            <button onClick={go} className="glass rounded-xl text-xs font-medium px-4 py-2.5 transition-all duration-200 flex items-center gap-2 group hover:bg-accent/10 hover:text-accent hover:shadow-[0_0_20px_-5px_rgba(37,99,235,0.3)]">
              <span>{isAuthenticated ? 'Mon Espace' : 'Commencer gratuitement'}</span>
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative pt-32 pb-20 md:pt-40 md:pb-32 px-6 hero-glow overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-accent text-xs font-medium mb-6">
            <ShieldCheck size={12} />
            Privé & Sécurisé
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-semibold tracking-tighter-custom mb-6 leading-[1.05]">
            Votre productivité,<br />
            <span className="gradient-text">unifiée et intelligente.</span>
          </h1>
          <p className="text-muted text-lg md:text-xl font-light max-w-2xl mx-auto mb-10 leading-relaxed">
            Connectez tous vos outils - emails, notes, tâches, messages, investissements - dans un seul tableau de bord intelligent.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={go} className="w-full sm:w-auto bg-accent text-bg hover:bg-[#2563EB] font-semibold text-sm px-6 py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_30px_-5px_rgba(37,99,235,0.4)] hover:shadow-[0_0_40px_-5px_rgba(37,99,235,0.5)]">
               <LayoutDashboard size={18} />
              {isAuthenticated ? 'Accéder au Dashboard' : 'Créer mon espace gratuit'}
            </button>
            <button className="w-full sm:w-auto glass rounded-xl text-text font-medium text-sm px-6 py-3 transition-all duration-200 flex items-center justify-center gap-2 hover:bg-accent/5 hover:border-accent/30">
               <Play size={18} />
              Voir la démo
            </button>
          </div>
          <p className="mt-8 text-xs text-muted/60">Pas de carte de crédit requise • Configuration en 2 minutes</p>
        </div>
      </header>

      {/* Dashboard Preview */}
      <section className="px-4 md:px-6 pb-24 -mt-10">
        <div className="max-w-6xl mx-auto glass-strong noise rounded-2xl overflow-hidden relative group shadow-2xl">
          <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl"></div>
          <div className="h-8 glass border-b border-border/50 flex items-center px-3 gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-accentSec/60"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-warning/60"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-success/60"></div>
          </div>
          <div className="flex h-[500px] md:h-[600px]">
            <div className="w-16 md:w-56 glass border-r border-border/50 flex flex-col justify-between py-6">
              <div className="px-4 flex flex-col gap-6">
                <div className="flex items-center gap-3 px-2 text-accent">
                   <LayoutGrid size={20} />
                  <span className="hidden md:block font-display font-medium text-sm">Dashboard</span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="text-[10px] font-medium text-muted/50 px-2 mb-2 hidden md:block uppercase tracking-wider font-mono">MODULES</div>
                  <a href="#" className="flex items-center gap-3 px-2 py-2 text-muted hover:text-text hover:bg-white/5 rounded-xl transition-colors">
                     <Mail size={18} />
                    <span className="hidden md:block text-sm">Emails</span>
                  </a>
                  <a href="#" className="flex items-center gap-3 px-2 py-2 text-muted hover:text-text hover:bg-white/5 rounded-xl transition-colors">
                     <MessageSquare size={18} />
                    <span className="hidden md:block text-sm">Messages</span>
                  </a>
                  <a href="#" className="flex items-center gap-3 px-2 py-2 text-muted hover:text-text hover:bg-white/5 rounded-xl transition-colors">
                     <Calendar size={18} />
                    <span className="hidden md:block text-sm">Calendrier</span>
                  </a>
                  <a href="#" className="flex items-center gap-3 px-2 py-2 text-accent hover:bg-accent/5 rounded-xl transition-colors">
                     <TrendingUp size={18} />
                    <span className="hidden md:block text-sm">Investissements</span>
                  </a>
                </div>
              </div>
              <div className="px-4">
                <div className="flex items-center gap-3 px-2 py-2 text-muted hover:text-text cursor-pointer rounded-xl transition-colors">
                   <Settings size={18} />
                  <span className="hidden md:block text-sm">Settings</span>
                </div>
              </div>
            </div>
            <div className="flex-1 bg-bg/50 p-6 overflow-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="glass rounded-xl p-4 gradient-border">
                  <div className="text-xs text-muted mb-1">Emails importants</div>
                  <div className="text-xl font-display font-semibold tracking-tight font-mono">12</div>
                  <div className="text-xs text-success flex items-center gap-1 mt-1">
                                         <TrendingUp size={12} /> +3
                  </div>
                </div>
                <div className="glass rounded-xl p-4 gradient-border">
                  <div className="text-xs text-muted mb-1">Tâches à faire</div>
                  <div className="text-xl font-display font-semibold tracking-tight font-mono">8</div>
                  <div className="text-xs text-accentSec mt-1">-2</div>
                </div>
                <div className="glass rounded-xl p-4 gradient-border">
                  <div className="text-xs text-muted mb-1">Événements</div>
                  <div className="text-xl font-display font-semibold tracking-tight font-mono">4</div>
                  <div className="text-xs text-muted mt-1">Aujourd'hui</div>
                </div>
                <div className="glass rounded-xl p-4 gradient-border">
                  <div className="text-xs text-muted mb-1">Portfolio</div>
                  <div className="text-xl font-display font-semibold tracking-tight font-mono text-success">+12.4%</div>
                  <div className="text-xs text-muted mt-1">Ce mois</div>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass rounded-xl p-5 gradient-border">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-display font-medium">Activité récente</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 glass rounded-xl">
                       <Mail size={16} className="text-accent" />
                      <div className="flex-1">
                        <p className="text-sm">Réunion client demain</p>
                        <p className="text-xs text-muted">Sophie Martin • Il y a 2h</p>
                      </div>
                      <span className="text-xs text-accentSec bg-accentSec/10 px-2 py-0.5 rounded-full font-mono">Urgent</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 glass rounded-xl">
                       <CheckCircle size={16} className="text-success" />
                      <div className="flex-1">
                        <p className="text-sm">Tâche complétée</p>
                        <p className="text-xs text-muted">Rapport hebdomadaire • Hier</p>
                      </div>
                      <span className="text-xs text-success bg-success/10 px-2 py-0.5 rounded-full font-mono">Fait</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 glass rounded-xl">
                       <TrendingUp size={16} className="text-warning" />
                      <div className="flex-1">
                        <p className="text-sm">Investissement: +5.2%</p>
                        <p className="text-xs text-muted">Portfolio Tech • Aujourd'hui</p>
                      </div>
                      <span className="text-xs text-success bg-success/10 px-2 py-0.5 rounded-full font-mono">+5.2%</span>
                    </div>
                  </div>
                </div>
                <div className="glass rounded-xl p-5 gradient-border">
                  <h3 className="text-sm font-display font-medium mb-4">Focus du jour</h3>
                  <div className="space-y-3">
                    <div className="p-3 glass rounded-xl border-l-2 border-accentSec">
                      <p className="text-xs text-muted mb-1">Haute priorité</p>
                      <p className="text-sm">Réunion client - Approbation</p>
                      <p className="text-xs text-muted mt-2 font-mono">14:00 - 15:30</p>
                    </div>
                    <div className="p-3 glass rounded-xl border-l-2 border-warning">
                      <p className="text-xs text-muted mb-1">Moyenne priorité</p>
                      <p className="text-sm">Envoyer le rapport</p>
                      <p className="text-xs text-muted mt-2 font-mono">Avant 17:00</p>
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
          <h2 className="text-3xl md:text-4xl font-display font-semibold tracking-tight mb-4">Tout ce dont vous avez besoin</h2>
          <p className="text-muted max-w-2xl text-lg">Un seul endroit pour gérer votre vie numérique. Emails, messages, tâches, investissements.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="glass rounded-2xl p-6 transition-all duration-300 card-glow gradient-border group">
              <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center mb-4 text-accent group-hover:bg-accent/15 transition-colors">
                 <f.icon size={20} />
              </div>
              <h3 className="text-lg font-display font-medium mb-2">{f.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="border-y border-border/50 bg-surface/30">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
            <div className="relative">
              <div className="text-5xl font-display font-bold text-border absolute -top-8 -left-4 md:-left-6 opacity-30">01</div>
              <h4 className="text-lg font-display font-medium mb-3 relative z-10">Connectez vos outils</h4>
              <p className="text-sm text-muted leading-relaxed">Gmail, Notion, WhatsApp, Slack - connectez en quelques clics.</p>
            </div>
            <div className="relative">
              <div className="text-5xl font-display font-bold text-border absolute -top-8 -left-4 md:-left-6 opacity-30">02</div>
              <h4 className="text-lg font-display font-medium mb-3 relative z-10">Laissez l'IA trier</h4>
              <p className="text-sm text-muted leading-relaxed">Filtre automatique des emails urgents et importants.</p>
            </div>
            <div className="relative">
              <div className="text-5xl font-display font-bold text-border absolute -top-8 -left-4 md:-left-6 opacity-30">03</div>
              <h4 className="text-lg font-display font-medium mb-3 relative z-10">Gérez votre vie</h4>
              <p className="text-sm text-muted leading-relaxed">Tout centralisé: emails, tâches, calendrier, investissements.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 max-w-5xl mx-auto">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-semibold tracking-tight mb-4">Simple et transparent</h2>
          <p className="text-muted text-lg">Commencez gratuitement, évoluez quand vous êtes prêt</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pricingPlans.map((plan, i) => (
            <div key={i} className={`glass rounded-2xl p-6 transition-all duration-300 ${plan.featured ? 'ring-1 ring-accent/30 shadow-[0_0_40px_-10px_rgba(37,99,235,0.15)]' : ''}`}>
              {plan.featured && <div className="text-xs text-accent bg-accent/10 px-2.5 py-1 rounded-full inline-block mb-4 font-mono">Populaire</div>}
              <h3 className="text-lg font-display font-medium mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-display font-semibold tracking-tight">{plan.price}</span>
                <span className="text-sm text-muted">/{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2.5 text-sm text-muted">
                                         <Check size={14} className="text-success" />{f}
                  </li>
                ))}
              </ul>
              <button onClick={go} className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${plan.featured ? 'bg-accent text-bg hover:bg-[#2563EB] shadow-[0_0_20px_-5px_rgba(37,99,235,0.3)]' : 'glass hover:bg-accent/5 hover:border-accent/30'}`}>{plan.cta}</button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-bg py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Personal Place" className="w-6 h-6 rounded-md" />
            <span className="text-sm font-display font-medium text-muted">Personal Place</span>
          </div>
          <div className="flex gap-6 text-xs text-muted">
            <a href="#" className="hover:text-text transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-text transition-colors">Conditions</a>
            <a href="#" className="hover:text-text transition-colors">Contact</a>
          </div>
          <div className="text-xs text-muted/50 font-mono">© 2024 Personal Place</div>
        </div>
      </footer>
    </div>
  )
}
