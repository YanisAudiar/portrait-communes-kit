<template>
  <button
    class="subtheme-button glass-panel glass-panel--interactive"
    :style="styleVariables"
    @click="$emit('click')"
  >
    <span class="subtheme-label">{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

/**
 * Composant bouton pour une sous-thématique avec style "glass-panel".
 * Utilisé dans ThemeTab.vue pour afficher les boutons de navigation vers les sections.
 * 
 * @component SubthemeGlassButton
 */
const props = defineProps({
  label: {
    type: String,
    required: true
  },
  themeColor: {
    type: String,
    default: '#f17e08'
  },
  themeColorRgb: {
    type: String,
    default: '241, 126, 8'
  }
})

const styleVariables = computed(() => ({
  '--theme-accent': props.themeColor,
  '--theme-accent-rgb': props.themeColorRgb,
  '--glass-radius': '16px',
  '--glass-bg-alpha': '0.9'
}))
</script>
