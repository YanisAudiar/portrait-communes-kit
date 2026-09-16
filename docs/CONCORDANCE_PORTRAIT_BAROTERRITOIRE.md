# Tableau de concordance Portrait de commune ↔ Baroterritoire

Ce document décrit la correspondance entre les indicateurs de l'application **Portrait de commune** et ceux de **Baroterritoire**, afin d'identifier les opportunités de mutualisation des vues PostgreSQL.

> **Colonnes par vue** : Les noms de colonnes (code_insee_concat/code_geo, lib_com/lib_geo) varient selon les vues. La configuration centralisée se trouve dans `backend/config/vueColumnConventions.ts`. Pour adapter une nouvelle vue, ajouter une entrée dans `VUE_COLUMNS`.

---

## Schéma cible pour Portrait de commune

**Portrait de commune doit utiliser les vues du schéma `_a_vues_baro_territoires_dev`** (Baroterritoire) pour mutualiser les données et réduire la duplication des vues.

**Configuration actuelle :** `PGSCHEMA=_a_vues_portrait_commune` (vues dédiées Portrait de commune)  
**Configuration cible :** `PGSCHEMA=_a_vues_baro_territoires_dev` (vues Baroterritoire)

Pour l'échelle commune, les vues Baroterritoire utilisent le suffixe `_par_com` (ex. `v_demo_pop_evol_par_com`).

---

## Tableau de concordance

| ID Portrait | Indicateur Portrait | Type graphique | Source Portrait | Indicateur Baroterritoire | Thème Baroterritoire | Vue PostgreSQL Baroterritoire | Réutilisable ? |
|-------------|---------------------|----------------|-----------------|---------------------------|----------------------|-------------------------------|----------------|
| demo-evol-pop | Évolution du nombre d'habitants | Barres | evolution_population | evol_population ou evol_population_totale | demographie-population | v_demo_pop_evol_par_{echelle} | Oui |
| demo-taux-evol | Taux d'évolution annuel moyen | Barres (%) | evolution_population | tx_evol_annuel_moyen ou evol_population | demographie-population | v_demo_pop_evol_multi_echelle / v_demo_pop_evol_par_{echelle} | Oui |
| demo-naissances-deces | Évolution naissances et décès domiciliés | Courbes | naissances_deces | taux_natalite_mortalite | demographie-decomposition-evol | v_demo_naissances_deces_par_{echelle} | Oui |
| demo-solde-naturel-migratoire | Évolution démographique annuelle moyenne | Barres empilées horizontales | solde_naturel_migratoire | evol_annuelle_moyenne_pop | demographie-decomposition-evol | v_demo_solde_nat_solde_mig_app_par_{echelle} | Oui |
| demo-pyramide | Pyramide des âges | Pyramide | pyramide_ages | pyramide_ages | demographie-age | v_demo_rm_pyram_ages_par_{echelle} | Oui |
| demo-evolution-age | Évolution nb personnes 60+ et <20 ans | Courbes | evolution_age | — | — | — | **Non** |
| demo-indice-jeunesse | Évolution de l'indice de jeunesse | Barres | indice_jeunesse | indice_jeunesse | demographie-age | v_demo_indicateurs_jeunesse_evol_par_{echelle} | Oui |
| demo-repartition-menages | Répartition ménages par types | Donut | repartition_menages | repartition_taille_menages | demographie-menages | v_demo_rep_menages_type_par_{echelle} | Oui |
| demo-taille-menages | Évolution taille moyenne des ménages | Barres | taille_menages | evol_taille_menages | demographie-menages | v_demo_evol_taille_moy_menages_par_{echelle} | Oui |
| demo-repartition-activite-15-64 | Répartition 15-64 ans par type d'activité | Donut | repartition_activite_15_64 | repartition_pop_active_type_act | emploi-pop-active | v_demo_rep_pop_active_type_act_par_{echelle} | Oui |

---

## Synthèse

### Indicateurs réutilisables : 9/10

Les vues Baroterritoire peuvent servir pour Portrait de commune si les structures de données (colonnes, noms, formats) sont compatibles.

**Points à vérifier :**

- **Noms de colonnes** : Portrait de commune peut utiliser d'autres noms (ex. `pop` vs `nb_hab`, `annee` vs `numero_annee`).
- **Échelles** : Baroterritoire utilise `com`, `epci`, `scot` ; Portrait de commune peut être limité à la commune.
- **Préfixes des vues** : Baroterritoire utilise `v_demo_*` ; Portrait de commune utilise `evolution_population`, `naissances_deces`, etc. Il faudra soit des vues communes, soit des vues ou alias qui pointent vers les mêmes données.

