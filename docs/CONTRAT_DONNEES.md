# Contrat de données (kit agences)

L’application ne lit **pas** les tables INSEE brutes. Elle interroge des **vues** (ou tables du même nom) dans le schéma `PGSCHEMA`.

Ce document décrit le contrat **actuel du code** (repositories 2026). Les anciens fichiers `docs/VIEWS_INDICATEURS_*.md` listent des noms `_2022` obsolètes (bandeau en tête de fichier).

Jeu d’essai : [`backend/sql/sample/`](../backend/sql/sample/README.md).

## Identité territoriale

| Rôle | Colonnes possibles | Comment l’app s’adapte |
|------|--------------------|-------------------------|
| Code commune | `code_insee_concat` **ou** `code_geo` | [`backend/config/vueColumnConventions.ts`](../backend/config/vueColumnConventions.ts) |
| Libellé | `lib_com`, `lib_geo` ou `lib_commune` | idem |
| Année | `numero_annee` ou `annee` | selon la vue |

Convention **Portrait** (recommandée pour un fork) : `code_insee_concat` + `lib_com`.  
Convention **Baro** : `code_geo` + `lib_geo`. Le mapping par vue est déjà dans `VUE_COLUMNS`.

Le schéma PostgreSQL se règle avec `PGSCHEMA` (défaut code : `_a_vues_portrait_commune_yl`).

## Géométries (carte)

Une FeatureCollection GeoJSON **ou** une couche WFS. Propriétés minimales :

| Propriété | Usage |
|-----------|--------|
| `code_insee_concat` | Filtre, URL fiche, jointure indicateurs |
| `lib_com` | Nom affiché |
| `id_com` | Optionnel |
| `geometry` | Polygon / MultiPolygon, WGS84 (EPSG:4326) |

- WFS : `GEOSERVER_URL`, `GEOSERVER_NAMESPACE`, `GEOSERVER_COMMUNES_LAYER`
- Fichier : `COMMUNES_GEOJSON_PATH` (ex. `./data/sample-communes.geojson`) — **pas besoin de GeoServer**

La carte choropleth joint ensuite `v_demo_indicateurs_menages_par_com` (année max) pour `has_data`.

## Vues par thème

Colonnes = celles **lues** par l’API. Des colonnes supplémentaires sont ignorées.

### Démographie

| Vue | Colonnes minimales |
|-----|-------------------|
| `v_demo_pop_evol_par_com` | code, `lib_geo`, `annee`, `borne_temp`, `pop`, `tx_evol_annuel` |
| `v_demo_indicateurs_pop_par_com` | code, `indicateur` (`nb_hab`, `tx_evol_an`, `gain_annuel_hab`), `annee`, `ind_val` |
| `v_demo_naissances_deces_par_com` | code, `lib_com`, `annee`, `nb_deces`, `nb_naissances` |
| `v_demo_solde_nat_solde_mig_app_par_com` | code, `borne_temporelle`, `solde_naturel`, `solde_migratoire_apparent` |
| `v_demo_rm_pyram_ages_par_com` | code, `numero_annee`, `lib_ta21`, et (`pop_h`/`pop_f`) **ou** (`lib_sexe` + `pop`) |
| `v_demo_indicateurs_jeunesse_evol_par_com` | code, `lib_com`, `annee`, `indice_jeunesse` |
| `v_demo_evolution_age_par_com_yl` | code, `numero_annee`, `pop_part_m20ans`, `pop_part_p60ans`, `ind_jeunesse`, `pop_moins_20ans`, `pop_plus_60ans` |
| `v_demo_rep_menages_type_par_com_yl` | code, `lib_com`, `numero_annee`, `lib_type_men`, `nb_men` |
| `v_demo_evol_taille_moy_menages_par_com` | code, `lib_com`, `numero_annee`, `taille_moy_men` |
| `v_demo_indicateurs_menages_par_com` | code, `lib_com`, `numero_annee`, `nb_men`, `part_personnes_seules_men`, `taille_moy_men` |
| `v_demo_indicateurs_pop_active_1564_par_com` | code, `numero_annee`, `pop_active`, `part_pop_active_sur_1564` |
| `v_demo_rep_pop_active_type_act_par_com` | code, `lib_com`, `numero_annee`, `type_act`, `pop15p` |
| `v_demo_pop_evo_ages_multi_periodes_par_com` | code, `lib_com`, `groupe_age`, `periode_intercensitaire`, `annee_debut`, `annee_fin`, `pop_debut_periode`, `pop_fin_periode`, `evolution_absolue` |
| `v_demo_pop_ta6_par_com` | code, `numero_annee`, `lib_ta6`, `pop` (repli pyramide / âges) |

### Habitat

