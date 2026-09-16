/**
 * Presets Chart.js : graphiques linéaires
 */
import { formatNumber, truncateForTooltip } from '../chartHelpers'
import { baseConfig } from './baseConfig'

export const chartLine = {
  ...baseConfig,
  scales: {
    x: {
      stacked: true,
      ticks: {},
      grid: { display: false },
      border: { display: false }
    },
    y: {
      beginAtZero: true,
      ticks: {
        callback: function (value: any) { return formatNumber(value) }
      },
      grid: { display: false, drawBorder: false },
      border: { display: false }
    }
  },
  plugins: {
    ...baseConfig.plugins,
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
          const formatted = formatNumber(numValue)
          return label ? `${formatted} — ${truncateForTooltip(label)}` : formatted
        }
      }
    },
    legend: {
      display: true,
      position: 'bottom',
      labels: { usePointStyle: true }
    }
  }
}
