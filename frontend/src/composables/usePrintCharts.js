/**
 * Composable pour gérer les graphiques dans les exports PDF
 * Gère la résolution des datasets et le calcul des dimensions
 */
import { computed } from 'vue'
import { getChartWidth, getChartHeight, resolveDataset } from '@/utils/printChartHelpers'

export function usePrintCharts(props) {
/**
 * Résout le dataset pour un graphique donné
 */
const getResolvedDataset = (chart) => {
  // Si le graphique a déjà ses données dans chart.data, les utiliser directement
  if (chart.data && Array.isArray(chart.data)) {
    return chart.data
  }

  // Sinon, utiliser la fonction de résolution par défaut
  return resolveDataset(
    chart,
    props.chartData,
    props.evolutionData,
    props.getDatasetByKey
  )
}

  /**
   * Calcule les dimensions d'un graphique
   */
  const getChartDimensions = (chart) => {
    const dimensions = {
      printChartWidth: props.printChartWidth,
      printChartHeight: props.printChartHeight,
      printDonutWidth: props.printDonutWidth,
      printDonutHeight: props.printDonutHeight,
      printLineChartWidth: props.printLineChartWidth,
      printLineChartHeight: props.printLineChartHeight
    }

    return {
      width: getChartWidth(chart, props.getChartTypeForTheme, props.theme.id, dimensions),
      height: getChartHeight(chart, props.getChartTypeForTheme, props.theme.id, dimensions)
    }
  }

  return {
    getResolvedDataset,
    getChartDimensions
  }
}

