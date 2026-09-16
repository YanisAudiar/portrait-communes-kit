/**
 * Service pour la création et gestion des instances de graphiques Chart.js
 * Centralise la logique de création, mise à jour et destruction des graphiques
 */
import { Chart } from 'chart.js'
import { getTypeSpecificOptions } from './chartConfig'
import { formatDataForChart } from './chartDataFormatter'
import type { ChartDataOptions, FormattedChartData } from './chartTypes'

/**
 * Fusionne un axe d’échelle (x, y, …) : base puis custom, avec merge profond de ticks / grid / border.
 * Évite d’écraser le callback des ticks (ex. formatNumber) quand custom apporte seulement une partie des clés.
 */
function mergeScaleAxis(
  base: Record<string, unknown> | undefined,
  custom: Record<string, unknown> | undefined
): Record<string, unknown> {
  if (!base && !custom) return {}
  if (!base) return { ...(custom as object) } as Record<string, unknown>
  if (!custom) return { ...base }
  const out: Record<string, unknown> = { ...base, ...custom }
  if (base.ticks || custom.ticks) {
    out.ticks = {
      ...(base.ticks as Record<string, unknown>),
      ...(custom.ticks as Record<string, unknown>)
    }
  }
  if (base.grid || custom.grid) {
    out.grid = {
      ...(base.grid as Record<string, unknown>),
      ...(custom.grid as Record<string, unknown>)
    }
  }
  if (base.border || custom.border) {
    out.border = {
      ...(base.border as Record<string, unknown>),
      ...(custom.border as Record<string, unknown>)
    }
  }
  return out
}

/**
 * Fusion profonde de tous les axes présents dans base ou custom (x, y, éventuels axes nommés).
 */
function mergeScalesDeep(
  baseScales: Record<string, unknown> | undefined,
  customScales: Record<string, unknown> | undefined
): Record<string, unknown> {
  if (!baseScales && !customScales) return {}
  const keys = new Set([
    ...Object.keys(baseScales || {}),
    ...Object.keys(customScales || {})
  ])
  const result: Record<string, unknown> = {}
  for (const key of keys) {
    result[key] = mergeScaleAxis(
      baseScales?.[key] as Record<string, unknown> | undefined,
      customScales?.[key] as Record<string, unknown> | undefined
    )
  }
  return result
}

/**
 * Classe simplifiée pour créer et gérer des graphiques Chart.js
 */
export class SimpleChart {
  canvas: HTMLCanvasElement
  type: string
  chart: Chart | null
  options: Record<string, unknown>
  isPyramid: boolean

  constructor(
    canvas: HTMLCanvasElement,
    type: string,
    data: FormattedChartData | null,
    options: Record<string, unknown> = {}
  ) {
    this.canvas = canvas
    this.type = type
    this.chart = null
    const opts = options as { chartOptions?: Record<string, unknown>; pyramid?: boolean }
    this.options = opts.chartOptions !== undefined ? opts.chartOptions : options
    this.isPyramid = opts.pyramid === true

    if (data) {
      this.create(data)
    }
  }

