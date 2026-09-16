/**
 * Configuration CORS testable et durcie pour la production
 */

export const DEFAULT_CORS_ORIGINS = [
  'https://portrait-commune-test.audiar.org',
  'https://portrait-commune.audiar.org',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:4173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4173'
]

export function parseAllowedOrigins(rawOrigins?: string): string[] {
  if (!rawOrigins) {
    return DEFAULT_CORS_ORIGINS
  }
  return rawOrigins.split(',').map((origin) => origin.trim()).filter(Boolean)
}

/**
 * Détermine si une origine est autorisée selon l'environnement
 */
export function isOriginAllowed(
  origin: string | undefined,
  options: {
    nodeEnv?: string
    corsOrigins?: string
  } = {}
): boolean {
  const nodeEnv = options.nodeEnv ?? process.env.NODE_ENV
  const allowedOrigins = parseAllowedOrigins(options.corsOrigins ?? process.env.CORS_ORIGINS)

  // Requêtes sans Origin (curl, same-origin) : autorisées
  if (!origin) {
    return true
  }

  // En développement : permissif
  if (nodeEnv !== 'production') {
    return true
  }

  // Wildcard interdit en production (credentials: true)
  if (allowedOrigins.includes('*')) {
    return false
  }

  return allowedOrigins.includes(origin)
}
