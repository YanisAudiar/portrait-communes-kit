<template>
  <button
    class="indicator-item glass-panel glass-panel--compact glass-panel--interactive"
    :class="buttonClasses"
    :style="styleVariables"
    :data-indicator-id="indicator.id"
    :data-subtheme="indicator.subtheme"
    @click="$emit('select', indicator)"
    @mouseenter="$emit('hover', indicator.id)"
    @mouseleave="$emit('hover', null)"
  >
    <div v-if="indicator.available" class="indicator-badge-available">
      ✓ Disponible
    </div>

    <div class="indicator-content">
      <div class="indicator-header">
        <h4 class="indicator-label">{{ indicator.label }}</h4>
        <span class="indicator-unit">{{ indicator.unit }}</span>
      </div>
      <p class="indicator-description">{{ indicator.description }}</p>
    </div>

    <div class="indicator-marker"></div>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Indicator {
  id: string
  label: string
  unit?: string
  description?: string
  subtheme?: string
  available?: boolean
  [key: string]: any
}

const props = defineProps({
  indicator: {
    type: Object as () => Indicator,
    required: true
  },
  themeColor: {
    type: String,
    default: '#f17e08'
  },
  themeColorRgb: {
    type: String,
    default: '241, 126, 8'
  },
  isActive: {
    type: Boolean,
    default: false
  },
  isHighlighted: {
    type: Boolean,
    default: false
  },
  isSubthemeActive: {
    type: Boolean,
    default: false
  }
})

defineEmits<{
  (e: 'select', indicator: Indicator): void
  (e: 'hover', indicatorId: string | null): void
}>()

const buttonClasses = computed(() => ({
  active: props.isActive,
  highlighted: props.isHighlighted,
  available: props.indicator.available,
  'subtheme-active': props.isSubthemeActive
}))

const styleVariables = computed(() => ({
  '--theme-color': props.themeColor,
  '--theme-color-rgb': props.themeColorRgb,
  '--glass-radius': '12px',
  '--glass-bg-alpha': '0.8',
  '--glass-blur': '8px',
  '--glass-border-color': 'rgba(229, 231, 235, 0.7)'
}))
</script>


