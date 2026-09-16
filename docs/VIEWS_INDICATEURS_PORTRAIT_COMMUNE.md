# Documentation des Vues et Indicateurs - Portrait Commune

> **Obsolète.** Les noms de vues `_2022` ne correspondent plus au code 2026.
> Contrat actuel : [`CONTRAT_DONNEES.md`](CONTRAT_DONNEES.md).

Ce document présente de manière exhaustive toutes les vues PostgreSQL utilisées, leurs indicateurs associés, les colonnes exploitées et le type de graphique Chart.js utilisé pour leur visualisation.

---

## 1. DÉMOGRAPHIE (Demo)

### 1.1 Sous-thème : Évolution de la Population

#### Vue 1: `v_demo_indicateurs_pop_par_com_2022`
**Schéma**: `_a_vues_portrait_commune`

| Colonne | Description | Utilisation |
|---------|-------------|-------------|
| code_com | Code commune | Clé de filtre |
| lib_com | Libellé commune | Label |
| annee | Année | Groupement |
| borne_temp | Période temporelle | Affichage info |
| pop | Population | Mesure principale |
| tx_evol | Taux d'évolution | Mesure |
| gain_pop_annuel | Gain annuel de population | Mesure |

**Indicateurs affichés:**
- Population (valeur + année)
- Taux d'évolution par an (valeur + période)
- Gain d'habitants par an (valeur + période)

**Graphiques:**

| ID | Type Chart.js | Titre |
|----|---------------|-------|
| chart-1 | bar | Évolution du nombre d'habitants |
| chart-2 | bar | Taux d'évolution annuel moyen |

---

#### Vue 2: `v_demo_naissances_deces_par_com_2022`
**Schéma**: `_a_vues_portrait_commune`

| Colonne | Description | Utilisation |
|---------|-------------|-------------|
| code_insee_concat | Code INSEE | Clé de filtre |
| lib_com | Libellé commune | Label |
| annee | Année | Groupement |
| solde_migratoire | Solde migratoire | Indicateur |
| nb_deces | Nombre de décès | Mesure |
| nb_naissances | Nombre de naissances | Mesure |

**Graphique:**

| ID | Type Chart.js | Titre |
|----|---------------|-------|
| chart-3 | line | Évolution du nombre de naissances et de décès domiciliés |

---

#### Vue 3: `v_demo_solde_naturel_migratoire_par_com_2022`
**Schéma**: `_a_vues_portrait_commune`

| Colonne | Description | Utilisation |
|---------|-------------|-------------|
| code_insee_concat | Code INSEE | Clé de filtre |
| borne_temporelle | Période | Groupement |
| solde_naturel | Solde naturel | Mesure |
| solde_migratoire_apparent | Solde migratoire apparent | Mesure |

**Indicateurs affichés:**
- Gain de population
- Solde naturel
- Solde migratoire apparent

**Graphique:**

| ID | Type Chart.js | Titre |
|----|---------------|-------|
| chart-4 | horizontalBar | Évolution démographique annuelle moyenne |

---

### 1.2 Sous-thème : Âge de la Population

#### Vue 4: `v_demo_pyram_ages_par_com_2022`
**Schéma**: `_a_vues_portrait_commune`

| Colonne | Description | Utilisation |
|---------|-------------|-------------|
| code_insee_concat | Code INSEE | Clé de filtre |
| numero_annee | Année | Filtre/Groupement |
| lib_ta21 | Tranche d'âge | Groupement |
| pop_h | Population hommes | Mesure |
| pop_f | Population femmes | Mesure |

**Graphique:**

| ID | Type Chart.js | Titre |
|----|---------------|-------|
| chart-5 | horizontalBar (pyramide) | Pyramide des âges |

---

#### Vue 5: `v_demo_indice_jeunesse_par_com_2022`
**Schéma**: `_a_vues_portrait_commune`

| Colonne | Description | Utilisation |
|---------|-------------|-------------|
| code_insee_concat | Code INSEE | Clé de filtre |
| lib_com | Libellé commune | Label |
| annee | Année | Groupement |
| indice_jeunesse | Indice de jeunesse | Mesure |

**Graphique:**

| ID | Type Chart.js | Titre |
|----|---------------|-------|
| chart-6 | bar | Évolution de l'indice de jeunesse |

---

#### Vue 6: `v_demo_indicateurs_age_par_com_2022`
**Schéma**: `_a_vues_portrait_commune`

