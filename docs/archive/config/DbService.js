import pool from '../db/connect.js';

/**
 * Fetches employment data for a given territory.
 * @param {string} territoire - The territory code (code_insee_concat).
 * @returns {Promise<Array<Array<Object>>>} A promise that resolves to an array containing the results of the four queries.
 */
export async function fetchEmploiData(territoire) {
  // IMPORTANT: Using parameterized queries to prevent SQL injection.
  const query1 = {
    text: "SELECT code_insee_concat, lib_com, numero_annee, lib_csp, nb_emplois FROM _a_vues_portrait_commune.v_emploi_nb_emplois_csp_par_com WHERE code_insee_concat = $1",
    values: [territoire],
  };
  const query2 = {
    text: "SELECT code_insee_concat, lib_com, numero_annee, lib_sect_act, nb_emplois FROM _a_vues_portrait_commune.v_emploi_nb_emplois_sect_act_par_com WHERE code_insee_concat = $1",
    values: [territoire],
  };
  const query3 = {
    text: "SELECT code_insee_concat, lib_com, numero_annee, borne_temp, nb_emplois, evol_emplois FROM _a_vues_portrait_commune.v_emploi_indicateurs_emplois_par_com WHERE code_insee_concat = $1",
    values: [territoire],
  };
  const query4 = {
    text: "SELECT code_insee_concat, lib_com, numero_annee, lib_loc_emploi, nb_actifs_occup FROM _a_vues_portrait_commune.v_emploi_actifs_occup_loc_emploi_par_com WHERE code_insee_concat = $1",
    values: [territoire],
  };

  try {
    // Execute all queries in parallel
    const [result1, result2, result3, result4] = await Promise.all([
      pool.query(query1),
      pool.query(query2),
      pool.query(query3),
      pool.query(query4),
    ]);

    // Return the rows from each query
    return [result1.rows, result2.rows, result3.rows, result4.rows];
  } catch (error) {
    console.error('Error fetching employment data:', error);
    throw error;
  }
}

/**
 * Fetches training data for a given territory.
 * @param {string} territoire - The territory code (code_insee_concat).
 * @returns {Promise<Array<Array<Object>>>} A promise that resolves to an array containing the results of the four queries.
 */
export async function fetchFormationData(territoire) {
  const query1 = {
    text: "SELECT code_insee_concat, lib_com, numero_annee, nb_eleves_pre_elementaire, nb_eleves_elementaire, nb_classes_pre_elementaire, nb_classes_elementaire FROM _a_vues_portrait_commune.v_formation_evol_primaire_eleves_classes_par_com WHERE code_insee_concat = $1",
    values: [territoire],
  };
  const query2 = {
    text: "SELECT code_insee_concat, lib_com, numero_annee, nb_eleves_college, nb_eleves_lycee FROM _a_vues_portrait_commune.v_formation_evol_secondaire_eleves_par_com WHERE code_insee_concat = $1",
    values: [territoire],
  };
  const query3 = {
    text: "SELECT code_insee_concat, lib_com, numero_annee, borne_temp, nb_eleves, nb_classes, evol_eleves_4ans FROM _a_vues_portrait_commune.v_formation_indicateurs_primaire_par_com WHERE code_insee_concat = $1",
    values: [territoire],
  };
  const query4 = {
    text: "SELECT code_insee_concat, lib_com, numero_annee, nb_eleves_second FROM _a_vues_portrait_commune.v_formation_indicateurs_secondaire_par_com WHERE code_insee_concat = $1",
    values: [territoire],
  };

  try {
    const [result1, result2, result3, result4] = await Promise.all([
      pool.query(query1),
      pool.query(query2),
      pool.query(query3),
      pool.query(query4),
    ]);

    return [result1.rows, result2.rows, result3.rows, result4.rows];
  } catch (error) {
    console.error('Error fetching formation data:', error);
    throw error;
  }
}

/**
 * Fetches solidarity data for a given territory.
 * @param {string} territoire - The territory code (code_insee_concat).
 * @returns {Promise<Array<Array<Object>>>} A promise that resolves to an array containing the results of the two queries.
 */
export async function fetchSolidariteData(territoire) {
  const query1 = {
    text: "SELECT * FROM _a_vues_portrait_commune.v_solidarite_indicateurs_filosofi_par_com WHERE code_insee_concat = $1",
    values: [territoire],
  };
  const query2 = {
    text: "SELECT * FROM _a_vues_portrait_commune.v_solidarite_indicateurs_filosofi_par_com_partiel WHERE code_insee_concat = $1",
    values: [territoire],
  };

  try {
    const [result1, result2] = await Promise.all([
      pool.query(query1),
      pool.query(query2),
    ]);

    return [result1.rows, result2.rows];
  } catch (error) {
    console.error('Error fetching solidarity data:', error);
    throw error;
  }
}

