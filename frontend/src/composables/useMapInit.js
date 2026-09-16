/**
 * Composable pour initialiser la carte MapLibre
 */

import { ref } from 'vue'
import maplibregl from 'maplibre-gl'
import { MAP_CONFIG, MAP_BASEMAP_STYLE_FRAGMENT, COMMUNES_LAYERS_STYLE } from '@/config/mapConfig'
import { isMobileDevice } from '@/utils/mapHelpers'

export function useMapInit(mapLayout = 'default') {
  const map = ref(null)
  const isLanding = mapLayout === 'landing'

  /**
   * Initialiser la carte MapLibre
   */
  const initMap = (container, onLoadCallback) => {
    const isMobile = isMobileDevice()

    // Sur la landing : attribution à gauche, pas de contrôle auto
    const attributionControl = isLanding ? false : !isMobile

    // Landing : carte décorative — aucune interaction (zoom, pan, clavier, tactile)
    const interactive = !isLanding

    // Créer l'instance de la carte
    map.value = new maplibregl.Map({
      container,
      style: {
        version: 8,
        // Glyphs pour les libellés des communes (couche symbol)
        glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
        sources: MAP_BASEMAP_STYLE_FRAGMENT.sources,
        layers: [...MAP_BASEMAP_STYLE_FRAGMENT.layers]
      },
      center: MAP_CONFIG.defaultCenter,
      zoom: isMobile ? MAP_CONFIG.defaultZoom.mobile : MAP_CONFIG.defaultZoom.desktop,
      maxZoom: MAP_CONFIG.maxZoom,
      minZoom: MAP_CONFIG.minZoom,
      interactive,
      // Désactivés explicitement sur landing (redondant avec interactive:false, clarifie l’intention)
      touchZoomRotate: interactive,
      doubleClickZoom: interactive,
      scrollZoom: interactive,
      boxZoom: !isMobile && interactive,
      dragRotate: !isMobile && interactive,
      dragPan: interactive,
      keyboard: !isMobile && interactive,
      // Performance
      renderWorldCopies: MAP_CONFIG.renderWorldCopies,
      maxTileCacheSize: MAP_CONFIG.maxTileCacheSize,
      attributionControl
    })
    
    // Callback au chargement de la carte
    if (onLoadCallback) {
      map.value.on('load', onLoadCallback)
    }
    
    // Ajouter les contrôles (position différente sur landing)
    addMapControls(isMobile, isLanding)
    
    // Optimisations tactiles : pas sur landing (carte non manipulable)
    if (isMobile && interactive) {
      setupMobileOptimizations()
    }
    
    return map.value
  }
  
  /**
   * Ajouter les contrôles de navigation
   * Sur landing : nav en bas à droite, attribution en bas à gauche
   */
  const addMapControls = (isMobile, isLandingLayout) => {
    if (!map.value) return

    // Landing : uniquement attribution (pas de +/- ni géoloc — évite d’inciter à manipuler la carte)
    if (isLandingLayout) {
      map.value.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left')
      return
    }

    // Pages carte « normales » : navigation + géoloc mobile
    const navControl = new maplibregl.NavigationControl({
      showCompass: !isMobile,
      showZoom: true,
      visualizePitch: false
    })
    map.value.addControl(navControl, 'top-left')

    if (isMobile && 'geolocation' in navigator) {
      const geolocateControl = new maplibregl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
      })
      map.value.addControl(geolocateControl, 'top-right')
    }
  }
  
  /**
   * Optimisations pour mobile
   */
  const setupMobileOptimizations = () => {
    if (!map.value) return
    
    map.value.on('touchstart', () => {
      map.value.getCanvas().style.cursor = 'grabbing'
    })
    
    map.value.on('touchend', () => {
      map.value.getCanvas().style.cursor = 'grab'
    })
  }
  
  /**
   * Ajouter les couches de communes
   */
  const addCommunesLayers = () => {
    if (!map.value) return
    
    // Ajouter les couches dans l'ordre
    map.value.addLayer(COMMUNES_LAYERS_STYLE.fill)
    map.value.addLayer(COMMUNES_LAYERS_STYLE.border)
    map.value.addLayer(COMMUNES_LAYERS_STYLE.labels)
    map.value.addLayer(COMMUNES_LAYERS_STYLE.hover)
  }
  
  /**
   * Détruire la carte
   */
  const destroyMap = () => {
    if (map.value) {
      map.value.remove()
      map.value = null
    }
  }
  
  return {
    map,
    initMap,
    addCommunesLayers,
    destroyMap
  }
}

