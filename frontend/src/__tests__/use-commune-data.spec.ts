import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useCommuneData } from '../composables/useCommuneData'
import { api } from '../services/api'

vi.mock('../services/api')

describe('useCommuneData - Data Loading Composable Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loadCommuneData - Main Data Loading', () => {
    it('should load commune data successfully', async () => {
      const mockCommune = {
        properties: {
          code: '35238',
          nom: 'Rennes',
          population: 200000
        }
      }

      vi.mocked(api.getCommuneByCode).mockResolvedValue(mockCommune)

      const { loading, error, communeData, loadCommuneData } = useCommuneData('35238')
      
      await loadCommuneData()

      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
      expect(communeData.value).toEqual(mockCommune)
    })

    it('should set loading state during fetch', async () => {
      vi.mocked(api.getCommuneByCode).mockImplementation(() => 
        new Promise((resolve) => setTimeout(() => resolve({ properties: {} }), 100))
      )

      const { loading, loadCommuneData } = useCommuneData('35238')
      
      const promise = loadCommuneData()
      expect(loading.value).toBe(true)
      
      await promise
      expect(loading.value).toBe(false)
    })

    it('should handle errors gracefully', async () => {
      const errorMessage = 'Commune not found'
      vi.mocked(api.getCommuneByCode).mockRejectedValue(new Error(errorMessage))

      const { loading, error, communeData, loadCommuneData } = useCommuneData('99999')
      
      await loadCommuneData()

      expect(loading.value).toBe(false)
      expect(error.value).toBeTruthy()
      expect(communeData.value).toBeNull()
    })
  })

  describe('Reactive Code INSEE Changes', () => {
    it('should reload data when commune code changes', async () => {
      const codeInsee = ref('35238')
      
      vi.mocked(api.getCommuneByCode).mockResolvedValueOnce({
        properties: { code: '35238', nom: 'Rennes' }
      })

      const { communeData, loadCommuneData } = useCommuneData(codeInsee.value)
      await loadCommuneData()
      
      expect(communeData.value?.properties.nom).toBe('Rennes')
      
      // Change code
      vi.mocked(api.getCommuneByCode).mockResolvedValueOnce({
        properties: { code: '35001', nom: 'Acigné' }
      })
      
      codeInsee.value = '35001'
      await loadCommuneData()
      
      expect(communeData.value?.properties.nom).toBe('Acigné')
    })
  })

  describe('Error Recovery', () => {
    it('should recover from error on retry', async () => {
      vi.mocked(api.getCommuneByCode)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          properties: { code: '35238', nom: 'Rennes' }
        })

      const { error, communeData, loadCommuneData } = useCommuneData('35238')
      
      await loadCommuneData()
      expect(error.value).toBeTruthy()
      
      await loadCommuneData() // Retry
      expect(error.value).toBeNull()
      expect(communeData.value?.properties.nom).toBe('Rennes')
    })
  })
})
