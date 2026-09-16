import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  MATOMO_CHOICE_KEY,
  hasExistingChoice,
  hasAnalyticsConsent,
  acceptMatomoCookies,
  refuseMatomoCookies,
  revokeMatomoConsent
} from './matomoConsent'

describe('matomoConsent', () => {
  beforeEach(() => {
    localStorage.clear()
    document.cookie = ''
    window._paq = []
    vi.clearAllMocks()
  })

  it('affiche la bannière si aucun choix enregistré', () => {
    expect(hasExistingChoice()).toBe(false)
    expect(hasAnalyticsConsent()).toBe(false)
  })

  it('mémorise le refus sans consentement analytics', () => {
    refuseMatomoCookies()
    expect(hasExistingChoice()).toBe(true)
    expect(hasAnalyticsConsent()).toBe(false)
    const stored = JSON.parse(localStorage.getItem(MATOMO_CHOICE_KEY) || '{}')
    expect(stored.choice).toBe('refused')
  })

  it('active le consentement après acceptation', () => {
    acceptMatomoCookies()
    expect(hasAnalyticsConsent()).toBe(true)
    expect(window._paq).toContainEqual(['rememberConsentGiven', 180])
  })

  it('révoque le choix et efface le localStorage', () => {
    acceptMatomoCookies()
    revokeMatomoConsent()
    expect(localStorage.getItem(MATOMO_CHOICE_KEY)).toBeNull()
    expect(hasExistingChoice()).toBe(false)
  })
})
