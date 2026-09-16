import { ref, readonly } from 'vue'
import {
  hasExistingChoice,
  hasAnalyticsConsent,
  acceptMatomoCookies,
  refuseMatomoCookies,
  revokeMatomoConsent,
  trackMatomoPageView
} from '@/utils/matomoConsent'
import { isMatomoConfigured } from '@/utils/matomoInit'

/** Visibilité de la bannière de consentement (état partagé). */
const bannerVisible = ref(false)

/**
 * Composable pour la bannière cookies et le lien « Gérer mes cookies ».
 * Inactif tant que Matomo n'est pas configuré (VITE_MATOMO_URL + SITE_ID).
 */
export function useCookieConsent() {
  const analyticsEnabled = isMatomoConfigured()

  function initBanner(): void {
    if (!analyticsEnabled) {
      bannerVisible.value = false
      return
    }
    bannerVisible.value = !hasExistingChoice()
  }

  function accept(): void {
    acceptMatomoCookies()
    bannerVisible.value = false
  }

  function refuse(): void {
    refuseMatomoCookies()
    bannerVisible.value = false
  }

  function manageCookies(): void {
    if (!analyticsEnabled) return
    revokeMatomoConsent()
    bannerVisible.value = true
  }

  /** Page vue initiale pour les visiteurs ayant déjà accepté (retour sur le site). */
  function trackInitialPageIfConsented(): void {
    if (!analyticsEnabled) return
    if (hasAnalyticsConsent()) {
      trackMatomoPageView()
    }
  }

  return {
    bannerVisible: readonly(bannerVisible),
    analyticsEnabled,
    initBanner,
    accept,
    refuse,
    manageCookies,
    trackInitialPageIfConsented,
    hasAnalyticsConsent
  }
}
