/**
 * Formatage spécifique pour la pyramide des âges
 * - Libellés d’axe : tels que fournis par la base (`lib_ta21`), sans reformattage canonique
 * - Agrégation par libellé exact (trim) ; tri sur la borne basse d’âge quand c’est détectable
 * - Effet miroir H / F (hommes négatifs, femmes positives)
 */
import { getThemeColors } from '../chartColors'
import type {
  RawDataItem,
  FormattedChartData,
  ChartDataset,
  MultiExplicitOptions
} from '../chartTypes'
import {
  validateField,
  extractNumericValue,
  extractLabelValue
} from '../chartTypes'
import { selectColor } from './chartFormatUtils'

/**
 * Borne basse pour tri (jeune → âgé). Ex. "90-94" → 90, "75 ans et plus" → 75.
 * Libellés non reconnus : poussés en fin d’axe.
 */
function sortKeyForRawAgeLabel(label: string): number {
  const s = label
    .trim()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()

  const range = s.match(/^(\d+)\s*[-–—]\s*(\d+)/)
  const r1 = range?.[1]
  if (r1 !== undefined) return parseInt(r1, 10)

  const etPlus = s.match(/(\d+)\s+ans?\s+et\s+plus/)
  const e1 = etPlus?.[1]
  if (e1 !== undefined) return parseInt(e1, 10)

  const m = /^(\d+)/.exec(s)
  const m1 = m?.[1]
  if (m1 !== undefined) return parseInt(m1, 10)

  return Number.MAX_SAFE_INTEGER
}

/**
 * Agrège les lignes par libellé brut (trim), somme des séries (pop_h, pop_f, …).
 */
function aggregateByRawLabel(
  items: RawDataItem[],
  labelField: string,
  datasetsConfig: { code: string; label: string }[]
): RawDataItem[] {
  const map = new Map<string, RawDataItem>()

  for (const item of items) {
    const raw = extractLabelValue(item, labelField).trim()
    if (!raw) continue

    if (!map.has(raw)) {
      const base: Record<string, unknown> = { [labelField]: raw }
      for (const ds of datasetsConfig) {
        base[ds.code] = 0
      }
      map.set(raw, base as RawDataItem)
    }
    const acc = map.get(raw)! as Record<string, unknown>
    for (const ds of datasetsConfig) {
      const v = extractNumericValue(item, ds.code)
      const prev = typeof acc[ds.code] === 'number' ? (acc[ds.code] as number) : 0
      acc[ds.code] = prev + (Number.isFinite(v) ? v : 0)
    }
  }

  return Array.from(map.values()).sort(
    (a, b) =>
      sortKeyForRawAgeLabel(String((a as Record<string, unknown>)[labelField])) -
      sortKeyForRawAgeLabel(String((b as Record<string, unknown>)[labelField]))
  )
}

/**
 * Formate les données pour la pyramide des âges
 * Hommes : valeurs négatives (barres à gauche)
 * Femmes : valeurs positives (barres à droite)
 */
export function formatPyramidAges(
  data: RawDataItem[],
  theme: string,
  options: MultiExplicitOptions,
  overrideColors: string | string[] | null | undefined
): FormattedChartData {
  const { labelField, datasets: datasetsConfig } = options

  if (!validateField(data, labelField)) return { labels: [], datasets: [] }

  for (const dsConfig of datasetsConfig) {
    if (!validateField(data, dsConfig.code)) return { labels: [], datasets: [] }
  }

  const filteredData = data.filter(item => extractLabelValue(item, labelField) !== 'Sans label')
  if (filteredData.length === 0) return { labels: [], datasets: [] }

  const sortedData = aggregateByRawLabel(filteredData, labelField, datasetsConfig)
  // Du plus âgé au plus jeune (haut → bas de la pyramide horizontale)
  const orderedData = [...sortedData].reverse()

  const labels = orderedData.map(item => extractLabelValue(item, labelField))
  const themeColors = getThemeColors(theme)

  const datasets: ChartDataset[] = datasetsConfig.map((dsConfig, index) => {
    const rawValues = orderedData.map(item => extractNumericValue(item, dsConfig.code))
    let values: number[]
    if (index === 0) {
      values = rawValues.map(v => -Math.abs(v))
    } else {
      values = rawValues.map(v => Math.abs(v))
    }

    const color = selectColor(index, themeColors, overrideColors)

    return {
      label: dsConfig.label,
      data: values,
      backgroundColor: color,
      borderColor: 'transparent',
      borderWidth: 0,
      borderRadius: 4,
      borderSkipped: false
    }
  })

  return { labels, datasets }
}
