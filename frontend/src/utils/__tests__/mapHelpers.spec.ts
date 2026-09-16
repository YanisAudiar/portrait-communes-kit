import { describe, it, expect } from 'vitest'
import { getFeatureCode, getFeatureName } from '../mapHelpers'

describe('mapHelpers', () => {
  describe('getFeatureCode', () => {
    it('should return code from properties.code', () => {
      const feature = { properties: { code: '35000' } }
      expect(getFeatureCode(feature)).toBe('35000')
    })

    it('should return code from properties.code_insee', () => {
      const feature = { properties: { code_insee: '35000' } }
      expect(getFeatureCode(feature)).toBe('35000')
    })

    it('should return code from properties.INSEE_COM', () => {
      const feature = { properties: { INSEE_COM: '35000' } }
      expect(getFeatureCode(feature)).toBe('35000')
    })

    it('should return empty string if no code found', () => {
      const feature = { properties: {} }
      expect(getFeatureCode(feature)).toBe('')
    })

    it('should return empty string if feature is null', () => {
      expect(getFeatureCode(null)).toBe('')
    })
  })

  describe('getFeatureName', () => {
    it('should return name from properties.nom', () => {
      const feature = { properties: { nom: 'Rennes' } }
      expect(getFeatureName(feature)).toBe('Rennes')
    })

    it('should return name from properties.NOM', () => {
      const feature = { properties: { NOM: 'Rennes' } }
      expect(getFeatureName(feature)).toBe('Rennes')
    })

    it('should return name from properties.nom_commune', () => {
      const feature = { properties: { nom_commune: 'Rennes' } }
      expect(getFeatureName(feature)).toBe('Rennes')
    })

    it('should return default "Commune" if no name found', () => {
      const feature = { properties: {} }
      expect(getFeatureName(feature)).toBe('Commune')
    })
  })
})
