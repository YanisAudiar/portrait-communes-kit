/**
 * Types et constantes pour les captures d'écran (PNG)
 */

export interface ScreenshotOptions {
  filename?: string
  quality?: number
  pixelRatio?: number
  backgroundColor?: string
  addWatermark?: boolean
  watermarkText?: string
  hideSelectors?: string[]
  showLogo?: boolean
}

/** Sélecteurs masqués par défaut pendant la capture (boutons, contrôles) */
export const DEFAULT_HIDE_SELECTORS = [
  '.chart-export-buttons',
  '.export-buttons',
  '.export-btn',
  '.btn-export',
  '.export-actions',
  '.export-pdf-container',
  '.control-data',
  '.chart-controls',
  '.chart-filter',
  '.compare',
  '.year-selector',
  '.btn-share-kpi',
  '.share-btn',
  '.print-hide',
  '.download-btn'
]
