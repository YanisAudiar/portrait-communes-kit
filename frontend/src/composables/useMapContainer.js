/**
 * Composable pour la gestion du conteneur de carte
 * Centralise la logique de chargement des communes et de gestion de l'état
 */
import { ref, watch } from 'vue'
import { api } from '@/services/api'
import { useFilterStore, useCommuneStore, useMapStore } from '@/stores'
import { defaultInseeDepartment } from '@/config/site'

/**
 * Composable pour gérer le chargement des communes et l'état du conteneur
 * @param {Object} options - Options de configuration
 * @param {Function} options.loadCommunesData - Fonction pour charger les données
 * @param {Function} options.updateMapSource - Fonction pour mettre à jour la source de la carte
 * @param {Function} options.fitMapToData - Fonction pour ajuster la vue de la carte
 * @param {Function} options.getStats - Fonction pour obtenir les statistiques
 * @param {Object} options.map - Instance de la carte MapLibre
 * @param {Object} options.communesWithData - Référence réactive pour les communes avec données
 * @param {Object} options.dataYear - Référence réactive pour l'année des données
 * @param {String} options.selectedDepartement - Département sélectionné
 * @returns {Object} État et méthodes pour gérer le conteneur
 */
export function useMapContainer({
  loadCommunesData,
  updateMapSource,
  fitMapToData,
  getStats,
  map,
  communesWithData,
  dataYear,
  selectedDepartement
}) {
  const filterStore = useFilterStore()
  const communeStore = useCommuneStore()
  const mapStore = useMapStore()

  // État
  const loading = ref(false)
  const error = ref(null)

  /**
   * Charge les communes pour le département sélectionné
   * @param {String} departement - Code du département
   * @param {Function} onSuccess - Callback appelé en cas de succès
   */
  const loadCommunes = async (departement, onSuccess) => {
    loading.value = true
    error.value = null
    
    try {
      // Charger les données
      const geojson = await loadCommunesData(departement || defaultInseeDepartment())
      
      // Mettre à jour les données dans le store des communes
      communeStore.setCommunes(geojson.features || [])
      communeStore.updateStats({
        total: geojson.features?.length || 0,
        withData: communesWithData.value || 0,
        dataYear: dataYear.value || null
      })

      // Mettre à jour la source de la carte
      updateMapSource(map.value, geojson)
      
      // Ajuster la vue sur les données
      fitMapToData(map.value, geojson)
      
      // Appeler le callback de succès si fourni
      if (onSuccess) {
        onSuccess()
      }
      
    } catch (err) {
      error.value = api.handleError(err)
      console.error('❌ Erreur chargement communes:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Retourne une fonction pour configurer les watchers
   * Note: Les watchers doivent être configurés dans le composant parent
   */
  const getWatcherCallbacks = () => {
    return {
      onDepartementChange: (onLoadComplete) => {
        return () => {
          loadCommunes(filterStore.selectedDepartement, onLoadComplete)
        }
      },
      onPropChange: (selectedDepartement) => {
        return (newVal) => {
          if (newVal !== filterStore.selectedDepartement) {
            filterStore.setDepartement(newVal)
          }
        }
      }
    }
  }

  return {
    loading,
    error,
    loadCommunes,
    getWatcherCallbacks
  }
}

