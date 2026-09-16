/**
 * Service pour la gestion des couleurs des graphiques
 * Centralise les palettes : Observatoire (application) + Audiar (visualisation)
 * Voir frontend/src/config/graphicCharter.ts pour la charte complète
 */

import {
  audiarPalette,
  audiarVertAgriculture,
  observatoireColors,
  observatoireGraphPalettes,
  observatoireFormationLineBorders
} from '@/config/graphicCharter'

/** Couleurs principales - Observatoire + Audiar (liens, baro, texte, accents) */
export const premiumColors = {
  primary: observatoireColors.link,           // #1e2972 - Liens, bleu foncé
  secondary: observatoireColors.textPrimary,  // #316d7b - Texte principal, bleu pétrole
  accent: observatoireColors.linkHover,       // #e36411 - Orange survol
  danger: '#c80000',                          // Rouge (palette séquentielle)
  dark: observatoireColors.baroBackgroundHex, // #09124E - Baro / en-tête
  gray: '#9CA3AF'                             // Gris contexte
}

/** Palette par défaut pour graphiques = palette Audiar (visualisation) */
export const defaultChartPalette = audiarPalette

// =============================================================================
// FONCTIONS UTILITAIRES POUR GÉNÉRER DES NUANCES DE COULEURS
// =============================================================================

/**
 * Convertit une couleur RGBA en objet {r, g, b, a}
 */
function parseRGBA(color: string): { r: number; g: number; b: number; a: number } | null {
  // Format rgba(r, g, b, a)
  const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
  if (rgbaMatch) {
    const [, rStr, gStr, bStr, aStr] = rgbaMatch
    if (rStr === undefined || gStr === undefined || bStr === undefined) return null
    return {
      r: parseInt(rStr, 10),
      g: parseInt(gStr, 10),
      b: parseInt(bStr, 10),
      a: aStr !== undefined ? parseFloat(aStr) : 1
    }
  }

  // Format hex #RRGGBB ou #RGB
  const hexMatch = color.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
  if (hexMatch?.[1]) {
    const hex = hexMatch[1]
    if (hex.length === 3) {
      const [a, b, c] = [hex[0], hex[1], hex[2]]
      if (a === undefined || b === undefined || c === undefined) return null
      return {
        r: parseInt(a + a, 16),
        g: parseInt(b + b, 16),
        b: parseInt(c + c, 16),
        a: 1
      }
    }
    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16),
      a: 1
    }
  }

  return null
}

/**
 * Convertit un objet {r, g, b, a} en chaîne RGBA
 */
function toRGBA(rgba: { r: number; g: number; b: number; a: number }): string {
  return `rgba(${Math.round(rgba.r)}, ${Math.round(rgba.g)}, ${Math.round(rgba.b)}, ${rgba.a})`
}

/**
 * Convertit un objet {r, g, b, a} en chaîne hexadécimale
 */
function toHex(rgba: { r: number; g: number; b: number; a: number }): string {
  const r = Math.round(rgba.r).toString(16).padStart(2, '0')
  const g = Math.round(rgba.g).toString(16).padStart(2, '0')
  const b = Math.round(rgba.b).toString(16).padStart(2, '0')
  return `#${r}${g}${b}`
}

/**
 * Ajuste la luminosité d'une couleur
 * @param color - Couleur en format RGBA ou hex
 * @param factor - Facteur de luminosité (1.0 = identique, >1.0 = plus clair, <1.0 = plus foncé)
 * @returns Couleur ajustée en format RGBA
 */
function adjustBrightness(color: string, factor: number): string {
  const rgba = parseRGBA(color)
  if (!rgba) return color

  // Ajuster la luminosité en multipliant chaque composante
  const newR = Math.min(255, Math.max(0, rgba.r * factor))
  const newG = Math.min(255, Math.max(0, rgba.g * factor))
  const newB = Math.min(255, Math.max(0, rgba.b * factor))

  return toRGBA({ r: newR, g: newG, b: newB, a: rgba.a })
}

/**
 * Génère un tableau de nuances à partir d'une couleur de base
 * Crée 5 nuances : très foncé, foncé, base, clair, très clair
 * @param baseColor - Couleur de base en format RGBA ou hex
 * @param count - Nombre de nuances à générer (défaut: 5)
 * @param useHex - Si true, retourne en format hex, sinon RGBA (défaut: false)
 * @returns Tableau de nuances de couleurs
 */
export function generateColorShades(
  baseColor: string,
  count: number = 5,
  useHex: boolean = false
): string[] {
  const rgba = parseRGBA(baseColor)
  if (!rgba) return [baseColor]

  const shades: string[] = []
  // Facteurs de luminosité pour créer un dégradé harmonieux
  // Du plus foncé au plus clair
  const brightnessFactors = [
    0.5,   // Très foncé
    0.7,   // Foncé
    1.0,   // Base
    1.3,   // Clair
    1.6    // Très clair
  ]

  for (let i = 0; i < count; i++) {
    const factor = brightnessFactors[i % brightnessFactors.length] ?? 1
    const adjusted = adjustBrightness(baseColor, factor)
    shades.push(useHex ? rgbaToHex(adjusted) : adjusted)
  }

  return shades
}

/**
 * Convertit une couleur RGBA en hexadécimal
 */
function rgbaToHex(rgba: string): string {
  const parsed = parseRGBA(rgba)
  if (!parsed) return rgba
  return toHex(parsed)
}

