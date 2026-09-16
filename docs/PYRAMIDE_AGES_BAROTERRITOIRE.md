# Pyramide des âges – Vue Baroterritoire

## Contexte

La pyramide des âges est construite à partir de la vue `v_demo_rm_pyram_ages_par_com` du schéma Baroterritoire (`_a_vues_baro_territoires_dev`).

## Structure de la vue Baro (format "rm")

La vue retourne un **format brut** : une ligne par combinaison (lib_sexe, lib_ta21, numero_annee) :

| Colonne           | Description                          | Exemple      |
|------------------|--------------------------------------|--------------|
| code_insee_concat | Code INSEE de la commune             | 35238        |
| lib_com          | Libellé commune                      | Rennes       |
| numero_annee    | Année                                | 2017, 2022    |
| lib_sexe        | Sexe (Hommes / Femmes)               | Hommes, Femmes |
| lib_ta21        | Tranche d'âge (5 ans)                | 0-5, 5-9, …, 95-99, 100 et + |
| pop             | Population (déjà signée)             | Hommes : négatif, Femmes : positif |

**Exemple de données :**
```
Hommes | 0-5   | 2017 | -5853.04
Femmes | 0-5   | 2017 |  5583.83
Hommes | 5-9   | 2017 | -5381.75
...
```

## Backend (DemographieRepository)

Le repository utilise `SELECT *` puis **pivote en TypeScript** via `pivotPyramideRows()` pour produire le format attendu par le frontend (comme l’ancienne vue Portrait `v_demo_pyram_ages_par_com_yl`) :

**Format de sortie :** `{ lib_ta21, numero_annee, pop_h, pop_f }` – une ligne par tranche d’âge et par année.

## Frontend (Chart.js)

- **Configuration** : `demographie.ts` – `datasets: [{ code: 'pop_h', label: 'Hommes' }, { code: 'pop_f', label: 'Femmes' }]`, `groupBy: 'lib_ta21'`
- **Formatage** : `formatPyramidAges.ts` – Hommes en négatif (gauche), Femmes en positif (droite) via `Math.abs`
- **Options Chart.js** : `chartPyramide` – barres horizontales empilées, `Math.abs` sur l’axe X et dans les tooltips

## Dépannage

Si les barres Hommes sont absentes (pop_h = 0) :

1. **Vérifier les valeurs de `lib_sexe`** dans la vue  
   Exécuter :  
   `SELECT DISTINCT lib_sexe FROM _a_vues_baro_territoires_dev.v_demo_rm_pyram_ages_par_com LIMIT 10`  
   Si la vue utilise d’autres codes (ex. `'1'`, `'2'`, `'H'`, `'F'`), ils sont déjà pris en charge dans `pivotPyramideRows()`.

2. **Vérifier la colonne de filtre**  
   Si la vue utilise `code_geo` au lieu de `code_insee_concat`, modifier `backend/config/vueColumnConventions.ts` :  
   `v_demo_rm_pyram_ages_par_com: { code: 'code_geo', lib: 'lib_geo' }`

3. **Cache**  
   Invalider ou vider le cache (`globalCache`) pour éviter les anciennes données.

## Référence : ancienne implémentation

- **DemographieHandler.js** : `SELECT * FROM v_demo_rm_pyram_ages_par_com WHERE ... = $1` (retourne les lignes brutes)
- **chart-options.js** : `chartPyramide` – barres horizontales empilées, `Math.abs` sur l’axe et dans les tooltips
- **Dashboard** : `mesure: ['pop_h','pop_f']`, `groupBy: 'lib_ta21'` – le frontend attendait déjà `pop_h` et `pop_f` (agrégation côté backend ou vue Portrait pré-agrégée)
