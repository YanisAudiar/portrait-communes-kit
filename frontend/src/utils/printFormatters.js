/**
 * Utilitaires de formatage pour les exports PDF
 * Fonctions pour formater les nombres, dates, etc.
 */

/**
 * Formate un nombre avec séparateurs français
 * @param {number|string} value - Valeur à formater
 * @returns {string} Nombre formaté
 */
export const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return 'N/A'
  return new Intl.NumberFormat('fr-FR').format(value)
}

/**
 * Formate une date en format français
 * @param {Date|string|number} date - Date à formater
 * @param {Object} options - Options de formatage
 * @returns {string} Date formatée
 */
export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }
  
  const dateObj = date instanceof Date ? date : new Date(date)
  
  return new Intl.DateTimeFormat('fr-FR', { ...defaultOptions, ...options }).format(dateObj)
}

/**
 * Formate un pourcentage
 * @param {number} value - Valeur entre 0 et 1 ou 0 et 100
 * @param {boolean} isDecimal - Si true, la valeur est entre 0 et 1
 * @returns {string} Pourcentage formaté
 */
export const formatPercent = (value, isDecimal = false) => {
  if (value === null || value === undefined) return 'N/A'
  const numValue = isDecimal ? value * 100 : value
  return `${numValue.toFixed(1)}%`
}

