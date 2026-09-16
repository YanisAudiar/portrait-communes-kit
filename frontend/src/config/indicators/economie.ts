/**
 * Indicateurs pour la thématique Économie et Emploi
 * Basé sur la configuration de l'ancienne application (dashboard.js)
 */

import type { Indicator } from './index'

export const economieIndicators: Indicator[] = [
  // --- Tissu économique ---
  {
    id: 'eco-creation-etablissements-type',
    code: 'creation_etablissements_type',
    label: 'Répartition du nombre d\'établissements par type d\'activité',
    subtheme: 'Tissu économique',
    theme: 'economie-emploi',
    chartTheme: 'economie',
    unit: 'établissements',
    description:
      'Parc d\'établissements (stock) par secteur d\'activité au millésime indiqué — pas des créations annuelles. Source : Insee, REE.',
    source: 'Insee, répertoire des entreprises et des établissements (REE)',
    chartType: 'doughnut',
    chartPreset: 'chartClassicDoughnut',
    apiField: 'nb_etabl_cmna',
    labelField: 'lib_cat5',
    dataSource: 'creation_etablissements_type',
    available: true
  },
  {
    id: 'eco-evol-creation-etablissements',
    code: 'evol_creation_etablissements',
    label: 'Évolution du nombre de créations d\'établissements',
    subtheme: 'Tissu économique',
    theme: 'economie-emploi',
    chartTheme: 'economie',
    unit: 'établissements',
    description: 'Évolution des créations d\'établissements (Source: Insee, REE)',
    source: 'Insee, répertoire des entreprises et des établissements (REE)',
    chartType: 'bar',
    chartPreset: 'chartClassicBarNoLegend',
    apiField: 'nb_crea_etabl',
    groupBy: 'numero_annee',
    dataSource: 'evol_creation_etablissements',
    available: true
  },

  // --- Emploi ---
  {
    id: 'emploi-evol-total',
    code: 'evol_emploi_total',
    label: 'Nombre d\'emploi',
    subtheme: 'Emploi',
    theme: 'economie-emploi',
    chartTheme: 'economie',
    unit: 'emplois',
    description: 'Emploi total : nombre de postes au lieu de travail (où les actifs travaillent). Source: Insee, estimations d\'emploi.',
    source: 'Insee, estimations d\'emploi',
    chartType: 'bar',
    chartPreset: 'chartClassicBarNoLegend',
    apiField: 'nb_emplois',
    groupBy: 'numero_annee',
    dataSource: 'evol_emploi_total',
    available: true
  },
  {
    id: 'emploi-repartition-csp',
    code: 'repartition_csp',
    label: 'Répartition des emplois par catégorie socioprofessionnelle',
    subtheme: 'Emploi',
    theme: 'economie-emploi',
    chartTheme: 'economie',
    unit: 'emplois',
    description: 'Emplois par CSP (Source: Insee)',
    source: 'Insee, estimations d\'emploi',
    chartType: 'doughnut',
    chartPreset: 'chartClassicDoughnut',
    apiField: 'nb_emplois',
    labelField: 'lib_csp',
    dataSource: 'repartition_csp',
    available: true
  },
  {
    id: 'emploi-repartition-secteur',
    code: 'repartition_secteur',
    label: 'Répartition des emplois par secteur d\'activité',
    subtheme: 'Emploi',
    theme: 'economie-emploi',
    chartTheme: 'economie',
    unit: 'emplois',
    description: 'Emplois par secteur d\'activité (Source: Insee)',
    source: 'Insee, estimations d\'emploi',
    chartType: 'doughnut',
    chartPreset: 'chartClassicDoughnut',
    apiField: 'nb_emplois',
    labelField: 'lib_sect_act',
    dataSource: 'repartition_secteur',
    available: true
  },
  {
    id: 'emploi-lieu-travail',
    code: 'repartition_lieu_travail',
    label: 'Répartition des actifs en emploi par lieu de travail',
    subtheme: 'Emploi',
    theme: 'economie-emploi',
    chartTheme: 'economie',
    unit: 'actifs',
    description: 'Répartition des actifs en emploi selon leur commune de travail (lieu de travail, et non lieu de résidence). Source: Insee, RP.',
    source: 'Insee, recensement de la population',
    chartType: 'doughnut',
    chartPreset: 'chartClassicDoughnut',
    apiField: 'nb_actifs_occup',
    labelField: 'lib_loc_emploi',
    dataSource: 'repartition_lieu_travail',
    available: true
  }
]
