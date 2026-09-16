-- =============================================================================
-- Portrait Communes — schéma d'exemple (kit agences)
-- Tables nommées comme les vues attendues par les repositories.
-- Colonnes = contrat minimal (voir docs/CONTRAT_DONNEES.md).
-- Charger : psql -d portrait_communes -f backend/sql/sample/01_schema.sql
-- =============================================================================

CREATE SCHEMA IF NOT EXISTS portrait_sample;

-- ---------------------------------------------------------------------------
-- Démographie
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS portrait_sample.v_demo_pop_evol_par_com (
  code_insee_concat text NOT NULL,
  lib_geo text,
  annee integer,
  borne_temp text,
  pop numeric,
  tx_evol_annuel numeric
);

CREATE TABLE IF NOT EXISTS portrait_sample.v_demo_indicateurs_pop_par_com (
  code_insee_concat text NOT NULL,
  indicateur text NOT NULL,
  annee integer,
  ind_val numeric
);

CREATE TABLE IF NOT EXISTS portrait_sample.v_demo_naissances_deces_par_com (
  code_insee_concat text NOT NULL,
  lib_com text,
  annee integer,
  nb_deces numeric,
  nb_naissances numeric
);

CREATE TABLE IF NOT EXISTS portrait_sample.v_demo_solde_nat_solde_mig_app_par_com (
  code_insee_concat text NOT NULL,
  lib_com text,
  borne_temporelle text,
  solde_naturel numeric,
  solde_migratoire_apparent numeric
);

CREATE TABLE IF NOT EXISTS portrait_sample.v_demo_rm_pyram_ages_par_com (
  code_insee_concat text NOT NULL,
  lib_com text,
  numero_annee integer,
  lib_ta21 text,
  pop_h numeric,
  pop_f numeric
);

CREATE TABLE IF NOT EXISTS portrait_sample.v_demo_indicateurs_jeunesse_evol_par_com (
  code_insee_concat text NOT NULL,
  lib_com text,
  annee integer,
  indice_jeunesse numeric
);

CREATE TABLE IF NOT EXISTS portrait_sample.v_demo_evolution_age_par_com_yl (
  code_insee_concat text NOT NULL,
  numero_annee integer,
  pop_part_m20ans numeric,
  pop_part_p60ans numeric,
  ind_jeunesse numeric,
  pop_moins_20ans numeric,
  pop_plus_60ans numeric
);

CREATE TABLE IF NOT EXISTS portrait_sample.v_demo_rep_menages_type_par_com_yl (
  code_insee_concat text NOT NULL,
  lib_com text,
  numero_annee integer,
  lib_type_men text,
  nb_men numeric
);

CREATE TABLE IF NOT EXISTS portrait_sample.v_demo_evol_taille_moy_menages_par_com (
  code_insee_concat text NOT NULL,
  lib_com text,
  numero_annee integer,
  taille_moy_men numeric
);

CREATE TABLE IF NOT EXISTS portrait_sample.v_demo_indicateurs_menages_par_com (
  code_insee_concat text NOT NULL,
  lib_com text,
  numero_annee integer,
  nb_men numeric,
  part_personnes_seules_men numeric,
  taille_moy_men numeric
);

CREATE TABLE IF NOT EXISTS portrait_sample.v_demo_indicateurs_pop_active_1564_par_com (
  code_insee_concat text NOT NULL,
  lib_geo text,
  numero_annee integer,
  pop_active numeric,
  part_pop_active_sur_1564 numeric
);

CREATE TABLE IF NOT EXISTS portrait_sample.v_demo_rep_pop_active_type_act_par_com (
  code_insee_concat text NOT NULL,
  lib_com text,
  numero_annee integer,
  type_act text,
  pop15p numeric
);

CREATE TABLE IF NOT EXISTS portrait_sample.v_demo_pop_evo_ages_multi_periodes_par_com (
  code_insee_concat text NOT NULL,
  lib_com text,
  groupe_age text,
  periode_intercensitaire text,
  annee_debut integer,
  annee_fin integer,
  pop_debut_periode numeric,
  pop_fin_periode numeric,
  evolution_absolue numeric
);

CREATE TABLE IF NOT EXISTS portrait_sample.v_demo_pop_ta6_par_com (
  code_insee_concat text NOT NULL,
  lib_com text,
  numero_annee integer,
  lib_ta6 text,
  pop numeric
);

-- ---------------------------------------------------------------------------
-- Habitat
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS portrait_sample.v_habitat_evol_statut_occupation_logement_par_com (
  code_geo text NOT NULL,
  lib_geo text,
  numero_annee integer,
  statut_occup text,
  nb_logements numeric
);

