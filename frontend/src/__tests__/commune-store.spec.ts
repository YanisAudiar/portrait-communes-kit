import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCommuneStore } from '../stores/communeStore'
import { api } from '../services/api'

vi.mock('../services/api')

describe('CommuneStore - Critical State Management Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('loadCommunes - Data Loading', () => {
    it('should load communes and update state', async () => {
      const mockCommunes = [
        { properties: { code: '35001', nom: 'Acigné' } },
        { properties: { code: '35238', nom: 'Rennes' } }
      ]

      vi.mocked(api.getCommunes).mockResolvedValue({
        type: 'FeatureCollection',
        features: mockCommunes
      })

      const store = useCommuneStore()
      await store.loadCommunes()

      expect(store.communes).toHaveLength(2)
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('should handle API errors gracefully', async () => {
      vi.mocked(api.getCommunes).mockRejectedValue(new Error('Network error'))

      const store = useCommuneStore()
      await store.loadCommunes()

      expect(store.communes).toHaveLength(0)
      expect(store.loading).toBe(false)
      expect(store.error).toBeTruthy()
    })
  })

  describe('selectCommune - Selected State Management', () => {
    it('should update selectedCommuneCode', () => {
      const store = useCommuneStore()
      
      store.selectCommune('35238')
      
      expect(store.selectedCommuneCode).toBe('35238')
    })

    it('should clear selection when passed null', () => {
      const store = useCommuneStore()
      store.selectCommune('35238')
      
      store.selectCommune(null)
      
      expect(store.selectedCommuneCode).toBeNull()
    })
  })

  describe('getters - Computed State', () => {
    it('selectedCommune should return correct commune', async () => {
      const mockCommunes = [
        { properties: { code: '35001', nom: 'Acigné' } },
        { properties: { code: '35238', nom: 'Rennes' } }
      ]

      vi.mocked(api.getCommunes).mockResolvedValue({
        type: 'FeatureCollection',
        features: mockCommunes
      })

      const store = useCommuneStore()
      await store.loadCommunes()
      store.selectCommune('35238')

      expect(store.selectedCommune?.properties.nom).toBe('Rennes')
    })

    it('should return null when no commune selected', () => {
      const store = useCommuneStore()
      
      expect(store.selectedCommune).toBeNull()
    })
  })
})
