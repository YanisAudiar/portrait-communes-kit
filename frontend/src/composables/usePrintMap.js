/**
 * Composable pour gérer la carte de contexte dans les exports PDF
 * Gère le chargement et le traitement des données géographiques
 */
import { ref, computed, watch } from 'vue'
import { api } from '@/services/api'
import { TERRITORY_COMMUNE_CODES } from '@/config/mapConfig'
import { siteConfig, hasTerritoryCommuneFilter } from '@/config/site'
import { filterFeaturesByCodes, calculateBbox } from '@/utils/mapHelpers'
import { processGeoJsonToPaths } from '@/utils/printMapHelpers'

export function usePrintMap(codeInsee, geojson = null) {
  const paths = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  /**
   * Vérifie si une commune doit être mise en évidence
   */
  const isHighlight = (commune) => {
    return commune.id === codeInsee.value || commune.codeConcat === codeInsee.value
  }

  /**
   * Path de la commune mise en évidence
   */
  const highlightedPath = computed(() => {
    return paths.value.find(p => isHighlight(p))
  })

  /**
   * Traite le GeoJSON et génère les paths SVG
   */
  const processGeoJson = (geojsonData) => {
    if (!geojsonData?.features?.length) {
      paths.value = []
      return
    }

    try {
      paths.value = processGeoJsonToPaths(geojsonData, calculateBbox)
    } catch (err) {
      console.error('Erreur traitement GeoJSON:', err)
      error.value = err
      paths.value = []
    }
  }

  /**
   * Charge les données depuis l'API
   */
  const loadData = async () => {
    if (geojson?.value?.features) {
      processGeoJson(geojson.value)
      return
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      const response = await api.getCommunesChoropleth({
        departement: siteConfig.territory.inseeDepartment,
        limit: 500
      })
      let data = response.data || response
      if (hasTerritoryCommuneFilter()) {
        data = filterFeaturesByCodes(data, TERRITORY_COMMUNE_CODES)
      }
      processGeoJson(data)
    } catch (e) {
      console.error('Erreur chargement carte:', e)
      error.value = e
      paths.value = []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Initialise la carte
   */
  const initialize = async () => {
    if (geojson?.value?.features?.length) {
      processGeoJson(geojson.value)
    } else {
      await loadData()
    }
  }

  // Watcher pour réagir aux changements de GeoJSON
  watch(() => geojson?.value, (newVal) => {
    if (newVal?.features?.length) {
      processGeoJson(newVal)
    }
  }, { deep: true })

  return {
    paths,
    highlightedPath,
    isLoading,
    error,
    isHighlight,
    initialize,
    loadData
  }
}