/**
 * Fetches habitat data for a given territory.
 * @param {string} territoire - The territory code (code_insee_concat).
 * @returns {Promise<Array<Array<Object>>>} A promise that resolves to an array containing the results of the seven queries.
 */
export async function fetchHabitatData(territoire) {
  const query1 = {
    text: "SELECT code_insee_concat, lib_com, numero_annee, type_occup, nb_rp FROM _a_vues_portrait_commune.v_habitat_rp_type_occup_par_com WHERE code_insee_concat = $1",
    values: [territoire],
  };
  const query2 = {
    text: "SELECT code_insee_concat, lib_com, numero_annee, nb_logts_rp FROM _a_vues_baro.v_habitat_rm_evol_nb_logts_rp_par_com WHERE code_insee_concat = $1",
    values: [territoire],
  };
  const query3 = {
    text: "SELECT a.code_insee_concat, a.lib_com, a.numero_annee, a.nb_logts, a.part_maisons_ind, b.part_rp_prop_occup FROM _a_vues_portrait_commune.v_habitat_indicateurs_logts_par_com a LEFT JOIN _a_vues_portrait_commune.v_habitat_indicateurs_rp_par_com b ON a.code_insee_concat = b.code_insee_concat AND a.numero_annee = b.numero_annee WHERE a.code_insee_concat = $1",
    values: [territoire],
  };
  const query4 = {
    text: "SELECT code_insee_concat, lib_com, annee, nb_logts_commences FROM _a_vues_portrait_commune.v_habitat_evol_nb_logts_commences_par_com_yl WHERE code_insee_concat = $1",
    values: [territoire],
  };
  const query5 = {
    text: "SELECT code_insee_concat, lib_com, numero_annee, nb_maison_occasions_vendus, nb_appart_occasions_vendus FROM _a_vues_portrait_commune.v_habitat_rep_occasion_nb_logts_vendus_type_par_com WHERE code_insee_concat = $1",
    values: [territoire],
  };
  const query6 = {
    text: "SELECT b.code_insee_concat, b.lib_com, b.numero_annee, b.nb_logts_vendus, b.nb_logts_vendus_moy_4ans, b.part_collectif_logts_vendus_moy_4ans FROM _a_vues_portrait_commune.v_habitat_indicateurs_occasion_par_com_yl b WHERE b.code_insee_concat = $1",
    values: [territoire],
  };
  const query7 = {
    text: "SELECT a.code_insee_concat, a.lib_com, a.numero_annee, a.nb_logts_commences, a.nb_logts_commences_moy_4ans FROM _a_vues_portrait_commune.v_habitat_indicateurs_logt_commences_par_com_yl a WHERE a.code_insee_concat = $1",
    values: [territoire],
  };

  try {
    const [result1, result2, result3, result4, result5, result6, result7] = await Promise.all([
      pool.query(query1),
      pool.query(query2),
      pool.query(query3),
      pool.query(query4),
      pool.query(query5),
      pool.query(query6),
      pool.query(query7),
    ]);

    return [result1.rows, result2.rows, result3.rows, result4.rows, result5.rows, result6.rows, result7.rows];
  } catch (error) {
    console.error('Error fetching habitat data:', error);
    throw error;
  }
}

/**
 * Fetches economy data for a given territory.
 * @param {string} territoire - The territory code (code_insee_concat).
 * @returns {Promise<Array<Array<Object>>>} A promise that resolves to an array containing the results of the three queries.
 */
export async function fetchEconomieData(territoire) {
  const query1 = {
    text: "SELECT code_insee_concat, lib_com, numero_annee, lib_cat5, nb_etabl_cmna FROM _a_vues_portrait_commune.v_economie_rep_etabl_sect_par_com WHERE code_insee_concat = $1",
    values: [territoire],
  };
  const query2 = {
    text: "SELECT code_insee_concat, lib_com, numero_annee, nb_crea_etabl, tx_crea_etab FROM _a_vues_portrait_commune.v_economie_evol_crea_etabl_par_com WHERE code_insee_concat = $1",
    values: [territoire],
  };
  const query3 = {
    text: "SELECT code_insee_concat, lib_com, numero_annee, surf_loc_aut_m2 FROM _a_vues_portrait_commune.v_economie_indicateurs_surf_loc_aut_par_com WHERE code_insee_concat = $1",
    values: [territoire],
  };

  try {
    const [result1, result2, result3] = await Promise.all([
      pool.query(query1),
      pool.query(query2),
      pool.query(query3),
    ]);

    return [result1.rows, result2.rows, result3.rows];
  } catch (error) {
    console.error('Error fetching economie data:', error);
    throw error;
  }
}

