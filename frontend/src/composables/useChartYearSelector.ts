/**
 * Composable pour le sélecteur d'année des graphiques
 * Gère availableYears, selectedYear, filteredData et dataToUse
 */
import { ref, computed, watch } from 'vue'

export type YearSelectorConfig = {
  enabled: boolean
  yearField: string
  defaultYear?: 'latest' | 'earliest' | number
} | null

export function useChartYearSelector(
  data: () => unknown[],
  config: () => YearSelectorConfig,
  isPrintMode: () => boolean,
  onYearChanged?: (year: number | string) => void
) {
  const selectedYear = ref<number | string | null>(null)

  const availableYears = computed(() => {
    const cfg = config()
    if (!cfg?.enabled || !cfg?.yearField) return []
    const yearField = cfg.yearField
    const years = new Set<number | string>()
    const raw = data()
    if (Array.isArray(raw)) {
      raw.forEach((value: unknown) => {
        const item = value as Record<string, unknown>
        const y = item[yearField]
        // Inclure 0 exclu par truthiness ; rejeter seulement null / undefined / ''
        if (y != null && y !== '') years.add(y as number | string)
      })
    }
    return Array.from(years).sort((a, b) => Number(b) - Number(a))
  })

  const showYearSelector = computed(() => {
    const cfg = config()
    return !!(
      cfg?.enabled &&
      availableYears.value.length >= 1 &&
      !isPrintMode()
    )
  })

  const filteredData = computed(() => {
    const cfg = config()
    if (!cfg?.enabled || !selectedYear.value || !cfg?.yearField) return data()
    const yearField = cfg.yearField
    return (data() as Record<string, unknown>[]).filter(
      item => String(item[yearField]) === String(selectedYear.value)
    )
  })

  const dataToUse = computed(() => {
    const cfg = config()
    if (cfg?.enabled && selectedYear.value) return filteredData.value
    return data()
  })

  watch(
    availableYears,
    years => {
      if (years.length === 0) return
      const current = selectedYear.value
      const inList = current != null && years.some(y => String(y) === String(current))
      if (!inList || current == null) {
        const cfg = config()
        const defaultYear = cfg?.defaultYear
        if (defaultYear === 'latest' || defaultYear == null) {
          selectedYear.value = years[0] ?? null
        } else if (defaultYear === 'earliest') {
          selectedYear.value = years[years.length - 1] ?? null
        } else if (typeof defaultYear === 'number') {
          // Les années API peuvent être number ou string ("2022") : includes(2022) échouait
          const match = years.find(y => Number(y) === defaultYear)
          selectedYear.value = match ?? years[0] ?? null
        } else {
          selectedYear.value = years[0] ?? null
        }
      }
    },
    { immediate: true }
  )

  watch(
    selectedYear,
    newYear => {
      if (newYear != null && newYear !== '') onYearChanged?.(newYear)
    },
    { immediate: true }
  )

  return {
    selectedYear,
    availableYears,
    showYearSelector,
    filteredData,
    dataToUse
  }
}
