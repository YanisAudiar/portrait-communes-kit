import { databaseService, validatePgSchema } from '../services/database'
import { globalCache } from '../services/cache'
import { logErreurSqlColonnes } from '../utils/logErreurSqlColonnes'
import { getColsForVue } from '../config/vueColumnConventions'

/** Valeurs reconnues pour Hommes (barres à gauche, pop négatif) */
const SEXE_HOMMES = ['h', 'hommes', 'homme', '1', 'm', 'male']
/** Valeurs reconnues pour Femmes (barres à droite, pop positif) */
const SEXE_FEMMES = ['f', 'femmes', 'femme', '2', 'female']

/**
 * Pivote les lignes brutes pyramide (lib_sexe + pop) en format { lib_ta21, numero_annee, pop_h, pop_f }
 * Gère les variations de noms de colonnes (lib_sexe/sexe, pop/population/nb)
 */
function pivotPyramideRows(rows: Record<string, unknown>[]): Record<string, unknown>[] {
  if (!rows?.length) return []
  const first = rows[0] as Record<string, unknown>
  const sexeCol = 'lib_sexe' in first ? 'lib_sexe' : 'sexe' in first ? 'sexe' : 'id_sexe'
  const popCol = 'pop' in first ? 'pop' : 'population' in first ? 'population' : 'nb'
  const labelCol = 'lib_ta21' in first ? 'lib_ta21' : 'lib_tranche_age' in first ? 'lib_tranche_age' : 'tranche_age'
  const yearCol = 'numero_annee' in first ? 'numero_annee' : 'annee' in first ? 'annee' : 'year'

  const map = new Map<string, { pop_h: number; pop_f: number }>()
  for (const row of rows) {
    const sexe = String(row[sexeCol] ?? '').trim().toLowerCase()
    const pop = Number(row[popCol]) || 0
    const key = `${row[yearCol]}|${row[labelCol]}`
    if (!map.has(key)) map.set(key, { pop_h: 0, pop_f: 0 })
    const entry = map.get(key)!
    if (SEXE_HOMMES.some(v => sexe === v || sexe.startsWith(v))) {
      entry.pop_h = pop < 0 ? pop : -Math.abs(pop)
    } else if (SEXE_FEMMES.some(v => sexe === v || sexe.startsWith(v))) {
      entry.pop_f = pop > 0 ? pop : Math.abs(pop)
    }
  }

  return Array.from(map.entries())
    .map(([k, v]) => {
      const [numero_annee, lib_ta21] = k.split('|')
      return { lib_ta21, numero_annee, pop_h: v.pop_h, pop_f: v.pop_f }
    })
    .sort((a, b) => {
      const yA = Number(a.numero_annee) || 0
      const yB = Number(b.numero_annee) || 0
      if (yA !== yB) return yA - yB
      return String(a.lib_ta21).localeCompare(String(b.lib_ta21))
    })
}

/**
 * Parse les bornes d'âge depuis un libellé de tranche (ex. "15 à 19 ans", "60 à 74 ans", "75 ans et plus").
 * Utilisé pour agréger v_demo_pop_ta6_par_com en pop_moins_20ans / pop_plus_60ans.
 */
function parseTa6AgeBounds(lib: string): { min: number; max: number } | null {
  if (!lib || typeof lib !== 'string') return null
  const s = lib
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()

  const range = s.match(/(\d+)\s*(?:à|a|-|–|—)\s*(\d+)/)
  if (range) {
    const a = parseInt(range[1], 10)
    const b = parseInt(range[2], 10)
    return { min: Math.min(a, b), max: Math.max(a, b) }
  }
  const moins = s.match(/moins\s+de\s+(\d+)/)
  if (moins) {
    const n = parseInt(moins[1], 10)
    return { min: 0, max: Math.max(0, n - 1) }
  }
  const etPlus = s.match(/(\d+)\s+ans?\s+et\s+plus/)
  if (etPlus) {
    const n = parseInt(etPlus[1], 10)
    return { min: n, max: 120 }
  }
  return null
}

/**
 * Agrège les lignes v_demo_pop_ta6_par_com par année : effectifs < 20 ans et >= 60 ans.
 */
