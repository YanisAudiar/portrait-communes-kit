<template>
  <div class="cover-right-column" :style="{ '--theme-color': themeColor }">
    <div v-if="visibleKpis.length > 0" class="kpis-container">
      <div v-if="visibleKpis[0]" class="kpi-main">
        <div class="kpi-main-icon" :style="{ color: themeColor }">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path :d="getIconPath(visibleKpis[0].icon)" />
          </svg>
        </div>
        <div class="kpi-main-value">{{ formatKPIValue(visibleKpis[0]) }}</div>
        <div class="kpi-main-label">{{ visibleKpis[0].label }}</div>
      </div>
      <div v-if="visibleKpis.length > 1" class="kpis-secondary-wrapper">
        <div v-for="(kpi, index) in visibleKpis.slice(1, 3)" :key="kpi.label || index" class="kpi-secondary-item">
          <svg class="kpi-arc" :class="`arc-${index === 0 ? 'left' : 'right'}`" viewBox="0 0 100 50" preserveAspectRatio="none">
            <path d="M 0 50 Q 50 0, 100 50" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="1" stroke-dasharray="4,4" />
          </svg>
          <div class="kpi-secondary-value">{{ formatKPIValue(kpi) }}</div>
          <div class="kpi-secondary-label">{{ kpi.label }}</div>
        </div>
      </div>
    </div>
    <div v-else class="no-kpis">
      <p>Aucun chiffre clé disponible</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface KpiItem {
  label: string
  value: string | number
  format?: string
  icon?: string
  decimals?: number
  /** Aligné avec KPI : exclu de la couverture PDF (emplacement réservé à l’écran seulement). */
  visuallyHidden?: boolean
}

const props = withDefaults(
  defineProps<{
    kpis: KpiItem[]
    themeColor?: string
  }>(),
  { themeColor: '#7067A3' }
)

const visibleKpis = computed(() => (props.kpis || []).filter((k) => !k.visuallyHidden))

const DEFAULT_USER_ICON =
  'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'

function getIconPath(iconType: string | undefined): string {
  const iconPaths: Record<string, string> = {
    users: DEFAULT_USER_ICON,
    trend: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
    chart: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
  }
  return iconPaths[iconType ?? ''] ?? DEFAULT_USER_ICON
}

function formatKPIValue(kpi: KpiItem): string | number {
  const val = typeof kpi.value === 'string' ? parseFloat(kpi.value) : kpi.value
  if (isNaN(val as number)) return kpi.value
  switch (kpi.format) {
    case 'percentage':
      return `${(val as number).toFixed(1).replace('.', ',')}%`
    case 'currency':
      return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val as number)
    case 'number':
    default:
      if (kpi.decimals !== undefined && kpi.decimals !== null) {
        return (val as number).toFixed(kpi.decimals).replace('.', ',')
      }
      return new Intl.NumberFormat('fr-FR').format(Math.round(val as number))
  }
}
</script>

<style scoped>
.cover-right-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 10px 0;
  position: relative;
}

.kpis-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 15px;
  width: 100%;
  height: 100%;
  position: relative;
}

.kpi-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}

.kpi-main-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.9;
  margin-bottom: 4px;
}

.kpi-main-value {
  font-size: 48px;
  font-weight: 700;
  color: var(--theme-color, #7067a3);
  font-family: 'Montserrat', sans-serif;
  line-height: 1.1;
  text-align: center;
}

.kpi-main-label {
  font-size: 11px;
  color: rgba(44, 62, 80, 0.7);
  font-family: 'Lato', sans-serif;
  text-align: center;
  line-height: 1.3;
  max-width: 280px;
}

.kpis-secondary-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: flex-end;
  width: 100%;
  margin-top: auto;
  padding-top: 20px;
  position: relative;
}

.kpi-secondary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  position: relative;
  flex: 1;
  max-width: 45%;
}

.kpi-arc {
  position: absolute;
  width: 80px;
  height: 40px;
  top: -25px;
  opacity: 0.4;
}

.kpi-arc.arc-left {
  left: 50%;
  transform: translateX(-50%) scaleX(-1);
}

.kpi-arc.arc-right {
  right: 50%;
  transform: translateX(50%);
}

.kpi-secondary-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--theme-color, #7067a3);
  font-family: 'Montserrat', sans-serif;
  line-height: 1.1;
  text-align: center;
}

.kpi-secondary-label {
  font-size: 10px;
  color: rgba(44, 62, 80, 0.7);
  font-family: 'Lato', sans-serif;
  text-align: center;
  line-height: 1.2;
  max-width: 200px;
}

.no-kpis {
  text-align: center;
  color: rgba(44, 62, 80, 0.5);
  font-size: 14px;
  font-family: 'Lato', sans-serif;
}
</style>
