/**
 * KPIs pour le thème Enseignement/Formation
 * Source principale : evol_premier_degre / evol_second_degre (données brutes, cohérentes avec les graphiques)
 * indicateurs_* utilisés uniquement pour evol_eleves_4ans (taux d'évolution)
 */
import { type KPI, getMax, filterData, roundDec } from './types'

/** Convertit une valeur en nombre (PostgreSQL renvoie souvent des strings) */
function toNum(v: unknown) {
  if (v === null || v === undefined || v === '') return 0
  const n = Number(v)
  return Number.isNaN(n) ? 0 : n
}

export function getEnseignementKPIs(themeData: any): KPI[] {
  const allKPIs: KPI[] = []

  // --- Sous-thème: Scolarité (Premier degré) ---
  // Dériver nb_eleves et nb_classes depuis evol_premier_degre (source fiable, même que les graphiques)
  let indicateursPrimaire = themeData.indicateurs_primaire
  const evolPrimaire = themeData.evol_premier_degre
  if (evolPrimaire?.length > 0) {
    const maxYear = getMax(evolPrimaire, 'numero_annee')
    const row = maxYear !== null ? filterData(evolPrimaire, { numero_annee: String(maxYear) })[0] : evolPrimaire[evolPrimaire.length - 1]
    if (row) {
      const nbEleves = toNum(row.nb_eleves_pre_elementaire) + toNum(row.nb_eleves_elementaire)
      const nbClasses = toNum(row.nb_classes_pre_elementaire) + toNum(row.nb_classes_elementaire)
      let evolEleves4ans = null
      const indicRow = indicateursPrimaire?.length > 0
        ? filterData(indicateursPrimaire, { numero_annee: String(maxYear) })[0]
        : null
      if (indicRow?.evol_eleves_4ans != null) evolEleves4ans = toNum(indicRow.evol_eleves_4ans)
      indicateursPrimaire = [{
        numero_annee: row.numero_annee,
        borne_temp: '4 ans',
        nb_eleves: nbEleves,
        nb_classes: nbClasses,
        evol_eleves_4ans: evolEleves4ans
      }]
    }
  }
  if (indicateursPrimaire && indicateursPrimaire.length > 0) {
    const maxYear = getMax(indicateursPrimaire, 'numero_annee')
    const data = maxYear !== null
      ? filterData(indicateursPrimaire, { numero_annee: String(maxYear) })[0]
      : indicateursPrimaire[0]

    if (data) {
      allKPIs.push({
        id: 'edu-nb-eleves',
        value: roundDec(data.nb_eleves || 0, 0),
        label: `Nombre d'élèves du premier degré en ${data.numero_annee || ''}`,
        icon: 'users',
        format: 'number',
        subtheme: 'Scolarité'
      })
      allKPIs.push({
        id: 'edu-tx-evol',
        value: roundDec(data.evol_eleves_4ans || 0, 1),
        label: `Taux d'évolution du nombre d'élèves sur ${data.borne_temp || '4 ans'}`,
        icon: 'trend',
        format: 'percentage',
        subtheme: 'Scolarité'
      })
      allKPIs.push({
        id: 'edu-nb-classes',
        value: roundDec(data.nb_classes || 0, 0),
        label: `Nombre de classes du premier degré en ${data.numero_annee || ''}`,
        icon: 'chart',
        format: 'number',
        subtheme: 'Scolarité'
      })
    }
  }

  // Second degré : dériver nb_eleves_second depuis evol_second_degre
  let indicateursSecondaire = themeData.indicateurs_secondaire
  const evolSecondaire = themeData.evol_second_degre
  if (evolSecondaire?.length > 0) {
    const maxYear = getMax(evolSecondaire, 'numero_annee')
    const row = maxYear !== null ? filterData(evolSecondaire, { numero_annee: String(maxYear) })[0] : evolSecondaire[evolSecondaire.length - 1]
    if (row) {
      const nbElevesSecond = toNum(row.nb_eleves_college) + toNum(row.nb_eleves_lycee)
      indicateursSecondaire = [{ numero_annee: row.numero_annee, nb_eleves_second: nbElevesSecond }]
    }
  }
  if (indicateursSecondaire && indicateursSecondaire.length > 0) {
    const maxYear = getMax(indicateursSecondaire, 'numero_annee')
    const data = maxYear !== null
      ? filterData(indicateursSecondaire, { numero_annee: String(maxYear) })[0]
      : indicateursSecondaire[0]

    if (data) {
      allKPIs.push({
        id: 'edu-nb-sec',
        value: roundDec(data.nb_eleves_second || 0, 0),
        label: `Nombre d'élèves du second degré en ${data.numero_annee || ''}`,
        icon: 'users',
        format: 'number',
        subtheme: 'Scolarité'
      })
    }
  }

  return allKPIs
}
