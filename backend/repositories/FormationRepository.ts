import { databaseService, validatePgSchema } from '../services/database'
import { globalCache } from '../services/cache'
import { logErreurSqlColonnes } from '../utils/logErreurSqlColonnes'
import { logger } from '../services/logger'

export class FormationRepository {
  schema: string

  constructor() {
    this.schema = validatePgSchema(process.env.PGSCHEMA || '_a_vues_portrait_commune_yl')
  }

  /**
   * Récupère toutes les données Formation pour un territoire
   */
  async getFormationData(territoire: string) {
    const cacheKey = `formation_data_${territoire}`

    return globalCache.getOrSet(cacheKey, async () => {
      const queryErrors: string[] = []

      const executeQuery = async (queryName: string, query: { text: string; values: string[] }) => {
        try {
          const result = await databaseService.pool.query(query)
          return result.rows
        } catch (error: any) {
          logErreurSqlColonnes('FormationRepository', queryName, error)
          queryErrors.push(`${queryName}: ${error.message}`)
          return []
        }
      }

      // Filtre : code_insee_concat (integer ou text selon la vue)
      const whereClause = 'code_insee_concat = $1'

      // v_formation_evol_primaire_eleves_classes_2024 : données par commune
      const query1 = {
        text: `SELECT code_insee_concat, lib_com, numero_annee, nb_eleves_pre_elementaire, nb_eleves_elementaire, nb_classes_pre_elementaire, nb_classes_elementaire FROM ${this.schema}.v_formation_evol_primaire_eleves_classes_2024 WHERE ${whereClause} ORDER BY numero_annee ASC`,
        values: [territoire],
      };
      const query2 = {
        text: `SELECT code_insee_concat, lib_com, numero_annee, nb_eleves_college, nb_eleves_lycee FROM ${this.schema}.v_formation_evol_secondaire_eleves_2024 WHERE ${whereClause} ORDER BY numero_annee ASC`,
        values: [territoire],
      };
      const query3 = {
        text: `SELECT code_insee_concat, lib_com, numero_annee, borne_temp, nb_eleves, nb_classes, evol_eleves_4ans FROM ${this.schema}.v_formation_indicateurs_primaire_par_com_2024 WHERE ${whereClause} ORDER BY numero_annee ASC`,
        values: [territoire],
      };
      const query4 = {
        text: `SELECT code_insee_concat, lib_com, numero_annee, nb_eleves_second FROM ${this.schema}.v_formation_indicateurs_secondaire_par_com_2024 WHERE ${whereClause} ORDER BY numero_annee ASC`,
        values: [territoire],
      };
      const query5 = {
        text: `SELECT code_insee_concat, lib_com, numero_annee, nb_classes, ouv_classes, ferm_classes FROM ${this.schema}.v_formation_rm_evol_primaire_ouv_ferm_classes_par_com_2024 WHERE ${whereClause} ORDER BY numero_annee ASC`,
        values: [territoire],
      };

      const [r1, r2, r3, r4, r5] = await Promise.all([
        executeQuery('v_formation_evol_primaire_eleves_classes_2024', query1),
        executeQuery('v_formation_evol_secondaire_eleves_2024', query2),
        executeQuery('v_formation_indicateurs_primaire_par_com_2024', query3),
        executeQuery('v_formation_indicateurs_secondaire_par_com_2024', query4),
        executeQuery('v_formation_rm_evol_primaire_ouv_ferm_classes_par_com_2024', query5)
      ])

      // Diagnostic : log si toutes les requêtes retournent vide
      const total = r1.length + r2.length + r3.length + r4.length + r5.length
      if (total === 0) {
        logger.info(`Formation [${territoire}] : 0 lignes sur toutes les vues. Vérifier le code INSEE et le schéma ${this.schema}.`)
      }

      return {
        evol_premier_degre: r1,
        evol_second_degre: r2,
        indicateurs_primaire: r3,
        indicateurs_secondaire: r4,
        evol_ouv_ferm_classes: r5,
        _queryErrors: queryErrors.length > 0 ? queryErrors : undefined
      };
    });
  }
}

export const formationRepository = new FormationRepository()