function aggregateEvolutionAgeFromTa6(
  rows: Record<string, unknown>[]
): {
  numero_annee: number
  periode_intercensitaire: string
  pop_moins_20ans: number
  pop_plus_60ans: number
}[] {
  if (!rows?.length) return []
  const first = rows[0]
  const yearKey = 'numero_annee' in first ? 'numero_annee' : 'annee' in first ? 'annee' : null
  const popKey = 'pop' in first ? 'pop' : 'nb' in first ? 'nb' : 'population' in first ? 'population' : null
  const libKey =
    'lib_ta6' in first ? 'lib_ta6' : 'lib_tranche_age' in first ? 'lib_tranche_age' : 'lib_tranche' in first ? 'lib_tranche' : null
  if (!yearKey || !popKey || !libKey) return []

  const byYear = new Map<number, { m20: number; p60: number }>()
  for (const row of rows) {
    const y = parseInt(String(row[yearKey]), 10)
    if (Number.isNaN(y)) continue
    const pop = Math.abs(Number(row[popKey]) || 0)
    const bounds = parseTa6AgeBounds(String(row[libKey] ?? ''))
    if (!bounds) continue
    if (!byYear.has(y)) byYear.set(y, { m20: 0, p60: 0 })
    const b = byYear.get(y)!
    // Tranche entièrement < 20 ans
    if (bounds.max <= 19) b.m20 += pop
    // Tranche entièrement >= 60 ans
    if (bounds.min >= 60) b.p60 += pop
  }

  return Array.from(byYear.entries())
    .sort(([a], [b]) => a - b)
    .map(([numero_annee, v]) => ({
      numero_annee,
      periode_intercensitaire: String(numero_annee),
      pop_moins_20ans: v.m20,
      pop_plus_60ans: v.p60
    }))
}

