<template>
  <button
    class="indicator-card"
    :class="{ 
      'indicator-available': indicator.available,
      'indicator-active': selectedIndicatorId === indicator.id 
    }"
    @click="$emit('indicator-selected', indicator)"
  >
    <div class="indicator-card-header">
      <h5 class="indicator-card-label">{{ indicator.label }}</h5>
      <span class="indicator-card-unit">{{ indicator.unit }}</span>
    </div>
    <p class="indicator-card-description">{{ indicator.description }}</p>
    <div v-if="indicator.available" class="indicator-badge">
      <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      Disponible
    </div>
  </button>
</template>

<script setup lang="ts">
/**
 * Composant pour afficher une carte d'indicateur individuelle.
 * Gère l'affichage et l'interaction avec un indicateur.
 */
interface Indicator {
  id: string
  label: string
  unit?: string
  description?: string
  available?: boolean
  [key: string]: any
}

defineProps({
  indicator: {
    type: Object as () => Indicator,
    required: true
  },
  selectedIndicatorId: {
    type: String,
    default: null
  }
})

defineEmits<{
  (e: 'indicator-selected', indicator: Indicator): void
}>()
</script>

<style scoped>
@import '@/assets/css/components/theme-indicators.css';
</style>

