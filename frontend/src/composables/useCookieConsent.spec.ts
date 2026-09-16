import { describe, it, expect, vi, afterEach } from 'vitest'

describe('useCookieConsent', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
    localStorage.clear()
  })

  it('n’affiche pas la bannière si Matomo n’est pas configuré', async () => {
    vi.stubEnv('VITE_MATOMO_URL', '')
    vi.stubEnv('VITE_MATOMO_SITE_ID', '')
    const { useCookieConsent } = await import('./useCookieConsent')
    const { bannerVisible, initBanner } = useCookieConsent()

    initBanner()
    expect(bannerVisible.value).toBe(false)
  })
})
