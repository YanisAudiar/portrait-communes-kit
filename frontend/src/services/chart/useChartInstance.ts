/**
 * Composable pour gérer l'instance du graphique Chart.js
 * Centralise la logique de création, mise à jour et destruction du graphique
 */
import { ref, shallowRef, markRaw, nextTick } from 'vue'
import { createSimpleChart, normalizeChartData, formatDataForChart, premiumColors } from '@/services/chartService'
import type { FormattedChartData } from './chartTypes'

// Types pour les props du composant
interface ChartProps {
  data: unknown[]
  type: string
  labelField: string
  valueField: string
  theme: string
  datasetLabel: string
  datasets?: unknown[]
  groupByField?: string
  isPyramid?: boolean
  isPrintMode?: boolean
  printWidth?: number
  printHeight?: number
  chartOptions?: Record<string, unknown>
}

// Type pour l'emit - accepte les types d'événements Vue
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EmitFn = (...args: any[]) => void

/**
 * Composable principal pour gérer l'instance du graphique
 * @param props - Props du composant ChartComponent
 * @param getChartOptions - Fonction pour obtenir les options du graphique
 * @param emit - Fonction emit du composant
 * @param getData - Optionnel : source de données (ex. données filtrées par année). Si absent, utilise props.data
 */
export function useChartInstance(
  props: ChartProps,
  getChartOptions: () => Record<string, unknown>,
  emit: EmitFn,
  getData?: () => unknown[]
) {
  const getEffectiveData = (): unknown[] => {
    const raw = getData ? getData() : props.data
    return Array.isArray(raw) ? raw : []
  }

  // État du composant
  const loading = ref(false)
  const error = ref<string | null>(null)
  const chartInstance = shallowRef<ReturnType<typeof createSimpleChart> | null>(null)
  const isInitializing = ref(false)

  /**
   * Configure le canvas pour le mode impression
   */
  const setupPrintCanvas = (canvas: HTMLCanvasElement): void => {
    const ratio = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 2
    const targetWidth = props.printWidth || 520
    const targetHeight = props.printHeight || 320

    canvas.style.width = `${targetWidth}px`
    canvas.style.height = `${targetHeight}px`
    canvas.width = Math.round(targetWidth * ratio)
    canvas.height = Math.round(targetHeight * ratio)
  }

  /**
   * Prépare les données pour le graphique (utilise getEffectiveData si fourni, sinon props.data)
   */
  const prepareChartData = (): { chartData: FormattedChartData; normalizedData: unknown[] } => {
    const normalizedData = normalizeChartData(getEffectiveData())
    if (normalizedData.length === 0) {
      throw new Error('Aucune donnée valide')
    }

    const chartData = formatDataForChart(normalizedData, props.type, {
      labelField: props.labelField,
      valueField: props.valueField,
      theme: props.theme,
      datasetLabel: props.datasetLabel,
      datasets: props.datasets as { code: string; label: string }[] | undefined,
      groupByField: props.groupByField,
      pyramid: props.isPyramid === true
    })

    if (!chartData.labels || chartData.labels.length === 0) {
      console.warn('Impossible de formater les données - debug:', {
        type: props.type,
        labelField: props.labelField,
        valueField: props.valueField,
        groupByField: props.groupByField,
        dataSample: normalizedData.slice(0, 3),
        dataLength: normalizedData.length
      })
      throw new Error('Impossible de formater les données')
    }

    return { chartData, normalizedData }
  }

  /**
   * Configure les événements du graphique
   */
  const setupChartEvents = (chart: ReturnType<typeof createSimpleChart>): void => {
    if (chart.chart) {
      const chartJs = chart.chart as {
        options: { onClick?: (event: unknown, elements: { datasetIndex: number; index: number }[]) => void }
        data: { datasets: { data: unknown[] }[]; labels: string[] }
      }

      chartJs.options.onClick = (_event: unknown, elements: { datasetIndex: number; index: number }[]) => {
        const first = elements[0]
        if (first) {
          const { datasetIndex, index } = first
          const data = chartJs.data.datasets[datasetIndex]?.data[index]
          const label = chartJs.data.labels[index]

          emit('chart-click', { data, label, index, datasetIndex })
        }
      }
    }
  }

  /**
   * Configure le plugin centerValue pour les donuts
   */
  const setupCenterValuePlugin = (chartOptions: Record<string, unknown>): void => {
    const plugins = chartOptions.plugins as Record<string, unknown> | undefined
    if (plugins?.centerValue) {
      delete plugins.centerValue
    }
  }

  /**
   * Initialise le graphique
   * @param chartId - ID unique du canvas
   */
  const initChart = async (chartId: string): Promise<void> => {
    if (isInitializing.value) return
    isInitializing.value = true

    const data = getEffectiveData()
    if (!data || data.length === 0) {
      error.value = 'Aucune donnée disponible'
      isInitializing.value = false
      return
    }

    loading.value = true
    error.value = null

    try {
      await nextTick()
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))

      let canvas = document.getElementById(chartId) as HTMLCanvasElement
      if (!canvas) {
        // Après un hot reload (HMR), le canvas peut ne pas être encore en place : réessayer une fois
        await new Promise(resolve => setTimeout(resolve, 150))
        await nextTick()
        canvas = document.getElementById(chartId) as HTMLCanvasElement
      }
      if (!canvas) {
        throw new Error('Canvas non trouvé')
      }

      if (props.isPrintMode) {
        setupPrintCanvas(canvas)
      }

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error('Impossible d\'acquérir le contexte Canvas')
      }

      const { normalizedData } = prepareChartData()
      const chartOptions = getChartOptions()
      setupCenterValuePlugin(chartOptions)

      if (chartInstance.value) {
        chartInstance.value.destroy()
      }

      const chart = markRaw(createSimpleChart(canvas, props.type, normalizedData, {
        labelField: props.labelField,
        valueField: props.valueField,
        theme: props.theme === 'premium' ? 'premium' : props.theme,
        datasetLabel: props.datasetLabel,
        chartOptions,
        colors: props.theme === 'premium' ? Object.values(premiumColors) : null,
        datasets: props.datasets as { code: string; label: string }[] | undefined,
        groupByField: props.groupByField,
        pyramid: props.isPyramid === true
      }))

      if (!chart || !chart.chart) {
        throw new Error('Échec de la création du graphique')
      }

      // Application des dégradés pour les barres
      if (props.type === 'bar' && chart.chart.ctx) {
        const chartCtx = chart.chart.ctx as CanvasRenderingContext2D
        const createGradient = (color: string): string | CanvasGradient => {
          if (!color || typeof color !== 'string' || !color.startsWith('#')) return color
          const gradient = chartCtx.createLinearGradient(0, 0, 0, 400)
          gradient.addColorStop(0, color)
          gradient.addColorStop(1, color + '80')
          return gradient
        }

        const datasets = chart.chart.data.datasets as { backgroundColor: string | string[]; hoverBackgroundColor?: string | string[] | CanvasGradient | CanvasGradient[] }[]
        datasets.forEach(dataset => {
          if (Array.isArray(dataset.backgroundColor)) {
            dataset.backgroundColor = dataset.backgroundColor.map(c => createGradient(c)) as string[]
          } else {
            dataset.backgroundColor = createGradient(dataset.backgroundColor) as string
          }
          dataset.hoverBackgroundColor = dataset.backgroundColor
        })
        chart.chart.update('none')
      }

      setupChartEvents(chart)
      chartInstance.value = chart
      emit('chart-ready', chart)

    } catch (err) {
      console.error('Erreur création graphique:', err)
      error.value = (err as Error).message || 'Erreur lors de la création du graphique'
      emit('chart-error', err)
    } finally {
      loading.value = false
      isInitializing.value = false
    }
  }

  /**
   * Met à jour les données du graphique
   */
  const updateChart = async (): Promise<void> => {
    const data = getEffectiveData()
    if (!chartInstance.value || !data.length) {
      return
    }

    try {
      const normalizedData = normalizeChartData(data)
      if (normalizedData.length === 0) {
        return
      }

      const chartData = formatDataForChart(normalizedData, props.type, {
        labelField: props.labelField,
        valueField: props.valueField,
        theme: props.theme,
        datasetLabel: props.datasetLabel,
        datasets: props.datasets as { code: string; label: string }[] | undefined,
        groupByField: props.groupByField,
        pyramid: props.isPyramid === true
      })

      if (chartData?.labels && chartData.datasets) {
        chartInstance.value.update(chartData)
      }
    } catch (err) {
      console.error('Erreur mise à jour graphique:', err)
    }
  }

  /**
   * Détruit le graphique
   */
  const destroyChart = (): void => {
    if (chartInstance.value) {
      chartInstance.value.destroy()
      chartInstance.value = null
    }
  }

  return {
    loading,
    error,
    chartInstance,
    initChart,
    updateChart,
    destroyChart
  }
}
