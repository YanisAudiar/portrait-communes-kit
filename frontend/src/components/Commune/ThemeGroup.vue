<template>
  <div
    :data-theme-id="themeGroup.id"
    class="theme-group"
  >
    <div
      class="theme-group-header"
      :class="{ active: activeThemeId === themeGroup.id }"
      :style="{ borderLeftColor: themeGroup.color, '--theme-color-rgb': themeGroup.colorRgb }"
    >
      <span class="theme-label">
        {{ themeGroup.label }}
        <template v-if="activeSubtheme">
          <span class="theme-subtheme">- {{ activeSubtheme }}</span>
        </template>
      </span>
    </div>

    <div class="theme-indicators">
      <template v-if="themeGroup.indicators.length">
        <IndicatorItem
          v-for="indicator in themeGroup.indicators"
          :key="indicator.id"
          :indicator="indicator"
          :theme-color="themeGroup.color"
          :theme-color-rgb="themeGroup.colorRgb"
          :is-active="selectedIndicatorId === indicator.id"
          :is-highlighted="hoveredIndicatorId === indicator.id"
          :is-subtheme-active="activeSubtheme === indicator.subtheme"
          @select="$emit('indicator-selected', indicator)"
          @hover="$emit('indicator-hover', indicator.id)"
        />
      </template>
      <p v-else class="theme-indicators-empty">
        Données en cours de structuration pour cette thématique.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import IndicatorItem from './IndicatorItem.vue'

interface ThemeGroup {
  id: string
  label: string
  color: string
  colorRgb: string
  indicators: any[]
  [key: string]: any
}

defineProps({
  themeGroup: {
    type: Object as () => ThemeGroup,
    required: true
  },
  activeThemeId: {
    type: String,
    default: null
  },
  activeSubtheme: {
    type: String,
    default: null
  },
  selectedIndicatorId: {
    type: String,
    default: null
  },
  hoveredIndicatorId: {
    type: String,
    default: null
  }
})

defineEmits<{
  (e: 'indicator-selected', indicator: any): void
  (e: 'indicator-hover', indicatorId: string | null): void
}>()
</script>

<style scoped>
@import '@/assets/css/components/indicators-list.css';
</style>

