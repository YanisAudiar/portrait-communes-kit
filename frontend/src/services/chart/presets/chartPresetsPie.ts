/**
 * Presets Chart.js : donut / camembert
 */
import { DEFAULT_DATALABELS_CONFIG, FONT_FAMILY } from '../chartConstants'
import {
  formatNumber,
  formatDataLabelNumber,
  formatDataLabelPercentOfTotal
} from '../chartHelpers'
import { baseConfig } from './baseConfig'

/** Extrait une valeur numérique d’un point arc (données brutes Chart.js). */
function parseArcDataPoint(raw: unknown): number {
  if (typeof raw === 'number') return raw
  if (typeof raw === 'object' && raw !== null) {
    const v =
      (raw as { value?: unknown }).value ??
      (raw as { y?: unknown }).y ??
      (raw as { x?: unknown }).x
    if (typeof v === 'number') return v
    return parseFloat(String(v)) || 0
  }
  return parseFloat(String(raw)) || 0
}

export const chartClassicDoughnut = {
  ...baseConfig,
  animation: false,
  plugins: {
    ...baseConfig.plugins,
    legend: {
      labels: {
        font: { family: FONT_FAMILY, size: 12 }
      }
    },
    datalabels: {
      ...DEFAULT_DATALABELS_CONFIG,
      display: true,
      font: { family: FONT_FAMILY, size: 10 },
      // Évite les flottants à rallonge sur les segments (max 2 décimales valeur + %)
      formatter(value: unknown, context: { chart: { data: { datasets: unknown[] } }; datasetIndex: number }) {
        const num = parseArcDataPoint(value)
        const dataset = context.chart.data.datasets[context.datasetIndex] as { data: unknown[] }
        const data = dataset?.data ?? []
        const total = data.reduce((sum: number, val: unknown) => sum + parseArcDataPoint(val), 0)
        const pctStr = formatDataLabelPercentOfTotal(num, total)
        return `${formatDataLabelNumber(num)} (${pctStr} %)`
      }
    },
    tooltip: {
      enabled: true,
      callbacks: {
        label: function (context: any) {
          const dataset = context.dataset as { data: unknown[] }
          const total = (dataset.data ?? []).reduce((sum: number, val: unknown) => {
            return sum + parseArcDataPoint(val)
          }, 0)
          const numValue = parseArcDataPoint(context.parsed ?? context.raw)
          const pctStr = formatDataLabelPercentOfTotal(numValue, total)
          return `${formatNumber(numValue, { maximumFractionDigits: 2 })} (${pctStr} %)`
        },
        title: function (tooltipItems: any[]) {
          return tooltipItems.length > 0 ? tooltipItems[0].label : ''
        }
      }
    }
  }
}
