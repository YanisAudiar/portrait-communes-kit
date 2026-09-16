import { getIndicatorsByTheme } from '@/config/indicatorsConfig'
import { getChartPreset } from '@/services/chart/chartPresets'
import { extractSourceFromDescription } from '@/services/chart/chartHelpers'
import { mergeChartOptions } from '@/services/chart/chartHelpers'
import { siteConfig } from '@/config/site'

/**
 * Composable pour générer dynamiquement les layouts de print basés sur les données réelles
 * Ce système utilise la même logique que useThemeCharts pour garantir que les mêmes graphiques
 * apparaissent dans le PDF que dans l'application.
 */

/**
 * Mapping des badges numérotés par thème
 */
const THEME_BADGES = {
  demographie: '1',
  habitat: '2',
  'economie-emploi': '3',
  enseignement: '4',
  solidarite: '5',
  environnement: '6',
  agriculture: '7'
}

/**
 * Organise les graphiques en groupes de 4 maximum par page (grille 2x2)
 * @param {Array} charts - Liste des graphiques à organiser
 * @returns {Array} Groupes de graphiques
 */
const organizeChartsIntoGroups = (charts) => {
  const CHARTS_PER_PAGE = 4
  const groups = []

  if (charts.length === 0) {
    return groups
  }

  // Organiser les graphiques par groupes de 4
  for (let i = 0; i < charts.length; i += CHARTS_PER_PAGE) {
    const groupCharts = charts.slice(i, i + CHARTS_PER_PAGE)

    groups.push({
      title: '',
      description: '',
      charts: groupCharts,
      text: ''
    })
  }

  return groups
}

/**
 * Génère la configuration d'un graphique à partir de sa définition d'indicateur et des données.
 * Même logique que dans useThemeCharts.js
 * @param {Object} indicator - Définition de l'indicateur (config)
 * @param {Object} themeData - Données brutes du thème reçues de l'API
 * @returns {Object|null} Configuration du graphique ou null si pas de données
 */
const createChartConfig = (indicator, themeData) => {
  if (!themeData || !indicator.chartType) return null

  // LOGIQUE UNIVERSELLE : Utilisation de la propriété dataSource définie dans la config
  let dataSource = []

  if (indicator.dataSource) {
    dataSource = themeData[indicator.dataSource]
    if (!dataSource) {
      return null
    }
  } else {
    return null
  }

  if (!Array.isArray(dataSource) || dataSource.length === 0) {
    return null
  }

  // Extraire la source depuis la description
  const chartSource = indicator.source || extractSourceFromDescription(indicator.description)

  // Gestion des configurations prédéfinies Chart.js
  let chartOptions = {}
  if (indicator.chartPreset) {
    const preset = getChartPreset(indicator.chartPreset)
    if (preset) {
      chartOptions = indicator.options
        ? mergeChartOptions(preset, indicator.options)
        : preset
    } else {
      chartOptions = indicator.options || {}
    }
  } else {
    chartOptions = indicator.options || {}
  }

  // Construction de la configuration du graphique
  if (indicator.datasets && Array.isArray(indicator.datasets)) {
    return {
      indicatorId: indicator.id,
      title: indicator.label,
      type: indicator.chartType,
      data: dataSource,
      theme: 'premium',
      datasetLabel: indicator.label,
      showLegend: true,
      source: chartSource,
      chartOptions: chartOptions,
      datasets: indicator.datasets,
      labelField: indicator.labelField || indicator.groupBy || 'annee'
    }
  }

  // Cas mono-série
  return {
    indicatorId: indicator.id,
    title: indicator.label,
    type: indicator.chartType,
    data: dataSource,
    theme: 'premium',
    datasetLabel: indicator.label,
    showLegend: ['doughnut', 'pie'].includes(indicator.chartType),
    source: chartSource,
    labelField: indicator.labelField || indicator.groupBy || 'label',
    valueField: indicator.apiField || 'value',
    chartOptions: chartOptions
  }
}

/**
 * Génère un layout dynamique pour un thème basé sur les données disponibles
 * Utilise la même logique que useThemeCharts pour obtenir les graphiques configurés
 * @param {Object} theme - Configuration du thème depuis indicatorsConfig
 * @param {Object} chartDataByTheme - Données de graphiques par thème (objet avec clés par thème)
 * @param {Array} evolutionData - Données d'évolution temporelle (optionnel)
 * @returns {Object} Layout généré dynamiquement
 */
