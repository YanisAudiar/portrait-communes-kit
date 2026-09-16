/**
 * Presets Chart.js : barres empilées, pyramide des âges
 */
import { formatNumber, truncateForTooltip } from '../chartHelpers'
import { baseConfig } from './baseConfig'

export const chartStackedSum = {
  ...baseConfig,
  // Barres horizontales par défaut (années en Y, valeurs en X) — évite les conflits
  // avec buildResponsiveOptions qui peut écraser indexAxis selon l'ordre de merge
  indexAxis: 'y' as const,
  // Barres empilées : bords tous identiques (carrés). Chart.js n'arrondit que les
  // extrémités externes de la pile, ce qui donne des arrondis incohérents entre segments.
  elements: {
    bar: { borderRadius: 0 }
  },
  scales: {
    // indexAxis: 'y' → X = effectifs (linéaire), Y = catégories (périodes, années).
    // Ne pas mettre beginAtZero sur Y : fusion avec getBarOptions ferait un axe linéaire
    // et afficherait 0,1,2… au lieu des libellés data.labels.
    x: {
      stacked: true,
      beginAtZero: true,
      ticks: {
        callback: function (value: unknown) {
          return typeof value === 'number' ? formatNumber(value) : value
        }
      },
      grid: { display: false },
      border: { display: false }
    },
    y: {
      type: 'category' as const,
      stacked: true,
      beginAtZero: false,
      alignToPixels: true,
      grid: { drawBorder: false, display: false },
      border: { display: false },
      ticks: {
        autoSkip: false,
        maxRotation: 0
      }
    }
  },
  plugins: {
    ...baseConfig.plugins,
    tooltip: {
      enabled: true,
      mode: 'index',
      callbacks: {
        afterTitle: function () {
          if (!(window as any).chartTotal) (window as any).chartTotal = 0
          ;(window as any).chartTotal = 0
        },
        label: function (context: any) {
          const label = context.dataset.label || ''
          let value: unknown = context.parsed?.x ?? context.parsed?.y ?? context.parsed ?? context.raw
          if (typeof value === 'object' && value !== null) {
            value = (value as { value?: unknown }).value ?? (value as { y?: unknown }).y ?? (value as { x?: unknown }).x ?? 0
          }
          const numValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0
          if ((window as any).chartTotal !== undefined) (window as any).chartTotal += numValue
          const formatted = formatNumber(numValue)
          return label ? `${formatted} — ${truncateForTooltip(label)}` : formatted
        },
        footer: function () {
          return (window as any).chartTotal !== undefined ? 'Somme : ' + formatNumber((window as any).chartTotal) : ''
        }
      }
    },
    legend: { display: true, position: 'bottom' }
  }
}

export const chartPyramide = {
  ...baseConfig,
  // Pyramide classique : âges sur l'axe vertical (Y), barres horizontales de part et d'autre
  indexAxis: 'y',
  // Barres empilées : bords tous identiques (carrés), comme pour chartStackedSum
  elements: {
    bar: { borderRadius: 0 }
  },
  scales: {
    x: {
      stacked: true,
      // Pas de suggestedMin/Max fixe : Chart.js auto-scale selon les données (pop peut être 50 ou 5000)
      ticks: {
        callback: function (value: any) { return formatNumber(Math.abs(value)) }
      },
      grid: { display: false, drawBorder: false },
      border: { display: false }
    },
    y: {
      type: 'category' as const,
      stacked: true,
      beginAtZero: false,
      grid: { drawBorder: false, display: false },
      border: { display: false }
    }
  },
  plugins: {
    ...baseConfig.plugins,
    datalabels: { display: false },
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
          const formatted = formatNumber(Math.abs(numValue))
          return label ? `${formatted} — ${truncateForTooltip(label)}` : formatted
        }
      }
    },
    legend: { display: true, position: 'bottom' }
  }
}