  /**
   * Crée le graphique
   * @param data - Données formatées pour Chart.js
   * @returns Succès de la création
   */
  create(data: FormattedChartData): boolean {
    if (!this.canvas) {
      console.error('Canvas requis pour créer le graphique')
      return false
    }

    // Destruction du graphique existant
    if (this.chart) {
      this.chart.destroy()
    }

    try {
      // Vérification du contexte Canvas
      const ctx = this.canvas.getContext('2d')
      if (!ctx) {
        throw new Error('Impossible d\'acquérir le contexte 2D du canvas')
      }

      // Vérification que le canvas est visible et a une taille
      const rect = this.canvas.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) {
        setTimeout(() => this.create(data), 100)
        return false
      }

      // Deep-merge des options : les sous-objets (datasets, elements, plugins, scales)
      // doivent être fusionnés en profondeur, pas écrasés par le spread
      const baseOpts = getTypeSpecificOptions(this.type) as Record<string, any>
      const customOpts = this.options as Record<string, any>

      const chartOptions: Record<string, unknown> = {
        ...baseOpts,
        ...customOpts,
        // Deep-merge datasets (ex: datasets.bar.categoryPercentage)
        datasets: {
          ...(baseOpts.datasets || {}),
          ...(customOpts.datasets || {}),
          bar: {
            ...((baseOpts.datasets || {}).bar || {}),
            ...((customOpts.datasets || {}).bar || {})
          }
        },
        // Deep-merge elements (ex: elements.bar.borderRadius)
        elements: {
          ...(baseOpts.elements || {}),
          ...(customOpts.elements || {}),
          bar: {
            ...((baseOpts.elements || {}).bar || {}),
            ...((customOpts.elements || {}).bar || {})
          },
          point: {
            ...((baseOpts.elements || {}).point || {}),
            ...((customOpts.elements || {}).point || {})
          },
          line: {
            ...((baseOpts.elements || {}).line || {}),
            ...((customOpts.elements || {}).line || {})
          },
          arc: {
            ...((baseOpts.elements || {}).arc || {}),
            ...((customOpts.elements || {}).arc || {})
          }
        },
        // Deep-merge plugins
        plugins: {
          ...(baseOpts.plugins || {}),
          ...(customOpts.plugins || {})
        },
        // Fusion profonde des échelles (ticks.callback préservé depuis customOpts)
        scales: mergeScalesDeep(
          baseOpts.scales as Record<string, unknown> | undefined,
          customOpts.scales as Record<string, unknown> | undefined
        )
      }

      // Pyramide des âges : forcer barres horizontales (âges en Y, effectifs en X)
      // Priorité absolue pour éviter que le merge responsive n'écrase indexAxis
      if (this.isPyramid) {
        chartOptions.indexAxis = 'y'
      } else if (customOpts.indexAxis === 'y') {
        chartOptions.indexAxis = 'y'
      } else {
        const isPyramidStyle =
          customOpts.scales?.x?.stacked &&
          customOpts.scales?.y?.stacked &&
          typeof customOpts.scales?.x?.ticks === 'object'
        if (isPyramidStyle) chartOptions.indexAxis = 'y'
      }

      // Barres horizontales : l’axe vertical porte data.labels (périodes, tranches d’âge).
      // Si Chart.js reste en linéaire sur Y, les graduations deviennent 0,1,2… ou 0,2,4…
      // (indices / pas automatiques) au lieu des libellés. Le merge avec getBarOptions / mobile
      // peut laisser une config ambiguë : on verrouille explicitement l’échelle catégories.
      if (this.type === 'bar' && chartOptions.indexAxis === 'y') {
        const scales = chartOptions.scales as Record<string, Record<string, unknown>> | undefined
        if (scales?.y) {
          const prevTicks =
            scales.y.ticks && typeof scales.y.ticks === 'object'
              ? { ...(scales.y.ticks as Record<string, unknown>) }
              : {}
          delete prevTicks.maxTicksLimit
          delete prevTicks.callback
          scales.y = {
            ...scales.y,
            type: 'category',
            beginAtZero: false,
            ticks: prevTicks
          }
        }
      }

      this.chart = new Chart(ctx, {
        type: this.type as 'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'polarArea',
        data: data as unknown as Chart['data'],
        options: chartOptions as Chart['options']
      })

      return true
    } catch (error) {
      console.error('Erreur création graphique:', error)
      return false
    }
  }

  /**
   * Met à jour les données du graphique
   * @param newData - Nouvelles données formatées
   */
  update(newData: FormattedChartData): void {
    if (!this.chart || !newData) return

    try {
      this.chart.data = newData as unknown as Chart['data']
      this.chart.update('none')
    } catch (error) {
      console.error('Erreur mise à jour graphique:', error)
    }
  }

  /**
   * Détruit le graphique
   */
  destroy(): void {
    if (this.chart) {
      this.chart.destroy()
      this.chart = null
    }
  }
}

interface SimpleChartOptions extends ChartDataOptions {
  chartOptions?: Record<string, unknown>
  pyramid?: boolean
}

/**
 * Fonction utilitaire pour créer un graphique simple
 * @param canvas - Élément canvas
 * @param type - Type de graphique
 * @param rawData - Données brutes
 * @param options - Options de formatage et configuration
 * @returns Instance du graphique
 */
export function createSimpleChart(
  canvas: HTMLCanvasElement,
  type: string,
  rawData: unknown[],
  options: SimpleChartOptions = {}
): SimpleChart {
  // Formatage des données
  const formattedData = formatDataForChart(rawData, type, options)

  // Création du graphique (passer l'objet complet pour pyramid / chartOptions)
  const chartOpts: Record<string, unknown> = {
    chartOptions: options.chartOptions,
    pyramid: (options as { pyramid?: boolean }).pyramid
  }
  const chart = new SimpleChart(canvas, type, formattedData, chartOpts)

  return chart
}
