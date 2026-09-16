<template>
  <div v-if="layout">
    <PrintThemeCoverPage
      :theme="theme"
      :badge="layout.badge || '1'"
      :commune-name="communeName"
      :kpis="kpis"
    />

    <section
      class="print-theme-page"
      :style="{ '--theme-color': layout.color || theme.color }"
    >
      <PrintThemePageHeader
        :badge="layout.badge || '1'"
        :theme-tag="layout.themeTag || theme.label.toUpperCase()"
        :title="layout.title || theme.label.toUpperCase()"
        :theme-color="layout.color || theme.color"
      />

      <div
        v-for="(group, groupIndex) in layout.chartGroups"
        :key="`${theme.id}-group-${groupIndex}`"
        class="charts-group"
        :class="{ 'new-page': groupIndex > 0 }"
      >
        <div class="report-grid grid-2-cols">
          <PrintThemeChartCard
            v-for="(chart, chartIndex) in group.charts"
            :key="chartIndex"
            :title="chart.title"
            :is-single-value="isSingleValueChart(chart)"
            :single-value="getSingleValue(chart)"
            :single-label="getSingleLabel(chart)"
            :chart-type="chart.type || getChartTypeForTheme(theme.id)"
            :chart-data="datasetForChart(chart)"
            :chart-dimensions="dimensionsForChart(chart)"
            :chart-options="optionsForChart(chart)"
            :theme-id="theme.id"
            :palette="palette"
            :label-field="chart.labelField || 'label'"
            :value-field="chart.valueField || 'value'"
            :datasets="datasetsForChart(chart)"
            :show-legend="chart.showLegend !== false"
            :chart-id="chart.indicatorId"
            :source="chart.source"
            :full-width="isFullWidth(chart)"
            @chart-ready="$emit('chart-ready')"
          />
        </div>

        <p v-if="group.text" class="group-text">{{ group.text }}</p>
      </div>

      <PrintThemePageFooter
        :footnote="layout.footnote"
        :date="layout.date"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
/**
 * PrintThemePage - Page(s) d'impression d'un thème (page de garde + graphiques)
 * Délègue en-tête, cartes et footer aux sous-composants Print
 */
import { computed } from 'vue'
import PrintThemeCoverPage from './PrintThemeCoverPage.vue'
import PrintThemePageHeader from './PrintThemePageHeader.vue'
import PrintThemeChartCard from './PrintThemeChartCard.vue'
import PrintThemePageFooter from './PrintThemePageFooter.vue'
import { getPrintPalette } from '@/config/printPalettes'
import { usePrintCharts } from '@/composables/usePrintCharts'

/** Thème minimal attendu par les sous-composants Print */
export interface PrintThemeProp {
  id: string
  label: string
  color?: string
}

export type PrintKpiItem = {
  label: string
  value: string | number
  format?: string
  icon?: string
}

const props = withDefaults(
  defineProps<{
    theme: PrintThemeProp
    layout?: Record<string, any> | null
    chartData?: Record<string, any>
    evolutionData?: unknown[]
    communeName?: string
    kpis?: PrintKpiItem[]
    getChartTypeForTheme: (themeId: string) => string
    printChartWidth?: number
    printChartHeight?: number
    printDonutWidth?: number
    printDonutHeight?: number
    printLineChartWidth?: number
    printLineChartHeight?: number
    getDatasetByKey: (...args: unknown[]) => unknown
  }>(),
  {
    layout: null,
    chartData: () => ({}),
    evolutionData: () => [],
    communeName: '',
    kpis: () => [],
    printChartWidth: 450,
    printChartHeight: 320,
    printDonutWidth: 400,
    printDonutHeight: 400,
    printLineChartWidth: 500,
    printLineChartHeight: 280
  }
)

defineEmits<{ (e: 'chart-ready'): void }>()

const layout = computed(() => props.layout ?? null)

const palette = computed(() => getPrintPalette(props.theme.id))
const { getResolvedDataset, getChartDimensions } = usePrintCharts(props)

function datasetForChart(chart: Record<string, unknown>): unknown[] {
  const d = getResolvedDataset(chart)
  return Array.isArray(d) ? d : []
}

function dimensionsForChart(chart: Record<string, unknown>): { width: number; height: number } {
  const d = getChartDimensions(chart) as { width?: number; height?: number } | undefined
  return {
    width: d?.width ?? props.printChartWidth,
    height: d?.height ?? props.printChartHeight
  }
}