### Indicateur non disponible : 1/10

**demo-evolution-age** (évolution du nombre de personnes 60+ et <20 ans en courbes) : Baroterritoire propose :

- `repartition_age` : répartition par tranche d'âge (snapshot)
- `indicateurs_age` : parts des <20 ans et 60+ ans (snapshot)
- `indice_jeunesse` : évolution de l'indice de jeunesse

Il n'y a pas d'indicateur dédié pour l'évolution temporelle des effectifs 60+ et <20 ans. Pour le reproduire, il faudrait une vue type `v_demo_evol_pop_m20_p60_par_{echelle}` ou une agrégation à partir de `v_demo_pop_ta6_par_{echelle}`.

---

## Recommandations pour mutualiser les vues

1. **Vérifier les schémas** : comparer les colonnes des vues Portrait de commune avec celles de Baroterritoire (ex. `annee` / `numero_annee`, `pop` / `nb_hab`, `lib_men_type` / `type_menage`).

2. **Convention de nommage** : si les deux observatoires partagent la même base, envisager des vues communes ou des vues Baroterritoire utilisées comme source par Portrait de commune.

3. **Indicateur manquant** : créer une vue `evolution_age` (ou équivalent) pour l'évolution des 60+ et <20 ans si Portrait de commune en a besoin.

---

## Migration vers _a_vues_baro_territoires_dev

### Migration effectuée (démographie uniquement)

Le schéma `_a_vues_baro_territoires_dev` est utilisé **uniquement pour la démographie**. Les autres thèmes restent sur `_a_vues_portrait_commune`.

- **PGSCHEMA** : `_a_vues_portrait_commune` (par défaut, autres thèmes)
- **PGSCHEMA_DEMOGRAPHIE** : `_a_vues_baro_territoires_dev` (démographie)
- **DemographieRepository.ts** : vues Baroterritoire (suffixe `_par_com`)
- **database.ts** : indicateurs ménages
- **communeController.ts** : référence source

### Correspondance des vues appliquée

| Source Portrait (ancien) | Vue Baroterritoire |
|-------------------------|--------------------|
| v_demo_indicateurs_pop_par_com_yl | v_demo_pop_evol_par_com |
| v_demo_naissances_deces_par_com_yl | v_demo_naissances_deces_par_com |
| v_demo_solde_naturel_migratoire_par_com_yl | v_demo_solde_nat_solde_mig_app_par_com |
| v_demo_pyram_ages_par_com_yl | v_demo_rm_pyram_ages_par_com |
| v_demo_indice_jeunesse_par_com_yl | v_demo_indicateurs_jeunesse_evol_par_com |
| v_demo_rep_menages_type_par_com_yl | v_demo_rep_menages_type_par_com |
| v_demo_taille_moy_men_par_com_yl | v_demo_evol_taille_moy_menages_par_com |
| v_demo_indicateurs_menages_par_com_yl | v_demo_indicateurs_menages_par_com |
| v_demo_evolution_age_par_com_yl | **v_demo_pop_evo_ages_multi_periodes_par_com** (prioritaire) ; repli `v_demo_pop_ta6_par_com` (agrégation) |
| v_demo_pop_active_15_64_par_com | v_demo_indicateurs_pop_active_1564_par_com |
| v_demo_pop_active_type_act_par_com | v_demo_rep_pop_active_type_act_par_com |

**Note évolution âge** : le graphique *demo-evolution-age* lit en priorité `v_demo_pop_evo_ages_multi_periodes_par_com` (`groupe_age`, `annee_fin`, `pop_fin_periode` → `pop_moins_20ans` / `pop_plus_60ans` par fin de période intercensitaire). Si la vue est vide ou absente, repli sur l’agrégation `v_demo_pop_ta6_par_com` (`lib_ta6`), puis `v_demo_evolution_age_par_com_yl`.

---

## Concordance Habitat – Portrait de commune ↔ Baroterritoire

### Parc de logements

