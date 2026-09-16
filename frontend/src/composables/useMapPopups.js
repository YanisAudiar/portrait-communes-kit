/**
 * Composable pour gérer les popups de la carte
 */

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import maplibregl from 'maplibre-gl'
import { getFeatureCode, getFeatureName } from '@/utils/mapHelpers'
import { normalizeAndValidateCodeInsee } from '@/utils/codeInsee'
import { createClickPopupElement, createHoverPopupElement } from '@/utils/mapPopupDom'

export function useMapPopups() {
  const router = useRouter()
  const hoverPopup = ref(null)
  const hoveredFeatureId = ref(null)
  const hoveredCommuneCode = ref(null)
  const hoveredCommuneName = ref(null)

  /**
   * Navigation sécurisée vers la fiche commune (validation INSEE).
   */
  const navigateToCommune = (codeInsee) => {
    const validatedCode = normalizeAndValidateCodeInsee(codeInsee)
    if (!validatedCode) {
      console.warn('Code INSEE invalide, navigation ignorée:', codeInsee)
      return
    }
    router.push(`/commune/${validatedCode}`)
  }

  /**
   * Afficher une popup au clic
   */
  const showClickPopup = (map, lngLat, commune, codeInsee) => {
    if (!map) return

    const communeName = getFeatureName({ properties: commune })
    const popupContent = createClickPopupElement(communeName, codeInsee, navigateToCommune)

    new maplibregl.Popup({
      closeButton: true,
      closeOnClick: false,
      maxWidth: '320px',
      className: 'audiar-popup'
    })
      .setLngLat(lngLat)
      .setDOMContent(popupContent)
      .addTo(map)
  }

  /**
   * Créer ou mettre à jour la popup de survol
   */
  const updateHoverPopup = (map, e) => {
    if (!map || !e.features || e.features.length === 0 || !e.lngLat) return

    const feature = e.features[0]
    const communeName = getFeatureName(feature)
    const communeCode = getFeatureCode(feature)
    const currentFeatureId = feature.id

    const hasChanged = hoveredFeatureId.value !== currentFeatureId ||
                      hoveredCommuneCode.value !== communeCode ||
                      hoveredCommuneName.value !== communeName

    if (hasChanged) {
      resetPreviousHoverState(map)
      createNewHoverPopup(map, e.lngLat, communeName)
      hoveredFeatureId.value = currentFeatureId
      hoveredCommuneCode.value = communeCode
      hoveredCommuneName.value = communeName
      setFeatureHoverState(map, currentFeatureId, true)
      updateHoverStyle(map)
    } else if (hoverPopup.value) {
      try {
        hoverPopup.value.setLngLat(e.lngLat)
      } catch (err) {
        createNewHoverPopup(map, e.lngLat, communeName)
      }
    } else {
      createNewHoverPopup(map, e.lngLat, communeName)
      hoveredFeatureId.value = currentFeatureId
      hoveredCommuneCode.value = communeCode
      hoveredCommuneName.value = communeName
    }
  }

  /**
   * Créer une nouvelle popup de survol
   */
  const createNewHoverPopup = (map, lngLat, communeName) => {
    if (!map) return

    if (hoverPopup.value) {
      try {
        hoverPopup.value.remove()
      } catch (err) {
        // Ignorer les erreurs
      }
    }

    hoverPopup.value = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      closeOnMove: false,
      className: 'audiar-hover-popup',
      offset: [0, -10]
    })
      .setLngLat(lngLat)
      .setDOMContent(createHoverPopupElement(communeName))
      .addTo(map)
  }

  const resetPreviousHoverState = (map) => {
    if (hoveredFeatureId.value !== null) {
      setFeatureHoverState(map, hoveredFeatureId.value, false)
    }

    if (hoverPopup.value) {
      try {
        hoverPopup.value.remove()
      } catch (err) {
        // Ignorer
      }
      hoverPopup.value = null
    }
  }

  const setFeatureHoverState = (map, featureId, isHovered) => {
    if (!map) return

    try {
      map.setFeatureState(
        { source: 'communes', id: featureId },
        { hover: isHovered }
      )
    } catch (err) {
      // Ignorer si la feature n'existe plus
    }
  }

  const updateHoverStyle = (map) => {
    if (!map) return

    try {
      map.setPaintProperty('communes-hover', 'line-opacity', [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        1,
        0
      ])
    } catch (err) {
      // Ignorer les erreurs
    }
  }

  const cleanupPopups = (map) => {
    resetPreviousHoverState(map)
    hoveredFeatureId.value = null
    hoveredCommuneCode.value = null
    hoveredCommuneName.value = null

    if (map) {
      try {
        map.setPaintProperty('communes-hover', 'line-opacity', 0)
      } catch (err) {
        // Ignorer
      }
    }
  }

  return {
    hoverPopup,
    hoveredFeatureId,
    showClickPopup,
    updateHoverPopup,
    cleanupPopups,
    navigateToCommune
  }
}
