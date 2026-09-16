<template>
  <div :class="containerClass">
    <button
      class="subtheme-button"
      :class="{ active: selectedSubtheme === null }"
      @click="$emit('update:modelValue', null)"
    >
      <span>Tous</span>
      <span class="subtheme-count">({{ totalIndicators }})</span>
    </button>
    <button
      v-for="subtheme in subthemes"
      :key="subtheme"
      class="subtheme-button"
      :class="{ active: selectedSubtheme === subtheme }"
      @click="$emit('update:modelValue', subtheme)"
    >
      <span>{{ subtheme }}</span>
      <span class="subtheme-count">({{ getIndicatorsCountForSubtheme(subtheme) }})</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'

/**
 * Composant pour afficher les boutons de filtrage de sous-thématiques.
 * Permet de filtrer les indicateurs par sous-thématique avec compteurs.
 * Utilisé dans ThemeIndicators.vue pour le filtrage des indicateurs.
 * 
 * @component SubthemeFilterButtons
 */
const props = defineProps({
  subthemes: {
    type: Array as PropType<string[]>,
    required: true
  },
  selectedSubtheme: {
    type: String as PropType<string | null>,
    default: null
  },
  totalIndicators: {
    type: Number,
    required: true
  },
  showButtonsOnly: {
    type: Boolean,
    default: false
  },
  getIndicatorsCountForSubtheme: {
    type: Function as PropType<(subtheme: string) => number>,
    required: true
  }
})

defineEmits<{
  (e: 'update:modelValue', subtheme: string | null): void
}>()

/**
 * Détermine la classe CSS du conteneur selon le mode d'affichage.
 */
const containerClass = computed(() => {
  return props.showButtonsOnly ? 'subthemes-buttons-only' : 'subthemes-buttons-container'
})
</script>

<style scoped>
@import '@/assets/css/components/theme-indicators.css';
</style>
