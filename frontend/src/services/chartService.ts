/**
 * Service principal pour les graphiques Chart.js
 * Point d'entrée centralisé qui réexporte tous les modules
 * Refactorisé pour respecter la limite de 200 lignes par fichier
 * Divisé par responsabilité en modules séparés
 */

// Enregistrement des composants Chart.js (doit être fait en premier)
import './chart/chartRegistration'

// Import local pour créer l'alias
import { SimpleChart } from './chart/chartInstance'

// Réexport de tous les modules pour compatibilité
export { premiumColors, themeColors, getThemeColors } from './chart/chartColors'
export { defaultOptions, getTypeSpecificOptions } from './chart/chartConfig'
export { formatDataForChart } from './chart/chartDataFormatter'
export { SimpleChart, createSimpleChart } from './chart/chartInstance'
export { typesChartAvailable, isValidChartType, normalizeChartData } from './chart/chartUtils'

// Alias pour compatibilité
export const ChartVisualization = SimpleChart