| ID Portrait | Indicateur Portrait | Type | Vue Portrait | Indicateur Baroterritoire | Thème Baro | Vue Baroterritoire | Colonnes Baro | Réutilisable ? |
|-------------|---------------------|------|--------------|---------------------------|------------|--------------------|---------------|----------------|
| habitat-statut-occupation | Répartition logements par statut d'occupation | Donut | v_habitat_rp_statut_occup_par_com_yl | evol_statut_occupation_logement ou comp_statut_occupation_logement | parc-logement | v_habitat_evol_statut_occupation_logement_par_com | statut_occup, nb_logements, numero_annee | Oui (vérifier noms) |
| habitat-evol-rp | Évolution du nombre de résidences principales | Barres | v_habitat_evol_nb_rp_par_com_yl | — | — | — | — | **Non** |

### Construction

| ID Portrait | Indicateur Portrait | Type | Vue Portrait | Indicateur Baroterritoire | Thème Baro | Vue Baroterritoire | Colonnes Baro | Réutilisable ? |
|-------------|---------------------|------|--------------|---------------------------|------------|--------------------|---------------|----------------|
| habitat-logements-commences | Évolution logements neufs commencés | Barres | v_habitat_evol_nb_logts_commences_par_com_yl | evol_nb_logts_commences | construction-logements | v_habitat_evol_nb_logts_commences_par_com | annee, nb_logts_commences | Oui |

### Marché de l'habitat

| ID Portrait | Indicateur Portrait | Type | Vue Portrait | Indicateur Baroterritoire | Thème Baro | Vue Baroterritoire | Colonnes Baro | Réutilisable ? |
|-------------|---------------------|------|--------------|---------------------------|------------|--------------------|---------------|----------------|
| habitat-evol-logts-commences | Évolution logements neufs commencés | Barres | v_habitat_evol_logts_commences_par_com | evol_nb_logts_commences | construction-logements | v_habitat_evol_nb_logts_commences_par_com | annee, nb_logts_commences | Oui |
| habitat-evol-ventes-occasion-type | Évolution ventes occasion par type (Maison/Appartement) | Barres empilées | v_habitat_evol_ventes_occasion_type_par_com_yl | — | — | — | — | **Non** |

### KPIs Habitat

| KPI Portrait | Libellé | Vue Portrait | Indicateur Baroterritoire | Vue Baro | Colonnes Baro |
|--------------|---------|---------------|---------------------------|----------|---------------|
| Nombre de logements | Parc en année N | v_habitat_indicateurs_logts_rp_par_com_yl | indicateurs_logts | v_habitat_indicateurs_logts_par_com | nb_logts, numero_annee |
| Part des propriétaires occupants | En % | idem | indicateurs_rp | v_habitat_indicateurs_rp_par_com | part_rp_prop_occup, numero_annee |
| Part des maisons individuelles | En % des RP | idem | indicateurs_logts | v_habitat_indicateurs_logts_par_com | part_maisons_ind, numero_annee |
| Logements neufs commencés | Année N | v_habitat_indicateurs_logt_commences_par_com_yl | indicateurs_logt_commences | v_habitat_indicateurs_constr_par_com | nb_logts_commences, numero_annee |
| Logements neufs commencés (moyenne 4 ans) | — | idem | indicateurs_logt_commences | idem | nb_logts_commences_moy_4ans |
| Part du collectif (moyenne 4 ans) | — | v_habitat_indicateurs_construction_ventes_par_com_yl | indicateurs_logt_commences | v_habitat_indicateurs_constr_par_com | part_collectif_logts_commences_moy_4ans |
| Logements d'occasion vendus (moyenne 4 ans) | — | idem | indicateurs_occasion | v_habitat_indicateurs_occasion_par_com | nb_logts_vendus_moy_4ans |

### Détails sur les écarts Habitat

#### 1. habitat-evol-rp (évolution des résidences principales)

Baroterritoire n'a pas de vue dédiée à l'évolution du nombre de RP. Il propose :

- `evol_categorie_logement` : évolution par catégorie (RP, RS, vacants, etc.) avec `nb_logements`, `categorie_logement`, `numero_annee`
- `evol_statut_occupation_logement` : évolution par statut d'occupation (propriétaire, locataire, etc.)

Pour reproduire l'évolution des RP, il faudrait soit filtrer `evol_categorie_logement` sur la catégorie RP, soit créer une vue équivalente à `v_habitat_evol_nb_rp_par_com_yl`.

#### 2. habitat-evol-ventes-occasion-type (Maison/Appartement empilés)

