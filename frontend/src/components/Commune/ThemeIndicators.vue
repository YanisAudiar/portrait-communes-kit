<template>
  <!-- Mode boutons uniquement (pour affichage au-dessus des KPIs) -->
  <SubthemeFilterButtons
    v-if="showButtonsOnly && subthemes.length > 1"
    :subthemes="subthemes"
    :selected-subtheme="selectedSubtheme"
    :total-indicators="themeIndicators.length"
    :show-buttons-only="true"
    :get-indicators-count-for-subtheme="getIndicatorsCountForSubtheme"
    @update:modelValue="handleSubthemeChange"
  />

  <!-- Mode complet avec indicateurs -->
  <section v-else-if="themeIndicators.length > 0 && !showButtonsOnly" class="theme-indicators-section">
    <div class="indicators-section-header">
      <h3 class="indicators-section-title">Indicateurs disponibles</h3>
    </div>

    <!-- Boutons des sous-thématiques -->
    <SubthemeFilterButtons
      v-if="subthemes.length > 1"
      :subthemes="subthemes"
      :selected-subtheme="selectedSubtheme"
      :total-indicators="themeIndicators.length"
      :show-buttons-only="false"
      :get-indicators-count-for-subtheme="getIndicatorsCountForSubtheme"
      @update:modelValue="handleSubthemeChange"
    />

    <!-- Affichage des indicateurs filtrés -->
    <div class="indicators-content">
      <!-- Si une sous-thématique est sélectionnée, afficher uniquement ses indicateurs -->
      <template v-if="selectedSubtheme">
        <div class="subtheme-group">
          <h4 class="subtheme-group-title">{{ selectedSubtheme }}</h4>
          <div class="indicators-grid">
            <IndicatorCard
              v-for="indicator in filteredIndicators"
              :key="indicator.id"
              :indicator="indicator"
              :selected-indicator-id="selectedIndicatorId"
              @indicator-selected="$emit('indicator-selected', $event)"
            />
          </div>
        </div>
      </template>

      <!-- Sinon, afficher tous les indicateurs groupés par sous-thématique -->
      <template v-else>
        <div class="indicators-by-subtheme">
          <div
            v-for="subthemeGroup in groupedIndicators"
            :key="subthemeGroup.subtheme"
            class="subtheme-group"
          >
            <h4 class="subtheme-group-title">{{ subthemeGroup.subtheme }}</h4>
            <div class="indicators-grid">
              <IndicatorCard
                v-for="indicator in subthemeGroup.indicators"
                :key="indicator.id"
                :indicator="indicator"
                :selected-indicator-id="selectedIndicatorId"
                @indicator-selected="$emit('indicator-selected', $event)"
              />
            </div>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { getIndicatorsByTheme, sortSubthemesByTheme } from '@/config/indicatorsConfig'
import SubthemeFilterButtons from './SubthemeFilterButtons.vue'
import IndicatorCard from './IndicatorCard.vue'

interface Indicator {
  id: string
  label: string
  subtheme?: string
  [key: string]: any
}

interface SubthemeGroup {
  subtheme: string
  indicators: Indicator[]
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
  showButtonsOnly: {
    type: Boolean,
    default: false
  },
  showIndicatorsOnly: {
    type: Boolean,
    default: false
  },
  modelValue: {
    type: String,
    default: null
  }
})

const emit = defineEmits<{
  (e: 'indicator-selected', indicator: Indicator): void
  (e: 'update:modelValue', subtheme: string | null): void
}>()

const internalSelectedSubtheme = ref<string | null>(props.modelValue)

const themeIndicators = computed<Indicator[]>(() => {
  return getIndicatorsByTheme(props.activeThemeId)
})

const subthemes = computed<string[]>(() => {
  const subthemesList = [...new Set(themeIndicators.value.map(ind => ind.subtheme).filter(Boolean) as string[])]
  // Utiliser la fonction de tri personnalisée selon le thème
  return sortSubthemesByTheme(props.activeThemeId, subthemesList)
})

// Réinitialiser avec la première sous-thématique quand le thème change
watch(() => props.activeThemeId, () => {
  if (subthemes.value.length > 0) {
    const first = subthemes.value[0] ?? null
    internalSelectedSubtheme.value = first
    emit('update:modelValue', first)
  } else {
    internalSelectedSubtheme.value = null
    emit('update:modelValue', null)
  }
})

// Initialiser avec la première sous-thématique au premier chargement si aucune n'est sélectionnée
watch(subthemes, (newSubthemes) => {
  if (newSubthemes.length > 0 && internalSelectedSubtheme.value === null && props.modelValue === null) {
    const first = newSubthemes[0] ?? null
    internalSelectedSubtheme.value = first
    emit('update:modelValue', first)
  }
}, { immediate: true })

watch(() => props.modelValue, (newValue) => {
  internalSelectedSubtheme.value = newValue
})

watch(internalSelectedSubtheme, (newValue) => {
  emit('update:modelValue', newValue)
})

const selectedSubtheme = internalSelectedSubtheme

const filteredIndicators = computed<Indicator[]>(() => {
  if (!selectedSubtheme.value) {
    return themeIndicators.value // Afficher tous les indicateurs si "Tous" est sélectionné
  }
  return themeIndicators.value.filter(ind => ind.subtheme === selectedSubtheme.value)
})

const groupedIndicators = computed<SubthemeGroup[]>(() => {
  const groups: Record<string, SubthemeGroup> = {}
  
  themeIndicators.value.forEach(indicator => {
    const subtheme = indicator.subtheme || 'Autres'
    if (!groups[subtheme]) {
      groups[subtheme] = {
        subtheme,
        indicators: []
      }
    }
    groups[subtheme].indicators.push(indicator)
  })
  
  // Trier les groupes selon l'ordre personnalisé des sous-thématiques
  const sortedSubthemes = sortSubthemesByTheme(props.activeThemeId, Object.keys(groups))
  return sortedSubthemes.map((subtheme: string) => groups[subtheme]).filter(Boolean) as SubthemeGroup[]
})

/**
 * Calcule le nombre d'indicateurs pour une sous-thématique donnée.
 * @param {string} subtheme - Nom de la sous-thématique
 * @returns {number} Nombre d'indicateurs
 */
const getIndicatorsCountForSubtheme = (subtheme: string): number => {
  return themeIndicators.value.filter(ind => ind.subtheme === subtheme).length
}

/**
 * Gère le changement de sous-thématique sélectionnée.
 * @param {string|null} newSubtheme - Nouvelle sous-thématique sélectionnée
 */
const handleSubthemeChange = (newSubtheme: string | null) => {
  selectedSubtheme.value = newSubtheme
  emit('update:modelValue', newSubtheme)
}
</script>

<style scoped>
@import '@/assets/css/components/theme-indicators.css';
</style>

