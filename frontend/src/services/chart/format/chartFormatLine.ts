/**
 * Formatage des données pour graphiques en courbes (line)
 * Délègue au format multi-séries explicite avec type 'line' (borderColor, pas backgroundColor)
 */
import type { RawDataItem, FormattedChartData, MultiExplicitOptions } from '../chartTypes'
import { formatMultiExplicit } from './chartFormatUtils'

/**
 * Formate les données pour un graphique en courbes multi-séries
 * Ex. : Naissances et décès (deux courbes)
 */
export function formatLineData(
  data: RawDataItem[],
  theme: string,
  options: MultiExplicitOptions,
  overrideColors: string | string[] | null | undefined
): FormattedChartData {
  return formatMultiExplicit(data, theme, options, overrideColors, 'line')
}