Baroterritoire a des vues séparées :

- `evol_nb_maisons_occasion` → `v_habitat_evol_prix_vol_maison_occas_par_com` : annee, nb_maisons_vendues
- `evol_nb_apparts_occasion` → `v_habitat_evol_prix_vol_appart_occas_par_com` : annee, nb_apparts_vendus

Pour un graphique empilé Maison/Appartement, il faudrait une vue type `v_habitat_evol_ventes_occasion_type_par_com` ou une jointure/agrégation des deux vues.

### Vues Habitat utilisées en interne

| Vue Portrait | Équivalent Baroterritoire |
|--------------|---------------------------|
| v_habitat_indicateurs_logts_par_com | v_habitat_indicateurs_logts_par_com |
| v_habitat_indicateurs_rp_par_com | v_habitat_indicateurs_rp_par_com |
| v_habitat_rep_occasion_nb_logts_vendus_type_par_com | Pas d'équivalent direct ; Baro a evol_nb_maisons_occasion et evol_nb_apparts_occasion séparés |
| v_habitat_indicateurs_occasion_par_com_yl | v_habitat_indicateurs_occasion_par_com |

### Colonnes principales Habitat (échelle commune)

| Vue Baroterritoire | Colonnes principales |
|--------------------|----------------------|
| v_habitat_indicateurs_logts_par_com | code_geo, numero_annee, nb_logts, part_maisons_ind |
| v_habitat_indicateurs_rp_par_com | code_geo, numero_annee, nb_rp, part_rp_prop_occup |
| v_habitat_evol_statut_occupation_logement_par_com | code_geo, numero_annee, statut_occup, nb_logements |
| v_habitat_indicateurs_constr_par_com | code_geo, numero_annee, nb_logts_commences, nb_logts_commences_moy_4ans, part_collectif_logts_commences_moy_4ans |
| v_habitat_evol_nb_logts_commences_par_com | code_geo, annee, nb_logts_commences |
| v_habitat_indicateurs_occasion_par_com | code_geo, numero_annee, nb_logts_vendus, nb_logts_vendus_moy_4ans |
| v_habitat_evol_prix_vol_maison_occas_par_com | code_geo, annee, nb_maisons_vendues, prix_moyen_maison, lib_geo |
| v_habitat_evol_prix_vol_appart_occas_par_com | code_geo, annee, nb_apparts_vendus, prix_moyen_m2_appart, lib_geo |

**Filtre commune** : Baroterritoire utilise `code_insee_concat` et `lib_com` pour démographie et habitat (schéma `_a_vues_baro_territoires_dev`).

### Migration Habitat effectuée

Le schéma `_a_vues_baro_territoires_dev` est utilisé pour les indicateurs Habitat réutilisables via `PGSCHEMA_HABITAT`.

| Source Portrait | Vue Baroterritoire | Statut |
|-----------------|--------------------|--------|
| v_habitat_rp_statut_occup_par_com_yl | v_habitat_evol_statut_occupation_logement_par_com | Migré (nb_logements → nb_rp) |
| v_habitat_evol_nb_rp_par_com_yl | — | Reste Portrait (non dispo Baro) |
| v_habitat_indicateurs_logts_par_com + v_habitat_indicateurs_rp_par_com | idem Baro | Migré |
| v_habitat_evol_nb_logts_commences_par_com_yl | v_habitat_evol_nb_logts_commences_par_com | Migré |
| v_habitat_rep_occasion_nb_logts_vendus_type_par_com | — | Reste Portrait |
| v_habitat_indicateurs_occasion_par_com_yl | v_habitat_indicateurs_occasion_par_com | Migré |
| v_habitat_indicateurs_logt_commences_par_com_yl | v_habitat_indicateurs_constr_par_com | Migré |
| v_habitat_indicateurs_logts_rp_par_com_yl | JOIN indicateurs_logts + indicateurs_rp | Migré |
| v_habitat_indicateurs_construction_ventes_par_com_yl | — | Reste Portrait (structure complexe) |
| v_habitat_evol_logts_commences_par_com | v_habitat_evol_nb_logts_commences_par_com | Migré |
| v_habitat_evol_ventes_occasion_type_par_com_yl | — | Reste Portrait |

---

## Concordance Solidarité – Portrait de commune ↔ Baroterritoire

### Mapping des vues

