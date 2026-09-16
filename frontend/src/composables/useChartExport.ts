/**
 * Composable pour la logique d'export des graphiques (CSV, Excel, PNG, partage)
 * Utilisé par ChartExportButtons
 */
import { useDataExport } from '@/composables/useDataExport'
import { useScreenshot } from '@/composables/useScreenshot'
import { useSocialShare } from '@/composables/useSocialShare'

export interface ChartExportProps {
  data: Record<string, string | number | boolean | null | undefined>[]
  chartInstance: unknown
  captureElementId: string
  filename: string
  idChart: string
  theme: string
  territoire: string
  selectedYear: number | string | null
}

export type ChartExportEmit = (
  e: 'export-start' | 'export-success' | 'export-error',
  ...args: string[]
) => void

export function useChartExport(getProps: () => ChartExportProps, emit: ChartExportEmit) {
  const { isExporting, exportCSV, exportExcel } = useDataExport()
  const { isCapturing, captureElement } = useScreenshot()
  const { copyToClipboard } = useSocialShare()

  function getExportData(): Record<string, string | number | boolean | null | undefined>[] {
    const props = getProps()
    if (props.data?.length > 0) return props.data
    if (props.chartInstance && typeof props.chartInstance === 'object' && 'data' in props.chartInstance) {
      const chartData = (props.chartInstance as { data: { labels?: string[]; datasets?: { label?: string; data: unknown[] }[] } }).data
      const labels = chartData.labels || []
      const datasets = chartData.datasets || []
      return labels.map((label: string, index: number) => {
        const row: Record<string, string | number | boolean | null | undefined> = { Label: label }
        datasets.forEach((dataset: { label?: string; data: unknown[] }, dsIndex: number) => {
          const columnName = dataset.label || `Série ${dsIndex + 1}`
          row[columnName] = dataset.data[index] as number
        })
        return row
      })
    }
    return []
  }

  function getChartUrl(): string {
    const props = getProps()
    if (props.idChart && props.territoire) {
      const baseUrl = window.location.origin
      const shareUrl = new URL(`${baseUrl}/share`)
      shareUrl.searchParams.append('idChart', props.idChart)
      shareUrl.searchParams.append('territoire', props.territoire)
      if (props.theme) shareUrl.searchParams.append('theme', props.theme)
      if (props.selectedYear) shareUrl.searchParams.append('year', String(props.selectedYear))
      return shareUrl.toString()
    }
    const baseUrl = window.location.href.split('#')[0] ?? window.location.href
    const anchor = props.captureElementId || ''
    return anchor ? `${baseUrl}#${anchor}` : baseUrl
  }

  function handleExportCSV() {
    emit('export-start', 'csv')
    const data = getExportData()
    if (data.length === 0) {
      emit('export-error', 'csv', 'Aucune donnée à exporter')
      return
    }
    try {
      exportCSV(data, { filename: `${getProps().filename}.csv` })
      emit('export-success', 'csv')
    } catch (err: unknown) {
      emit('export-error', 'csv', err instanceof Error ? err.message : String(err))
    }
  }

  function handleExportExcel() {
    emit('export-start', 'excel')
    const data = getExportData()
    if (data.length === 0) {
      emit('export-error', 'excel', 'Aucune donnée à exporter')
      return
    }
    try {
      exportExcel(data, {
        filename: `${getProps().filename}.xlsx`,
        sheetName: getProps().filename
      })
      emit('export-success', 'excel')
    } catch (err: unknown) {
      emit('export-error', 'excel', err instanceof Error ? err.message : String(err))
    }
  }

  async function handleCapturePNG() {
    emit('export-start', 'png')
    const elementId = getProps().captureElementId
    if (!elementId) {
      emit('export-error', 'png', 'Aucun élément à capturer')
      return
    }
    try {
      await captureElement(`#${elementId}`, {
        filename: `${getProps().filename}.png`,
        addWatermark: true
      })
      emit('export-success', 'png')
    } catch (err: unknown) {
      emit('export-error', 'png', err instanceof Error ? err.message : String(err))
    }
  }

  async function handleCopyLink() {
    const chartUrl = getChartUrl()
    const success = await copyToClipboard(chartUrl)
    if (success) window.open(chartUrl, '_blank')
    else console.error('❌ Échec de la copie du lien')
  }

  return {
    isExporting,
    isCapturing,
    getExportData,
    getChartUrl,
    handleExportCSV,
    handleExportExcel,
    handleCapturePNG,
    handleCopyLink
  }
}
