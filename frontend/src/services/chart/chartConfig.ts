/**
 * Service pour la configuration des graphiques Chart.js
 * Centralise les options par défaut et les configurations spécifiques par type
 */
import {
  SPACING,
  DEFAULT_DATALABELS_CONFIG,
  DEFAULT_LEGEND_CONFIG,
  DEFAULT_TOOLTIP_CONFIG
} from './chartConstants'
import { createAxisConfig } from './chartHelpers'
import { externalTooltipHandler } from './chartTooltip'

// Configuration de base responsive - Style propre et professionnel
export const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: SPACING.padding.chart
  },
  plugins: {
    datalabels: {
      // display + styles : DEFAULT_DATALABELS_CONFIG (évite clé dupliquée TS2783)
      ...DEFAULT_DATALABELS_CONFIG
    },
    legend: DEFAULT_LEGEND_CONFIG,
    tooltip: {
      ...DEFAULT_TOOLTIP_CONFIG,
      enabled: false, // Désactiver le tooltip natif
      external: externalTooltipHandler // Utiliser notre handler personnalisé
    }
  }
}

/**
 * Obtient les options spécifiques pour un type de graphique
 * @param {string} type - Type de graphique (bar, line, pie, doughnut, etc.)
 * @returns {Object} Options de configuration
 */
export function getTypeSpecificOptions(type: string) {
  const options = { ...defaultOptions }
  
  switch (type) {
    case 'bar':
      return getBarOptions(options)
        
    case 'line':
      return getLineOptions(options)
        
    case 'pie':
    case 'doughnut':
      return getCircularOptions(options, type)
        
    case 'radar':
      return getRadarOptions(options)
        
    default:
      return options
  }
}

/**
 * Options spécifiques pour les graphiques en barres
 * Chart.js 4 : les options de barres vont dans datasets.bar et elements.bar
 * @param {Object} baseOptions - Options de base
 * @returns {Object} Options configurées
 */
function getBarOptions(baseOptions: any) {
  baseOptions.scales = {
    y: {
      beginAtZero: true,
      grid: {
        display: false, // Pas de grille horizontale derrière les barres
        drawBorder: false,
      },
      ticks: { font: { family: 'Inter' }, color: '#64748B' }
    },
    x: {
      grid: { display: false },
      ticks: { font: { family: 'Inter' }, color: '#64748B' }
    }
  }

  // Chart.js 4 : borderRadius dans elements.bar
  baseOptions.elements = {
    ...(baseOptions.elements || {}),
    bar: {
      borderRadius: 6 // Arrondir le haut des barres uniquement
    }
  }

  // Chart.js 4 : categoryPercentage, barPercentage, maxBarThickness dans datasets.bar
  // Ces options contrôlent l'espacement entre les barres et les groupes
  baseOptions.datasets = {
    ...(baseOptions.datasets || {}),
    bar: {
      categoryPercentage: 0.5,  // Espace occupé par le groupe dans la catégorie
      barPercentage: 0.65,      // Espace occupé par chaque barre dans le groupe
      maxBarThickness: 60       // Épaisseur max pour éviter l'effet "gros pâté"
    }
  }

  return baseOptions
}

/**
 * Options spécifiques pour les graphiques linéaires
 * @param {Object} baseOptions - Options de base
 * @returns {Object} Options configurées
 */
function getLineOptions(baseOptions: any) {
  baseOptions.scales = {
    y: {
      ...createAxisConfig({ beginAtZero: false }),
      ticks: {
        ...createAxisConfig().ticks,
        font: { ...createAxisConfig().ticks.font, size: 12 },
        padding: 12
      }
    },
    x: {
      ...createAxisConfig(),
      ticks: {
        ...createAxisConfig().ticks,
        font: { ...createAxisConfig().ticks.font, size: 12 },
        padding: 12
      }
    }
  }
  
  // Pillar 5: Drawing (Lissage, dégradé)
  baseOptions.elements = {
    point: { 
      radius: 4, 
      hoverRadius: 6,
      backgroundColor: 'white',
      borderWidth: 2
    },
    line: {
      tension: 0.4, // Courbes lisses (spline)
      borderWidth: 3,
      fill: 'start' // Préparation pour le dégradé (géré dans le dataset)
    }
  }
  return baseOptions
}

/**
 * Options spécifiques pour les graphiques circulaires (pie, doughnut)
 * @param {Object} baseOptions - Options de base
 * @param {string} type - Type de graphique (pie ou doughnut)
 * @returns {Object} Options configurées
 */
function getCircularOptions(baseOptions: any, type: string) {
  // 1. SUPPRESSION TOTALE DES AXES pour les camemberts
  baseOptions.scales = {
    x: { display: false },
    y: { display: false }
  }
  
  // 2. Look "Apple Health"
  baseOptions.cutout = type === 'doughnut' ? '75%' : '0%' // Anneau plus fin et élégant
  
  baseOptions.elements = {
    arc: {
      borderWidth: 2,
      borderColor: '#FFFFFF', // Séparateur blanc
      borderRadius: 5,        // <--- L'ASTUCE : Arrondir les bouts des segments
      hoverOffset: 4          // Le segment "sort" un peu au survol
    }
  }
  
  // Repositionner la légende proprement en bas
  baseOptions.plugins.legend = {
    display: true,
    position: 'bottom',
    labels: {
      usePointStyle: true, // Utiliser des ronds au lieu de carrés dans la légende
      padding: 20,
      font: { family: 'Inter', size: 12 },
      color: '#64748B' // Gris doux
    }
  }
  
  return baseOptions
}

/**
 * Options spécifiques pour les graphiques radar
 * @param {Object} baseOptions - Options de base
 * @returns {Object} Options configurées
 */
function getRadarOptions(baseOptions: any) {
  baseOptions.scales = {
    r: {
      beginAtZero: true,
      ticks: { font: { family: 'Inter', size: 11 }, backdropColor: 'transparent' },
      grid: { color: '#F3F4F6' },
      angleLines: { color: '#F3F4F6' },
      pointLabels: { font: { family: 'Inter', size: 12 } }
    }
  }
  return baseOptions
}
