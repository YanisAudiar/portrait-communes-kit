# Documentation Agriculture - Vues et Indicateurs

> **Obsolète.** Conservé pour l’historique Baro. Contrat actuel (vues lues par l’API) :
> [`CONTRAT_DONNEES.md`](CONTRAT_DONNEES.md).

## 🌾 Thématique : Agriculture

**Schéma SQL** : `_a_vues_baro_territoires_dev` (vues Baroterritoire)

---

## Référence Baroterritoire – Indicateurs et vues

### 1. Thème agriculture-exploitations

| Indicateur Baro | Vue PostgreSQL | Colonnes principales | Usage |
|-----------------|----------------|----------------------|-------|
| indicateurs_exploitations | `v_agri_nb_expl_par_{echelle}` | numero_annee, ind_val | KPI : nombre moyen de sièges d'exploitations |
| evol_ann_moy_nb_exploitations | `v_agri_taux_evol_expl_par_{echelle}` | annee, ind_val | KPI : taux d'évolution du nombre d'exploitations |
| taux_evolution_sieges_exploitations | `v_agri_taux_evol_ann_moy_nb_exploit_annee_par_{echelle}` | numero_annee, ind_val | KPI : taux d'évolution des sièges |
| effectif_etp_main_oeuvre | `v_agri_nb_etp_par_{echelle}` | annee, etp | KPI : nombre d'ETP main-d'œuvre agricole |
| evolution_exploitations | `v_agri_exploitation_evol_par_{echelle}` | annee, ind_val | Graphique : évolution du nombre d'exploitations |
| evol_taille_exploitations | `v_agri_evol_taille_par_{echelle}` | annee, lib_taille_exploitation_long, nb_exploit | Graphique : évolution par taille (EPCI/SCOT uniquement) |

> **Note** : Le dashboard Baro utilise `taux_evolution_nb_exploitations`, le handler expose `taux_evolution_sieges_exploitations` (possible incohérence).

### 2. Thème agriculture-surfaces

| Indicateur Baro | Vue PostgreSQL | Colonnes principales | Usage |
|-----------------|----------------|----------------------|-------|
| indicateurs_surfaces | `v_agri_sau_par_{echelle}` | annee, indicateur, ind_val | KPIs : SAU (sau_ha), part SAU (part_sau), évolution SAU (evol_sau) |
| evol_sau | `v_agri_sau_evol_par_{echelle}` | annee, ind_val (indicateur = sau_annuel) | Graphique : évolution de la SAU (ha) |

### 3. Thème agriculture-production

| Indicateur Baro | Vue PostgreSQL | Colonnes principales | Usage |
|-----------------|----------------|----------------------|-------|
| indicateurs_production | `v_agriculture_indicateurs_production_par_{echelle}` | — | Non utilisé dans le dashboard actuel |

---

## Récapitulatif des vues (échelles)

| Vue | Échelles |
|-----|----------|
| v_agri_nb_expl_par_{echelle} | com, epci, scot |
| v_agri_taux_evol_expl_par_{echelle} | com, epci, scot |
| v_agri_taux_evol_ann_moy_nb_exploit_annee_par_{echelle} | com, epci, scot |
| v_agri_nb_etp_par_{echelle} | com, epci, scot |
| v_agri_exploitation_evol_par_{echelle} | com, epci, scot |
| v_agri_evol_taille_par_{echelle} | epci, scot uniquement |
| v_agri_sau_par_{echelle} | com, epci, scot |
| v_agri_sau_evol_par_{echelle} | com, epci, scot |
| v_agriculture_indicateurs_production_par_{echelle} | com, epci, scot |

---

## Liste des indicateurs API (Baroterritoire)

- **agriculture-exploitations** : indicateurs_exploitations, evol_ann_moy_nb_exploitations, taux_evolution_sieges_exploitations, effectif_etp_main_oeuvre, evolution_exploitations, evol_taille_exploitations
- **agriculture-surfaces** : indicateurs_surfaces, evol_sau
- **agriculture-production** : indicateurs_production

**Total** : 9 indicateurs (7 utilisés dans le dashboard, 2 non utilisés : taux_evolution_sieges_exploitations/taux_evolution_nb_exploitations, indicateurs_production).

---

## Mapping Portrait Communes V2

| Indicateur Portrait | Vue SQL | Colonnes | Type | Chart.js Config |
|---------------------|---------|----------|------|-----------------|
| Nombre de sièges d'exploitations | `v_agri_nb_expl_par_{echelle}` | ind_val, numero_annee | keyNumber | - |
| Taux d'évolution du nombre d'exploitations/an | `v_agri_taux_evol_expl_par_{echelle}` | ind_val, annee | keyNumber | - |
| Nombre d'ETP main d'œuvre agricole | `v_agri_nb_etp_par_{echelle}` | etp, annee | keyNumber | - |
| Évolution du nombre d'exploitations | `v_agri_exploitation_evol_par_{echelle}` | ind_val, annee | bar | chartClassicBarNoLegend |
| Taux évolution sièges exploitations | `v_agri_taux_evol_ann_moy_nb_exploit_annee_par_{echelle}` | ind_val, numero_annee | keyNumber | - |
| Surface Agricole Utile (SAU) | `v_agri_sau_par_{echelle}` | ind_val (filtre: sau_ha), annee | keyNumber | - |
| Part du territoire couvert par SAU | `v_agri_sau_par_{echelle}` | surface_ha, type_culture | keyNumber | - |
| Taux d'évolution de la SAU | `v_agri_sau_par_{echelle}` | ind_val (filtre: evol_sau), annee | keyNumber | - |
| Répartition de la SAU par type de culture | repartition_sau | surface_ha, type_culture | doughnut | chartClassicDoughnut |
| Indicateurs production | `v_agriculture_indicateurs_production_par_{echelle}` | dynamique | - | - |

