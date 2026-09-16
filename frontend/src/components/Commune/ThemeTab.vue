<template>
  <div class="theme-tab" :style="themeStyleVariables">
    <div class="theme-header glass-panel glass-panel--muted">
      <div class="theme-header-content">
        <div
          v-if="themeConfig.icon"
          class="theme-header-icon"
        >
          <img :src="themeConfig.icon" :alt="themeConfig.title" loading="lazy" />
        </div>
        <div class="theme-header-text">
          <h2 class="theme-title">{{ themeConfig.title }}</h2>
          <p class="theme-description">{{ themeConfig.description }}</p>
        </div>
      </div>
    </div>

    <div class="subthemes-grid">
      <SubthemeGlassButton
        v-for="subtheme in subthemes"
        :key="subtheme.id"
        :label="subtheme.label"
        :theme-color="themeConfig.color"
        :theme-color-rgb="themeColorRgb"
        @click="navigateToSubtheme(subtheme.id)"
      />
    </div>

    <div class="subthemes-sections">
      <SubthemeSection
        v-for="subtheme in subthemes"
        :key="subtheme.id"
        :section-id="`${themeId}-${subtheme.id}`"
        :theme-id="themeId"
        :subtheme="subtheme"
        :chart-type="chartType"
        :chart-data="chartData"
      />
    </div>

    <ThemeEvolutionChart
      v-if="showEvolutionChart"
      :data="evolutionData"
      :theme-id="themeId"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { themes } from '@/config/indicatorsConfig'
import SubthemeGlassButton from '@/components/Commune/SubthemeGlassButton.vue'
import SubthemeSection from '@/components/Commune/SubthemeSection.vue'
import ThemeEvolutionChart from '@/components/Commune/ThemeEvolutionChart.vue'
import { getChartTypeForTheme } from '@/utils/themeCharts'
import '@/assets/css/components/theme-tab.css'

interface Subtheme {
  id: string
  label: string
  [key: string]: any
}

const props = defineProps({
  themeId: {
    type: String,
    required: true
  },
  subthemes: {
    type: Array as () => Subtheme[],
    required: true
  },
  chartData: {
    type: Array,
    default: () => []
  },
  evolutionData: {
    type: Array,
    default: () => []
  }
})

const themeConfig = computed(() => {
  const theme = themes[props.themeId]

  if (!theme) {
    return {
      title: 'Thématique',
      description: '',
      icon: '',
      color: '#f17e08'
    }
  }

  return {
    title: theme.label,
    description: theme.description,
    icon: theme.icon,
    color: theme.color || '#f17e08'
  }
})

const chartType = computed(() => getChartTypeForTheme(props.themeId))

const showEvolutionChart = computed(
  () => props.themeId === 'demographie' && props.evolutionData.length > 0
)

const hexToRgbString = (hex: string): string => {
  if (!hex) return '241, 126, 8'
  let sanitized = hex.replace('#', '')
  if (sanitized.length === 3) {
    sanitized = sanitized.split('').map((char) => `${char}${char}`).join('')
  }
  const bigint = parseInt(sanitized, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `${r}, ${g}, ${b}`
}

const themeColorRgb = computed(() => hexToRgbString(themeConfig.value.color))

const themeStyleVariables = computed(() => ({
  '--theme-accent': themeConfig.value.color,
  '--theme-accent-rgb': themeColorRgb.value
}))

const navigateToSubtheme = (subthemeId: string) => {
  const element = document.getElementById(`${props.themeId}-${subthemeId}`)
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }
}
</script>


