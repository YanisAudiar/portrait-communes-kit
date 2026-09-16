<template>
  <div class="form-group">
    <label class="form-label">Sélectionner une commune</label>
    <div class="search-container">
      <input
        :value="modelValue"
        type="text"
        class="search-input"
        placeholder="Rechercher une commune..."
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @focus="$emit('focus')"
      />
      <Transition name="fade">
        <div v-if="showDropdown && filteredCommunes.length > 0" class="search-dropdown">
          <button
            v-for="commune in filteredCommunes"
            :key="commune.code"
            type="button"
            class="dropdown-item"
            :class="{ 'is-disabled': isCodeAlreadyCompared(commune.code) }"
            :disabled="isCodeAlreadyCompared(commune.code)"
            @click="select(commune)"
          >
            <span class="commune-name">{{ commune.label }}</span>
            <span v-if="isCodeAlreadyCompared(commune.code)" class="already-added">
              (déjà ajouté)
            </span>
          </button>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

export interface CommuneOption {
  code: string
  label: string
}

const props = withDefaults(
  defineProps<{
    modelValue: string
    filteredCommunes: CommuneOption[]
    showDropdown: boolean
    comparisonCodes: string[]
    mainCommuneCode?: string
  }>(),
  { mainCommuneCode: '' }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'focus'): void
  (e: 'select', commune: CommuneOption): void
  (e: 'close-dropdown'): void
}>()

function isCodeAlreadyCompared(code: string): boolean {
  return props.comparisonCodes.includes(code)
}

function select(commune: CommuneOption) {
  if (isCodeAlreadyCompared(commune.code)) return
  emit('select', commune)
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.search-container')) {
    emit('close-dropdown')
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.813rem;
  font-weight: 500;
  color: #64748b;
}

.search-container {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 0.625rem 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #1e293b;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-input::placeholder {
  color: #94a3b8;
}

.search-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  max-height: 240px;
  overflow-y: auto;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  z-index: 50;
}

.dropdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.625rem 1rem;
  background: transparent;
  border: none;
  text-align: left;
  font-size: 0.875rem;
  color: #1e293b;
  cursor: pointer;
  transition: background 0.15s ease;
}

.dropdown-item:hover:not(.is-disabled) {
  background: #f1f5f9;
}

.dropdown-item.is-disabled {
  color: #94a3b8;
  cursor: not-allowed;
}

.already-added {
  font-size: 0.75rem;
  color: #94a3b8;
  font-style: italic;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