| Colonne | Description | Utilisation |
|---------|-------------|-------------|
| code_insee_concat | Code INSEE | Clé de filtre |
| numero_annee | Année | Affichage |
| pop_part_m20ans | Part des moins de 20 ans | Indicateur |
| pop_part_p60ans | Part des plus de 60 ans | Indicateur |
| ind_jeunesse | Indice de jeunesse | Indicateur |

**Indicateurs affichés:**
- Part des moins de 20 ans (%)
- Part des plus de 60 ans (%)
- Indice de jeunesse

---

### 1.3 Sous-thème : Ménages

#### Vue 7: `v_demo_rep_menages_type_par_com_2022`
**Schéma**: `_a_vues_portrait_commune`

| Colonne | Description | Utilisation |
|---------|-------------|-------------|
| code_insee_concat | Code INSEE | Clé de filtre |
| lib_com | Libellé commune | Label |
| numero_annee | Année | Affichage |
| lib_type_men | Type de ménage | Groupement |
| nb_men | Nombre de ménages | Mesure |

**Graphique:**

| ID | Type Chart.js | Titre |
|----|---------------|-------|
| chart-7 | doughnut | Répartition du nombre de ménages par types |

---

#### Vue 8: `v_demo_taille_moy_men_par_com_2022`
**Schéma**: `_a_vues_portrait_commune`

| Colonne | Description | Utilisation |
|---------|-------------|-------------|
| code_insee_concat | Code INSEE | Clé de filtre |
| lib_com | Libellé commune | Label |
| numero_annee | Année | Groupement |
| taille_moy_men | Taille moyenne des ménages | Mesure |

**Graphique:**

| ID | Type Chart.js | Titre |
|----|---------------|-------|
| chart-8 | bar | Évolution de la taille moyenne des ménages |

---

#### Vue 9: `v_demo_indicateurs_menages_par_com_2022`
**Schéma**: `_a_vues_portrait_commune`

| Colonne | Description | Utilisation |
|---------|-------------|-------------|
| code_insee_concat | Code INSEE | Clé de filtre |
| lib_com | Libellé commune | Label |
| numero_annee | Année | Affichage |
| nb_men | Nombre de ménages | Indicateur |
| part_personnes_seules_men | Part personnes seules | Indicateur |
| taille_moy_men | Taille moyenne | Indicateur |

**Indicateurs affichés:**
- Nombre de ménages
- Taille moyenne des ménages
- Part des personnes seules (%)

---

## 2. HABITAT

### 2.1 Sous-thème : Parc de Logements

#### Vue 10: `v_habitat_rp_type_occup_par_com_2022`
**Schéma**: `_a_vues_portrait_commune`

| Colonne | Description | Utilisation |
|---------|-------------|-------------|
| code_insee_concat | Code INSEE | Clé de filtre |
| lib_com | Libellé commune | Label |
| numero_annee | Année | Affichage |
| type_occup | Type d'occupation | Groupement |
| nb_rp | Nb résidences principales | Mesure |

**Graphique:**

| ID | Type Chart.js | Titre |
|----|---------------|-------|
| chart-habitat-1 | doughnut | Répartition du nombre de logements selon le statut d'occupation |

---

#### Vue 11: `v_habitat_rm_evol_nb_logts_rp_par_com`
**Schéma**: `_a_vues_baro`

| Colonne | Description | Utilisation |
|---------|-------------|-------------|
| code_insee_concat | Code INSEE | Clé de filtre |
| lib_com | Libellé commune | Label |
| numero_annee | Année | Groupement |
| nb_logts_rp | Nb logements RP | Mesure |

**Graphique:**

| ID | Type Chart.js | Titre |
|----|---------------|-------|
| chart-habitat-2 | bar | Évolution du nombre de résidences principales |

---

#### Vue 12: `v_habitat_indicateurs_logts_par_com_2022` + `v_habitat_indicateurs_rp_par_com_2022`
**Schéma**: `_a_vues_portrait_commune`

| Colonne | Description | Utilisation |
|---------|-------------|-------------|
| nb_logts | Nombre de logements | Indicateur |
| part_maisons_ind | Part maisons individuelles | Indicateur |
| part_rp_prop_occup | Part propriétaires occupants | Indicateur |

**Indicateurs affichés:**
- Nombre de logements dans le parc
- Part des propriétaires occupants (%)
- Part des maisons individuelles (%)

---

### 2.2 Sous-thème : Marché de l'Habitat

#### Vue 13: `v_habitat_evol_nb_logts_commences_par_com_2022`
**Schéma**: `_a_vues_portrait_commune`

