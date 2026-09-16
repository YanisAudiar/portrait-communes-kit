/**
 * Composable pour gérer l'export PDF des données d'une commune
 *
 * Deux modes :
 * - Puppeteer (legacy) : routes /api/pdf/commune/...
 * - Natif (PDFKit) : POST /api/pdf/generate
 *
 * Logique extraite dans composables/pdf/ (types, API, export chart, collecte).
 */
import { ref } from 'vue'
import type { NativePdfRequest } from './pdf'
import {
  getApiBase,
  downloadBlob,
  fetchThemePdf,
  fetchAllThemesPdf,
  fetchComparePdf,
  fetchNativePdf,
  checkNativePdfHealth,
  checkPdfHealth,
  exportChartHighQuality,
  collectPdfData
} from './pdf'

export type {
  TerritoryInfo,
  ThemeInfo,
  KeyFigure,
  ChartExportRef,
  NativePdfRequest
} from './pdf'

export function usePdfExport() {
  const isExporting = ref(false)
  const exportError = ref<string | null>(null)
  const exportProgress = ref(0)
  const API_BASE_URL = getApiBase()

  function setProgress(value: number) {
    exportProgress.value = value
  }

  function resetProgress() {
    setTimeout(() => {
      exportProgress.value = 0
    }, 2000)
  }

  /** Génère un nom de fichier pour un PDF natif */
  function nativePdfFilename(territoryName: string, themeId: string): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const slug = territoryName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
    return `portrait-${slug}-${themeId}-${date}.pdf`
  }

  /** Export PDF natif (PDFKit) */
  const downloadPdf = async (request: NativePdfRequest): Promise<void> => {
    if (!request.territory || !request.theme) {
      exportError.value = 'Données manquantes pour l\'export PDF'
      return
    }

    isExporting.value = true
    exportError.value = null
    exportProgress.value = 0

    try {
      setProgress(10)

      const chartsData = request.charts
        .map((chartRef) => {
          const imageBase64 = exportChartHighQuality(chartRef.chartRef)
          if (!imageBase64) {
            console.warn(`⚠️ Graphique ${chartRef.id} non exporté`)
            return null
          }
          return {
            id: chartRef.id,
            title: chartRef.title,
            imageBase64,
            source: chartRef.source,
            note: chartRef.note
          }
        })
        .filter(Boolean)

      setProgress(40)

      const pdfRequest = {
        territory: request.territory,
        theme: request.theme,
        charts: chartsData,
        keyFigures: request.keyFigures || [],
        options: {
          format: 'A4',
          orientation: 'landscape',
          includeCoverPage: true,
          includeFooter: true
        }
      }

      setProgress(50)
      const blob = await fetchNativePdf(API_BASE_URL, pdfRequest)
      setProgress(85)
      const filename = nativePdfFilename(request.territory.name, request.theme.id)
      downloadBlob(blob, filename)
      setProgress(100)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'export PDF'
      exportError.value = message
      throw error
    } finally {
      isExporting.value = false
      resetProgress()
    }
  }

  /** Vérifie si le service PDF natif est disponible */
  const checkNativePdfService = (): Promise<boolean> => checkNativePdfHealth(API_BASE_URL)

  /** Export thématique (Puppeteer) */
  const exportThemeToPDF = async (codeInsee: string, themeId: string): Promise<void> => {
    if (!codeInsee || !themeId) {
      exportError.value = 'Paramètres manquants pour l\'export PDF'
      return
    }

    isExporting.value = true
    exportError.value = null
    exportProgress.value = 0

    try {
      setProgress(20)
      const blob = await fetchThemePdf(API_BASE_URL, codeInsee, themeId)
      setProgress(80)
      const filename = `commune-${codeInsee}-${themeId}-${Date.now()}.pdf`
      downloadBlob(blob, filename)
      setProgress(100)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'export PDF'
      exportError.value = message
      throw error
    } finally {
      isExporting.value = false
      resetProgress()
    }
  }

  /** Export toutes thématiques (Puppeteer) */
  const exportAllThemesToPDF = async (codeInsee: string): Promise<void> => {
    if (!codeInsee) {
      exportError.value = 'Code INSEE manquant pour l\'export PDF'
      return
    }

    isExporting.value = true
    exportError.value = null
    exportProgress.value = 0

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5 * 60 * 1000)

    try {
      setProgress(20)
      const blob = await fetchAllThemesPdf(API_BASE_URL, codeInsee, controller.signal)
      clearTimeout(timeoutId)
      setProgress(80)
      const filename = `commune-${codeInsee}-complet-${Date.now()}.pdf`
      downloadBlob(blob, filename)
      setProgress(100)
    } catch (error: unknown) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === 'AbortError') {
        exportError.value = 'L\'export PDF a pris trop de temps (timeout de 5 minutes). Veuillez réessayer.'
      } else {
        exportError.value = error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'export PDF'
      }
      throw error
    } finally {
      isExporting.value = false
      resetProgress()
    }
  }

  /** Export comparatif (Puppeteer) */
  const exportComparativePDF = async (codeInsees: string[], themeId: string = 'all'): Promise<void> => {
    if (!codeInsees?.length) {
      exportError.value = 'Aucune commune sélectionnée pour l\'export comparatif'
      return
    }

    isExporting.value = true
    exportError.value = null
    exportProgress.value = 0

    try {
      setProgress(20)
      const blob = await fetchComparePdf(API_BASE_URL, codeInsees, themeId)
      setProgress(80)
      downloadBlob(blob, `comparatif-communes-${Date.now()}.pdf`)
      setProgress(100)
    } catch (error: unknown) {
      exportError.value = error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'export PDF'
      throw error
    } finally {
      isExporting.value = false
      resetProgress()
    }
  }

  /** Vérifie si le service PDF (Puppeteer) est disponible */
  const checkPdfService = (): Promise<boolean> => checkPdfHealth(API_BASE_URL)

  return {
    isExporting,
    exportError,
    exportProgress,
    downloadPdf,
    exportChartHighQuality,
    collectPdfData,
    checkNativePdfService,
    exportThemeToPDF,
    exportAllThemesToPDF,
    exportComparativePDF,
    checkPdfService
  }
}
