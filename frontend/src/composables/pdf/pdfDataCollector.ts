/**
 * Collecte des données DOM (graphiques Chart.js, KPIs) pour un export PDF natif
 */
import type { NativePdfRequest, ChartExportRef, KeyFigure } from './types'

/**
 * Collecte automatiquement les données pour un export PDF natif :
 * graphiques Chart.js depuis le DOM et KPIs depuis les cartes KPI
 */
export async function collectPdfData(
  codeInsee: string,
  themeId: string,
  themeName: string,
  themeColor: string,
  communeName?: string
): Promise<NativePdfRequest | null> {
  try {
    const { Chart } = await import('chart.js')

    const canvasElements = document.querySelectorAll<HTMLCanvasElement>('canvas')
    const charts: ChartExportRef[] = []

    canvasElements.forEach((canvas, index) => {
      try {
        const chartInstance = Chart.getChart(canvas)
        if (chartInstance) {
          const container = canvas.closest('.chart-card, [class*="chart"]')
          const titleElement = container?.querySelector('.chart-card-title, h3, [class*="title"]')
          const title = titleElement?.textContent?.trim() || `Graphique ${index + 1}`
          const sourceElement = container?.querySelector('.chart-source, [class*="source"]')
          const source = sourceElement?.textContent?.trim() || undefined

          charts.push({
            chartRef: chartInstance,
            id: `chart-${index}`,
            title,
            source
          })
        }
      } catch (error) {
        console.warn(`⚠️ Impossible de récupérer le graphique ${index}:`, error)
      }
    })

    const kpiCards = document.querySelectorAll('.kpi-card, [class*="kpi"]')
    const keyFigures: KeyFigure[] = []

    kpiCards.forEach((card) => {
      try {
        const valueElement = card.querySelector('[class*="value"], .kpi-value, .value')
        const labelElement = card.querySelector('[class*="label"], .kpi-label, .label')

        if (valueElement && labelElement) {
          const value = valueElement.textContent?.trim() || ''
          const label = labelElement.textContent?.trim() || ''
          if (value && label) {
            keyFigures.push({ value, label, color: themeColor })
          }
        }
      } catch (error) {
        console.warn('⚠️ Impossible de récupérer un KPI:', error)
      }
    })

    if (charts.length === 0) {
      console.warn('⚠️ Aucun graphique trouvé pour l\'export PDF')
      return null
    }

    return {
      territory: {
        name: communeName || codeInsee,
        code: codeInsee,
        type: 'commune'
      },
      theme: {
        id: themeId,
        name: themeName,
        color: themeColor
      },
      charts,
      keyFigures: keyFigures.length > 0 ? keyFigures : undefined
    }
  } catch (error) {
    console.error('❌ Erreur lors de la collecte des données PDF:', error)
    return null
  }
}
