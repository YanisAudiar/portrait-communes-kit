/**
 * Plugin Chart.js pour afficher une valeur centrale dans les graphiques donut
 * Style ultra-propre et moderne
 */
import type { Plugin } from 'chart.js'

export const centerValuePlugin: Plugin = {
  id: 'centerValue',
  beforeDraw(chart: any) {
    // Vérifier si le plugin est activé dans les options
    if (!chart.options.plugins?.centerValue?.display) {
      chart.centerValue = null
      return
    }

    const centerX = chart.chartArea.left + (chart.chartArea.right - chart.chartArea.left) / 2
    const centerY = chart.chartArea.top + (chart.chartArea.bottom - chart.chartArea.top) / 2

    // Calculer la valeur totale et le pourcentage principal
    if (chart.data && chart.data.datasets && chart.data.datasets[0]) {
      const data = chart.data.datasets[0].data as number[]
      const total = data.reduce((sum, val) => sum + val, 0)
      const maxValue = Math.max(...data)
      const percentage = total > 0 ? Math.round((maxValue / total) * 100) : 0

      // Sauvegarder pour utilisation dans afterDraw
      chart.centerValue = {
        percentage,
        centerX,
        centerY
      }
    }
  },

  afterDraw(chart: any) {
    if (!chart.centerValue) return

    const ctx = chart.ctx
    const { percentage, centerX, centerY } = chart.centerValue

    ctx.save()

    // Valeur principale (pourcentage)
    ctx.font = 'bold 32px Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    ctx.fillStyle = '#1E425D'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`${percentage}%`, centerX, centerY - 8)

    // Label optionnel (si disponible)
    if (chart.options.plugins?.centerValue?.label) {
      ctx.font = '400 14px Inter, -apple-system, BlinkMacSystemFont, sans-serif'
      ctx.fillStyle = '#7B8794'
      ctx.fillText(chart.options.plugins.centerValue.label, centerX, centerY + 20)
    }

    ctx.restore()
  }
}