/** Normalise un libellé (accents, casse) pour comparer groupe_age */
function normGroupeAgeLabel(s: string): string {
  return String(s ?? '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

/** Détecte la ligne « Moins de 20 ans » (libellés Baro / Insee variables) */
function isGroupeMoins20Ans(groupeAge: string): boolean {
  const n = normGroupeAgeLabel(groupeAge)
  if (!n) return false
  // Exclure les libellés « 60 … » pour éviter les faux positifs
  if (/\b60\b/.test(n) && (n.includes('plus') || n.includes('et plus'))) return false
  return n.includes('moins') && (/\b20\b/.test(n) || n.includes('vingt'))
}

/** Détecte la ligne « 60 ans et plus » (ou équivalent) */
function isGroupe60AnsEtPlus(groupeAge: string): boolean {
  const n = normGroupeAgeLabel(groupeAge)
  if (!n) return false
  return (
    (/\b60\b/.test(n) && (n.includes('plus') || n.includes('et plus'))) ||
    n.includes('plus de 60') ||
    n.includes('60 et +')
  )
}

/** Libellé axe X type « 2006-2011 » (vue periode_intercensitaire souvent « 2006 - 2011 ») */
function normalizeIntercensalPeriodLabel(row: Record<string, unknown>): string {
  const raw = String(row.periode_intercensitaire ?? '').trim()
  let s = raw.replace(/\s*-\s*/g, '-').replace(/\s+/g, '')
  if (s) return s
  const ad = parseInt(String(row.annee_debut), 10)
  const af = parseInt(String(row.annee_fin), 10)
  if (!Number.isNaN(ad) && !Number.isNaN(af)) return `${ad}-${af}`
  if (!Number.isNaN(af)) return String(af)
  return ''
}

/**
 * Pivote v_demo_pop_evo_ages_multi_periodes_par_com : une ligne par fin de période (annee_fin)
 * avec effectifs en fin de période (pop_fin_periode) + libellé intercensitaire pour l’axe X des barres.
 *
 * Contrat données : `pop_fin_periode` doit être un **effectif** (nombre de personnes), pas un taux ou un %.
 * Si l’axe front affichait des « % » avec des valeurs > 100, vérifier la vue SQL avant ce mapping.
 */
function aggregateEvolutionAgeFromMultiPeriodes(
  rows: Record<string, unknown>[]
): {
  periode_intercensitaire: string
  numero_annee: number
  pop_moins_20ans: number
  pop_plus_60ans: number
}[] {
  if (!rows?.length) return []

  const byEndYear = new Map<
    number,
    { label: string; m20: number; p60: number; hasM20: boolean; hasP60: boolean }
  >()

  for (const row of rows) {
    const yfRaw = row.annee_fin
    const yf = parseInt(String(yfRaw), 10)
    if (Number.isNaN(yf)) continue

    const popFin = Number(row.pop_fin_periode)
    const pop = Number.isFinite(popFin) ? popFin : 0
    const g = String(row.groupe_age ?? '')
    const label = normalizeIntercensalPeriodLabel(row as Record<string, unknown>)

    if (!byEndYear.has(yf)) {
      byEndYear.set(yf, { label, m20: 0, p60: 0, hasM20: false, hasP60: false })
    }
    const cell = byEndYear.get(yf)!
    if (!cell.label && label) cell.label = label

    if (isGroupeMoins20Ans(g)) {
      cell.m20 = pop
      cell.hasM20 = true
    }
    if (isGroupe60AnsEtPlus(g)) {
      cell.p60 = pop
      cell.hasP60 = true
    }
  }

  return Array.from(byEndYear.entries())
    .filter(([, v]) => v.hasM20 || v.hasP60)
    .sort(([a], [b]) => a - b)
    .map(([numero_annee, v]) => ({
      periode_intercensitaire: v.label || String(numero_annee),
      numero_annee,
      pop_moins_20ans: v.hasM20 ? v.m20 : 0,
      pop_plus_60ans: v.hasP60 ? v.p60 : 0
    }))
}

export class DemographieRepository {
  schema: string

  constructor() {
    this.schema = validatePgSchema(process.env.PGSCHEMA || '_a_vues_portrait_commune_yl')
  }

  /**
   * Récupère toutes les données Démographie pour un territoire
   */
  async getDemographieData(territoire: string) {
    const cacheKey = `demo_data_${territoire}`
    
    return globalCache.getOrSet(cacheKey, async () => {
      const queryErrors: string[] = []

      const executeQuery = async (queryName: string, query: { text: string; values: string[] }) => {
        try {
          const result = await databaseService.pool.query(query)
          return result.rows
        } catch (error: any) {
          logErreurSqlColonnes('DemographieRepository', queryName, error)
          queryErrors.push(`${queryName}: ${error.message}`)
          return []
        }
      }

      const v = (vue: string) => getColsForVue(vue, 'demographie')

      // v_demo_pop_evol_par_com : graphiques évolution (pop par année, tx_evol)
      const q1 = v('v_demo_pop_evol_par_com')
      const query1 = {
        text: `SELECT ${q1.code} AS code_com, ${q1.lib} AS lib_com, annee, borne_temp, pop, tx_evol_annuel AS tx_evol FROM ${this.schema}.v_demo_pop_evol_par_com WHERE ${q1.code} = $1 ORDER BY annee ASC`,
        values: [territoire],
      };
      // v_demo_indicateurs_pop_par_com : 3 chiffres clés (nb_hab, tx_evol_an, gain_annuel_hab) - format pivot
      const q1b = v('v_demo_indicateurs_pop_par_com')
      const query1b = {
        text: `SELECT ${q1b.code}, indicateur, annee, ind_val FROM ${this.schema}.v_demo_indicateurs_pop_par_com WHERE ${q1b.code} = $1 AND indicateur IN ('nb_hab', 'tx_evol_an', 'gain_annuel_hab')`,
        values: [territoire],
      };
      // v_demo_naissances_deces_par_com
      const q2 = v('v_demo_naissances_deces_par_com')
      const query2 = {
        text: `SELECT ${q2.code}, ${q2.lib} AS lib_com, annee, nb_deces, nb_naissances FROM ${this.schema}.v_demo_naissances_deces_par_com WHERE ${q2.code} = $1 ORDER BY annee ASC`,
        values: [territoire],
      };
      // v_demo_solde_nat_solde_mig_app_par_com (pas de lib)
      const q3 = v('v_demo_solde_nat_solde_mig_app_par_com')
      const query3 = {
        text: `SELECT ${q3.code}, borne_temporelle, solde_naturel, solde_migratoire_apparent FROM ${this.schema}.v_demo_solde_nat_solde_mig_app_par_com WHERE ${q3.code} = $1`,
        values: [territoire],
      };
      // Pyramide des âges : v_demo_rm_pyram_ages_par_com (schéma Baroterritoire)
      // SELECT * comme l'ancien DemographieHandler, puis pivot en TypeScript pour pop_h/pop_f
      const q4 = v('v_demo_rm_pyram_ages_par_com')
      const query4 = {
        text: `SELECT * FROM ${this.schema}.v_demo_rm_pyram_ages_par_com WHERE ${q4.code} = $1 ORDER BY numero_annee, lib_ta21`,
        values: [territoire],
      };
      // v_demo_indicateurs_jeunesse_evol_par_com
      const q5 = v('v_demo_indicateurs_jeunesse_evol_par_com')
      const query5 = {
        text: `SELECT ${q5.code}, ${q5.lib} AS lib_com, annee, indice_jeunesse FROM ${this.schema}.v_demo_indicateurs_jeunesse_evol_par_com WHERE ${q5.code} = $1 ORDER BY annee ASC`,
        values: [territoire],
      };
      // v_demo_evolution_age_par_com_yl : indicateurs_age (parts, ind_jeunesse) + evolution_age (effectifs)
      const q6 = v('v_demo_evolution_age_par_com_yl')
      const query6 = {
        text: `SELECT ${q6.code}, numero_annee, pop_part_m20ans, pop_part_p60ans, ind_jeunesse, pop_moins_20ans, pop_plus_60ans FROM ${this.schema}.v_demo_evolution_age_par_com_yl WHERE ${q6.code} = $1 ORDER BY numero_annee ASC`,
        values: [territoire],
      };
      // Répartition ménages par type : vue YL (millésime à jour, lib_com + lib_type_men)
      const q7 = v('v_demo_rep_menages_type_par_com_yl')
      const query7 = {
        text: `SELECT ${q7.code}, ${q7.lib} AS lib_com, numero_annee, lib_type_men, nb_men FROM ${this.schema}.v_demo_rep_menages_type_par_com_yl WHERE ${q7.code} = $1`,
        values: [territoire],
      };
      // v_demo_evol_taille_moy_menages_par_com
      const q8 = v('v_demo_evol_taille_moy_menages_par_com')
      const query8 = {
        text: `SELECT ${q8.code}, ${q8.lib} AS lib_com, numero_annee, taille_moy_men FROM ${this.schema}.v_demo_evol_taille_moy_menages_par_com WHERE ${q8.code} = $1 ORDER BY numero_annee ASC`,
        values: [territoire],
      };
      // v_demo_indicateurs_menages_par_com
      const q9 = v('v_demo_indicateurs_menages_par_com')
      const query9 = {
        text: `SELECT ${q9.code}, ${q9.lib} AS lib_com, numero_annee, nb_men, part_personnes_seules_men, taille_moy_men FROM ${this.schema}.v_demo_indicateurs_menages_par_com WHERE ${q9.code} = $1 ORDER BY numero_annee ASC`,
        values: [territoire],
      };
      // evolution_age : dérivé de v_demo_evolution_age_par_com_yl (même vue que indicateurs_age)
      // v_demo_indicateurs_pop_active_1564_par_com (vue sans colonne lib – utiliser NULL)
      const q11 = v('v_demo_indicateurs_pop_active_1564_par_com')
      const query11 = {
        text: `SELECT ${q11.code}, NULL::text AS lib_com, numero_annee, pop_active AS pop_actifs_15_64, NULL::numeric AS pop_total_15_64, part_pop_active_sur_1564 * 100 AS taux_activite_15_64 FROM ${this.schema}.v_demo_indicateurs_pop_active_1564_par_com WHERE ${q11.code} = $1 ORDER BY numero_annee ASC`,
        values: [territoire],
      };
      // v_demo_rep_pop_active_type_act_par_com
      const q12 = v('v_demo_rep_pop_active_type_act_par_com')
      const query12 = {
        text: `SELECT ${q12.code}, ${q12.lib} AS lib_com, numero_annee, type_act AS id_type_act, type_act, pop15p FROM ${this.schema}.v_demo_rep_pop_active_type_act_par_com WHERE ${q12.code} = $1 ORDER BY numero_annee ASC`,
        values: [territoire],
      };
      // v_demo_pop_evo_ages_multi_periodes_par_com : périodes intercensitaires (graphique évolution <20 / 60+)
      const qEvoMulti = v('v_demo_pop_evo_ages_multi_periodes_par_com')
      const queryEvoMulti = {
        text: `SELECT ${qEvoMulti.code}, ${qEvoMulti.lib} AS lib_com, groupe_age, periode_intercensitaire, annee_debut, annee_fin, pop_debut_periode, pop_fin_periode, evolution_absolue FROM ${this.schema}.v_demo_pop_evo_ages_multi_periodes_par_com WHERE ${qEvoMulti.code} = $1 ORDER BY annee_fin ASC, groupe_age ASC`,
        values: [territoire],
      }
      // v_demo_pop_ta6_par_com : repli si la vue multi-périodes indisponible ou insuffisante
      const qTa6 = v('v_demo_pop_ta6_par_com')
      const queryTa6 = {
        text: `SELECT * FROM ${this.schema}.v_demo_pop_ta6_par_com WHERE ${qTa6.code} = $1`,
        values: [territoire],
      };

      const [r1Raw, r1b, r2, r3, r4Raw, r5, r6, r7, r8, r9, r11, r12, rEvoMulti, rTa6] = await Promise.all([
        executeQuery('v_demo_pop_evol_par_com', query1),
        executeQuery('v_demo_indicateurs_pop_par_com', query1b),
        executeQuery('v_demo_naissances_deces_par_com', query2),
        executeQuery('v_demo_solde_nat_solde_mig_app_par_com', query3),
        executeQuery('v_demo_rm_pyram_ages_par_com', query4),
        executeQuery('v_demo_indicateurs_jeunesse_evol_par_com', query5),
        executeQuery('v_demo_evolution_age_par_com_yl', query6),
        executeQuery('v_demo_rep_menages_type_par_com_yl', query7),
        executeQuery('v_demo_evol_taille_moy_menages_par_com', query8),
        executeQuery('v_demo_indicateurs_menages_par_com', query9),
        executeQuery('v_demo_indicateurs_pop_active_1564_par_com', query11),
        executeQuery('v_demo_rep_pop_active_type_act_par_com', query12),
        executeQuery('v_demo_pop_evo_ages_multi_periodes_par_com', queryEvoMulti),
        executeQuery('v_demo_pop_ta6_par_com', queryTa6),
      ])

      // indicateurs_pop : données pivot (nb_hab, tx_evol_an, gain_annuel_hab) pour les 3 KPIs
      const indicateursPop = r1b as { indicateur: string; annee: string | number; ind_val: number }[]

      // indicateurs_age : r6 a pop_part_m20ans, pop_part_p60ans, ind_jeunesse
      // evolution_age : 1) vue multi-périodes intercensitaires, 2) repli ta6, 3) v_demo_evolution_age_par_com_yl
      const evolutionFromMulti = aggregateEvolutionAgeFromMultiPeriodes(rEvoMulti as Record<string, unknown>[])
      const evolutionFromTa6 = aggregateEvolutionAgeFromTa6(rTa6 as Record<string, unknown>[])
      const ta6YearCount = new Set(evolutionFromTa6.map((r) => r.numero_annee)).size
      const evolutionAgeFallback = (
        r6 as { numero_annee: number; pop_moins_20ans: number; pop_plus_60ans: number }[]
      ).map((row) => ({
        numero_annee: row.numero_annee,
        periode_intercensitaire: String(row.numero_annee),
        pop_moins_20ans: row.pop_moins_20ans,
        pop_plus_60ans: row.pop_plus_60ans,
      }))

      // Source dédiée : dès que la vue multi-périodes renvoie des lignes exploitables, on l’utilise (repli ta6 puis YL)
      let evolutionAge = evolutionAgeFallback
      if (evolutionFromMulti.length > 0) {
        evolutionAge = evolutionFromMulti
      } else if (ta6YearCount >= 2 && evolutionFromTa6.length > 0) {
        evolutionAge = evolutionFromTa6
      }

      // Pyramide : pivot si format brut (lib_sexe+pop), sinon utiliser tel quel (pop_h, pop_f)
      const r4 =
        r4Raw.length > 0 && 'pop_h' in (r4Raw[0] as object)
          ? (r4Raw as Record<string, unknown>[])
          : pivotPyramideRows(r4Raw as Record<string, unknown>[])

      return {
        evolution_population: r1Raw,
        indicateurs_pop: indicateursPop,
        naissances_deces: r2,
        solde_naturel_migratoire: r3,
        pyramide_ages: r4,
        indice_jeunesse: r5,
        indicateurs_age: r6,
        repartition_menages: r7,
        taille_menages: r8,
        indicateurs_menages: r9,
        evolution_age: evolutionAge,
        pop_active_15_64: r11,
        pop_active_type_act: r12,
        _queryErrors: queryErrors.length > 0 ? queryErrors : undefined
      };
    });
  }
}

export const demographieRepository = new DemographieRepository()

