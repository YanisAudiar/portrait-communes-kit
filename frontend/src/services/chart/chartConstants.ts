/**
 * Constantes communes pour les configurations de graphiques Chart.js
 * Centralise toutes les valeurs réutilisables pour améliorer la maintenabilité
 */

// Polices
export const FONT_FAMILY = 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
export const FONT_FAMILY_PRINT = "'Montserrat', 'Segoe UI', sans-serif"

// Tailles de police
export const FONT_SIZES = {
  title: 14,
  body: 12,
  label: 11,
  small: 10,
  legend: 12
}

// Poids de police
export const FONT_WEIGHTS = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700'
}

// Couleurs (Pillar 3 & Pillar 2)
export const COLORS = {
  text: {
    primary: '#374151',   // gray-700 (was #323F4B)
    secondary: '#6B7280', // gray-500 (was #7B8794)
    light: '#9CA3AF'      // gray-400 (was #94A3B8)
  },
  background: {
    tooltip: '#FFFFFF',   // White background for custom tooltip
    white: '#FFFFFF',
    light: '#F3F4F6'      // gray-100
  },
  border: {
    tooltip: '#E5E7EB',   // gray-200
    grid: '#F3F4F6'       // gray-100 (very light)
  }
}

// Padding et espacements
export const SPACING = {
  padding: {
    chart: { top: 16, bottom: 16, left: 16, right: 16 },
    print: { top: 16, bottom: 16, left: 12, right: 12 },
    tooltip: 12,
    legend: 20
  },
  ticks: {
    default: 16,
    mobile: 12
  }
}

// Configuration des axes par défaut (Pillar 2: Data-Ink Ratio)
export const DEFAULT_AXIS_CONFIG = {
  grid: {
    display: true,
    color: '#F9FAFB',   // gray-50 (très subtil)
    borderDash: [4, 4], // Pointillés plus fins
    drawBorder: false,  // Pas de bordure d'axe
    tickLength: 0       // Pas de traits sur les axes
  },
  border: {
    display: false
  },
  ticks: {
    font: {
      family: FONT_FAMILY,
      size: 11, // Un peu plus petit pour l'élégance
      weight: FONT_WEIGHTS.normal
    },
    color: COLORS.text.light, // Plus clair pour moins de bruit visuel
    padding: 8
  }
}

// Configuration de la légende par défaut
export const DEFAULT_LEGEND_CONFIG = {
  display: true,
  position: 'bottom' as const,
  align: 'start' as const, // Alignement à gauche pour un look plus moderne
  labels: {
    font: {
      family: FONT_FAMILY,
      size: 11,
      weight: FONT_WEIGHTS.medium
    },
    usePointStyle: true,
    pointStyle: 'circle',
    padding: 24, // Plus d'espace entre les items
    color: COLORS.text.secondary,
    boxWidth: 6,
    boxHeight: 6
  }
}

// Configuration du tooltip par défaut (sera remplacé par le custom HTML tooltip)
export const DEFAULT_TOOLTIP_CONFIG = {
  enabled: false, // Désactiver le tooltip natif pour utiliser le custom
  external: null, // Sera défini dans chartConfig
  position: 'nearest' as const
}

// Classes Tailwind pour le tooltip personnalisé (Pillar 4)
export const TAILWIND_TOOLTIP_CLASSES = {
  container: 'bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-100 text-sm pointer-events-none transition-opacity duration-200 absolute z-50 transform -translate-x-1/2 -translate-y-full mt-[-10px]',
  title: 'font-semibold text-gray-800 mb-1 block text-xs uppercase tracking-wide',
  body: 'text-gray-600 text-xs',
  colorBox: 'inline-block w-2 h-2 rounded-full mr-2 align-middle'
}

// Configuration des datalabels par défaut (désactivés)
export const DEFAULT_DATALABELS_CONFIG = {
  display: false, // Désactivé par défaut pour éviter le bruit visuel
  color: '#fff',
  font: {
    weight: 'bold'
  }
}
