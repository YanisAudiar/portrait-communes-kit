<template>
  <div
    :class="[
      'relative bg-transparent',
      embedded ? 'overflow-visible' : 'overflow-hidden',
      embedded ? '' : 'mb-8 p-8 transition-all duration-300 ease-out',
      (embedded || isPrintMode) ? '' : 'shadow-sm hover:shadow-md hover:-translate-y-px',
      !embedded && { 'p-10': type === 'doughnut' || type === 'pie' },
      !embedded && { 'p-8': type === 'bar' || type === 'line' }
    ]"
  >
    <ChartComponentHeader
      v-if="(title || subtitle) && !isPrintMode"
      :title="chartTitle"
      :subtitle="subtitle"
      :display-title="chartTitle"
      :title-style="titleStyle"
      :is-print-mode="isPrintMode"
    />

    <YearSelector
      v-if="yearSelector.showYearSelector.value"
      :model-value="yearSelector.selectedYear.value"
      :available-years="yearSelector.availableYears.value"
      :class="embedded ? 'pb-4' : 'px-8 pb-4'"
      @update:model-value="(v) => (yearSelector.selectedYear.value = v)"
    />

    <ChartComponentBody
      :chart-id="chartId"
      :canvas-style="canvasStyle"
      :is-print-mode="isPrintMode"
      :loading="loading"
      :error="error"
    />

    <ChartComparePanel
      v-if="compare && !isPrintMode"
      :is-panel-open="comparison.isPanelOpen.value"
      :comparison-territories="comparison.comparisonTerritories.value"
      :comparison-count="comparison.comparisonCount.value"
      :is-max-reached="comparison.isMaxReached.value"
      :can-add-comparison="comparison.canAddComparison.value"
      :comparison-codes="comparison.comparisonCodes.value"
      :loading="comparison.loading.value"
      :error="comparison.error.value === null ? undefined : comparison.error.value"
      :COMPARISON_COLORS="comparison.COMPARISON_COLORS"
      :max-comparisons="comparison.maxComparisons"
      :main-commune-code="compareMainCode"
      @toggle-panel="comparison.togglePanel"
      @add-comparison="handleAddComparison"
      @remove-comparison="comparison.removeComparison"
      @remove-last="comparison.removeLastComparison"
      @clear-error="comparison.clearError"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * ChartComponent - Affichage de graphiques Chart.js
 * Utilise useChartYearSelector, useChartConfig, useChartInstance, useChartComparison
 */
import { onMounted, onUnmounted, watch, computed, ref, nextTick } from 'vue'
import { isValidChartType } from '@/services/chartService'
import { getResponsiveBreakpoint } from '@/services/chart/mobileChartConfig'
import { useChartConfig } from '@/services/chart/useChartConfig'
import { useChartInstance } from '@/services/chart/useChartInstance'
import { useChartComparison } from '@/composables/useChartComparison'
import { useChartYearSelector } from '@/composables/useChartYearSelector'
import YearSelector from '@/components/Common/YearSelector.vue'
import ChartComponentHeader from '@/components/Charts/ChartComponentHeader.vue'
import ChartComponentBody from '@/components/Charts/ChartComponentBody.vue'
import ChartComparePanel from '@/components/Charts/ChartComparePanel.vue'

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (value: string) => isValidChartType(value)
  },
  data: { type: Array, default: () => [] },
  title: String,
  subtitle: String,
  theme: { type: String, default: 'default' },
  height: { type: Number, default: 300 },
  responsiveHeight: { type: Boolean, default: true },
  showLegend: { type: Boolean, default: true },
  labelField: { type: String, default: 'label' },
  valueField: { type: String, default: 'value' },
  datasetLabel: { type: String, default: 'Données' },
  datasets: { type: Array, default: null },
  groupByField: { type: String, default: null },
  chartOptions: { type: Object, default: () => ({}) },
  /** ID indicateur (ex. demo-evolution-age) pour correctifs axe/légende ciblés */
  chartId: { type: String, default: '' },
  isPyramid: { type: Boolean, default: false },
  embedded: { type: Boolean, default: false },
  /** URL /share : valeurs sur barres / pie / doughnut (desktop uniquement côté config) */
  showShareDataLabels: { type: Boolean, default: false },
  isPrintMode: { type: Boolean, default: false },
  printWidth: { type: Number, default: 520 },
  printHeight: { type: Number, default: 320 },
  printPalette: { type: Object, default: null },
  yearSelectorConfig: {
    type: Object as () => { enabled: boolean; yearField: string; defaultYear?: 'latest' | 'earliest' | number } | null,
    default: null
  },
  compare: { type: Boolean, default: false },
  compareMainCode: { type: String, default: '' },
  compareFetchFn: {
    type: Function as unknown as () => ((codeInsee: string) => Promise<unknown>) | null,
    default: null
  }
})

