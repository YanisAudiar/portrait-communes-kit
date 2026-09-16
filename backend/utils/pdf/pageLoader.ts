/**
 * Chargement et attente de la page
 * Gère le chargement de l'URL et l'attente du rendu complet
 */
import { Page, HTTPRequest } from 'puppeteer'
import { logger } from '../../services/logger'
import { PAGE_LOAD_TIMEOUT, READY_SELECTOR_TIMEOUT, RENDER_DELAY_MS, EXTENDED_TIMEOUTS } from './config'

/**
 * Utilitaire pour créer un délai (compatibilité avec différentes versions de Puppeteer)
 * @param {number} ms - Délai en millisecondes
 * @returns {Promise<void>}
 */
const delay = (ms: number = 0): Promise<void> => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Configure les listeners pour capturer les logs et erreurs du navigateur
 * @param {Page} page - Instance Puppeteer Page
 */
export const setupPageListeners = (page: Page): void => {
  // Capturer les logs de la console du navigateur
  page.on('console', msg => {
    const type = msg.type().toUpperCase()
    const text = msg.text()
    // Capturer tous les logs importants
    if (type === 'ERROR' || type === 'WARNING' || text.includes('[PrintContextMap]') || text.includes('[CommunePrint]') || text.includes('ErrorBoundary')) {
      logger.info(`[Browser ${type}] ${text}`)
    }
  })

  // Capturer les erreurs de page non gérées
  page.on('pageerror', (err: any) => {
    logger.error(`❌ [Browser Error] ${err.message}`)
    if (err.stack) {
      logger.error(`❌ [Browser Error Stack] ${err.stack}`)
    }
  })

  // Capturer les échecs de requêtes réseau (utile pour debug API)
  page.on('requestfailed', (request: HTTPRequest) => {
    const url = request.url()
    // Ignorer les assets google fonts ou analytics si besoin, focus sur l'API
    if (url.includes('/api/')) {
      logger.error(`❌ [Browser Network Error] ${request.method()} ${url} - ${request.failure()?.errorText}`)
    }
  })
}

/**
 * Charge une URL dans la page et attend que le contenu soit prêt
 * @param {Page} page - Instance Puppeteer Page
 * @param {string} url - URL à charger
 * @param {boolean} isAllThemes - Si true, utilise des timeouts plus longs pour les exports complets
 */
export const loadPageAndWait = async (page: Page, url: string, isAllThemes: boolean = false): Promise<void> => {
  logger.info(`🌐 Chargement de l'URL: ${url}`)

  // Timeouts plus longs pour les exports complets
  const pageLoadTimeout = isAllThemes ? EXTENDED_TIMEOUTS.PAGE_LOAD : PAGE_LOAD_TIMEOUT
  const readySelectorTimeout = isAllThemes ? EXTENDED_TIMEOUTS.READY_SELECTOR : READY_SELECTOR_TIMEOUT

  // Configurer les listeners
  setupPageListeners(page)

  // Charger la page : on utilise 'load' pour ne pas bloquer sur les appels API
  await page.goto(url, {
    waitUntil: 'load',
    timeout: pageLoadTimeout
  })

  // 1) S'assurer que la vue Vue a bien monté (élément racine de la page print)
  const communePrintTimeout = Math.min(readySelectorTimeout, 45000)
  try {
    await page.waitForSelector('.commune-print', { timeout: communePrintTimeout })
    logger.info('✅ Élément .commune-print trouvé (vue Print montée)')
  } catch (err) {
    const currentUrl = page.url()
    let pagePreview = ''
    try {
      pagePreview = await page.evaluate(() => (globalThis as unknown as { document?: { body?: { innerText?: string } } }).document?.body?.innerText?.slice(0, 300) || '')
    } catch {
      // ignore
    }
    logger.error(`❌ Élément .commune-print introuvable après ${communePrintTimeout}ms. URL: ${currentUrl}. Aperçu page: ${pagePreview}`)
    throw new Error(
      'La vue d\'export PDF n\'a pas chargé (élément .commune-print introuvable). ' +
      'Vérifier que l\'URL du frontend est correcte : paramètre origin ou variable FRONTEND_URL. ' +
      `URL chargée: ${currentUrl}`
    )
  }

  // 2) Attendre .print-ready (ajouté par le front quand tout est prêt), sinon forcer
  try {
    await page.waitForSelector('.print-ready', { timeout: readySelectorTimeout })
    logger.info('✅ Sélecteur .print-ready trouvé')
  } catch {
    logger.warn('⚠️ .print-ready non apparu, forçage de la classe sur .commune-print')
    const forced = await page.evaluate((): boolean => {
      const doc = (globalThis as unknown as { document?: { querySelector(s: string): { classList: { add(s: string): void } } | null } }).document
      if (!doc) return false
      const el = doc.querySelector('.commune-print')
      if (el) {
        el.classList.add('print-ready')
        return true
      }
      return false
    })
    if (!forced) {
      throw new Error('Impossible d\'ajouter la classe print-ready (élément .commune-print perdu)')
    }
    logger.info('✅ Classe print-ready forcée via JavaScript')
    await delay(800)
  }

  // Attendre un délai supplémentaire pour garantir le rendu complet
  // Compatibilité avec différentes versions de Puppeteer
  if (typeof (page as any).waitForTimeout === 'function') {
    await (page as any).waitForTimeout(RENDER_DELAY_MS)
  } else {
    await delay(RENDER_DELAY_MS)
  }

  logger.info('✅ Graphiques chargés, préparation de la page pour PDF...')
}


