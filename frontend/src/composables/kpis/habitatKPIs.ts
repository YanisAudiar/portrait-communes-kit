/**
 * KPIs pour le thème Habitat
 */
import { type KPI, getMax, filterData, roundDec } from './types'

export function getHabitatKPIs(themeData: any): KPI[] {
  const allKPIs: KPI[] = []

  // --- Sous-thème: Parc de logements ---
  // Vue v_habitat_indicateurs_logts_rp_par_com_yl
  const indicateursLogtsRp = themeData.indicateurs_logts_rp
  if (indicateursLogtsRp && indicateursLogtsRp.length > 0) {
    const maxYear = getMax(indicateursLogtsRp, 'numero_annee')
    if (maxYear !== null) {
      const lastYearData = filterData(indicateursLogtsRp, { numero_annee: String(maxYear) })
      if (lastYearData.length > 0) {
        const data = lastYearData[0]
        allKPIs.push({
          id: 'hab-nb-log',
          value: roundDec(data.nb_logts || 0, 0),
          label: `Nombre de logements dans le parc en ${maxYear}`,
          icon: 'chart',
          format: 'number',
          subtheme: 'Parc de logements'
        })
        allKPIs.push({
          id: 'hab-part-prop',
          value: roundDec(data.part_prop_occup || 0, 1),
          label: `Part des propriétaires occupants en ${maxYear}`,
          icon: 'trend',
          format: 'percentage',
          subtheme: 'Parc de logements'
        })
        allKPIs.push({
          id: 'hab-part-mais',
          value: roundDec(data.part_maisons_ind || 0, 1),
          label: `Part des maisons individuelles parmi les résidences principales en ${maxYear}`,
          icon: 'chart',
          format: 'percentage',
          subtheme: 'Parc de logements'
        })
      }
    }
  }

  // --- Sous-thème: Construction ---
  // 3 KPIs : nb commencés année N, part collectif période N-4 à N, moyenne 4 ans
  const indicateursLogtCommences = themeData.indicateurs_logt_commences
  const evolLogtsCommences = themeData.evol_logts_commences
  if (indicateursLogtCommences && indicateursLogtCommences.length > 0) {
    const maxYear = getMax(indicateursLogtCommences, 'numero_annee')
    if (maxYear !== null) {
      const lastYearData = filterData(indicateursLogtCommences, { numero_annee: String(maxYear) })
      if (lastYearData.length > 0) {
        const data = lastYearData[0]
        // Si nb_logts_commences est null pour l'année courante (ex: 2025 pas encore publié),
        // utiliser la dernière année disponible dans evol_logts_commences
        let nbCommencesValue = data.nb_logts_commences
        let nbCommencesYear = maxYear
        if ((nbCommencesValue === null || nbCommencesValue === undefined) && evolLogtsCommences?.length > 0) {
          const evolSorted = [...evolLogtsCommences].sort(
            (a: any, b: any) => (b.numero_annee ?? 0) - (a.numero_annee ?? 0)
          )
          const lastEvol = evolSorted.find((r: any) => r.nb_logts_commences != null)
          if (lastEvol) {
            nbCommencesValue = lastEvol.nb_logts_commences
            nbCommencesYear = lastEvol.numero_annee ?? maxYear
          }
        }
        allKPIs.push({
          id: 'hab-log-comm',
          value: roundDec(nbCommencesValue ?? 0, 0),
          label: `Nombre de logements neufs commencés en ${nbCommencesYear}`,
          icon: 'chart',
          format: 'number',
          subtheme: 'Construction'
        })
        allKPIs.push({
          id: 'hab-part-coll-comm',
          value: roundDec(data.part_collectif_commences_moy_4ans || 0, 1),
          label: `Part des logements collectifs commencés sur la période ${maxYear - 4}-${maxYear}`,
          icon: 'trend',
          format: 'percentage',
          subtheme: 'Construction'
        })
        allKPIs.push({
          id: 'hab-log-comm-moy',
          value: roundDec(data.nb_logts_commences_moy_4ans || 0, 0),
          label: 'Nombre de logements neufs commencés en moyenne au cours des 4 dernières années en date de prise en compte',
          icon: 'chart',
          format: 'number',
          subtheme: 'Construction'
        })
      }
    }
  }

  // --- Sous-thème: Marché de l'habitat ---
  // 2 KPIs : moyenne 4 ans, nb vendus année N (source: indicateurs_occasion)
  const indicateursOccasion = themeData.indicateurs_occasion
  if (indicateursOccasion && indicateursOccasion.length > 0) {
    const maxYear = getMax(indicateursOccasion, 'numero_annee')
    if (maxYear !== null) {
      const lastYearData = filterData(indicateursOccasion, { numero_annee: String(maxYear) })
      if (lastYearData.length > 0) {
        const data = lastYearData[0]
        allKPIs.push({
          id: 'hab-log-vend-moy',
          value: roundDec(data.nb_logts_vendus_moy_4ans || 0, 0),
          label: `Nombre de logements d'occasion vendus en moyenne entre ${maxYear - 4} et ${maxYear}`,
          icon: 'chart',
          format: 'number',
          subtheme: 'Marché de l\'habitat'
        })
        allKPIs.push({
          id: 'hab-log-vend',
          value: roundDec(data.nb_logts_vendus || 0, 0),
          label: `Nombre de logements d'occasion vendus en ${maxYear}`,
          icon: 'chart',
          format: 'number',
          subtheme: 'Marché de l\'habitat'
        })
      }
    }
  }

  return allKPIs
}
