export const INSTALL_STEPS = {
  ios: {
    label: 'iPhone / iPad',
    how: 'Safari',
    steps: [
      'Ouvre Personal Place dans Safari (pas Chrome)',
      'Tape le bouton Partager ▲ en bas de l’écran',
      'Choisis « Sur l’écran d’accueil »',
      'Tape « Ajouter » — l’icône apparaît',
    ],
  },
  android: {
    label: 'Android',
    how: 'Chrome',
    steps: [
      'Ouvre Personal Place dans Chrome',
      'Tape le menu ⋮ en haut à droite',
      'Choisis « Installer l’app » (ou « Ajouter à l’écran d’accueil »)',
      'Confirme « Installer » — c’est fait',
    ],
  },
  desktop: {
    label: 'Ordinateur',
    how: 'Chrome / Edge',
    steps: [
      'Ouvre Personal Place dans Chrome ou Edge',
      'Clique sur l’icône d’installation dans la barre d’adresse',
      'Choisis « Installer Personal Place »',
      'L’app s’ouvre dans sa propre fenêtre',
    ],
  },
}

export const NOTIF_NOTE =
  'Notifications (iPhone iOS 16.4+, Android, PC) : accepte « Notifications » quand l’app le demande, sinon Réglages → Notifications → Personal Place. Sur iPhone, installe depuis Safari (pas Chrome) et il n’y a pas de badge sur l’icône.'

export function detectPlatform() {
  if (typeof navigator === 'undefined') return 'desktop'
  const ua = navigator.userAgent
  if (/iPhone|iPad|iPod/.test(ua)) return 'ios'
  if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) return 'ios'
  if (/Android/.test(ua)) return 'android'
  return 'desktop'
}