| Source Portrait | Vue Baroterritoire | Colonnes Baro | Statut |
|-----------------|--------------------|---------------|--------|
| v_solidarite_indicateurs_filosofi_par_com | v_social_indicateurs_filosofi_par_com | code_insee_concat, lib_com, numero_annee, indicateurs, val | À migrer |
| v_solidarite_indicateurs_filosofi_par_com_partiel | v_social_indicateurs_filosofi_par_com (filtre) ou pivot | indicateurs, val, numero_annee | À vérifier |
| v_solidarite_indicateurs_filosofi_par_com_2022 | v_social_indicateurs_filosofi_par_com (filtre année) | idem | KPIs |
| v_solidarite_evol_alloc_dependants_par_com | v_social_dependants_presta50_100_par_com | nb_alloc_dep_presta = tr50pfrb + tr100pfrb | Agrégation SQL |
| v_social_dependants_presta50_100_par_com | v_social_dependants_presta50_100_par_com | tr50pfrb, tr100pfrb, numero_annee | Déjà utilisé |

### Migration Solidarité

Voir `docs/MIGRATION_SOLIDARITE_BAROTERRITOIRE.md` et `backend/repositories/SolidariteRepository.ts`.

| Variable | Valeur |
|---------|--------|
| PGSCHEMA_SOLIDARITE | _a_vues_baro_territoires_dev |

---

## Concordance Agriculture – Portrait de commune ↔ Baroterritoire

### Indicateurs et vues Baroterritoire (référence)

**Thème agriculture-exploitations** : indicateurs_exploitations, evol_ann_moy_nb_exploitations, taux_evolution_sieges_exploitations, effectif_etp_main_oeuvre, evolution_exploitations, evol_taille_exploitations

**Thème agriculture-surfaces** : indicateurs_surfaces, evol_sau

**Thème agriculture-production** : indicateurs_production

### Mapping des vues

| Indicateur Baro | Vue Baroterritoire | Colonnes principales | Usage Portrait |
|-----------------|--------------------|----------------------|----------------|
| indicateurs_exploitations | v_agri_nb_expl_par_{echelle} | numero_annee, ind_val | KPI nb sièges exploitations |
| evol_ann_moy_nb_exploitations | v_agri_taux_evol_expl_par_{echelle} | annee, ind_val | KPI taux évolution |
| taux_evolution_sieges_exploitations | v_agri_taux_evol_ann_moy_nb_exploit_annee_par_{echelle} | numero_annee, ind_val | KPI taux évolution sièges |
| effectif_etp_main_oeuvre | v_agri_nb_etp_par_{echelle} | annee, etp | KPI + graphique ETP |
| evolution_exploitations | v_agri_exploitation_evol_par_{echelle} | annee, ind_val | Graphique barres |
| evol_taille_exploitations | v_agri_evol_taille_par_{echelle} | annee, lib_taille_exploitation_long, nb_exploit | Graphique (EPCI/SCOT uniquement) |
| indicateurs_surfaces | v_agri_sau_par_{echelle} | annee, indicateur, ind_val | KPIs SAU, part SAU, evol_sau |
| evol_sau | v_agri_sau_evol_par_{echelle} | annee, ind_val | Graphique évolution SAU |
| indicateurs_production | v_agriculture_indicateurs_production_par_{echelle} | dynamique | Non utilisé |

### Vues utilisées par Portrait Communes V2 (AgricultureRepository)

| Vue | Échelles | Statut |
|-----|----------|--------|
| v_agri_nb_expl_par_com | com | Utilisé |
| v_agri_taux_evol_expl_par_com | com | Utilisé |
| v_agri_taux_evol_ann_moy_nb_exploit_annee_par_com | com | Utilisé |
| v_agri_nb_etp_par_com | com | Utilisé |
| v_agri_exploitation_evol_par_com | com | Utilisé |
| v_agri_sau_par_com | com | Utilisé |
| v_agriculture_indicateurs_production_par_com | com | Utilisé |
| v_agri_evol_taille_par_com | — | Non (EPCI/SCOT uniquement en Baro) |
| v_agri_sau_evol_par_com | com | Non utilisé (Portrait utilise v_agri_sau_par_com) |

### Migration Agriculture

| Variable | Valeur |
|---------|--------|
| PGSCHEMA_AGRICULTURE | _a_vues_baro_territoires_dev |

Voir `docs/VIEWS_INDICATEURS_AGRICULTURE.md` pour le détail complet.
