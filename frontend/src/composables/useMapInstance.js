/**
 * Composable pour la gestion de l'instance MapLibre
 * Fournit une API générique pour créer et gérer une carte interactive
 */

import { ref, onMounted, onUnmounted } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

/**
 * Configuration par défaut de la carte
 */
const DEFAULT_MAP_CONFIG = {
  center: [-1.68, 48.11],
  zoom: 10,
  style: {
    version: 8,
    sources: {
      'osm-raster': {
        type: 'raster',
        tiles: [
          'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
          'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
          'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
        ],
        tileSize: 256,
        attribution: '© OpenStreetMap contributors'
      }
    },
    layers: [
      {
        id: 'osm-raster-layer',
        type: 'raster',
        source: 'osm-raster',
        minzoom: 0,
        maxzoom: 22
      }
    ]
  }
}

/**
 * Hook pour gérer une instance de carte MapLibre
 * @param {Object} options - Options de configuration
 * @returns {Object} Instance et méthodes de gestion
 */
export function useMapInstance(options = {}) {
  const map = ref(null)
  const loading = ref(true)
  const error = ref(null)
  const mapContainer = ref(null)

  /**
   * Initialiser la carte
   * @param {HTMLElement} container - Élément DOM pour la carte
   * @param {Object} config - Configuration MapLibre
   */
  const initMap = async (container, config = {}) => {
    if (!container) {
      console.warn('⚠️ Container manquant pour initMap')
      return
    }

    mapContainer.value = container
    loading.value = true
    error.value = null

    try {
      const mapConfig = {
        container,
        ...DEFAULT_MAP_CONFIG,
        ...config
      }

      map.value = new maplibregl.Map(mapConfig)

      // Attendre le chargement
      await new Promise((resolve, reject) => {
        map.value.on('load', () => {
          loading.value = false
          resolve()
        })

        map.value.on('error', (e) => {
          console.error('❌ Erreur carte:', e)
          error.value = 'Erreur lors du chargement de la carte'
          loading.value = false
          reject(e)
        })
      })

      return map.value
    } catch (err) {
      console.error('❌ Erreur initialisation carte:', err)
      error.value = 'Impossible d\'initialiser la carte'
      loading.value = false
      throw err
    }
  }

  /**
   * Ajouter ou mettre à jour une source GeoJSON
   * @param {String} sourceId - ID de la source
   * @param {Object} geojson - Données GeoJSON
   */
  const setGeoJSONSource = (sourceId, geojson) => {
    if (!map.value) {
      console.warn('⚠️ Carte non initialisée')
      return
    }

    if (!map.value.getSource(sourceId)) {
      map.value.addSource(sourceId, {
        type: 'geojson',
        data: geojson
      })
    } else {
      map.value.getSource(sourceId).setData(geojson)
    }
  }

  /**
   * Ajouter une couche si elle n'existe pas
   * @param {Object} layerConfig - Configuration de la couche
   */
  const addLayerIfNotExists = (layerConfig) => {
    if (!map.value) {
      console.warn('⚠️ Carte non initialisée')
      return
    }

    if (!map.value.getLayer(layerConfig.id)) {
      map.value.addLayer(layerConfig)
    }
  }

  /**
   * Mettre à jour une propriété de style
   * @param {String} layerId - ID de la couche
   * @param {String} property - Propriété à modifier
   * @param {*} value - Nouvelle valeur
   */
  const updateLayerPaint = (layerId, property, value) => {
    if (!map.value || !map.value.getLayer(layerId)) {
      return
    }

    map.value.setPaintProperty(layerId, property, value)
  }

  /**
   * Zoomer sur un ensemble de coordonnées
   * @param {Array} coordinates - [[lng, lat], ...] ou LngLatBounds
   * @param {Object} options - Options de fitBounds
   */
  const fitBounds = (coordinates, options = {}) => {
    if (!map.value || !coordinates || coordinates.length === 0) {
      console.warn('⚠️ fitBounds: Carte ou coordonnées manquantes')
      return
    }

    const bounds = new maplibregl.LngLatBounds()
    
    if (Array.isArray(coordinates[0])) {
      coordinates.forEach(coord => bounds.extend(coord))
    } else {
      bounds.extend(coordinates)
    }

    map.value.fitBounds(bounds, {
      padding: 60,
      duration: 1000,
      ...options
    })
  }

  /**
   * Contrôles de zoom
   */
  const zoomIn = () => {
    if (map.value) map.value.zoomIn({ duration: 300 })
  }

  const zoomOut = () => {
    if (map.value) map.value.zoomOut({ duration: 300 })
  }

  /**
   * Nettoyer l'instance de carte
   */
  const destroyMap = () => {
    if (map.value) {
      map.value.remove()
      map.value = null
    }
  }

  // Nettoyage automatique au démontage
  onUnmounted(() => {
    destroyMap()
  })

  return {
    map,
    loading,
    error,
    mapContainer,
    initMap,
    setGeoJSONSource,
    addLayerIfNotExists,
    updateLayerPaint,
    fitBounds,
    zoomIn,
    zoomOut,
    destroyMap
  }
}

