import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useCookieConsent } from '@/composables/useCookieConsent'
import { hasAnalyticsConsent, trackMatomoPageView } from '@/utils/matomoConsent'
import { initMatomo } from '@/utils/matomoInit'

// Import MapLibre CSS
import 'maplibre-gl/dist/maplibre-gl.css'
// Point d'entrée unique : main.css importe modern-ui et utilities
import './assets/css/main.css'

initMatomo()

const app = createApp(App)

// Configuration de Pinia pour le state management
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Consentement cookies : page vue initiale si l'utilisateur a déjà accepté
const { trackInitialPageIfConsented } = useCookieConsent()
trackInitialPageIfConsented()

// Matomo SPA : navigations suivantes uniquement si consentement analytics actif
let premiereNavigation = true
router.afterEach((to) => {
  if (!hasAnalyticsConsent()) return
  if (premiereNavigation) {
    premiereNavigation = false
    return
  }
  trackMatomoPageView(to.fullPath)
})

// Gestionnaire d'erreurs global
app.config.errorHandler = (err, instance, info) => {
  console.error('❌ Erreur Vue Globale:', {
    erreur: err,
    composant: instance,
    info: info
  })
  // TODO: Connecter un service de monitoring (Sentry, etc.) ici
}

app.mount('#app')