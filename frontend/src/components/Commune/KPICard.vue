<template>
  <div
    class="kpi-card"
    :class="{ 'kpi-card--visually-hidden': visuallyHidden }"
    :title="fullLabel"
    :aria-hidden="visuallyHidden ? 'true' : undefined"
  >
    <div class="kpi-icon-wrapper" :class="trendClass">
      <!-- Indicateur de tendance pour les pourcentages / taux d'évolution -->
      <svg v-if="hasTrend && trendDirection === 'up'" class="kpi-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
      <svg v-else-if="hasTrend && trendDirection === 'down'" class="kpi-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
        <polyline points="17 18 23 18 23 12" />
      </svg>
      <svg v-else-if="hasTrend && trendDirection === 'stable'" class="kpi-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="15 8 19 12 15 16" />
      </svg>
      <!-- Icône standard si pas de tendance -->
      <svg v-else class="kpi-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="iconPath" />
      </svg>
    </div>
    <div class="kpi-content">
      <div class="kpi-value-row">
        <span class="kpi-value">{{ formattedValue }}</span>
        <!-- Badge de tendance (flèche colorée à côté de la valeur) -->
        <span v-if="hasTrend" class="kpi-trend-badge" :class="trendClass">
          <span class="kpi-trend-arrow">{{ trendArrow }}</span>
        </span>
      </div>
      <div class="kpi-label">{{ shortLabel }}</div>
      <!-- Contexte comparatif : benchmark du territoire d'étude -->
      <div v-if="hasBenchmark" class="kpi-benchmark">
        <span class="kpi-benchmark-label">{{ benchmarkDisplayLabel }}</span>
        <span class="kpi-benchmark-value">{{ formattedBenchmark }}</span>
      </div>
      <!-- Tooltip texte complet si le libellé a été raccourci -->
      <div v-if="isLabelTruncated" class="kpi-label-full">{{ fullLabel }}</div>
    </div>
    <div v-if="idKpi && !isSharePage" class="kpi-actions">
      <button class="btn-share-kpi" @click.stop="handleShare" title="Partager ce chiffre">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="18" cy="5" r="3"></circle>
          <circle cx="6" cy="12" r="3"></circle>
          <circle cx="18" cy="19" r="3"></circle>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSocialShare } from '@/composables/useSocialShare'
import { siteConfig } from '@/config/site'

interface Props {
  value: number | string
  label: string
  icon?: string
  format?: 'number' | 'percentage' | 'currency' | string
  idKpi?: string
  theme?: string
  territoire?: string
  /** Libellé court (optionnel) — si fourni, le label complet devient tooltip */
  shortLabelProp?: string
  /** Indique si cette valeur est un taux/tendance (affiche flèche directionnelle) */
  isTrend?: boolean
  /** Valeur de benchmark du territoire d'étude pour contexte comparatif */
  benchmarkRM?: number
  /** Libellé du benchmark (ex: "médiane RM") — fourni par le parent ; sinon sigle du territoire */
  benchmarkLabel?: string
  /** Nombre de décimales à afficher (pour format number) */
  decimals?: number
  /** Affichage texte à la place de la valeur (ex. « — » si donnée absente en base) */
  valueDisplayOverride?: string
  /** Carte invisible mais présente dans la grille (réserve l’espace) */
  visuallyHidden?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'users',
  format: 'number',
  shortLabelProp: '',
  isTrend: false,
  benchmarkRM: undefined,
  benchmarkLabel: '',
  visuallyHidden: false
})

const iconPaths: Record<string, string> = {
  users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  trend: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
  calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  chart: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
}

const iconPath = computed(() => iconPaths[props.icon] || iconPaths.users)

/** Détermine si l'indicateur représente une tendance (taux/évolution) */
const hasTrend = computed(() => {
  if (props.valueDisplayOverride) return false
  if (props.isTrend) return true
  // Auto-détection : les KPIs avec icon "trend" ou format "percentage" qui contiennent "taux" ou "évolution"
  const labelLower = props.label.toLowerCase()
  return (props.icon === 'trend' || props.format === 'percentage') &&
    (labelLower.includes('taux') || labelLower.includes('évolution') || labelLower.includes('evolution'))
})