| Vue | Colonnes minimales |
|-----|-------------------|
| `v_habitat_evol_statut_occupation_logement_par_com` | `code_geo`, `lib_geo`, `numero_annee`, `statut_occup`, `nb_logements` |
| `v_habitat_evol_nb_rp_par_com_yl` | `code_insee_concat`, `lib_com`, `numero_annee`, `nb_rp` |
| `v_habitat_indicateurs_logts_par_com` | code, `numero_annee`, `nb_logts`, `part_maisons_ind` |
| `v_habitat_indicateurs_rp_par_com` | code, `numero_annee`, `part_rp_prop_occup`, `nb_rp` |
| `v_constr_logts_indicateurs_territoire_annee` | `code_geo`, `lib_geo`, `annee_historique`, `nb_logts_commences_historique`, `numero_annee`, `part_collectif_logts_commences_moy_4ans` |
| `v_habitat_rep_occasion_nb_logts_vendus_type_par_com` | code, `numero_annee`, `nb_maison_occasions_vendus`, `nb_appart_occasions_vendus` |
| `v_habitat_indicateurs_occasion_par_com` | `code_geo`, `lib_geo`, `numero_annee`, `nb_logts_vendus`, `nb_logts_vendus_moy_4ans` |
| `v_constr_logts_indicateurs_territoire_annee_new_yl_dpc` | `code_geo`, `lib_geo`, `numero_annee`, `nb_logts_commences`, `nb_logts_commences_moy_4ans`, `part_collectif_logts_commences_moy_4ans` |
| `v_habitat_evol_ventes_occasion_type_par_com_yl` | code, `numero_annee`, `id_type_bien`, `type_bien`, `nb_logts_vendus` |
| `v_habitat_evol_part_logts_commences_collectif_par_com` | code, `annee`, `part_logts_commences_collectif` |
| `v_habitat_evol_prix_vol_maison_occas_par_com` | `code_geo`, `annee`, `prix_moyen_maison`, `nb_maisons_vendues` |
| `v_habitat_evol_prix_vol_appart_occas_par_com` | `code_geo`, `annee`, `prix_moyen_m2_appart`, `nb_apparts_vendus` |

### Économie / emploi

| Vue | Colonnes minimales |
|-----|-------------------|
| `v_economie_rep_etabl_sect_par_com` | code, `lib_com`, `numero_annee`, `lib_cat5`, `nb_etabl_cmna` |
| `v_economie_evol_crea_etabl_par_com` | code, `numero_annee`, `nb_crea_etabl`, `tx_crea_etab` |
| `v_economie_indicateurs_surf_loc_aut_par_com` | code, `numero_annee`, `surf_loc_aut_m2` |
| `v_emploi_indicateurs_emplois_par_com` | code, `numero_annee`, `nb_emplois`, `evol_emplois` |
| `v_emploi_nb_emplois_csp_par_com_yl` | code, `numero_annee`, `lib_csp`, `nb_emplois` |
| `v_emploi_nb_emplois_sect_act_par_com` | code, `numero_annee`, `lib_sect_act`, `nb_emplois` |
| `v_emploi_actifs_occup_loc_emploi_par_com_yl` | code, `numero_annee`, `lib_loc_emploi`, `nb_actifs_occup` |

### Formation

| Vue | Colonnes minimales |
|-----|-------------------|
| `v_formation_evol_primaire_eleves_classes_2024` | code, `lib_com`, `numero_annee`, `nb_eleves_pre_elementaire`, `nb_eleves_elementaire`, `nb_classes_pre_elementaire`, `nb_classes_elementaire` |
| `v_formation_evol_secondaire_eleves_2024` | code, `numero_annee`, `nb_eleves_college`, `nb_eleves_lycee` |
| `v_formation_indicateurs_primaire_par_com_2024` | code, `numero_annee`, `borne_temp`, `nb_eleves`, `nb_classes`, `evol_eleves_4ans` |
| `v_formation_indicateurs_secondaire_par_com_2024` | code, `numero_annee`, `nb_eleves_second` |
| `v_formation_rm_evol_primaire_ouv_ferm_classes_par_com_2024` | code, `numero_annee`, `nb_classes`, `ouv_classes`, `ferm_classes` |

### Solidarité

| Vue | Colonnes minimales |
|-----|-------------------|
| `v_solidarite_indicateurs_filosofi_par_com_2022` (puis repli sans `_2022`) | code, `lib_com`, `numero_annee`, `indicateurs`, `val` (format long) |
| `v_social_dependants_presta50_100_par_com` | code, `numero_annee`, `tr50pfrb`, `tr100pfrb` |

Libellés FiLoSoFi attendus côté front : « Médiane du niveau de vie », déciles, parts de revenus (voir `SolidariteRepository.ts`).

### Agriculture

| Vue | Colonnes minimales |
|-----|-------------------|
| `v_agri_nb_expl_par_com` | code, `lib_geo`, `numero_annee`, `ind_val` |
| `v_agri_taux_evol_expl_par_com` | code, `annee`, `ind_val` |
| `v_agri_taux_evol_ann_moy_nb_exploit_annee_rm_com` | `code_insee_concat`, `lib_com`, `annee`, `ind_val` |
| `v_agri_nb_etp_par_com` | code, `annee`, `etp` |
| `v_agri_exploitation_evol_par_com` | code, `lib_commune`, `annee`, `indicateur` (`nb_exploitation_annuel`), `ind_val` |
| `v_agri_sau_par_com` | code, `annee`, `indicateur`, `ind_val` |
| `v_agri_sau_evol_par_com` | code, `lib_commune`, `annee`, `indicateur` (`sau_annuel`), `ind_val` |
| `v_agriculture_indicateurs_production_par_com` | code (`SELECT *`) |
| `v_agri_evol_nb_exploitation_bio_annee_rm_com` | `code_insee_concat`, `lib_com`, `numero_annee`, `nb_exploitation_bio` |

## Comportement si une vue manque

Les repositories **attrapent** l’erreur SQL, journalisent, et renvoient `[]`. L’API répond 200 avec des graphiques vides pour ce bloc. La carte échoue si GeoServer **et** GeoJSON sont absents.

## Adapter une agence

1. Recréer les vues (ou tables) avec **les mêmes noms** dans votre `PGSCHEMA`, **ou** ajouter des alias SQL `CREATE VIEW v_xxx AS SELECT ...`.
2. Si vos colonnes d’identité diffèrent, étendre `VUE_COLUMNS`.
3. Fournir un WFS ou un GeoJSON dont les `code_insee_concat` matchent `site.ts` (`communeCodes`).
4. Option : charger le jeu d’essai, vérifier l’UI, puis remplacer par vos vues métier.
