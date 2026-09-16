/**
 * Déclarations pour modules .js importés depuis du TypeScript / Vue.
 * Évite TS7016 tant que ces fichiers ne sont pas migrés en .ts.
 */
declare module '@/utils/printFormatters' {
  export function formatNumber(value: number | string | null | undefined): string
  export function formatDate(
    date: Date | string | number,
    options?: Intl.DateTimeFormatOptions
  ): string
  export function formatPercent(value: number, isDecimal?: boolean): string
}

declare module '@/utils/printChartHelpers' {
  export const PRINT_CHART_DIMENSIONS: {
    DONUT: { width: number; height: number }
    BAR: { width: number; height: number }
    LINE: { width: number; height: number }
  }
}

declare module '@/composables/useDynamicPrintLayout' {
  import type { Ref } from 'vue'
  export function useDynamicPrintLayout(
    chartData: Ref<unknown>,
    evolutionData: Ref<unknown>
  ): {
    getLayoutForTheme: (theme: unknown) => Record<string, unknown> | null | undefined
    countChartsInLayout: (layout: unknown) => number
  }
}

declare module '@/composables/useMapData' {
  export function useMapData(): {
    loadCommunesData: (dep: string) => Promise<{ features?: unknown[] } | null>
  }
}

declare module '@/composables/usePrintReady' {
  import type { Ref } from 'vue'
  export function usePrintReady(): {
    isReady: Ref<boolean>
    handleMapReady: () => void
    handleChartReady: () => void
    setExpectedCharts: (n: number) => void
    setupSafetyTimeout: (ms: number) => void
    mapReady: Ref<boolean>
    chartsReady: Ref<boolean>
  }
}

declare module '@/composables/usePrintCharts' {
  export function usePrintCharts(props: unknown): {
    getResolvedDataset: (chart: unknown) => unknown
    getChartDimensions: (chart: unknown) => unknown
  }
}