| Colonne | Description | Utilisation |
|---------|-------------|-------------|
| code_insee_concat | Code INSEE | Clé de filtre |
| lib_com | Libellé commune | Label |
| annee | Année | Groupement |
| nb_logts_commences | Nb logements commencés | Mesure |

**Graphique:**

| ID | Type Chart.js | Titre |
|----|---------------|-------|
| chart-habitat-3 | bar | Évolution du nombre de logements neufs commencés |

---

#### Vue 14: `v_habitat_rep_occasion_nb_logts_vendus_type_par_com_2022`
**Schéma**: `_a_vues_portrait_commune`

| Colonne | Description | Utilisation |
|---------|-------------|-------------|
| code_insee_concat | Code INSEE | Clé de filtre |
| lib_com | Libellé commune | Label |
| numero_annee | Année | Groupement |
| nb_maison_occasions_vendus | Nb maisons vendues | Mesure |
| nb_appart_occasions_vendus | Nb appartements vendus | Mesure |

**Graphique:**

| ID | Type Chart.js | Titre |
|----|---------------|-------|
| chart-habitat-4 | bar (stacked) | Évolution du nombre de logements d'occasion vendus par type |

---

#### Vue 15: `v_habitat_indicateurs_occasion_par_com_2022`
**Schéma**: `_a_vues_portrait_commune`

| Colonne | Description | Utilisation |
|---------|-------------|-------------|
| nb_logts_vendus | Nb logements vendus | Indicateur |
| nb_logts_vendus_moy_4ans | Moyenne 4 ans | Indicateur |
| part_collectif_logts_vendus_moy_4ans | Part collectif | Indicateur |

**Indicateurs affichés:**
- Nombre de logements d'occasion vendus (moyenne 4 ans)
- Part du collectif dans cette moyenne (%)

---

#### Vue 16: `v_habitat_indicateurs_logt_commences_par_com_2022`
**Schéma**: `_a_vues_portrait_commune`

| Colonne | Description | Utilisation |
|---------|-------------|-------------|
| nb_logts_commences | Nb logements commencés | Indicateur |
| nb_logts_commences_moy_4ans | Moyenne 4 ans | Indicateur |

**Indicateurs affichés:**
- Nombre de logements neufs commencés (moyenne 4 ans)

---

## 3. ÉCONOMIE (Eco)

### 3.1 Sous-thème : Établissements

#### Vue 17: `v_economie_rep_etabl_sect_par_com_2022`
**Schéma**: `_a_vues_portrait_commune`

| Colonne | Description | Utilisation |
|---------|-------------|-------------|
| code_insee_concat | Code INSEE | Clé de filtre |
| lib_com | Libellé commune | Label |
| numero_annee | Année | Affichage |
| lib_cat5 | Catégorie d'activité | Groupement |
| nb_etabl_cmna | Nb établissements | Mesure |

**Indicateurs affichés:**
- Nombre de créations d'établissements

**Graphique:**

| ID | Type Chart.js | Titre |
|----|---------------|-------|
| chart-eco-1 | doughnut | Répartition du nombre de créations d'établissements par type d'activité |

---

#### Vue 18: `v_economie_evol_crea_etabl_par_com_2022`
**Schéma**: `_a_vues_portrait_commune`

| Colonne | Description | Utilisation |
|---------|-------------|-------------|
| code_insee_concat | Code INSEE | Clé de filtre |
| lib_com | Libellé commune | Label |
| numero_annee | Année | Groupement |
| nb_crea_etabl | Nb créations | Mesure |
| tx_crea_etab | Taux de création | Indicateur |

**Indicateurs affichés:**
- Taux de création d'établissements (%)

**Graphique:**

| ID | Type Chart.js | Titre |
|----|---------------|-------|
| chart-eco-2 | bar | Évolution du nombre de créations d'établissements |

---

#### Vue 19: `v_economie_indicateurs_surf_loc_aut_par_com_2022`
**Schéma**: `_a_vues_portrait_commune`

| Colonne | Description | Utilisation |
|---------|-------------|-------------|
| code_insee_concat | Code INSEE | Clé de filtre |
| lib_com | Libellé commune | Label |
| numero_annee | Année | Affichage |
| surf_loc_aut_m2 | Surface locaux autorisés | Indicateur |

**Indicateurs affichés:**
- Surface des locaux d'activité autorisés (m²)

---

## 4. EMPLOI

### 4.1 Sous-thème : Emplois

#### Vue 20: `v_emploi_nb_emplois_csp_par_com_2022`
**Schéma**: `_a_vues_portrait_commune`

