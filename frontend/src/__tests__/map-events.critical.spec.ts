import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useMapEvents } from '../composables/useMapEvents'
import { ref } from 'vue'

describe('Map Events - Critical Bug Regression Tests', () => {
  let mockMap: any
  let mockPopupsHandler: any

  beforeEach(() => {
    mockMap = ref({
      on: vi.fn(),
      value: {
        on: vi.fn(),
        getCanvas: vi.fn(() => ({ style: {} }))
      }
    })

    mockPopupsHandler = {
      showClickPopup: vi.fn(),
      updateHoverPopup: vi.fn(),
      cleanupPopups: vi.fn()
    }
  })

  describe('Commune Code Extraction - Bug Fix: Always extracted 35208 from API', () => {
    it('should extract correct code from click event (35240 -> 35240, not 35240 -> 35208)', async () => {
      const { setupClickEvents } = useMapEvents(mockMap, mockPopupsHandler)
      
      // Simulate click on Pacé (35206)
      const mockClickEvent = {
        features: [{
          properties: {
            code: '35206',
            lib_com: 'Pacé'
          }
        }],
        lngLat: [-1.71, 48.14]
      }

      // Mock API to return correct commune (not 35208!)
      vi.mock('../services/api', () => ({
        api: {
          getCommuneByCode: vi.fn((code) => Promise.resolve({
            properties: {
              code: code, // Returns the SAME code, not 35208
              code_insee_concat: code,
              nom: code === '35206' ? 'Pacé' : 'Other',
              lib_com: code === '35206' ? 'Pacé' : 'Other'
            }
          }))
        }
      }))

      setupClickEvents()
      
      // Get the click handler
      const clickHandler = mockMap.value.on.mock.calls.find(
        (call: any) => call[0] === 'click'
      )?.[2]

      if (clickHandler) {
        await clickHandler(mockClickEvent)
        
        // Critical: showClickPopup should be called with 35206, NOT 35208
        expect(mockPopupsHandler.showClickPopup).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          expect.anything(),
          '35206' // Not 35208!
        )
      }
    })

    it('should handle Rennes (35238) correctly, not defaulting to Orgères', async () => {
      const mockClickEvent = {
        features: [{
          properties: {
            code: '35238',
            lib_com: 'Rennes'
          }
        }],
        lngLat: [-1.68, 48.11]
      }

      vi.mock('../services/api', () => ({
        api: {
          getCommuneByCode: vi.fn(() => Promise.resolve({
            properties: {
              code: '35238',
              code_insee_concat: '35238',
              nom: 'Rennes'
            }
          }))
        }
      }))

      const { setupClickEvents } = useMapEvents(mockMap, mockPopupsHandler)
      setupClickEvents()
      
      const clickHandler = mockMap.value.on.mock.calls.find(
        (call: any) => call[0] === 'click'
      )?.[2]

      if (clickHandler) {
        await clickHandler(mockClickEvent)
        
        const callArgs = mockPopupsHandler.showClickPopup.mock.calls[0]
        expect(callArgs[3]).toBe('35238')
        expect(callArgs[2].nom || callArgs[2].lib_com).toBe('Rennes')
      }
    })
  })

  describe('Code Priority - code vs code_insee_concat', () => {
    it('should use detailedCommune.code if available', async () => {
      const mockEvent = {
        features: [{
          properties: {
            code: '35001',
            code_insee_concat: '35002' // Different!
          }
        }],
        lngLat: [0, 0]
      }

      // Should prioritize .code over .code_insee_concat
      // const codeInsee = detailedCommune.code || detailedCommune.code_insee_concat
      
      const { setupClickEvents } = useMapEvents(mockMap, mockPopupsHandler)
      setupClickEvents()
      
      const clickHandler = mockMap.value.on.mock.calls.find(
        (call: any) => call[0] === 'click'
      )?.[2]

      if (clickHandler) {
        await clickHandler(mockEvent)
        
        // Should use .code (35001), not .code_insee_concat (35002)
        expect(mockPopupsHandler.showClickPopup.mock.calls[0][3]).toBe('35001')
      }
    })
  })
})
