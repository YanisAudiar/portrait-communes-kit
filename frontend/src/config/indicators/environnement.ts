/**
 * Indicateurs pour la thématique Energie-Environnement
 * Inclut : densité bocagère, consommation d'espace, énergie
 */

import type { Indicator } from './index'

export const environnementIndicators: Indicator[] = [
  {
    id: 'env-densite-bocage',
    code: 'densite_bocagere',
    label: 'Densité bocagère',
    subtheme: 'Densité bocagère',
    theme: 'energie-environnement',
    unit: 'ml/ha',
    description: 'Densité de haies en mètres linéaires par hectare',
    chartType: 'bar'
  },
  {
    id: 'env-longueur-haies',
    code: 'longueur_haies',
    label: 'Longueur de haies',
    subtheme: 'Densité bocagère',
    theme: 'energie-environnement',
    unit: 'km',
    description: 'Longueur totale de haies en kilomètres',
    chartType: 'bar'
  },
  {
    id: 'env-conso-espace',
    code: 'consommation_espace',
    label: 'Consommation d\'espace',
    subtheme: 'Consommation de l\'espace',
    theme: 'energie-environnement',
    unit: 'ha',
    description: 'Surface d\'espace naturel consommée',
    chartType: 'bar'
  },
  {
    id: 'env-part-artificialise',
    code: 'part_artificialise',
    label: 'Part d\'espaces artificialisés',
    subtheme: 'Consommation de l\'espace',
    theme: 'energie-environnement',
    unit: '%',
    description: 'Pourcentage d\'espaces artificialisés',
    chartType: 'bar'
  }
]
