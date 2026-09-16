/**
 * Prépare les jeux de données utilisés par les planches PDF.
 * L’objectif est d’isoler ici la logique de transformation pour garder
 * des composants d’affichage simples et bien documentés.
 *
 * COMPARATIF_METROPOLES : jeu d’exemple d’instance (chiffres Rennes).
 * Une autre agence remplace ce tableau par son comparatif.
 */
import { computed } from 'vue'

// Jeu de données statique pour l'exemple comparatif (à affiner avec de vraies données API)
const COMPARATIF_METROPOLES = [
  { label: 'Eurométropole de Strasbourg', value: 2.09 },
  { label: 'Métropole Grenoble-Alpes-Métropole', value: 2.07 },
  { label: 'Métropole Rouen Normandie', value: 2.04 },
  { label: 'Nantes Métropole', value: 2.03 },
  { label: 'Rennes Métropole', value: 2.02 },
  { label: 'Montpellier Méditerranée Métropole', value: 1.99 },
  { label: 'Bordeaux Métropole', value: 1.98 },
  { label: 'Toulouse Métropole', value: 1.94 }
]

/**
 * Création de datasets « fallback » pour les graphiques barres par type.
 * On clone les données du donut pour proposer une vue alternative si besoin.
 */
const buildEvolutionByType = (repartition = []) => {
  return repartition.map(item => ({
    label: item.label,
    value: item.value,
    comparaison: Math.max(Math.round(item.value * 0.8), 1) // valeur fictive
  }))
}

export function usePrintData(chartDataRef, evolutionDataRef) {
  /**
   * datasets.value :
   * {
   *   demographie: {
   *     repartitionTypes: [...],
   *     tailleMoyenne: [...],
   *     evolutionTypes: [...],
   *     comparatifMetropoles: [...]
   *   },
   *   ...
   * }
   */
  const datasets = computed(() => {
    const demographieCharts = chartDataRef.value?.demographie || []
    const evolution = evolutionDataRef.value || []

    return {
      demographie: {
        repartitionTypes: demographieCharts,
        tailleMoyenne: evolution,
        evolutionTypes: buildEvolutionByType(demographieCharts),
        comparatifMetropoles: COMPARATIF_METROPOLES
      }
    }
  })

  /**
   * Récupération d'un dataset à partir d'une clé « section.sousSection ».
   * Exemple : getDatasetByKey('demographie.repartitionTypes')
   */
  const getDatasetByKey = (key) => {
    if (!key || typeof key !== 'string') return []

    const parts = key.split('.')
    let current = datasets.value

    for (const part of parts) {
      if (!current || typeof current !== 'object') {
        return []
      }
      current = current[part]
    }

    return Array.isArray(current) ? current : []
  }

  return {
    datasets,
    getDatasetByKey
  }
}

