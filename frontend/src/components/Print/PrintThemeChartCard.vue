<template>
  <div
    class="card chart-container"
    :class="{ 'full-width': fullWidth }"
  >
    <div v-if="title" class="card-header">
      <h3 class="chart-title">{{ title.toUpperCase() }}</h3>
    </div>

    <div class="card-body">
      <div v-if="isSingleValue" class="single-kpi-container">
        <div class="single-kpi-value">{{ singleValue }}</div>
        <div class="single-kpi-label">{{ singleLabel }}</div>
      </div>

      <ChartComponent
        v-else
        :type="chartType"
        :data="chartData"
        :theme="themeId"
        :is-print-mode="true"
        :print-width="chartDimensions.width"
        :print-height="chartDimensions.height"
        :responsive-height="false"
        :show-legend="showLegend"
        :chart-id="chartId"
        :chart-options="chartOptions"
        :print-palette="palette ?? undefined"
        :label-field="labelField"
        :value-field="valueField"
        :datasets="datasets"
        dataset-label="Données"
        @chart-ready="$emit('chart-ready')"
      />
    </div>

    <p v-if="source" class="chart-source">Source : {{ source }}</p>
  </div>
</template>

<script setup lang="ts">
import ChartComponent from '@/components/Charts/ChartComponent.vue'
import type { PrintPalette } from '@/config/printPalettes'

withDefaults(
  defineProps<{
    title?: string
    isSingleValue: boolean
    singleValue?: string
    singleLabel?: string
    chartType?: string
    chartData?: unknown[]
    chartDimensions?: { width: number; height: number }
    chartOptions?: Record<string, unknown>
    themeId?: string
    palette?: PrintPalette | null
    labelField?: string
    valueField?: string
    datasets?: unknown[]
    showLegend?: boolean
    /** ID indicateur (ex. demo-evolution-age) pour axe effectifs / légende PDF */
    chartId?: string
    source?: string
    fullWidth?: boolean
  }>(),
  {
    labelField: 'label',
    valueField: 'value',
    showLegend: true,
    chartId: '',
    fullWidth: false,
    chartDimensions: () => ({ width: 450, height: 320 }),
    chartType: 'bar'
  }
)

defineEmits<{ (e: 'chart-ready'): void }>()
</script>

<style scoped>
.card,
.chart-container {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  page-break-inside: avoid;
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid #e0e0e0;
}

.card.full-width {
  grid-column: 1 / -1;
}

.card-header {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--bg-body, #f4f6f8);
}

.card-body {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  position: relative;
}

.single-kpi-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  text-align: center;
}

.single-kpi-value {
  font-size: 3.5rem;
  font-weight: 800;
  color: var(--primary-color, #5a4c8c);
  line-height: 1.2;
  margin-bottom: 10px;
  font-family: 'Montserrat', sans-serif;
}

.single-kpi-label {
  font-size: 1rem;
  color: #7f8c8d;
  font-weight: 500;
  text-transform: uppercase;
}

.chart-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--primary-color, #5a4c8c);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-align: left;
  border-left: 5px solid var(--primary-color, #5a4c8c);
  padding-left: 12px;
}

.chart-source {
  margin-top: 10px;
  font-size: 0.7rem;
  color: #888;
  font-style: italic;
  text-align: right;
}

@media print {
  .card {
    box-shadow: none;
    border: 1px solid #eee;
    break-inside: avoid;
  }
}
</style>
