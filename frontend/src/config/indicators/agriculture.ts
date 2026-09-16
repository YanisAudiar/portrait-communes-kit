/**
 * Indicateurs pour la thématique Agriculture
 * Documentation: docs/VIEWS_INDICATEURS_AGRICULTURE.md
 * Schema: _a_vues_baro_territoires_dev
 */

import { formatNumber } from '@/services/chart/chartHelpers'
import type { Indicator } from './index'

export const agricultureIndicators: Indicator[] = [
  // === Sous-thème: Exploitations agricoles ===
  {
    id: 'agri-evol-exploitations',
    code: 'evol_exploitations',
    label: 'Évolution du nombre d\'exploitations',
    subtheme: 'Exploitations agricoles',
    theme: 'agriculture',
    chartTheme: 'agriculture',
    unit: 'exploitations',
    description: 'Évolution du nombre d\'exploitations agricoles',
    source: 'Recensement Général Agricole (RGA)',
    chartType: 'bar',
    chartPreset: 'chartClassicBarNoLegend',
    apiField: 'ind_val',
    groupBy: 'annee',
    dataSource: 'evol_exploitations',
    available: true
  },
  {
    id: 'agri-evol-exploitations-bio',
    code: 'evol_exploitations_bio',
    label: 'Nombre d\'exploitations en bio',
    subtheme: 'Exploitations agricoles',
    theme: 'agriculture',
    chartTheme: 'agriculture',
    unit: 'exploitations',
    description: 'Évolution du nombre d\'exploitations en agriculture biologique',
    source: 'Agence Bio',
    chartType: 'bar',
    chartPreset: 'chartClassicBarNoLegend',
    apiField: 'nb_exploitation_bio',
    groupBy: 'numero_annee',
    dataSource: 'evol_exploitations_bio',
    // Axe des effectifs : graduations entières uniquement (pas de décimales)
    options: {
      scales: {
        y: {
          ticks: {
            callback: function (value: unknown) {
              const n = typeof value === 'number' ? value : parseFloat(String(value))
              if (Number.isNaN(n)) return String(value)
              return formatNumber(Math.round(n), {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              })
            }
          }
        }
      }
    },
    available: true
  },

  // === Sous-thème: Surfaces agricoles ===
  {
    id: 'agri-repartition-sau',
    code: 'repartition_sau',
    label: 'Répartition de la SAU par type de culture',
    subtheme: 'Surfaces agricoles',
    theme: 'agriculture',
    chartTheme: 'agriculture',
    unit: 'ha',
    description: 'Surface agricole utile par type de culture',
    source: 'RPG - surfaces déclarées à la PAC',
    chartType: 'doughnut',
    chartPreset: 'chartClassicDoughnut',
    labelField: 'type_culture',
    apiField: 'surface_ha',
    dataSource: 'sau',
    available: true
  },
  {
    id: 'agri-evol-sau',
    code: 'evol_sau',
    label: 'Évolution de la SAU d\'après le Recensement Agricole (ha)',
    subtheme: 'Surfaces agricoles',
    theme: 'agriculture',
    chartTheme: 'agriculture',
    unit: 'ha',
    description: 'Évolution de la Surface Agricole Utile (SAU) d\'après le Recensement Agricole',
    // Affichage carte : « Sources : Recensement Général Agricole (RGA) » (préfixe ajouté par CommuneChartsSection)
    source: 'Recensement Général Agricole (RGA)',
    chartType: 'bar',
    chartPreset: 'chartClassicBarNoLegend',
    apiField: 'ind_val',
    groupBy: 'annee',
    dataSource: 'sau_evol',
    available: true
  },

  // === Sous-thème: Exploitations agricoles (ex-Démographie agricole) ===
  // Remplacé : "Évolution des ETP agricoles" → "Évolution du nombre d'exploitations" (v_agri_exploitation_evol_par_com)
  // L'indicateur agri-evol-exploitations ci-dessus utilise déjà cette vue
]
