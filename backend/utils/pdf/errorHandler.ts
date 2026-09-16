/**
 * Gestion des erreurs de génération PDF
 * Centralise la gestion des erreurs et le nettoyage des ressources
 */
import { Response } from 'express'
import { Browser } from 'puppeteer'
import { logger } from '../../services/logger'

/**
 * Ferme le navigateur de manière sécurisée
 * @param {Browser|null} browser - Instance Puppeteer Browser (peut être null)
 */
export const closeBrowserSafely = async (browser: Browser | null): Promise<void> => {
  if (browser) {
    try {
      await browser.close()
    } catch (closeError) {
      logger.error('Erreur lors de la fermeture du navigateur:', closeError)
    }
  }
}

/**
 * Gère les erreurs de génération PDF et ferme le navigateur si nécessaire
 * @param {Error} error - Erreur survenue
 * @param {Browser|null} browser - Instance Puppeteer Browser (peut être null)
 * @param {Response} res - Objet Response Express
 * @param {string} context - Contexte de l'erreur pour le logging
 */
export const handlePdfError = async (error: any, browser: Browser | null, res: Response, context: string = 'PDF'): Promise<void> => {
  logger.error(`❌ Erreur lors de la génération du ${context}:`, error)

  // Fermer le navigateur si il est encore ouvert
  await closeBrowserSafely(browser)

  // Envoyer la réponse d'erreur (sans détails internes en production)
  res.status(500).json({
    error: `Erreur lors de la génération du ${context}`,
    message: process.env.NODE_ENV === 'production'
      ? 'Une erreur interne est survenue.'
      : error.message,
    ...(process.env.NODE_ENV === 'production' ? {} : { details: error.stack })
  })
}


