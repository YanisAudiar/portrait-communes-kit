<template>
  <div class="evolution-chart glass-panel glass-panel--muted">
    <ChartComponent
      type="line"
      :data="data"
      :title="title"
      :subtitle="subtitle"
      :theme="themeId"
      :height="350"
      label-field="label"
      value-field="value"
      dataset-label="Nombre de ménages"
      :options="chartOptions"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ChartComponent from '@/components/Charts/ChartComponent.vue'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  themeId: {
    type: String,
    default: 'demographie'
  },
  title: {
    type: String,
    default: '📈 Évolution des ménages'
  },
  subtitle: {
    type: String,
    default: 'Évolution temporelle du nombre de ménages'
  }
})

const chartOptions = computed(() => ({
  plugins: {
    datalabels: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback(value: number | string) {
          return Number(value).toLocaleString()
        }
      }
    }
  }
}))
</script>


