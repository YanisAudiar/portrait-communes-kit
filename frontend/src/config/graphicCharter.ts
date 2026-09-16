/**
 * Charte graphique - Observatoire & Audiar
 * Basé sur l'extraction du code source de l'application Observatoire.
 *
 * 1. Charte Observatoire = style global de l'application
 * 2. Charte Audiar = palette pour graphiques, comparaisons et cartes
 */

// =============================================================================
// 1. CHARTE OBSERVATOIRE (Application)
// =============================================================================

/** Polices - Observatoire (_base.css, _typography.css) */
export const observatoireFonts = {
  /** Titres, en-têtes - Poids 700 (Museo Serif dans l’Observatoire ; fallback Source Serif 4) */
  title: "'Source Serif 4', 'Museo Slab', Georgia, serif",
  /** Corps de texte - Poids 400 */
  body: "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
}

/** Couleurs principales - Observatoire */
export const observatoireColors = {
  /** Fond général */
  background: '#f5f5f7',
  /** Texte principal (bleu pétrole) */
  textPrimary: '#316d7b',
  /** En-tête / Menu Baro - Bleu nuit */
  baroBackground: 'rgba(30, 41, 114, 1)',
  baroBackgroundHex: '#09124E',
  /** Liens */
  link: '#1e2972',
  /** Liens au survol */
  linkHover: '#e36411'
}

/** Couleurs thématiques Observatoire (_theme.css) - Identification des sections (RGBA) */
export const observatoireThematicColors: Record<string, string> = {
  demographie: 'rgba(93, 79, 156, 1)',   // Violet
  habitat: 'rgba(209, 92, 22, 1)',       // Orange brûlé
  foncier: 'rgba(137, 111, 86, 1)',      // Brun
  economie: 'rgba(0, 119, 171, 1)',      // Bleu roi
  emploi: 'rgba(211, 83, 153, 1)',       // Rose profond
  formation: 'rgba(205, 16, 91, 1)',     // Rubis
  solidarite: 'rgba(58, 68, 103, 1)',   // Bleu gris
  mobilite: 'rgba(143, 35, 94, 1)',     // Prune
  fiscalite: 'rgba(194, 124, 112, 1)',  // Terracotta
  ressources: 'rgba(0, 142, 123, 1)',   // Vert émeraude
  tourisme: 'rgba(0, 130, 198, 1)'      // Bleu clair
}

/** Même palette en hex pour l’UI (tabs, cartes, légendes) — objet typé (évite | undefined avec indexed access) */
export const observatoireThematicColorsHex = {
  demographie: '#5d4f9c',
  habitat: '#d15c16',
  foncier: '#896f56',
  economie: '#0077ab',
  emploi: '#d35399',
  formation: '#cd105b',
  solidarite: '#3a4467',
  mobilite: '#8f235e',
  fiscalite: '#c27c70',
  ressources: '#008e7b',
  tourisme: '#0082c6'
} as const

/**
 * Palette principale des graphiques Audiar (8 couleurs) – Baroterritoire / démographie.
 * Barres, secteurs, catégories ; utilisée dans la plupart des thématiques.
 */
export const audiarGraphPaletteMain: string[] = [
  '#638b96', // 1 – Teal / bleu-gris (couleur principale Baroterritoire)
  '#d9b200', // 2 – Jaune doré
  '#b3cbbf', // 3 – Vert menthe clair
  '#a8cbd6', // 4 – Bleu clair
  '#80b187', // 5 – Vert
  '#afb295', // 6 – Gris-vert
  '#e7af9f', // 7 – Saumon / corail
  '#bb8a80'  // 8 – Terre / brique
]

/** Palettes graphiques par thème – charte Audiar (même palette 8 couleurs) */
export const observatoireGraphPalettes = {
  demographie: audiarGraphPaletteMain,
  emploi: audiarGraphPaletteMain,
  habitat: audiarGraphPaletteMain,
  economie: audiarGraphPaletteMain,
  formation: audiarGraphPaletteMain,
  solidarite: audiarGraphPaletteMain
}

