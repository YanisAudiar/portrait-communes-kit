<template>
  <div class="map-area animate-fade-in-up delay-100">
    <MapContainer
      :selectedDepartement="selectedDepartement"
      :selectedIndicateur="selectedIndicateur"
      :map-layout="mapLayout"
      @stats-updated="forwardStatsUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import MapContainer from '@/components/Map/MapContainer.vue'

/**
 * Zone centrale du dashboard contenant la carte interactive.
 * Le composant reste volontairement simple : il reçoit les filtres et
 * relaie l'évènement de mise à jour des statistiques.
 */
defineProps({
  selectedDepartement: {
    type: [String, Number, Object] as any,
    default: null
  },
  selectedIndicateur: {
    type: [String, Object] as any,
    default: null
  },
  mapLayout: {
    type: String as () => 'default' | 'landing',
    default: 'default'
  }
})

const emit = defineEmits<{
  (e: 'stats-updated', payload: any): void
}>()

const forwardStatsUpdate = (payload: any) => {
  emit('stats-updated', payload)
}
</script>