| Colonne | Description | Utilisation |
|---------|-------------|-------------|
| code_insee_concat | Code INSEE | Clé de filtre |
| lib_com | Libellé commune | Label |
| numero_annee | Année | Affichage |
| lib_csp | Catégorie socioprofessionnelle | Groupement |
| nb_emplois | Nombre d'emplois | Mesure |

**Graphique:**

| ID | Type Chart.js | Titre |
|----|---------------|-------|
| chart-emploi-2 | doughnut | Répartition des emplois par catégorie socioprofessionnelle |

---

#### Vue 21: `v_emploi_nb_emplois_sect_act_par_com_2022`
**Schéma**: `_a_vues_portrait_commune`

| Colonne | Description | Utilisation |
|---------|-------------|-------------|
| code_insee_concat | Code INSEE | Clé de filtre |
| lib_com | Libellé commune | Label |
| numero_annee | Année | Affichage |
| lib_sect_act | Secteur d'activité | Groupement |
| nb_emplois | Nombre d'emplois | Mesure |

**Indicateurs affichés:**
- Part de l'emploi agricole (%)

**Graphique:**

| ID | Type Chart.js | Titre |
|----|---------------|-------|
| chart-emploi-3 | doughnut | Répartition des emplois par secteur d'activité |

---

#### Vue 22: `v_emploi_indicateurs_emplois_par_com_2022`
**Schéma**: `_a_vues_portrait_commune`

| Colonne | Description | Utilisation |
|---------|-------------|-------------|
| code_insee_concat | Code INSEE | Clé de filtre |
| lib_com | Libellé commune | Label |
| numero_annee | Année | Groupement |
| borne_temp | Période temporelle | Affichage |
| nb_emplois | Nombre d'emplois | Mesure/Indicateur |
| evol_emplois | Évolution emplois | Indicateur |

**Indicateurs affichés:**
- Nombre d'emplois total
- Taux d'évolution des emplois (%)

**Graphique:**

| ID | Type Chart.js | Titre |
|----|---------------|-------|
| chart-emploi-1 | bar | Évolution du nombre d'emplois total |

---

#### Vue 23: `v_emploi_actifs_occup_loc_emploi_par_com_2022`
**Schéma**: `_a_vues_portrait_commune`

| Colonne | Description | Utilisation |
|---------|-------------|-------------|
| code_insee_concat | Code INSEE | Clé de filtre |
| lib_com | Libellé commune | Label |
| numero_annee | Année | Affichage |
| lib_loc_emploi | Lieu de travail | Groupement |
| nb_actifs_occup | Nb actifs occupés | Mesure |

**Graphique:**

| ID | Type Chart.js | Titre |
|----|---------------|-------|
| chart-emploi-4 | doughnut | Répartition des actifs en emploi par lieu de travail |

---

## 5. FORMATION

### 5.1 Sous-thème : Premier Degré

#### Vue 24: `v_formation_evol_primaire_eleves_classes_par_com_2022`
**Schéma**: `_a_vues_portrait_commune`

| Colonne | Description | Utilisation |
|---------|-------------|-------------|
| code_insee_concat | Code INSEE | Clé de filtre |
| lib_com | Libellé commune | Label |
| numero_annee | Année | Groupement |
| nb_eleves_pre_elementaire | Nb élèves pré-élémentaire | Mesure |
| nb_eleves_elementaire | Nb élèves élémentaire | Mesure |
| nb_classes_pre_elementaire | Nb classes pré-élémentaire | Info |
| nb_classes_elementaire | Nb classes élémentaire | Info |

**Graphique:**

| ID | Type Chart.js | Titre |
|----|---------------|-------|
| chart-formation-1 | line | Évolution du nombre d'élèves du premier degré |

---

#### Vue 25: `v_formation_indicateurs_primaire_par_com_2022`
**Schéma**: `_a_vues_portrait_commune`

| Colonne | Description | Utilisation |
|---------|-------------|-------------|
| code_insee_concat | Code INSEE | Clé de filtre |
| lib_com | Libellé commune | Label |
| numero_annee | Année | Affichage |
| borne_temp | Période | Affichage |
| nb_eleves | Nb élèves | Indicateur |
| nb_classes | Nb classes | Info |
| evol_eleves_4ans | Évolution 4 ans | Indicateur |

**Indicateurs affichés:**
- Nombre d'élèves du premier degré
- Taux d'évolution du nombre d'élèves (%)

---

### 5.2 Sous-thème : Second Degré

