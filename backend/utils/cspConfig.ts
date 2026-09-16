/**
 * Content-Security-Policy : hôtes génériques + origines fournies par l'environnement.
 * Aucun hôte d'une agence particulière n'est inscrit en dur.
 */

export type CspEnv = Record<string, string | undefined>

function splitHosts(value: string | undefined): string[] {
  if (!value) return []
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function originFromUrl(url: string | undefined): string | null {
  if (!url) return null
  try {
    return new URL(url).origin
  } catch {
    return null
  }
}

export function buildCspDirectives(env: CspEnv = process.env): Record<string, string[]> {
  const connectSrc = [
    "'self'",
    'https://*.basemaps.cartocdn.com',
    'https://*.cartocdn.com',
    'https://tile.openstreetmap.org',
    'https://*.tile.openstreetmap.org',
    'https://demotiles.maplibre.org',
    'https://*.matomo.cloud',
    ...splitHosts(env.CSP_CONNECT_SRC)
  ]

  const geoserverOrigin = originFromUrl(env.GEOSERVER_URL)
  if (geoserverOrigin && !connectSrc.includes(geoserverOrigin)) {
    connectSrc.push(geoserverOrigin)
  }

  const scriptSrc = [
    "'self'",
    'https://cdn.matomo.cloud',
    ...splitHosts(env.CSP_SCRIPT_SRC)
  ]

  return {
    defaultSrc: ["'self'"],
    baseUri: ["'self'"],
    objectSrc: ["'none'"],
    frameAncestors: ["'self'"],
    formAction: ["'self'"],
    scriptSrc,
    scriptSrcAttr: ["'none'"],
    workerSrc: ["'self'", 'blob:'],
    styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https://demotiles.maplibre.org'],
    imgSrc: [
      "'self'",
      'data:',
      'blob:',
      'https://*.basemaps.cartocdn.com',
      'https://*.cartocdn.com',
      'https://tile.openstreetmap.org',
      'https://*.tile.openstreetmap.org',
      'https://demotiles.maplibre.org'
    ],
    connectSrc
  }
}
