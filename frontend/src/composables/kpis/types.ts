/**
 * Types et utilitaires communs pour les KPIs
 */

export interface KPI {
  id: string
  value: number
  label: string
  icon: string
  format: 'number' | 'percentage' | 'currency'
  subtheme: string
  /** Nombre de décimales à afficher (ex: 2 pour indice de jeunesse, taille moyenne ménages) */
  decimals?: number
  /** Valeur de référence du territoire d'étude (médiane ou moyenne) pour contexte comparatif */
  benchmarkRM?: number
  /** Libellé du benchmark (ex: "médiane RM", "moyenne RM") — fourni par l'instance */
  benchmarkLabel?: string
  /** Remplace l'affichage de la valeur (ex. texte si le taux est NULL en base) */
  valueDisplayOverride?: string
  /**
   * Si true : le KPI reste dans le tableau (ordre, partage par id, impression) mais la carte
   * ne s’affiche pas à l’écran — réserve la place dans la grille pour éviter un décalage des
   * indicateurs suivants (ex. sous-thème Emploi).
   */
  visuallyHidden?: boolean
}

export interface FilterCriteria {
  [key: string]: string | string[]
}

/**
 * Trouve la valeur maximale d'un champ dans un tableau
 */
export const getMax = (data: any[], field: string): number | null => {
  if (!data || !Array.isArray(data) || data.length === 0) return null
  return Math.max(...data.map(item => item[field] || 0))
}

/**
 * Filtre les données selon plusieurs critères
 */
export const filterData = (data: any[], filters: FilterCriteria): any[] => {
  if (!data || !Array.isArray(data)) return []
  return data.filter(item => {
    return Object.keys(filters).every(key => {
      const filterValue = filters[key]
      if (Array.isArray(filterValue)) {
        return filterValue.includes(String(item[key]))
      }
      return String(item[key]) === String(filterValue)
    })
  })
}

/**
 * Arrondit un nombre avec un nombre de décimales
 */
export const roundDec = (value: any, decimals: number = 0): number => {
  if (value === null || value === undefined || isNaN(value)) return 0
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

/**
 * Calcule la somme groupée par un champ
 */
export const groupBySum = (data: any[], groupField: string, sumField: string): any[] => {
  if (!data || !Array.isArray(data)) return []
  const grouped: Record<string, any> = {}
  data.forEach(item => {
    const key = item[groupField]
    if (!grouped[key]) {
      grouped[key] = { [groupField]: key, [sumField]: 0 }
    }
    grouped[key][sumField] += parseFloat(item[sumField] || 0)
  })
  return Object.values(grouped)
}
