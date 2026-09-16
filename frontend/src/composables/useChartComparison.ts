/**
 * Composable useChartComparison
 * Gère la logique de comparaison de territoires sur les graphiques
 * 
 * Fonctionnalités :
 * - Ajouter/supprimer des territoires de comparaison (max 2)
 * - Récupérer les données via API
 * - Formater les datasets pour Chart.js
 * - Gérer l'état (loading, erreurs)
 */
import { ref, computed, type Ref } from 'vue'
import { api } from '@/services/api'

// =============================================================================
// TYPES
// =============================================================================

/** Configuration d'un territoire de comparaison */
export interface ComparisonTerritory {
  code: string       // Code INSEE de la commune
  label: string      // Nom de la commune
  data: any[]        // Données récupérées
}

/** Options du composable */
export interface UseChartComparisonOptions {
  /** Fonction pour récupérer les données d'une commune (selon le thème) */
  fetchDataFn?: (codeInsee: string) => Promise<any>
  /** Champ utilisé pour les valeurs */
  valueField?: string
  /** Champ utilisé pour les labels */
  labelField?: string
  /** Limite maximale de comparaisons (défaut: 2) */
  maxComparisons?: number
}

/** Couleurs pour les datasets de comparaison */
const COMPARISON_COLORS = [
  '#10B981', // Vert émeraude (1ère comparaison)
  '#8B5CF6', // Violet (2ème comparaison)
]

// =============================================================================
// COMPOSABLE
// =============================================================================