export const generateDynamicLayout = (theme, chartDataByTheme = {}, _evolutionData = []) => {
  if (!theme || !theme.id) {
    return null
  }

  const themeData = chartDataByTheme[theme.id]
  if (!themeData) {
    return null
  }

  // Récupérer tous les indicateurs configurés pour ce thème (hors available: false)
  const indicators = getIndicatorsByTheme(theme.id).filter((ind) => ind.available !== false)

  if (!indicators || indicators.length === 0) {
    return null
  }

  // Générer une configuration de graphique pour chaque indicateur disponible
  const chartsConfig = indicators
    .map(indicator => createChartConfig(indicator, themeData))
    .filter(config => config !== null)

  if (!chartsConfig || chartsConfig.length === 0) {
    return null
  }

  // Convertir les configurations de graphiques en format pour le print
  const charts = chartsConfig.map((chartConfig, index) => ({
    id: chartConfig.title?.toLowerCase().replace(/\s+/g, '-') || `chart-${theme.id}-${index}`,
    indicatorId: chartConfig.indicatorId,
    title: chartConfig.title,
    type: chartConfig.type,
    data: chartConfig.data,
    showLegend: chartConfig.showLegend !== false,
    chartOptions: chartConfig.chartOptions,
    labelField: chartConfig.labelField,
    valueField: chartConfig.valueField,
    datasets: chartConfig.datasets,
    source: chartConfig.source
  }))

  // Organiser les graphiques en groupes de 4 maximum par page (grille 2x2)
  const chartGroups = organizeChartsIntoGroups(charts)

  // Générer le layout complet
  return {
    badge: THEME_BADGES[theme.id] || '1',
    themeTag: theme.label.toUpperCase(),
    title: theme.label.toUpperCase(),
    subtitle: theme.description || '',
    color: theme.color || '#7067A3',
    summary: `Visualisation des données disponibles pour la thématique ${theme.label.toLowerCase()}.`,
    chartGroups: chartGroups,
    footnote: `Source : ${siteConfig.agency.name} - Données générées automatiquement`
  }
}

/**
 * Composable principal pour utiliser les layouts dynamiques
 * @param {import('vue').Ref<Object>} chartData - Données des graphiques par thème
 * @param {import('vue').Ref<Array>} evolutionData - Données d'évolution
 * @returns {Object} Fonctions utilitaires pour générer les layouts
 */
export function useDynamicPrintLayout(chartData, evolutionData) {
  /**
   * Génère un layout dynamique pour un thème donné
   * Utilise la même logique que useThemeCharts pour garantir la cohérence
   * @param {Object} theme - Configuration du thème
   * @returns {Object} Layout généré dynamiquement
   */
  const getLayoutForTheme = (theme) => {
    if (!theme || !theme.id) {
      console.warn('⚠️ [PrintLayout] Thème invalide:', theme)
      return null
    }

    // Passer toutes les données de graphiques (objet complet) et les données d'évolution
    const allChartData = chartData.value || {}
    const evoData = evolutionData.value || []

    // Vérifier que le thème a des données
    if (!allChartData[theme.id]) {
      console.warn(`⚠️ [PrintLayout] Aucune donnée pour le thème ${theme.id}`)
      return null
    }

    const layout = generateDynamicLayout(theme, allChartData, evoData)
    if (!layout) {
      console.warn(`⚠️ [PrintLayout] Layout non généré pour ${theme.id}`)
      return null
    }

    return layout
  }

  /**
   * Compte le nombre total de graphiques pour un layout
   * @param {Object} layout - Layout à analyser
   * @returns {number} Nombre de graphiques
   */
  const countChartsInLayout = (layout) => {
    if (!layout || !layout.chartGroups) {
      return 0
    }

    return layout.chartGroups.reduce((total, group) => {
      return total + (group.charts?.length || 0)
    }, 0)
  }

  /**
   * Vérifie si un thème a des données disponibles pour l'export
   * @param {Object} theme - Configuration du thème
   * @returns {boolean} True si des données sont disponibles
   */
  const hasDataForTheme = (theme) => {
    if (!theme || !theme.id) {
      return false
    }

    const themeChartData = chartData.value?.[theme.id]
    return themeChartData && themeChartData.length > 0
  }

  return {
    getLayoutForTheme,
    countChartsInLayout,
    hasDataForTheme,
    generateDynamicLayout
  }
}

