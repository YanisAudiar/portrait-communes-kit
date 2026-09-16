<template>
  <!-- Landing : classe dédiée pour désactiver les interactions résiduelles (CSS) -->
  <div class="map-wrapper" :class="{ 'map-layout-landing': props.mapLayout === 'landing' }">
    <div ref="mapContainer" class="map-container modern-map"></div>
    
    <MapLoadingOverlay :loading="loading" />
    <MapErrorOverlay :error="error" />
    
    <!-- Contrôles tactiles : masqués sur l’accueil (carte fixe) -->
    <MobileMapControls v-if="props.mapLayout !== 'landing'" />
  </div>
</template>

<script setup>
/**
 * Composant MapContainer - Conteneur principal pour la carte interactive
 * Refactorisé pour respecter la limite de 200 lignes par composant
 * Utilise des sous-composants pour les overlays et des composables pour la logique
 */
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useFilterStore, useMapStore } from '@/stores'
import { useMapInit } from '@/composables/useMapInit'
import { useMapData } from '@/composables/useMapData'
import { useMapPopups } from '@/composables/useMapPopups'
import { useMapEvents } from '@/composables/useMapEvents'
import { useMapContainer } from '@/composables/useMapContainer'
import { ENABLE_MAP_POPUPS } from '@/config/featureFlags'
import { defaultInseeDepartment } from '@/config/site'
import MapLoadingOverlay from './MapLoadingOverlay.vue'
import MapErrorOverlay from './MapErrorOverlay.vue'
import MobileMapControls from './MobileMapControls.vue'
import '@/assets/css/features/map-container.css'

// Props
const props = defineProps({
  selectedDepartement: {
    type: String,
    default: () => defaultInseeDepartment()
  },
  selectedIndicateur: {
    type: String,
    default: 'nb_menages'
  },
  mapLayout: {
    type: String,
    default: 'default'
  }
})

// Émissions
const emit = defineEmits(['stats-updated'])

// Références
const mapContainer = ref(null)
const filterStore = useFilterStore() // Utilisé pour les watchers
const mapStore = useMapStore() // Utilisé pour setMap()

// Composables
const { map, initMap, addCommunesLayers, destroyMap } = useMapInit(props.mapLayout)
const { 
  communesWithData, 
  dataYear, 
  loadCommunesData, 
  updateMapSource, 
  fitMapToData,
  getStats 
} = useMapData()
const popupsHandler = useMapPopups()
const { setupAllEvents } = useMapEvents(map, popupsHandler)

// Composable pour gérer le conteneur
const { loading, error, loadCommunes, getWatcherCallbacks } = useMapContainer({
  loadCommunesData,
  updateMapSource,
  fitMapToData,
  getStats,
  map,
  communesWithData,
  dataYear,
  selectedDepartement: props.selectedDepartement
})

// Callback appelé après le chargement complet
const onLoadComplete = () => {
  // Ajouter les couches si c'est la première fois
  if (!map.value.getLayer('communes-fill')) {
    addCommunesLayers()
    // Popups désactivées : la carte sert uniquement à afficher les communes (voir ENABLE_MAP_POPUPS)
    if (ENABLE_MAP_POPUPS && props.mapLayout !== 'landing') {
      setupAllEvents()
    }
  }

  // Émettre les stats vers le parent
  emit('stats-updated', getStats())
}

// Configuration des watchers
const watcherCallbacks = getWatcherCallbacks()
watch(() => filterStore.selectedDepartement, watcherCallbacks.onDepartementChange(onLoadComplete))
watch(() => props.selectedDepartement, watcherCallbacks.onPropChange(props.selectedDepartement))

/**
 * Initialise la carte
 */
const initializeMap = () => {
  initMap(mapContainer.value, () => {
    loadCommunes(props.selectedDepartement || defaultInseeDepartment(), onLoadComplete)
  })
  mapStore.setMap(map.value)
}

// Lifecycle
onMounted(() => {
  initializeMap()
})

onUnmounted(() => {
  destroyMap()
  mapStore.setMap(null)
})
</script>

<style scoped>
/* Styles importés depuis les fichiers CSS externes */
</style>
