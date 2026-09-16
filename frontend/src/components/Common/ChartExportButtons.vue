<template>
  <div class="chart-export-buttons" :class="{ compact }">
    <ChartExportButton
      v-if="showCsv"
      type="csv"
      :compact="compact"
      :disabled="isExporting"
      title="Télécharger en CSV"
      @click="handlers.handleExportCSV"
    />
    <ChartExportButton
      v-if="showExcel"
      type="excel"
      :compact="compact"
      :disabled="isExporting"
      title="Télécharger en Excel"
      @click="handlers.handleExportExcel"
    />
    <ChartExportButton
      v-if="showPng"
      type="png"
      :compact="compact"
      :disabled="isCapturing"
      title="Capturer en image PNG"
      @click="handlers.handleCapturePNG"
    />
    <ChartExportButton
      v-if="showShare"
      type="share"
      :compact="compact"
      title="Copier le lien et ouvrir dans un nouvel onglet"
      @click="handlers.handleCopyLink"
    />
    <div v-if="isExporting || isCapturing" class="export-loader">
      <div class="loader-spinner"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * ChartExportButtons - Boutons d'export pour graphiques (CSV, Excel, PNG, partage)
 * Délègue la logique à useChartExport et l'UI à ChartExportButton
 */
import { computed } from 'vue'
import { useChartExport, type ChartExportEmit } from '@/composables/useChartExport'
import type { ExportableData } from '@/composables/useDataExport'
import ChartExportButton from './ChartExportButton.vue'

const props = defineProps({
  data: {
    type: Array as () => ExportableData[],
    default: () => []
  },
  chartInstance: { type: Object, default: null },
  captureElementId: { type: String, default: '' },
  filename: { type: String, default: 'export' },
  showCsv: { type: Boolean, default: true },
  showExcel: { type: Boolean, default: true },
  showPng: { type: Boolean, default: true },
  showShare: { type: Boolean, default: true },
  compact: { type: Boolean, default: false },
  idChart: { type: String, default: '' },
  theme: { type: String, default: '' },
  territoire: { type: String, default: '' },
  selectedYear: { type: [Number, String], default: null }
})

const emit = defineEmits<{
  (e: 'export-start', type: string): void
  (e: 'export-success', type: string): void
  (e: 'export-error', type: string, error: string): void
}>()

const exportProps = computed(() => ({
  data: props.data,
  chartInstance: props.chartInstance,
  captureElementId: props.captureElementId,
  filename: props.filename,
  idChart: props.idChart,
  theme: props.theme,
  territoire: props.territoire,
  selectedYear: props.selectedYear
}))

const {
  isExporting,
  isCapturing,
  handleExportCSV,
  handleExportExcel,
  handleCapturePNG,
  handleCopyLink
} = useChartExport(() => exportProps.value, emit as ChartExportEmit)

const handlers = {
  handleExportCSV,
  handleExportExcel,
  handleCapturePNG,
  handleCopyLink
}
</script>

<style scoped>
.chart-export-buttons {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px;
}

.chart-export-buttons.compact {
  gap: 4px;
  padding: 4px;
}

/* Mobile : encarts très serrés pour éviter l'effet imposant */
@media (max-width: 768px) {
  .chart-export-buttons {
    gap: 2px;
    padding: 2px;
  }

  .chart-export-buttons.compact {
    gap: 2px;
    padding: 0;
  }
}

/* Très petit écran : espacement minimal */
@media (max-width: 480px) {
  .chart-export-buttons {
    gap: 1px;
    padding: 1px;
  }

  .chart-export-buttons.compact {
    gap: 1px;
    padding: 0;
  }
}

.export-loader {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
}

.loader-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #e0e0e0;
  border-top-color: #316d7b;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 640px) {
  .chart-export-buttons:not(.compact) {
    flex-wrap: wrap;
  }
}
</style>
