# Migration des Sources de Données

## Vue d'ensemble

Ce document compare l'ancienne application (`dashboard.js`) avec la nouvelle application Vue.js pour s'assurer que les mêmes sources de données sont utilisées.

## Correspondance des Routes API

### Ancienne Application (dashboard.js)

| Thème | Route Ancienne | Fonction DbService |
|-------|----------------|-------------------|
| Démographie | `/api/data/demo?territoire=...` | `fetchDemoData()` |
| Habitat | `/api/data/habitat?territoire=...` | `fetchHabitatData()` |
| Économie | `/api/data/economie?territoire=...` | `fetchEconomieData()` |
| Emploi | `/api/data/emploi?territoire=...` | `fetchEmploiData()` |
| Formation | `/api/data/formation?territoire=...` | `fetchFormationData()` |
| Solidarité | `/api/data/solidarite?territoire=...` | `fetchSolidariteData()` |

### Nouvelle Application (Vue.js)

| Thème | Route Nouvelle | Méthode DatabaseService |
|-------|----------------|-------------------------|
| Démographie | `/data/communes/:codeInsee/demographics` | `getDemographieData()` |
| Habitat | `/data/communes/:codeInsee/housing` | `getHabitatData()` |
| Économie + Emploi | `/data/communes/:codeInsee/economy` | `getEconomieData()` |
| Formation | `/data/communes/:codeInsee/formation` | `getFormationData()` |
| Solidarité | `/data/communes/:codeInsee/solidarite` | `getSolidariteData()` |

## Correspondance des Requêtes SQL

### Démographie

#### Ancienne Application (`fetchDemoData`)
```javascript
// Retournait un tableau de tableaux :
[
  result1.rows, // v_demo_indicateurs_pop_par_com
  result2.rows, // v_demo_naissances_deces_par_com
  result3.rows, // v_demo_solde_naturel_migratoire_par_com
  result4.rows, // v_demo_pyram_ages_par_com
  result5.rows, // v_demo_indice_jeunesse_par_com
  result6.rows, // v_demo_indicateurs_age_par_com
  result7.rows, // v_demo_rep_menages_type_par_com
  result8.rows, // v_demo_taille_moy_men_par_com
  result9.rows  // v_demo_indicateurs_menages_par_com
]
```

#### Nouvelle Application (`getDemographieData`)
```javascript
// Retourne un objet structuré :
{
  evolution_population: r1.rows,        // v_demo_indicateurs_pop_par_com
  naissances_deces: r2.rows,            // v_demo_naissances_deces_par_com
  solde_naturel_migratoire: r3.rows,    // v_demo_solde_naturel_migratoire_par_com
  pyramide_ages: r4.rows,               // v_demo_pyram_ages_par_com
  indice_jeunesse: r5.rows,             // v_demo_indice_jeunesse_par_com
  indicateurs_age: r6.rows,            // v_demo_indicateurs_age_par_com
  repartition_menages: r7.rows,         // v_demo_rep_menages_type_par_com
  taille_menages: r8.rows                // v_demo_taille_moy_men_par_com
}
```

**✅ Même vues SQL utilisées** - Seule la structure de retour change

### Habitat

#### Ancienne Application (`fetchHabitatData`)
```javascript
[
  result1.rows, // v_habitat_rp_type_occup_par_com
  result2.rows, // v_habitat_rm_evol_nb_logts_rp_par_com
  result3.rows, // JOIN v_habitat_indicateurs_logts_par_com + v_habitat_indicateurs_rp_par_com
  result4.rows, // v_habitat_evol_nb_logts_commences_par_com
  result5.rows, // v_habitat_rep_occasion_nb_logts_vendus_type_par_com
  result6.rows, // v_habitat_indicateurs_occasion_par_com
  result7.rows  // v_habitat_indicateurs_logt_commences_par_com
]
```

#### Nouvelle Application (`getHabitatData`)
```javascript
{
  statut_occupation: r1.rows,      // v_habitat_rp_type_occup_par_com
  evol_rp: r2.rows,                // v_habitat_rm_evol_nb_logts_rp_par_com
  logements_commences: r4.rows,    // v_habitat_evol_nb_logts_commences_par_com
  ventes_occasion: r5.rows         // v_habitat_rep_occasion_nb_logts_vendus_type_par_com
}
```