export function useChartComparison(options: UseChartComparisonOptions = {}) {
  const {
    fetchDataFn,
    valueField = 'value',
    labelField = 'label',
    maxComparisons = 2
  } = options

  // -------------------------------------------------------------------------
  // État
  // -------------------------------------------------------------------------
  
  /** Liste des territoires ajoutés en comparaison */
  const comparisonTerritories = ref<ComparisonTerritory[]>([])
  
  /** État de chargement */
  const loading = ref(false)
  
  /** Message d'erreur */
  const error = ref<string | null>(null)
  
  /** Panneau de comparaison ouvert/fermé */
  const isPanelOpen = ref(false)

  // -------------------------------------------------------------------------
  // Computed
  // -------------------------------------------------------------------------
  
  /** Nombre de comparaisons actives */
  const comparisonCount = computed(() => comparisonTerritories.value.length)
  
  /** Limite atteinte ? */
  const isMaxReached = computed(() => comparisonTerritories.value.length >= maxComparisons)
  
  /** Peut-on ajouter une comparaison ? */
  const canAddComparison = computed(() => !isMaxReached.value && !loading.value)
  
  /** Liste des codes déjà en comparaison (pour éviter les doublons) */
  const comparisonCodes = computed(() => 
    comparisonTerritories.value.map(t => t.code)
  )

  // -------------------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------------------
  
  /**
   * Ajoute un territoire en comparaison
   * @param code - Code INSEE de la commune
   * @param label - Nom de la commune
   * @param customFetchFn - Fonction personnalisée pour récupérer les données
   * @returns true si ajout réussi, false sinon
   */
  async function addComparison(
    code: string, 
    label: string,
    customFetchFn?: (codeInsee: string) => Promise<any>
  ): Promise<boolean> {
    // Vérifications
    if (isMaxReached.value) {
      error.value = `Maximum ${maxComparisons} comparaisons autorisées`
      return false
    }
    
    if (comparisonCodes.value.includes(code)) {
      error.value = 'Ce territoire est déjà en comparaison'
      return false
    }
    
    // Déterminer la fonction de récupération à utiliser
    const fetchFn = customFetchFn || fetchDataFn
    if (!fetchFn) {
      error.value = 'Aucune fonction de récupération de données configurée'
      return false
    }
    
    loading.value = true
    error.value = null
    
    try {
      // Récupération des données de la commune
      const response = await fetchFn(code)
      
      // Extraction des données selon la structure de réponse
      let data: any[] = []
      if (Array.isArray(response)) {
        data = response
      } else if (response?.data && Array.isArray(response.data)) {
        data = response.data
      } else if (response) {
        // Tenter d'extraire les données de la première clé qui est un array
        const keys = Object.keys(response)
        for (const key of keys) {
          if (Array.isArray(response[key])) {
            data = response[key]
            break
          }
        }
      }
      
      if (data.length === 0) {
        error.value = `Aucune donnée trouvée pour ${label}`
        return false
      }
      
      // Ajout du territoire
      comparisonTerritories.value.push({
        code,
        label,
        data
      })
      
      return true
      
    } catch (err: any) {
      console.error('❌ Erreur ajout comparaison:', err)
      error.value = err.message || 'Erreur lors de la récupération des données'
      return false
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Supprime le dernier territoire de comparaison
   */
  function removeLastComparison(): void {
    if (comparisonTerritories.value.length > 0) {
      comparisonTerritories.value.pop()
      error.value = null
    }
  }
  
  /**
   * Supprime un territoire spécifique par son code
   * @param code - Code INSEE du territoire à supprimer
   */
  function removeComparison(code: string): void {
    const index = comparisonTerritories.value.findIndex(t => t.code === code)
    if (index !== -1) {
      comparisonTerritories.value.splice(index, 1)
      error.value = null
    }
  }
  
  /**
   * Supprime toutes les comparaisons
   */
  function clearAllComparisons(): void {
    comparisonTerritories.value = []
    error.value = null
  }
  
  /**
   * Bascule l'ouverture du panneau de comparaison
   */
  function togglePanel(): void {
    isPanelOpen.value = !isPanelOpen.value
  }
  
  /**
   * Efface l'erreur
   */
  function clearError(): void {
    error.value = null
  }

  // -------------------------------------------------------------------------
  // Génération des datasets
  // -------------------------------------------------------------------------
  
  /**
   * Génère les datasets de comparaison pour Chart.js
   * @param originalData - Données du territoire principal
   * @param chartType - Type de graphique (bar, line, etc.)
   * @param customValueField - Champ de valeur personnalisé (optionnel, surcharge valueField)
   * @returns Array de datasets à ajouter au graphique
   */
  function buildComparisonDatasets(
    originalData: any[],
    chartType: string = 'bar',
    customValueField?: string
  ): any[] {
    if (comparisonTerritories.value.length === 0) {
      return []
    }
    
    // Utiliser le champ personnalisé s'il est fourni, sinon celui du composable
    const fieldToUse = customValueField || valueField
    
    return comparisonTerritories.value.map((territory, index) => {
      const color = COMPARISON_COLORS[index % COMPARISON_COLORS.length]
      
      // Extraire les valeurs selon le valueField
      const values = territory.data.map(item => {
        const val = item[fieldToUse]
        if (typeof val === 'number') return val
        if (typeof val === 'string') {
          const parsed = parseFloat(val.replace(',', '.'))
          return isNaN(parsed) ? 0 : parsed
        }
        return 0
      })
      
      // Configuration de base du dataset
      const baseDataset = {
        label: territory.label,
        data: values,
        backgroundColor: color,
        borderColor: color
      }
      
      // Configuration spécifique selon le type de graphique
      if (chartType === 'line') {
        return {
          ...baseDataset,
          backgroundColor: 'transparent',
          borderWidth: 2,
          tension: 0.1,
          fill: false
        }
      }
      
      // Bar chart par défaut
      return {
        ...baseDataset,
        borderWidth: 0,
        borderRadius: 4,
        borderSkipped: false
      }
    })
  }

  // -------------------------------------------------------------------------
  // Retour du composable
  // -------------------------------------------------------------------------
  
  return {
    // État
    comparisonTerritories,
    loading,
    error,
    isPanelOpen,
    
    // Computed
    comparisonCount,
    isMaxReached,
    canAddComparison,
    comparisonCodes,
    
    // Actions
    addComparison,
    removeLastComparison,
    removeComparison,
    clearAllComparisons,
    togglePanel,
    clearError,
    
    // Génération datasets
    buildComparisonDatasets,
    
    // Constantes utiles
    COMPARISON_COLORS,
    maxComparisons
  }
}
