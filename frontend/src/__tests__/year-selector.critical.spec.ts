import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ChartComponent from '../components/Charts/ChartComponent.vue'

describe('YearSelector - Critical Bug Regression Tests', () => {
  const mockData = [
    { numero_annee: 2016, lib_ta21: '0-5', value: 100 },
    { numero_annee: 2016, lib_ta21: '5-10', value: 150 },
    { numero_annee: 2021, lib_ta21: '0-5', value: 120 },
    { numero_annee: 2021, lib_ta21: '5-10', value: 180 }
  ]

  describe('Data Filtering - Bug Fix: Showed both years stacked instead of filtered', () => {
    it('should filter data to only selected year (2021)', () => {
      const wrapper = mount(ChartComponent, {
        props: {
          data: mockData,
          type: 'pyramid',
          yearSelectorConfig: {
            enabled: true,
            yearField: 'numero_annee',
            defaultYear: 'latest'
          }
        }
      })

      const vm = wrapper.vm as any
      expect(vm.selectedYear).toBe(2021)
      expect(vm.filteredData).toHaveLength(2) // Only 2021 data
      expect(vm.filteredData.every((d: any) => d.numero_annee === 2021)).toBe(true)
    })

    it('should filter data to only selected year (2016)', () => {
      const wrapper = mount(ChartComponent, {
        props: {
          data: mockData,
          type: 'pyramid',
          yearSelectorConfig: {
            enabled: true,
            yearField: 'numero_annee',
            defaultYear: 2016
          }
        }
      })

      const vm = wrapper.vm as any
      expect(vm.selectedYear).toBe(2016)
      expect(vm.filteredData).toHaveLength(2) // Only 2016 data
      expect(vm.filteredData.every((d: any) => d.numero_annee === 2016)).toBe(true)
    })

    it('should NOT show both years (bug scenario)', () => {
      const wrapper = mount(ChartComponent, {
        props: {
          data: mockData,
          type: 'pyramid',
          yearSelectorConfig: {
            enabled: true,
            yearField: 'numero_annee',
            defaultYear: 2021
          }
        }
      })

      const vm = wrapper.vm as any
      const years = [...new Set(vm.filteredData.map((d: any) => d.numero_annee))]
      
      // Critical: Should only have ONE year, not both
      expect(years).toHaveLength(1)
      expect(years[0]).toBe(2021)
    })
  })

  describe('Chart Title - Bug Fix: Should include year', () => {
    it('should append year to title when year selector is active', () => {
      const wrapper = mount(ChartComponent, {
        props: {
          title: 'Pyramide des âges',
          data: mockData,
          type: 'pyramid',
          yearSelectorConfig: {
            enabled: true,
            yearField: 'numero_annee',
            defaultYear: 2021
          }
        }
      })

      const vm = wrapper.vm as any
      expect(vm.chartTitle).toBe('Pyramide des âges (2021)')
    })

    it('should update title when year changes', async () => {
      const wrapper = mount(ChartComponent, {
        props: {
          title: 'Pyramide des âges',
          data: mockData,
          type: 'pyramid',
          yearSelectorConfig: {
            enabled: true,
            yearField: 'numero_annee',
            defaultYear: 2021
          }
        }
      })

      const vm = wrapper.vm as any
      vm.selectedYear = 2016
      await wrapper.vm.$nextTick()

      expect(vm.chartTitle).toBe('Pyramide des âges (2016)')
    })
  })

  describe('Year Changed Event - For share URL', () => {
    it('should emit year-changed event when year changes', async () => {
      const wrapper = mount(ChartComponent, {
        props: {
          data: mockData,
          type: 'pyramid',
          yearSelectorConfig: {
            enabled: true,
            yearField: 'numero_annee',
            defaultYear: 2021
          }
        }
      })

      const vm = wrapper.vm as any
      vm.selectedYear = 2016
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('year-changed')).toBeTruthy()
      expect(wrapper.emitted('year-changed')![0]).toEqual([2016])
    })

    it('should emit initial year on mount', async () => {
      const wrapper = mount(ChartComponent, {
        props: {
          data: mockData,
          type: 'pyramid',
          yearSelectorConfig: {
            enabled: true,
            yearField: 'numero_annee',
            defaultYear: 2021
          }
        }
      })

      await wrapper.vm.$nextTick()

      // Should emit initial year for share URL
      expect(wrapper.emitted('year-changed')).toBeTruthy()
    })
  })

  describe('Available Years Detection', () => {
    it('should correctly detect available years from data', () => {
      const wrapper = mount(ChartComponent, {
        props: {
          data: mockData,
          type: 'pyramid',
          yearSelectorConfig: {
            enabled: true,
            yearField: 'numero_annee'
          }
        }
      })

      const vm = wrapper.vm as any
      expect(vm.availableYears).toEqual([2021, 2016]) // Sorted desc
    })

    it('should default to latest year', () => {
      const wrapper = mount(ChartComponent, {
        props: {
          data: mockData,
          type: 'pyramid',
          yearSelectorConfig: {
            enabled: true,
            yearField: 'numero_annee',
            defaultYear: 'latest'
          }
        }
      })

      const vm = wrapper.vm as any
      expect(vm.selectedYear).toBe(2021)
    })
  })
})
