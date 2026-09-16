/**
 * Types pour la génération PDF native avec PDFKit
 * Architecture sans Puppeteer - Performance optimisée
 */

/**
 * Informations sur le territoire
 */
export interface TerritoryInfo {
  name: string        // Nom du territoire (ex: "Rennes")
  code: string        // Code INSEE (ex: "35238")
  type: 'commune' | 'epci' | 'departement' | 'region'
}

/**
 * Informations sur la thématique
 */
export interface ThemeInfo {
  id: string          // Identifiant (ex: "demographie")
  name: string        // Nom affiché (ex: "Démographie")
  color: string       // Couleur principale (ex: "#5D4F9C")
}

/**
 * Chiffre clé à afficher dans le PDF
 */
export interface KeyFigure {
  value: string       // Valeur formatée (ex: "18 963")
  label: string       // Label descriptif (ex: "Nombre d'habitants")
  color?: string      // Couleur optionnelle
  unit?: string       // Unité optionnelle (ex: "hab.", "%")
  evolution?: {
    value: string     // Valeur d'évolution (ex: "+2.5%")
    trend: 'up' | 'down' | 'stable'
  }
}

/**
 * Graphique à inclure dans le PDF
 */
export interface ChartData {
  id: string          // Identifiant unique
  title: string       // Titre du graphique
  imageBase64: string // Image PNG en base64 (data:image/png;base64,...)
  source?: string     // Source des données (ex: "INSEE RP 2021")
  note?: string       // Note de bas de graphique
  width?: number      // Largeur souhaitée (optionnel)
  height?: number     // Hauteur souhaitée (optionnel)
}

/**
 * Données de carte à inclure (optionnel)
 */
export interface MapData {
  id: string
  title: string
  imageBase64: string
  legend?: string[]
}

/**
 * Données complètes pour générer un PDF
 */
export interface PdfGenerationRequest {
  territory: TerritoryInfo
  theme: ThemeInfo
  charts: ChartData[]
  keyFigures?: KeyFigure[]
  maps?: MapData[]
  options?: PdfOptions
}

/**
 * Options de génération PDF
 */
export interface PdfOptions {
  format?: 'A4' | 'A3'
  orientation?: 'portrait' | 'landscape'
  includeTableOfContents?: boolean
  includeCoverPage?: boolean
  includeFooter?: boolean
  headerText?: string
  footerText?: string
  quality?: 'draft' | 'standard' | 'high'
}

/**
 * Résultat de la génération PDF
 */
export interface PdfGenerationResult {
  success: boolean
  buffer?: Buffer
  filename?: string
  pageCount?: number
  generationTime?: number // en ms
  error?: string
}

/**
 * Configuration des couleurs du PDF
 */
export interface PdfColors {
  primary: string
  secondary: string
  text: string
  textLight: string
  border: string
  background: string
  accent: string
}

/**
 * Configuration des marges PDF
 */
export interface PdfMargins {
  top: number
  right: number
  bottom: number
  left: number
}

/**
 * Configuration générale du générateur PDF
 */
export interface PdfConfig {
  colors: PdfColors
  margins: PdfMargins
  fonts: {
    title: string
    body: string
  }
  logo?: {
    path: string
    width: number
    height: number
  }
}
