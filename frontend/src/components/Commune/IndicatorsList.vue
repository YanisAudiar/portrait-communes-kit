<template>
  <div class="indicators-list-container">
    <div
      ref="listContainer"
      class="indicators-list"
      @scroll="handleScroll"
    >
      <ThemeGroup
        v-for="themeGroup in indicatorsGrouped"
        :key="themeGroup.id"
        :theme-group="themeGroup"
        :active-theme-id="activeThemeId ?? undefined"
        :active-subtheme="activeSubthemes[themeGroup.id] ?? undefined"
        :selected-indicator-id="selectedIndicatorId ?? undefined"
        :hovered-indicator-id="hoveredIndicatorId ?? undefined"
        @indicator-selected="selectIndicator"
        @indicator-hover="handleHover"
      />
    </div>

    <ScrollIndicator
      :thumb-height="scrollThumbHeight"
      :thumb-position="scrollThumbPosition"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * Composant IndicatorsList - Liste scrollable des indicateurs groupés par thème
 * Refactorisé pour respecter la limite de 200 lignes par composant
 * Utilise des sous-composants pour la modularité
 */
import { computed } from 'vue'
import { getIndicatorsGroupedByTheme } from '@/config/indicatorsConfig'
import { useIndicatorsList } from '@/composables/useIndicatorsList'
import ThemeGroup from './ThemeGroup.vue'
import ScrollIndicator from './ScrollIndicator.vue'
import '@/assets/css/components/indicators-list.css'

const props = defineProps({
  selectedIndicatorId: {
    type: String,
    default: null
  },
  activeThemeId: {
    type: String,
    default: null
  }
})

const emit = defineEmits<{
  (e: 'indicator-selected', indicator: any): void
  (e: 'active-theme-changed', themeId: string): void
}>()

const {
  listContainer,
  hoveredIndicatorId,
  scrollThumbHeight,
  scrollThumbPosition,
  activeSubthemes,
  handleScroll,
  scrollToIndicator,
  scrollToTheme,
  hexToRgbString
} = useIndicatorsList(props, {
  emitActiveThemeChanged: (themeId: string) => emit('active-theme-changed', themeId)
})

const indicatorsGrouped = computed(() =>
  getIndicatorsGroupedByTheme().map((theme) => ({
    ...theme,
    colorRgb: hexToRgbString(theme.color)
  }))
)

const selectIndicator = (indicator: any) => {
  emit('indicator-selected', indicator)

  if (indicator?.theme) {
    activeSubthemes[indicator.theme] = indicator.subtheme || null
  }
}

const handleHover = (indicatorId: string | null) => {
  hoveredIndicatorId.value = indicatorId
}

defineExpose({
  scrollToIndicator,
  scrollToTheme
})
</script>

<style scoped>
@import '@/assets/css/modern-dashboard.css';
/* Styles importés depuis le fichier CSS externe */
</style>

