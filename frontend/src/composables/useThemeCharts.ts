/**
 * Composable pour générer les configurations de graphiques selon le thème actif
 *
 * ARCHITECTURE :
 * - Normalisation des données déléguée à chartDataNormalization.ts
 * - Création des datasets dynamiques déléguée à chartDataFormatter
 * - Ce composable se concentre sur le mapping indicateur → config graphique
 */
import { getIndicatorsByTheme } from '@/config/indicatorsConfig'
import { getChartPreset } from '@/services/chart/chartPresets'
import { extractSourceFromDescription, mergeChartOptions } from '@/services/chart/chartHelpers'
import { getMaxYearFromData, normalizeDataSource } from './chartDataNormalization'
import type { Ref } from 'vue'
import type { DatasetConfig } from '@/services/chart/chartTypes'

/**
 * Configuration d'un indicateur depuis les fichiers de config
 */
export interface IndicatorConfig {
  id: string
  label: string
  description?: string
  chartType: string
  dataSource?: string
  labelField?: string
  groupBy?: string
  apiField?: string
  source?: string
  chartPreset?: string
  options?: Record<string, unknown>
  chartTheme?: string
  datasets?: DatasetConfig[]
  subtheme?: string
  showLegend?: boolean
  available?: boolean
  yearForTitleOverride?: number
}

/** IDs des indicateurs pour lesquels afficher l'année dans le titre */
const INDICATORS_WITH_YEAR_IN_TITLE = [
  'demo-repartition-menages',
  'demo-repartition-activite-15-64',
  'habitat-statut-occupation',
  'habitat-evol-logts-commences',
  'habitat-evol-part-collectif-commences',
  'habitat-evol-ventes-occasion-type',
  'habitat-evol-prix-maison-occas',
  'habitat-evol-prix-m2-appart-occas',
  'eco-creation-etablissements-type',
  'emploi-repartition-csp',
  'emploi-repartition-secteur',
  'emploi-lieu-travail',
  'solid-revenus-disponibles',
  'solid-origine-revenus'
]

/**
 * Configuration de sortie pour un graphique
 */
export interface ChartConfig {
  id: string
  title: string
  type: string
  data: unknown[]
  theme: string
  themeId: string
  datasetLabel: string
  showLegend: boolean
  source?: string
  chartOptions: Record<string, unknown>
  datasets?: DatasetConfig[]
  labelField: string
  valueField?: string
  groupByField?: string
  yearForTitle?: number | null
}

function needsDynamicGrouping(indicator: IndicatorConfig): boolean {
  return (
    indicator.chartType !== 'pie' &&
    indicator.chartType !== 'doughnut' &&
    !!indicator.labelField &&
    !!indicator.groupBy &&
    indicator.labelField !== indicator.groupBy &&
    !!indicator.apiField &&
    !indicator.datasets
  )
}

/**
 * Génère la configuration d'un graphique à partir de sa définition d'indicateur
 */
export const createChartConfig = (
  indicator: IndicatorConfig,
  themeData: Record<string, unknown>,
  themeId: string
): ChartConfig | null => {
  if (!themeData || !indicator.chartType || !indicator.dataSource) return null

  const rawSource = themeData[indicator.dataSource] as unknown[]
  if (!Array.isArray(rawSource) || rawSource.length === 0) return null

  // Appliquer toutes les normalisations centralisées
  const dataSource = normalizeDataSource(rawSource, indicator.dataSource, indicator.groupBy)

  // Vérifier qu'au moins une ligne a des valeurs exploitables
  if (indicator.apiField) {
    const valueField = indicator.apiField
    const labelField = indicator.labelField || indicator.groupBy || 'label'
    const hasValidData = dataSource.some((value: unknown) => {
      const item = value as Record<string, unknown>
      const val = item?.[valueField]
      const label = item?.[labelField]
      return val != null && val !== '' && (label != null || ['annee', 'numero_annee'].includes(labelField))
    })
    if (!hasValidData) return null
  }

  const chartSource = indicator.source || extractSourceFromDescription(indicator.description || '')

  let chartOptions: Record<string, unknown> = {}
  if (indicator.chartPreset) {
    const preset = getChartPreset(indicator.chartPreset)
    chartOptions = preset
      ? (indicator.options ? mergeChartOptions(preset, indicator.options) : preset)
      : (indicator.options || {})
  } else {
    chartOptions = indicator.options || {}
  }

  const activeChartTheme = indicator.chartTheme || themeId || 'premium'

  let yearForTitle: number | null | undefined = undefined
  if (indicator.yearForTitleOverride != null && !Number.isNaN(Number(indicator.yearForTitleOverride))) {
    yearForTitle = Number(indicator.yearForTitleOverride)
  } else if (INDICATORS_WITH_YEAR_IN_TITLE.includes(indicator.id)) {
    yearForTitle = getMaxYearFromData(dataSource)
  }

  const base = {
    id: indicator.id,
    title: indicator.label,
    type: indicator.chartType,
    data: dataSource,
    theme: activeChartTheme,
    themeId,
    datasetLabel: indicator.label,
    source: chartSource,
    chartOptions,
    yearForTitle
  }

  // CAS 1: Groupement dynamique
  if (needsDynamicGrouping(indicator)) {
    return {
      ...base,
      showLegend: indicator.showLegend !== false,
      labelField: indicator.groupBy!,
      valueField: indicator.apiField!,
      groupByField: indicator.labelField!
    }
  }

  // CAS 2: Multi-séries explicite
  if (indicator.datasets && Array.isArray(indicator.datasets)) {
    return {
      ...base,
      showLegend: indicator.showLegend !== false,
      datasets: indicator.datasets,
      labelField: indicator.labelField || indicator.groupBy || 'annee'
    }
  }

  // CAS 3: Mono-série ou circulaire
  const isCircular = ['doughnut', 'pie'].includes(indicator.chartType)
  return {
    ...base,
    showLegend: isCircular,
    labelField: indicator.labelField || indicator.groupBy || 'label',
    valueField: indicator.apiField || 'value'
  }
}

/**
 * Composable pour générer les configurations de graphiques selon le thème actif
 */
export function useThemeCharts(
  activeTheme: Ref<string>,
  chartData: Ref<Record<string, unknown>>,
  _evolutionData: unknown,
  _currentThemeName: unknown,
  selectedSubtheme: Ref<string | null> | null = null
) {
  const getChartsForTheme = (): ChartConfig[] => {
    const themeId = activeTheme.value
    const themeData = chartData.value[themeId] as Record<string, unknown> | undefined

    if (!themeData) return []

    let indicators = getIndicatorsByTheme(themeId) as unknown as IndicatorConfig[]

    if (selectedSubtheme?.value) {
      indicators = indicators.filter(indicator => indicator.subtheme === selectedSubtheme.value)
    }

    indicators = indicators.filter(indicator => indicator.available !== false)

    return indicators
      .map(indicator => createChartConfig(indicator, themeData, themeId))
      .filter((config): config is ChartConfig => config !== null)
  }

  return { getChartsForTheme }
}
