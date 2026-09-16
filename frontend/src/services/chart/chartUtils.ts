/**
 * Utilitaires pour les graphiques Chart.js
 * Fonctions de validation et de normalisation des données
 */

// Types de graphiques supportés
export const typesChartAvailable = [
  'bar',
  'line', 
  'pie',
  'doughnut',
  'radar',
  'polarArea'
]

/**
 * Valide si un type de graphique est supporté
 * @param {string} type - Type de graphique à valider
 * @returns {boolean} True si le type est valide
 */
export function isValidChartType(type: string): boolean {
  return typesChartAvailable.includes(type)
}

/**
 * Normalise les données d'entrée pour les graphiques
 * @param {Array} data - Données à normaliser
 * @returns {Array} Données normalisées
 */
export function normalizeChartData(data: any[]): any[] {
  if (!data || !Array.isArray(data)) {
    return []
  }
  
  return data.filter(item => 
    item && 
    typeof item === 'object' && 
    Object.keys(item).length > 0
  )
}
