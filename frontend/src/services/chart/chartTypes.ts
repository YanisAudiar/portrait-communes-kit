/**
 * Types TypeScript stricts pour la validation des données de graphiques
 * Assure la cohérence et la sécurité des données à chaque étape du processus
 */

/**
 * Types de graphiques supportés
 */
export type ChartType = 'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'polarArea'

/**
 * Configuration d'un dataset pour graphiques multi-séries
 */
export interface DatasetConfig {
  code: string // Nom du champ dans les données (ex: 'nb_logts_vendus')
  label: string // Label affiché dans la légende (ex: 'Appartement')
}

/**
 * Options de formatage des données pour Chart.js
 * Tous les champs sont optionnels pour la compatibilité avec le code existant
 */
export interface ChartDataOptions {
  labelField?: string // Champ utilisé pour les labels (ex: 'numero_annee')
  valueField?: string // Champ utilisé pour les valeurs (ex: 'nb_rp')
  theme?: string // Thème de couleurs
  datasetLabel?: string // Label par défaut du dataset
  colors?: string | string[] | null // Couleurs personnalisées
  datasets?: DatasetConfig[] | null // Configuration multi-séries
  groupByField?: string // Champ utilisé pour grouper les séries (ex: 'type_bien')
  /** Pyramide des âges : premier dataset en valeurs négatives pour effet miroir (barres gauche/droite) */
  pyramid?: boolean
}

/**
 * Données formatées pour Chart.js
 */
export interface FormattedChartData {
  labels: string[]
  datasets: ChartDataset[]
}

/**
 * Dataset Chart.js standardisé
 */
export interface ChartDataset {
  label: string
  data: number[]
  backgroundColor: string | string[]
  borderColor?: string | string[]
  borderWidth?: number
  borderRadius?: number
  borderSkipped?: boolean
}

/**
 * Données brutes d'un élément (ligne de données de l'API)
 */
export interface RawDataItem {
  [key: string]: string | number | null | undefined
}

/**
 * Validation des données brutes
 */
export function validateRawData(data: unknown): data is RawDataItem[] {
  if (!Array.isArray(data)) {
    console.warn('⚠️ validateRawData: Les données doivent être un tableau')
    return false
  }
  
  if (data.length === 0) {
    console.warn('⚠️ validateRawData: Le tableau de données est vide')
    return false
  }
  
  // Vérifier que chaque élément est un objet
  if (!data.every(item => typeof item === 'object' && item !== null && !Array.isArray(item))) {
    console.warn('⚠️ validateRawData: Tous les éléments doivent être des objets')
    return false
  }
  
  return true
}

/**
 * Validation d'un champ dans les données
 */
export function validateField(data: RawDataItem[], fieldName: string): boolean {
  if (!validateRawData(data)) return false
  
  const sampleItem = data[0]
  if (sampleItem === undefined) return false
  if (!(fieldName in sampleItem)) {
    console.warn(`⚠️ validateField: Le champ "${fieldName}" n'existe pas dans les données. Champs disponibles:`, Object.keys(sampleItem))
    return false
  }
  
  return true
}

/**
 * Validation d'une configuration de dataset
 */
export function validateDatasetConfig(config: unknown): config is DatasetConfig {
  if (typeof config !== 'object' || config === null) {
    console.warn('⚠️ validateDatasetConfig: La configuration doit être un objet')
    return false
  }
  
  const cfg = config as Record<string, unknown>
  
  if (typeof cfg.code !== 'string' || cfg.code.length === 0) {
    console.warn('⚠️ validateDatasetConfig: Le champ "code" doit être une chaîne non vide')
    return false
  }
  
  if (typeof cfg.label !== 'string' || cfg.label.length === 0) {
    console.warn('⚠️ validateDatasetConfig: Le champ "label" doit être une chaîne non vide')
    return false
  }
  
  return true
}

/**
 * Validation d'un tableau de configurations de datasets
 */
export function validateDatasetConfigs(configs: unknown): configs is DatasetConfig[] {
  if (!Array.isArray(configs)) {
    console.warn('⚠️ validateDatasetConfigs: Les configurations doivent être un tableau')
    return false
  }
  
  if (configs.length === 0) {
    console.warn('⚠️ validateDatasetConfigs: Le tableau de configurations est vide')
    return false
  }
  
  if (!configs.every(validateDatasetConfig)) {
    console.warn('⚠️ validateDatasetConfigs: Toutes les configurations ne sont pas valides')
    return false
  }
  
  return true
}

/**
 * Validation d'un type de graphique
 */
export function validateChartType(type: string): type is ChartType {
  const validTypes: ChartType[] = ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea']
  if (!validTypes.includes(type as ChartType)) {
    console.warn(`⚠️ validateChartType: Type de graphique invalide "${type}". Types valides:`, validTypes)
    return false
  }
  return true
}

/**
 * Extraction sécurisée d'une valeur numérique depuis les données
 * Gère les cas null, undefined, string et number
 */
