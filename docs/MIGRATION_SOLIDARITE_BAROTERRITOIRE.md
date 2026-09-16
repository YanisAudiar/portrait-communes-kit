# Migration Solidarité – Portrait de commune → Baroterritoire

Ce document décrit la stratégie de migration des vues Solidarité vers les vues Baroterritoire (`v_social_*`).

---

## 1. Mapping des vues (aligné Baroterritoire)

| Indicateur Portrait | Vue Baroterritoire | Usage |
|---------------------|--------------------|-------|
| revenus_disponibles | v_social_indicateurs_filosofi_pivot_par_com | Graphique revenus disponibles par UC |
| origine_revenus | v_social_indicateurs_filosofi_pivot_par_com | Graphique origine des revenus |
| indicateurs_filosofi_2022 (KPIs) | v_social_indicateurs_filosofi_pivot_par_com | Revenu médian, part ménages imposés, taux pauvreté |
| evol_alloc_dependants | v_social_dependants_presta50_100_par_com | nb_alloc_dep_presta = tr50pfrb + tr100pfrb |
| dependants_presta50_100 | v_social_dependants_presta50_100_par_com | personne_pourcent_dependant |

**Format pivot** : Les vues FiLoSoFi Baro ont une colonne par indicateur (pivot). Le mapping est dans `backend/config/solidariteBaroMapping.ts`. À adapter si les noms de colonnes diffèrent (`\d v_social_indicateurs_filosofi_pivot_par_com`).

---

## 2. Stratégie de migration

### Option A : Repository lit directement les vues Baro (recommandé)

- Ajouter `PGSCHEMA_SOLIDARITE=_a_vues_baro_territoires_dev` (ou réutiliser `PGSCHEMA_HABITAT`)
- `SolidariteRepository` utilise le schéma Baro pour les vues `v_social_*`
- Colonnes : adapter via `getColsForVue()` si Baro utilise `code_geo` / `lib_geo`

### Option B : Vues SQL dans _a_vues_portrait_commune

Créer des vues qui pointent vers Baro :

```sql
-- Exemple : vue wrapper pour compatibilité Portrait
CREATE OR REPLACE VIEW _a_vues_portrait_commune.v_solidarite_indicateurs_filosofi_par_com
AS
SELECT code_insee_concat, lib_com, numero_annee, indicateurs, val
FROM _a_vues_baro_territoires_dev.v_social_indicateurs_filosofi_par_com;
```

---

## 3. Points d’attention

### 3.1 evol_alloc_dependants

La vue Portrait `v_solidarite_evol_alloc_dependants_par_com` fournit `nb_alloc_dep_presta` (une valeur par année).

La vue Baro `v_social_dependants_presta50_100_par_com` fournit `tr50pfrb` et `tr100pfrb`.

**Solution** : calculer `nb_alloc_dep_presta = COALESCE(tr50pfrb, 0) + COALESCE(tr100pfrb, 0)` dans la requête SQL.

### 3.2 origine_revenus (vue partiel)

La vue partiel Portrait contient les indicateurs :
- Part des revenus d'activités
- Part des pensions, retraites et rentes
- Part des revenus du patrimoine et autres
- Part des prestations sociales
- Part des impôts

Si `v_social_indicateurs_filosofi_pivot_par_com` a des colonnes dédiées (ex. `part_revenus_activites`, `part_pensions`), il faudra un `UNPIVOT` ou une requête qui produit le format `indicateurs` / `val`.

### 3.3 KPIs (sol-rev-med, sol-part-imp, sol-tx-pauv)

Utiliser `v_social_indicateurs_filosofi_par_com` avec filtre `numero_annee = 2022` (ou année max). Les noms d’indicateurs peuvent différer ; adapter les recherches dans `solidariteKPIs.ts` si nécessaire.

---

## 4. Configuration vueColumnConventions

Ajouter les entrées pour les vues Solidarité Baro :

```typescript
v_social_indicateurs_filosofi_par_com: { code: 'code_insee_concat', lib: 'lib_com' },
v_social_indicateurs_filosofi_pivot_par_com: { code: 'code_insee_concat', lib: 'lib_com' },
v_social_dependants_presta50_100_par_com: { code: 'code_insee_concat', lib: 'lib_com' },
```

---

## 5. Variables d’environnement

| Variable | Valeur | Usage |
|----------|--------|-------|
| PGSCHEMA_SOLIDARITE | _a_vues_baro_territoires_dev | Schéma Baro pour Solidarité (comme démographie/habitat) |
| PGSCHEMA_HABITAT | _a_vues_baro_territoires_dev | Fallback si PGSCHEMA_SOLIDARITE non défini |