CREATE TABLE IF NOT EXISTS portrait_sample.v_habitat_evol_nb_rp_par_com_yl (
  code_insee_concat text NOT NULL,
  lib_com text,
  numero_annee integer,
  nb_rp numeric
);

CREATE TABLE IF NOT EXISTS portrait_sample.v_habitat_indicateurs_logts_par_com (
  code_insee_concat text NOT NULL,
  lib_com text,
  numero_annee integer,
  nb_logts numeric,
  part_maisons_ind numeric
);

CREATE TABLE IF NOT EXISTS portrait_sample.v_habitat_indicateurs_rp_par_com (
  code_insee_concat text NOT NULL,
  lib_com text,
  numero_annee integer,
  part_rp_prop_occup numeric,
  nb_rp numeric
);

CREATE TABLE IF NOT EXISTS portrait_sample.v_constr_logts_indicateurs_territoire_annee (
  code_geo text NOT NULL,
  lib_geo text,
  annee_historique integer,
  nb_logts_commences_historique numeric,
  numero_annee integer,
  part_collectif_logts_commences_moy_4ans numeric
);

CREATE TABLE IF NOT EXISTS portrait_sample.v_habitat_rep_occasion_nb_logts_vendus_type_par_com (
  code_insee_concat text NOT NULL,
  lib_com text,
  numero_annee integer,
  nb_maison_occasions_vendus numeric,
  nb_appart_occasions_vendus numeric
);

CREATE TABLE IF NOT EXISTS portrait_sample.v_habitat_indicateurs_occasion_par_com (
  code_geo text NOT NULL,
  lib_geo text,
  numero_annee integer,
  nb_logts_vendus numeric,
  nb_logts_vendus_moy_4ans numeric
);

CREATE TABLE IF NOT EXISTS portrait_sample.v_constr_logts_indicateurs_territoire_annee_new_yl_dpc (
  code_geo text NOT NULL,
  lib_geo text,
  numero_annee integer,
  nb_logts_commences numeric,
  nb_logts_commences_moy_4ans numeric,
  part_collectif_logts_commences_moy_4ans numeric
);

CREATE TABLE IF NOT EXISTS portrait_sample.v_habitat_evol_ventes_occasion_type_par_com_yl (
  code_insee_concat text NOT NULL,
  lib_com text,
  numero_annee integer,
  id_type_bien text,
  type_bien text,
  nb_logts_vendus numeric
);

CREATE TABLE IF NOT EXISTS portrait_sample.v_habitat_evol_part_logts_commences_collectif_par_com (
  code_insee_concat text NOT NULL,
  lib_com text,
  annee integer,
  part_logts_commences_collectif numeric
);

CREATE TABLE IF NOT EXISTS portrait_sample.v_habitat_evol_prix_vol_maison_occas_par_com (
  code_geo text NOT NULL,
  lib_geo text,
  annee integer,
  prix_moyen_maison numeric,
  nb_maisons_vendues numeric
);

CREATE TABLE IF NOT EXISTS portrait_sample.v_habitat_evol_prix_vol_appart_occas_par_com (
  code_geo text NOT NULL,
  lib_geo text,
  annee integer,
  prix_moyen_m2_appart numeric,
  nb_apparts_vendus numeric
);

-- ---------------------------------------------------------------------------
-- Économie / emploi
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS portrait_sample.v_economie_rep_etabl_sect_par_com (
  code_insee_concat text NOT NULL,
  lib_com text,
  numero_annee integer,
  lib_cat5 text,
  nb_etabl_cmna numeric
);

CREATE TABLE IF NOT EXISTS portrait_sample.v_economie_evol_crea_etabl_par_com (
  code_insee_concat text NOT NULL,
  lib_com text,
  numero_annee integer,
  nb_crea_etabl numeric,
  tx_crea_etab numeric
);

CREATE TABLE IF NOT EXISTS portrait_sample.v_economie_indicateurs_surf_loc_aut_par_com (
  code_insee_concat text NOT NULL,
  lib_com text,
  numero_annee integer,
  surf_loc_aut_m2 numeric
);

CREATE TABLE IF NOT EXISTS portrait_sample.v_emploi_indicateurs_emplois_par_com (
  code_insee_concat text NOT NULL,
  lib_com text,
  numero_annee integer,
  nb_emplois numeric,
  evol_emplois numeric
);

CREATE TABLE IF NOT EXISTS portrait_sample.v_emploi_nb_emplois_csp_par_com_yl (
  code_insee_concat text NOT NULL,
  lib_com text,
  numero_annee integer,
  lib_csp text,
  nb_emplois numeric
);

CREATE TABLE IF NOT EXISTS portrait_sample.v_emploi_nb_emplois_sect_act_par_com (
  code_insee_concat text NOT NULL,
  lib_com text,
  numero_annee integer,
  lib_sect_act text,
  nb_emplois numeric
);

