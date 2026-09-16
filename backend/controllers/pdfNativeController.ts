/**
 * Contrôleur PDF Natif - Génération PDF avec PDFKit
 * Alternative performante à Puppeteer
 * 
 * Avantages :
 * - Performance : ~500ms vs ~5-10s avec Puppeteer
 * - Mémoire : ~20-50 MB vs ~150-300 MB
 * - Pas de dépendance Chromium
 * - Contrôle pixel-perfect du layout
 */
import { Request, Response } from 'express'
import { PdfGenerator } from '../utils/pdfNative'
import { PdfGenerationRequest } from '../utils/pdfNative/types'
import { logger } from '../services/logger'
import { ValidationService } from '../services/validation'

/** Limites de validation pour le body PDF natif (sécurité) */
const PDF_VALIDATION_LIMITS = {
  territoryNameMax: 200,
  themeNameMax: 200,
  chartTitleMax: 300,
  keyFigureValueMax: 50,
  keyFigureLabelMax: 200,
  chartsMax: 50,
  keyFiguresMax: 100
}

/**
 * Valide le body de la requête PDF native (structure, tailles, types)
 */
function validatePdfGenerationRequest(data: any): { valid: boolean; message?: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, message: 'Le body doit être un objet JSON' }
  }

  if (!data.territory || typeof data.territory !== 'object') {
    return { valid: false, message: 'Le territoire est requis (territory)' }
  }
  if (!data.territory.name || typeof data.territory.name !== 'string') {
    return { valid: false, message: 'Le territoire est requis (territory.name)' }
  }
  if (data.territory.name.length > PDF_VALIDATION_LIMITS.territoryNameMax) {
    return { valid: false, message: `territory.name trop long (max ${PDF_VALIDATION_LIMITS.territoryNameMax} caractères)` }
  }
  if (data.territory.type && !['commune', 'epci', 'departement', 'region'].includes(data.territory.type)) {
    return { valid: false, message: 'territory.type invalide' }
  }
  if (data.territory.code && data.territory.type === 'commune') {
    try {
      ValidationService.validateCodeInsee(data.territory.code)
    } catch {
      return { valid: false, message: 'territory.code (code INSEE) invalide' }
    }
  }

  if (!data.theme || typeof data.theme !== 'object') {
    return { valid: false, message: 'Le thème est requis (theme)' }
  }
  if (!data.theme.name || typeof data.theme.name !== 'string') {
    return { valid: false, message: 'Le thème est requis (theme.name)' }
  }
  if (data.theme.name.length > PDF_VALIDATION_LIMITS.themeNameMax) {
    return { valid: false, message: `theme.name trop long (max ${PDF_VALIDATION_LIMITS.themeNameMax} caractères)` }
  }
  if (data.theme.id) {
    try {
      ValidationService.validateThemeId(data.theme.id)
    } catch {
      return { valid: false, message: 'theme.id invalide' }
    }
  }

  if (data.charts) {
    if (!Array.isArray(data.charts)) {
      return { valid: false, message: 'charts doit être un tableau' }
    }
    if (data.charts.length > PDF_VALIDATION_LIMITS.chartsMax) {
      return { valid: false, message: `Trop de graphiques (max ${PDF_VALIDATION_LIMITS.chartsMax})` }
    }
    for (let i = 0; i < data.charts.length; i++) {
      const c = data.charts[i]
      if (!c || typeof c !== 'object') continue
      if (c.title && c.title.length > PDF_VALIDATION_LIMITS.chartTitleMax) {
        return { valid: false, message: `chart[${i}].title trop long` }
      }
      if (c.imageBase64 && typeof c.imageBase64 === 'string') {
        const validPrefix = /^data:image\/(png|jpeg|jpg|webp);base64,/
        if (!validPrefix.test(c.imageBase64)) {
          return { valid: false, message: `chart[${i}].imageBase64 : format attendu data:image/png;base64,...` }
        }
      }
    }
  }

  if (data.keyFigures) {
    if (!Array.isArray(data.keyFigures)) {
      return { valid: false, message: 'keyFigures doit être un tableau' }
    }
    if (data.keyFigures.length > PDF_VALIDATION_LIMITS.keyFiguresMax) {
      return { valid: false, message: `Trop de chiffres clés (max ${PDF_VALIDATION_LIMITS.keyFiguresMax})` }
    }
    for (let i = 0; i < data.keyFigures.length; i++) {
      const k = data.keyFigures[i]
      if (!k || typeof k !== 'object') continue
      if (k.value && k.value.length > PDF_VALIDATION_LIMITS.keyFigureValueMax) {
        return { valid: false, message: `keyFigure[${i}].value trop long` }
      }
      if (k.label && k.label.length > PDF_VALIDATION_LIMITS.keyFigureLabelMax) {
        return { valid: false, message: `keyFigure[${i}].label trop long` }
      }
    }
  }

  return { valid: true }
}

