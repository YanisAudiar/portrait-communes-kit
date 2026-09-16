import { databaseService, validatePgSchema } from '../services/database'
import { globalCache } from '../services/cache'
import { logErreurSqlColonnes } from '../utils/logErreurSqlColonnes'

export class EconomieRepository {
  schema: string

  constructor() {
    this.schema = validatePgSchema(process.env.PGSCHEMA || '_a_vues_portrait_commune_yl')
  }

  /**
   * Récupère toutes les données Économie pour un territoire.
   * Vues INSEE (convention Portrait : code_insee_concat).
   */
  async getEconomieData(territoire: string) {
    const cacheKey = `economie_data_${territoire}`

    return globalCache.getOrSet(cacheKey, async () => {
      const queryErrors: string[] = []

      const executeQuery = async (queryName: string, query: { text: string; values: string[] }) => {
        try {
          const result = await databaseService.pool.query(query)
          return result.rows
        } catch (error: any) {
          logErreurSqlColonnes('EconomieRepository', queryName, error)
          queryErrors.push(`${queryName}: ${error.message}`)
          return []
        }
      }

      const query1 = {
        text: `SELECT code_insee_concat, lib_com, numero_annee, lib_cat5, nb_etabl_cmna FROM ${this.schema}.v_economie_rep_etabl_sect_par_com WHERE code_insee_concat = $1`,
        values: [territoire],
      }
      const query2 = {
        text: `SELECT code_insee_concat, lib_com, numero_annee, nb_crea_etabl, tx_crea_etab FROM ${this.schema}.v_economie_evol_crea_etabl_par_com WHERE code_insee_concat = $1 ORDER BY numero_annee ASC`,
        values: [territoire],
      }
      const query3 = {
        text: `SELECT code_insee_concat, lib_com, numero_annee, surf_loc_aut_m2 FROM ${this.schema}.v_economie_indicateurs_surf_loc_aut_par_com WHERE code_insee_concat = $1 ORDER BY numero_annee ASC`,
        values: [territoire],
      }
      
      const queryEmp1 = {
        text: `SELECT code_insee_concat, lib_com, numero_annee, nb_emplois, evol_emplois FROM ${this.schema}.v_emploi_indicateurs_emplois_par_com WHERE code_insee_concat = $1 ORDER BY numero_annee ASC`,
        values: [territoire],
      }
      const queryEmp2 = {
        text: `SELECT code_insee_concat, lib_com, numero_annee, lib_csp, nb_emplois FROM ${this.schema}.v_emploi_nb_emplois_csp_par_com_yl WHERE code_insee_concat = $1`,
        values: [territoire],
      }
      const queryEmp3 = {
        text: `SELECT code_insee_concat, lib_com, numero_annee, lib_sect_act, nb_emplois FROM ${this.schema}.v_emploi_nb_emplois_sect_act_par_com WHERE code_insee_concat = $1`,
        values: [territoire],
      }
      const queryEmp4 = {
        text: `SELECT code_insee_concat, lib_com, numero_annee, lib_loc_emploi, nb_actifs_occup FROM ${this.schema}.v_emploi_actifs_occup_loc_emploi_par_com_yl WHERE code_insee_concat = $1`,
        values: [territoire],
      }

      const [r1, r2, r3, re1, re2, re3, re4] = await Promise.all([
        executeQuery('v_economie_rep_etabl_sect_par_com', query1),
        executeQuery('v_economie_evol_crea_etabl_par_com', query2),
        executeQuery('v_economie_indicateurs_surf_loc_aut_par_com', query3),
        executeQuery('v_emploi_indicateurs_emplois_par_com', queryEmp1),
        executeQuery('v_emploi_nb_emplois_csp_par_com', queryEmp2),
        executeQuery('v_emploi_nb_emplois_sect_act_par_com', queryEmp3),
        executeQuery('v_emploi_actifs_occup_loc_emploi_par_com_yl', queryEmp4),
      ])

      // Fallback évolution emplois : si v_emploi_indicateurs_emplois_par_com ne retourne qu'une année,
      // dériver l'évolution depuis v_emploi_nb_emplois_csp_par_com_yl (somme nb_emplois par année)
      let evolEmploiTotal = re1
      if (re1.length < 2 && re2.length > 0) {
        const byYear = new Map<number, { code_insee_concat: string; lib_com: string; nb_emplois: number }>()
        for (const row of re2) {
          const year = row.numero_annee != null ? parseInt(String(row.numero_annee), 10) : null
          if (year == null || isNaN(year)) continue
          const nb = parseFloat(row.nb_emplois) || 0
          if (!byYear.has(year)) {
            byYear.set(year, {
              code_insee_concat: row.code_insee_concat,
              lib_com: row.lib_com,
              nb_emplois: 0
            })
          }
          byYear.get(year)!.nb_emplois += nb
        }
        evolEmploiTotal = Array.from(byYear.entries())
          .sort(([a], [b]) => a - b)
          .map(([numero_annee, data]) => ({ ...data, numero_annee }))
      }

      return {
        creation_etablissements_type: r1,
        evol_creation_etablissements: r2,
        surface_locaux_activite: r3,
        evol_emploi_total: evolEmploiTotal,
        repartition_csp: re2,
        repartition_secteur: re3,
        repartition_lieu_travail: re4,
        _queryErrors: queryErrors.length > 0 ? queryErrors : undefined
      }
    })
  }
}

export const economieRepository = new EconomieRepository()
