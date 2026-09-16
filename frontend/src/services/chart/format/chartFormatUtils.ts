/**
 * Utilitaires partagés pour le formatage des données Chart.js
 * - Classification du mode (single / multi-explicit / multi-grouped / circular)
 * - Helpers d'extraction (labels, valeurs, couleurs)
 * - Formatage multi-séries explicite (bar + line)
 */
import { getThemeColors } from '../chartColors'
import type {
  ChartDataOptions,
  ChartType,
  RawDataItem,
  DatasetConfig,
  FormattedChartData,
  ChartDataset,
  FormatOptions,
  SingleSeriesOptions,
  MultiExplicitOptions,
  MultiGroupedOptions,
  CircularOptions
} from '../chartTypes'
import {
  validateField,
  extractNumericValue,
  extractLabelValue
} from '../chartTypes'

/**
 * Classifie le mode de formatage selon le type de graphique et les options
 */
export function classifyChartMode(
  chartType: ChartType,
  options: Partial<ChartDataOptions>
): FormatOptions {
  const { datasets, labelField = 'label', groupByField, valueField = 'value' } = options

  if (chartType === 'pie' || chartType === 'doughnut') {
    return { mode: 'circular', labelField, valueField } as CircularOptions
  }

  if (groupByField && valueField) {
    return {
      mode: 'multi-grouped',
      xAxisField: labelField,
      groupField: groupByField,
      valueField
    } as MultiGroupedOptions
  }

  if (datasets && Array.isArray(datasets) && datasets.length > 0) {
    return { mode: 'multi-explicit', labelField, datasets } as MultiExplicitOptions
  }

  return { mode: 'single', labelField, valueField } as SingleSeriesOptions
}

/**
 * Filtre les données pour ne garder que l'année la plus récente (ex. graphiques circulaires)
 */
export function filterLatestData(data: RawDataItem[]): RawDataItem[] {
  if (!data || data.length === 0) return []

  const sample = data[0]
  if (sample === undefined) return []
  const yearFields = ['annee', 'numero_annee', 'date', 'annee_recensement', 'year']
  const yearField = yearFields.find(key => key in sample)

  if (yearField) {
    const initialValue = sample[yearField]
    if (initialValue === null || initialValue === undefined) return data

    const maxYear = data.reduce((max, item) => {
      const val = item[yearField]
      if (val === null || val === undefined) return max
      if (max === null || max === undefined) return val
      return val > max ? val : max
    }, initialValue)

    return data.filter(item => item[yearField] === maxYear)
  }

  return data
}

/**
 * Extrait les labels uniques et les trie
 */
export function extractUniqueLabels(
  data: RawDataItem[],
  labelField: string,
  sortNumeric: boolean = false
): string[] {
  const labels = [...new Set(data.map(item => extractLabelValue(item, labelField)))]
    .filter(label => label !== 'Sans label') // Exclure les labels invalides
  if (sortNumeric) return labels.sort((a, b) => Number(a) - Number(b))
  return labels.sort()
}

/**
 * Extrait les valeurs numériques depuis un tableau de données
 */
export function extractValues(data: RawDataItem[], valueField: string): number[] {
  return data.map(item => extractNumericValue(item, valueField))
}

/**
 * Sélectionne une couleur selon le thème ou les couleurs personnalisées
 */
export function selectColor(
  index: number,
  themeColors: string[],
  overrideColors: string | string[] | null | undefined
): string {
  const fallback = themeColors[0] ?? '#888888'
  if (overrideColors && Array.isArray(overrideColors)) {
    return overrideColors[index % overrideColors.length] ?? fallback
  }
  return themeColors[index % themeColors.length] ?? fallback
}

/**
 * Formate les données pour un graphique multi-séries explicite (bar ou line)
 * Ex. : Naissances et décès (datasets définis dans la config)
 * Si pyramid === true : premier dataset en valeurs négatives pour effet miroir (pyramide des âges).
 */
export function formatMultiExplicit(
  data: RawDataItem[],
  theme: string,
  options: MultiExplicitOptions,
  overrideColors: string | string[] | null | undefined,
  chartType: ChartType,
  pyramid: boolean = false
): FormattedChartData {
  const { labelField, datasets: datasetsConfig } = options

  if (!validateField(data, labelField)) return { labels: [], datasets: [] }

  for (const dsConfig of datasetsConfig) {
    if (!validateField(data, dsConfig.code)) return { labels: [], datasets: [] }
  }

  // Exclure les lignes sans label valide (évite "Sans label" sur le graphique)
  const filteredData = data.filter(item => extractLabelValue(item, labelField) !== 'Sans label')
  if (filteredData.length === 0) return { labels: [], datasets: [] }

  /** Périodes type « 2011-2017 » : tri chronologique sur la 1re année */
  const firstYearFromPeriod = (val: string): number => {
    const m = String(val).match(/(19|20)\d{2}/)
    return m ? parseInt(m[0], 10) : Number.MAX_SAFE_INTEGER
  }

  const sortedData = [...filteredData].sort((a, b) => {
    const valA = extractLabelValue(a, labelField)
    const valB = extractLabelValue(b, labelField)
    if (labelField === 'borne_temporelle' || labelField === 'borne_temp') {
      return firstYearFromPeriod(valA) - firstYearFromPeriod(valB)
    }
    const numA = Number(valA)
    const numB = Number(valB)
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB
    return valA.localeCompare(valB)
  })

  const labels = sortedData.map(item => extractLabelValue(item, labelField))
  const themeColors = getThemeColors(theme)
  const isLine = chartType === 'line'

  const datasets: ChartDataset[] = datasetsConfig.map((dsConfig, index) => {
    let values = extractValues(sortedData, dsConfig.code)
    if (pyramid && !isLine) {
      if (index === 0) {
        values = values.map(v => -Math.abs(v))
      } else {
        values = values.map(v => Math.abs(v))
      }
    }
    const color = selectColor(index, themeColors, overrideColors)

    if (isLine) {
      return {
        label: dsConfig.label,
        data: values,
        backgroundColor: 'transparent',
        borderColor: color,
        borderWidth: 2
      }
    }

    return {
      label: dsConfig.label,
      data: values,
      backgroundColor: color,
      borderColor: 'transparent',
      borderWidth: 0,
      borderRadius: 4,
      borderSkipped: false
    }
  })

  return { labels, datasets }
}
