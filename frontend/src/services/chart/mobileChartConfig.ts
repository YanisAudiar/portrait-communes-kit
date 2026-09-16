/**
 * Configuration responsive pour les graphiques Chart.js
 * Optimise l'affichage des graphiques sur mobile et tablette
 */
import { FONT_FAMILY } from './chartConstants'

/**
 * Détecte le type d'appareil
 */
export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  if (typeof window === 'undefined') return 'desktop'
  const width = window.innerWidth
  if (width < 480) return 'mobile'
  if (width < 768) return 'tablet'
  return 'desktop'
}

/**
 * Retourne un breakpoint fin pour ré-init des graphiques au resize
 */
export const getResponsiveBreakpoint = (): string => {
  if (typeof window === 'undefined') return 'desktop'
  const width = window.innerWidth
  if (width < 360) return 'xs'
  if (width < 480) return 'mobile'
  if (width < 768) return 'tablet'
  return 'desktop'
}

/**
 * Vérifie si l'appareil est tactile
 */
export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

/**
 * Configuration des plugins selon l'appareil
 */
export const getMobilePluginConfig = (chartType: string, showLegend: boolean = true) => {
  const device = getDeviceType()
  const isTouch = isTouchDevice()
  
  const isSmallMobile = typeof window !== 'undefined' && window.innerWidth < 360
  const legendFontSize = isSmallMobile ? 9 : device === 'mobile' ? 10 : 12
  const legendConfig = {
    display: showLegend,
    position: device === 'mobile' ? 'bottom' : 'top' as const,
    align: 'center' as const,
    labels: {
      boxWidth: isSmallMobile ? 8 : device === 'mobile' ? 10 : 15,
      padding: isSmallMobile ? 4 : device === 'mobile' ? 6 : 12,
      font: {
        family: FONT_FAMILY,
        size: legendFontSize,
        weight: '500' as const
      },
      usePointStyle: true
    }
  }

  // Réduire la légende sur mobile pour les graphiques circulaires
  if ((chartType === 'pie' || chartType === 'doughnut') && device === 'mobile') {
    legendConfig.labels.boxWidth = isSmallMobile ? 6 : 8
    legendConfig.labels.padding = 4
    legendConfig.labels.font.size = isSmallMobile ? 8 : 9
  }

  // Barres empilées (multi-séries) : légende toujours lisible sur mobile pour distinguer les segments
  if (chartType === 'bar' && device === 'mobile' && showLegend) {
    legendConfig.labels.font.size = isSmallMobile ? 9 : 10
    legendConfig.labels.padding = isSmallMobile ? 4 : 6
  }
  
  // Configuration des tooltips optimisée pour tactile
  const tooltipConfig = {
    enabled: true,
    mode: 'nearest' as const,
    intersect: isTouch ? false : true,
    titleFont: {
      size: isSmallMobile ? 10 : device === 'mobile' ? 11 : 14,
      weight: '600' as const
    },
    bodyFont: {
      size: isSmallMobile ? 9 : device === 'mobile' ? 10 : 12
    },
    padding: isSmallMobile ? 6 : device === 'mobile' ? 8 : 12,
    cornerRadius: 8,
    displayColors: device !== 'mobile',
    // Pour tactile, garder le tooltip plus longtemps
    animation: {
      duration: isTouch ? 200 : 150
    }
  }
  
  return {
    legend: legendConfig,
    tooltip: tooltipConfig,
    datalabels: {
      display: device === 'desktop', // Masquer les datalabels sur mobile
      font: {
        size: device === 'mobile' ? 9 : 11
      }
    }
  }
}

/**
 * Configuration des échelles selon l'appareil
 */
export const getMobileScalesConfig = (chartType: string) => {
  const device = getDeviceType()
  
  // Pas d'échelles pour les graphiques circulaires
  if (chartType === 'pie' || chartType === 'doughnut') {
    return undefined
  }
  
  const isSmallMobile = typeof window !== 'undefined' && window.innerWidth < 360
  const tickFontSize = isSmallMobile ? 8 : device === 'mobile' ? 9 : 11
  const tickConfig = {
    font: { size: tickFontSize },
    maxTicksLimit: device === 'mobile' ? 5 : 10
  }

  return {
    x: {
      ticks: {
        ...tickConfig,
        maxRotation: device === 'mobile' ? 45 : 0,
        minRotation: device === 'mobile' ? 45 : 0,
        autoSkip: true,
        autoSkipPadding: isSmallMobile ? 6 : device === 'mobile' ? 10 : 20
      },
      grid: { display: false }
    },
    y: {
      ticks: {
        ...tickConfig,
        callback: function(value: number) {
          // Formater les grands nombres sur mobile
          if (device === 'mobile' && value >= 1000) {
            return (value / 1000).toFixed(0) + 'k'
          }
          return value
        }
      },
      grid: { display: false },
      beginAtZero: true
    }
  }
}

