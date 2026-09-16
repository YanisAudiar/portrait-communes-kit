/**
 * Module PDF : types, API, export chart, collecte données
 * Point d'entrée pour usePdfExport (réexporte les types utilisés à l'extérieur)
 */
export type {
  TerritoryInfo,
  ThemeInfo,
  KeyFigure,
  ChartExportRef,
  NativePdfRequest
} from './types'

export { exportChartHighQuality } from './pdfChartExport'
export {
  getApiBase,
  downloadBlob,
  fetchThemePdf,
  fetchAllThemesPdf,
  fetchComparePdf,
  fetchNativePdf,
  checkNativePdfHealth,
  checkPdfHealth
} from './pdfApi'
export { collectPdfData } from './pdfDataCollector'
