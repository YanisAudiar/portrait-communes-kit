/**
 * Gestion du navigateur Puppeteer
 * Fonctions pour lancer et configurer le navigateur
 */
import puppeteer, { Browser, Page } from 'puppeteer'
import { DEFAULT_BROWSER_ARGS, PDF_VIEWPORT } from './config'

/**
 * Lance une instance Puppeteer avec la configuration optimale pour PDF
 * @returns {Promise<Browser>} Instance du navigateur Puppeteer
 */
export const launchBrowser = async (): Promise<Browser> => {
  return await puppeteer.launch({
    headless: 'new' as any,
    args: DEFAULT_BROWSER_ARGS
  })
}

/**
 * Configure une page Puppeteer pour le rendu PDF
 * @param {Page} page - Instance Puppeteer Page
 */
export const configurePageForPdf = async (page: Page): Promise<void> => {
  await page.setViewport(PDF_VIEWPORT)
}


