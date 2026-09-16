/**
 * Configuration centralisée des colonnes par vue PostgreSQL.
 *
 * Les vues Baro/Portrait n'utilisent pas les mêmes noms de colonnes :
 * - Convention Portrait : code_insee_concat, lib_com
 * - Convention Baro : code_geo, lib_geo
 *
 * Pour adapter à une nouvelle vue : ajouter une entrée dans VUE_COLUMNS.
 * Une seule source de vérité, plus besoin de modifier les repositories.
 */

export type CodeCol = 'code_insee_concat' | 'code_geo'
export type LibCol = 'lib_com' | 'lib_geo' | 'lib_commune'

export interface VueColumns {
  code: CodeCol
  lib: LibCol
}

/** Convention par défaut si la vue n'est pas listée */
const DEFAULTS: Record<string, VueColumns> = {
  demographie: { code: 'code_insee_concat', lib: 'lib_com' },
  habitat_baro: { code: 'code_geo', lib: 'lib_geo' },
  habitat_portrait: { code: 'code_insee_concat', lib: 'lib_com' },
  solidarite_baro: { code: 'code_insee_concat', lib: 'lib_com' },
  agriculture: { code: 'code_insee_concat', lib: 'lib_geo' },
}

/**
 * Mapping explicite par vue. Surcharge le défaut du thème.
 * Clé = nom de la vue (sans schéma)
 */
export const VUE_COLUMNS: Record<string, VueColumns> = {
  // === Démographie (schéma Baro) - certaines vues utilisent lib_geo ===
  v_demo_pop_evol_par_com: { code: 'code_insee_concat', lib: 'lib_geo' },
  v_demo_naissances_deces_par_com: { code: 'code_insee_concat', lib: 'lib_com' },
  v_demo_solde_nat_solde_mig_app_par_com: { code: 'code_insee_concat', lib: 'lib_com' },
  v_demo_rm_pyram_ages_par_com: { code: 'code_insee_concat', lib: 'lib_com' },
  v_demo_indicateurs_jeunesse_evol_par_com: { code: 'code_insee_concat', lib: 'lib_com' },
  v_demo_indicateurs_age_pop_par_com: { code: 'code_insee_concat', lib: 'lib_com' },
  v_demo_rep_menages_type_par_com: { code: 'code_insee_concat', lib: 'lib_com' },
  /** Répartition ménages (Portrait YL) : lib_com + lib_type_men */
  v_demo_rep_menages_type_par_com_yl: { code: 'code_insee_concat', lib: 'lib_com' },
  v_demo_evol_taille_moy_menages_par_com: { code: 'code_insee_concat', lib: 'lib_com' },
  v_demo_indicateurs_menages_par_com: { code: 'code_insee_concat', lib: 'lib_com' },
  v_demo_pop_ta6_par_com: { code: 'code_insee_concat', lib: 'lib_com' },
  /** Évolution <20 / 60+ par périodes intercensitaires (graphique dédié) */
  v_demo_pop_evo_ages_multi_periodes_par_com: { code: 'code_insee_concat', lib: 'lib_com' },
  v_demo_indicateurs_pop_active_1564_par_com: { code: 'code_insee_concat', lib: 'lib_geo' },
  v_demo_rep_pop_active_type_act_par_com: { code: 'code_insee_concat', lib: 'lib_com' },
  v_demo_indicateurs_pop_par_com: { code: 'code_insee_concat', lib: 'lib_commune' },
  v_demo_evolution_age_par_com_yl: { code: 'code_insee_concat', lib: 'lib_com' },

  // === Habitat Baro - certaines vues utilisent code_insee_concat ===
  v_habitat_evol_statut_occupation_logement_par_com: { code: 'code_geo', lib: 'lib_geo' },
  v_habitat_indicateurs_logts_par_com: { code: 'code_insee_concat', lib: 'lib_com' },
  v_habitat_indicateurs_rp_par_com: { code: 'code_insee_concat', lib: 'lib_com' },
  v_habitat_evol_nb_logts_commences_par_com: { code: 'code_insee_concat', lib: 'lib_com' },
  v_habitat_indicateurs_occasion_par_com: { code: 'code_geo', lib: 'lib_geo' },
  v_habitat_indicateurs_constr_par_com: { code: 'code_geo', lib: 'lib_geo' },
  v_constr_logts_indicateurs_territoire_annee_new_yl_dpc: { code: 'code_geo', lib: 'lib_geo' },
  v_constr_logts_indicateurs_territoire_annee: { code: 'code_geo', lib: 'lib_geo' },

  // === Habitat Portrait ===
  v_habitat_evol_nb_rp_par_com_yl: { code: 'code_insee_concat', lib: 'lib_com' },
  v_habitat_rep_occasion_nb_logts_vendus_type_par_com: { code: 'code_insee_concat', lib: 'lib_com' },
  v_habitat_evol_ventes_occasion_type_par_com_yl: { code: 'code_insee_concat', lib: 'lib_com' },
  v_habitat_evol_part_logts_commences_collectif_par_com: { code: 'code_insee_concat', lib: 'lib_com' },
  v_habitat_evol_prix_vol_maison_occas_par_com: { code: 'code_geo', lib: 'lib_geo' },
  v_habitat_evol_prix_vol_appart_occas_par_com: { code: 'code_geo', lib: 'lib_geo' },

  // === Solidarité Baro (v_social_*) – convention Baro code_geo/lib_geo ===
  v_social_indicateurs_filosofi_par_com: { code: 'code_insee_concat', lib: 'lib_com' },
  v_social_indicateurs_filosofi_pivot_par_com: { code: 'code_insee_concat', lib: 'lib_com' },
  v_social_dependants_presta50_100_par_com: { code: 'code_insee_concat', lib: 'lib_com' },

  // === Agriculture - mix lib_geo/lib_com selon la vue (Baro hétérogène) ===
  v_agri_nb_expl_par_com: { code: 'code_insee_concat', lib: 'lib_geo' },
  v_agri_taux_evol_expl_par_com: { code: 'code_insee_concat', lib: 'lib_geo' },
  v_agri_taux_evol_ann_moy_nb_exploit_annee_par_com: { code: 'code_insee_concat', lib: 'lib_geo' },
  v_agri_nb_etp_par_com: { code: 'code_insee_concat', lib: 'lib_com' },
  v_agri_exploitation_evol_par_com: { code: 'code_insee_concat', lib: 'lib_commune' },
  v_agri_sau_par_com: { code: 'code_insee_concat', lib: 'lib_com' },
  v_agri_sau_evol_par_com: { code: 'code_insee_concat', lib: 'lib_commune' },
  v_agriculture_indicateurs_production_par_com: { code: 'code_insee_concat', lib: 'lib_geo' },
}

/**
 * Retourne les colonnes à utiliser pour une vue.
 * @param vueName - Nom de la vue (ex: v_demo_pop_evol_par_com)
 * @param themeDefault - Défaut du thème si vue non listée (ex: 'demographie')
 */
export function getColsForVue(vueName: string, themeDefault: keyof typeof DEFAULTS = 'demographie'): VueColumns {
  return VUE_COLUMNS[vueName] ?? DEFAULTS[themeDefault] ?? DEFAULTS.demographie
}
