/**
 * Indicateurs pour la thématique Habitat
 * Basé sur la configuration de l'ancienne application (dashboard.js)
 */

import type { Indicator } from './index'

export const habitatIndicators: Indicator[] = [
  // --- Parc de logements ---
  {
    id: 'habitat-statut-occupation',
    code: 'statut_occupation',
    label: 'Répartition du nombre de logements selon le statut d\'occupation',
    subtheme: 'Parc de logements',
    theme: 'habitat',
    unit: 'logements',
    description: 'Répartition par statut d\'occupation (Source: Insee)',
    source: 'Insee', // Source exacte comme dans l'ancienne app
    chartType: 'doughnut',
    chartPreset: 'chartClassicDoughnut', // Configuration prédéfinie Chart.js
    apiField: 'nb_rp',
    labelField: 'statut_occup', // Utilise statut_occup au lieu de type_occup
    groupBy: 'numero_annee', // Filtrer par année
    dataSource: 'statut_occupation', // Source de données explicite
    available: true
  },
  {
    id: 'habitat-evol-rp',
    code: 'evol_rp',
    label: 'Évolution du nombre de résidences principales',
    subtheme: 'Parc de logements',
    theme: 'habitat',
    unit: 'logements',
    description: 'Nombre de résidences principales (Source: Insee)',
    source: 'Insee', // Source exacte comme dans l'ancienne app
    chartType: 'bar',
    chartPreset: 'chartClassicBarNoLegend', // Configuration prédéfinie Chart.js
    apiField: 'nb_rp', // Utilise nb_rp au lieu de nb_logts_rp
    groupBy: 'numero_annee',
    dataSource: 'evol_rp', // Source de données explicite
    available: true
  },

  // --- Construction ---
  {
    id: 'habitat-evol-logts-commences',
    code: 'evol_logts_commences',
    label: 'Évolution du nombre de logements neufs commencés',
    subtheme: 'Construction',
    theme: 'habitat',
    unit: 'logements',
    description: 'Évolution du nombre de logements neufs commencés (Source: Sit@del2 (Date de Prise en Compte))',
    source: 'Sit@del2 (Date de Prise en Compte)',
    chartType: 'bar',
    chartPreset: 'chartClassicBarNoLegend', // Configuration prédéfinie Chart.js
    apiField: 'nb_logts_commences',
    groupBy: 'numero_annee',
    dataSource: 'evol_logts_commences', // Source de données explicite
    available: true
  },
  {
    id: 'habitat-evol-part-collectif-commences',
    code: 'evol_part_collectif_commences',
    label: 'Évolution de la part du collectif dans les logements commencés en date de prise en compte',
    subtheme: 'Construction',
    theme: 'habitat',
    unit: '%',
    description: 'Part du collectif dans les logements commencés (Source: Sit@del2 (Date de Prise en Compte))',
    source: 'Sit@del2 (Date de Prise en Compte)',
    chartType: 'bar',
    chartPreset: 'chartClassicBarPercentNoLegend',
    apiField: 'part_logts_commences_collectif',
    groupBy: 'annee',
    dataSource: 'evol_part_collectif_commences',
    format: 'percentage',
    available: true
  },
  // --- Marché de l'habitat ---
  {
    id: 'habitat-evol-ventes-occasion-type',
    code: 'evol_ventes_occasion_type',
    label: 'Évolution du nombre de logements d\'occasion vendus par type',
    subtheme: 'Marché de l\'habitat',
    theme: 'habitat',
    unit: 'ventes',
    description: 'Évolution du nombre de logements d\'occasion vendus par type (Source: DVF, Audiar)',
    source: 'Demande de valeurs foncières (DVF), traitements Audiar',
    chartType: 'bar',
    chartPreset: 'chartStackedSum', // Configuration prédéfinie Chart.js
    options: { indexAxis: 'y' }, // Barres horizontales (années en Y, valeurs en X)
    apiField: 'nb_logts_vendus',
    labelField: 'type_bien', // Grouper par type de bien (Maison, Appartement)
    groupBy: 'numero_annee',
    dataSource: 'evol_ventes_occasion_type', // Source de données explicite
    showLegend: true, // Légende obligatoire (Maison/Appartement) pour cliquer sur une barre précise
    available: true
  },
  {
    id: 'habitat-evol-prix-maison-occas',
    code: 'evol_prix_maison_occas',
    label: 'Évolution du prix moyen des maisons d\'occasion (€)',
    subtheme: 'Marché de l\'habitat',
    theme: 'habitat',
    unit: '€',
    description: 'Prix moyen des maisons d\'occasion (Source: DVF, Audiar)',
    source: 'Demande de valeurs foncières (DVF), traitements Audiar',
    chartType: 'bar',
    chartPreset: 'chartClassicBarNoLegend',
    apiField: 'prix_moyen_maison',
    groupBy: 'annee',
    dataSource: 'evol_prix_maison_occas',
    available: true
  },
  {
    id: 'habitat-evol-prix-m2-appart-occas',
    code: 'evol_prix_m2_appart_occas',
    label: 'Évolution du prix moyen au m² des appartements d\'occasion (€/m²)',
    subtheme: 'Marché de l\'habitat',
    theme: 'habitat',
    unit: '€/m²',
    description: 'Prix moyen au m² des appartements d\'occasion (Source: DVF, Audiar)',
    source: 'Demande de valeurs foncières (DVF), traitements Audiar',
    chartType: 'bar',
    chartPreset: 'chartClassicBarNoLegend',
    apiField: 'prix_moyen_m2_appart',
    groupBy: 'annee',
    dataSource: 'evol_prix_m2_appart_occas',
    available: true
  }
]
