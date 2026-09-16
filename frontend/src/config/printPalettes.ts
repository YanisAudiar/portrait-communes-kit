/**
 * Palettes de couleurs et styles spécifiques au rendu PDF.
 * Chaque thème peut surcharger la palette par défaut.
 */

const DEFAULT_GRADIENT = ['#6258C7', '#8071D9', '#9C89E7', '#BBA9F2', '#DCD0FB']

export interface PrintPalette {
  colors: {
    gradient: string[]
    bar: string
    barAlt: string
    border: string
  }
  legend: {
    color: string
    fontSize: number
  }
  datalabels: {
    color: string
    fontSize: number
    anchor: string
    align: string
  }
  fontFamily: string
}

const defaultPalette: PrintPalette = {
  colors: {
    gradient: DEFAULT_GRADIENT,
    bar: '#6258C7',
    barAlt: '#8A7DE1',
    border: '#ffffff'
  },
  legend: {
    color: '#2C2F4A',
    fontSize: 12
  },
  datalabels: {
    color: '#2C2F4A',
    fontSize: 11,
    anchor: 'end',
    align: 'top'
  },
  fontFamily: "'Montserrat', 'Segoe UI', sans-serif"
}

export const printPalettes: Record<string, PrintPalette> = {
  demographie: {
    ...defaultPalette,
    colors: {
      // Utilisation des nouvelles couleurs Baroprint
      // Primary: #5A4C8C, Secondary: #A89EC8
      gradient: ['#5A4C8C', '#8175A9', '#A89EC8', '#CFC7E2', '#F0EDF8'],
      bar: '#5A4C8C',
      barAlt: '#A89EC8',
      border: '#ffffff'
    },
    legend: {
      color: '#2C2F4A',
      fontSize: 12
    },
    datalabels: {
      color: '#352F55',
      fontSize: 11,
      anchor: 'end',
      align: 'top'
    }
  }
}

export const getPrintPalette = (themeId: string): PrintPalette => {
  return printPalettes[themeId] || defaultPalette
}

/**
 * Retourne un tableau de couleurs adapté au type de graphique.
 * - doughnut : palette gradient
 * - bar : couleur principale + déclinaisons
 */
export const buildSeriesColors = (palette: PrintPalette | null, chartType: string, count: number): string[] => {
  const safePalette = palette || defaultPalette
  const gradient = safePalette.colors?.gradient || DEFAULT_GRADIENT
  const fallback = DEFAULT_GRADIENT[0] ?? '#6258C7'
  const atGradient = (i: number) => gradient[i % gradient.length] ?? fallback

  if (chartType === 'doughnut' || chartType === 'pie') {
    return Array.from({ length: count }, (_, index) => atGradient(index))
  }

  if (chartType === 'bar' || chartType === 'line') {
    const main = safePalette.colors?.bar ?? gradient[0] ?? fallback
    const alt = safePalette.colors?.barAlt ?? gradient[1] ?? gradient[0] ?? fallback

    if (count <= 1) {
      return [main]
    }

    const colors: string[] = []
    for (let i = 0; i < count; i++) {
      colors.push(i % 2 === 0 ? main : alt)
    }
    return colors
  }

  return Array.from({ length: count }, (_, index) => atGradient(index))
}
