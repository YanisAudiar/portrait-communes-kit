<template>
  <div class="theme-cover-page" :style="{ '--theme-color': themeColor }">
    <PrintCoverHeader />

    <PrintCoverBanner
      :theme-color="themeColor"
      :theme-label="theme.label"
      :commune-name="communeName"
      :badge="badge"
    />

    <div class="cover-main-content">
      <PrintCoverTopicsList :topics="topicsList" :theme-color="themeColor" />

      <div class="cover-separator-vertical"></div>

      <PrintCoverKeyFigures :kpis="kpis" :theme-color="themeColor" />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * PrintThemeCoverPage - Page de garde d'un thème pour l'impression PDF
 * Assemble PrintCoverHeader, PrintCoverBanner, PrintCoverTopicsList, PrintCoverKeyFigures
 */
import { computed } from 'vue'
import { getIndicatorsByTheme } from '@/config/indicatorsConfig'
import PrintCoverHeader from './PrintCoverHeader.vue'
import PrintCoverBanner from './PrintCoverBanner.vue'
import PrintCoverTopicsList from './PrintCoverTopicsList.vue'
import PrintCoverKeyFigures from './PrintCoverKeyFigures.vue'

const props = defineProps({
  theme: {
    type: Object as () => { id: string; label: string; color?: string },
    required: true
  },
  badge: { type: String, default: '1' },
  communeName: { type: String, default: '' },
  kpis: {
    type: Array as () => { label: string; value: string | number; format?: string; icon?: string }[],
    default: () => []
  }
})

const themeColor = computed(() => props.theme?.color || '#7067A3')

const topicsList = computed(() => {
  const indicators = getIndicatorsByTheme(props.theme.id)
  const subthemes = [...new Set(indicators.map((ind: { subtheme?: string }) => ind.subtheme))].filter(
    (s): s is string => typeof s === 'string' && s.length > 0
  )

  if (subthemes.length === 0) {
    return indicators.slice(0, 5).map((ind: { title?: string; label?: string }, idx: number) => ({
      label: ind.title || ind.label || `Indicateur ${idx + 1}`,
      page: null as number | null
    }))
  }

  return subthemes.map((subtheme, idx) => ({
    label: subtheme,
    page: idx + 1
  }))
})
</script>

<style scoped>
.theme-cover-page {
  width: 100%;
  height: 188mm;
  page-break-after: always;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  overflow: hidden;
}

.cover-main-content {
  flex: 1;
  display: flex;
  padding: 12mm 18mm;
  gap: 15mm;
  background: #ffffff;
  min-height: 0;
  overflow: hidden;
}

.cover-separator-vertical {
  width: 2px;
  background: repeating-linear-gradient(
    to bottom,
    transparent,
    transparent 8px,
    rgba(0, 0, 0, 0.15) 8px,
    rgba(0, 0, 0, 0.15) 10px
  );
  flex-shrink: 0;
}

@media print {
  .theme-cover-page {
    padding: 0;
    margin: 0;
  }
}
</style>
