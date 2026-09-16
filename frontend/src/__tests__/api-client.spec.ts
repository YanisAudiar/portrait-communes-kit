import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { api } from '../services/api'

vi.mock('axios')
const mockedAxios = axios as any

describe('API Client - Critical HTTP Calls Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getCommuneDemographics - Data Fetching', () => {
    it('should fetch demographics for specific commune', async () => {
      const mockData = {
        pyramide: [{ numero_annee: 2021, value: 100 }],
        menages: [{ type: 'Famille', nb: 50 }]
      }

      mockedAxios.get.mockResolvedValue({ data: mockData })

      const result = await api.getCommuneDemographics('35238')

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/data/communes/35238/demographie')
      )
      expect(result).toEqual(mockData)
    })

    it('should handle 404 for non-existent commune', async () => {
      mockedAxios.get.mockRejectedValue({
        response: { status: 404, data: { message: 'Commune not found' } }
      })

      await expect(api.getCommuneDemographics('99999')).rejects.toThrow()
    })

    it('should handle network errors', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'))

      await expect(api.getCommuneDemographics('35238')).rejects.toThrow()
    })
  })

  describe('Error Handling - handleError', () => {
    it('should format network errors', () => {
      const error = { code: 'ECONNREFUSED', message: 'Connection refused' }
      
      const message = api.handleError(error)
      
      expect(message).toContain('connexion')
    })

    it('should format 500 errors', () => {
      const error = {
        response: {
          status: 500,
          data: { message: 'Internal server error' }
        }
      }
      
      const message = api.handleError(error)
      
      expect(message).toContain('serveur')
    })

    it('should format 401 errors', () => {
      const error = {
        response: { status: 401 }
      }
      
      const message = api.handleError(error)
      
      expect(message).toContain('autorisé')
    })
  })

  describe('Multiple Theme Data Calls - Sequential Loading', () => {
    it('should handle multiple theme requests for same commune', async () => {
      mockedAxios.get.mockResolvedValue({ data: {} })

      await Promise.all([
        api.getCommuneDemographics('35238'),
        api.getCommuneHousing('35238'),
        api.getCommuneEconomy('35238')
      ])

      expect(mockedAxios.get).toHaveBeenCalledTimes(3)
    })
  })

  describe('Cache Behavior', () => {
    it('should not cache failed requests', async () => {
      mockedAxios.get
        .mockRejectedValueOnce(new Error('First call fails'))
        .mockResolvedValueOnce({ data: { success: true } })

      await expect(api.getCommuneDemographics('35238')).rejects.toThrow()
      
      const result = await api.getCommuneDemographics('35238')
      
      expect(result).toEqual({ success: true })
      expect(mockedAxios.get).toHaveBeenCalledTimes(2)
    })
  })
})