const emit = defineEmits(['chart-ready', 'chart-error', 'chart-click', 'year-changed', 'comparison-changed'])

// Comparaison territoriale
const comparison = useChartComparison({
  fetchDataFn: props.compareFetchFn || undefined,
  valueField: props.valueField,
  labelField: props.labelField
})

async function handleAddComparison(code: string, label: string) {
  const success = await comparison.addComparison(code, label, props.compareFetchFn || undefined)
  if (success) {
    updateChartWithComparisons()
    emit('comparison-changed', comparison.comparisonTerritories.value)
  }
}

function updateChartWithComparisons() {
  if (!chartInstance.value?.chart) return
  const chart = chartInstance.value.chart as { data: { datasets: unknown[] }; update: (mode: string) => void }
  const originalDataset = chart.data.datasets[0]
  const comparisonDatasets = comparison.buildComparisonDatasets(
    props.data as Record<string, unknown>[],
    props.type,
    props.valueField
  )
  chart.data.datasets = [originalDataset, ...comparisonDatasets]
  chart.update('none')
}

watch(
  () => comparison.comparisonTerritories.value.length,
  () => {
    if (props.compare && chartInstance.value) updateChartWithComparisons()
  }
)

// Identifiant et styles
const chartId = ref(`chart-${Math.random().toString(36).substr(2, 9)}`)

/** Recalcul des options (datalabels, etc.) quand le breakpoint change — getDeviceType n’est pas réactif */
const layoutBreakpoint = ref(
  typeof window !== 'undefined' ? getResponsiveBreakpoint() : 'desktop'
)

const titleStyle = computed((): Record<string, string> | undefined => {
  if (props.theme && props.theme !== 'default') return { color: `var(--${props.theme})` }
  return undefined
})

const chartHeight = computed(() => {
  if (props.isPrintMode) return props.printHeight
  if (!props.responsiveHeight) return props.height
  if (typeof window !== 'undefined') {
    const isMobile = window.innerWidth <= 768
    const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024
    if (isMobile) return Math.min(props.height, 250)
    if (isTablet) return Math.min(props.height, 300)
  }
  return props.height
})

const canvasStyle = computed(() => {
  const style: Record<string, string> = { height: `${chartHeight.value}px` }
  if (props.isPrintMode) style.width = `${props.printWidth}px`
  return style
})

// Sélecteur d'année
const yearSelector = useChartYearSelector(
  () => props.data as unknown[],
  () => props.yearSelectorConfig ?? null,
  () => props.isPrintMode,
  year => emit('year-changed', year)
)

const chartTitle = computed(() => {
  if (props.title && props.yearSelectorConfig?.enabled && yearSelector.selectedYear.value) {
    return `${props.title} (${yearSelector.selectedYear.value})`
  }
  return props.title
})

const dataToUse = yearSelector.dataToUse

watch(yearSelector.selectedYear, (newYear, oldYear) => {
  if (chartInstance.value && newYear && oldYear) {
    nextTick(() => updateChart())
  }
})

// Config et instance du graphique (avec données filtrées par année si sélecteur actif)
const { chartOptions } = useChartConfig(props, layoutBreakpoint)
/** Toujours lire l’état actuel (année / props) : évite un getter figé si la config évolue */
function getEffectiveChartData(): unknown[] {
  if (props.yearSelectorConfig?.enabled) {
    const rows = dataToUse.value as unknown[]
    return Array.isArray(rows) ? rows : []
  }
  const d = props.data as unknown[]
  return Array.isArray(d) ? d : []
}
const {
  loading,
  error,
  chartInstance,
  initChart,
  updateChart,
  destroyChart
} = useChartInstance(props, () => chartOptions.value, emit, getEffectiveChartData)

