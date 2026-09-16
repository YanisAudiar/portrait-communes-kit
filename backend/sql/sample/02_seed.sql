-- =============================================================================
-- Jeu d'essai : 3 communes fictives (99101, 99102, 99103).
-- Chiffres inventés, uniquement pour faire tourner l'UI.
-- Charger après 01_schema.sql
-- =============================================================================

-- Ménages (choropleth + KPI) — les 3 communes
INSERT INTO portrait_sample.v_demo_indicateurs_menages_par_com
  (code_insee_concat, lib_com, numero_annee, nb_men, part_personnes_seules_men, taille_moy_men)
VALUES
  ('99101', 'Nordville', 2014, 3100, 32.1, 2.18),
  ('99101', 'Nordville', 2021, 3480, 35.4, 2.05),
  ('99102', 'Sudville', 2014, 1800, 28.0, 2.30),
  ('99102', 'Sudville', 2021, 1950, 30.2, 2.22),
  ('99103', 'Estville', 2014, 920, 25.5, 2.41),
  ('99103', 'Estville', 2021, 1010, 27.8, 2.33);

-- Démographie détaillée — Nordville (99101)
INSERT INTO portrait_sample.v_demo_pop_evol_par_com
  (code_insee_concat, lib_geo, annee, borne_temp, pop, tx_evol_annuel)
SELECT '99101', 'Nordville', y, y::text, 7200 + (y - 2014) * 90, 1.1
FROM generate_series(2014, 2021) AS y;

INSERT INTO portrait_sample.v_demo_indicateurs_pop_par_com
  (code_insee_concat, indicateur, annee, ind_val)
SELECT '99101', ind, y,
  CASE ind
    WHEN 'nb_hab' THEN 7200 + (y - 2014) * 90
    WHEN 'tx_evol_an' THEN 1.1
    WHEN 'gain_annuel_hab' THEN 90
  END
FROM generate_series(2014, 2021) AS y
CROSS JOIN (VALUES ('nb_hab'), ('tx_evol_an'), ('gain_annuel_hab')) AS i(ind);

INSERT INTO portrait_sample.v_demo_naissances_deces_par_com
  (code_insee_concat, lib_com, annee, nb_deces, nb_naissances)
SELECT '99101', 'Nordville', y, 70 + (y % 5), 95 + (y % 4)
FROM generate_series(2014, 2021) AS y;

INSERT INTO portrait_sample.v_demo_solde_nat_solde_mig_app_par_com
  (code_insee_concat, lib_com, borne_temporelle, solde_naturel, solde_migratoire_apparent)
VALUES
  ('99101', 'Nordville', '2008-2013', 18, 42),
  ('99101', 'Nordville', '2014-2019', 22, 55);

INSERT INTO portrait_sample.v_demo_rm_pyram_ages_par_com
  (code_insee_concat, lib_com, numero_annee, lib_ta21, pop_h, pop_f)
SELECT '99101', 'Nordville', y, t.lib, t.h, t.f
FROM generate_series(2014, 2021, 7) AS y
CROSS JOIN (VALUES
  ('0 à 4 ans', 210, 200),
  ('5 à 9 ans', 230, 220),
  ('20 à 24 ans', 280, 270),
  ('40 à 44 ans', 310, 320),
  ('60 à 64 ans', 190, 210),
  ('75 ans et plus', 140, 190)
) AS t(lib, h, f);

INSERT INTO portrait_sample.v_demo_indicateurs_jeunesse_evol_par_com
  (code_insee_concat, lib_com, annee, indice_jeunesse)
VALUES ('99101', 'Nordville', 2014, 1.12), ('99101', 'Nordville', 2021, 1.05);

INSERT INTO portrait_sample.v_demo_evolution_age_par_com_yl
  (code_insee_concat, numero_annee, pop_part_m20ans, pop_part_p60ans, ind_jeunesse, pop_moins_20ans, pop_plus_60ans)
VALUES
  ('99101', 2014, 24.1, 22.0, 1.12, 1735, 1580),
  ('99101', 2021, 23.0, 24.5, 1.05, 1810, 1930);

INSERT INTO portrait_sample.v_demo_rep_menages_type_par_com_yl
  (code_insee_concat, lib_com, numero_annee, lib_type_men, nb_men)
VALUES
  ('99101', 'Nordville', 2021, 'Personne seule', 1230),
  ('99101', 'Nordville', 2021, 'Couple sans enfant', 980),
  ('99101', 'Nordville', 2021, 'Couple avec enfant(s)', 890),
  ('99101', 'Nordville', 2021, 'Famille monoparentale', 280),
  ('99101', 'Nordville', 2021, 'Autres', 100);

