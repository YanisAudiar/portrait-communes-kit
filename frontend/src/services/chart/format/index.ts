/**
 * Point d'entrée du formatage des données Chart.js
 * Réexporte formatDataForChart et les types/helpers si besoin
 */
import type { ChartDataOptions, ChartType } from '../chartTypes'
import { validateRawData, validateChartType } from '../chartTypes'
import type { FormattedChartData } from '../chartTypes'
import { classifyChartMode, formatMultiExplicit } from './chartFormatUtils'
import { formatPyramidAges } from './formatPyramidAges'
import { formatSingleSeries, formatMultiGrouped } from './chartFormatBar'
import { formatLineData } from './chartFormatLine'
import { formatCircular, formatRadarData } from './chartFormatPie'

/**
 * Formate les données selon le type de graphique
 * Délègue aux formatters bar / line / pie selon le mode détecté
 */
export function formatDataForChart(
  data: unknown,
  type: string,
  options: Partial<ChartDataOptions> = {}
): FormattedChartData {
  if (!validateChartType(type)) return { labels: [], datasets: [] }
  if (!validateRawData(data)) return { labels: [], datasets: [] }

  const {
    theme = 'default',
    datasetLabel = 'Données',
    colors: overrideColors = null
  } = options

  const formatOptions = classifyChartMode(type as ChartType, options)
  const pyramid = options.pyramid === true

  switch (formatOptions.mode) {
    case 'single':
      return formatSingleSeries(data, theme, formatOptions, datasetLabel, overrideColors)

    case 'multi-explicit':
      if (type === 'line') {
        return formatLineData(data, theme, formatOptions, overrideColors)
      }
      if (pyramid) {
        return formatPyramidAges(data, theme, formatOptions, overrideColors)
      }
      return formatMultiExplicit(data, theme, formatOptions, overrideColors, 'bar', false)

    case 'multi-grouped':
      return formatMultiGrouped(data, theme, formatOptions, overrideColors)

    case 'circular':
      return formatCircular(data, theme, formatOptions, overrideColors)

    default:
      if (type === 'radar' || type === 'polarArea') {
        return formatRadarData(
          data,
          theme,
          options.labelField || 'label',
          options.valueField || 'value',
          datasetLabel,
          overrideColors
        )
      }
      return { labels: [], datasets: [] }
  }
}

export { formatSingleSeries, formatMultiGrouped } from './chartFormatBar'
export { formatLineData } from './chartFormatLine'
export { formatCircular, formatRadarData } from './chartFormatPie'
export { classifyChartMode, formatMultiExplicit } from './chartFormatUtils'
