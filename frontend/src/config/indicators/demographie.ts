/**
 * Indicateurs pour la thématique Démographie
 * Basé sur la configuration de l'ancienne application (dashboard.js)
 */

import { formatNumber } from '@/services/chart/chartHelpers'
import type { Indicator } from './index'

export const demographieIndicators: Indicator[] = [
  // --- Évolution de la population ---
  {
    id: 'demo-evol-pop',
    code: 'pop',
    label: 'Évolution du nombre d\'habitants',
    subtheme: 'Évolution de la population',
    theme: 'demographie',
    unit: 'habitants',
    description: 'Évolution du nombre d\'habitants (Source: Insee)',
    source: 'Insee', // Source exacte comme dans l'ancienne app
    chartType: 'bar',
    chartPreset: 'chartClassicBarNoLegend', // Configuration prédéfinie Chart.js
    apiField: 'pop',
    groupBy: 'annee',
    dataSource: 'evolution_population', // Source de données explicite
    available: true
  },
  {
    id: 'demo-taux-evol',
    code: 'tx_evol',
    label: 'TCAN (Taux de Croissance Annuel Moyen)',
    subtheme: 'Évolution de la population',
    theme: 'demographie',
    unit: '%',
    description: 'Taux de Croissance Annuel Moyen (Source: Insee)',
    source: 'Insee', // Source exacte comme dans l'ancienne app
    chartType: 'bar',
    chartPreset: 'chartClassicBarPercentNoLegend', // Configuration prédéfinie Chart.js
    apiField: 'tx_evol',
    // Axe = plage intercensitaire (borne_temp), comme « Évolution démographique annuelle moyenne » (borne_temporelle)
    labelField: 'borne_temp',
    groupBy: 'borne_temp',
    dataSource: 'evolution_population', // Source de données explicite
    // Toutes les périodes affichées : le responsive imposait autoSkip après le preset (libellés sautés)
    options: {
      scales: {
        x: {
          ticks: {
            autoSkip: false,
            maxRotation: 45,
            maxTicksLimit: 24
          }
        }
      }
    },
    available: true
  },
  {
    id: 'demo-naissances-deces',
    code: 'naissances_deces',
    label: 'Évolution du nombre de naissances et de décès domiciliés',
    subtheme: 'Évolution de la population',
    theme: 'demographie',
    unit: 'personnes',
    description: 'Comparaison naissances vs décès (Source: Insee, état civil)',
    source: 'Insee, état civil', // Source exacte comme dans l'ancienne app
    chartType: 'line',
    chartPreset: 'chartLine', // Configuration prédéfinie Chart.js
    datasets: [
      { code: 'nb_deces', label: 'Décès' },
      { code: 'nb_naissances', label: 'Naissances' }
    ],
    groupBy: 'annee',
    dataSource: 'naissances_deces', // Source de données explicite
    available: true
  },
  {
    id: 'demo-solde-naturel-migratoire',
    code: 'soldes',
    label: 'Évolution démographique annuelle moyenne',
    subtheme: 'Évolution de la population',
    theme: 'demographie',
    unit: 'personnes',
    description: 'Solde naturel (naissances - décès) et solde migratoire apparent (entrées - sorties estimées, hors migrations internes). Source: Insee, état civil.',
    source: 'Insee, état civil', // Source exacte comme dans l'ancienne app
    chartType: 'bar',
    chartPreset: 'chartStackedSum', // Configuration prédéfinie Chart.js
    options: { indexAxis: 'y' }, // Pour horizontalBar
    datasets: [
      { code: 'solde_naturel', label: 'Solde naturel' },
      { code: 'solde_migratoire_apparent', label: 'Solde migratoire apparent' }
    ],
    // Libellés des barres = plage telle que dans la vue (ex. 2016/2022), pas l’année seule
    labelField: 'borne_temporelle',
    groupBy: 'borne_temporelle',
    dataSource: 'solde_naturel_migratoire', // Source de données explicite
    showLegend: true, // Légende obligatoire pour distinguer les segments
    available: true
  },

  // --- Âge de la population ---
  {
    id: 'demo-pyramide',
    code: 'pyramide_ages',
    label: 'Pyramide des âges',
    subtheme: 'Âge de la population',
    theme: 'demographie',
    chartTheme: 'pyramid', // Palette violette Hommes/Femmes (rgba(112,97,168), rgba(175,166,210))
    unit: 'habitants',
    description: 'Répartition par âge et sexe (Source: Insee)',
    source: 'Insee', // Source exacte comme dans l'ancienne app
    chartType: 'bar', // Pyramide classique : âges en Y, barres horizontales (H/F de part et d'autre)
    chartPreset: 'chartPyramide', // Configuration prédéfinie Chart.js
    options: { indexAxis: 'y', stacked: true },
    datasets: [
      { code: 'pop_h', label: 'Hommes' },
      { code: 'pop_f', label: 'Femmes' }
    ],
    groupBy: 'lib_ta21',
    dataSource: 'pyramide_ages', // Source de données explicite
    showLegend: true, // Légende obligatoire (Hommes/Femmes)
    available: true
  },
  {
    id: 'demo-evolution-age',
    code: 'evolution_age',
    label: 'Évolution du nombre de personnes de plus de 60 ans et de moins de 20 ans',
    subtheme: 'Âge de la population',
    theme: 'demographie',
    unit: 'personnes',
    description:
      'Effectifs en fin de période intercensitaire par groupe d’âge (Source: Insee). Axe : périodes type 2006-2011, 2011-2016, 2016-2022.',
    source: 'Insee',
    // Barres groupées par période intercensitaire (effectifs, pas des %)
    chartType: 'bar',
    chartPreset: 'chartClassicBar',
    datasets: [
      { code: 'pop_moins_20ans', label: 'Moins de 20 ans' },
      { code: 'pop_plus_60ans', label: 'Plus de 60 ans' }
    ],
    groupBy: 'periode_intercensitaire',
    dataSource: 'evolution_age',
    showLegend: true,
    available: true,
    // Forcer nombres (personnes) + légende visible : évite tout format « % » résiduel
    // (Espace légende : hauteur canvas augmentée dans CommuneChartsSection pour ce type)
    options: {
      plugins: {
        legend: {
          display: true,
          position: 'bottom' as const
        },
        datalabels: {
          formatter: function (value: unknown) {
            let numValue: unknown = value
            if (typeof value === 'object' && value !== null) {
              const o = value as { value?: unknown; y?: unknown; x?: unknown }
              numValue = o.value ?? o.y ?? o.x ?? 0
            }
            const num = typeof numValue === 'number' ? numValue : parseFloat(String(numValue)) || 0
            if (num === 0 || Math.abs(num) < 0.01) return null
            return formatNumber(num)
          }
        },
        tooltip: {
          callbacks: {
            label: function (context: { dataset: { label?: string }; parsed?: { y?: number; x?: number }; raw?: unknown }) {
              const label = context.dataset.label || ''
              let raw: unknown =
                context.parsed?.y ?? context.parsed?.x ?? context.raw
              if (typeof raw === 'object' && raw !== null) {
                const o = raw as { value?: unknown; y?: unknown; x?: unknown }
                raw = o.value ?? o.y ?? o.x ?? 0
              }
              const num = typeof raw === 'number' ? raw : parseFloat(String(raw)) || 0
              const formatted = formatNumber(num)
              return label ? `${formatted} — ${label}` : formatted
            }
          }
        }
      },
      scales: {
        y: {
          ticks: {
            callback: function (value: string | number) {
              return formatNumber(typeof value === 'number' ? value : parseFloat(String(value)) || 0)
            }
          }
        }
      }
    }
  },
  {
    id: 'demo-indice-jeunesse',
    code: 'indice_jeunesse',
    label: 'Évolution de l\'indice de jeunesse',
    subtheme: 'Âge de la population',
    theme: 'demographie',
    unit: 'indice',
    description: 'Indice de jeunesse (Source: Insee)',
    source: 'Insee', // Source exacte comme dans l'ancienne app
    chartType: 'bar',
    chartPreset: 'chartClassicBarNoLegend', // Configuration prédéfinie Chart.js
    options: {
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context: any) {
              const label = context.dataset.label || ''
              const rawValue = context.parsed?.y ?? context.parsed?.x ?? context.parsed ?? context.raw
              const value =
                typeof rawValue === 'number'
                  ? rawValue
                  : parseFloat(String(rawValue)) || 0

              return `${label} : ${value.toLocaleString('fr-FR', {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1
              })}`
            }
          }
        }
      }
    },
    apiField: 'indice_jeunesse',
    groupBy: 'annee',
    dataSource: 'indice_jeunesse', // Source de données explicite
    available: true
  },

  // --- Ménages ---
  {
    id: 'demo-repartition-menages',
    code: 'repartition_menages',
    label: 'Répartition du nombre de ménages par types',
    subtheme: 'Ménages',
    theme: 'demographie',
    unit: 'ménages',
    description: 'Répartition des ménages (Source: Insee)',
    source: 'Insee', // Source exacte comme dans l'ancienne app
    chartType: 'doughnut',
    chartPreset: 'chartClassicDoughnut', // Configuration prédéfinie Chart.js
    apiField: 'nb_men',
    labelField: 'lib_type_men', // Champ utilisé pour les labels du camembert
    dataSource: 'repartition_menages', // Source de données explicite
    available: true
  },
  {
    id: 'demo-taille-menages',
    code: 'taille_moy_men',
    label: 'Évolution de la taille moyenne des ménages',
    subtheme: 'Ménages',
    theme: 'demographie',
    unit: 'personnes',
    description: 'Taille moyenne des ménages (Source: Insee)',
    source: 'Insee', // Source exacte comme dans l'ancienne app
    chartType: 'bar',
    chartPreset: 'chartClassicBarNoLegend', // Configuration prédéfinie Chart.js
    apiField: 'taille_moy_men',
    groupBy: 'numero_annee',
    dataSource: 'taille_menages', // Source de données explicite
    available: true
  },
  {
    id: 'demo-repartition-activite-15-64',
    code: 'repartition_activite_15_64',
    label: 'Répartition du nombre de 15-64 ans par type d\'activité',
    subtheme: 'Ménages',
    theme: 'demographie',
    unit: 'personnes',
    description: 'Répartition des 15-64 ans par type d\'activité (Source: Insee)',
    source: 'Insee',
    chartType: 'doughnut',
    chartPreset: 'chartClassicDoughnut', // Configuration prédéfinie Chart.js
    apiField: 'pop15p',
    labelField: 'type_act', // Champ utilisé pour les labels du camembert
    groupBy: 'numero_annee',
    dataSource: 'pop_active_type_act', // Source de données explicite
    available: true
  }
]
