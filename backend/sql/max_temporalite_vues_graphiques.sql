-- =============================================================================
-- Max temporalité — uniquement les vues des graphiques concernés par les
-- millésimes / périodes au titre ou sur l’axe (correctifs « dates plus récentes »).
--
-- Vues couvertes :
--   • Pyramide des âges (sélecteur d’année)
--   • Évolution démographique annuelle moyenne (soldes / borne_temporelle)
--   • Répartition ménages par types (année au titre)
--   • Évolution logements d’occasion vendus par type (année au titre)
--   • Répartition créations d’établissements par type (année au titre)
--   • Répartition actifs par lieu de travail (millésime RP vs max en base)
--   • Exploitations en bio par année (axe valeurs / temporalité)
--
-- Remplacer _a_vues_portrait_commune_yl par votre schéma si besoin.
-- =============================================================================

WITH base AS (
  SELECT 'v_demo_rm_pyram_ages_par_com' AS vue,
         'numero_annee' AS colonne_temps,
         MAX(numero_annee::text) AS max_brut,
         MAX(numero_annee::int) AS max_annee_numerique
  FROM _a_vues_portrait_commune_yl.v_demo_rm_pyram_ages_par_com

  UNION ALL
  SELECT 'v_demo_solde_nat_solde_mig_app_par_com',
         'borne_temporelle',
         (SELECT MAX(borne_temporelle::text)
          FROM _a_vues_portrait_commune_yl.v_demo_solde_nat_solde_mig_app_par_com),
         (SELECT MAX(
            GREATEST(
              COALESCE(NULLIF(substring(v.borne_temporelle::text FROM '^([0-9]{4})'), '')::int, 0),
              COALESCE(NULLIF(substring(v.borne_temporelle::text FROM '([0-9]{4})$'), '')::int, 0)
            ))
          FROM _a_vues_portrait_commune_yl.v_demo_solde_nat_solde_mig_app_par_com v
          WHERE v.borne_temporelle IS NOT NULL
            AND trim(v.borne_temporelle::text) <> '')

  UNION ALL
  SELECT 'v_demo_rep_menages_type_par_com_yl',
         'numero_annee',
         MAX(numero_annee::text),
         MAX(numero_annee::int)
  FROM _a_vues_portrait_commune_yl.v_demo_rep_menages_type_par_com_yl

  UNION ALL
  SELECT 'v_habitat_evol_ventes_occasion_type_par_com_yl',
         'numero_annee',
         MAX(numero_annee::text),
         MAX(numero_annee::int)
  FROM _a_vues_portrait_commune_yl.v_habitat_evol_ventes_occasion_type_par_com_yl

  UNION ALL
  SELECT 'v_economie_rep_etabl_sect_par_com',
         'numero_annee',
         MAX(numero_annee::text),
         MAX(numero_annee::int)
  FROM _a_vues_portrait_commune_yl.v_economie_rep_etabl_sect_par_com

  UNION ALL
  SELECT 'v_emploi_actifs_occup_loc_emploi_par_com_yl',
         'numero_annee',
         MAX(numero_annee::text),
         MAX(numero_annee::int)
  FROM _a_vues_portrait_commune_yl.v_emploi_actifs_occup_loc_emploi_par_com_yl

  UNION ALL
  SELECT 'v_agri_evol_nb_exploitation_bio_annee_rm_com',
         'numero_annee',
         MAX(numero_annee::text),
         MAX(numero_annee::int)
  FROM _a_vues_portrait_commune_yl.v_agri_evol_nb_exploitation_bio_annee_rm_com
)

SELECT vue,
       colonne_temps,
       max_brut,
       max_annee_numerique
FROM base
ORDER BY vue;
