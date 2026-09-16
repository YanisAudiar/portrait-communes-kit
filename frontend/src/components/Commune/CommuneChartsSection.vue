<template>
  <section class="charts-main-section">
    <div class="charts-grid">
      <div
        v-for="(chartItem, index) in chartsConfig"
        :key="chartItem.id || index"
        class="chart-card"
        :id="`chart-container-${index}`"
      >
        <div class="chart-card-header">
          <h3 class="chart-card-title">{{ chartDisplayTitle(chartItem) }}</h3>
          <div class="chart-export-actions">
          <ChartExportButtons
            :data="chartItem.data"
            :capture-element-id="`chart-container-${index}`"
            :filename="exportFilename(chartItem)"
            :compact="true"
            :show-excel="false"
            :show-share="true"
            :id-chart="chartItem.id"
            :theme="activeTheme"
            :territoire="codeInsee"
            :selected-year="chartSelectedYears[chartItem.id] || null"
          />
          </div>
        </div>
        <ChartComponent
          :type="chartItem.type"
          :data="chartItem.data"
          :title="''"
          :theme="chartItem.theme || 'premium'"
          :height="chartHeight(chartItem)"
          :embedded="true"
          :label-field="chartItem.labelField || 'label'"
          :value-field="chartItem.valueField || 'value'"
          :dataset-label="chartItem.datasetLabel"
          :datasets="chartItem.datasets"
          :group-by-field="chartItem.groupByField"
          :show-legend="chartItem.showLegend !== false"
          :chart-id="chartItem.id"
          :chart-options="chartItem.chartOptions"
          :is-pyramid="chartItem.id === 'demo-pyramide'"
          :year-selector-config="yearSelectorConfig(chartItem)"
          :compare="chartItem.id === 'demo-evol-pop'"
          :compare-main-code="codeInsee"
          :compare-fetch-fn="getComparisonFetchFn ? getComparisonFetchFn(chartItem) : null"
          @year-changed="(year) => $emit('year-changed', chartItem.id, year)"
          @comparison-changed="(territories) => $emit('comparison-changed', chartItem.id, territories)"
        />
        <div class="chart-card-footer">
          <span class="chart-source">{{ chartSourceLabel(chartItem.source) }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import ChartComponent from '@/components/Charts/ChartComponent.vue'
import ChartExportButtons from '@/components/Common/ChartExportButtons.vue'

const props = defineProps({
  chartsConfig: { type: Array, required: true },
  currentThemeName: { type: String, default: 'Démographie' },
  codeInsee: { type: String, required: true },
  activeTheme: { type: String, default: 'demographie' },
  /** Objet { [chartId]: year } pour les sélecteurs d'année */
  chartSelectedYears: { type: Object, default: () => ({}) },
  /** Fonction (chartItem) => (codeInsee) => Promise<data> ou null */
  getComparisonFetchFn: { type: Function, default: null }
})

defineEmits(['year-changed', 'comparison-changed'])

/** Affiche le titre avec l'année entre parenthèses si yearForTitle est défini */
function chartDisplayTitle(chartItem) {
  const title = chartItem.title || ''
  const year = chartItem.yearForTitle
  if (year != null && year > 0) {
    return `${title} (${year})`
  }
  return title
}

function exportFilename(chartItem) {
  const base = `${props.currentThemeName}-${chartItem.title || 'chart'}`
  return base.replace(/\s+/g, '-').toLowerCase()
}

// Hauteur adaptée : doughnut/pie (légende), barres multi-séries / évolution âge (légende sous le graphique)
function chartHeight(chartItem) {
  const isCircular = chartItem.type === 'doughnut' || chartItem.type === 'pie'
  if (isCircular) return 420
  const multiBarLegend =
    chartItem.type === 'bar' &&
    (chartItem.id === 'demo-evolution-age' ||
      (Array.isArray(chartItem.datasets) && chartItem.datasets.length > 1))
  if (multiBarLegend) return 400
  return 350
}

function yearSelectorConfig(chartItem) {
  if (chartItem.id === 'demo-pyramide') {
    // Référence métier Insee récente ; si absente des données, repli sur la dernière année dispo
    return { enabled: true, yearField: 'numero_annee', defaultYear: 2022 }
  }
  return null
}

function chartSourceLabel(source) {
  const rawSource = String(source || 'Insee').trim()
  return /^sources?\s*:/i.test(rawSource) ? rawSource : `Sources : ${rawSource}`
}
</script>

