/**
 * Formatage des données pour graphiques circulaires (pie/doughnut) et radar
 */
import { getThemeColors, premiumColors } from '../chartColors'
import type { RawDataItem, FormattedChartData, CircularOptions } from '../chartTypes'
import { validateField, extractLabelValue } from '../chartTypes'
import { filterLatestData, extractValues, selectColor } from './chartFormatUtils'

/**
 * Formate les données pour un graphique circulaire (pie/doughnut)
 * Ne garde que la dernière année disponible
 */
export function formatCircular(
  data: RawDataItem[],
  theme: string,
  options: CircularOptions,
  overrideColors: string | string[] | null | undefined
): FormattedChartData {
  const { labelField, valueField } = options
  const latestData = filterLatestData(data)

  if (latestData.length === 0) return { labels: [], datasets: [] }
  if (!validateField(latestData, labelField) || !validateField(latestData, valueField)) {
    return { labels: [], datasets: [] }
  }

  // Exclure les lignes sans label valide (évite "Sans label" sur le graphique)
  const filteredData = latestData.filter(item => extractLabelValue(item, labelField) !== 'Sans label')
  if (filteredData.length === 0) return { labels: [], datasets: [] }

  const labels = filteredData.map(item => extractLabelValue(item, labelField))
  const values = extractValues(filteredData, valueField)
  const themeColors = getThemeColors(theme)
  const donutColors = overrideColors ||
    (theme === 'premium' ? Object.values(premiumColors) : themeColors)

  return {
    labels,
    datasets: [{
      label: 'Données',
      data: values,
      backgroundColor: Array.isArray(donutColors)
        ? donutColors.slice(0, filteredData.length)
        : [premiumColors.primary, premiumColors.secondary, premiumColors.accent, '#E5E7EB'].slice(0, filteredData.length),
      borderColor: '#FFFFFF',
      borderWidth: 0,
      borderRadius: 0
    }]
  }
}

/**
 * Formate les données pour graphiques radar / polarArea
 */
export function formatRadarData(
  data: RawDataItem[],
  theme: string,
  labelField: string,
  valueField: string,
  datasetLabel: string,
  overrideColors: string | string[] | null | undefined
): FormattedChartData {
  if (!validateField(data, labelField) || !validateField(data, valueField)) {
    return { labels: [], datasets: [] }
  }

  // Exclure les lignes sans label valide (évite "Sans label" sur le graphique)
  const filteredData = data.filter(item => extractLabelValue(item, labelField) !== 'Sans label')
  if (filteredData.length === 0) return { labels: [], datasets: [] }

  const labels = filteredData.map(item => extractLabelValue(item, labelField))
  const values = extractValues(filteredData, valueField)
  const themeColors = getThemeColors(theme)
  const colors = overrideColors || themeColors

  return {
    labels,
    datasets: [{
      label: datasetLabel,
      data: values,
      backgroundColor: (Array.isArray(colors) ? colors[0] : colors) + '40',
      borderColor: Array.isArray(colors) ? colors[0] : colors,
      borderWidth: 2
    }]
  }
}