/** Direction de la tendance : up, down ou stable */
const trendDirection = computed(() => {
  if (!hasTrend.value) return null
  const val = typeof props.value === 'string' ? parseFloat(props.value) : props.value
  if (isNaN(val)) return null
  if (val > 0.1) return 'up'
  if (val < -0.1) return 'down'
  return 'stable'
})

/** Flèche textuelle pour le badge de tendance */
const trendArrow = computed(() => {
  if (trendDirection.value === 'up') return '\u2197'
  if (trendDirection.value === 'down') return '\u2198'
  return '\u2192'
})

/** Classe CSS pour la couleur de tendance */
const trendClass = computed(() => {
  if (!hasTrend.value) return ''
  if (trendDirection.value === 'up') return 'trend-positive'
  if (trendDirection.value === 'down') return 'trend-negative'
  return 'trend-stable'
})

/** Le libellé complet (pour tooltip) */
const fullLabel = computed(() => props.label)

/**
 * Raccourcit automatiquement les libellés trop longs.
 * Supprime les mentions de périodes et simplifie les formulations.
 */
const shortLabel = computed(() => {
  if (props.shortLabelProp) return props.shortLabelProp

  let text = props.label
  // Raccourcir "sur la période XXXX-XXXX" → "(XXXX-XXXX)"
  text = text.replace(/\s+sur la période\s+(\d{4}-\d{4})/, ' ($1)')
  // Raccourcir "Taux d'évolution par an" → "Évolution annuelle"
  text = text.replace(/Taux d'évolution par an/, 'Évol. annuelle')
  // Raccourcir "Nombre d'habitants" → "Habitants"
  text = text.replace(/Nombre d'habitants/, 'Habitants')
  // Raccourcir "Nombre de ménages" → "Ménages"
  text = text.replace(/Nombre de ménages/, 'Ménages')
  // Raccourcir "Nombre d'actifs parmi les 15-64 ans" → "Actifs 15-64 ans"
  text = text.replace(/Nombre d'actifs parmi les 15-64 ans/, 'Actifs 15-64 ans')
  // Raccourcir "Gain d'habitants par an" → "Gain annuel"
  text = text.replace(/Gain d'habitants par an/, 'Gain annuel')
  // Raccourcir "Part des moins de 20 ans" → "< 20 ans"
  text = text.replace(/Part des moins de 20 ans/, '< 20 ans')
  // Raccourcir "Part des plus de 60 ans" → "> 60 ans"
  text = text.replace(/Part des plus de 60 ans/, '> 60 ans')
  // Raccourcir "Part des personnes seules" → "Personnes seules"
  text = text.replace(/Part des personnes seules/, 'Pers. seules')
  // Raccourcir "Taille moyenne des ménages" → "Taille moy. ménages"
  text = text.replace(/Taille moyenne des ménages/, 'Taille moy. ménages')
  // Raccourcir "Indice de jeunesse" → "Ind. jeunesse"
  text = text.replace(/Indice de jeunesse/, 'Ind. jeunesse')

  return text
})

/** Indique si le libellé a été raccourci (pour afficher le tooltip) */
const isLabelTruncated = computed(() => shortLabel.value !== props.label)

/** Benchmark RM : indique si une valeur de référence est disponible */
const hasBenchmark = computed(() => props.benchmarkRM !== undefined && props.benchmarkRM !== null)

/** Label du benchmark affiché (ex: "médiane RM :") */
const benchmarkDisplayLabel = computed(
  () => props.benchmarkLabel || `${siteConfig.territory.shortName} :`
)

/** Valeur de benchmark formatée selon le même format que la valeur principale */
const formattedBenchmark = computed(() => {
  if (!hasBenchmark.value) return ''
  const val = props.benchmarkRM!
  switch (props.format) {
    case 'percentage': {
      const d =
        props.decimals !== undefined && props.decimals !== null ? props.decimals : 1
      return `${val.toFixed(d).replace('.', ',')}%`
    }
    case 'currency':
      return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val)
    default:
      if (props.decimals !== undefined && props.decimals !== null) {
        return val.toFixed(props.decimals).replace('.', ',')
      }
      return new Intl.NumberFormat('fr-FR').format(Math.round(val))
  }
})

const formattedValue = computed(() => {
  if (props.valueDisplayOverride) return props.valueDisplayOverride

  const val = typeof props.value === 'string' ? parseFloat(props.value) : props.value

  if (isNaN(val)) return props.value

  switch (props.format) {
    case 'percentage': {
      const d =
        props.decimals !== undefined && props.decimals !== null ? props.decimals : 1
      return `${val.toFixed(d).replace('.', ',')}%`
    }
    case 'currency':
      return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val)
    default:
      // Si decimals est fourni, afficher les décimales (ex: indice de jeunesse, taille moyenne ménages)
      if (props.decimals !== undefined && props.decimals !== null) {
        return val.toFixed(props.decimals).replace('.', ',')
      }
      return new Intl.NumberFormat('fr-FR').format(Math.round(val))
  }
})

const isSharePage = computed(() => window.location.pathname === '/share')

const { copyToClipboard } = useSocialShare()

const handleShare = async () => {
  if (!props.idKpi || !props.territoire || isSharePage.value) return

  const shareUrl = new URL(`${window.location.origin}/share`)
  shareUrl.searchParams.append('idKpi', props.idKpi)
  shareUrl.searchParams.append('territoire', props.territoire)
  if (props.theme) {
    shareUrl.searchParams.append('theme', props.theme)
  }

  const url = shareUrl.toString()
  
  const success = await copyToClipboard(url)
  if (success) {
    window.open(url, '_blank')
  }
}
</script>

<style scoped>
.kpi-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: white;
  border-radius: 16px;
  border: 1px solid rgba(229, 231, 235, 0.8);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  flex: 1;
  position: relative;
}

/* Emplacement réservé : pas visible ni cliquable, mais occupe la cellule de grille */
.kpi-card--visually-hidden {
  visibility: hidden;
  pointer-events: none;
}

.kpi-card--visually-hidden:hover {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transform: none;
}

.kpi-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
}

