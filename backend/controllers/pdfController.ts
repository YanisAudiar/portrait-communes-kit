/**
 * Contrôleur PDF - Orchestration de la génération PDF
 * Utilise les modules modulaires pour une architecture propre
 */
import { Request, Response } from 'express'
import puppeteer from 'puppeteer'
import { logger } from '../services/logger'
import { ValidationService } from '../services/validation'
// @ts-ignore
import { preparePageForPdf } from '../utils/pdfHelpers'

// Modules modulaires
import { 
  launchBrowser, 
  configurePageForPdf, 
  loadPageAndWait, 
  generatePdfFromPage, 
  sendPdfResponse, 
  buildCommunePrintUrl, 
  buildComparativePrintUrl, 
  generateCommuneFilename, 
  generateComparativeFilename, 
  handlePdfError, 
  closeBrowserSafely 
} from '../utils/pdf'

class PdfController {
  /**
   * Génère un PDF des graphiques d'une commune pour une thématique donnée
   * Cette fonction orchestre tout le processus : lancement du navigateur, chargement de la page,
   * nettoyage des éléments non nécessaires, génération et envoi du PDF
   */
  async generateCommunePDF(req: Request, res: Response) {
    const { codeInsee, themeId } = req.params
    const { allThemes } = req.query

    let browser = null

    try {
      // Validation des paramètres (sécurité : injection, caractères spéciaux)
      const validatedCodeInsee = ValidationService.validateCodeInsee(codeInsee)
      const validatedThemeId = ValidationService.validateThemeId(themeId || 'all')

      logger.info(`📄 Génération PDF pour commune ${validatedCodeInsee}, thématique: ${validatedThemeId}`)

      // Lancer le navigateur Puppeteer
      browser = await launchBrowser()
      const page = await browser.newPage()

      // Configurer la page pour le rendu PDF
      await configurePageForPdf(page)

      // Construire l'URL et charger la page
      const printUrl = buildCommunePrintUrl(validatedCodeInsee, validatedThemeId, allThemes as any, req)
      logger.info(`🌐 URL de print construite: ${printUrl}`)
      await loadPageAndWait(page, printUrl, allThemes === 'true')

      // Préparer la page pour le PDF (nettoyage des éléments non nécessaires)
      await preparePageForPdf(page)

      // Générer le PDF
      const pdfBuffer = await generatePdfFromPage(page, 'Portrait de territoire - Audiar')

      // Fermer le navigateur
      await closeBrowserSafely(browser)
      browser = null

      // Générer le nom de fichier et envoyer la réponse
      const filename = generateCommuneFilename(validatedCodeInsee, validatedThemeId)
      logger.success(`✅ PDF généré avec succès: ${filename}`)

      sendPdfResponse(res, pdfBuffer, filename)
    } catch (error: any) {
      // Erreur de validation : 400
      if (error.message?.includes('invalide') || error.message?.includes('incorrect')) {
        return res.status(400).json({
          error: 'Paramètres invalides',
          message: error.message,
          code: 'VALIDATION_ERROR'
        })
      }
      await handlePdfError(error, browser, res, 'PDF')
    }
  }

  /**
   * Génère un PDF comparatif pour plusieurs communes
   * Cette fonction permet de comparer plusieurs communes sur une même thématique
   */
  async generateComparativePDF(req: Request, res: Response) {
    const { codeInsees, themeId } = req.body

    let validatedCodeInsees: string[]
    let validatedThemeId: string
    try {
      validatedCodeInsees = ValidationService.validateComparativeCodeInsees(codeInsees)
      validatedThemeId = ValidationService.validateThemeId(themeId || 'all')
    } catch (error: any) {
      return res.status(400).json({
        error: 'Paramètres invalides',
        message: error.message,
        code: 'VALIDATION_ERROR'
      })
    }

    logger.info(`📄 Génération PDF comparatif pour ${validatedCodeInsees.length} communes`)

    let browser = null

    try {
      // Lancer le navigateur Puppeteer
      browser = await launchBrowser()
      const page = await browser.newPage()

      // Configurer la page pour le rendu PDF
      await configurePageForPdf(page)

      // Construire l'URL et charger la page
      const printUrl = buildComparativePrintUrl(validatedCodeInsees, validatedThemeId, req)
      logger.info(`🌐 URL de print comparatif construite: ${printUrl}`)
      await loadPageAndWait(page, printUrl)

      // Préparer la page pour le PDF (nettoyage des éléments non nécessaires)
      await preparePageForPdf(page)

      // Générer le PDF
      const pdfBuffer = await generatePdfFromPage(page, 'Comparatif de communes - Audiar')

      // Fermer le navigateur
      await closeBrowserSafely(browser)
      browser = null

      // Générer le nom de fichier et envoyer la réponse
      const filename = generateComparativeFilename(validatedCodeInsees.length)
      logger.success(`✅ PDF comparatif généré avec succès: ${filename}`)

      sendPdfResponse(res, pdfBuffer, filename)

    } catch (error: any) {
      await handlePdfError(error, browser, res, 'PDF comparatif')
    }
  }

  /**
   * Endpoint léger : vérifie la disponibilité du module Puppeteer sans lancer Chromium
   */
  async healthCheck(_req: Request, res: Response) {
    try {
      res.json({
        status: 'OK',
        message: 'Service PDF opérationnel',
        engine: 'Puppeteer',
        puppeteerVersion: (puppeteer as any).version || 'N/A',
        note: 'Health check léger (sans lancement Chromium)'
      })
    } catch (error: any) {
      res.status(503).json({
        status: 'ERROR',
        message: 'Service PDF indisponible',
        error: process.env.NODE_ENV === 'production'
          ? 'Erreur interne'
          : error.message
      })
    }
  }
}

export const pdfController = new PdfController()
