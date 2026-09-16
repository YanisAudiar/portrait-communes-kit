/**
 * Export des graphiques Chart.js en image PNG haute qualité pour l'insertion dans un PDF
 * Utilisé par le mode natif (PDFKit)
 */
import type { Chart } from 'chart.js'
import type { ShallowRef } from 'vue'

/**
 * Exporte un graphique Chart.js en image PNG base64 haute qualité
 * @param chart - Instance Chart.js ou ShallowRef
 * @param width - Largeur souhaitée (défaut: 1600)
 * @param height - Hauteur souhaitée (défaut: 800)
 * @returns Image en base64 (data:image/png;base64,...) ou null
 */
export function exportChartHighQuality(
  chart: Chart | ShallowRef<Chart | null> | null,
  width: number = 1600,
  height: number = 800
): string | null {
  const chartInstance = chart && 'value' in chart ? chart.value : chart

  if (!chartInstance || !chartInstance.canvas) {
    console.warn('⚠️ Instance Chart.js non disponible pour l\'export')
    return null
  }

  try {
    const originalWidth = chartInstance.canvas.width
    const originalHeight = chartInstance.canvas.height

    chartInstance.resize(width, height)
    chartInstance.update('none')

    const imageBase64 = chartInstance.toBase64Image('image/png', 1.0)

    chartInstance.resize(originalWidth, originalHeight)
    chartInstance.update('none')

    return imageBase64
  } catch (error) {
    console.error('❌ Erreur lors de l\'export du graphique:', error)
    return null
  }
}
