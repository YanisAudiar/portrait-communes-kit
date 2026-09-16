<template>
  <div class="year-selector-wrapper">
    <label for="year-select" class="year-label">Année</label>
    <div class="select-wrapper">
      <select 
        id="year-select"
        :value="displayValue" 
        @change="handleChange"
        class="year-select"
      >
        <option 
          v-for="year in sortedYears" 
          :key="year" 
          :value="year"
        >
          {{ year }}
        </option>
      </select>
      <svg class="select-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, nextTick } from 'vue'

const props = defineProps<{
  modelValue: number | string | null
  availableYears: Array<number | string>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | string): void
}>()

// Sort years in descending order (most recent first)
const sortedYears = computed(() => {
  return [...props.availableYears].sort((a, b) => Number(b) - Number(a))
})

// Valeur affichée : si aucune année sélectionnée mais des années dispo, afficher la plus récente
const displayValue = computed(() => {
  if (props.modelValue != null && props.modelValue !== '') return props.modelValue
  return sortedYears.value[0] ?? ''
})

/**
 * Le <select> montrait la dernière année sans mettre à jour le v-model : le graphique
 * restait sur selectedYear=null (pas d’init Chart.js). On pousse l’année par défaut dès
 * que des années sont disponibles et qu’aucune valeur n’est encore liée.
 */
watch(
  [sortedYears, () => props.modelValue],
  () => {
    const years = sortedYears.value
    if (years.length === 0) return
    const mv = props.modelValue
    if (mv != null && mv !== '') return
    const y = years[0]!
    const num = Number(y)
    nextTick(() => {
      emit('update:modelValue', Number.isNaN(num) ? y : num)
    })
  },
  { immediate: true }
)

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const value = target.value
  // Convert to number if it's a valid number
  const numValue = Number(value)
  emit('update:modelValue', isNaN(numValue) ? value : numValue)
}
</script>

<style scoped>
.year-selector-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding: 0.5rem 0;
}

.year-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #4a5568;
  margin: 0;
}

.select-wrapper {
  position: relative;
  display: inline-block;
  min-width: 120px;
}

.year-select {
  appearance: none;
  width: 100%;
  padding: 0.5rem 2.5rem 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.5;
  color: #2d3748;
  background-color: #ffffff;
  border: 1px solid #cbd5e0;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

.year-select:hover {
  border-color: #a0aec0;
}

.year-select:focus {
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.select-arrow {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: #718096;
  pointer-events: none;
  transition: color 0.2s ease;
}

.year-select:hover + .select-arrow,
.year-select:focus + .select-arrow {
  color: #4a5568;
}
</style>
