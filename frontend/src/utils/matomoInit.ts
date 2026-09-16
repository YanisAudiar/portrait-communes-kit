/**
 * Bootstrap Matomo optionnel.
 * Sans VITE_MATOMO_URL et VITE_MATOMO_SITE_ID : pas de script, pas de bannière cookies.
 */

export interface MatomoRuntimeConfig {
  trackerUrl: string
  siteId: string
  scriptSrc: string
}

type MatomoCommand = [string, ...unknown[]]

declare global {
  interface Window {
    _paq?: MatomoCommand[]
  }
}

function envValue(key: 'VITE_MATOMO_URL' | 'VITE_MATOMO_SITE_ID'): string {
  const raw = import.meta.env[key]
  return typeof raw === 'string' ? raw.trim() : ''
}

function normalizeTrackerBase(url: string): string {
  return url.endsWith('/') ? url : `${url}/`
}

/** Configuration runtime, ou null si le suivi n'est pas branché. */
export function getMatomoConfig(): MatomoRuntimeConfig | null {
  const url = envValue('VITE_MATOMO_URL')
  const siteId = envValue('VITE_MATOMO_SITE_ID')
  if (!url || !siteId) return null

  const trackerBase = normalizeTrackerBase(url)
  let scriptSrc = `${trackerBase}matomo.js`

  try {
    const host = new URL(trackerBase).hostname
    if (host.endsWith('matomo.cloud')) {
      scriptSrc = `https://cdn.matomo.cloud/${host}/matomo.js`
    }
  } catch {
    return null
  }

  return {
    trackerUrl: `${trackerBase}matomo.php`,
    siteId,
    scriptSrc
  }
}

export function isMatomoConfigured(): boolean {
  return getMatomoConfig() !== null
}

/**
 * Initialise la file _paq et charge matomo.js.
 * À appeler avant le montage Vue. Ne tracke pas (requireConsent).
 */
export function initMatomo(): boolean {
  const config = getMatomoConfig()
  if (!config || typeof window === 'undefined') return false

  const _paq = (window._paq = window._paq || [])
  _paq.push(['requireConsent'])
  _paq.push(['enableLinkTracking'])
  _paq.push(['setTrackerUrl', config.trackerUrl])
  _paq.push(['setSiteId', config.siteId])

  const host = window.location.hostname
  if (host !== 'localhost' && host !== '127.0.0.1') {
    _paq.push(['setCookieDomain', host])
  }

  if (document.querySelector('script[data-matomo-init]')) return true

  const script = document.createElement('script')
  script.async = true
  script.src = config.scriptSrc
  script.setAttribute('data-matomo-init', 'true')
  document.head.appendChild(script)
  return true
}