#### Vue 26: `v_formation_evol_secondaire_eleves_par_com_2022`
**Schéma**: `_a_vues_portrait_commune`

| Colonne | Description | Utilisation |
|---------|-------------|-------------|
| code_insee_concat | Code INSEE | Clé de filtre |
| lib_com | Libellé commune | Label |
| numero_annee | Année | Groupement |
| nb_eleves_college | Nb élèves collège | Mesure |
| nb_eleves_lycee | Nb élèves lycée | Mesure |

**Graphique:**

| ID | Type Chart.js | Titre |
|----|---------------|-------|
| chart-formation-2 | line | Évolution du nombre d'élèves du second degré |

---

#### Vue 27: `v_formation_indicateurs_secondaire_par_com_2022`
**Schéma**: `_a_vues_portrait_commune`

| Colonne | Description | Utilisation |
|---------|-------------|-------------|
| code_insee_concat | Code INSEE | Clé de filtre |
| lib_com | Libellé commune | Label |
| numero_annee | Année | Affichage |
| nb_eleves_second | Nb élèves secondaire | Indicateur |

**Indicateurs affichés:**
- Nombre d'élèves du second degré

---

## 6. SOLIDARITÉ

### 6.1 Sous-thème : Revenus

#### Vue 28: `v_solidarite_indicateurs_filosofi_par_com_2022`
**Schéma**: `_a_vues_portrait_commune`

| Colonne | Description | Utilisation |
|---------|-------------|-------------|
| code_insee_concat | Code INSEE | Clé de filtre |
| numero_annee | Année | Affichage |
| indicateurs | Nom de l'indicateur | Groupement |
| val | Valeur | Mesure |

**Filtres d'indicateurs utilisés:**
- Médiane du niveau de vie
- Niveau de vie décile 1
- Niveau de vie décile 9
- Part des revenus d'activités
- Part des pensions, retraites et rentes
- Part des revenus du patrimoine et autres
- Part des prestations sociales
- Part des impôts

**Graphiques:**

| ID | Type Chart.js | Titre |
|----|---------------|-------|
| chart-solidarite-1 | horizontalBar | Revenus disponibles par UC |
| chart-solidarite-2 | horizontalBar | Origine des revenus disponibles par UC |

---

#### Vue 29: `v_solidarite_indicateurs_filosofi_par_com_partiel_2022`
**Schéma**: `_a_vues_portrait_commune`

| Colonne | Description | Utilisation |
|---------|-------------|-------------|
| indicateurs | Nom de l'indicateur | Filtre |
| val | Valeur | Indicateur |
| numero_annee | Année | Affichage |

**Indicateurs affichés:**
- Revenu disponible médian par UC (€)
- Part des ménages fiscaux imposés (%)
- Taux de pauvreté au seuil de 60% (%)

---

## 7. GÉOGRAPHIE

#### Vue 30: `v_geo_communes`
**Schéma**: `_a_vues_portrait_commune`

| Colonne | Description | Utilisation |
|---------|-------------|-------------|
| code_insee_concat | Code INSEE | Clé |
| lib_com | Libellé commune | Affichage |

**Utilisation**: Liste des territoires pour la sélection de commune

---

## Récapitulatif

### Types de Graphiques Chart.js

| Type | Occurrences | Utilisation |
|------|-------------|-------------|
| bar | 8 | Évolutions temporelles, comparaisons |
| doughnut | 7 | Répartitions (ménages, emplois, secteurs) |
| horizontalBar | 4 | Pyramides, revenus, soldes |
| line | 3 | Évolutions continues (naissances/décès, élèves) |
| bar (stacked) | 1 | Logements vendus par type |

### Options Chart.js utilisées

| Option | Description |
|--------|-------------|
| chartClassicBarNoLegend | Barres classiques sans légende |
| chartClassicBarPercentNoLegend | Barres pour pourcentages sans légende |
| chartClassicDoughnut | Donut classique |
| chartLine | Graphique ligne |
| chartStackedSum | Barres empilées |
| chartPyramide | Pyramide des âges (barres horizontales) |

### Sources de Données

| Source | Thèmes |
|--------|--------|
| Insee | Démographie, Habitat, Économie, Emploi |
| Insee, état civil | Naissances, décès |
| Insee, REE | Créations d'établissements |
| Insee, FiLoSoFi | Solidarité, revenus |
| Académie de Rennes | Formation |
| Sit@adel2, Audiar | Logements neufs |
| DVF, Audiar | Logements d'occasion vendus |
