/**
 * Store pour gérer les données des communes
 * (liste, sélection, détails, etc.)
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/services/api'

interface CommuneFeature {
  type: string
  properties: Record<string, unknown>
  geometry?: Record<string, unknown>
}

interface CommuneStats {
  total: number
  withData: number
  dataYear: number | null
}

export const useCommuneStore = defineStore('commune', () => {
  const communes = ref<CommuneFeature[]>([])
  const selectedCommune = ref<CommuneFeature | null>(null)
  const communeDetails = ref<Record<string, unknown> | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const stats = ref<CommuneStats>({
    total: 0,
    withData: 0,
    dataYear: null
  })

  const communesCount = computed(() => communes.value.length)

  const communesWithData = computed(() =>
    communes.value.filter(c => c.properties?.has_data).length
  )

  const hasSelectedCommune = computed(() =>
    selectedCommune.value !== null
  )

  const selectedCommuneCode = computed(() =>
    (selectedCommune.value?.properties?.code ||
    selectedCommune.value?.properties?.code_insee_concat) as string | undefined
  )

  async function fetchCommunesChoropleth(options: Record<string, unknown> = {}) {
    loading.value = true
    error.value = null

    try {
      const response = await api.getCommunesChoropleth(options)
      const features = response.features ?? response.data?.features
      if (Array.isArray(features) && features.length > 0) {
        communes.value = features
      }
      const meta = response.metadata
      if (meta) {
        stats.value = {
          total: meta.count ?? meta.total ?? communes.value.length,
          withData: meta.countWithData ?? 0,
          dataYear: meta.dataYear ?? null
        }
      }

      return response
    } catch (err) {
      error.value = api.handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  function setCommunes(newCommunes: CommuneFeature[]) {
    if (Array.isArray(newCommunes)) {
      communes.value = newCommunes
    } else {
      communes.value = []
    }
  }

  async function fetchCommuneByCode(codeInsee: string) {
    loading.value = true
    error.value = null

    try {
      const commune = await api.getCommuneByCode(codeInsee)
      selectedCommune.value = commune
      return commune
    } catch (err) {
      error.value = api.handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchCommuneDetails(codeInsee: string) {
    loading.value = true
    error.value = null

    try {
      const [demographics, housing, evolution] = await Promise.all([
        api.getCommuneDemographics(codeInsee),
        api.getCommuneHousing(codeInsee),
        api.getCommuneEvolution(codeInsee)
      ])

      communeDetails.value = {
        demographics,
        housing,
        evolution
      }

      return communeDetails.value
    } catch (err) {
      error.value = api.handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function searchCommunes(searchTerm: string, limit = 10) {
    loading.value = true
    error.value = null

    try {
      const response = await api.searchCommunes(searchTerm, limit)
      return response.features || []
    } catch (err) {
      error.value = api.handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  function selectCommune(commune: CommuneFeature) {
    selectedCommune.value = commune
  }

  function clearSelectedCommune() {
    selectedCommune.value = null
    communeDetails.value = null
  }

  function updateStats(newStats: Partial<CommuneStats>) {
    stats.value = { ...stats.value, ...newStats }
  }

  function clearError() {
    error.value = null
  }

  function reset() {
    communes.value = []
    selectedCommune.value = null
    communeDetails.value = null
    error.value = null
    stats.value = {
      total: 0,
      withData: 0,
      dataYear: null
    }
  }

  return {
    communes,
    selectedCommune,
    communeDetails,
    loading,
    error,
    stats,
    communesCount,
    communesWithData,
    hasSelectedCommune,
    selectedCommuneCode,
    fetchCommunesChoropleth,
    fetchCommuneByCode,
    fetchCommuneDetails,
    searchCommunes,
    selectCommune,
    clearSelectedCommune,
    updateStats,
    setCommunes,
    clearError,
    reset
  }
})
