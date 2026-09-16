/**
 * Composable pour gérer le chargement des données de la carte
 */

import { ref } from 'vue'
import { api } from '@/services/api'
import { TERRITORY_COMMUNE_CODES, MAP_CONFIG } from '@/config/mapConfig'
import { siteConfig, hasTerritoryCommuneFilter } from '@/config/site'
import { filterFeaturesByCodes, calculateBbox, isValidBbox } from '@/utils/mapHelpers'

export function useMapData() {
  const communesCount = ref(0)
  const communesWithData = ref(0)
  const dataYear = ref(null)
  
  /**
   * Charger les données des communes depuis l'API
   */
  const loadCommunesData = async (departement = siteConfig.territory.inseeDepartment) => {
    const options = {
      limit: 500
    }
    if (departement) {
      options.departement = departement
    }

    const response = await api.getCommunesChoropleth(options)

    let geojson = response.data || response

    if (hasTerritoryCommuneFilter()) {
      geojson = filterFeaturesByCodes(geojson, TERRITORY_COMMUNE_CODES)
    }

    if (!geojson.features || geojson.features.length === 0) {
      throw new Error(`Aucune commune de ${siteConfig.territory.name} trouvée après filtrage`)
    }
    
    // Mettre à jour les statistiques
    communesCount.value = geojson.features.length
    communesWithData.value = response.metadata?.countWithData || 0
    dataYear.value = response.metadata?.dataYear || null
    
    return geojson
  }
  
  /**
   * Ajouter ou mettre à jour la source de données sur la carte
   */
  const updateMapSource = (map, geojson) => {
    if (!map) return
    
    if (map.getSource('communes')) {
      // Source existe déjà, mettre à jour les données
      map.getSource('communes').setData(geojson)
    } else {
      // Créer la source
      map.addSource('communes', {
        type: 'geojson',
        data: geojson
      })
    }
  }
  
  /**
   * Ajuster la vue de la carte sur les communes chargées
   */
  const fitMapToData = (map, geojson) => {
    if (!map || !geojson.features || geojson.features.length === 0) return
    
    try {
      // Vérifier si les coordonnées sont valides
      const firstCoord = geojson.features[0].geometry.coordinates[0][0][0]
      
      if (Array.isArray(firstCoord) && !isNaN(firstCoord[0]) && !isNaN(firstCoord[1])) {
        const bbox = calculateBbox(geojson)
        
        if (isValidBbox(bbox)) {
          map.fitBounds(bbox, { padding: 20 })
        } else {
          // Fallback sur l'emprise du territoire
          map.fitBounds(MAP_CONFIG.mapBounds, { padding: 20 })
        }
      } else {
        map.fitBounds(MAP_CONFIG.mapBounds, { padding: 20 })
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('⚠️ Erreur calcul bbox, utilisation emprise territoire:', error)
      }
      map.fitBounds(MAP_CONFIG.mapBounds, { padding: 20 })
    }
  }
  
  /**
   * Obtenir les statistiques actuelles
   */
  const getStats = () => ({
    communesCount: communesCount.value,
    communesWithData: communesWithData.value,
    dataYear: dataYear.value
  })
  
  return {
    communesCount,
    communesWithData,
    dataYear,
    loadCommunesData,
    updateMapSource,
    fitMapToData,
    getStats
  }
}