CREATE TABLE IF NOT EXISTS portrait_sample.v_emploi_actifs_occup_loc_emploi_par_com_yl (
  code_insee_concat text NOT NULL,
  lib_com text,
  numero_annee integer,
  lib_loc_emploi text,
  nb_actifs_occup numeric
);

-- ---------------------------------------------------------------------------
-- Formation
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS portrait_sample.v_formation_evol_primaire_eleves_classes_2024 (
  code_insee_concat text NOT NULL,
  lib_com text,
  numero_annee integer,
  nb_eleves_pre_elementaire numeric,
  nb_eleves_elementaire numeric,
  nb_classes_pre_elementaire numeric,
  nb_classes_elementaire numeric
);

CREATE TABLE IF NOT EXISTS portrait_sample.v_formation_evol_secondaire_eleves_2024 (
  code_insee_concat text NOT NULL,
  lib_com text,
  numero_annee integer,
  nb_eleves_college numeric,
  nb_eleves_lycee numeric
);

CREATE TABLE IF NOT EXISTS portrait_sample.v_formation_indicateurs_primaire_par_com_2024 (
  code_insee_concat text NOT NULL,
  lib_com text,
  numero_annee integer,
  borne_temp text,
  nb_eleves numeric,
  nb_classes numeric,
  evol_eleves_4ans numeric
);

CREATE TABLE IF NOT EXISTS portrait_sample.v_formation_indicateurs_secondaire_par_com_2024 (
  code_insee_concat text NOT NULL,
  lib_com text,
  numero_annee integer,
  nb_eleves_second numeric
);

CREATE TABLE IF NOT EXISTS portrait_sample.v_formation_rm_evol_primaire_ouv_ferm_classes_par_com_2024 (
  code_insee_concat text NOT NULL,
  lib_com text,
  numero_annee integer,
  nb_classes numeric,
  ouv_classes numeric,
  ferm_classes numeric
);

-- ---------------------------------------------------------------------------
-- Solidarité
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS portrait_sample.v_solidarite_indicateurs_filosofi_par_com_2022 (
  code_insee_concat text NOT NULL,
  lib_com text,
  numero_annee integer,
  indicateurs text,
  val numeric
);

CREATE TABLE IF NOT EXISTS portrait_sample.v_solidarite_indicateurs_filosofi_par_com (
  code_insee_concat text NOT NULL,
  lib_com text,
  numero_annee integer,
  indicateurs text,
  val numeric
);

CREATE TABLE IF NOT EXISTS portrait_sample.v_social_dependants_presta50_100_par_com (
  code_insee_concat text NOT NULL,
  lib_com text,
  numero_annee integer,
  tr50pfrb numeric,
  tr100pfrb numeric
);

-- ---------------------------------------------------------------------------
-- Agriculture
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS portrait_sample.v_agri_nb_expl_par_com (
  code_insee_concat text NOT NULL,
  lib_geo text,
  numero_annee integer,
  ind_val numeric
);

CREATE TABLE IF NOT EXISTS portrait_sample.v_agri_taux_evol_expl_par_com (
  code_insee_concat text NOT NULL,
  lib_geo text,
  annee integer,
  ind_val numeric
);

CREATE TABLE IF NOT EXISTS portrait_sample.v_agri_taux_evol_ann_moy_nb_exploit_annee_rm_com (
  code_insee_concat text NOT NULL,
  lib_com text,
  annee integer,
  ind_val numeric
);

CREATE TABLE IF NOT EXISTS portrait_sample.v_agri_nb_etp_par_com (
  code_insee_concat text NOT NULL,
  lib_com text,
  annee integer,
  etp numeric
);

CREATE TABLE IF NOT EXISTS portrait_sample.v_agri_exploitation_evol_par_com (
  code_insee_concat text NOT NULL,
  lib_commune text,
  annee integer,
  indicateur text,
  ind_val numeric
);

CREATE TABLE IF NOT EXISTS portrait_sample.v_agri_sau_par_com (
  code_insee_concat text NOT NULL,
  lib_com text,
  annee integer,
  indicateur text,
  ind_val numeric
);

CREATE TABLE IF NOT EXISTS portrait_sample.v_agri_sau_evol_par_com (
  code_insee_concat text NOT NULL,
  lib_commune text,
  annee integer,
  indicateur text,
  ind_val numeric
);

CREATE TABLE IF NOT EXISTS portrait_sample.v_agriculture_indicateurs_production_par_com (
  code_insee_concat text NOT NULL,
  lib_geo text
);

CREATE TABLE IF NOT EXISTS portrait_sample.v_agri_evol_nb_exploitation_bio_annee_rm_com (
  code_insee_concat text NOT NULL,
  lib_com text,
  numero_annee integer,
  nb_exploitation_bio numeric
);
