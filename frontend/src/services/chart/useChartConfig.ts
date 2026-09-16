/**
 * Composable pour la configuration des options Chart.js
 * Délègue au mode impression (useChartConfigPrint) ou responsive (useChartConfigResponsive)
 */
import { computed, type Ref } from 'vue'
import { getTypeSpecificOptions } from '@/services/chartService'
import { mergeChartOptions } from './chartHelpers'
import type { ChartConfigProps } from './useChartConfigTypes'
import { chartTypeUsesShareOnlyDataLabels } from './useChartConfigTypes'
import { buildPrintModeOptions } from './useChartConfigPrint'
import { buildResponsiveOptions } from './useChartConfigResponsive'
import { getDeviceType } from './mobileChartConfig'
import {
  CHART_ID_DEMO_EVOLUTION_AGE,
  applyDemoEvolutionAgeAxisAndLegend
} from './demoEvolutionAgeChartFix'

export type { ChartConfigProps } from './useChartConfigTypes'

/**
 * Composable principal : options selon isPrintMode ou mode normal
 * @param layoutBreakpoint - Ref mise à jour au changement de breakpoint (resize) pour recalculer getDeviceType dans le computed
 */
export function useChartConfig(props: ChartConfigProps, layoutBreakpoint?: Ref<string>) {
  const chartOptions = computed(() => {
    if (layoutBreakpoint) {
      void layoutBreakpoint.value
    }
    const baseOptions = getTypeSpecificOptions(props.type)

    let result: Record<string, unknown>

    if (props.isPrintMode) {
      result = buildPrintModeOptions(props, baseOptions) as Record<string, unknown>
    } else {
      // Fusion profonde : évite d’écraser plugins/scales responsive avec un spread superficiel
      // (sinon perte légende mobile, ticks formatNumber, etc. → régression type « tout en % »)
      result = mergeChartOptions(
        buildResponsiveOptions(props, baseOptions) as Record<string, unknown>,
        (props.chartOptions || {}) as Record<string, unknown>
      ) as Record<string, unknown>

      // Après mergeChartOptions : barres / circulaires sans étiquettes sauf vue partage (desktop)
      if (chartTypeUsesShareOnlyDataLabels(props.type)) {
        const plugins = { ...((result.plugins || {}) as Record<string, unknown>) }
        const prevDl = (plugins.datalabels || {}) as Record<string, unknown>
        const onDesktop = getDeviceType() === 'desktop'
        const display = props.showShareDataLabels === true ? onDesktop : false
        const datalabels = { ...prevDl, display }
        result = { ...result, plugins: { ...plugins, datalabels } }
      }
    }

    if (props.chartId === CHART_ID_DEMO_EVOLUTION_AGE) {
      result = applyDemoEvolutionAgeAxisAndLegend(result, props.showLegend)
    }

    return result
  })

  return { chartOptions }
}
