/**
 * Générateur PDF natif avec PDFKit
 * Remplace Puppeteer pour une meilleure performance et qualité
 * 
 * Avantages :
 * - ~10x plus rapide que Puppeteer
 * - ~10x moins de mémoire utilisée
 * - Contrôle pixel-perfect du layout
 * - Pas de dépendance Chromium
 */

import PDFDocument from 'pdfkit'
import { 
  PdfGenerationRequest, 
  PdfGenerationResult, 
  ChartData, 
  KeyFigure,
  PdfColors,
  PdfMargins,
  ThemeInfo,
  TerritoryInfo
} from './types'

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * Couleurs par défaut - Charte Audiar
 */
const DEFAULT_COLORS: PdfColors = {
  primary: '#1e2972',      // Bleu Audiar foncé
  secondary: '#316d7b',    // Bleu-vert Audiar
  text: '#1f2937',         // Texte foncé
  textLight: '#6b7280',    // Texte clair
  border: '#e5e7eb',       // Bordures légères
  background: '#f8fafc',   // Fond des cartes
  accent: '#f17e08'        // Orange accent
}

/**
 * Marges par défaut (en points, 72 points = 1 inch)
 */
const DEFAULT_MARGINS: PdfMargins = {
  top: 50,
  right: 40,
  bottom: 50,
  left: 40
}

/**
 * Dimensions A4 paysage en points
 */
const A4_LANDSCAPE = {
  width: 841.89,  // 297mm
  height: 595.28  // 210mm
}

/**
 * Dimensions A4 portrait en points
 */
const A4_PORTRAIT = {
  width: 595.28,  // 210mm
  height: 841.89  // 297mm
}

// =============================================================================
// CLASSE PRINCIPALE
// =============================================================================

export class PdfGenerator {
  private doc: PDFKit.PDFDocument
  private colors: PdfColors
  private margins: PdfMargins
  private pageWidth: number
  private pageHeight: number
  private contentWidth: number
  private contentHeight: number
  private currentY: number
  private pageCount: number

  constructor(orientation: 'landscape' | 'portrait' = 'landscape') {
    const dimensions = orientation === 'landscape' ? A4_LANDSCAPE : A4_PORTRAIT
    
    this.colors = DEFAULT_COLORS
    this.margins = DEFAULT_MARGINS
    this.pageWidth = dimensions.width
    this.pageHeight = dimensions.height
    this.contentWidth = this.pageWidth - this.margins.left - this.margins.right
    this.contentHeight = this.pageHeight - this.margins.top - this.margins.bottom
    this.currentY = this.margins.top
    this.pageCount = 0

    // Créer le document PDF
    this.doc = new PDFDocument({
      size: [this.pageWidth, this.pageHeight],
      margins: this.margins,
      bufferPages: true,
      autoFirstPage: false,
      info: {
        Title: 'Portrait de Territoire - Audiar',
        Author: 'Audiar - Agence d\'Urbanisme de Rennes',
        Creator: 'Portrait de Territoire',
        Producer: 'PDFKit'
      }
    })
  }

  // ===========================================================================
  // MÉTHODES PUBLIQUES
  // ===========================================================================