INSERT INTO portrait_sample.v_demo_evol_taille_moy_menages_par_com
  (code_insee_concat, lib_com, numero_annee, taille_moy_men)
VALUES ('99101', 'Nordville', 2014, 2.18), ('99101', 'Nordville', 2021, 2.05);

INSERT INTO portrait_sample.v_demo_indicateurs_pop_active_1564_par_com
  (code_insee_concat, lib_geo, numero_annee, pop_active, part_pop_active_sur_1564)
VALUES ('99101', 'Nordville', 2014, 4100, 0.76), ('99101', 'Nordville', 2021, 4280, 0.74);

INSERT INTO portrait_sample.v_demo_rep_pop_active_type_act_par_com
  (code_insee_concat, lib_com, numero_annee, type_act, pop15p)
VALUES
  ('99101', 'Nordville', 2021, 'Actifs occupés', 3900),
  ('99101', 'Nordville', 2021, 'Chômeurs', 380),
  ('99101', 'Nordville', 2021, 'Retraités', 1450),
  ('99101', 'Nordville', 2021, 'Élèves, étudiants', 620);

INSERT INTO portrait_sample.v_demo_pop_evo_ages_multi_periodes_par_com
  (code_insee_concat, lib_com, groupe_age, periode_intercensitaire, annee_debut, annee_fin,
   pop_debut_periode, pop_fin_periode, evolution_absolue)
VALUES
  ('99101', 'Nordville', 'moins de 20 ans', '2014-2021', 2014, 2021, 1735, 1810, 75),
  ('99101', 'Nordville', '60 ans ou plus', '2014-2021', 2014, 2021, 1580, 1930, 350);

INSERT INTO portrait_sample.v_demo_pop_ta6_par_com
  (code_insee_concat, lib_com, numero_annee, lib_ta6, pop)
VALUES
  ('99101', 'Nordville', 2014, '0 à 14 ans', 1280),
  ('99101', 'Nordville', 2014, '60 à 74 ans', 980),
  ('99101', 'Nordville', 2021, '0 à 14 ans', 1310),
  ('99101', 'Nordville', 2021, '60 à 74 ans', 1180);

-- Habitat — Nordville
INSERT INTO portrait_sample.v_habitat_evol_statut_occupation_logement_par_com
  (code_geo, lib_geo, numero_annee, statut_occup, nb_logements)
VALUES
  ('99101', 'Nordville', 2021, 'Propriétaire', 2100),
  ('99101', 'Nordville', 2021, 'Locataire', 1280);

INSERT INTO portrait_sample.v_habitat_evol_nb_rp_par_com_yl
  (code_insee_concat, lib_com, numero_annee, nb_rp)
VALUES ('99101', 'Nordville', 2014, 3200), ('99101', 'Nordville', 2021, 3480);

INSERT INTO portrait_sample.v_habitat_indicateurs_logts_par_com
  (code_insee_concat, lib_com, numero_annee, nb_logts, part_maisons_ind)
VALUES ('99101', 'Nordville', 2014, 3350, 62.0), ('99101', 'Nordville', 2021, 3620, 58.5);

INSERT INTO portrait_sample.v_habitat_indicateurs_rp_par_com
  (code_insee_concat, lib_com, numero_annee, part_rp_prop_occup, nb_rp)
VALUES ('99101', 'Nordville', 2014, 61.2, 3200), ('99101', 'Nordville', 2021, 60.1, 3480);

INSERT INTO portrait_sample.v_constr_logts_indicateurs_territoire_annee
  (code_geo, lib_geo, annee_historique, nb_logts_commences_historique, numero_annee, part_collectif_logts_commences_moy_4ans)
VALUES ('99101', 'Nordville', 2018, 42, 2018, 48.0), ('99101', 'Nordville', 2021, 55, 2021, 52.0);

INSERT INTO portrait_sample.v_habitat_rep_occasion_nb_logts_vendus_type_par_com
  (code_insee_concat, lib_com, numero_annee, nb_maison_occasions_vendus, nb_appart_occasions_vendus)
VALUES ('99101', 'Nordville', 2018, 40, 55), ('99101', 'Nordville', 2021, 38, 62);

INSERT INTO portrait_sample.v_habitat_indicateurs_occasion_par_com
  (code_geo, lib_geo, numero_annee, nb_logts_vendus, nb_logts_vendus_moy_4ans)
VALUES ('99101', 'Nordville', 2018, 95, 88), ('99101', 'Nordville', 2021, 100, 94);

