import { computed, type Ref } from 'vue'
import { getKPIsForTheme, type KPI } from './kpis'

/**
 * Composable pour récupérer les KPIs d'une thématique
 * Refactorisé pour déléguer la logique aux fichiers modulaires dans kpis/
 */
export function useThemeKPIs(
  activeTheme: Ref<string>, 
  chartData: Ref<any>,
  selectedSubtheme?: Ref<string | null>
) {
  /**
   * Retourne tous les KPIs pour une thématique
   */
  const getAllKPIsForTheme = (themeId: string): KPI[] => {
    if (!chartData.value) return []
    const themeData = chartData.value[themeId]
    return getKPIsForTheme(themeId, themeData)
  }

  /**
   * Retourne les KPIs filtrés par sous-thématique si spécifié
   */
  const getKPIsFiltered = (themeId: string, subtheme?: string | null): KPI[] => {
    const allKPIs = getAllKPIsForTheme(themeId)
    
    if (subtheme) {
      return allKPIs.filter(kpi => kpi.subtheme === subtheme)
    }
    
    return allKPIs
  }

  /**
   * KPIs courants basés sur le thème actif et la sous-thématique sélectionnée
   */
  const currentKPIs = computed(() => {
    const subtheme = selectedSubtheme?.value || null
    return getKPIsFiltered(activeTheme.value, subtheme)
  })

  /**
   * Retourne tous les KPIs pour le thème actif (sans filtre subtheme)
   */
  const allKPIs = computed(() => getAllKPIsForTheme(activeTheme.value))

  return {
    currentKPIs,
    allKPIs,
    getKPIsForTheme: getKPIsFiltered,
    getAllKPIsForTheme
  }
}
