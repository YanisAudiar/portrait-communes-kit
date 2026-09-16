/**
 * KPIs pour le thème Solidarité
 */
import { type KPI, getMax, filterData, roundDec } from './types'

export function getSolidariteKPIs(themeData: any): KPI[] {
  const allKPIs: KPI[] = []

  // Priorité à la nouvelle vue v_solidarite_indicateurs_filosofi_par_com_2022
  const indicateursFilosofi2022 = themeData.indicateurs_filosofi_2022

  if (indicateursFilosofi2022 && indicateursFilosofi2022.length > 0) {
    // Trouver l'année la plus récente
    const maxYear = getMax(indicateursFilosofi2022, 'numero_annee')
    if (maxYear !== null) {
      // Filtrer les données pour l'année la plus récente
      const dataAnnee = filterData(indicateursFilosofi2022, { numero_annee: String(maxYear) })

      // 1. Revenu disponible médian par UC
      // Chercher par différents noms possibles de l'indicateur
      const medianeData = dataAnnee.find((r: any) => {
        const indicateur = String(r.indicateurs || '').toLowerCase()
        return indicateur.includes('médiane') || 
               indicateur.includes('mediane') ||
               indicateur.includes('revenu disponible médian') ||
               indicateur.includes('niveau de vie')
      })
      if (medianeData) {
        allKPIs.push({
          id: 'sol-rev-med',
          value: roundDec(medianeData.val || 0, 0),
          label: `Revenu disponible médian par UC en ${maxYear}`,
          icon: 'chart',
          format: 'currency',
          subtheme: 'Revenus'
        })
      }

      // 2. Part des ménages fiscaux imposés
      const imposeData = dataAnnee.find((r: any) => {
        const indicateur = String(r.indicateurs || '').toLowerCase()
        return indicateur.includes('ménages fiscaux imposés') ||
               indicateur.includes('menages fiscaux imposes') ||
               indicateur.includes('part des ménages') ||
               indicateur.includes('part des menages')
      })
      if (imposeData) {
        allKPIs.push({
          id: 'sol-part-imp',
          value: roundDec(imposeData.val || 0, 1),
          label: `Part des ménages fiscaux imposés en ${maxYear}`,
          icon: 'trend',
          format: 'percentage',
          subtheme: 'Revenus'
        })
      }

      // 3. Taux de pauvreté au seuil de 60%
      const pauvreteData = dataAnnee.find((r: any) => {
        const indicateur = String(r.indicateurs || '').toLowerCase()
        return indicateur.includes('pauvreté') ||
               indicateur.includes('pauvrete') ||
               (indicateur.includes('taux') && indicateur.includes('60'))
      })
      if (pauvreteData) {
        allKPIs.push({
          id: 'sol-tx-pauv',
          value: roundDec(pauvreteData.val || 0, 1),
          label: `Taux de pauvreté au seuil de 60% en ${maxYear}`,
          icon: 'chart',
          format: 'percentage',
          subtheme: 'Revenus'
        })
      }
    }
  } else {
    // Fallback sur l'ancienne structure si la nouvelle vue n'est pas disponible
    const origineRevenus = themeData.origine_revenus
    const revenusDisponibles = themeData.revenus_disponibles

    if (origineRevenus && origineRevenus.length > 0) {
      const maxYear = getMax(origineRevenus, 'numero_annee')
      if (maxYear !== null) {
        const revenusData = revenusDisponibles && revenusDisponibles.length > 0
          ? filterData(revenusDisponibles, { numero_annee: String(maxYear) })
          : []

        // Revenu disponible médian
        const medianeData = revenusData.find((r: any) => r.indicateurs === 'Médiane du niveau de vie')
        if (medianeData) {
          allKPIs.push({
            id: 'sol-rev-med',
            value: roundDec(medianeData.val || 0, 0),
            label: `Revenu disponible médian par UC en ${maxYear}`,
            icon: 'chart',
            format: 'currency',
            subtheme: 'Revenus'
          })
        }

        // Part ménages fiscaux imposés
        const imposeData = revenusData.find((r: any) => r.indicateurs === 'Part des ménages fiscaux imposés')
        if (imposeData) {
          allKPIs.push({
            id: 'sol-part-imp',
            value: roundDec(imposeData.val || 0, 1),
            label: `Part des ménages fiscaux imposés en ${maxYear}`,
            icon: 'trend',
            format: 'percentage',
            subtheme: 'Revenus'
          })
        }

        // Taux de pauvreté
        const pauvreteData = revenusData.find((r: any) => r.indicateurs === 'Taux de pauvreté (seuil 60 %)')
        if (pauvreteData) {
          allKPIs.push({
            id: 'sol-tx-pauv',
            value: roundDec(pauvreteData.val || 0, 1),
            label: `Taux de pauvreté au seuil de 60% en ${maxYear}`,
            icon: 'chart',
            format: 'percentage',
            subtheme: 'Revenus'
          })
        }
      }
    }
  }

  return allKPIs
}
