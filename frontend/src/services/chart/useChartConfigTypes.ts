/**
 * Types partagés pour useChartConfig et ses modules print / responsive
 */

/** Barres, camembert, donut : étiquettes de valeurs uniquement en vue /share (desktop). */
export const CHART_TYPES_SHARE_DATALABELS = ['bar', 'pie', 'doughnut'] as const

export function chartTypeUsesShareOnlyDataLabels(type: string): boolean {
  return (CHART_TYPES_SHARE_DATALABELS as readonly string[]).includes(type)
}

export interface ChartConfigProps {
  type: string
  showLegend?: boolean
  isPrintMode?: boolean
  printPalette?: PrintPalette
  chartOptions?: ChartOptionsConfig
  /** ID indicateur (ex. demo-evolution-age) pour correctifs ciblés axe / légende */
  chartId?: string
  /**
   * Vue partage (/share) : afficher les valeurs sur barres / pie / doughnut (desktop uniquement).
   * Sur la fiche commune, pas d’étiquettes sur ces types.
   */
  showShareDataLabels?: boolean
}

export interface PrintPalette {
  legend?: { color?: string; fontSize?: number }
  datalabels?: { color?: string; fontSize?: number; anchor?: string; align?: string }
  fontFamily?: string
}

export interface ChartOptionsConfig {
  plugins?: Record<string, unknown>
  scales?: ScalesConfig
  [key: string]: unknown
}

export interface ScalesConfig {
  x?: ScaleConfig
  y?: ScaleConfig
}

export interface ScaleConfig {
  stacked?: boolean
  ticks?: Record<string, unknown>
  [key: string]: unknown
}
