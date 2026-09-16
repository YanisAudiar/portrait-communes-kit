/**
 * Store pour gérer l'état de la carte interactive
 * (zoom, center, layers, etc.)
 */
import { defineStore } from 'pinia'
import { ref, computed, type ShallowRef, shallowRef } from 'vue'
import type { Map as MaplibreMap } from 'maplibre-gl'

export const useMapStore = defineStore('map', () => {
  const map: ShallowRef<MaplibreMap | null> = shallowRef(null)
  const isMapReady = ref(false)
  const currentZoom = ref(8)
  const currentCenter = ref<[number, number]>([-2.8, 48.1])
  const selectedFeatureId = ref<string | number | null>(null)
  const hoveredFeatureId = ref<string | number | null>(null)

  const isLegendCollapsed = ref(false)

  const showInfoModal = ref(false)
  const showSettingsModal = ref(false)

  const isZoomedIn = computed(() => currentZoom.value > 10)

  const hasSelectedFeature = computed(() =>
    selectedFeatureId.value !== null
  )

  function setMap(mapInstance: MaplibreMap) {
    map.value = mapInstance
    isMapReady.value = true
  }

  function setZoom(zoom: number) {
    currentZoom.value = zoom
    if (map.value) {
      map.value.setZoom(zoom)
    }
  }

  function setCenter(center: [number, number]) {
    currentCenter.value = center
    if (map.value) {
      map.value.setCenter(center)
    }
  }

  function flyTo(center: [number, number], zoom: number | null = null) {
    if (map.value) {
      const options: Record<string, unknown> = { center, duration: 1000 }
      if (zoom !== null) {
        options.zoom = zoom
        currentZoom.value = zoom
      }
      map.value.flyTo(options as Parameters<MaplibreMap['flyTo']>[0])
      currentCenter.value = center
    }
  }

  function selectFeature(featureId: string | number) {
    selectedFeatureId.value = featureId
  }

  function clearSelectedFeature() {
    selectedFeatureId.value = null
  }

  function setHoveredFeature(featureId: string | number) {
    hoveredFeatureId.value = featureId
  }

  function clearHoveredFeature() {
    hoveredFeatureId.value = null
  }

  function toggleLegend() {
    isLegendCollapsed.value = !isLegendCollapsed.value
  }

  function setLegendCollapsed(collapsed: boolean) {
    isLegendCollapsed.value = collapsed
  }

  function toggleInfoModal() {
    showInfoModal.value = !showInfoModal.value
  }

  function toggleSettingsModal() {
    showSettingsModal.value = !showSettingsModal.value
  }

  function closeModals() {
    showInfoModal.value = false
    showSettingsModal.value = false
  }

  function resetMapView() {
    setCenter([-2.8, 48.1])
    setZoom(8)
  }

  function getBounds() {
    return map.value ? map.value.getBounds() : null
  }

  function getBbox(): [number, number, number, number] | null {
    if (!map.value) return null

    const bounds = map.value.getBounds()
    return [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth()
    ]
  }

  return {
    map,
    isMapReady,
    currentZoom,
    currentCenter,
    selectedFeatureId,
    hoveredFeatureId,
    isLegendCollapsed,
    showInfoModal,
    showSettingsModal,
    isZoomedIn,
    hasSelectedFeature,
    setMap,
    setZoom,
    setCenter,
    flyTo,
    selectFeature,
    clearSelectedFeature,
    setHoveredFeature,
    clearHoveredFeature,
    toggleLegend,
    setLegendCollapsed,
    toggleInfoModal,
    toggleSettingsModal,
    closeModals,
    resetMapView,
    getBounds,
    getBbox
  }
})