/* Wrapper icône — couleurs de tendance */
.kpi-icon-wrapper {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(107, 114, 128, 0.08);
  border-radius: 10px;
  color: #6b7280;
  transition: background 0.2s, color 0.2s;
}

.kpi-icon-wrapper.trend-positive {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.kpi-icon-wrapper.trend-negative {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.kpi-icon-wrapper.trend-stable {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.kpi-icon {
  width: 20px;
  height: 20px;
  stroke-width: 2;
}

.kpi-content {
  flex: 1;
  min-width: 0;
}

/* Ligne valeur + badge tendance — sous-titre collé juste en dessous */
.kpi-value-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 2px;
}

.kpi-value {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  font-size: 28px;
  font-weight: 700;
  color: #323F4B;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

/* Badge de tendance (flèche colorée) */
.kpi-trend-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  line-height: 1;
}

.kpi-trend-badge.trend-positive {
  color: #059669;
}

.kpi-trend-badge.trend-negative {
  color: #dc2626;
}

.kpi-trend-badge.trend-stable {
  color: #d97706;
}

.kpi-trend-arrow {
  display: inline-block;
}

.kpi-label {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 12px;
  font-weight: 400;
  color: #6b7280;
  line-height: 1.4;
}

/* Contexte comparatif — benchmark du territoire d'étude */
.kpi-benchmark {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 11px;
  line-height: 1.3;
}

.kpi-benchmark-label {
  color: #94a3b8;
  font-weight: 400;
}

.kpi-benchmark-value {
  color: #64748b;
  font-weight: 600;
}

/* Tooltip discret : libellé complet affiché au survol */
.kpi-label-full {
  display: none;
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  background: #1e293b;
  color: white;
  font-size: 11px;
  font-weight: 400;
  line-height: 1.4;
  padding: 6px 10px;
  border-radius: 6px;
  white-space: nowrap;
  max-width: 280px;
  white-space: normal;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  pointer-events: none;
}

.kpi-label-full::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: #1e293b;
}

.kpi-card:hover .kpi-label-full {
  display: block;
}

.kpi-actions {
  opacity: 0;
  transition: opacity 0.2s;
}

.kpi-card:hover .kpi-actions {
  opacity: 1;
}

.btn-share-kpi {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-share-kpi:hover {
  background: #f1f5f9;
  color: #316d7b;
}

@media (max-width: 768px) {
  .kpi-card {
    padding: 20px;
  }
  
  .kpi-value {
    font-size: 28px;
  }
  
  .kpi-label {
    font-size: 12px;
  }

  /* Sur mobile, pas de tooltip positionné — on montre le titre natif */
  .kpi-label-full {
    display: none !important;
  }
}
</style>

