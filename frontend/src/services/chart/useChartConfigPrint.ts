/**
 * Configuration Chart.js spécifique au mode impression (PDF / print)
 * Légende, datalabels, échelles et options globales pour l'export
 */
import type { ChartConfigProps, PrintPalette, ChartOptionsConfig, ScalesConfig } from './useChartConfigTypes'

/**
 * Formate une valeur numérique selon le type de graphique (fr-FR)
 */
const formatValue = (value: unknown, chartType: string): string => {
  if (typeof value !== 'number') return String(value)
  const grouping =
    chartType === 'bar' || chartType === 'pie' || chartType === 'doughnut'
  const formatter = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    useGrouping: grouping
  })
  return formatter.format(value)
}

/**
 * Configure les options de légende pour le mode impression
 */
export function buildPrintLegendConfig(
  palette: PrintPalette,
  basePlugins: Record<string, unknown>,
  customPlugins: Record<string, unknown>
): Record<string, unknown> {
  const legendBase = (basePlugins.legend || {}) as Record<string, unknown>
  const legendCustom = (customPlugins.legend || {}) as Record<string, unknown>
  const legendColor = palette.legend?.color || '#2c3e50'
  const legendFontSize = palette.legend?.fontSize || 12
  const fontFamily = palette.fontFamily || "'Montserrat', 'Segoe UI', sans-serif"

  return {
    ...legendBase,
    ...legendCustom,
    display: true,
    align: 'center',
    labels: {
      ...((legendBase.labels as Record<string, unknown>) || {}),
      ...((legendCustom.labels as Record<string, unknown>) || {}),
      font: {
        ...(((legendBase.labels as Record<string, unknown>)?.font as Record<string, unknown>) || {}),
        ...(((legendCustom.labels as Record<string, unknown>)?.font as Record<string, unknown>) || {}),
        size: legendFontSize,
        weight: '600',
        family: fontFamily
      },
      color: legendColor,
      padding: 18,
      usePointStyle: true,
      boxWidth: 14
    },
    position: 'bottom'
  }
}

/**
 * Configure les options de datalabels pour le mode impression
 */
export function buildPrintDatalabelsConfig(
  chartType: string,
  palette: PrintPalette
): Record<string, unknown> {
  if (chartType === 'bar') {
    return { display: false }
  }

  let datalabelsColor = palette.datalabels?.color || '#2c3e50'
  let datalabelFontSize = palette.datalabels?.fontSize || 11
  let datalabelAnchor = palette.datalabels?.anchor || 'end'
  let datalabelAlign = palette.datalabels?.align || 'top'

  const fontFamily = palette.fontFamily || "'Montserrat', 'Segoe UI', sans-serif"

  return {
    color: datalabelsColor,
    anchor: datalabelAnchor,
    align: datalabelAlign,
    font: {
      size: datalabelFontSize,
      weight: '600',
      family: fontFamily
    },
    formatter: (value: unknown) =>
      formatValue(
        typeof value === 'object' && value !== null ? (value as { value?: unknown }).value : value,
        chartType
      ),
    clamp: true
  }
}

/**
 * Configure les options d'échelles (x/y) pour le mode impression
 */
export function buildPrintScalesConfig(
  chartType: string,
  baseOptions: Record<string, unknown>,
  chartOptions: ChartOptionsConfig | undefined,
  legendColor: string,
  fontFamily: string
): Record<string, unknown> | undefined {
  if (chartType === 'doughnut' || chartType === 'pie') return undefined

  const baseScales = (baseOptions.scales || {}) as ScalesConfig
  const customScales = chartOptions?.scales || {}
  const indexAxis = (chartOptions as Record<string, unknown> | undefined)?.indexAxis
  const isHorizontalBar = chartType === 'bar' && indexAxis === 'y'

  const yTicks: Record<string, unknown> = {
    ...(baseScales.y?.ticks || {}),
    ...(customScales.y?.ticks || {}),
    color: legendColor,
    font: { family: fontFamily, size: 11 }
  }
  if (isHorizontalBar) delete yTicks.maxTicksLimit

  return {
    x: {
      ...(baseScales.x || {}),
      ...(customScales.x || {}),
      ticks: {
        ...(baseScales.x?.ticks || {}),
        ...(customScales.x?.ticks || {}),
        color: legendColor,
        font: { family: fontFamily, size: 11 }
      },
      grid: { display: false }
    },
    y: {
      ...(baseScales.y || {}),
      ...(customScales.y || {}),
      ...(isHorizontalBar ? { type: 'category' as const } : {}),
      ticks: yTicks,
      grid: { display: false },
      // Barres horizontales : Y = catégories → pas de beginAtZero (sinon conflit avec preset)
      beginAtZero: isHorizontalBar ? false : true
    }
  }
}

/**
 * Construit les options complètes pour le mode impression
 */
export function buildPrintModeOptions(
  props: ChartConfigProps,
  baseOptions: Record<string, unknown>
): Record<string, unknown> {
  const palette = props.printPalette || {}
  const basePlugins = (baseOptions.plugins || {}) as Record<string, unknown>
  const customPlugins = (props.chartOptions?.plugins || {}) as Record<string, unknown>
  const fontFamily = palette.fontFamily || "'Montserrat', 'Segoe UI', sans-serif"
  const legendColor = palette.legend?.color || '#2c3e50'

  return {
    ...baseOptions,
    ...props.chartOptions,
    responsive: false,
    maintainAspectRatio: true,
    animation: false,
    resizeDelay: 0,
    layout: {
      padding: { top: 16, bottom: 16, left: 12, right: 12 }
    },
    plugins: {
      ...basePlugins,
      ...customPlugins,
      legend: buildPrintLegendConfig(palette, basePlugins, customPlugins),
      tooltip: {
        ...(basePlugins.tooltip || {}),
        ...(customPlugins.tooltip || {}),
        enabled: false
      },
      datalabels: buildPrintDatalabelsConfig(props.type, palette)
    },
    scales: buildPrintScalesConfig(
      props.type,
      baseOptions,
      props.chartOptions,
      legendColor,
      fontFamily
    )
  }
}
