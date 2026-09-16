/**
 * Index des presets Chart.js – agrège les familles (bar, line, pie, stacked)
 * Réexporte le mapping et les helpers getChartPreset / hasChartPreset
 */
import {
  chartClassicBar,
  chartClassicBarNoLegend,
  chartClassicBarPercent,
  chartClassicBarPercentNoLegend,
  chartHorizontal
} from './chartPresetsBar'
import { chartLine } from './chartPresetsLine'
import { chartClassicDoughnut } from './chartPresetsPie'
import { chartStackedSum, chartPyramide } from './chartPresetsStacked'

export { chartClassicBar, chartClassicBarNoLegend, chartClassicBarPercent, chartClassicBarPercentNoLegend, chartHorizontal } from './chartPresetsBar'
export { chartLine } from './chartPresetsLine'
export { chartClassicDoughnut } from './chartPresetsPie'
export { chartStackedSum, chartPyramide } from './chartPresetsStacked'

export const chartPresets: Record<string, any> = {
  chartClassicBar,
  chartClassicBarNoLegend,
  chartClassicBarPercent,
  chartClassicBarPercentNoLegend,
  chartLine,
  chartStackedSum,
  chartPyramide,
  chartHorizontal,
  chartClassicDoughnut
}

export function getChartPreset(presetName: string) {
  return chartPresets[presetName] ?? null
}

export function hasChartPreset(presetName: string) {
  return presetName in chartPresets
}
