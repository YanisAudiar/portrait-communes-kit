/**
 * Configuration Chart.js pour le mode normal (responsive)
 * Fusion options de base, mobile/tablette et desktop
 */
import type { ChartConfigProps, ChartOptionsConfig, ScalesConfig, ScaleConfig } from './useChartConfigTypes'
import { chartTypeUsesShareOnlyDataLabels } from './useChartConfigTypes'
import { FONT_FAMILY } from './chartConstants'
import { truncateForTooltip } from './chartHelpers'
import {
  getDeviceType,
  isTouchDevice,
  getMobilePluginConfig,
  getMobileScalesConfig,
  getMobileLayoutConfig,
  getMobileBarConfig,
  getMobilePieConfig,
  getMobileLineConfig
} from './mobileChartConfig'

/**
 * Construit les options responsive (mobile / tablette / desktop)
 */
export function buildResponsiveOptions(
  props: ChartConfigProps,
  baseOptions: Record<string, unknown>
): Record<string, unknown> {
  const device = getDeviceType()
  const isMobile = device === 'mobile'
  const isTablet = device === 'tablet'
  const isSmallMobile = typeof window !== 'undefined' && window.innerWidth < 360
  const isTouch = isTouchDevice()

  const basePlugins = (baseOptions.plugins || {}) as Record<string, unknown>
  const customPlugins = (props.chartOptions?.plugins || {}) as Record<string, unknown>

  const mobilePlugins = getMobilePluginConfig(props.type, props.showLegend)
  const mobileScales = getMobileScalesConfig(props.type)
  const mobileLayout = getMobileLayoutConfig()

  const baseScales = (baseOptions.scales || {}) as ScalesConfig
  const presetScales = props.chartOptions?.scales || {}

  // Barres horizontales : Y = catégories (libellés). Les ticks mobile (callback numérique,
  // maxTicksLimit) sont faits pour un axe de valeurs : ils affichent 0,2,4… au lieu de lib_ta21.
  const horizontalBar =
    props.type === 'bar' &&
    (props.chartOptions as Record<string, unknown> | undefined)?.indexAxis === 'y'

  const mobileYForChart = (() => {
    const raw = (mobileScales as { y?: Record<string, unknown> })?.y
    if (!horizontalBar || !raw) return raw
    const ticks = raw.ticks as Record<string, unknown> | undefined
    if (!ticks || typeof ticks !== 'object') return raw
    const { callback: _cb, maxTicksLimit: _mtl, ...ticksRest } = ticks
    return { ...raw, ticks: ticksRest }
  })()

  const buildScaleWithStacked = (
    base: ScaleConfig | undefined,
    preset: ScaleConfig | undefined,
    mobileScale: Record<string, unknown> | undefined,
    isXAxis: boolean
  ): Record<string, unknown> => {
    const result: Record<string, unknown> = {
      ...(base || {}),
      ...(mobileScale || {}),
      ...(preset || {}),
      ...(preset?.stacked !== undefined
        ? { stacked: preset.stacked }
        : base?.stacked !== undefined
          ? { stacked: base.stacked }
          : {})
    }

    // Défauts axe X (catégories) : appliqués avant le preset pour qu’un indicateur puisse forcer
    // autoSkip: false (ex. TCAN : une barre par période, tous les libellés borne_temp visibles).
    const defaultXAxisTicks = isXAxis
      ? {
          maxRotation: isMobile ? 45 : 0,
          autoSkip: true,
          autoSkipPadding: isMobile ? 10 : 20
        }
      : {}

    result.ticks = {
      ...(base?.ticks || {}),
      ...((mobileScale as Record<string, unknown>)?.ticks || {}),
      ...defaultXAxisTicks,
      ...(preset?.ticks || {}),
      font: {
        size: isSmallMobile ? 8 : isMobile ? 9 : isTablet ? 10 : 12
      }
    }

    return result
  }

  const pluginsConfig = {
    ...basePlugins,
    ...customPlugins,
    datalabels: {
      display: !isMobile && !isTablet,
      ...(customPlugins.datalabels || {}),
      // Barres / pie / doughnut : étiquettes uniquement en vue partage (/share), desktop
      ...(chartTypeUsesShareOnlyDataLabels(props.type)
        ? {
            display: props.showShareDataLabels ? !isMobile && !isTablet : false
          }
        : {})
    },
    legend: {
      ...mobilePlugins.legend,
      ...(basePlugins.legend || {}),
      ...(customPlugins.legend || {}),
      display: props.showLegend,
      position: isMobile ? 'bottom' : 'top',
      labels: {
        ...mobilePlugins.legend.labels,
        ...((basePlugins.legend as Record<string, unknown>)?.labels || {}),
        ...((customPlugins.legend as Record<string, unknown>)?.labels || {}),
        boxWidth: isMobile ? 10 : isTablet ? 12 : 15,
        padding: isMobile ? 6 : isTablet ? 8 : 12,
        font: {
          family: FONT_FAMILY,
          size: isMobile ? 10 : isTablet ? 11 : 12,
          weight: '500'
        },
        usePointStyle: true
      }
    },
    tooltip: (() => {
      const tooltipBase = (basePlugins.tooltip || {}) as Record<string, unknown>
      const tooltipCustom = (customPlugins.tooltip || {}) as Record<string, unknown>
      const hasCustomTooltip = !!(tooltipCustom.callbacks || tooltipCustom.mode)

      const defaultTooltipCallbacks = hasCustomTooltip
        ? {}
        : {
            callbacks: {
              label: function (context: { dataset: { label?: string }; parsed: unknown; raw: unknown }) {
                const label = context.dataset.label || ''
                let value: unknown

                if (props.type === 'pie' || props.type === 'doughnut') {
                  value = context.parsed || context.raw
                  if (typeof value === 'object' && value !== null) {
                    value =
                      (value as { value?: unknown }).value ??
                      (value as { y?: unknown }).y ??
                      value
                  }
                } else if (
                  context.parsed !== null &&
                  typeof context.parsed === 'object'
                ) {
                  const p = context.parsed as { y?: unknown; x?: unknown }
                  value = p.y !== undefined ? p.y : p.x
                } else {
                  value = context.parsed || context.raw
                }

                if (typeof value === 'object' && value !== null) {
                  const v = value as { value?: unknown; y?: unknown; x?: unknown }
                  value = v.value ?? v.y ?? v.x ?? 0
                }

                const numValue =
                  typeof value === 'number' ? value : parseFloat(String(value)) || 0
                const formatted = new Intl.NumberFormat('fr-FR', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2
                }).format(numValue)

                return label ? `${formatted} — ${truncateForTooltip(label)}` : formatted
              }
            }
          }

      const mergedTooltip: Record<string, unknown> = {
        ...tooltipBase,
        ...mobilePlugins.tooltip,
        ...defaultTooltipCallbacks,
        ...tooltipCustom
      }

      if ('external' in mergedTooltip) delete mergedTooltip.external

      // Chart.js 4 : position accepte 'nearest' ou 'average' (pas de callback direct)
      // 'nearest' garde le tooltip proche de l'élément survolé, idéal pour mobile
      return {
        ...mergedTooltip,
        enabled: true,
        mode: isTouch ? 'nearest' : 'index',
        intersect: isTouch ? false : true,
        titleFont: { size: isSmallMobile ? 10 : isMobile ? 11 : 14 },
        bodyFont: { size: isSmallMobile ? 9 : isMobile ? 10 : 12 },
        padding: isSmallMobile ? 6 : isMobile ? 8 : 12,
        cornerRadius: 8,
        displayColors: !isMobile,
        position: 'nearest'
      }
    })()
  }

  // Options spécifiques au type (barres, pie, lignes)
  // Pour les barres : retourne { datasets: { bar: {...} }, elements: { bar: {...} } }
  let typeSpecificConfig: Record<string, unknown> = {}
  if (props.type === 'bar') {
    typeSpecificConfig = getMobileBarConfig()
  } else if (props.type === 'pie' || props.type === 'doughnut') {
    typeSpecificConfig = getMobilePieConfig(props.type as 'pie' | 'doughnut')
  } else if (props.type === 'line') {
    typeSpecificConfig = getMobileLineConfig()
  }

  const finalScales = mobileScales
    ? {
        ...baseScales,
        ...presetScales,
        x: buildScaleWithStacked(
          baseScales.x,
          presetScales.x,
          (mobileScales as { x?: Record<string, unknown> })?.x,
          true
        ),
        y: buildScaleWithStacked(
          baseScales.y,
          presetScales.y,
          mobileYForChart,
          false
        )
      }
    : undefined

  // Deep-merge des options de base avec les options spécifiques au type
  // Nécessaire pour datasets.bar, elements.bar, etc.
  const baseDatasets = (baseOptions.datasets || {}) as Record<string, unknown>
  const typeDatasets = (typeSpecificConfig.datasets || {}) as Record<string, unknown>
  const baseElements = (baseOptions.elements || {}) as Record<string, unknown>
  const typeElements = (typeSpecificConfig.elements || {}) as Record<string, unknown>

  // Extraire les clés non-imbriquées du typeSpecificConfig (pie, line configs)
  const { datasets: _td, elements: _te, ...typeRest } = typeSpecificConfig

  // Préserver indexAxis du preset (ex: chartStackedSum) pour éviter les conflits
  // entre le merge responsive et les options du graphique (barres horizontales)
  const indexAxis = (props.chartOptions as Record<string, unknown>)?.indexAxis

  return {
    ...(indexAxis !== undefined ? { indexAxis } : {}),
    responsive: true,
    maintainAspectRatio: false,
    layout: mobileLayout,
    interaction: {
      intersect: isTouch ? false : true,
      mode: isTouch ? 'nearest' : 'index',
      axis: 'xy'
    },
    animation: {
      duration: isMobile ? 300 : 500
    },
    plugins: pluginsConfig,
    scales: finalScales,
    // Deep-merge datasets et elements
    datasets: {
      ...baseDatasets,
      bar: {
        ...((baseDatasets.bar || {}) as Record<string, unknown>),
        ...((typeDatasets.bar || {}) as Record<string, unknown>)
      }
    },
    elements: {
      ...baseElements,
      bar: {
        ...((baseElements.bar || {}) as Record<string, unknown>),
        ...((typeElements.bar || {}) as Record<string, unknown>)
      },
      point: {
        ...((baseElements.point || {}) as Record<string, unknown>),
        ...((typeElements.point || {}) as Record<string, unknown>)
      },
      line: {
        ...((baseElements.line || {}) as Record<string, unknown>),
        ...((typeElements.line || {}) as Record<string, unknown>)
      },
      arc: {
        ...((baseElements.arc || {}) as Record<string, unknown>),
        ...((typeElements.arc || {}) as Record<string, unknown>)
      }
    },
    ...typeRest
  }
}
