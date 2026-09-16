/**
 * Correctifs pour le graphique « Évolution <20 ans / 60+ » (effectifs en personnes).
 * Garantit axe Y en nombres (pas %) et légende visible malgré merges Chart.js.
 */
import { formatNumber } from './chartHelpers'

export const CHART_ID_DEMO_EVOLUTION_AGE = 'demo-evolution-age'

/**
 * Applique l’axe Y formatNumber et force la légende si showLegend !== false.
 */
export function applyDemoEvolutionAgeAxisAndLegend(
  options: Record<string, unknown>,
  showLegend: boolean | undefined
): Record<string, unknown> {
  const merged = { ...options }
  const scales = { ...((merged.scales as Record<string, unknown>) || {}) }
  const y = { ...((scales.y as Record<string, unknown>) || {}) }
  const ticks = { ...((y.ticks as Record<string, unknown>) || {}) }
  y.ticks = {
    ...ticks,
    callback: function (value: string | number) {
      return formatNumber(typeof value === 'number' ? value : parseFloat(String(value)) || 0)
    }
  }
  scales.y = y
  merged.scales = scales

  if (showLegend !== false) {
    const plugins = { ...((merged.plugins as Record<string, unknown>) || {}) }
    plugins.legend = {
      ...((plugins.legend as Record<string, unknown>) || {}),
      display: true
    }
    merged.plugins = plugins
  }

  return merged
}
