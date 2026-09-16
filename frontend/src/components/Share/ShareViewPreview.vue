<template>
  <main class="chart-container">
    <!-- Mode Graphique -->
    <div v-if="chartConfig && !idKpi" class="chart-wrapper">
      <h1 class="chart-title">{{ chartConfig.title }}</h1>
      <ChartComponent
        :type="chartConfig.type"
        :data="chartConfig.data"
        :theme="chartConfig.theme || 'premium'"
        :height="height"
        :embedded="true"
        :show-share-data-labels="chartTypeUsesShareOnlyDataLabels(chartConfig.type)"
        :label-field="chartConfig.labelField"
        :value-field="chartConfig.valueField"
        :dataset-label="chartConfig.datasetLabel"
        :datasets="chartConfig.datasets"
        :show-legend="chartConfig.showLegend"
        :chart-id="chartConfig.id"
        :chart-options="chartConfig.chartOptions"
        :year-selector-config="yearSelectorConfig"
      />
      <div class="chart-footer">
        <span class="source">Source : {{ chartConfig.source || 'Insee' }}</span>
      </div>
    </div>

    <!-- Mode Chiffre Clé (KPI) -->
    <div v-else-if="selectedKpi && idKpi" class="kpi-wrapper">
      <h1 class="chart-title">Chiffre clé</h1>
      <div class="kpi-display">
        <KPICard
          :value="selectedKpi.value"
          :label="selectedKpi.label"
          :icon="selectedKpi.icon"
          :format="selectedKpi.format"
          :decimals="selectedKpi.decimals"
          :value-display-override="selectedKpi.valueDisplayOverride"
        />
      </div>
      <div class="chart-footer">
        <span class="source">Source : Insee</span>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ChartComponent from '@/components/Charts/ChartComponent.vue'
import KPICard from '@/components/Commune/KPICard.vue'
import type { ChartConfig } from '@/composables/useThemeCharts'
import { chartTypeUsesShareOnlyDataLabels } from '@/services/chart/useChartConfigTypes'
import type { KPI } from '@/composables/kpis'

const props = defineProps<{
  chartConfig: ChartConfig | null
  selectedKpi: KPI | null
  idKpi: string | undefined
  height: number
  selectedYear: number | null
}>()

const yearSelectorConfig = computed(() =>
  props.selectedYear
    ? { enabled: true, yearField: 'numero_annee', defaultYear: props.selectedYear }
    : null
)
</script>

<style scoped>
.chart-container {
  flex: 1;
  background: white;
  border-radius: 1rem;
  padding: 2.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.chart-wrapper {
  width: 100%;
}

.chart-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e425d;
  margin-bottom: 2rem;
  text-align: center;
}

.chart-footer {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
}

.source {
  font-size: 0.75rem;
  color: #94a3b8;
  font-style: italic;
}

.kpi-display {
  display: flex;
  justify-content: center;
  padding: 2rem 0;
}

.kpi-display :deep(.kpi-card) {
  max-width: 400px;
  width: 100%;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

@media (max-width: 640px) {
  .chart-container {
    padding: 1.5rem;
  }
}
</style>
