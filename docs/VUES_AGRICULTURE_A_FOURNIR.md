# Vues Agriculture – Référence

## Vues utilisées (structure confirmée)

### 1. Évolution des ETP agricoles

| Vue | Schéma | Colonnes |
|-----|--------|----------|
| v_agri_nb_etp_par_com | _a_vues_baro_territoires_dev | code_insee_concat, lib_com, annee, etp |

```
code_insee_concat | lib_com  | annee | etp
------------------+----------+-------+-----
22001             | Allineuc | 2020  | 71
22002             | Andel    | 2020  | 37
```

---

### 2. Évolution de la SAU (graphique année par année)

| Vue | Schéma | Colonnes |
|-----|--------|----------|
| v_agri_sau_evol_par_com | _a_vues_baro_territoires_dev | code_insee_concat, lib_com, annee, ind_val |

**Une ligne par année** – SAU en ha pour chaque année.

```
code_insee_concat | lib_com | annee | ind_val
------------------+---------+-------+--------
35197             | Mouazé  | 2010  | 620
35197             | Mouazé  | 2015  | 605
35197             | Mouazé  | 2020  | 595
35197             | Mouazé  | 2023  | 590.62
```

### 2b. KPIs SAU (v_agri_sau_par_com)

| Vue | Schéma | Colonnes |
|-----|--------|----------|
| v_agri_sau_par_com | _a_vues_baro_territoires_dev | code_insee_concat, lib_com, indicateur, annee, ind_val |

**Indicateurs** : `sau_ha`, `evol_sau`, `part_sau` (KPIs uniquement, pas le graphique évolution).

---

### 3. Taux évolution annuelle moyenne exploitations

| Vue | Schéma | Colonnes |
|-----|--------|----------|
| v_agri_taux_evol_ann_moy_nb_exploit_annee_rm_com | _a_vues_obs_agriculture | code_insee_concat, lib_com, ind_val, annee, periode |

```
code_insee_concat | lib_com   | ind_val | annee | periode
------------------+-----------+---------+------+----------
35001             | Acigné    | -4.8    | 2020 | 2010-2020
35024             | Betton    | -2.9    | 2020 | 2010-2020
```

---

### 4. Exploitations en bio par année

| Vue | Schéma | Colonnes |
|-----|--------|----------|
| v_agri_evol_nb_exploitation_bio_annee_rm_com | _a_vues_obs_agriculture | code_insee_concat, lib_com, numero_annee, nb_exploitation_bio |

```
code_insee_concat | lib_com  | numero_annee | nb_exploitation_bio
------------------+----------+--------------+--------------------
35076             | Chavagne | 2019         | 3
35051             | Cesson   | 2019         | 4
```