INSERT INTO portrait_sample.v_constr_logts_indicateurs_territoire_annee_new_yl_dpc
  (code_geo, lib_geo, numero_annee, nb_logts_commences, nb_logts_commences_moy_4ans, part_collectif_logts_commences_moy_4ans)
VALUES ('99101', 'Nordville', 2018, 42, 38, 48.0), ('99101', 'Nordville', 2021, 55, 46, 52.0);

INSERT INTO portrait_sample.v_habitat_evol_ventes_occasion_type_par_com_yl
  (code_insee_concat, lib_com, numero_annee, id_type_bien, type_bien, nb_logts_vendus)
VALUES
  ('99101', 'Nordville', 2021, '1', 'Maison', 38),
  ('99101', 'Nordville', 2021, '2', 'Appartement', 62);

INSERT INTO portrait_sample.v_habitat_evol_part_logts_commences_collectif_par_com
  (code_insee_concat, lib_com, annee, part_logts_commences_collectif)
VALUES ('99101', 'Nordville', 2018, 48.0), ('99101', 'Nordville', 2021, 52.0);

INSERT INTO portrait_sample.v_habitat_evol_prix_vol_maison_occas_par_com
  (code_geo, lib_geo, annee, prix_moyen_maison, nb_maisons_vendues)
VALUES ('99101', 'Nordville', 2018, 280000, 40), ('99101', 'Nordville', 2021, 325000, 38);

INSERT INTO portrait_sample.v_habitat_evol_prix_vol_appart_occas_par_com
  (code_geo, lib_geo, annee, prix_moyen_m2_appart, nb_apparts_vendus)
VALUES ('99101', 'Nordville', 2018, 3100, 55), ('99101', 'Nordville', 2021, 3550, 62);

-- Économie
INSERT INTO portrait_sample.v_economie_rep_etabl_sect_par_com
  (code_insee_concat, lib_com, numero_annee, lib_cat5, nb_etabl_cmna)
VALUES
  ('99101', 'Nordville', 2021, 'Commerce', 120),
  ('99101', 'Nordville', 2021, 'Services', 210),
  ('99101', 'Nordville', 2021, 'Industrie', 35);

INSERT INTO portrait_sample.v_economie_evol_crea_etabl_par_com
  (code_insee_concat, lib_com, numero_annee, nb_crea_etabl, tx_crea_etab)
VALUES ('99101', 'Nordville', 2018, 42, 8.1), ('99101', 'Nordville', 2021, 51, 9.0);

INSERT INTO portrait_sample.v_economie_indicateurs_surf_loc_aut_par_com
  (code_insee_concat, lib_com, numero_annee, surf_loc_aut_m2)
VALUES ('99101', 'Nordville', 2018, 1200), ('99101', 'Nordville', 2021, 1450);

INSERT INTO portrait_sample.v_emploi_indicateurs_emplois_par_com
  (code_insee_concat, lib_com, numero_annee, nb_emplois, evol_emplois)
VALUES ('99101', 'Nordville', 2014, 2800, NULL), ('99101', 'Nordville', 2021, 3120, 11.4);

INSERT INTO portrait_sample.v_emploi_nb_emplois_csp_par_com_yl
  (code_insee_concat, lib_com, numero_annee, lib_csp, nb_emplois)
VALUES
  ('99101', 'Nordville', 2021, 'Cadres', 620),
  ('99101', 'Nordville', 2021, 'Professions intermédiaires', 890),
  ('99101', 'Nordville', 2021, 'Employés', 980);

INSERT INTO portrait_sample.v_emploi_nb_emplois_sect_act_par_com
  (code_insee_concat, lib_com, numero_annee, lib_sect_act, nb_emplois)
VALUES
  ('99101', 'Nordville', 2021, 'Tertiaire', 2400),
  ('99101', 'Nordville', 2021, 'Industrie', 520),
  ('99101', 'Nordville', 2021, 'Construction', 200);

INSERT INTO portrait_sample.v_emploi_actifs_occup_loc_emploi_par_com_yl
  (code_insee_concat, lib_com, numero_annee, lib_loc_emploi, nb_actifs_occup)
VALUES
  ('99101', 'Nordville', 2021, 'Dans la commune', 1100),
  ('99101', 'Nordville', 2021, 'Hors commune', 2800);

-- Formation
INSERT INTO portrait_sample.v_formation_evol_primaire_eleves_classes_2024
  (code_insee_concat, lib_com, numero_annee, nb_eleves_pre_elementaire, nb_eleves_elementaire, nb_classes_pre_elementaire, nb_classes_elementaire)
