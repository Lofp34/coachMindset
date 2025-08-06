// PWA Installation et mise à jour
import { registerSW } from 'virtual:pwa-register'

// Gestion des mises à jour PWA
export const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('Une nouvelle version est disponible. Voulez-vous recharger ?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('Application prête à fonctionner hors ligne')
  },
})

// Détection si l'app peut être installée
let deferredPrompt: BeforeInstallPromptEvent | null = null

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

// Écouter l'événement d'installation PWA
window.addEventListener('beforeinstallprompt', (e: Event) => {
  e.preventDefault()
  deferredPrompt = e as BeforeInstallPromptEvent
  showInstallButton()
})

// Afficher le bouton d'installation
function showInstallButton() {
  const installButton = document.getElementById('pwa-install-button')
  if (installButton) {
    installButton.style.display = 'block'
    installButton.addEventListener('click', installPWA)
  }
}

// Fonction d'installation PWA
export async function installPWA() {
  if (!deferredPrompt) return

  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice
  
  if (outcome === 'accepted') {
    console.log('PWA installée avec succès')
  } else {
    console.log('Installation PWA refusée')
  }
  
  deferredPrompt = null
  const installButton = document.getElementById('pwa-install-button')
  if (installButton) {
    installButton.style.display = 'none'
  }
}

// Vérifier si l'app est déjà installée
export function isPWAInstalled(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true
}

// Initialiser la PWA
export function initPWA() {
  // Enregistrer le service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker enregistré:', registration)
      })
      .catch(error => {
        console.log('Erreur Service Worker:', error)
      })
  }

  // Vérifier si installée
  if (isPWAInstalled()) {
    console.log('PWA déjà installée')
    // Masquer le bouton d'installation s'il existe
    const installButton = document.getElementById('pwa-install-button')
    if (installButton) {
      installButton.style.display = 'none'
    }
  }
}