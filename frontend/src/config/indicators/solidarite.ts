/**
 * Indicateurs pour la thématique Solidarité
 * Basé sur la configuration de l'ancienne application (dashboard.js)
 */

import type { Indicator } from './index'

export const solidariteIndicators: Indicator[] = [
  {
    id: 'solid-revenus-disponibles',
    code: 'revenus_disponibles',
    label: 'Revenus disponibles par UC',
    subtheme: 'Revenus',
    theme: 'solidarite',
    unit: '€',
    description: 'Niveau de vie (Source: Insee, FiLoSoFi)',
    source: 'Insee, FiLoSoFi', // Source exacte comme dans l'ancienne app
    chartType: 'bar',
    chartPreset: 'chartClassicBarNoLegend', // Configuration prédéfinie Chart.js
    options: { indexAxis: 'y' },
    apiField: 'val',
    labelField: 'indicateurs', // Le label vient du champ "indicateurs"
    dataSource: 'revenus_disponibles',
    available: true
  },
  {
    id: 'solid-origine-revenus',
    code: 'origine_revenus',
    label: 'Origine des revenus disponibles par UC',
    subtheme: 'Revenus',
    theme: 'solidarite',
    unit: '%',
    description: 'Origine des revenus (Source: Insee, FiLoSoFi)',
    source: 'Insee, FiLoSoFi', // Source exacte comme dans l'ancienne app
    chartType: 'bar', // horizontalBar -> bar + indexAxis: y
    chartPreset: 'chartClassicBarPercentNoLegend', // Configuration prédéfinie Chart.js
    options: { indexAxis: 'y' },
    apiField: 'val',
    labelField: 'indicateurs',
    dataSource: 'origine_revenus',
    available: true
  }
]
