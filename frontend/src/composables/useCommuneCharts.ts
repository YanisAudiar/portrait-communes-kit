import { ref, unref, type Ref } from 'vue'
import { api } from '@/services/api'
import { getChartTypeForTheme } from '@/utils/themeCharts'

interface ChartState {
  demographie: any
  habitat: any
  enseignement: any
  'economie-emploi': any
  solidarite: any
  'energie-environnement': any
  mobilites: any
  agriculture: any
  'equipement-services': any
  /** Accès dynamique (ex. theme.id) — requis avec noUncheckedIndexedAccess sur les clés littérales */
  [key: string]: any
}

/**
 * Crée un état vide pour les données de graphiques par thème.
 */
const createEmptyChartState = (): ChartState => ({
  demographie: null,
  habitat: null,
  enseignement: null,
  'economie-emploi': null,
  solidarite: null,
  'energie-environnement': null,
  mobilites: null,
  agriculture: null,
  'equipement-services': null
})

/**
 * Récupère les données depuis l'API avec gestion d'erreurs.
 * Charge toutes les thématiques en parallèle.
 * @param {string} insee - Code INSEE de la commune
 * @returns {Promise<Partial<ChartState>>} Objet contenant les résultats par thème
 */
const fetchAllThemesData = async (insee: string): Promise<Partial<ChartState>> => {
  const results = await Promise.allSettled([
    api.getCommuneDemographics(insee),
    api.getCommuneHousing(insee),
    api.getCommuneEconomy(insee),
    api.getCommuneFormation(insee),
    api.getCommuneSolidarite(insee),
    api.getCommuneAgriculture(insee)
  ])

  // Helper pour extraire la valeur ou null
  const getValue = (result: PromiseSettledResult<any>) => (result.status === 'fulfilled' ? result.value : null)

  return {
    demographie: getValue(results[0]),
    habitat: getValue(results[1]),
    'economie-emploi': getValue(results[2]),
    enseignement: getValue(results[3]),
    solidarite: getValue(results[4]),
    agriculture: getValue(results[5])
  }
}

/**
 * Prépare et alimente les jeux de données utilisés par les graphiques de la vue CommuneDetail.
 *
 * @param {string|Ref<string>} codeInsee - Code INSEE de la commune ciblée.
 * @param {Ref<Record<string, any>|null>} communeData - Données principales déjà chargées.
 */
export function useCommuneCharts(codeInsee: string | Ref<string>, communeData: Ref<Record<string, any> | null>) {
  const chartData = ref<ChartState>(createEmptyChartState())
  const evolutionData = ref<any[]>([]) // Gardé pour compatibilité, mais les données sont maintenant dans chartData par thème

  /**
   * Résout le code INSEE depuis une référence réactive ou une valeur directe.
   */
  const resolveCodeInsee = (): string => unref(codeInsee)

  /**
   * Récupère et structure les données nécessaires aux représentations graphiques.
   */
  const loadChartData = async () => {
    const insee = resolveCodeInsee()

    if (!insee) {
      chartData.value = createEmptyChartState()
      return
    }

    try {
      const allThemesData = await fetchAllThemesData(insee)
      
      // Mise à jour réactive des données
      chartData.value = {
        ...chartData.value,
        ...allThemesData
      }

    } catch (err) {
      console.error('❌ Erreur chargement données graphiques:', err)
      // En cas d'erreur critique, on laisse l'état vide ou on gère selon besoins
    }
  }

  /**
   * Fonction générique de fallback (non implémentée ici car gérée par themeCharts si données manquantes)
   */
  const generateFallbackData = () => {
    console.warn('Fallback data generation not implemented in new architecture')
  }

  return {
    chartData,
    evolutionData, // Gardé pour compatibilité d'interface, mais vide ou non utilisé directement
    loadChartData,
    getChartTypeForTheme,
    generateFallbackData
  }
}