  /**
   * Génère un PDF complet à partir des données
   */
  async generate(request: PdfGenerationRequest): Promise<PdfGenerationResult> {
    const startTime = Date.now()

    try {
      const { territory, theme, charts, keyFigures, options } = request

      // Mettre à jour les couleurs avec la couleur du thème
      if (theme.color) {
        this.colors.primary = theme.color
      }

      // Page de couverture
      if (options?.includeCoverPage !== false) {
        this.drawCoverPage(territory, theme)
      }

      // Page des chiffres clés
      if (keyFigures && keyFigures.length > 0) {
        this.drawKeyFiguresPage(keyFigures, theme)
      }

      // Pages des graphiques (2 par page)
      if (charts && charts.length > 0) {
        this.drawChartsPages(charts, theme)
      }

      // Ajouter les numéros de page
      this.addPageNumbers()

      // Générer le buffer
      const buffer = await this.finalize()

      return {
        success: true,
        buffer,
        filename: this.generateFilename(territory, theme),
        pageCount: this.pageCount,
        generationTime: Date.now() - startTime
      }

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors de la génération du PDF'
      }
    }
  }

  // ===========================================================================
  // PAGE DE COUVERTURE
  // ===========================================================================

  private drawCoverPage(territory: TerritoryInfo, theme: ThemeInfo): void {
    this.addPage()

    const centerX = this.pageWidth / 2
    const centerY = this.pageHeight / 2

    // Fond avec gradient simulé (bande colorée en haut)
    this.doc
      .rect(0, 0, this.pageWidth, 180)
      .fill(this.colors.primary)

    // Ligne décorative
    this.doc
      .rect(0, 180, this.pageWidth, 8)
      .fill(this.lightenColor(this.colors.primary, 0.3))

    // Titre principal : "Portrait de Territoire"
    this.doc
      .font('Helvetica-Bold')
      .fontSize(14)
      .fillColor('#ffffff')
      .text('PORTRAIT DE TERRITOIRE', this.margins.left, 60, {
        width: this.contentWidth,
        align: 'center'
      })

    // Nom du territoire
    this.doc
      .font('Helvetica-Bold')
      .fontSize(42)
      .fillColor('#ffffff')
      .text(territory.name.toUpperCase(), this.margins.left, 90, {
        width: this.contentWidth,
        align: 'center'
      })

    // Type de territoire
    const typeLabel = this.getTerritoryTypeLabel(territory.type)
    this.doc
      .font('Helvetica')
      .fontSize(16)
      .fillColor('rgba(255,255,255,0.8)')
      .text(typeLabel, this.margins.left, 145, {
        width: this.contentWidth,
        align: 'center'
      })

    // Nom de la thématique (centré dans la page)
    this.doc
      .font('Helvetica-Bold')
      .fontSize(32)
      .fillColor(this.colors.primary)
      .text(theme.name, this.margins.left, centerY - 20, {
        width: this.contentWidth,
        align: 'center'
      })

    // Ligne décorative sous le thème
    const lineWidth = 150
    this.doc
      .moveTo(centerX - lineWidth / 2, centerY + 30)
      .lineTo(centerX + lineWidth / 2, centerY + 30)
      .strokeColor(this.colors.primary)
      .lineWidth(3)
      .stroke()

    // Date de génération
    const dateStr = new Date().toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
    
    this.doc
      .font('Helvetica')
      .fontSize(12)
      .fillColor(this.colors.textLight)
      .text(`Généré le ${dateStr}`, this.margins.left, this.pageHeight - 100, {
        width: this.contentWidth,
        align: 'center'
      })

    // Mention Audiar
    this.doc
      .font('Helvetica-Bold')
      .fontSize(14)
      .fillColor(this.colors.primary)
      .text('Production de l\'Audiar', this.margins.left, this.pageHeight - 70, {
        width: this.contentWidth,
        align: 'center'
      })

    this.doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor(this.colors.textLight)
      .text('Agence d\'Urbanisme et de Développement Intercommunal de l\'Agglomération Rennaise', 
        this.margins.left, this.pageHeight - 50, {
        width: this.contentWidth,
        align: 'center'
      })
  }

  // ===========================================================================
  // PAGE DES CHIFFRES CLÉS
  // ===========================================================================

  private drawKeyFiguresPage(keyFigures: KeyFigure[], theme: ThemeInfo): void {
    this.addPage()
    this.drawPageHeader(theme.name, 'Chiffres clés')

    const startY = 120
    const cardWidth = (this.contentWidth - 30) / 3 // 3 cartes par ligne avec espacement
    const cardHeight = 100
    const gap = 15

    keyFigures.forEach((kf, index) => {
      const col = index % 3
      const row = Math.floor(index / 3)
      
      const x = this.margins.left + col * (cardWidth + gap)
      const y = startY + row * (cardHeight + gap)

      // Vérifier si on dépasse la page
      if (y + cardHeight > this.pageHeight - this.margins.bottom) {
        this.addPage()
        this.drawPageHeader(theme.name, 'Chiffres clés (suite)')
        return
      }

      this.drawKeyFigureCard(x, y, cardWidth, cardHeight, kf)
    })
  }

  /**
   * Dessine une carte de chiffre clé
   */
  private drawKeyFigureCard(
    x: number, 
    y: number, 
    width: number, 
    height: number, 
    kf: KeyFigure
  ): void {
    const cardColor = kf.color || this.colors.primary

    // Fond de la carte
    this.doc
      .roundedRect(x, y, width, height, 8)
      .fill(this.colors.background)

    // Bande colorée à gauche
    this.doc
      .rect(x, y, 6, height)
      .fill(cardColor)

    // Arrondir les coins de la bande
    this.doc
      .roundedRect(x, y, 6, height, 8)
      .fill(cardColor)
    this.doc
      .rect(x + 3, y, 3, height)
      .fill(cardColor)

    // Valeur principale
    this.doc
      .font('Helvetica-Bold')
      .fontSize(28)
      .fillColor(cardColor)
      .text(kf.value, x + 20, y + 20, {
        width: width - 30,
        align: 'left'
      })

    // Unité si présente
    if (kf.unit) {
      this.doc
        .font('Helvetica')
        .fontSize(14)
        .fillColor(this.colors.textLight)
        .text(kf.unit, x + 20, y + 52, {
          width: width - 30,
          align: 'left'
        })
    }

    // Label
    this.doc
      .font('Helvetica')
      .fontSize(11)
      .fillColor(this.colors.text)
      .text(kf.label, x + 20, y + height - 30, {
        width: width - 30,
        align: 'left'
      })

    // Évolution si présente
    if (kf.evolution) {
      const arrow = kf.evolution.trend === 'up' ? '↗' : 
                    kf.evolution.trend === 'down' ? '↘' : '→'
      const trendColor = kf.evolution.trend === 'up' ? '#10b981' : 
                         kf.evolution.trend === 'down' ? '#ef4444' : '#6b7280'
      
      this.doc
        .font('Helvetica')
        .fontSize(12)
        .fillColor(trendColor)
        .text(`${arrow} ${kf.evolution.value}`, x + width - 70, y + 25, {
          width: 60,
          align: 'right'
        })
    }
  }

  // ===========================================================================
  // PAGES DES GRAPHIQUES
  // ===========================================================================

  private drawChartsPages(charts: ChartData[], theme: ThemeInfo): void {
    // Traiter les graphiques 2 par 2
    for (let i = 0; i < charts.length; i += 2) {
      this.addPage()
      this.drawPageHeader(theme.name, `Graphiques${i > 0 ? ' (suite)' : ''}`)

      const chart1 = charts[i]
      const chart2 = charts[i + 1]

      const startY = 120
      const chartHeight = (this.contentHeight - 140) / 2 - 20

      // Premier graphique
      if (chart1) {
        this.drawChart(
          this.margins.left,
          startY,
          this.contentWidth,
          chartHeight,
          chart1
        )
      }

      // Deuxième graphique
      if (chart2) {
        this.drawChart(
          this.margins.left,
          startY + chartHeight + 40,
          this.contentWidth,
          chartHeight,
          chart2
        )
      }
    }
  }

  /**
   * Dessine un graphique avec son titre et sa source
   */
  private drawChart(
    x: number, 
    y: number, 
    width: number, 
    height: number, 
    chart: ChartData
  ): void {
    // Titre du graphique
    this.doc
      .font('Helvetica-Bold')
      .fontSize(14)
      .fillColor(this.colors.text)
      .text(chart.title, x, y, {
        width: width,
        align: 'left'
      })

    // Zone de l'image
    const imageY = y + 25
    const imageHeight = height - 50

    // Essayer d'insérer l'image si elle est en base64
    if (chart.imageBase64 && chart.imageBase64.startsWith('data:image')) {
      try {
        // Extraire les données base64
        const base64Data = chart.imageBase64.split(',')[1]
        const imageBuffer = Buffer.from(base64Data, 'base64')

        // Calculer les dimensions pour conserver le ratio
        const maxWidth = width
        const maxHeight = imageHeight

        this.doc.image(imageBuffer, x, imageY, {
          fit: [maxWidth, maxHeight],
          align: 'center',
          valign: 'center'
        })
      } catch (error) {
        // Si l'image ne peut pas être insérée, afficher un placeholder
        this.drawImagePlaceholder(x, imageY, width, imageHeight, 'Image non disponible')
      }
    } else {
      this.drawImagePlaceholder(x, imageY, width, imageHeight, 'Image non disponible')
    }

    // Source
    if (chart.source) {
      this.doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor(this.colors.textLight)
        .text(`Source : ${chart.source}`, x, y + height - 20, {
          width: width,
          align: 'left'
        })
    }

    // Note
    if (chart.note) {
      this.doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor(this.colors.textLight)
        .text(chart.note, x, y + height - 10, {
          width: width,
          align: 'left'
        })
    }
  }

  /**
   * Dessine un placeholder pour une image manquante
   */
  private drawImagePlaceholder(
    x: number, 
    y: number, 
    width: number, 
    height: number, 
    message: string
  ): void {
    this.doc
      .roundedRect(x, y, width, height, 4)
      .fillAndStroke(this.colors.background, this.colors.border)

    this.doc
      .font('Helvetica')
      .fontSize(12)
      .fillColor(this.colors.textLight)
      .text(message, x, y + height / 2 - 6, {
        width: width,
        align: 'center'
      })
  }

  // ===========================================================================
  // ÉLÉMENTS COMMUNS
  // ===========================================================================

  /**
   * Dessine l'en-tête d'une page
   */
  private drawPageHeader(themeName: string, subtitle?: string): void {
    // Bande colorée en haut
    this.doc
      .rect(0, 0, this.pageWidth, 60)
      .fill(this.colors.primary)

    // Titre du thème
    this.doc
      .font('Helvetica-Bold')
      .fontSize(18)
      .fillColor('#ffffff')
      .text(themeName, this.margins.left, 20, {
        width: this.contentWidth / 2,
        align: 'left'
      })

    // Sous-titre si présent
    if (subtitle) {
      this.doc
        .font('Helvetica')
        .fontSize(12)
        .fillColor('rgba(255,255,255,0.8)')
        .text(subtitle, this.margins.left, 42, {
          width: this.contentWidth / 2,
          align: 'left'
        })
    }

    // Logo/Mention Audiar à droite
    this.doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor('#ffffff')
      .text('Portrait de Territoire', this.pageWidth - this.margins.right - 150, 25, {
        width: 150,
        align: 'right'
      })

    this.doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor('rgba(255,255,255,0.8)')
      .text('Audiar', this.pageWidth - this.margins.right - 150, 38, {
        width: 150,
        align: 'right'
      })
  }

  /**
   * Ajoute les numéros de page
   */
  private addPageNumbers(): void {
    const pages = this.doc.bufferedPageRange()
    
    for (let i = 0; i < pages.count; i++) {
      this.doc.switchToPage(i)

      // Skip la page de couverture
      if (i === 0) continue

      this.doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor(this.colors.textLight)
        .text(
          `Page ${i} / ${pages.count - 1}`,
          this.margins.left,
          this.pageHeight - 30,
          {
            width: this.contentWidth,
            align: 'center'
          }
        )
    }
  }

  // ===========================================================================
  // UTILITAIRES
  // ===========================================================================

  /**
   * Ajoute une nouvelle page
   */
  private addPage(): void {
    this.doc.addPage()
    this.pageCount++
    this.currentY = this.margins.top
  }

  /**
   * Finalise le document et retourne le buffer
   */
  private finalize(): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = []

      this.doc.on('data', (chunk: Buffer) => {
        chunks.push(chunk)
      })

      this.doc.on('end', () => {
        resolve(Buffer.concat(chunks))
      })

      this.doc.on('error', reject)

      this.doc.end()
    })
  }

  /**
   * Génère le nom de fichier
   */
  private generateFilename(territory: TerritoryInfo, theme: ThemeInfo): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const territorySlug = territory.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
    const themeSlug = theme.id

    return `portrait-${territorySlug}-${themeSlug}-${date}.pdf`
  }

  /**
   * Retourne le label du type de territoire
   */
  private getTerritoryTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      commune: 'Commune',
      epci: 'Intercommunalité',
      departement: 'Département',
      region: 'Région'
    }
    return labels[type] || type
  }

  /**
   * Éclaircit une couleur hexadécimale
   */
  private lightenColor(hex: string, factor: number): string {
    // Convertir hex en RGB
    let r = parseInt(hex.slice(1, 3), 16)
    let g = parseInt(hex.slice(3, 5), 16)
    let b = parseInt(hex.slice(5, 7), 16)

    // Éclaircir
    r = Math.min(255, Math.round(r + (255 - r) * factor))
    g = Math.min(255, Math.round(g + (255 - g) * factor))
    b = Math.min(255, Math.round(b + (255 - b) * factor))

    // Reconvertir en hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  }
}
