/**
 * Utilitaires pour les graphiques dans les exports PDF
 * Fonctions pour calculer les dimensions et résoudre les datasets
 */

/**
 * Dimensions par défaut pour les graphiques en mode print
 */
export const PRINT_CHART_DIMENSIONS = {
  DONUT: {
    width: 340,
    height: 340
  },
  BAR: {
    width: 380,
    height: 300
  },
  LINE: {
    width: 400,
    height: 280
  }
}

/**
 * Détermine la largeur optimale selon le type de graphique
 * @param {Object} chart - Configuration du graphique
 * @param {Function} getChartTypeForTheme - Fonction pour obtenir le type par défaut
 * @param {string} themeId - ID de la thématique
 * @param {Object} dimensions - Dimensions personnalisées
 * @returns {number} Largeur en pixels
 */
export const getChartWidth = (chart, getChartTypeForTheme, themeId, dimensions = {}) => {
  if (chart.printWidth) return chart.printWidth
  
  const chartType = chart.type || getChartTypeForTheme(themeId)
  
  // Graphiques donut/pie : dimensions carrées
  if (chartType === 'doughnut' || chartType === 'pie') {
    return dimensions.printDonutWidth || PRINT_CHART_DIMENSIONS.DONUT.width
  }
  
  // Graphiques line : plus larges
  if (chart.dataset === 'evolution' || chartType === 'line') {
    return dimensions.printLineChartWidth || PRINT_CHART_DIMENSIONS.LINE.width
  }
  
  // Graphiques bar : dimensions rectangulaires
  return dimensions.printChartWidth || PRINT_CHART_DIMENSIONS.BAR.width
}

/**
 * Détermine la hauteur optimale selon le type de graphique
 * @param {Object} chart - Configuration du graphique
 * @param {Function} getChartTypeForTheme - Fonction pour obtenir le type par défaut
 * @param {string} themeId - ID de la thématique
 * @param {Object} dimensions - Dimensions personnalisées
 * @returns {number} Hauteur en pixels
 */
export const getChartHeight = (chart, getChartTypeForTheme, themeId, dimensions = {}) => {
  if (chart.printHeight) return chart.printHeight
  
  const chartType = chart.type || getChartTypeForTheme(themeId)
  
  // Graphiques donut/pie : dimensions carrées
  if (chartType === 'doughnut' || chartType === 'pie') {
    return dimensions.printDonutHeight || PRINT_CHART_DIMENSIONS.DONUT.height
  }
  
  // Graphiques line : moins hauts
  if (chart.dataset === 'evolution' || chartType === 'line') {
    return dimensions.printLineChartHeight || PRINT_CHART_DIMENSIONS.LINE.height
  }
  
  // Graphiques bar : dimensions rectangulaires
  return dimensions.printChartHeight || PRINT_CHART_DIMENSIONS.BAR.height
}

/**
 * Résout le dataset pour un graphique
 * @param {Object} chart - Configuration du graphique
 * @param {Array} chartData - Données de graphiques par défaut
 * @param {Array} evolutionData - Données d'évolution
 * @param {Function} getDatasetByKey - Fonction pour récupérer un dataset par clé
 * @returns {Array} Dataset résolu
 */
export const resolveDataset = (chart, chartData, evolutionData, getDatasetByKey) => {
  if (chart.dataset === 'evolution') {
    return evolutionData
  }

  if (chart.datasetKey) {
    return getDatasetByKey(chart.datasetKey)
  }

  if (Array.isArray(chart.data)) {
    return chart.data
  }

  return chartData
}

