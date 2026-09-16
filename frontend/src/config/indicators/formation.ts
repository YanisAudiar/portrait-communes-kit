/**
 * Indicateurs pour la thématique Formation
 * Basé sur la configuration de l'ancienne application (dashboard.js)
 */

import type { Indicator } from './index'

export const formationIndicators: Indicator[] = [
  {
    id: 'formation-evol-premier-degre',
    code: 'evol_premier_degre',
    label: 'Évolution du nombre d\'élèves du premier degré',
    subtheme: 'Scolarité',
    theme: 'enseignement',
    chartTheme: 'formation', // Jaune/Or
    unit: 'élèves',
    description: 'Élèves du premier degré (Source: Académie de Rennes)',
    source: 'Académie de Rennes', // Source exacte comme dans l'ancienne app
    chartType: 'line',
    chartPreset: 'chartLine', // Configuration prédéfinie Chart.js
    datasets: [
      { code: 'nb_eleves_pre_elementaire', label: 'Pré-élémentaire' },
      { code: 'nb_eleves_elementaire', label: 'Élémentaire' }
    ],
    groupBy: 'numero_annee',
    dataSource: 'evol_premier_degre', // Source de données explicite
    available: true
  },
  {
    id: 'formation-evol-second-degre',
    code: 'evol_second_degre',
    label: 'Évolution du nombre d\'élèves du second degré',
    subtheme: 'Scolarité',
    theme: 'enseignement',
    chartTheme: 'formation', // Jaune/Or
    unit: 'élèves',
    description: 'Élèves du second degré (Source: Académie de Rennes)',
    source: 'Académie de Rennes', // Source exacte comme dans l'ancienne app
    chartType: 'line',
    chartPreset: 'chartLine', // Configuration prédéfinie Chart.js
    datasets: [
      { code: 'nb_eleves_college', label: 'Collège' },
      { code: 'nb_eleves_lycee', label: 'Lycée' }
    ],
    groupBy: 'numero_annee',
    dataSource: 'evol_second_degre', // Source de données explicite
    available: true
  },
  {
    id: 'formation-evol-ouv-ferm-classes',
    code: 'evol_ouv_ferm_classes',
    label: 'Évolution des ouvertures et des fermetures de classes',
    subtheme: 'Scolarité',
    theme: 'enseignement',
    chartTheme: 'formation', // Jaune/Or
    unit: 'classes',
    description: 'Évolution des ouvertures et fermetures de classes du primaire (Source: Académie de Rennes)',
    source: 'Académie de Rennes',
    chartType: 'line',
    chartPreset: 'chartLine', // Configuration prédéfinie Chart.js
    options: {
      scales: {
        y: {
          ticks: {
            stepSize: 1,
            precision: 0
          }
        }
      }
    },
    datasets: [
      { code: 'ouv_classes', label: 'Ouvertures' },
      { code: 'ferm_classes', label: 'Fermetures' }
    ],
    groupBy: 'numero_annee',
    dataSource: 'evol_ouv_ferm_classes', // Source de données explicite
    available: true
  }
]