function datasetsForChart(chart: Record<string, unknown>): unknown[] | undefined {
  const ds = chart.datasets
  return Array.isArray(ds) ? ds : undefined
}

function optionsForChart(chart: Record<string, unknown>): Record<string, unknown> {
  return getOptimizedChartOptions(chart)
}

function isSingleValueChart(chart: {
  title?: string
  indicatorId?: string
  datasets?: { data?: unknown[] }[]
}): boolean {
  // Graphique barres emploi : cas une seule barre affiché comme valeur unique (PDF)
  const isEmploiEvolTotal =
    chart.indicatorId === 'emploi-evol-total' || chart.title?.trim() === "Nombre d'emploi"
  if (isEmploiEvolTotal) {
    const data = getResolvedDataset(chart)
    if (Array.isArray(data) && data.length === 1) return true
    if (chart.datasets?.[0]?.data?.length === 1) return true
  }
  return false
}

function getSingleValue(chart: Record<string, unknown>): string {
  const data = getResolvedDataset(chart) as { value?: number }[] | unknown[]
  let val = 0
  if (Array.isArray(data) && data.length > 0) {
    const first = data[0] as { value?: number }
    val = first?.value ?? (data[0] as number) ?? 0
  } else {
    const ds0 = (chart.datasets as { data?: number[] }[] | undefined)?.[0]?.data
    val = ds0?.[0] ?? 0
  }
  return Math.round(Number(val)).toLocaleString('fr-FR')
}

function getSingleLabel(chart: Record<string, unknown>): string {
  const data = getResolvedDataset(chart) as { label?: string; year?: string }[] | unknown[]
  let label = ''
  if (Array.isArray(data) && data.length > 0) {
    const first = data[0] as { label?: string; year?: string }
    label = first?.label ?? first?.year ?? ''
  } else {
    label = (chart.labels as string[] | undefined)?.[0] ?? ''
  }
  return `Emplois Totaux (${label})`
}

function getOptimizedChartOptions(chart: Record<string, unknown>): Record<string, unknown> {
  const raw = chart.chartOptions
  const baseOptions =
    raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {}
  const isDonut = (chart.type || props.getChartTypeForTheme(props.theme.id)) === 'doughnut'
  const legendConfig = {
    legend: {
      position: isDonut ? 'right' : 'top',
      align: 'center',
      labels: {
        usePointStyle: true,
        boxWidth: 8,
        font: { size: 10 },
        padding: 15
      }
    }
  }
  const existingPlugins = (baseOptions.plugins && typeof baseOptions.plugins === 'object'
    ? baseOptions.plugins
    : {}) as Record<string, unknown>
  const existingLegend =
    (existingPlugins.legend && typeof existingPlugins.legend === 'object'
      ? existingPlugins.legend
      : {}) as Record<string, unknown>
  const existingLabels =
    (existingLegend.labels && typeof existingLegend.labels === 'object'
      ? existingLegend.labels
      : {}) as Record<string, unknown>

  return {
    ...baseOptions,
    plugins: {
      ...existingPlugins,
      legend: {
        ...existingLegend,
        ...legendConfig.legend,
        labels: {
          ...existingLabels,
          ...(legendConfig.legend.labels as Record<string, unknown>)
        }
      }
    }
  }
}

function isFullWidth(chart: { fullWidth?: boolean }): boolean {
  return chart.fullWidth === true
}
</script>

<style scoped>
.print-theme-page {
  padding: 0;
  background-color: var(--bg-body, #f4f6f8);
  display: flex;
  flex-direction: column;
  width: 297mm;
  page-break-after: always;
  font-family: 'Montserrat', sans-serif;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.charts-group {
  display: flex;
  flex-direction: column;
  gap: 30px;
  page-break-inside: avoid;
  padding: 0 18mm;
}

.report-grid,
.grid-2-cols {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
  width: 100%;
}

.group-text {
  margin-top: 20px;
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--text-color, #2c3e50);
  background: #fff;
  padding: 15px;
  border-left: 4px solid var(--theme-color, #5a4c8c);
  border-radius: 4px;
}

@media print {
  .print-theme-page {
    width: 100%;
    height: 100%;
    background-color: var(--bg-body, #f4f6f8);
  }
}
</style>
