<template>
  <section class="detailed-indicators-section" v-if="themeIndicators.length > 0">
    <h3 class="section-title">Indicateurs détaillés</h3>

    <!-- Cartes d'indicateurs compactes (4 par ligne, 2 lignes max) -->
    <div class="indicators-cards-grid">
      <button
        v-for="indicator in displayedIndicators"
        :key="indicator.id"
        class="indicator-compact-card"
        :class="{ 
          'indicator-available': indicator.available,
          'indicator-active': selectedIndicatorId === indicator.id 
        }"
        @click="$emit('indicator-selected', indicator)"
      >
        <div class="indicator-card-icon">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div class="indicator-card-content">
          <h4 class="indicator-card-title">{{ indicator.label }}</h4>
          <p class="indicator-card-subtitle">{{ indicator.description }}</p>
        </div>
        <div v-if="indicator.available" class="indicator-available-badge">
          <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { getIndicatorsByTheme, sortSubthemesByTheme } from '@/config/indicatorsConfig'

interface Indicator {
  id: string
  label: string
  subtheme?: string
  available?: boolean
  description?: string
  [key: string]: any
}

const props = defineProps({
  activeThemeId: {
    type: String,
    required: true
  },
  selectedIndicatorId: {
    type: String,
    default: null
  },
  modelValue: {
    type: String,
    default: null
  }
})

const emit = defineEmits<{
  (e: 'indicator-selected', indicator: Indicator): void
  (e: 'update:modelValue', value: string | null): void
}>()

const themeIndicators = computed<Indicator[]>(() => {
  return getIndicatorsByTheme(props.activeThemeId)
})

const subthemes = computed<string[]>(() => {
  const subthemesList = [...new Set(themeIndicators.value.map(ind => ind.subtheme).filter((s): s is string => !!s))]
  // Utiliser la fonction de tri personnalisée selon le thème
  return sortSubthemesByTheme(props.activeThemeId, subthemesList)
})

// Utiliser directement props.modelValue pour le filtrage, avec une valeur par défaut
const selectedSubtheme = computed({
  get: () => props.modelValue,
  set: (value: string | null) => {
    emit('update:modelValue', value)
  }
})

// Réinitialiser avec la première sous-thématique quand le thème change
watch(() => props.activeThemeId, () => {
  if (subthemes.value.length > 0) {
    emit('update:modelValue', subthemes.value[0] ?? null)
  } else {
    emit('update:modelValue', null)
  }
})

// Initialiser avec la première sous-thématique au premier chargement si aucune n'est sélectionnée
watch([subthemes, () => props.modelValue], ([newSubthemes, currentValue]) => {
  if (newSubthemes.length > 0 && !currentValue) {
    emit('update:modelValue', newSubthemes[0] ?? null)
  }
}, { immediate: true })

const filteredIndicators = computed<Indicator[]>(() => {
  const currentSubtheme = props.modelValue
  if (!currentSubtheme) {
    return themeIndicators.value // Afficher tous les indicateurs si "Tous" est sélectionné
  }
  return themeIndicators.value.filter(ind => ind.subtheme === currentSubtheme)
})

const displayedIndicators = computed<Indicator[]>(() => {
  // Limiter à 8 indicateurs max (4 par ligne x 2 lignes)
  return filteredIndicators.value.slice(0, 8)
})

const getIndicatorsCountForSubtheme = (subtheme: string) => {
  return themeIndicators.value.filter(ind => ind.subtheme === subtheme).length
}
</script>

<style scoped>
.detailed-indicators-section {
  margin: 0;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #323F4B;
  margin: 0 0 20px 0;
  letter-spacing: -0.01em;
}

/* Grille de cartes compactes (4 par ligne) */
.indicators-cards-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.indicator-compact-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 10px;
  border: 1px solid rgba(229, 231, 235, 0.8);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
  text-align: left;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  min-height: 120px;
}

.indicator-compact-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: rgba(10, 61, 98, 0.3);
}

.indicator-compact-card.indicator-active {
  background: linear-gradient(135deg, rgba(10, 61, 98, 0.05) 0%, rgba(255, 255, 255, 0.95) 100%);
  border-color: rgba(10, 61, 98, 0.4);
  box-shadow: 0 4px 12px rgba(10, 61, 98, 0.12);
}

.indicator-compact-card.indicator-available {
  border-color: rgba(34, 197, 94, 0.2);
}

.indicator-card-icon {
  color: #0A3D62;
  opacity: 0.7;
}

.indicator-card-content {
  flex: 1;
}

.indicator-card-title {
  font-size: 14px;
  font-weight: 600;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #323F4B;
  margin: 0 0 4px 0;
  line-height: 1.4;
}

.indicator-card-subtitle {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.indicator-available-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: rgba(34, 197, 94, 0.1);
  border-radius: 50%;
  color: #22c55e;
}

@media (max-width: 1200px) {
  .indicators-cards-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .indicators-cards-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .indicators-cards-grid {
    grid-template-columns: 1fr;
  }
}
</style>

