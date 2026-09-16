/**
 * Construction des URLs pour les vues print
 * Gère la construction des URLs pour les exports PDF
 */
import { Request } from 'express'
import { logger } from '../../services/logger'

const DEFAULT_ALLOWED_FRONTEND_HOSTS = [
  '127.0.0.1',
  'localhost',
  'portrait-commune-test.audiar.org',
  'portrait-commune.audiar.org'
]

const getAllowedFrontendHosts = (): string[] => {
  const envHosts = process.env.PDF_ALLOWED_FRONTEND_HOSTS
  if (!envHosts) {
    return DEFAULT_ALLOWED_FRONTEND_HOSTS
  }

  const hosts = envHosts
    .split(',')
    .map(host => host.trim().toLowerCase())
    .filter(Boolean)

  return hosts.length > 0 ? hosts : DEFAULT_ALLOWED_FRONTEND_HOSTS
}

const validateFrontendUrl = (rawUrl: string): string => {
  let parsedUrl: URL
  try {
    parsedUrl = new URL(rawUrl)
  } catch {
    throw new Error('FRONTEND_URL invalide : URL mal formée')
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error('FRONTEND_URL invalide : protocole non autorisé')
  }

  if (parsedUrl.username || parsedUrl.password) {
    throw new Error('FRONTEND_URL invalide : credentials interdites')
  }

  const allowedHosts = getAllowedFrontendHosts()
  if (!allowedHosts.includes(parsedUrl.hostname.toLowerCase())) {
    throw new Error(
      `FRONTEND_URL invalide : hôte non autorisé (${parsedUrl.hostname})`
    )
  }

  return parsedUrl.origin
}

/**
 * Récupère l'URL du frontend depuis les variables d'environnement uniquement.
 * SÉCURITÉ : Ne jamais accepter l'URL depuis le client (risque SSRF via Puppeteer).
 * @param {Request} req - Objet Request Express (optionnel, pour le port en production)
 * @returns {string} URL du frontend
 */
export const getFrontendUrl = (req: Request | null = null): string => {
  // Vérifier la variable d'environnement
  let frontendUrl = process.env.FRONTEND_URL

  // Si FRONTEND_URL n'est pas défini, utiliser un fallback
  if (!frontendUrl) {
    const isProduction = process.env.NODE_ENV === 'production'

    if (isProduction) {
      // En production, utiliser le port local
      const protocol = 'http'
      const port = req?.socket?.localPort || process.env.PORT || '8147'
      frontendUrl = `${protocol}://127.0.0.1:${port}`
    } else {
      // En développement, fallback sur 3000
      frontendUrl = 'http://127.0.0.1:3000'
    }

    logger.info(`🔗 URL frontend fallback: ${frontendUrl} (production: ${isProduction})`)
  }

  return validateFrontendUrl(frontendUrl)
}

/**
 * Construit l'URL de la vue print pour une commune
 * @param {string} codeInsee - Code INSEE de la commune
 * @param {string|null} themeId - ID de la thématique (optionnel)
 * @param {boolean|string} allThemes - Si true, exporte toutes les thématiques
 * @param {Request} req - Objet Request Express (optionnel, pour détecter l'URL en production)
 * @returns {string} URL complète de la vue print
 */
export const buildCommunePrintUrl = (codeInsee: string, themeId: string | null, allThemes: boolean | string, req: Request | null = null): string => {
  const frontendUrl = getFrontendUrl(req)

  if (allThemes === true || allThemes === 'true') {
    return `${frontendUrl}/commune/${codeInsee}/print?all=true`
  }

  return `${frontendUrl}/commune/${codeInsee}/print?theme=${themeId}`
}

/**
 * Construit l'URL de la vue print pour une comparaison de communes
 * @param {string[]} codeInsees - Tableau des codes INSEE des communes
 * @param {string|null} themeId - ID de la thématique (optionnel)
 * @param {Request} req - Objet Request Express (optionnel)
 * @returns {string} URL complète de la vue print comparatif
 */
export const buildComparativePrintUrl = (codeInsees: string[], themeId: string | null, req: Request | null = null): string => {
  const frontendUrl = getFrontendUrl(req)

  const codeInseesParam = codeInsees.join(',')
  return `${frontendUrl}/commune/compare/print?communes=${codeInseesParam}&theme=${themeId || 'all'}`
}