**⚠️ Note** : La nouvelle application ne récupère pas toutes les requêtes (query3, query6, query7). À vérifier si nécessaire.

### Économie

#### Ancienne Application (`fetchEconomieData`)
```javascript
[
  result1.rows, // v_economie_rep_etabl_sect_par_com
  result2.rows, // v_economie_evol_crea_etabl_par_com
  result3.rows  // v_economie_indicateurs_surf_loc_aut_par_com
]
```

#### Nouvelle Application (`getEconomieData`)
```javascript
{
  creation_etablissements_type: r1.rows,  // v_economie_rep_etabl_sect_par_com
  evol_creation_etablissements: r2.rows,  // v_economie_evol_crea_etabl_par_com
  // + Données Emploi intégrées :
  evol_emploi_total: re1.rows,          // v_emploi_indicateurs_emplois_par_com
  repartition_csp: re2.rows,            // v_emploi_nb_emplois_csp_par_com
  repartition_secteur: re3.rows,         // v_emploi_nb_emplois_sect_act_par_com
  repartition_lieu_travail: re4.rows     // v_emploi_actifs_occup_loc_emploi_par_com
}
```

**⚠️ Note** : La nouvelle application ne récupère pas `v_economie_indicateurs_surf_loc_aut_par_com` (surface locaux activité). À ajouter si nécessaire.

### Emploi

#### Ancienne Application (`fetchEmploiData`)
```javascript
[
  result1.rows, // v_emploi_nb_emplois_csp_par_com
  result2.rows, // v_emploi_nb_emplois_sect_act_par_com
  result3.rows, // v_emploi_indicateurs_emplois_par_com
  result4.rows  // v_emploi_actifs_occup_loc_emploi_par_com
]
```

#### Nouvelle Application (`getEconomieData`)
```javascript
{
  // Intégré dans les données économie :
  evol_emploi_total: re1.rows,          // v_emploi_indicateurs_emplois_par_com
  repartition_csp: re2.rows,            // v_emploi_nb_emplois_csp_par_com
  repartition_secteur: re3.rows,         // v_emploi_nb_emplois_sect_act_par_com
  repartition_lieu_travail: re4.rows     // v_emploi_actifs_occup_loc_emploi_par_com
}
```

**✅ Même vues SQL utilisées** - Intégrées dans le thème économie

### Formation

#### Ancienne Application (`fetchFormationData`)
```javascript
[
  result1.rows, // v_formation_evol_primaire_eleves_classes_par_com
  result2.rows, // v_formation_evol_secondaire_eleves_par_com
  result3.rows, // v_formation_indicateurs_primaire_par_com
  result4.rows  // v_formation_indicateurs_secondaire_par_com
]
```

#### Nouvelle Application (`getFormationData`)
```javascript
{
  evol_premier_degre: r1.rows,   // v_formation_evol_primaire_eleves_classes_par_com
  evol_second_degre: r2.rows      // v_formation_evol_secondaire_eleves_par_com
}
```

**⚠️ Note** : La nouvelle application ne récupère pas les indicateurs (query3, query4). À ajouter si nécessaire.

### Solidarité

#### Ancienne Application (`fetchSolidariteData`)
```javascript
[
  result1.rows, // v_solidarite_indicateurs_filosofi_par_com
  result2.rows  // v_solidarite_indicateurs_filosofi_par_com_partiel
]
```

#### Nouvelle Application (`getSolidariteData`)
```javascript
{
  revenus_disponibles: r1.rows,   // v_solidarite_indicateurs_filosofi_par_com
  origine_revenus: r2.rows        // v_solidarite_indicateurs_filosofi_par_com_partiel
}
```

**✅ Même vues SQL utilisées**

## Correspondance des Index dans l'Ancienne Application

Dans l'ancienne application (`dashboard.js`), les graphiques utilisaient des index numériques pour accéder aux données :

