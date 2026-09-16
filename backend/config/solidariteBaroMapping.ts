/**
 * Mapping colonnes Baroterritoire Solidarité
 *
 * Les vues v_social_indicateurs_filosofi_* ont un format PIVOT (une colonne par indicateur).
 * Ce mapping permet de convertir en format (indicateurs, val) attendu par le frontend.
 *
 * À adapter selon la structure réelle des vues Baro (vérifier avec \d v_social_indicateurs_filosofi_pivot_par_com)
 */

/** Colonne Baro → Label français pour graphiques et KPIs */
export const FILOSOFI_PIVOT_COLUMNS: Record<string, string> = {
  // Revenus disponibles (graphique solid-revenus-disponibles)
  revenu_median_uc: 'Médiane du niveau de vie',
  rev_med_uc: 'Médiane du niveau de vie',
  mediane_niveau_vie: 'Médiane du niveau de vie',
  niveau_vie_decile1: 'Niveau de vie décile 1',
  rev_d1_uc: 'Niveau de vie décile 1',
  niveau_vie_decile9: 'Niveau de vie décile 9',
  rev_d9_uc: 'Niveau de vie décile 9',

  // Origine des revenus (graphique solid-origine-revenus)
  part_revenus_activites: "Part des revenus d'activités",
  part_rev_act: "Part des revenus d'activités",
  part_pensions: 'Part des pensions, retraites et rentes',
  part_pens: 'Part des pensions, retraites et rentes',
  part_patrimoine: 'Part des revenus du patrimoine et autres',
  part_patr: 'Part des revenus du patrimoine et autres',
  part_prestations: 'Part des prestations sociales',
  part_prest: 'Part des prestations sociales',
  part_impots: "Part des impôts",
  part_imp: "Part des impôts",

  // KPIs
  part_menages_imposes: 'Part des ménages fiscaux imposés',
  part_men_impos: 'Part des ménages fiscaux imposés',
  taux_pauvrete_60: 'Taux de pauvreté au seuil de 60%',
  tx_pauv_60: 'Taux de pauvreté au seuil de 60%',
}

/** Colonnes à exclure du UNPIVOT (clés, pas des indicateurs) */
export const FILOSOFI_PIVOT_EXCLUDE = [
  'code_insee_concat',
  'code_geo',
  'lib_com',
  'lib_geo',
  'numero_annee',
  'annee',
  'id_com',
  'val',
  'valeur',
  'indicateur',
  'indicateurs',
]
