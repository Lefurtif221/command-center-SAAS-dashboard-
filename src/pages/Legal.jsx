import { useNavigate, useLocation, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

const pages = {
  confidentialite: {
    title: 'Confidentialite',
    updated: '25 septembre 2026',
    sections: [
      { h: 'Donnees collectees', p: 'Personal Place collecte uniquement ce qui est necessaire au fonctionnement du service : votre adresse email, votre nom, vos mots de passe (chiffres), ainsi que les donnees des services que vous connectez volontairement (Gmail, WhatsApp).' },
      { h: 'Utilisation des donnees', p: 'Vos donnees servent exclusivement a afficher vos propres informations dans votre espace prive. Elles ne sont ni vendues, ni partagees avec des tiers a des fins publicitaires.' },
      { h: 'Services tiers', p: 'La connexion a Gmail passe par OAuth2 Google : nous n accedons qu aux permissions que vous autorisez, et vous pouvez les retirer a tout moment depuis votre compte Google. La connexion WhatsApp utilise un protocole similaire a WhatsApp Web ; vos messages ne sont pas stockes sur nos serveurs au-dela de ce qui est necessaire a l affichage.' },
      { h: 'Conservation', p: 'Les donnees sont conservees tant que votre compte est actif. Vous pouvez demander leur suppression a tout moment via la page Contact.' },
      { h: 'Securite', p: 'Transit chiffre (HTTPS), authentification par jeton JWT, mots de passe haches. Aucun mot de passe n est stocke en clair.' },
    ],
  },
  conditions: {
    title: 'Conditions d utilisation',
    updated: '25 septembre 2026',
    sections: [
      { h: 'Objet', p: 'Personal Place est un outil personnel de productivite. En creant un compte, vous acceptez les presentes conditions.' },
      { h: 'Compte', p: 'Vous etes responsable de la confidentialite de vos identifiants et de toute activite effectuee depuis votre compte.' },
      { h: 'Usage acceptable', p: 'Le service ne peut etre utilise a des illicites ni pour porter atteinte aux droits de tiers. Les integrations WhatsApp et Gmail sont soumises aux conditions d utilisation de leurs services respectifs.' },
      { h: 'Disponibilite', p: 'Le service est fourni en l etat. Une interruption ponctuelle peut survenir, notamment pendant la phase beta.' },
      { h: 'Responsabilite', p: 'Personal Place est un outil d organisation : la responsabilite des decisions prises en fonction des informations affichees incombe a l utilisateur.' },
    ],
  },
  contact: {
    title: 'Contact',
    updated: '25 septembre 2026',
    sections: [
      { h: 'Une question ou un probleme ?', p: 'Une question, un bug, une demande de suppression de donnees ? Ecrivez-nous et nous vous repondrons dans les plus brefs delais.' },
      { h: 'Support', p: 'Support technique, signalement d un bug, probleme de connexion a Gmail ou WhatsApp.' },
      { h: 'Confidentialite', p: 'Pour toute demande de consultation ou de suppression de vos donnees, precisez l objet "Donnees personnelles" et l adresse email de votre compte.' },
      { h: 'Reponse', p: 'Nous repondons generalement sous 48 heures ouvrables.' },
    ],
  },
}

export default function Legal() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const page = pathname.replace('/', '')
  const content = pages[page] || pages.confidentialite

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <nav className="border-b sticky top-0 z-50" style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Personal Place" className="w-6 h-6 rounded-md" />
            <span className="font-display font-semibold tracking-tight text-sm">Personal Place</span>
          </div>
          <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--color-muted)' }}>
            <Link to="/confidentialite" className="hover:text-text transition-colors">Confidentialite</Link>
            <Link to="/conditions" className="hover:text-text transition-colors">Conditions</Link>
            <Link to="/contact" className="hover:text-text transition-colors">Contact</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm mb-8 transition-colors" style={{ color: 'var(--color-muted)' }}>
          <ArrowLeft size={16} /><span>Retour</span>
        </button>
        <h1 className="text-3xl font-display font-semibold tracking-tighter-custom mb-2">{content.title}</h1>
        <p className="text-xs mb-10" style={{ color: 'var(--color-muted)' }}>Derniere mise a jour : {content.updated}</p>

        <div className="space-y-8">
          {content.sections.map((s, i) => (
            <section key={i}>
              <h2 className="text-base font-display font-medium mb-2">{s.h}</h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>{s.p}</p>
            </section>
          ))}
        </div>

        {page === 'contact' && (
          <div className="mt-10 p-5 rounded-xl" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>
            <p className="text-sm mb-1 font-medium">E-mail</p>
            <a href="mailto:touremouhamadou753@gmail.com" className="text-sm" style={{ color: '#2563EB' }}>touremouhamadou753@gmail.com</a>
          </div>
        )}
      </main>

      <footer className="border-t py-6 px-6" style={{ borderColor: 'var(--color-border)' }}>
        <div className="max-w-3xl mx-auto text-xs" style={{ color: 'var(--color-muted)', opacity: 0.6 }}>&copy; 2026 Personal Place</div>
      </footer>
    </div>
  )
}
