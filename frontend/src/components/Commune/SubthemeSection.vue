<template>
  <section
    class="subtheme-section glass-panel glass-panel--muted"
    :id="sectionId"
  >
    <h3 class="subtheme-section-title">{{ subtheme.label }}</h3>
    <div class="subtheme-section-content">
      <ChartComponent
        :type="chartType"
        :data="chartData"
        :title="subtheme.label"
        :theme="subtheme.chartTheme || themeId"
        :height="300"
        label-field="label"
        value-field="value"
        dataset-label="Données"
        @chart-ready="() => {}"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import ChartComponent from '@/components/Charts/ChartComponent.vue'

interface Subtheme {
  label: string
  chartTheme?: string
  [key: string]: any
}

const props = defineProps({
  sectionId: {
    type: String,
    required: true
  },
  themeId: {
    type: String,
    required: true
  },
  subtheme: {
    type: Object as () => Subtheme,
    required: true
  },
  chartType: {
    type: String,
    required: true
  },
  chartData: {
    type: Array,
    default: () => []
  }
})
</script>