/**
 * Fetches demographic data for a given territory.
 * @param {string} territoire - The territory code.
 * @returns {Promise<Array<Array<Object>>>} A promise that resolves to an array containing the results of the nine queries.
 */
export async function fetchDemoData(territoire) {
  const query1 = {
    text: "SELECT code_com, lib_com, annee, borne_temp, pop, tx_evol, gain_pop_annuel FROM _a_vues_portrait_commune.v_demo_indicateurs_pop_par_com_yl WHERE code_com = $1",
    values: [territoire],
  };
  const query2 = {
    text: "SELECT code_insee_concat, lib_com, annee, solde_migratoire, nb_deces, nb_naissances FROM _a_vues_portrait_commune.v_demo_naissances_deces_par_com_yl WHERE code_insee_concat = $1",
    values: [territoire],
  };
  const query3 = {
    text: "SELECT code_insee_concat, borne_temporelle, solde_naturel, solde_migratoire_apparent FROM _a_vues_portrait_commune.v_demo_solde_naturel_migratoire_par_com_yl WHERE code_insee_concat = $1",
    values: [territoire],
  };
  const query4 = {
    text: "SELECT code_insee_concat, numero_annee, lib_ta21, pop_h, pop_f FROM _a_vues_portrait_commune.v_demo_pyram_ages_par_com_yl WHERE code_insee_concat = $1",
    values: [territoire],
  };
  const query5 = {
    text: "SELECT code_insee_concat, lib_com, annee, indice_jeunesse FROM _a_vues_portrait_commune.v_demo_indice_jeunesse_par_com_yl WHERE code_insee_concat = $1",
    values: [territoire],
  };
  const query6 = {
    text: "SELECT code_insee_concat, numero_annee, pop_part_m20ans, pop_part_p60ans, ind_jeunesse FROM _a_vues_portrait_commune.v_demo_evolution_age_par_com_yl WHERE code_insee_concat = $1",
    values: [territoire],
  };
  const query7 = {
    text: "SELECT code_insee_concat, lib_com, numero_annee, lib_type_men, nb_men FROM _a_vues_portrait_commune.v_demo_rep_menages_type_par_com_yl WHERE code_insee_concat = $1",
    values: [territoire],
  };
  const query8 = {
    text: "SELECT code_insee_concat, lib_com, numero_annee, taille_moy_men FROM _a_vues_portrait_commune.v_demo_taille_moy_men_par_com_yl WHERE code_insee_concat = $1",
    values: [territoire],
  };
  const query9 = {
    text: "SELECT code_insee_concat, lib_com, numero_annee, nb_men, part_personnes_seules_men, taille_moy_men FROM _a_vues_portrait_commune.v_demo_indicateurs_menages_par_com_yl WHERE code_insee_concat = $1",
    values: [territoire],
  };

  try {
    const results = await Promise.all([
      pool.query(query1),
      pool.query(query2),
      pool.query(query3),
      pool.query(query4),
      pool.query(query5),
      pool.query(query6),
      pool.query(query7),
      pool.query(query8),
      pool.query(query9),
    ]);

    return results.map(result => result.rows);
  } catch (error) {
    console.error('Error fetching demo data:', error);
    throw error;
  }
}

/**
 * Fetches all territories.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of territories.
 */
export async function fetchTerritoires() {
  const query = {
    text: "SELECT * FROM _a_vues_portrait_commune.v_geo_communes",
  };

  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error fetching territoires:', error);
    throw error;
  }
}

/**
 * Fetches a single territory by its code.
 * @param {string} code - The territory code (code_insee_concat).
 * @returns {Promise<Object>} A promise that resolves to the territory object.
 */
export async function fetchTerritoire(code) {
  const query = {
    text: "SELECT * FROM _a_vues_portrait_commune.v_geo_communes WHERE code_insee_concat = $1",
    values: [code],
  };

  try {
    const result = await pool.query(query);
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching territoire:', error);
    throw error;
  }
} 