// Couleurs par thème – Rapport Couleurs Thèmes (palettes graphiques dashboard.js)
// Thèmes avec palette dédiée : observatoireGraphPalettes ; autres : nuances générées ou Audiar
export const themeColors: Record<string, string[]> = {
  /** Palette Audiar - Graphiques, comparaisons */
  default: audiarPalette,
  /** Sous-ensemble palette Audiar */
  premium: audiarPalette.slice(0, 4),
  /** Pyramide des âges – palette Audiar (bleu eucalyptus) Hommes / Femmes */
  pyramid: [
    'rgba(49, 109, 123, 0.6)',   // Hommes – bleu eucalyptus foncé (#316D7B)
    'rgba(148, 177, 184, 0.6)'   // Femmes – bleu eucalyptus clair (#94B1B8)
  ],
  // Démographie & Emploi – palette violets (opacités 0.7 → 0.3)
  demo: observatoireGraphPalettes.demographie,
  demographie: observatoireGraphPalettes.demographie,
  emploi: observatoireGraphPalettes.emploi,
  // Habitat – palette orangée / terre (0.8 → 0.6)
  habitat: observatoireGraphPalettes.habitat,
  // Foncier – nuances générées (thème non dans le rapport)
  foncier: generateColorShades('rgba(137, 111, 86, 1)', 5, false),
  // Économie – palette bleus (0.8 → 0.4)
  eco: observatoireGraphPalettes.economie,
  economie: observatoireGraphPalettes.economie,
  'economie-emploi': observatoireGraphPalettes.economie,
  // Formation – palette rosée (bordures ligne : #C16271, #FC97A5)
  formation: observatoireGraphPalettes.formation,
  enseignement: observatoireGraphPalettes.formation,
  // Solidarité – déclinaison opacités 0.5 → 0.1
  solidarite: observatoireGraphPalettes.solidarite,
  // Fiscalité, Mobilité, Tourisme, Ressources – nuances générées
  fiscalite: generateColorShades('rgba(194, 124, 112, 1)', 5, false),
  mobilite: generateColorShades('rgba(143, 35, 94, 1)', 5, false),
  tourisme: generateColorShades('rgba(0, 130, 198, 1)', 5, false),
  ressources: generateColorShades('rgba(0, 142, 123, 1)', 5, false),
  // Agriculture – vert AUDIAR #74b054 en premier, puis palette 8 couleurs (charte)
  agriculture: [
    audiarVertAgriculture, // #74b054 – vert AUDIAR (courbes, barres)
    ...audiarPalette.slice(1, 8)
  ]
}

/** Bordures pour graphiques en ligne – Formation (Rapport : #C16271, #FC97A5) */
export const themeLineBorderColors: Record<string, string[]> = {
  formation: observatoireFormationLineBorders,
  enseignement: observatoireFormationLineBorders
}

// Couleurs de bordure par thème - Valeurs RGBA exactes de l'ancienne application
// Extrait de src/client/css/main.css
export const themeBorderColors: Record<string, string[]> = {
  // Démographie - rgba(93, 79, 156, 0.5)
  demo: [
    'rgba(93, 79, 156, 0.5)'
  ],
  // Habitat - rgba(209, 92, 22, 0.5)
  habitat: [
    'rgba(209, 92, 22, 0.5)'
  ],
  // Foncier - rgba(137, 111, 86, 0.5)
  foncier: [
    'rgba(137, 111, 86, 0.5)'
  ],
  // Économie - rgba(0, 119, 171, 0.5)
  eco: [
    'rgba(0, 119, 171, 0.5)'
  ],
  economie: [
    'rgba(0, 119, 171, 0.5)'
  ],
  // Emploi - rgba(211, 83, 153, 0.5)
  emploi: [
    'rgba(211, 83, 153, 0.5)'
  ],
  // Formation - rgba(205, 16, 91, 0.5)
  formation: [
    'rgba(205, 16, 91, 0.5)'
  ],
  enseignement: [
    'rgba(205, 16, 91, 0.5)'
  ],
  // Solidarité - rgba(58, 68, 103, 0.5)
  solidarite: [
    'rgba(58, 68, 103, 0.5)'
  ],
  // Fiscalité - rgba(194, 124, 112, 0.5)
  fiscalite: [
    'rgba(194, 124, 112, 0.5)'
  ],
  // Mobilité - rgba(143, 35, 94, 0.5)
  mobilite: [
    'rgba(143, 35, 94, 0.5)'
  ],
  // Tourisme - rgba(0, 130, 198, 0.5)
  tourisme: [
    'rgba(0, 130, 198, 0.5)'
  ],
  // Ressources - rgba(0, 142, 123, 0.51)
  ressources: [
    'rgba(0, 142, 123, 0.51)'
  ],
  // Démographie (mapping vers demo)
  demographie: [
    'rgba(93, 79, 156, 0.5)'
  ],
  'economie-emploi': [
    'rgba(0, 119, 171, 0.5)'
  ]
}

/**
 * Obtient les couleurs d'un thème
 * @param {string} theme - Nom du thème
 * @returns {Array} Tableau de couleurs
 */
export function getThemeColors(theme: string = 'default'): string[] {
  return themeColors[theme] ?? audiarPalette
}

/**
 * Obtient les couleurs de bordure d'un thème
 * @param {string} theme - Nom du thème
 * @returns {Array} Tableau de couleurs de bordure
 */
export function getThemeBorderColors(theme: string = 'default'): string[] {
  return themeBorderColors[theme] ?? []
}

/**
 * Obtient les couleurs de bordure pour graphiques en ligne (ex. Formation : #C16271, #FC97A5)
 * @param theme - Nom du thème
 * @returns Tableau de couleurs de bordure pour lignes
 */
export function getThemeLineBorderColors(theme: string): string[] {
  return themeLineBorderColors[theme] ?? getThemeColors(theme).slice(0, 2)
}
