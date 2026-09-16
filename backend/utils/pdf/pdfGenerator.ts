/**
 * Génération et envoi des PDFs
 * Gère la création du PDF à partir d'une page et son envoi en réponse HTTP
 */
import { Response } from 'express'
import { Page, PDFOptions } from 'puppeteer'
import { logger } from '../../services/logger'
import { PDF_MARGINS } from './config'

/**
 * Génère les options de configuration pour le PDF en format paysage
 * @param {string} headerText - Texte à afficher dans l'en-tête
 * @returns {Object} Options de configuration PDF
 */
export const getPdfOptions = (headerText: string = 'Portrait de territoire - Audiar'): PDFOptions => {
  const currentDate = new Date().toLocaleDateString('fr-FR')

  return {
    format: 'A4',
    landscape: true, // Format paysage
    printBackground: true,
    margin: PDF_MARGINS,
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="font-family: sans-serif; width: 100%; padding: 0 1cm; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #316D7B; padding-bottom: 5px;">
          <span style="font-size: 10px; font-weight: 600; color: #316D7B; text-transform: uppercase;">${headerText}</span>
          <span style="font-size: 8px; color: #999;">Portrait de communes - Audiar</span>
        </div>
      </div>
    `,
    footerTemplate: `
      <div style="font-family: sans-serif; width: 100%; padding: 0 1cm; box-sizing: border-box;">
        <div style="border-top: 1px solid #eee; padding-top: 5px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 8px; color: #999;">Généré le ${currentDate} via Portrait de Territoire</span>
          <span style="font-size: 9px; color: #666;">Page <span class="pageNumber"></span> / <span class="totalPages"></span></span>
        </div>
      </div>
    `
  }
}

/**
 * Génère un PDF à partir d'une page Puppeteer
 * @param {Page} page - Instance Puppeteer Page
 * @param {string} headerText - Texte de l'en-tête
 * @returns {Promise<Buffer>} Buffer du PDF généré
 */
export const generatePdfFromPage = async (page: Page, headerText: string): Promise<Buffer> => {
  logger.info('📄 Génération du PDF...')

  const pdfOptions = getPdfOptions(headerText)
  const pdf = await page.pdf(pdfOptions)

  // Convertir en Buffer si nécessaire
  const pdfBuffer = Buffer.isBuffer(pdf) ? pdf : Buffer.from(pdf)
  logger.info(`📦 Taille PDF généré: ${Math.round(pdfBuffer.length / 1024)} Ko`)

  return pdfBuffer
}

/**
 * Valide que le buffer PDF est valide
 * @param {Buffer} pdfBuffer - Buffer du PDF à valider
 * @returns {boolean} True si le PDF est valide
 */
export const validatePdfBuffer = (pdfBuffer: Buffer): boolean => {
  if (!pdfBuffer || !Buffer.isBuffer(pdfBuffer)) {
    return false
  }

  // Vérifier que le PDF commence bien par %PDF
  const pdfHeader = pdfBuffer.toString('ascii', 0, 4)
  return pdfHeader === '%PDF'
}

/**
 * Envoie le PDF en réponse HTTP avec les en-têtes appropriés
 * @param {Response} res - Objet Response Express
 * @param {Buffer} pdfBuffer - Buffer du PDF
 * @param {string} filename - Nom du fichier PDF
 */
export const sendPdfResponse = (res: Response, pdfBuffer: Buffer, filename: string): void => {
  // Valider le buffer
  if (!validatePdfBuffer(pdfBuffer)) {
    logger.error('❌ Buffer PDF invalide')
    res.status(500).json({ error: 'Erreur lors de la génération du PDF' })
    return
  }

  // CORS géré par le middleware global (server.ts)

  // Headers pour le PDF - important d'utiliser application/pdf sans charset
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`)
  res.setHeader('Content-Length', pdfBuffer.length)

  // Désactiver la compression pour les PDFs binaires
  res.setHeader('Content-Encoding', 'identity')

  // Envoyer le buffer directement sans encodage
  res.end(pdfBuffer, 'binary')
}