**Vues à intégrer** (présentes en Baro, absentes de Portrait) :
- `v_agri_evol_taille_par_{echelle}` (EPCI/SCOT) – évolution par taille d'exploitation
- `v_agri_sau_evol_par_{echelle}` – évolution SAU dédiée (vs v_agri_sau_par_com)

---

## 🗃️ Vues Legacy (dbServices_old.js)

### Sous-thème : Exploitations agricoles (exploitations-agri)

| Indicateur | Vue SQL | Colonnes |
|------------|---------|----------|
| exploitations_cc | v_agri_nb_expl_rm | - |
| exploitations_cc_evol_ann | v_agri_evol_annuelle_moy_nb_expl_rm_annee | - |
| nb_expl_annuel | v_agri_exp_rm_evol | - |
| comp_metrop_nb_expl | v_agri_comp_metrop_nb_expl | - |
| rep_exploitations_type | v_agri_rm_rep_exploitations_taille | - |
| evol_abs_expl_type | v_agri_rm_evol_taille | - |
| nb_exp_com | v_agri_com_nb_expl | - |
| evol_nb_expcom | v_agri_evol_nb_exploit_annee_rm_com | code_insee_concat |
| taux_evol_com_carto | v_agri_evol_nb_exploit_rm_par_com | - |
| taux_evol_ann_moy_com_carto | v_agri_taux_evol_ann_moy_nb_exploit_annee_rm_com | - |

### Sous-thème : SAU (sau)

| Indicateur | Vue SQL | Colonnes |
|------------|---------|----------|
| sau_ha_rm | v_agri_rm_sau | - |
| sau_ha_rm_evol | v_agri_sau_rm_evol | - |
| sau_metrop | v_agri_sau_metrop | - |
| sa_rpg_rm | v_agri_sa_rm_evol | - |
| sau_par_com | v_agri_sau_par_com | - |
| evol_sau_moy_expl_par_com | v_agri_evol_sau_moy_exploitation_rm_annee | - |

### Sous-thème : Démographie agricole (demo-agri)

| Indicateur | Vue SQL | Colonnes |
|------------|---------|----------|
| cc-etp-rm | v_agri_nb_actifs_etp_rm | - |
| part-ce | v_agri_part_ce_p55_rm | - |
| part-femmes | v_agri_part_femmes_ce_annee_rm | - |
| rep-mo | v_agri_part_type_effectif | - |
| etp-comp-metrop | v_agri_comp_metrop_nb_etp | - |
| evol-mo | v_agri_evol_moeu_type_rm_annee | - |
| age-ce | v_agri_rm_pyram_ages_chef_exploit | - |
| etp_com | v_agri_nb_etp_rm_par_com | - |
| evol_etp_par_com | v_agri_evol_etp_rm_par_com | code_insee_concat |

### Sous-thème : Production agricole (prod-agri)

| Indicateur | Vue SQL | Colonnes |
|------------|---------|----------|
| cc-part_bovin_exp | v_agri_part_expl_bovins_rm_annee | - |
| part-sau-prairies | v_agri_part_prairies_rm | - |
| part_exp_bio | v_agri_evol_nb_exploitation_bio_annee_rm | - |
| rep-culture | v_agri_part_cultures_2_rm | part |
| evol_nb_exp_bio | v_agri_evol_nb_exploitation_bio_annee_rm | - |
| evol_sa_bio | v_agri_evol_sau_bio_annee_rm | - |
| otex_com | v_agri_otex_rm_par_com | - |
| part_otex_rm | v_agri_part_otex_nb_exploit_rm_annee | - |
| part_sau_bio_com | v_agri_part_sau_bio_annee_com | - |

### Sous-thème : Marchés fonciers agricoles (marches-foncier-agri)

| Indicateur | Vue SQL | Colonnes |
|------------|---------|----------|
| cc-nb-mut-foncier | v_agri_nb_mut_marche_foncier_rm_annee | - |
| cc-surf-mut | v_agri_nb_mut_marche_foncier_rm_annee | - |
| evol-marche-foncier | v_agri_evol_marche_foncier_rm_annee | - |
| nb-trans-com | v_agri_nb_mut_marche_foncier_rm_com_annee | code_insee_concat |

---

## 📈 Chart.js - Types de graphiques

| Theme | Graphique | Type Chart.js | Options |
|-------|-----------|---------------|---------|
| agriculture-exploitations | Évolution exploitations | bar | chartClassicBarNoLegend |
| agriculture-surfaces | Répartition SAU | doughnut | chartClassicDoughnut |

## 🎨 Couleurs
- Barres/Doughnut : `rgba(116, 176, 84, 0.7)`, `rgba(136, 196, 104, 0.6)`, `rgba(156, 216, 124, 0.5)`, `rgba(176, 236, 144, 0.4)`, `rgba(196, 255, 164, 0.3)`

> **Note** : Les vues sont suffixées dynamiquement avec `_{echelle}` (ex: `_com`, `_epci`, `_scot`) selon le niveau territorial sélectionné.
