import { describe, it, expect, vi, afterEach } from 'vitest'

describe('matomoInit - tracking optionnel', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
    document.querySelectorAll('script[data-matomo-init]').forEach((el) => el.remove())
    delete window._paq
  })

  it('est inactif sans VITE_MATOMO_URL ni VITE_MATOMO_SITE_ID', async () => {
    vi.stubEnv('VITE_MATOMO_URL', '')
    vi.stubEnv('VITE_MATOMO_SITE_ID', '')
    const { isMatomoConfigured, getMatomoConfig } = await import('./matomoInit')

    expect(isMatomoConfigured()).toBe(false)
    expect(getMatomoConfig()).toBeNull()
  })

  it('expose tracker et siteId quand les deux variables sont définies', async () => {
    vi.stubEnv('VITE_MATOMO_URL', 'https://stats.example.org/')
    vi.stubEnv('VITE_MATOMO_SITE_ID', '42')
    const { isMatomoConfigured, getMatomoConfig } = await import('./matomoInit')

    expect(isMatomoConfigured()).toBe(true)
    expect(getMatomoConfig()).toEqual({
      trackerUrl: 'https://stats.example.org/matomo.php',
      siteId: '42',
      scriptSrc: 'https://stats.example.org/matomo.js'
    })
  })

  it('utilise le CDN Matomo Cloud quand l’URL est un hôte *.matomo.cloud', async () => {
    vi.stubEnv('VITE_MATOMO_URL', 'https://agence.matomo.cloud')
    vi.stubEnv('VITE_MATOMO_SITE_ID', '7')
    const { getMatomoConfig } = await import('./matomoInit')

    expect(getMatomoConfig()?.scriptSrc).toBe(
      'https://cdn.matomo.cloud/agence.matomo.cloud/matomo.js'
    )
  })

  it('n’injecte pas le script Matomo si le suivi n’est pas configuré', async () => {
    vi.stubEnv('VITE_MATOMO_URL', '')
    vi.stubEnv('VITE_MATOMO_SITE_ID', '')
    const { initMatomo } = await import('./matomoInit')

    expect(initMatomo()).toBe(false)
    expect(document.querySelector('script[data-matomo-init]')).toBeNull()
  })
})
