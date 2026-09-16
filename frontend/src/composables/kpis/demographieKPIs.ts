/**
 * KPIs pour le thème Démographie
 */
import { type KPI, getMax, filterData, roundDec } from './types'

export function getDemographieKPIs(themeData: any): KPI[] {
  const allKPIs: KPI[] = []

  // --- Sous-thème: Évolution de la population ---
  // Source prioritaire : v_demo_indicateurs_pop_par_com (nb_hab, tx_evol_an, gain_annuel_hab)
  const indicateursPop = themeData.indicateurs_pop
  if (indicateursPop && indicateursPop.length > 0) {
    const nbHab = indicateursPop.find((r: { indicateur: string }) => r.indicateur === 'nb_hab')
    const txEvolRows = indicateursPop.filter((r: { indicateur: string }) => r.indicateur === 'tx_evol_an')
    const gainRows = indicateursPop.filter((r: { indicateur: string }) => r.indicateur === 'gain_annuel_hab')
    // Période la plus récente : annee "2017-2023" > "2011-2017" (extraire fin de période)
    const extractEndYear = (annee: unknown) => {
      const s = String(annee || '')
      const m = s.match(/-(\d{4})\s*$/)
      const y = m?.[1]
      return y !== undefined ? parseInt(y, 10) : 0
    }
    const lastTxEvol = txEvolRows.length > 0
      ? txEvolRows.reduce((a: { annee: unknown }, b: { annee: unknown }) => (extractEndYear(a.annee) > extractEndYear(b.annee) ? a : b))
      : null
    const lastGain = gainRows.length > 0
      ? gainRows.reduce((a: { annee: unknown }, b: { annee: unknown }) => (extractEndYear(a.annee) > extractEndYear(b.annee) ? a : b))
      : null
    const periode = lastTxEvol?.annee || lastGain?.annee || ''
    const popVal = nbHab ? (typeof nbHab.ind_val === 'string' ? parseFloat(nbHab.ind_val) : nbHab.ind_val) : 0
    const txVal = lastTxEvol ? (typeof lastTxEvol.ind_val === 'string' ? parseFloat(lastTxEvol.ind_val) : lastTxEvol.ind_val) : 0
    const gainVal = lastGain ? (typeof lastGain.ind_val === 'string' ? parseFloat(lastGain.ind_val) : lastGain.ind_val) : 0
    const popYear = nbHab?.annee != null ? String(nbHab.annee) : periode.split('-').pop() || ''
    allKPIs.push({
      id: 'demo-pop-last',
      value: roundDec(popVal || 0, 0),
      label: `Nombre d'habitants en ${popYear}`,
      icon: 'users',
      format: 'number',
      subtheme: 'Évolution de la population'
    })
    allKPIs.push({
      id: 'demo-tx-evol',
      value: roundDec(txVal || 0, 1),
      label: `Taux de croissance annuel moyen sur la période ${periode}`,
      icon: 'trend',
      format: 'percentage',
      subtheme: 'Évolution de la population'
    })
    allKPIs.push({
      id: 'demo-gain-pop',
      value: roundDec(gainVal || 0, 0),
      label: `Gain d'habitants par an sur la période ${periode}`,
      icon: 'chart',
      format: 'number',
      subtheme: 'Évolution de la population'
    })
  } else {
    // Fallback : evolution_population (v_demo_pop_evol_par_com)
    const evolutionPop = themeData.evolution_population
    if (evolutionPop && evolutionPop.length > 0) {
      const lastYear = getMax(evolutionPop, 'annee')
      if (lastYear !== null) {
        const lastYearData = filterData(evolutionPop, { annee: String(lastYear) })
        if (lastYearData.length > 0) {
          const data = lastYearData[0]
          allKPIs.push({
            id: 'demo-pop-last',
            value: roundDec(data.pop || 0, 0),
            label: `Nombre d'habitants en ${lastYear}`,
            icon: 'users',
            format: 'number',
            subtheme: 'Évolution de la population'
          })
          allKPIs.push({
            id: 'demo-tx-evol',
            value: roundDec(data.tx_evol || 0, 1),
            label: `Taux de croissance annuel moyen sur la période ${data.borne_temp || ''}`,
            icon: 'trend',
            format: 'percentage',
            subtheme: 'Évolution de la population'
          })
          allKPIs.push({
            id: 'demo-gain-pop',
            value: roundDec(data.gain_pop_annuel || 0, 0),
            label: `Gain d'habitants par an sur la période ${data.borne_temp || ''}`,
            icon: 'chart',
            format: 'number',
            subtheme: 'Évolution de la population'
          })
        }
      }
    }
  }

  // --- Sous-thème: Âge de la population ---
  const indicateursAge = themeData.indicateurs_age
  if (indicateursAge && indicateursAge.length > 0) {
    const maxYear = getMax(indicateursAge, 'numero_annee')
    if (maxYear !== null) {
      const ageData = filterData(indicateursAge, { numero_annee: String(maxYear) })
      if (ageData.length > 0) {
        const data = ageData[0]
        allKPIs.push({
          id: 'demo-part-m20',
          value: roundDec(data.pop_part_m20ans || 0, 1),
          label: `Part des moins de 20 ans en ${maxYear}`,
          icon: 'users',
          format: 'percentage',
          subtheme: 'Âge de la population'
        })
        allKPIs.push({
          id: 'demo-part-p60',
          value: roundDec(data.pop_part_p60ans || 0, 1),
          label: `Part des plus de 60 ans en ${maxYear}`,
          icon: 'users',
          format: 'percentage',
          subtheme: 'Âge de la population'
        })
        allKPIs.push({
          id: 'demo-ind-jeun',
          value: roundDec(data.ind_jeunesse || 0, 2),
          label: `Indice de jeunesse en ${maxYear}`,
          icon: 'chart',
          format: 'number',
          decimals: 2,
          subtheme: 'Âge de la population'
        })
      }
    }
  }

  // --- Sous-thème: Ménages ---
  const indicateursMenages = themeData.indicateurs_menages
  if (indicateursMenages && indicateursMenages.length > 0) {
    const maxYear = getMax(indicateursMenages, 'numero_annee')
    if (maxYear !== null) {
      const menagesData = filterData(indicateursMenages, { numero_annee: String(maxYear) })
      if (menagesData.length > 0) {
        const data = menagesData[0]
        allKPIs.push({
          id: 'demo-nb-men',
          value: roundDec(data.nb_men || 0, 0),
          label: `Nombre de ménages en ${maxYear}`,
          icon: 'users',
          format: 'number',
          subtheme: 'Ménages'
        })
        allKPIs.push({
          id: 'demo-part-seul',
          value: roundDec(data.part_personnes_seules_men || 0, 1),
          label: `Part des personnes seules en ${maxYear}`,
          icon: 'trend',
          format: 'percentage',
          subtheme: 'Ménages'
        })
        allKPIs.push({
          id: 'demo-taille-men',
          value: roundDec(data.taille_moy_men || 0, 2),
          label: `Taille moyenne des ménages en ${maxYear}`,
          icon: 'chart',
          format: 'number',
          decimals: 2,
          subtheme: 'Ménages'
        })
      }
    }
  }

  // --- Sous-thème: Ménages - Population active 15-64 ans ---
  // Ajouté APRÈS les autres KPIs de ménages pour qu'il apparaisse en 4ème position
  const popActive1564 = themeData.pop_active_15_64
  if (popActive1564 && Array.isArray(popActive1564) && popActive1564.length > 0) {
    const maxYear = getMax(popActive1564, 'numero_annee')
    if (maxYear !== null) {
      const activeData = filterData(popActive1564, { numero_annee: String(maxYear) })
      if (activeData.length > 0) {
        const data = activeData[0]
        // Convertir la valeur en nombre si c'est une string (cas PostgreSQL)
        const rawValue = data.pop_actifs_15_64
        const value = typeof rawValue === 'string' ? parseFloat(rawValue) : rawValue
        
        if (value !== null && value !== undefined && !isNaN(value)) {
          const kpi = {
            id: 'demo-pop-active-15-64',
            value: roundDec(value, 0),
            label: `Nombre d'actifs parmi les 15-64 ans en ${maxYear}`,
            icon: 'users',
            format: 'number' as const,
            subtheme: 'Ménages'
          }
          allKPIs.push(kpi)
        } else {
          console.warn('⚠️ KPI Population active 15-64: valeur invalide', { rawValue, value, data })
        }
      } else {
        console.warn('⚠️ KPI Population active 15-64: Aucune donnée trouvée pour l\'année', maxYear)
      }
    } else {
      console.warn('⚠️ KPI Population active 15-64: Impossible de trouver l\'année maximale')
    }
  } else {
    console.warn('⚠️ KPI Population active 15-64: Données manquantes ou vides', {
      exists: !!popActive1564,
      isArray: Array.isArray(popActive1564),
      length: popActive1564?.length,
      keys: themeData ? Object.keys(themeData) : []
    })
  }

  return allKPIs
}