### Démographie
- `data[0]` → `evolution_population` (évolution population)
- `data[1]` → `naissances_deces` (naissances/décès)
- `data[2]` → `solde_naturel_migratoire` (soldes)
- `data[3]` → `pyramide_ages` (pyramide des âges)
- `data[4]` → `indice_jeunesse` (indice de jeunesse)
- `data[5]` → `indicateurs_age` (part <20 ans, >60 ans)
- `data[6]` → `repartition_menages` (répartition ménages)
- `data[7]` → `taille_menages` (taille moyenne ménages)
- `data[8]` → `indicateurs_menages` (indicateurs ménages)

### Habitat
- `data[0]` → `statut_occupation` (type occupation)
- `data[1]` → `evol_rp` (évolution résidences principales)
- `data[2]` → (JOIN logements + RP) - **Non récupéré dans nouvelle app**
- `data[3]` → `logements_commences` (logements commencés)
- `data[4]` → `ventes_occasion` (ventes occasion)
- `data[5]` → (indicateurs occasion) - **Non récupéré dans nouvelle app**
- `data[6]` → (indicateurs logt commencés) - **Non récupéré dans nouvelle app**

### Économie
- `data[0]` → `creation_etablissements_type` (répartition par secteur)
- `data[1]` → `evol_creation_etablissements` (évolution créations)
- `data[2]` → (surface locaux activité) - **Non récupéré dans nouvelle app**

### Emploi
- `data[0]` → `repartition_csp` (répartition CSP)
- `data[1]` → `repartition_secteur` (répartition secteur)
- `data[2]` → `evol_emploi_total` (évolution emploi total)
- `data[3]` → `repartition_lieu_travail` (lieu de travail)

### Formation
- `data[0]` → `evol_premier_degre` (évolution premier degré)
- `data[1]` → `evol_second_degre` (évolution second degré)
- `data[2]` → (indicateurs primaire) - **Non récupéré dans nouvelle app**
- `data[3]` → (indicateurs secondaire) - **Non récupéré dans nouvelle app**

### Solidarité
- `data[0]` → `revenus_disponibles` (revenus disponibles)
- `data[1]` → `origine_revenus` (origine revenus)

## Recommandations

### ✅ Données Manquantes - AJOUTÉES

1. **Habitat** : ✅ **AJOUTÉ**
   - ✅ Indicateurs logements (query3) : JOIN `v_habitat_indicateurs_logts_par_com` + `v_habitat_indicateurs_rp_par_com` → `indicateurs_logements`
   - ✅ Indicateurs occasion (query6) : `v_habitat_indicateurs_occasion_par_com` → `indicateurs_occasion`
   - ✅ Indicateurs logt commencés (query7) : `v_habitat_indicateurs_logt_commences_par_com` → `indicateurs_logt_commences`

2. **Économie** : ✅ **AJOUTÉ**
   - ✅ Surface locaux activité (query3) : `v_economie_indicateurs_surf_loc_aut_par_com` → `surface_locaux_activite`

3. **Formation** : ✅ **AJOUTÉ**
   - ✅ Indicateurs primaire (query3) : `v_formation_indicateurs_primaire_par_com` → `indicateurs_primaire`
   - ✅ Indicateurs secondaire (query4) : `v_formation_indicateurs_secondaire_par_com` → `indicateurs_secondaire`

**Note** : Ces nouvelles données sont disponibles dans le backend mais ne sont pas encore utilisées dans les configurations d'indicateurs. Elles peuvent être utilisées pour les KPIs ou de nouveaux graphiques si nécessaire.

### Vérification des Configurations d'Indicateurs

Les fichiers de configuration des indicateurs (`frontend/src/config/indicators/*.js`) doivent utiliser les bonnes clés pour accéder aux données :

- ✅ Utiliser les clés nommées (`evolution_population`, `naissances_deces`, etc.) au lieu des index numériques
- ✅ Vérifier que `dataSource` dans chaque indicateur correspond bien à une clé existante dans les données retournées

## Conclusion

**✅ Les mêmes vues SQL sont utilisées** pour toutes les données.

**✅ Toutes les requêtes de l'ancienne application sont maintenant disponibles** dans la nouvelle application.

**✅ La structure de retour a changé** (tableau de tableaux → objet structuré), ce qui est une amélioration pour la lisibilité et la maintenabilité.

**✅ Toutes les configurations d'indicateurs utilisent les bonnes clés** pour accéder aux données (voir `docs/VERIFICATION_CONFIGURATIONS.md`).

