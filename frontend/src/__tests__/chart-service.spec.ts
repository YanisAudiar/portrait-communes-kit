import { describe, it, expect, vi } from 'vitest'
import { formatDataForChart } from '../services/chartService'

describe('Chart Service - Data Formatting Tests', () => {
  describe('formatDataForChart - Pyramid Chart', () => {
    it('should format age pyramid data correctly', () => {
      const mockData = [
        { lib_ta21: '0-5', sexe: 'H', value: 100 },
        { lib_ta21: '0-5', sexe: 'F', value: 95 },
        { lib_ta21: '5-10', sexe: 'H', value: 110 },
        { lib_ta21: '5-10', sexe: 'F', value: 105 }
      ]

      const result = formatDataForChart(mockData, 'pyramid', {
        labelField: 'lib_ta21',
        valueField: 'value'
      })

      expect(result.labels).toContain('0-5')
      expect(result.labels).toContain('5-10')
      expect(result.datasets).toHaveLength(2) // Hommes and Femmes
    })

    it('should handle negative values for pyramid (males)', () => {
      const mockData = [
        { lib_ta21: '0-5', sexe: 'H', value: 100 }
      ]

      const result = formatDataForChart(mockData, 'pyramid', {
        labelField: 'lib_ta21',
        valueField: 'value'
      })

      // Males should have negative values in pyramid
      const malesDataset = result.datasets.find((d: any) => d.label === 'Hommes')
      expect(malesDataset.data[0]).toBeLessThan(0)
    })
  })

  describe('formatDataForChart - Doughnut Chart', () => {
    it('should format doughnut data correctly', () => {
      const mockData = [
        { lib_type: 'Type A', value: 100 },
        { lib_type: 'Type B', value: 200 },
        { lib_type: 'Type C', value: 150 }
      ]

      const result = formatDataForChart(mockData, 'doughnut', {
        labelField: 'lib_type',
        valueField: 'value'
      })

      expect(result.labels).toEqual(['Type A', 'Type B', 'Type C'])
      expect(result.datasets[0].data).toEqual([100, 200, 150])
    })

    it('should apply theme colors', () => {
      const mockData = [
        { lib_type: 'Type A', value: 100 }
      ]

      const result = formatDataForChart(mockData, 'doughnut', {
        labelField: 'lib_type',
        valueField: 'value',
        theme: 'premium'
      })

      expect(result.datasets[0].backgroundColor).toBeDefined()
      expect(Array.isArray(result.datasets[0].backgroundColor)).toBe(true)
    })
  })

  describe('formatDataForChart - Bar Chart', () => {
    it('should format bar data correctly', () => {
      const mockData = [
        { annee: 2016, value: 100 },
        { annee: 2021, value: 120 }
      ]

      const result = formatDataForChart(mockData, 'bar', {
        labelField: 'annee',
        valueField: 'value'
      })

      expect(result.labels).toEqual([2016, 2021])
      expect(result.datasets[0].data).toEqual([100, 120])
    })
  })

  describe('Edge Cases - Empty Data', () => {
    it('should handle empty array', () => {
      const result = formatDataForChart([], 'bar', {
        labelField: 'label',
        valueField: 'value'
      })

      expect(result.labels).toEqual([])
      expect(result.datasets[0].data).toEqual([])
    })

    it('should handle null/undefined data', () => {
      const result = formatDataForChart(null as any, 'bar', {
        labelField: 'label',
        valueField: 'value'
      })

      expect(result.labels).toEqual([])
    })
  })

  describe('Multi-Dataset Charts', () => {
    it('should handle multiple datasets configuration', () => {
      const mockData = [
        { year: 2020, pop: 1000, employed: 800 },
        { year: 2021, pop: 1100, employed: 900 }
      ]

      const result = formatDataForChart(mockData, 'bar', {
        labelField: 'year',
        datasets: [
          { valueField: 'pop', label: 'Population' },
          { valueField: 'employed', label: 'Employés' }
        ]
      })

      expect(result.datasets).toHaveLength(2)
      expect(result.datasets[0].label).toBe('Population')
      expect(result.datasets[1].label).toBe('Employés')
    })
  })
})
