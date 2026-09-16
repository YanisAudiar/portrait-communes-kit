/**
 * Repository Solidarité – Vues Baroterritoire
 *
 * Structure des vues : code_insee_concat, lib_com, numero_annee, indicateurs, val (format long)
 * - v_social_indicateurs_filosofi_par_com : revenus, origine, KPIs
 * - v_social_dependants_presta50_100_par_com : allocataires dépendants 50% / 100%
 */
import { databaseService, validatePgSchema } from '../services/database'
import { globalCache } from '../services/cache'
import { logErreurSqlColonnes } from '../utils/logErreurSqlColonnes'
import { getColsForVue } from '../config/vueColumnConventions'

export class SolidariteRepository {
  schema: string

  constructor() {
    this.schema = validatePgSchema(process.env.PGSCHEMA || '_a_vues_portrait_commune_yl')
  }

  /**
   * Récupère toutes les données Solidarité pour un territoire
   */
  async getSolidariteData(territoire: string) {
    const cacheKey = `solidarite_data_${territoire}`

    return globalCache.getOrSet(cacheKey, async () => {
      const queryErrors: string[] = []

      const executeQuery = async (queryName: string, query: { text: string; values: string[] }) => {
        try {
          const result = await databaseService.pool.query(query)
          return result.rows
        } catch (error: any) {
          logErreurSqlColonnes('SolidariteRepository', queryName, error)
          queryErrors.push(`${queryName}: ${error.message}`)
          return []
        }
      }

      const v = (vue: string) => getColsForVue(vue, 'solidarite_baro')
      const schemaPortrait = this.schema

      // 1. Indicateurs FiLoSoFi – Portrait (format long indicateurs/val)
      let r1 = await executeQuery('v_solidarite_indicateurs_filosofi_par_com_2022', {
        text: `SELECT code_insee_concat, lib_com, numero_annee, indicateurs, val FROM ${schemaPortrait}.v_solidarite_indicateurs_filosofi_par_com_2022 WHERE code_insee_concat = $1 ORDER BY numero_annee ASC, indicateurs ASC`,
        values: [territoire],
      })
      if (r1.length === 0) {
        r1 = await executeQuery('v_solidarite_indicateurs_filosofi_par_com', {
          text: `SELECT code_insee_concat, lib_com, numero_annee, indicateurs, val FROM ${schemaPortrait}.v_solidarite_indicateurs_filosofi_par_com WHERE code_insee_concat = $1 ORDER BY numero_annee ASC, indicateurs ASC`,
          values: [territoire],
        })
      }

      // 2. Allocataires dépendants 50% / 100% – Baro
      const q2 = v('v_social_dependants_presta50_100_par_com')
      const r2 = await executeQuery('v_social_dependants_presta50_100_par_com', {
        text: `SELECT ${q2.code} AS code_insee_concat, ${q2.lib} AS lib_com, numero_annee, tr50pfrb, tr100pfrb FROM ${this.schema}.v_social_dependants_presta50_100_par_com WHERE ${q2.code} = $1 ORDER BY numero_annee ASC`,
        values: [territoire],
      })

      const toRow = (r: any) => ({
        indicateurs: String(r.indicateurs ?? ''),
        val: Number(r.val ?? 0),
        numero_annee: r.numero_annee != null ? String(r.numero_annee) : undefined,
        code_insee_concat: r.code_insee_concat,
        lib_com: r.lib_com,
      })

      const allFilosofi = r1.map(toRow)

      // Libellés exacts de la vue Baro (cf. structure fournie)
      const indicateursRevenus = ['Médiane du niveau de vie', 'Niveau de vie décile 1', 'Niveau de vie décile 9']
      const indicateursOrigine = [
        "Part des revenus d'activités",
        'Part des pensions, retraites et rentes',
        'Part des revenus du patrimoine et autres',
        'Part des prestations sociales',
        'Part des impôts',
      ]

      const filterBy = (rows: typeof allFilosofi, list: string[]) =>
        rows.filter((r) => list.some((ind) => r.indicateurs === ind || r.indicateurs.includes(ind)))

      const maxYear = allFilosofi.reduce((acc, r) => {
        const y = r.numero_annee ? parseInt(r.numero_annee, 10) : 0
        return y > acc ? y : acc
      }, 0)
      const dataAnneeMax = maxYear > 0 ? allFilosofi.filter((r) => r.numero_annee === String(maxYear)) : allFilosofi

      const revenus = filterBy(dataAnneeMax, indicateursRevenus)
      const origine = filterBy(dataAnneeMax, indicateursOrigine)

      return {
        revenus_disponibles: revenus.length > 0 ? revenus : filterBy(allFilosofi, indicateursRevenus),
        origine_revenus: origine.length > 0 ? origine : filterBy(allFilosofi, indicateursOrigine),
        indicateurs_filosofi_2022: allFilosofi,
        evol_alloc_dependants: [],
        dependants_presta50_100: r2,
        _queryErrors: queryErrors.length > 0 ? queryErrors : undefined
      }
    })
  }
}

export const solidariteRepository = new SolidariteRepository()
