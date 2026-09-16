/**
 * Types pour l'export PDF (mode natif PDFKit et collecte des données)
 * Extraits de usePdfExport pour réutilisation et clarté
 */

import type { Chart } from 'chart.js'
import type { ShallowRef } from 'vue'

/** Informations sur le territoire */
export interface TerritoryInfo {
  name: string
  code: string
  type: 'commune' | 'epci' | 'departement' | 'region'
}

/** Informations sur la thématique */
export interface ThemeInfo {
  id: string
  name: string
  color: string
}

/** Chiffre clé pour le PDF */
export interface KeyFigure {
  value: string
  label: string
  color?: string
  unit?: string
  evolution?: {
    value: string
    trend: 'up' | 'down' | 'stable'
  }
}

/** Référence à un graphique Chart.js pour l'export */
export interface ChartExportRef {
  chartRef: Chart | ShallowRef<Chart | null> | null
  id: string
  title: string
  source?: string
  note?: string
}

/** Données pour la génération PDF native (PDFKit) */
export interface NativePdfRequest {
  territory: TerritoryInfo
  theme: ThemeInfo
  charts: ChartExportRef[]
  keyFigures?: KeyFigure[]
}
