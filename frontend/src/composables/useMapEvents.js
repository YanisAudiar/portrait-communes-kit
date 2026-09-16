/**
 * Composable pour gérer les événements de la carte
 */

import { api } from '@/services/api'

export function useMapEvents(map, popupsHandler) {
  /**
   * Configurer les événements de clic sur les communes
   */
  const setupClickEvents = () => {
    if (!map.value) return
    
    map.value.on('click', 'communes-fill', async (e) => {
      const commune = e.features[0].properties
      
      // Charger plus de détails si nécessaire
      let detailedCommune = commune
      if (commune.code && !commune.superficie) {
        try {
          detailedCommune = await api.getCommuneByCode(commune.code)
          detailedCommune = detailedCommune.properties || commune
        } catch (err) {
          if (import.meta.env.DEV) {
            console.warn('⚠️ Impossible de charger les détails:', err)
          }
        }
      }
      
      const codeInsee = detailedCommune.code || detailedCommune.code_insee_concat
      
      // Afficher la popup de clic
      popupsHandler.showClickPopup(map.value, e.lngLat, detailedCommune, codeInsee)
    })
  }
  
  /**
   * Configurer les événements de survol sur les communes
   */
  const setupHoverEvents = () => {
    if (!map.value) return
    
    // Mouse enter
    map.value.on('mouseenter', 'communes-fill', (e) => {
      map.value.getCanvas().style.cursor = 'pointer'
      popupsHandler.updateHoverPopup(map.value, e)
    })
    
    // Mouse leave
    map.value.on('mouseleave', 'communes-fill', () => {
      map.value.getCanvas().style.cursor = ''
      popupsHandler.cleanupPopups(map.value)
    })
    
    // Mouse move (pour suivre la souris)
    map.value.on('mousemove', 'communes-fill', (e) => {
      popupsHandler.updateHoverPopup(map.value, e)
    })
  }
  
  /**
   * Configurer tous les événements de la carte
   */
  const setupAllEvents = () => {
    setupClickEvents()
    setupHoverEvents()
  }
  
  return {
    setupClickEvents,
    setupHoverEvents,
    setupAllEvents
  }
}

