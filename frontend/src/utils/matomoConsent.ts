/**
 * Gestion du consentement Matomo (opt-in strict via requireConsent).
 * Aligné sur GESTION_COOKIES_MATOMO.md — localStorage + API Matomo native.
 */

export const MATOMO_CHOICE_KEY = 'portrait_communes_matomo_choice'

/** Durée de mémorisation du choix : 6 mois */
const CHOICE_TTL_MS = 6 * 30 * 24 * 60 * 60 * 1000

/** Durée du consentement Matomo : 180 jours (~6 mois) */
const MATOMO_CONSENT_DAYS = 180

export type MatomoChoiceValue = 'accepted' | 'refused'

interface StoredMatomoChoice {
  choice: MatomoChoiceValue
  expiresAt: number
}

type MatomoCommand = [string, ...unknown[]]

declare global {
  interface Window {
    _paq?: MatomoCommand[]
  }
}

function getPaq(): MatomoCommand[] | null {
  if (typeof window === 'undefined' || !window._paq) return null
  return window._paq
}

function getStoredChoice(): StoredMatomoChoice | null {
  try {
    const raw = localStorage.getItem(MATOMO_CHOICE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredMatomoChoice
    if (!parsed?.choice || !parsed.expiresAt) return null
    if (Date.now() > parsed.expiresAt) {
      localStorage.removeItem(MATOMO_CHOICE_KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function saveChoice(choice: MatomoChoiceValue): void {
  const entry: StoredMatomoChoice = {
    choice,
    expiresAt: Date.now() + CHOICE_TTL_MS
  }
  localStorage.setItem(MATOMO_CHOICE_KEY, JSON.stringify(entry))
}

function hasMatomoConsentCookie(): boolean {
  return document.cookie.split(';').some((c) => c.trim().startsWith('mtm_consent='))
}

function hasMatomoConsentRemovedCookie(): boolean {
  return document.cookie.split(';').some((c) => c.trim().startsWith('mtm_consent_removed='))
}

/** Un choix existe déjà (localStorage ou cookies Matomo). */
export function hasExistingChoice(): boolean {
  if (getStoredChoice()) return true
  return hasMatomoConsentCookie() || hasMatomoConsentRemovedCookie()
}

/** L'utilisateur a accepté le suivi d'audience. */
export function hasAnalyticsConsent(): boolean {
  const stored = getStoredChoice()
  if (stored?.choice === 'accepted') return true
  if (stored?.choice === 'refused') return false
  return hasMatomoConsentCookie()
}

function clearStoredChoice(): void {
  localStorage.removeItem(MATOMO_CHOICE_KEY)
}

/** Envoie une page vue Matomo (uniquement si consentement actif). */
export function trackMatomoPageView(customUrl?: string): void {
  if (!hasAnalyticsConsent()) return
  const paq = getPaq()
  if (!paq) return
  if (customUrl) {
    paq.push(['setCustomUrl', customUrl])
  }
  paq.push(['trackPageView'])
}

/** Accepte les cookies analytics : consentement Matomo + première page vue. */
export function acceptMatomoCookies(): void {
  saveChoice('accepted')
  const paq = getPaq()
  if (paq) {
    paq.push(['rememberConsentGiven', MATOMO_CONSENT_DAYS])
    trackMatomoPageView()
  }
}

/** Refuse le suivi : mémorise le refus sans tracking. */
export function refuseMatomoCookies(): void {
  saveChoice('refused')
  const paq = getPaq()
  if (paq) {
    paq.push(['forgetConsentGiven'])
  }
}

/**
 * Révoque le consentement et prépare la réaffichage de la bannière
 * (lien « Gérer mes cookies »).
 */
export function revokeMatomoConsent(): void {
  clearStoredChoice()
  const paq = getPaq()
  if (paq) {
    paq.push(['forgetConsentGiven'])
  }
}
