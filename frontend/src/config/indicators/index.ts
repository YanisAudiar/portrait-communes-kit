/**
 * Configuration centralisée des indicateurs
 * Exporte tous les indicateurs et fonctions utilitaires
 * 
 * Structure modulaire : chaque thème a son propre fichier
 */

// Import des thèmes
import { themes, isThemeWithoutData, THEME_IDS_WITHOUT_DATA } from './themes'

// Import des indicateurs par thème
import { demographieIndicators } from './demographie'
import { habitatIndicators } from './habitat'
import { economieIndicators } from './economie'
import { formationIndicators } from './formation'
import { solidariteIndicators } from './solidarite'
import { environnementIndicators } from './environnement'
import { agricultureIndicators } from './agriculture'

export { themes, isThemeWithoutData, THEME_IDS_WITHOUT_DATA }

export interface Indicator {
  id: string
  code?: string
  theme: string
  subtheme: string
  label: string
  description?: string
  source?: string
  [key: string]: any
}

/**
 * Liste complète de tous les indicateurs groupés par thématique
 * Fusionne tous les indicateurs de tous les thèmes
 */
export const indicators: Indicator[] = [
  ...demographieIndicators,
  ...habitatIndicators,
  ...economieIndicators,
  ...formationIndicators,
  ...solidariteIndicators,
  ...environnementIndicators,
  ...agricultureIndicators
]

/**
 * Obtient tous les indicateurs d'une thématique donnée
 * @param {string} themeId - Identifiant du thème (ex: 'demographie')
 * @returns {Array} Tableau des indicateurs du thème
 */
export function getIndicatorsByTheme(themeId: string): Indicator[] {
  return indicators.filter(indicator => indicator.theme === themeId)
}

/**
 * Obtient toutes les sous-thématiques d'une thématique avec leurs indicateurs
 * @param {string} themeId - Identifiant du thème
 * @returns {Array} Tableau des sous-thématiques avec leurs indicateurs
 */
export function getSubthemesByTheme(themeId: string) {
  const themeIndicators = getIndicatorsByTheme(themeId)
  const subthemes = [...new Set(themeIndicators.map(ind => ind.subtheme))]
  return subthemes.map(subtheme => ({
    label: subtheme,
    indicators: themeIndicators.filter(ind => ind.subtheme === subtheme)
  }))
}

/**
 * Obtient un indicateur par son code
 * @param {string} code - Code de l'indicateur
 * @returns {Object|undefined} Indicateur trouvé ou undefined
 */
export function getIndicatorByCode(code: string): Indicator | undefined {
  return indicators.find(indicator => indicator.code === code)
}

/**
 * Obtient un indicateur par son id
 * @param {string} id - Identifiant de l'indicateur
 * @returns {Object|undefined} Indicateur trouvé ou undefined
 */
export function getIndicatorById(id: string): Indicator | undefined {
  return indicators.find(indicator => indicator.id === id)
}

interface GroupedTheme {
  id: string
  label: string
  /** Couleur thème (charte) — présente via spread des entrées `themes` */
  color: string
  indicators: Indicator[]
  subthemes: any[]
  [key: string]: any
}

/**
 * Groupe les indicateurs par thématique pour un affichage structuré
 * @param {Object} options - Options de configuration
 * @param {boolean} options.includeEmpty - Inclure les thèmes sans indicateurs (défaut: true)
 * @returns {Array} Tableau des thèmes avec leurs indicateurs et sous-thématiques
 */
export function getIndicatorsGroupedByTheme(options: { includeEmpty?: boolean } = {}): GroupedTheme[] {
  const { includeEmpty = true } = options

  const groupedThemes = Object.values(themes)
    .map(theme => ({
      ...theme,
      indicators: getIndicatorsByTheme(theme.id),
      subthemes: getSubthemesByTheme(theme.id)
    }))

  if (!includeEmpty) {
    return groupedThemes.filter(theme => theme.indicators.length > 0)
  }

  return groupedThemes
}

/**
 * Ordre personnalisé des sous-thématiques par thème
 * Définit l'ordre d'affichage souhaité pour chaque thème
 */
const SUBTHEME_ORDER: Record<string, string[]> = {
  'demographie': [
    'Évolution de la population',
    'Âge de la population',
    'Ménages'
  ],
  'habitat': [
    'Parc de logements',
    'Marché de l\'habitat',
    'Construction' // Garde l'ordre alphabétique pour les autres
  ],
  'economie-emploi': [
    'Tissu économique',
    'Emploi'
  ]
}

/**
 * Trie les sous-thématiques selon l'ordre personnalisé défini pour chaque thème
 * Si un thème n'a pas d'ordre défini, utilise le tri alphabétique
 * @param {string} themeId - Identifiant du thème
 * @param {string[]} subthemes - Liste des sous-thématiques à trier
 * @returns {string[]} Liste des sous-thématiques triées
 */
export function sortSubthemesByTheme(themeId: string, subthemes: string[]): string[] {
  const order = SUBTHEME_ORDER[themeId]
  
  // Si aucun ordre n'est défini pour ce thème, tri alphabétique
  if (!order) {
    return [...subthemes].sort((a, b) => {
      if (a === 'Autres') return 1
      if (b === 'Autres') return -1
      return a.localeCompare(b)
    })
  }

  // Trier selon l'ordre défini
  const sorted: string[] = []
  const remaining = new Set(subthemes)

  // Ajouter dans l'ordre défini
  for (const subtheme of order) {
    if (remaining.has(subtheme)) {
      sorted.push(subtheme)
      remaining.delete(subtheme)
    }
  }

  // Ajouter les sous-thématiques restantes (non définies dans l'ordre) en fin, triées alphabétiquement
  const remainingSorted = Array.from(remaining).sort((a, b) => {
    if (a === 'Autres') return 1
    if (b === 'Autres') return -1
    return a.localeCompare(b)
  })
  sorted.push(...remainingSorted)

  return sorted
}
