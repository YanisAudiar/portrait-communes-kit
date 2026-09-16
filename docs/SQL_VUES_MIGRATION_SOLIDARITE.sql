-- =============================================================================
-- Vues SQL de migration Solidarité – Portrait de commune → Baroterritoire
-- Schéma cible : _a_vues_portrait_commune (wrappers) ou lecture directe Baro
-- =============================================================================

-- Prérequis : les vues v_social_* existent dans _a_vues_baro_territoires_dev
-- (ou schéma Baro configuré)

-- -----------------------------------------------------------------------------
-- Option 1 : Vues wrapper dans Portrait qui pointent vers Baro
-- (permet de garder le même nom de vue côté application)
-- -----------------------------------------------------------------------------

-- 1.1 Revenus disponibles + indicateurs FiLoSoFi (format indicateurs/val)
-- À adapter selon la structure réelle de v_social_indicateurs_filosofi_par_com
/*
CREATE OR REPLACE VIEW _a_vues_portrait_commune.v_solidarite_indicateurs_filosofi_par_com
AS
SELECT 
  code_insee_concat,
  lib_com,
  numero_annee,
  indicateurs,
  val
FROM _a_vues_baro_territoires_dev.v_social_indicateurs_filosofi_par_com;
*/

-- 1.2 Origine des revenus (vue partiel)
-- Si v_social_indicateurs_filosofi_pivot_par_com a des colonnes pivot,
-- créer une vue qui fait l'UNPIVOT vers indicateurs/val
/*
CREATE OR REPLACE VIEW _a_vues_portrait_commune.v_solidarite_indicateurs_filosofi_par_com_partiel
AS
SELECT 
  code_insee_concat,
  lib_com,
  numero_annee,
  indicateurs,
  val
FROM _a_vues_baro_territoires_dev.v_social_indicateurs_filosofi_pivot_par_com
-- Adapter selon structure réelle (CROSS JOIN UNNEST ou UNION de colonnes)
;
*/

-- 1.3 Évolution allocataires dépendants
-- Portrait attend nb_alloc_dep_presta ; Baro a tr50pfrb + tr100pfrb
/*
CREATE OR REPLACE VIEW _a_vues_portrait_commune.v_solidarite_evol_alloc_dependants_par_com
AS
SELECT 
  code_insee_concat,
  lib_com,
  numero_annee,
  (COALESCE(tr50pfrb, 0) + COALESCE(tr100pfrb, 0))::numeric AS nb_alloc_dep_presta
FROM _a_vues_baro_territoires_dev.v_social_dependants_presta50_100_par_com;
*/

-- -----------------------------------------------------------------------------
-- Option 2 : Pas de vues wrapper – le Repository lit directement les vues Baro
-- (recommandé : moins de duplication, une seule source de vérité)
-- Voir SolidariteRepository.ts avec PGSCHEMA_SOLIDARITE
-- -----------------------------------------------------------------------------