watch(
  () => dataToUse.value,
  newData => {
    if (props.yearSelectorConfig?.enabled && chartInstance.value?.chart) {
      const normalizedData = newData as Record<string, unknown>[]
      if (normalizedData?.length > 0) {
        import('@/services/chartService').then(({ formatDataForChart }) => {
          const chartData = formatDataForChart(normalizedData, props.type, {
            labelField: props.labelField,
            valueField: props.valueField,
            theme: props.theme,
            datasetLabel: props.datasetLabel,
            datasets: props.datasets as { code: string; label: string }[] | undefined,
            groupByField: props.groupByField || undefined,
            pyramid: props.isPyramid === true
          })
          if (chartData && chartInstance.value?.chart) {
            const chart = chartInstance.value.chart as {
              data: { labels: string[]; datasets: unknown[] }
              update: (mode: string) => void
            }
            chart.data.labels = chartData.labels
            chart.data.datasets = chartData.datasets
            chart.update('none')
          }
        })
      }
    }
  },
  { deep: false }
)

watch(
  () => dataToUse.value,
  newData => {
    // Avec sélecteur d'année : n'initialiser qu'une fois une année sélectionnée (données filtrées)
    if (props.yearSelectorConfig?.enabled && !yearSelector.selectedYear.value) return
    if (newData && Array.isArray(newData) && newData.length > 0) {
      if (chartInstance.value) updateChart()
      else initChart(chartId.value)
    } else if (props.yearSelectorConfig?.enabled) {
      if (chartInstance.value) updateChart()
    } else {
      error.value = 'Aucune donnée disponible'
    }
  },
  { deep: false, flush: 'post' }
)

watch(() => props.type, () => initChart(chartId.value))
watch(() => props.theme, () => chartInstance.value && initChart(chartId.value))
watch(() => props.isPrintMode, () => initChart(chartId.value))
watch(() => props.printWidth, () => props.isPrintMode && initChart(chartId.value))
watch(() => props.printHeight, () => props.isPrintMode && initChart(chartId.value))

// Ré-init quand l’identité fonctionnelle du graphique change (évite watch deep sur chartOptions = boucles si le parent recrée l’objet à chaque rendu)
watch(
  () =>
    [props.chartId, props.type, props.showLegend, props.isPrintMode, props.showShareDataLabels] as const,
  () => {
    if (chartInstance.value) initChart(chartId.value)
  }
)

// Ré-init du graphique quand on change de breakpoint (resize / rotation)
let lastBreakpoint = ''
let resizeTimeout: ReturnType<typeof setTimeout> | null = null
function handleResize() {
  const bp = getResponsiveBreakpoint()
  if (bp !== lastBreakpoint && chartInstance.value?.chart) {
    lastBreakpoint = bp
    layoutBreakpoint.value = bp
    initChart(chartId.value)
  }
}
function scheduleResizeCheck() {
  if (resizeTimeout) clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(() => {
    resizeTimeout = null
    handleResize()
  }, 200)
}

onMounted(() => {
  lastBreakpoint = getResponsiveBreakpoint()
  layoutBreakpoint.value = lastBreakpoint
  // Avec sélecteur d'année, l'init est faite par le watch sur dataToUse (une fois selectedYear défini)
  if (!props.yearSelectorConfig?.enabled) {
    setTimeout(() => initChart(chartId.value), 150)
  }
  window.addEventListener('resize', scheduleResizeCheck)
})
onUnmounted(() => {
  if (resizeTimeout) clearTimeout(resizeTimeout)
  window.removeEventListener('resize', scheduleResizeCheck)
  destroyChart()
})

defineExpose({
  chart: chartInstance,
  updateData: updateChart,
  refresh: () => initChart(chartId.value),
  destroy: destroyChart,
  comparison: {
    add: handleAddComparison,
    removeLast: comparison.removeLastComparison,
    remove: comparison.removeComparison,
    clear: comparison.clearAllComparisons,
    territories: comparison.comparisonTerritories,
    count: comparison.comparisonCount
  }
})
</script>

<style scoped>
@import '@/assets/css/modern-dashboard.css';
</style>
