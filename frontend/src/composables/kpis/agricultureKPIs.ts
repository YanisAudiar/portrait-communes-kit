/**
 * KPIs pour le thème Agriculture
 */
import { type KPI, getMax, filterData, roundDec } from './types'

export function getAgricultureKPIs(themeData: any): KPI[] {
  const allKPIs: KPI[] = []

  // --- Sous-thème: Exploitations agricoles ---
  const nbExploitations = themeData.nb_exploitations
  if (nbExploitations && nbExploitations.length > 0) {
    const maxYear = getMax(nbExploitations, 'numero_annee')
    if (maxYear !== null) {
      const lastYearData = filterData(nbExploitations, { numero_annee: String(maxYear) })
      if (lastYearData.length > 0) {
        allKPIs.push({
          id: 'agr-nb-expl',
          value: roundDec(lastYearData[0].ind_val || 0, 0),
          label: `Nombre de sièges d'exploitations en ${maxYear}`,
          icon: 'chart',
          format: 'number',
          subtheme: 'Exploitations agricoles'
        })
      }
    }
  }

  const tauxEvolExpl = themeData.taux_evol_exploitations
  if (tauxEvolExpl && tauxEvolExpl.length > 0) {
    const maxYear = getMax(tauxEvolExpl, 'annee')
    if (maxYear !== null) {
      const lastYearData = filterData(tauxEvolExpl, { annee: String(maxYear) })
      if (lastYearData.length > 0) {
        allKPIs.push({
          id: 'agr-tx-evol',
          value: roundDec(lastYearData[0].ind_val || 0, 1),
          label: `Taux d'évolution exploitations/an en ${maxYear}`,
          icon: 'trend',
          format: 'percentage',
          subtheme: 'Exploitations agricoles'
        })
      }
    }
  }

  const nbEtp = themeData.nb_etp
  if (nbEtp && nbEtp.length > 0) {
    const maxYear = getMax(nbEtp, 'annee')
    if (maxYear !== null) {
      const lastYearData = filterData(nbEtp, { annee: String(maxYear) })
      if (lastYearData.length > 0) {
        allKPIs.push({
          id: 'agr-nb-etp',
          value: roundDec(lastYearData[0].etp || 0, 0),
          label: `Nombre d'ETP agricoles en ${maxYear}`,
          icon: 'users',
          format: 'number',
          subtheme: 'Démographie agricole'
        })
      }
    }
  }

  // --- Sous-thème: Surfaces agricoles ---
  const sau = themeData.sau
  if (sau && sau.length > 0) {
    // KPI : Surface Agricole Utile (SAU) en ha
    const sauData = sau.filter((s: any) => s.indicateur === 'sau_ha' || s.indicateur === 'SAU')
    if (sauData.length > 0) {
      const maxYear = getMax(sauData, 'annee')
      if (maxYear !== null) {
        const lastYearData = filterData(sauData, { annee: String(maxYear) })
        if (lastYearData.length > 0) {
          allKPIs.push({
            id: 'agr-sau-ha',
            value: roundDec(lastYearData[0].ind_val || 0, 0),
            label: `Surface Agricole Utile (SAU) en ${maxYear}`,
            icon: 'chart',
            format: 'number',
            subtheme: 'Surfaces agricoles'
          })
        }
      }
    }

    // KPI : Taux d'évolution de la SAU (%)
    const evolSauData = sau.filter((s: any) => s.indicateur === 'evol_sau' || s.indicateur === 'Évolution SAU')
    if (evolSauData.length > 0) {
      const maxYear = getMax(evolSauData, 'annee')
      if (maxYear !== null) {
        const lastYearData = filterData(evolSauData, { annee: String(maxYear) })
        if (lastYearData.length > 0) {
          allKPIs.push({
            id: 'agr-tx-evol-sau',
            value: roundDec(lastYearData[0].ind_val || 0, 1),
            label: `Taux d'évolution de la SAU en ${maxYear}`,
            icon: 'trend',
            format: 'percentage',
            subtheme: 'Surfaces agricoles'
          })
        }
      }
    }

    // Part du territoire couvert par SAU
    const partSau = sau.filter((s: any) => s.indicateur === 'part_sau' || s.indicateur === 'Part SAU')
    if (partSau.length > 0) {
      const maxYear = getMax(partSau, 'annee')
      if (maxYear !== null) {
        const lastYearData = filterData(partSau, { annee: String(maxYear) })
        if (lastYearData.length > 0) {
          allKPIs.push({
            id: 'agr-part-sau',
            value: roundDec(lastYearData[0].ind_val || 0, 1),
            label: `Part du territoire couvert par SAU en ${maxYear}`,
            icon: 'trend',
            format: 'percentage',
            subtheme: 'Surfaces agricoles'
          })
        }
      }
    }
  }

  return allKPIs
}
