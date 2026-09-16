import express, { Request, Response, NextFunction } from 'express'
import { logger } from '../services/logger'
import { pdfController } from '../controllers/pdfController'
import { pdfNativeController } from '../controllers/pdfNativeController'

const router = express.Router()

// Middleware de débogage pour toutes les routes PDF
router.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`📋 Requête PDF reçue: ${req.method} ${req.path}`)
  next()
})

/**
 * @route GET /api/pdf/commune/:codeInsee/:themeId
 * @desc Génère un PDF pour une commune et une thématique spécifique
 * @param {string} codeInsee - Code INSEE de la commune
 * @param {string} themeId - ID de la thématique (demographie, habitat, etc.)
 * @query {boolean} allThemes - Si true, exporte toutes les thématiques
 * @access Public
 */
router.get('/commune/:codeInsee/:themeId', (req: Request, res: Response, next: NextFunction) => {
  logger.info(`📄 Route PDF appelée: commune ${req.params.codeInsee}, thème ${req.params.themeId}`)
  if (pdfController && pdfController.generateCommunePDF) {
    pdfController.generateCommunePDF(req, res).catch(next)
  } else {
    logger.error('❌ pdfController.generateCommunePDF n\'est pas défini')
    res.status(500).json({ error: 'Contrôleur PDF non disponible' })
  }
})

/**
 * @route GET /api/pdf/commune/:codeInsee
 * @desc Génère un PDF pour une commune avec toutes les thématiques
 * @param {string} codeInsee - Code INSEE de la commune
 * @access Public
 */
router.get('/commune/:codeInsee', (req: Request, res: Response, next: NextFunction) => {
  logger.info(`📄 Route PDF appelée: commune ${req.params.codeInsee}, toutes les thématiques`)
  req.params.themeId = 'all'
  req.query.allThemes = 'true'
  if (pdfController && pdfController.generateCommunePDF) {
    pdfController.generateCommunePDF(req, res).catch(next)
  } else {
    logger.error('❌ pdfController.generateCommunePDF n\'est pas défini')
    res.status(500).json({ error: 'Contrôleur PDF non disponible' })
  }
})

/**
 * @route POST /api/pdf/compare
 * @desc Génère un PDF comparatif pour plusieurs communes
 * @body {array} codeInsees - Tableau des codes INSEE des communes à comparer
 * @body {string} themeId - ID de la thématique (optionnel)
 * @access Public
 */
router.post('/compare', (req: Request, res: Response, next: NextFunction) => {
  pdfController.generateComparativePDF(req, res).catch(next)
})

/**
 * @route GET /api/pdf/health
 * @desc Vérifie que le service PDF fonctionne correctement (Puppeteer)
 * @access Public
 */
router.get('/health', pdfController.healthCheck.bind(pdfController))

// =============================================================================
// ROUTES PDF NATIVES (PDFKit) - Plus performantes
// =============================================================================

/**
 * @route POST /api/pdf/generate
 * @desc Génère un PDF à partir des données JSON (graphiques en base64)
 * @body {object} PdfGenerationRequest - Données complètes pour le PDF
 * @access Public
 * 
 * Avantages vs Puppeteer :
 * - Performance : ~500ms vs ~5-10s
 * - Mémoire : ~20-50 MB vs ~150-300 MB
 * - Pas de dépendance Chromium
 */
router.post('/generate', (req: Request, res: Response, next: NextFunction) => {
  logger.info(`📄 [PDF Natif] Route POST /generate appelée`)
  pdfNativeController.generatePdf(req, res).catch(next)
})

/**
 * @route POST /api/pdf/preview
 * @desc Génère un PDF pour prévisualisation inline (non téléchargeable)
 * @body {object} PdfGenerationRequest - Données complètes pour le PDF
 * @access Public
 */
router.post('/preview', (req: Request, res: Response, next: NextFunction) => {
  logger.info(`📄 [PDF Natif] Route POST /preview appelée`)
  pdfNativeController.previewPdf(req, res).catch(next)
})

/**
 * @route GET /api/pdf/native/health
 * @desc Vérifie que le service PDF natif (PDFKit) fonctionne correctement
 * @access Public
 */
router.get('/native/health', (req: Request, res: Response, next: NextFunction) => {
  pdfNativeController.healthCheck(req, res).catch(next)
})

export default router


