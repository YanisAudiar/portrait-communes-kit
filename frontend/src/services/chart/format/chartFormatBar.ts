/**
 * Formatage des données pour graphiques à barres
 * - Mono-série (évolution, barres avec dégradé selon la valeur)
 * - Multi-séries avec groupement dynamique (ex. ventes par type de bien)
 */
import { getThemeColors } from '../chartColors'
import type { RawDataItem, FormattedChartData, ChartDataset, SingleSeriesOptions, MultiGroupedOptions } from '../chartTypes'
import { validateField, extractNumericValue, extractLabelValue } from '../chartTypes'
import { extractValues, extractUniqueLabels, selectColor } from './chartFormatUtils'

/**
 * Formate les données pour un graphique mono-série (barres)
 * Couleurs en dégradé : plus la valeur est élevée, plus la barre est foncée
 */
export function formatSingleSeries(
  data: RawDataItem[],
  theme: string,
  options: SingleSeriesOptions,
  datasetLabel: string,
  overrideColors: string | string[] | null | undefined
): FormattedChartData {
  const { labelField, valueField } = options

  if (!validateField(data, labelField) || !validateField(data, valueField)) {
    return { labels: [], datasets: [] }
  }

  // Exclure les lignes sans label valide (évite "Sans label" / "manque de données" sur le graphique)
  const filteredByLabel = data.filter(item => extractLabelValue(item, labelField) !== 'Sans label')
  // Pour les graphiques d'évolution temporelle (annee, numero_annee), garder les valeurs à 0
  // Sinon exclure les lignes avec valeur 0 (masquer les libellés sans valeurs à afficher)
  // Même traitement que les séries temporelles : conserver les 0 (TCAN par période intercensitaire)
  const isTimeSeries = ['annee', 'numero_annee', 'borne_temp', 'borne_temporelle'].includes(labelField)
  const filteredData = filteredByLabel.filter(item => {
    const val = extractNumericValue(item, valueField)
    if (Number.isNaN(val)) return false
    if (isTimeSeries) return true // Garder 0 pour les évolutions temporelles
    return val !== 0
  })
  if (filteredData.length === 0) return { labels: [], datasets: [] }

  const labels = filteredData.map(item => extractLabelValue(item, labelField))
  const values = extractValues(filteredData, valueField)
  const themeColors = getThemeColors(theme)

  const midColor = themeColors[Math.floor(themeColors.length / 2)] ?? themeColors[0] ?? '#888888'
  let barColors: string[]
  if (overrideColors) {
    if (Array.isArray(overrideColors)) {
      barColors = values.map(
        (_, index) => overrideColors[index % overrideColors.length] ?? midColor
      )
    } else {
      barColors = values.map(() => overrideColors)
    }
  } else {
    if (values.length === 0) {
      barColors = []
    } else if (values.length === 1) {
      barColors = [midColor]
    } else {
      const indicesWithValues = values.map((value, index) => ({ value, index }))
      indicesWithValues.sort((a, b) => a.value - b.value)
      barColors = new Array(values.length)
      indicesWithValues.forEach((item, rank) => {
        const maxRank = indicesWithValues.length - 1
        if (maxRank === 0) {
          barColors[item.index] = midColor
        } else {
          const colorIndex = Math.round((themeColors.length - 1) * (1 - rank / maxRank))
          barColors[item.index] = themeColors[colorIndex] ?? midColor
        }
      })
    }
  }

  return {
    labels,
    datasets: [{
      label: datasetLabel,
      data: values,
      backgroundColor: barColors,
      borderColor: 'transparent',
      borderWidth: 0,
      borderRadius: 8,
      borderSkipped: false
    }]
  }
}

/**
 * Formate les données pour un graphique multi-séries avec groupement dynamique
 * Ex. : Ventes par type de bien (séries = valeurs uniques d'un champ)
 */
export function formatMultiGrouped(
  data: RawDataItem[],
  theme: string,
  options: MultiGroupedOptions,
  overrideColors: string | string[] | null | undefined
): FormattedChartData {
  const { xAxisField, groupField, valueField } = options

  if (!validateField(data, xAxisField) || !validateField(data, groupField) || !validateField(data, valueField)) {
    return { labels: [], datasets: [] }
  }

  // Exclure les lignes sans label valide sur l'axe X ou le groupement
  const filteredData = data.filter(
    item =>
      extractLabelValue(item, xAxisField) !== 'Sans label' &&
      extractLabelValue(item, groupField) !== 'Sans label'
  )
  if (filteredData.length === 0) return { labels: [], datasets: [] }

  const uniqueLabels = extractUniqueLabels(filteredData, xAxisField, true)
  const uniqueGroups = extractUniqueLabels(filteredData, groupField, false)
  const themeColors = getThemeColors(theme)

  const datasets = uniqueGroups.map((groupValue, index) => {
    const groupData = filteredData.filter(item => extractLabelValue(item, groupField) === groupValue)
    const values = uniqueLabels.map(label => {
      const item = groupData.find(d => extractLabelValue(d, xAxisField) === label)
      return item ? extractNumericValue(item, valueField) : 0
    })
    const color = selectColor(index, themeColors, overrideColors)
    return {
      label: groupValue,
      data: values,
      backgroundColor: color,
      borderColor: 'transparent',
      borderWidth: 0,
      // Barres empilées : coins tous carrés. Pour cela, on force 0 sur chaque angle via un objet.
      // Chart.js n'arrondit que l'angle extérieur du dernier segment si on utilise un nombre.
      borderRadius: { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 },
      borderSkipped: false
    }
  }) as unknown as ChartDataset[]

  return { labels: uniqueLabels, datasets }
}