class PdfNativeController {
  /**
   * Génère un PDF à partir des données envoyées par le frontend
   * POST /api/pdf/generate
   * 
   * Body attendu : PdfGenerationRequest
   */
  async generatePdf(req: Request, res: Response) {
    const startTime = Date.now()

    try {
      const data: PdfGenerationRequest = req.body

      // Validation renforcée du body (sécurité : structure, tailles, types)
      const validation = validatePdfGenerationRequest(data)
      if (!validation.valid) {
        return res.status(400).json({
          error: 'Données invalides',
          message: validation.message,
          code: 'VALIDATION_ERROR'
        })
      }

      logger.info(`📄 [PDF Natif] Génération pour ${data.territory.name} - ${data.theme.name}`)
      logger.info(`📊 [PDF Natif] ${data.charts?.length || 0} graphiques, ${data.keyFigures?.length || 0} chiffres clés`)

      // Créer le générateur
      const generator = new PdfGenerator('landscape')

      // Générer le PDF
      const result = await generator.generate(data)

      if (!result.success || !result.buffer) {
        logger.error(`❌ [PDF Natif] Erreur: ${result.error}`)
        return res.status(500).json({
          error: 'Erreur de génération',
          message: result.error || 'Impossible de générer le PDF'
        })
      }

      const generationTime = Date.now() - startTime
      logger.info(`✅ [PDF Natif] PDF généré en ${generationTime}ms (${result.pageCount} pages, ${Math.round(result.buffer.length / 1024)} Ko)`)

      // Envoyer le PDF
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(result.filename || 'portrait.pdf')}"`)
      res.setHeader('Content-Length', result.buffer.length)
      res.setHeader('X-Generation-Time', generationTime.toString())
      res.setHeader('X-Page-Count', (result.pageCount || 0).toString())
      // CORS géré par le middleware global (server.ts)
      res.end(result.buffer, 'binary')

    } catch (error: any) {
      const generationTime = Date.now() - startTime
      logger.error(`❌ [PDF Natif] Erreur après ${generationTime}ms: ${error.message}`)

      res.status(500).json({
        error: 'Erreur serveur',
        message: process.env.NODE_ENV === 'production'
          ? 'Une erreur interne est survenue.'
          : (error.message || 'Une erreur est survenue lors de la génération du PDF')
      })
    }
  }

  /**
   * Health check léger : vérifie que PDFKit est disponible sans générer de PDF
   */
  async healthCheck(_req: Request, res: Response) {
    try {
      // Instanciation seule : pas de génération coûteuse
      new PdfGenerator('landscape')

      res.json({
        status: 'OK',
        message: 'Service PDF natif opérationnel',
        engine: 'PDFKit',
        note: 'Health check léger (sans génération PDF)'
      })
    } catch (error: any) {
      res.status(503).json({
        status: 'ERROR',
        message: 'Service PDF natif indisponible',
        error: process.env.NODE_ENV === 'production'
          ? 'Erreur interne'
          : error.message
      })
    }
  }

  /**
   * Endpoint pour prévisualiser le PDF (retourne un buffer pour affichage inline)
   * POST /api/pdf/preview
   */
  async previewPdf(req: Request, res: Response) {
    try {
      const data: PdfGenerationRequest = req.body

      const validation = validatePdfGenerationRequest(data)
      if (!validation.valid) {
        return res.status(400).json({
          error: 'Données invalides',
          message: validation.message,
          code: 'VALIDATION_ERROR'
        })
      }

      const generator = new PdfGenerator('landscape')
      const result = await generator.generate(data)

      if (!result.success || !result.buffer) {
        return res.status(500).json({
          error: 'Erreur de génération',
          message: result.error
        })
      }

      // Pour la prévisualisation, on utilise inline au lieu de attachment
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', 'inline')
      res.setHeader('Content-Length', result.buffer.length)

      res.end(result.buffer, 'binary')

    } catch (error: any) {
      res.status(500).json({
        error: 'Erreur serveur',
        message: process.env.NODE_ENV === 'production'
          ? 'Une erreur interne est survenue.'
          : (error.message || 'Une erreur est survenue lors de la génération du PDF')
      })
    }
  }
}

export const pdfNativeController = new PdfNativeController()
