import { databaseService, validatePgSchema } from '../services/database'
import { globalCache } from '../services/cache'
import { logErreurSqlColonnes } from '../utils/logErreurSqlColonnes'
import { getColsForVue } from '../config/vueColumnConventions'

export class HabitatRepository {
  /** Schéma unique : toutes les vues habitat */
  schema: string

  constructor() {
    this.schema = validatePgSchema(process.env.PGSCHEMA || '_a_vues_portrait_commune_yl')
  }

  /**
   * Récupère toutes les données Habitat pour un territoire
   */
  async getHabitatData(territoire: string) {
    const cacheKey = `habitat_data_${territoire}`
    
    return globalCache.getOrSet(cacheKey, async () => {
      const queryErrors: string[] = []

      const executeQuery = async (queryName: string, query: { text: string; values: string[] }) => {
        try {
          const result = await databaseService.pool.query(query)
          return result.rows
        } catch (error: any) {
          logErreurSqlColonnes('HabitatRepository', queryName, error)
          queryErrors.push(`${queryName}: ${error.message}`)
          return []
        }
      }

      /**
       * Exécute une requête sur v_constr_logts_indicateurs_territoire_annee_new_yl_dpc avec fallback.
       * Si code_geo est integer en base et on passe une string, la comparaison peut échouer.
       * Fallback : réessayer avec code_geo::text = $1 si le premier résultat est vide.
       */
      const executeConstrQuery = async (
        queryName: string,
        baseQuery: { text: string; values: string[] }
      ) => {
        let rows = await executeQuery(queryName, baseQuery)
        if (rows.length === 0) {
          const fallbackText = baseQuery.text.replace(
            /code_geo = \$1/g,
            'code_geo::text = $1'
          )
          rows = await executeQuery(`${queryName}_fallback`, {
            text: fallbackText,
            values: baseQuery.values
          })
        }
        return rows
      }

      const vBaro = (vue: string) => getColsForVue(vue, 'habitat_baro')
      const vPortrait = (vue: string) => getColsForVue(vue, 'habitat_portrait')

      // Query 1: Statut occupation - Baro
      const q1 = vBaro('v_habitat_evol_statut_occupation_logement_par_com')
      const query1 = {
        text: `SELECT ${q1.code} AS code_insee_concat, ${q1.lib} AS lib_com, numero_annee, statut_occup, nb_logements AS nb_rp FROM ${this.schema}.v_habitat_evol_statut_occupation_logement_par_com WHERE ${q1.code} = $1 ORDER BY numero_annee ASC`,
        values: [territoire],
      };
      // Query 2: Évolution RP - Portrait
      const q2 = vPortrait('v_habitat_evol_nb_rp_par_com_yl')
      const query2 = {
        text: `SELECT ${q2.code} AS code_insee_concat, ${q2.lib} AS lib_com, numero_annee, nb_rp FROM ${this.schema}.v_habitat_evol_nb_rp_par_com_yl WHERE ${q2.code} = $1 ORDER BY numero_annee ASC`,
        values: [territoire],
      };
      // Query 3: Indicateurs logements - Baro JOIN (même convention pour les 2 vues)
      const q3 = vBaro('v_habitat_indicateurs_logts_par_com')
      const query3 = {
        text: `SELECT a.${q3.code} AS code_insee_concat, a.${q3.lib} AS lib_com, a.numero_annee, a.nb_logts, a.part_maisons_ind, b.part_rp_prop_occup FROM ${this.schema}.v_habitat_indicateurs_logts_par_com a LEFT JOIN ${this.schema}.v_habitat_indicateurs_rp_par_com b ON a.${q3.code} = b.${q3.code} AND a.numero_annee = b.numero_annee WHERE a.${q3.code} = $1 ORDER BY a.numero_annee ASC`,
        values: [territoire],
      };
      // Query 4: Logements commencés - ÉVOLUTION (toutes les années) - ancienne vue avec annee_historique
      const query4 = {
        text: `SELECT code_geo AS code_insee_concat, lib_geo AS lib_com, annee_historique AS annee, nb_logts_commences_historique AS nb_logts_commences FROM ${this.schema}.v_constr_logts_indicateurs_territoire_annee WHERE code_geo = $1 AND annee_historique IS NOT NULL ORDER BY annee_historique ASC`,
        values: [territoire],
      };
      // Query 5: Ventes occasion par type - Portrait
      const q5 = vPortrait('v_habitat_rep_occasion_nb_logts_vendus_type_par_com')
      const query5 = {
        text: `SELECT ${q5.code} AS code_insee_concat, ${q5.lib} AS lib_com, numero_annee, nb_maison_occasions_vendus, nb_appart_occasions_vendus FROM ${this.schema}.v_habitat_rep_occasion_nb_logts_vendus_type_par_com WHERE ${q5.code} = $1 ORDER BY numero_annee ASC`,
        values: [territoire],
      };
      // Query 6: Indicateurs occasion - Baro
      const q6 = vBaro('v_habitat_indicateurs_occasion_par_com')
      const query6 = {
        text: `SELECT ${q6.code} AS code_insee_concat, ${q6.lib} AS lib_com, numero_annee, nb_logts_vendus, nb_logts_vendus_moy_4ans, NULL::numeric AS part_collectif_logts_vendus_moy_4ans FROM ${this.schema}.v_habitat_indicateurs_occasion_par_com WHERE ${q6.code} = $1 ORDER BY numero_annee ASC`,
        values: [territoire],
      };
      // Query 7: Indicateurs logt commencés - Baro (vue v_constr_logts_indicateurs_territoire_annee_new_yl_dpc, KPI dernier millésime)
      // Inclut les lignes où nb_logts_commences OU nb_logts_commences_moy_4ans est renseigné (certaines communes n'ont que la moyenne 4 ans)
      const query7 = {
        text: `SELECT code_geo AS code_insee_concat, lib_geo AS lib_com, numero_annee, nb_logts_commences, nb_logts_commences_moy_4ans, part_collectif_logts_commences_moy_4ans AS part_collectif_commences_moy_4ans FROM ${this.schema}.v_constr_logts_indicateurs_territoire_annee_new_yl_dpc WHERE code_geo = $1 AND (nb_logts_commences IS NOT NULL OR nb_logts_commences_moy_4ans IS NOT NULL) ORDER BY numero_annee ASC`,
        values: [territoire],
      };
      // Query 8: Indicateurs logts RP - Baro JOIN
      const q8 = vBaro('v_habitat_indicateurs_logts_par_com')
      const query8 = {
        text: `SELECT a.${q8.code} AS code_insee_concat, a.${q8.lib} AS lib_com, a.numero_annee, a.nb_logts, b.nb_rp, b.part_rp_prop_occup AS part_prop_occup, a.part_maisons_ind FROM ${this.schema}.v_habitat_indicateurs_logts_par_com a LEFT JOIN ${this.schema}.v_habitat_indicateurs_rp_par_com b ON a.${q8.code} = b.${q8.code} AND a.numero_annee = b.numero_annee WHERE a.${q8.code} = $1 ORDER BY a.numero_annee ASC`,
        values: [territoire],
      };
      // Query 9: Indicateurs construction et ventes - Baro JOIN constr (vue v_constr_logts_indicateurs_territoire_annee_new_yl_dpc) + occasion
      const q9o = vBaro('v_habitat_indicateurs_occasion_par_com')
      const query9 = {
        text: `SELECT c.code_geo AS code_insee_concat, c.lib_geo AS lib_com, c.numero_annee AS annee_construction, c.nb_logts_commences, c.nb_logts_commences_moy_4ans, c.part_collectif_logts_commences_moy_4ans AS part_collectif_commences_moy_4ans, o.numero_annee AS annee_ventes, o.nb_logts_vendus_moy_4ans FROM ${this.schema}.v_constr_logts_indicateurs_territoire_annee_new_yl_dpc c LEFT JOIN ${this.schema}.v_habitat_indicateurs_occasion_par_com o ON c.code_geo = o.${q9o.code} AND c.numero_annee = o.numero_annee WHERE c.code_geo = $1 AND (c.nb_logts_commences IS NOT NULL OR c.nb_logts_commences_moy_4ans IS NOT NULL) ORDER BY c.numero_annee DESC`,
        values: [territoire],
      };
      // Query 10: Évolution logts commencés - ÉVOLUTION (toutes les années) - ancienne vue avec annee_historique
      const query10 = {
        text: `SELECT code_geo AS code_insee_concat, lib_geo AS lib_com, annee_historique AS numero_annee, nb_logts_commences_historique AS nb_logts_commences FROM ${this.schema}.v_constr_logts_indicateurs_territoire_annee WHERE code_geo = $1 AND annee_historique IS NOT NULL ORDER BY annee_historique ASC`,
        values: [territoire],
      };
      // Query 11: Évolution ventes occasion par type - Portrait
      const q11 = vPortrait('v_habitat_evol_ventes_occasion_type_par_com_yl')
      const query11 = {
        text: `SELECT ${q11.code} AS code_insee_concat, ${q11.lib} AS lib_com, numero_annee, id_type_bien, type_bien, nb_logts_vendus FROM ${this.schema}.v_habitat_evol_ventes_occasion_type_par_com_yl WHERE ${q11.code} = $1 ORDER BY numero_annee ASC`,
        values: [territoire],
      };
      // Query 12: Évolution part collectif dans logements commencés - Portrait
      const q12 = vPortrait('v_habitat_evol_part_logts_commences_collectif_par_com')
      const query12 = {
        text: `SELECT ${q12.code} AS code_insee_concat, ${q12.lib} AS lib_com, annee, part_logts_commences_collectif FROM ${this.schema}.v_habitat_evol_part_logts_commences_collectif_par_com WHERE ${q12.code} = $1 ORDER BY annee ASC`,
        values: [territoire],
      };
      // Query 13: Évolution prix moyen maisons d'occasion - Baro
      const q13 = vBaro('v_habitat_evol_prix_vol_maison_occas_par_com')
      const query13 = {
        text: `SELECT ${q13.code} AS code_insee_concat, ${q13.lib} AS lib_com, annee, prix_moyen_maison FROM ${this.schema}.v_habitat_evol_prix_vol_maison_occas_par_com WHERE ${q13.code} = $1 ORDER BY annee ASC`,
        values: [territoire],
      };
      // Query 14: Évolution prix moyen au m² appartements d'occasion - Baro
      const q14 = vBaro('v_habitat_evol_prix_vol_appart_occas_par_com')
      const query14 = {
        text: `SELECT ${q14.code} AS code_insee_concat, ${q14.lib} AS lib_com, annee, prix_moyen_m2_appart FROM ${this.schema}.v_habitat_evol_prix_vol_appart_occas_par_com WHERE ${q14.code} = $1 ORDER BY annee ASC`,
        values: [territoire],
      };
      
      const [r1, r2, r3, r4, r5, r6, r7, r8, r9, r10, r11, r12, r13, r14] = await Promise.all([
        executeQuery('v_habitat_evol_statut_occupation_logement_par_com', query1),
        executeQuery('v_habitat_evol_nb_rp_par_com_yl', query2),
        executeQuery('v_habitat_indicateurs_logts_rp_par_com', query3),
        executeConstrQuery('v_constr_logts_indicateurs_territoire_annee_q4', query4),
        executeQuery('v_habitat_rep_occasion_nb_logts_vendus_type_par_com', query5),
        executeQuery('v_habitat_indicateurs_occasion_par_com', query6),
        executeConstrQuery('v_constr_logts_indicateurs_territoire_annee_q7', query7),
        executeQuery('v_habitat_indicateurs_logts_rp_par_com', query8),
        executeConstrQuery('v_habitat_indicateurs_constr_occasion_par_com', query9),
        executeConstrQuery('v_constr_logts_indicateurs_territoire_annee_q10', query10),
        executeQuery('v_habitat_evol_ventes_occasion_type_par_com_yl', query11),
        executeQuery('v_habitat_evol_part_logts_commences_collectif_par_com', query12),
        executeQuery('v_habitat_evol_prix_vol_maison_occas_par_com', query13),
        executeQuery('v_habitat_evol_prix_vol_appart_occas_par_com', query14)
      ])

      // Fallback Construction : si indicateurs_logt_commences (r7) est vide car la vue n'a que
      // annee_historique/nb_logts_commences_historique (pas numero_annee/nb_logts_commences),
      // dériver les KPIs à partir des données historiques (r4 = logements_commences).
      let indicateursLogtCommences = r7
      if (r7.length === 0 && r4.length > 0) {
        const sorted = [...r4].sort(
          (a: any, b: any) => (b.annee ?? 0) - (a.annee ?? 0)
        )
        const maxYear = sorted[0]?.annee
        if (maxYear != null) {
          const last4Years = sorted.filter(
            (r: any) => r.annee >= maxYear - 3 && r.annee <= maxYear
          )
          const moy4ans =
            last4Years.length > 0
              ? last4Years.reduce(
                  (s: number, r: any) => s + Number(r.nb_logts_commences || 0),
                  0
                ) / last4Years.length
              : null
          const lastYearRow = sorted[0]
          indicateursLogtCommences = [
            {
              code_insee_concat: lastYearRow.code_insee_concat,
              lib_com: lastYearRow.lib_com,
              numero_annee: maxYear,
              nb_logts_commences: lastYearRow.nb_logts_commences,
              nb_logts_commences_moy_4ans: moy4ans,
              part_collectif_commences_moy_4ans: null
            }
          ]
        }
      }

      // Fallback evol_part_collectif_commences : si la vue Portrait est vide, utiliser l'ancienne vue
      // v_constr_logts_indicateurs_territoire_annee (numero_annee + part_collectif) pour avoir toutes les années
      let evolPartCollectifCommences = r12
      if (r12.length === 0) {
        const query12Fallback = {
          text: `SELECT code_geo AS code_insee_concat, lib_geo AS lib_com, numero_annee AS annee, part_collectif_logts_commences_moy_4ans AS part_logts_commences_collectif FROM ${this.schema}.v_constr_logts_indicateurs_territoire_annee WHERE code_geo = $1 AND numero_annee IS NOT NULL AND part_collectif_logts_commences_moy_4ans IS NOT NULL ORDER BY numero_annee ASC`,
          values: [territoire],
        }
        evolPartCollectifCommences = await executeConstrQuery(
          'v_constr_evol_part_collectif_fallback',
          query12Fallback
        )
      }

      // Fallback Baro : si la vue Portrait evol_ventes_occasion_type n'existe pas, utiliser les vues Baro (maisons + apparts)
      let evolVentesOccasionType = r11
      if (r11.length === 0) {
        const vm = getColsForVue('v_habitat_evol_prix_vol_maison_occas_par_com', 'habitat_baro')
        const va = getColsForVue('v_habitat_evol_prix_vol_appart_occas_par_com', 'habitat_baro')
        const queryMaisons = {
          text: `SELECT ${vm.code} AS code_insee_concat, ${vm.lib} AS lib_com, annee, nb_maisons_vendues FROM ${this.schema}.v_habitat_evol_prix_vol_maison_occas_par_com WHERE ${vm.code} = $1 ORDER BY annee ASC`,
          values: [territoire],
        }
        const queryApparts = {
          text: `SELECT ${va.code} AS code_insee_concat, ${va.lib} AS lib_com, annee, nb_apparts_vendus FROM ${this.schema}.v_habitat_evol_prix_vol_appart_occas_par_com WHERE ${va.code} = $1 ORDER BY annee ASC`,
          values: [territoire],
        }
        const [maisons, apparts] = await Promise.all([
          executeQuery('v_habitat_evol_prix_vol_maison_occas_par_com', queryMaisons),
          executeQuery('v_habitat_evol_prix_vol_appart_occas_par_com', queryApparts),
        ])
        const rows: Record<string, unknown>[] = []
        const addRows = (data: Record<string, unknown>[], typeBien: string, idType: number, valueField: string) => {
          data.forEach((row) => {
            rows.push({
              code_insee_concat: row.code_insee_concat,
              lib_com: row.lib_com,
              numero_annee: row.annee,
              id_type_bien: idType,
              type_bien: typeBien,
              nb_logts_vendus: row[valueField] ?? 0,
            })
          })
        }
        addRows(maisons, 'Maison', 1, 'nb_maisons_vendues')
        addRows(apparts, 'Appartement', 2, 'nb_apparts_vendus')
        evolVentesOccasionType = rows.sort((a, b) => (a.numero_annee as number) - (b.numero_annee as number))
      }

      return {
        statut_occupation: r1,
        evol_rp: r2,
        indicateurs_logements: r3,
        logements_commences: r4,
        ventes_occasion: r5,
        indicateurs_occasion: r6,
        indicateurs_logt_commences: indicateursLogtCommences,
        indicateurs_logts_rp: r8,
        indicateurs_construction_ventes: r9,
        evol_logts_commences: r10,
        evol_ventes_occasion_type: evolVentesOccasionType,
        evol_part_collectif_commences: evolPartCollectifCommences,
        evol_prix_maison_occas: r13,
        evol_prix_m2_appart_occas: r14,
        _queryErrors: queryErrors.length > 0 ? queryErrors : undefined
      };
    });
  }
}

export const habitatRepository = new HabitatRepository()