/**
 * Configuration du layout selon l'appareil
 */
export const getMobileLayoutConfig = () => {
  const device = getDeviceType()
  
  return {
    padding: {
      top: device === 'mobile' ? 8 : 16,
      right: device === 'mobile' ? 8 : 16,
      bottom: device === 'mobile' ? 16 : 24, // Plus d'espace en bas pour la légende
      left: device === 'mobile' ? 8 : 16
    }
  }
}

/**
 * Hauteur recommandée selon le type de graphique et l'appareil
 */
export const getRecommendedHeight = (chartType: string, baseHeight: number = 300): number => {
  const device = getDeviceType()
  
  const heightMultipliers: Record<string, Record<string, number>> = {
    mobile: {
      bar: 0.7,
      line: 0.75,
      pie: 0.8,
      doughnut: 0.8,
      radar: 0.9,
      polarArea: 0.85,
      default: 0.75
    },
    tablet: {
      bar: 0.85,
      line: 0.9,
      pie: 0.9,
      doughnut: 0.9,
      radar: 0.95,
      polarArea: 0.9,
      default: 0.85
    },
    desktop: {
      default: 1
    }
  }
  
  const multipliers = heightMultipliers[device] ?? heightMultipliers.desktop
  const multiplier =
    (multipliers as Record<string, number>)[chartType] ??
    (multipliers as { default?: number }).default ??
    1
  
  // Hauteurs minimum et maximum
  const minHeight = device === 'mobile' ? 180 : 220
  const maxHeight = device === 'mobile' ? 280 : 400
  
  const calculatedHeight = Math.round(baseHeight * multiplier)
  return Math.max(minHeight, Math.min(maxHeight, calculatedHeight))
}

/**
 * Configuration complète mobile pour un graphique
 */
export const getMobileChartConfig = (
  chartType: string, 
  showLegend: boolean = true,
  baseHeight: number = 300
) => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    layout: getMobileLayoutConfig(),
    plugins: getMobilePluginConfig(chartType, showLegend),
    scales: getMobileScalesConfig(chartType),
    recommendedHeight: getRecommendedHeight(chartType, baseHeight),
    // Options d'interaction optimisées pour tactile
    interaction: {
      mode: 'nearest' as const,
      intersect: !isTouchDevice(),
      axis: 'xy' as const
    },
    // Animation plus courte sur mobile
    animation: {
      duration: getDeviceType() === 'mobile' ? 300 : 500
    }
  }
}

/**
 * Options spécifiques pour les graphiques en barres (simples et empilées)
 * Chart.js 4 : les options de barres vont dans datasets.bar et elements.bar
 * categoryPercentage / barPercentage bas = espace visible entre les années et entre les barres
 * Note : pas de barThickness fixe → Chart.js calcule automatiquement selon l'espace disponible
 */
export const getMobileBarConfig = () => {
  const device = getDeviceType()
  const isSmallMobile = typeof window !== 'undefined' && window.innerWidth < 360

  return {
    datasets: {
      bar: {
        maxBarThickness: device === 'mobile' ? 30 : 50,
        categoryPercentage: isSmallMobile ? 0.42 : device === 'mobile' ? 0.46 : 0.5,
        barPercentage: isSmallMobile ? 0.58 : device === 'mobile' ? 0.62 : 0.65
      }
    },
    elements: {
      bar: {
        borderRadius: isSmallMobile ? 3 : device === 'mobile' ? 4 : 6
      }
    }
  }
}

/**
 * Options spécifiques pour les graphiques circulaires sur mobile
 */
export const getMobilePieConfig = (chartType: 'pie' | 'doughnut') => {
  const device = getDeviceType()
  
  if (chartType === 'doughnut') {
    return {
      cutout: device === 'mobile' ? '55%' : '60%',
      radius: device === 'mobile' ? '85%' : '90%'
    }
  }
  
  return {
    radius: device === 'mobile' ? '85%' : '90%'
  }
}

/**
 * Options spécifiques pour les graphiques en ligne sur mobile
 * Chart.js 4 : ces options vont dans elements.point et elements.line
 */
export const getMobileLineConfig = () => {
  const device = getDeviceType()
  
  return {
    elements: {
      point: {
        radius: device === 'mobile' ? 3 : 4,
        hoverRadius: device === 'mobile' ? 5 : 6
      },
      line: {
        borderWidth: device === 'mobile' ? 2 : 3,
        tension: 0.3
      }
    }
  }
}

export default {
  getDeviceType,
  getResponsiveBreakpoint,
  isTouchDevice,
  getMobilePluginConfig,
  getMobileScalesConfig,
  getMobileLayoutConfig,
  getRecommendedHeight,
  getMobileChartConfig,
  getMobileBarConfig,
  getMobilePieConfig,
  getMobileLineConfig
}