VALUES ('99101', 'Nordville', 2018, 90, 310, 4, 13), ('99101', 'Nordville', 2024, 95, 328, 4, 14);

INSERT INTO portrait_sample.v_formation_evol_secondaire_eleves_2024
  (code_insee_concat, lib_com, numero_annee, nb_eleves_college, nb_eleves_lycee)
VALUES ('99101', 'Nordville', 2018, 420, 0), ('99101', 'Nordville', 2024, 445, 0);

INSERT INTO portrait_sample.v_formation_indicateurs_primaire_par_com_2024
  (code_insee_concat, lib_com, numero_annee, borne_temp, nb_eleves, nb_classes, evol_eleves_4ans)
VALUES ('99101', 'Nordville', 2024, '2020-2024', 423, 18, 5.8);

INSERT INTO portrait_sample.v_formation_indicateurs_secondaire_par_com_2024
  (code_insee_concat, lib_com, numero_annee, nb_eleves_second)
VALUES ('99101', 'Nordville', 2024, 445);

INSERT INTO portrait_sample.v_formation_rm_evol_primaire_ouv_ferm_classes_par_com_2024
  (code_insee_concat, lib_com, numero_annee, nb_classes, ouv_classes, ferm_classes)
VALUES ('99101', 'Nordville', 2024, 18, 1, 0);

-- Solidarité
INSERT INTO portrait_sample.v_solidarite_indicateurs_filosofi_par_com_2022
  (code_insee_concat, lib_com, numero_annee, indicateurs, val)
VALUES
  ('99101', 'Nordville', 2021, 'Médiane du niveau de vie', 22800),
  ('99101', 'Nordville', 2021, 'Niveau de vie décile 1', 12400),
  ('99101', 'Nordville', 2021, 'Niveau de vie décile 9', 41200),
  ('99101', 'Nordville', 2021, 'Part des revenus d''activités', 68.0),
  ('99101', 'Nordville', 2021, 'Part des pensions, retraites et rentes', 22.0),
  ('99101', 'Nordville', 2021, 'Part des revenus du patrimoine et autres', 6.0),
  ('99101', 'Nordville', 2021, 'Part des prestations sociales', 4.0),
  ('99101', 'Nordville', 2021, 'Part des impôts', -8.5);

INSERT INTO portrait_sample.v_social_dependants_presta50_100_par_com
  (code_insee_concat, lib_com, numero_annee, tr50pfrb, tr100pfrb)
VALUES ('99101', 'Nordville', 2018, 120, 45), ('99101', 'Nordville', 2021, 128, 50);

-- Agriculture
INSERT INTO portrait_sample.v_agri_nb_expl_par_com
  (code_insee_concat, lib_geo, numero_annee, ind_val)
VALUES ('99101', 'Nordville', 2010, 18), ('99101', 'Nordville', 2020, 14);

INSERT INTO portrait_sample.v_agri_taux_evol_expl_par_com
  (code_insee_concat, lib_geo, annee, ind_val)
VALUES ('99101', 'Nordville', 2020, -22.2);

INSERT INTO portrait_sample.v_agri_taux_evol_ann_moy_nb_exploit_annee_rm_com
  (code_insee_concat, lib_com, annee, ind_val)
VALUES ('99101', 'Nordville', 2020, -2.5);

INSERT INTO portrait_sample.v_agri_nb_etp_par_com
  (code_insee_concat, lib_com, annee, etp)
VALUES ('99101', 'Nordville', 2010, 22), ('99101', 'Nordville', 2020, 19);

INSERT INTO portrait_sample.v_agri_exploitation_evol_par_com
  (code_insee_concat, lib_commune, annee, indicateur, ind_val)
VALUES ('99101', 'Nordville', 2010, 'nb_exploitation_annuel', 18),
       ('99101', 'Nordville', 2020, 'nb_exploitation_annuel', 14);

INSERT INTO portrait_sample.v_agri_sau_par_com
  (code_insee_concat, lib_com, annee, indicateur, ind_val)
VALUES ('99101', 'Nordville', 2020, 'sau_totale', 620);

INSERT INTO portrait_sample.v_agri_sau_evol_par_com
  (code_insee_concat, lib_commune, annee, indicateur, ind_val)
VALUES ('99101', 'Nordville', 2010, 'sau_annuel', 680),
       ('99101', 'Nordville', 2020, 'sau_annuel', 620);

INSERT INTO portrait_sample.v_agri_evol_nb_exploitation_bio_annee_rm_com
  (code_insee_concat, lib_com, numero_annee, nb_exploitation_bio)
VALUES ('99101', 'Nordville', 2015, 2), ('99101', 'Nordville', 2020, 4);