/** Bordures graphiques en ligne – Formation (Rapport : #C16271, #FC97A5) */
export const observatoireFormationLineBorders = ['#C16271', '#FC97A5']

// =============================================================================
// 2. CHARTE AUDIAR (Visualisation de données)
// Source : charte graphique Audiar
// =============================================================================

/** Couleur principale – Bleu eucalyptus (CMYK 80 40 40 20, RVB 49 109 123) */
export const audiarMainColor = '#316D7B'

/** Vert AUDIAR – courbes d’évolution et graphiques Agriculture */
export const audiarVertAgriculture = '#74b054'

/** Palette Audiar pour graphiques = palette principale 8 couleurs (charte) */
export const audiarPalette = audiarGraphPaletteMain

/** Déclinaisons du bleu eucalyptus – gamme principale */
export const audiarBleuEucalyptus = {
  fonce: '#316D7B',       // Bleu eucalyptus foncé (principal)
  moyen: '#638b96',       // Teal palette graphiques (aligné audiarGraphPaletteMain)
  clair: '#94B1B8',      // RVB 148 177 184
  tresClair: '#C6DADC'   // RVB 198 218 219
}

/** Palette verts doux / naturels */
export const audiarVerts = [
  '#80B288', '#A3C5A4', '#C3DAC2', '#E0EEE1',
  '#749586', '#94AFA1', '#B4CBBF', '#D4EAE0',
  '#9A9E80', '#B0B396', '#C7CAAD', '#DFE2C7'
]

/** Palette beiges / minéraux */
export const audiarBeiges = [
  '#796E5B', '#9A907F', '#BEB6AA', '#E5E1DA',
  '#CAB9A3', '#DCD0C1', '#EFE8E1'
]

/** Palette ocres / jaunes */
export const audiarOcres = [
  '#DAB300', '#E3C55D', '#ECD99D', '#F4EDD8'
]

/** Palette rouges / terracotta */
export const audiarRouges = [
  '#A5665A', '#BC8A80', '#D4B2AB', '#EFDCDC',
  '#D1654C', '#DC8A74', '#E7AFA0', '#F3D3CF'
]

/** Palette bleus complémentaires */
export const audiarBleusComplementaires = [
  '#A9CCD7', '#BCD8E0', '#CEE4EB'
]

/** Fonds très clairs / neutres */
export const audiarFondsClairs = [
  '#EFE8E1', '#F4EDD8', '#E0EEE1', '#D4EAE0', '#CEE4EB'
]

/** Nuances séquentielles – cartes thématiques (basées sur la charte) */
export const audiarSequentialPalettes = {
  /** Bleu eucalyptus : très clair → foncé */
  bleuEucalyptus: [
    audiarBleuEucalyptus.tresClair,
    audiarBleuEucalyptus.clair,
    audiarBleuEucalyptus.moyen,
    audiarBleuEucalyptus.fonce
  ],
  /** Verts doux */
  verts: ['#E0EEE1', '#C3DAC2', '#A3C5A4', '#80B288', '#749586'],
  /** Ocres / jaunes */
  ocres: ['#F4EDD8', '#ECD99D', '#E3C55D', '#DAB300'],
  /** Rouges / terracotta */
  rouges: ['#EFDCDC', '#D4B2AB', '#BC8A80', '#A5665A'],
  /** Positif général (legacy) */
  positive: ['#F4EDD8', '#ECD99D', '#E3C55D', '#DAB300', '#796E5B'],
  /** Démographie – verts charte */
  demographie: ['#E0EEE1', '#C3DAC2', '#A3C5A4', '#80B288', '#749586'],
  /** Économie – bleus charte */
  economie: ['#CEE4EB', '#BCD8E0', '#A9CCD7', audiarBleuEucalyptus.clair, audiarBleuEucalyptus.moyen]
}
