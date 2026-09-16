/**
 * Configuration pour la génération PDF
 * Centralise toutes les constantes et paramètres de configuration
 */

/**
 * Arguments par défaut pour le lancement du navigateur Puppeteer
 * Ces paramètres optimisent le rendu pour la génération PDF
 */
export const DEFAULT_BROWSER_ARGS = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-gpu'
]

/**
 * Configuration du viewport pour les PDFs en format paysage A4
 * Format A4 paysage : 297mm x 210mm (environ 1123px x 794px à 96 DPI)
 * Haute résolution pour garantir la qualité des graphiques
 */
export const PDF_VIEWPORT = {
  width: 1600, // Largeur pour format paysage
  height: 1200, // Hauteur pour format paysage
  deviceScaleFactor: 2 // Haute résolution pour les graphiques
}

/**
 * Configuration des marges PDF standard
 */
export const PDF_MARGINS = {
  top: '1cm',
  right: '1cm',
  bottom: '1cm',
  left: '1cm'
}

/**
 * Délai d'attente après le chargement de la page (en millisecondes)
 * Permet de s'assurer que tous les graphiques sont complètement rendus
 */
export const RENDER_DELAY_MS = 4000

/**
 * Timeout pour le chargement de la page (en millisecondes)
 */
export const PAGE_LOAD_TIMEOUT = 30000

/**
 * Timeout pour l'attente du sélecteur .print-ready (en millisecondes)
 * Doit être > au timeout de sécurité frontend (15s) + marge
 */
export const READY_SELECTOR_TIMEOUT = 50000

/**
 * Timeouts étendus pour les exports complets (toutes les thématiques)
 */
export const EXTENDED_TIMEOUTS = {
  PAGE_LOAD: 120000, // 2 minutes
  READY_SELECTOR: 100000 // 100 secondes
}


