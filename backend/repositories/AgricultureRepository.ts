import { databaseService, validatePgSchema } from '../services/database'
import { globalCache } from '../services/cache'
import { logErreurSqlColonnes } from '../utils/logErreurSqlColonnes'
import { getColsForVue } from '../config/vueColumnConventions'

export class AgricultureRepository {
  /** Schéma unique : toutes les vues agriculture */
  schema: string

  constructor() {
    this.schema = validatePgSchema(process.env.PGSCHEMA || '_a_vues_portrait_commune_yl')
  }

  /**
   * Récupère toutes les données Agriculture pour un territoire (commune)
   */
  async getAgricultureData(territoire: string) {
    const cacheKey = `agri_data_${territoire}`
    
    return globalCache.getOrSet(cacheKey, async () => {
      const queryErrors: string[] = []

      const executeQuery = async (queryName: string, query: { text: string; values: string[] }) => {
        try {
          const result = await databaseService.pool.query(query)
          return result.rows
        } catch (error: any) {
          logErreurSqlColonnes('AgricultureRepository', queryName, error)
          queryErrors.push(`${queryName}: ${error.message}`)
          return []
        }
      }

      const v = (vue: string) => getColsForVue(vue, 'agriculture')

      const q1 = v('v_agri_nb_expl_par_com')
      const queryNbExpl = {
        text: `SELECT ${q1.code}, ${q1.lib} AS lib_com, numero_annee, ind_val FROM ${this.schema}.v_agri_nb_expl_par_com WHERE ${q1.code} = $1 ORDER BY numero_annee ASC`,
        values: [territoire],
      };
      
      const q2 = v('v_agri_taux_evol_expl_par_com')
      const queryTauxEvolExpl = {
        text: `SELECT ${q2.code}, ${q2.lib} AS lib_com, annee, ind_val FROM ${this.schema}.v_agri_taux_evol_expl_par_com WHERE ${q2.code} = $1 ORDER BY annee ASC`,
        values: [territoire],
      };
      
      // Taux évolution annuelle moyenne : vue dans schéma _a_vues_obs_agriculture
      const queryTauxEvolAnnMoy = {
        text: `SELECT code_insee_concat, lib_com, annee AS numero_annee, ind_val FROM ${this.schema}.v_agri_taux_evol_ann_moy_nb_exploit_annee_rm_com WHERE code_insee_concat = $1`,
        values: [territoire],
      };
      
      const q4 = v('v_agri_nb_etp_par_com')
      const queryNbEtp = {
        text: `SELECT ${q4.code}, ${q4.lib} AS lib_com, annee, etp FROM ${this.schema}.v_agri_nb_etp_par_com WHERE ${q4.code} = $1 ORDER BY annee ASC`,
        values: [territoire],
      };
      
      const q5 = v('v_agri_exploitation_evol_par_com')
      const queryEvolExpl = {
        text: `SELECT ${q5.code}, ${q5.lib} AS lib_com, annee, ind_val FROM ${this.schema}.v_agri_exploitation_evol_par_com WHERE ${q5.code} = $1 AND indicateur = 'nb_exploitation_annuel' ORDER BY annee ASC`,
        values: [territoire],
      };
      
      const q6 = v('v_agri_sau_par_com')
      const querySau = {
        text: `SELECT ${q6.code}, ${q6.lib} AS lib_com, annee, ind_val, indicateur, NULL::numeric AS surface_ha, NULL::text AS type_culture FROM ${this.schema}.v_agri_sau_par_com WHERE ${q6.code} = $1 ORDER BY annee ASC`,
        values: [territoire],
      };

      // SAU année par année : vue dédiée (indicateur = sau_annuel, une ligne par année)
      const qSauEvol = v('v_agri_sau_evol_par_com')
      const querySauEvol = {
        text: `SELECT ${qSauEvol.code}, ${qSauEvol.lib} AS lib_com, annee, ind_val FROM ${this.schema}.v_agri_sau_evol_par_com WHERE ${qSauEvol.code} = $1 AND indicateur = 'sau_annuel' ORDER BY annee ASC`,
        values: [territoire],
      };
      
      const q7 = v('v_agriculture_indicateurs_production_par_com')
      const queryProduction = {
        text: `SELECT * FROM ${this.schema}.v_agriculture_indicateurs_production_par_com WHERE ${q7.code} = $1`,
        values: [territoire],
      };

      // Exploitations bio : vue dans schéma _a_vues_obs_agriculture
      const queryEvolExplBio = {
        text: `SELECT code_insee_concat, lib_com, numero_annee, nb_exploitation_bio FROM ${this.schema}.v_agri_evol_nb_exploitation_bio_annee_rm_com WHERE code_insee_concat = $1 ORDER BY numero_annee ASC`,
        values: [territoire],
      };
      
      const [r1, r2, r3, r4, r5, r6, r6b, r7, r8] = await Promise.all([
        executeQuery('nb_exploitations', queryNbExpl),
        executeQuery('taux_evol_exploitations', queryTauxEvolExpl),
        executeQuery('taux_evol_ann_moy', queryTauxEvolAnnMoy),
        executeQuery('nb_etp', queryNbEtp),
        executeQuery('evol_exploitations', queryEvolExpl),
        executeQuery('sau', querySau),
        executeQuery('sau_evol', querySauEvol),
        executeQuery('production', queryProduction),
        executeQuery('evol_exploitations_bio', queryEvolExplBio)
      ]);

      return {
        nb_exploitations: r1,
        taux_evol_exploitations: r2,
        taux_evol_ann_moy: r3,
        nb_etp: r4,
        evol_exploitations: r5,
        sau: r6,
        sau_evol: r6b,
        production: r7,
        evol_exploitations_bio: r8,
        _queryErrors: queryErrors.length > 0 ? queryErrors : undefined
      };
    });
  }
}

export const agricultureRepository = new AgricultureRepository()