export function extractNumericValue(item: RawDataItem, fieldName: string): number {
  const value = item[fieldName]
  
  // Si null ou undefined, retourner 0 (pas d'avertissement car c'est normal)
  if (value === null || value === undefined) {
    return 0
  }
  
  // Si c'est déjà un nombre, le retourner tel quel
  if (typeof value === 'number') {
    return isNaN(value) ? 0 : value
  }
  
  // Si c'est une chaîne, essayer de la parser
  if (typeof value === 'string') {
    // Nettoyer la chaîne (supprimer espaces, remplacer virgule par point)
    const cleaned = value.trim().replace(/,/g, '.')
    if (cleaned === '' || cleaned === 'null' || cleaned === 'undefined') {
      return 0
    }
    const parsed = parseFloat(cleaned)
    if (!isNaN(parsed)) {
      return parsed
    }
  }
  
  // Si c'est un booléen, convertir en nombre
  if (typeof value === 'boolean') {
    return value ? 1 : 0
  }
  
  // Si c'est un objet, essayer d'extraire une propriété value/y/x
  if (typeof value === 'object' && value !== null) {
    const obj = value as Record<string, unknown>
    if (typeof obj.value === 'number') return obj.value
    if (typeof obj.y === 'number') return obj.y
    if (typeof obj.x === 'number') return obj.x
  }
  
  // En dernier recours, avertir et retourner 0
  console.warn(`⚠️ extractNumericValue: Impossible d'extraire une valeur numérique pour "${fieldName}" depuis:`, value)
  return 0
}

/**
 * Extraction sécurisée d'une valeur de label depuis les données
 */
export function extractLabelValue(item: RawDataItem, fieldName: string): string {
  const value = item[fieldName]
  
  if (value === null || value === undefined) {
    return 'Sans label'
  }
  
  return String(value).trim()
}

// =============================================================================
// TYPES DISCRIMINÉS POUR LE FORMATAGE DES GRAPHIQUES
// =============================================================================

/**
 * Mode de formatage du graphique (discriminant)
 * - single: Une seule série de données (ex: évolution population)
 * - multi-explicit: Plusieurs séries définies explicitement via datasets (ex: naissances/décès)
 * - multi-grouped: Plusieurs séries créées dynamiquement par groupement (ex: ventes par type)
 * - circular: Graphique circulaire (pie/doughnut)
 */
export type ChartMode = 'single' | 'multi-explicit' | 'multi-grouped' | 'circular'

/**
 * Options pour graphique mono-série
 * Ex: Évolution du nombre d'habitants
 */
export interface SingleSeriesOptions {
  mode: 'single'
  labelField: string   // Champ pour l'axe X (ex: 'annee')
  valueField: string   // Champ pour les valeurs (ex: 'pop')
}

/**
 * Options pour graphique multi-séries explicite
 * Ex: Naissances et décès (datasets définis dans la config)
 */
export interface MultiExplicitOptions {
  mode: 'multi-explicit'
  labelField: string         // Champ pour l'axe X (ex: 'annee')
  datasets: DatasetConfig[]  // Séries explicites [{ code: 'nb_deces', label: 'Décès' }, ...]
}

/**
 * Options pour graphique multi-séries avec groupement dynamique
 * Ex: Ventes par type de bien (séries créées depuis les valeurs uniques d'un champ)
 */
export interface MultiGroupedOptions {
  mode: 'multi-grouped'
  xAxisField: string    // Champ pour l'axe X (ex: 'numero_annee')
  groupField: string    // Champ pour créer les séries (ex: 'type_bien')
  valueField: string    // Champ pour les valeurs (ex: 'nb_logts_vendus')
}

/**
 * Options pour graphique circulaire (pie/doughnut)
 * Ex: Répartition des ménages
 */
export interface CircularOptions {
  mode: 'circular'
  labelField: string   // Champ pour les labels des parts (ex: 'lib_type_men')
  valueField: string   // Champ pour les valeurs (ex: 'nb_men')
}

/**
 * Union de toutes les options de formatage possibles
 * Le discriminant 'mode' permet à TypeScript de distinguer les types
 */
export type FormatOptions = SingleSeriesOptions | MultiExplicitOptions | MultiGroupedOptions | CircularOptions

/**
 * Type guard pour vérifier si les options sont de type SingleSeries
 */
export function isSingleSeries(options: FormatOptions): options is SingleSeriesOptions {
  return options.mode === 'single'
}

/**
 * Type guard pour vérifier si les options sont de type MultiExplicit
 */
export function isMultiExplicit(options: FormatOptions): options is MultiExplicitOptions {
  return options.mode === 'multi-explicit'
}

/**
 * Type guard pour vérifier si les options sont de type MultiGrouped
 */
export function isMultiGrouped(options: FormatOptions): options is MultiGroupedOptions {
  return options.mode === 'multi-grouped'
}

/**
 * Type guard pour vérifier si les options sont de type Circular
 */
export function isCircular(options: FormatOptions): options is CircularOptions {
  return options.mode === 'circular'
}
