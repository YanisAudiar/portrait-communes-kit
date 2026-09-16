/**
 * Index des KPIs par thème
 * Factory pour récupérer les KPIs selon le thème actif
 */
export type { KPI, FilterCriteria } from './types'
export { getMax, filterData, roundDec, groupBySum } from './types'
export { getDemographieKPIs } from './demographieKPIs'
export { getHabitatKPIs } from './habitatKPIs'
export { getEconomieKPIs } from './economieKPIs'
export { getEnseignementKPIs } from './enseignementKPIs'
export { getSolidariteKPIs } from './solidariteKPIs'
export { getAgricultureKPIs } from './agricultureKPIs'

import type { KPI } from './types'
import { getDemographieKPIs } from './demographieKPIs'
import { getHabitatKPIs } from './habitatKPIs'
import { getEconomieKPIs } from './economieKPIs'
import { getEnseignementKPIs } from './enseignementKPIs'
import { getSolidariteKPIs } from './solidariteKPIs'
import { getAgricultureKPIs } from './agricultureKPIs'

/**
 * Récupère les KPIs pour un thème donné
 */
export function getKPIsForTheme(themeId: string, themeData: any): KPI[] {
  if (!themeData) return []

  switch (themeId) {
    case 'demographie':
      return getDemographieKPIs(themeData)
    case 'habitat':
      return getHabitatKPIs(themeData)
    case 'economie':
    case 'economie-emploi':
      return getEconomieKPIs(themeData)
    case 'formation':
    case 'enseignement':
      return getEnseignementKPIs(themeData)
    case 'solidarite':
      return getSolidariteKPIs(themeData)
    case 'agriculture':
      return getAgricultureKPIs(themeData)
    default:
      return []
  }
}
