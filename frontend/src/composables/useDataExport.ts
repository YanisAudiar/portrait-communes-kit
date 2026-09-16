/**
 * Composable pour gérer l'export de données (CSV, Excel)
 * Modernisé en TypeScript avec support complet pour Excel français
 */
import { ref } from 'vue'
import * as XLSX from 'xlsx'

// Types
export interface ExportableData {
  [key: string]: string | number | boolean | null | undefined
}

export interface ExportOptions {
  filename?: string
  sheetName?: string
  includeHeaders?: boolean
  dateFormat?: string
}

export interface ExportState {
  isExporting: boolean
  error: string | null
  progress: number
}

/**
 * Composable pour gérer l'export de données
 * @returns Méthodes d'export et états réactifs
 */
export function useDataExport() {
  const isExporting = ref(false)
  const exportError = ref<string | null>(null)
  const exportProgress = ref(0)

  /**
   * Formate les données pour l'export français (. → , pour les nombres)
   */
  const formatForFrench = (data: ExportableData[]): ExportableData[] => {
    return data.map(row => {
      const formattedRow: ExportableData = {}
      for (const key in row) {
        const value = row[key]
        if (typeof value === 'number') {
          // Garder le nombre tel quel pour Excel, le formatage sera géré par Excel
          formattedRow[key] = value
        } else if (typeof value === 'string' && !isNaN(parseFloat(value.replace(',', '.')))) {
          // Convertir les chaînes numériques
          formattedRow[key] = parseFloat(value.replace(',', '.'))
        } else {
          formattedRow[key] = value
        }
      }
      return formattedRow
    })
  }

  /**
   * Génère un nom de fichier avec timestamp
   */
  const generateFilename = (prefix: string, extension: string): string => {
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
    const timeStr = now.toTimeString().slice(0, 5).replace(':', '')
    return `${prefix}_${dateStr}_${timeStr}.${extension}`
  }

  /**
   * Exporte les données en CSV avec BOM UTF-8 et séparateur ; pour Excel FR
   */
  const exportCSV = (
    data: ExportableData[],
    options: ExportOptions = {}
  ): void => {
    if (!data || data.length === 0) {
      exportError.value = 'Aucune donnée à exporter'
      console.warn('⚠️ Export CSV: Aucune donnée à exporter')
      return
    }

    isExporting.value = true
    exportError.value = null
    exportProgress.value = 0

    try {
      exportProgress.value = 20

      const formattedData = formatForFrench(data)
      const firstRow = formattedData[0]
      if (!firstRow) {
        exportError.value = 'Aucune donnée à exporter'
        return
      }
      const headers = Object.keys(firstRow)
      
      exportProgress.value = 40

      // Générer le contenu CSV avec séparateur ; pour Excel français
      const csvRows: string[] = []
      
      // En-têtes
      if (options.includeHeaders !== false) {
        csvRows.push(headers.join(';'))
      }
      
      // Données
      formattedData.forEach(row => {
        const values = headers.map(header => {
          const value = row[header]
          if (value === null || value === undefined) return ''
          if (typeof value === 'string') {
            // Échapper les guillemets et encadrer si nécessaire
            const escaped = value.replace(/"/g, '""')
            return escaped.includes(';') || escaped.includes('"') || escaped.includes('\n')
              ? `"${escaped}"`
              : escaped
          }
          // Convertir les nombres avec virgule pour Excel FR
          if (typeof value === 'number') {
            return value.toString().replace('.', ',')
          }
          return String(value)
        })
        csvRows.push(values.join(';'))
      })

      exportProgress.value = 70

      // Ajouter BOM UTF-8 pour que Excel reconnaisse l'encodage
      const BOM = '\uFEFF'
      const csvContent = BOM + csvRows.join('\n')
      
      // Créer le blob et télécharger
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const filename = options.filename || generateFilename('export', 'csv')
      
      downloadBlob(blob, filename)
      
      exportProgress.value = 100

    } catch (error: any) {
      console.error('❌ Erreur export CSV:', error)
      exportError.value = error.message || 'Erreur lors de l\'export CSV'
    } finally {
      isExporting.value = false
      setTimeout(() => { exportProgress.value = 0 }, 1000)
    }
  }

  /**
   * Exporte les données en Excel (.xlsx)
   */
  const exportExcel = (
    data: ExportableData[],
    options: ExportOptions = {}
  ): void => {
    if (!data || data.length === 0) {
      exportError.value = 'Aucune donnée à exporter'
      console.warn('⚠️ Export Excel: Aucune donnée à exporter')
      return
    }

    isExporting.value = true
    exportError.value = null
    exportProgress.value = 0

    try {
      exportProgress.value = 20

      const formattedData = formatForFrench(data)
      
      exportProgress.value = 40

      // Créer le workbook et la feuille
      const worksheet = XLSX.utils.json_to_sheet(formattedData)
      const workbook = XLSX.utils.book_new()
      
      // Ajouter la feuille au workbook
      const sheetName = options.sheetName || 'Données'
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

      exportProgress.value = 70

      // Ajuster la largeur des colonnes automatiquement
      const excelFirst = formattedData[0]
      if (!excelFirst) {
        exportError.value = 'Aucune donnée à exporter'
        return
      }
      const colWidths = Object.keys(excelFirst).map(key => {
        const maxLength = Math.max(
          key.length,
          ...formattedData.map(row => String(row[key] || '').length)
        )
        return { wch: Math.min(maxLength + 2, 50) }
      })
      worksheet['!cols'] = colWidths

      // Générer le fichier
      const filename = options.filename || generateFilename('export', 'xlsx')
      XLSX.writeFile(workbook, filename)
      
      exportProgress.value = 100

    } catch (error: any) {
      console.error('❌ Erreur export Excel:', error)
      exportError.value = error.message || 'Erreur lors de l\'export Excel'
    } finally {
      isExporting.value = false
      setTimeout(() => { exportProgress.value = 0 }, 1000)
    }
  }

  /**
   * Exporte les données d'un graphique Chart.js
   */
  const exportChartData = (
    chartInstance: any,
    format: 'csv' | 'excel' = 'csv',
    options: ExportOptions = {}
  ): void => {
    if (!chartInstance) {
      exportError.value = 'Aucun graphique disponible'
      return
    }

    try {
      const chartData = chartInstance.data
      const labels = chartData.labels || []
      const datasets = chartData.datasets || []

      // Construire les données exportables
      const exportData: ExportableData[] = labels.map((label: string, index: number) => {
        const row: ExportableData = { Label: label }
        datasets.forEach((dataset: any, dsIndex: number) => {
          const columnName = dataset.label || `Série ${dsIndex + 1}`
          row[columnName] = dataset.data[index]
        })
        return row
      })

      if (format === 'excel') {
        exportExcel(exportData, options)
      } else {
        exportCSV(exportData, options)
      }

    } catch (error: any) {
      console.error('❌ Erreur export graphique:', error)
      exportError.value = error.message || 'Erreur lors de l\'export du graphique'
    }
  }

  /**
   * Télécharge un blob en tant que fichier
   */
  const downloadBlob = (blob: Blob, filename: string): void => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    
    // Nettoyage
    setTimeout(() => {
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }, 100)
  }

  return {
    // États
    isExporting,
    exportError,
    exportProgress,
    
    // Méthodes
    exportCSV,
    exportExcel,
    exportChartData,
    generateFilename,
    downloadBlob
  }
}
