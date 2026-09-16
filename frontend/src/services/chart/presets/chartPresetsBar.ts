/**
 * Presets Chart.js : barres (classiques, pourcentage, horizontales)
 */
import { DEFAULT_DATALABELS_CONFIG, DEFAULT_LEGEND_CONFIG } from '../chartConstants'
import {
  formatNumber,
  formatPercent,
  formatDataLabelNumber,
  createAxisConfig,
  truncateForTooltip
} from '../chartHelpers'
import { baseConfig } from './baseConfig'

export const chartClassicBar = {
  ...baseConfig,
  scales: {
    y: {
      ...createAxisConfig({ beginAtZero: true }),
      ticks: {
        ...createAxisConfig().ticks,
        callback: function (value: any) {
          return formatNumber(value)
        }
      },
      grid: { display: false, drawBorder: false },
      border: { display: false }
    },
    x: {
      ...createAxisConfig(),
      ticks: { ...createAxisConfig().ticks },
      grid: { display: false },
      border: { display: false }
    }
  },
  plugins: {
    ...baseConfig.plugins,
    datalabels: {
      ...DEFAULT_DATALABELS_CONFIG,
      display: false,
      font: { size: 10 },
      formatter: function (value: any) {
        let numValue: unknown = value
        if (typeof value === 'object' && value !== null) {
          numValue = (value as { value?: unknown }).value ?? (value as { y?: unknown }).y ?? (value as { x?: unknown }).x ?? 0
        }
        const num = typeof numValue === 'number' ? numValue : parseFloat(String(numValue)) || 0
        if (num === 0 || (typeof num === 'number' && Math.abs(num) < 0.01)) return null
        return formatDataLabelNumber(num)
      }
    },
    tooltip: {
      enabled: true,
      callbacks: {
        label: function (context: any) {
          const label = context.dataset.label || ''
          let value: unknown = context.parsed?.y ?? context.parsed?.x ?? context.parsed ?? context.raw
          if (typeof value === 'object' && value !== null) {
            value = (value as { value?: unknown }).value ?? (value as { y?: unknown }).y ?? (value as { x?: unknown }).x ?? 0
          }
          const numValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0
          const formatted = formatNumber(numValue, { maximumFractionDigits: 2 })
          return label ? `${formatted} — ${truncateForTooltip(label)}` : formatted
        }
      }
    },
    legend: DEFAULT_LEGEND_CONFIG
  }
}

export const chartClassicBarNoLegend = {
  ...chartClassicBar,
  plugins: {
    ...chartClassicBar.plugins,
    legend: { display: false }
  }
}

export const chartClassicBarPercent = {
  ...baseConfig,
  datasets: {
    bar: {
      minBarLength: 8 // Barre visible même pour tx_evol=0 (ex: 2007, première année sans évolution)
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { callback: function (value: any) { return formatPercent(value) } },
      grid: { display: false, drawBorder: false },
      border: { display: false }
    },
    x: {
      ticks: {},
      grid: { display: false },
      border: { display: false }
    }
  },
  plugins: {
    ...baseConfig.plugins,
    datalabels: {
      ...DEFAULT_DATALABELS_CONFIG,
      display: false,
      font: { size: 10 },
      formatter: function (value: any) {
        let numValue: unknown = value
        if (typeof value === 'object' && value !== null) {
          numValue = (value as { value?: unknown }).value ?? (value as { y?: unknown }).y ?? (value as { x?: unknown }).x ?? 0
        }
        const num = typeof numValue === 'number' ? numValue : parseFloat(String(numValue)) || 0
        if (num === 0 || (typeof num === 'number' && Math.abs(num) < 0.01)) return null
        return formatPercent(num, { maximumFractionDigits: 2, minimumFractionDigits: 0 })
      }
    },
    tooltip: {
      enabled: true,
      callbacks: {
        label: function (context: any) {
          const label = context.dataset.label || ''
          let value: unknown = context.parsed?.y ?? context.parsed?.x ?? context.parsed ?? context.raw
          if (typeof value === 'object' && value !== null) {
            value = (value as { value?: unknown }).value ?? (value as { y?: unknown }).y ?? (value as { x?: unknown }).x ?? 0
          }
          const numValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0
          const formatted = formatPercent(numValue, { maximumFractionDigits: 2, minimumFractionDigits: 0 })
          return label ? `${formatted} — ${truncateForTooltip(label)}` : formatted
        }
      }
    },
    legend: DEFAULT_LEGEND_CONFIG
  }
}

export const chartClassicBarPercentNoLegend = {
  ...chartClassicBarPercent,
  plugins: {
    ...chartClassicBarPercent.plugins,
    legend: { display: false }
  }
}

export const chartHorizontal = {
  ...baseConfig,
  indexAxis: 'y',
  scales: {
    x: {
      ticks: {
        callback: function (value: any) { return formatNumber(value) },
        stepSize: 20000
      },
      grid: { display: false, drawBorder: false },
      border: { display: false }
    },
    y: {
      beginAtZero: true,
      grid: { drawBorder: false, display: false },
      border: { display: false }
    }
  },
  plugins: {
    ...baseConfig.plugins,
    datalabels: {
      ...DEFAULT_DATALABELS_CONFIG,
      display: false,
      font: { size: 10 },
      anchor: 'end',
      align: 'end',
      formatter: function (value: any) {
        let numValue: unknown = value
        if (typeof value === 'object' && value !== null) {
          numValue = (value as { value?: unknown }).value ?? (value as { x?: unknown }).x ?? (value as { y?: unknown }).y ?? 0
        }
        const num = typeof numValue === 'number' ? numValue : parseFloat(String(numValue)) || 0
        if (num === 0 || (typeof num === 'number' && Math.abs(num) < 0.01)) return null
        return formatDataLabelNumber(num)
      }
    },
    tooltip: {
      enabled: true,
      mode: 'index',
      callbacks: {
        label: function (context: any) {
          const label = context.dataset.label || ''
          let value: unknown = context.parsed?.x ?? context.parsed?.y ?? context.parsed ?? context.raw
          if (typeof value === 'object' && value !== null) {
            value = (value as { value?: unknown }).value ?? (value as { x?: unknown }).x ?? (value as { y?: unknown }).y ?? 0
          }
          const numValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0
          const formatted = formatNumber(numValue, { maximumFractionDigits: 2 })
          return label ? `${formatted} — ${truncateForTooltip(label)}` : formatted
        }
      }
    },
    legend: { display: true, position: 'bottom' }
  }
}
