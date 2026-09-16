import { computed, ref } from 'vue'
import { useFilterStore } from '@/stores/filterStore'
import { useCommuneStore } from '@/stores/communeStore'
import { useMapStore } from '@/stores/mapStore'

/**
 * Centralise toute la logique de coordination entre les stores utilisés par la vue Dashboard.
 * On y regroupe la configuration de la carte, les filtres sélectionnés et les actions sur les modales.
 */
export function useDashboardLayout() {
  // Stores Pinia utilisés dans la vue
  const filterStore = useFilterStore()
  const communeStore = useCommuneStore()
  const mapStore = useMapStore()

  // État local lié aux préférences de la carte (thème, affichage population)
  const mapTheme = ref('standard')
  const showPopulation = ref(true)

  /**
   * Filtres exposés à la carte : on conserve le binding bi-directionnel afin
   * de garder la compatibilité avec la vue existante.
   */
  const selectedDepartement = computed({
    get: () => filterStore.selectedDepartement,
    set: (value) => filterStore.setDepartement(value)
  })

  const selectedIndicateur = computed({
    get: () => filterStore.selectedIndicateur,
    set: (value) => filterStore.setIndicateur(value)
  })

  /**
   * Statistiques agrégées depuis le store pour alimenter l'entête.
   * On conserve une valeur par défaut afin d'éviter les affichages vides.
   */
  const communesCount = computed(() => communeStore.stats.total)
  const communesWithData = computed(() => communeStore.stats.withData)
  const dataYear = computed(() => communeStore.stats.dataYear)

  const headerStats = computed(() => ({
    communesCount: communesCount.value || 1208,
    precision: 'medium'
  }))

  /**
   * Synchronise les statistiques remontées par la carte avec le store Pinia.
   */
  const updateStats = (stats) => {
    communeStore.updateStats({
      total: stats.communesCount || 0,
      withData: stats.communesWithData || 0,
      dataYear: stats.dataYear || null
    })
  }

  /**
   * Gestion des modales d'information / paramètres exposées par la vue.
   */
  const showInfo = () => {
    mapStore.toggleInfoModal()
  }

  const showSettings = () => {
    mapStore.toggleSettingsModal()
  }

  const closeModals = () => {
    mapStore.closeModals()
  }

  return {
    mapTheme,
    showPopulation,
    selectedDepartement,
    selectedIndicateur,
    headerStats,
    communesCount,
    communesWithData,
    dataYear,
    updateStats,
    showInfo,
    showSettings,
    closeModals,
    // Expose uniquement les valeurs nécessaires du store au lieu du store entier
    showInfoModal: computed(() => mapStore.showInfoModal),
    showSettingsModal: computed(() => mapStore.showSettingsModal)
  }
}


