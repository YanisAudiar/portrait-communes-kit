import type { ChartType } from 'chart.js'

const CHART_TYPES_BY_THEME: Record<string, ChartType> = {
  demographie: 'doughnut',
  habitat: 'doughnut',
  enseignement: 'bar',
  'economie-emploi': 'bar',
  solidarite: 'doughnut',
  'energie-environnement': 'bar',
  mobilites: 'bar',
  agriculture: 'bar',
  'equipement-services': 'bar'
}

/**
 * Retourne le type de graphique privilégié pour une thématique.
 * @param {string} themeId
 * @returns {ChartType}
 */
export const getChartTypeForTheme = (themeId: string): ChartType =>
  CHART_TYPES_BY_THEME[themeId] || 'doughnut'

export const themeChartTypes = CHART_TYPES_BY_THEME
