/**
 * Fonctions utilitaires pour les graphiques Chart.js
 * Centralise les fonctions de formatage et de manipulation d'options
 */

import { FONT_FAMILY, FONT_SIZES, FONT_WEIGHTS, COLORS, SPACING } from './chartConstants'

/**
 * Formate une valeur numérique avec séparateurs de milliers
 * @param {number|string} value - Valeur à formater
 * @param {Object} options - Options de formatage
 * @returns {string} Valeur formatée
 */
export function formatNumber(value: number | string, options: Intl.NumberFormatOptions = {}): string {
  if (typeof value !== 'number') {
    // Tentative de conversion si c'est une chaîne
    const parsed = parseFloat(String(value).replace(/,/g, '.'))
    if (isNaN(parsed)) return String(value)
    value = parsed
  }

  const {
    minimumFractionDigits = 0,
    maximumFractionDigits = value % 1 === 0 ? 0 : 1,
    useGrouping = true
  } = options

  return value.toLocaleString('fr-FR', {
    minimumFractionDigits,
    maximumFractionDigits,
    useGrouping
  })
}

/**
 * Valeurs affichées sur le graphique (datalabels : barres, segments pie/donut).
 * Toujours au plus 2 décimales pour éviter les flottants illisibles (ex. 33,333333).
 */
export function formatDataLabelNumber(value: number | string): string {
  if (typeof value !== 'number') {
    const parsed = parseFloat(String(value).replace(/,/g, '.'))
    if (isNaN(parsed)) return String(value)
    value = parsed
  }
  return value.toLocaleString('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    useGrouping: true
  })
}

/**
 * Pourcentage d’une part par rapport au total (0–100), max 2 décimales (pie / donut).
 */
export function formatDataLabelPercentOfTotal(numValue: number, total: number): string {
  if (total <= 0) return '0'
  const pct = (numValue / total) * 100
  return pct.toLocaleString('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })
}

/**
 * Formate une valeur en pourcentage
 * @param {number|string} value - Valeur à formater
 * @param {Object} options - Options de formatage
 * @returns {string} Valeur formatée avec le symbole %
 */
export function formatPercent(value: number | string, options: Intl.NumberFormatOptions = {}): string {
  const formatted = formatNumber(value, options)
  return `${formatted} %`
}

/** Longueur max du label dans les tooltips pour éviter d'occulter les chiffres */
const MAX_TOOLTIP_LABEL_LEN = 40

/**
 * Tronque un label long pour l'affichage dans les tooltips.
 * Évite que les libellés trop longs (ex: indicateurs habitat) masquent les valeurs.
 */
export function truncateForTooltip(label: string, maxLen = MAX_TOOLTIP_LABEL_LEN): string {
  if (!label || label.length <= maxLen) return label
  return label.slice(0, maxLen - 1) + '…'
}

/**
 * Fusionne profondément deux objets de configuration Chart.js
 * Gère correctement la fusion des plugins, scales, etc.
 * @param {Object} base - Configuration de base
 * @param {Object} override - Configuration à fusionner par-dessus
 * @returns {Object} Configuration fusionnée
 */
export function mergeChartOptions(base: Record<string, any>, override: Record<string, any>): Record<string, any> {
  if (!override) return base
  if (!base) return override

  const merged = { ...base }

  // Fusion des plugins
  if (override.plugins) {
    merged.plugins = {
      ...base.plugins,
      ...override.plugins
    }

    // Fusion profonde des plugins spécifiques
    Object.keys(override.plugins).forEach(key => {
      if (base.plugins && base.plugins[key] && typeof override.plugins[key] === 'object') {
        merged.plugins[key] = {
          ...base.plugins[key],
          ...override.plugins[key]
        }
      }
    })
  }

  // Fusion des scales
  if (override.scales) {
    merged.scales = { ...base.scales }
    Object.keys(override.scales).forEach(axis => {
      merged.scales[axis] = {
        ...(base.scales?.[axis] || {}),
        ...override.scales[axis]
      }

      // Fusion profonde des ticks
      if (override.scales[axis].ticks) {
        merged.scales[axis].ticks = {
          ...(base.scales?.[axis]?.ticks || {}),
          ...override.scales[axis].ticks
        }

        // Fusion profonde de la font dans ticks
        if (override.scales[axis].ticks.font) {
          merged.scales[axis].ticks.font = {
            ...(base.scales?.[axis]?.ticks?.font || {}),
            ...override.scales[axis].ticks.font
          }
        }
      }

      // Fusion profonde de grid
      if (override.scales[axis].grid) {
        merged.scales[axis].grid = {
          ...(base.scales?.[axis]?.grid || {}),
          ...override.scales[axis].grid
        }
      }

      // Fusion profonde de border
      if (override.scales[axis].border) {
        merged.scales[axis].border = {
          ...(base.scales?.[axis]?.border || {}),
          ...override.scales[axis].border
        }
      }
    })
  }

  // Fusion des autres propriétés
  Object.keys(override).forEach(key => {
    if (key !== 'plugins' && key !== 'scales') {
      if (typeof override[key] === 'object' && !Array.isArray(override[key]) && base[key]) {
        merged[key] = { ...base[key], ...override[key] }
      } else {
        merged[key] = override[key]
      }
    }
  })

  return merged
}

/**
 * Crée une configuration d'axe standardisée
 * @param {Object} overrides - Surcharges spécifiques
 * @returns {Object} Configuration d'axe
 */
export function createAxisConfig(overrides: Record<string, any> = {}) {
  const {
    beginAtZero = false,
    stacked = false,
    ticks = {},
    grid = {},
    border = {}
  } = overrides

  return {
    beginAtZero,
    stacked,
    ticks: {
      font: {
        family: FONT_FAMILY,
        size: FONT_SIZES.body,
        weight: FONT_WEIGHTS.normal
      },
      color: COLORS.text.secondary,
      padding: SPACING.ticks.default,
      ...ticks
    },
    grid: {
      display: false,
      ...grid
    },
    border: {
      display: false,
      ...border
    }
  }
}

/**
 * Extrait la source depuis une description (format: "... (Source: ...)")
 * @param {string} description - Description contenant potentiellement la source
 * @param {string} defaultSource - Source par défaut si non trouvée
 * @returns {string} Source extraite
 */
export function extractSourceFromDescription(description: string, defaultSource: string = 'Insee'): string {
  if (!description) return defaultSource
  const match = description.match(/\(Source:\s*(.+?)\)/)
  const captured = match?.[1]
  return captured !== undefined ? captured.trim() : defaultSource
}
