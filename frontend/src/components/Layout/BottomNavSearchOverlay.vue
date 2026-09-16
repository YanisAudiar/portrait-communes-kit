<template>
  <Transition name="slide-up">
    <div v-if="open" class="search-overlay" @click.self="$emit('close')">
      <div class="search-panel">
        <div class="search-header">
          <h3>Rechercher une commune</h3>
          <button type="button" class="close-btn" @click="$emit('close')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="search-input-wrapper">
          <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            ref="inputRef"
            type="text"
            :value="modelValue"
            placeholder="Nom de la commune..."
            class="search-input"
            @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
          />
        </div>
        <div v-if="results.length" class="search-results">
          <button
            v-for="result in results"
            :key="result.code_insee"
            type="button"
            class="search-result-item"
            @click="$emit('select', result)"
          >
            <span class="result-name">{{ result.nom }}</span>
            <span class="result-code">{{ result.code_insee }}</span>
          </button>
        </div>
        <p v-else-if="modelValue.length >= 2" class="search-no-results">
          Aucune commune trouvée pour « {{ modelValue }} »
        </p>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'

export interface SearchResult {
  code_insee: string
  nom: string
}

const props = defineProps<{
  open: boolean
  modelValue: string
  results: SearchResult[]
}>()

defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'close'): void
  (e: 'select', result: SearchResult): void
}>()

const inputRef = ref<HTMLInputElement | null>(null)

function focusInput() {
  nextTick(() => inputRef.value?.focus())
}

watch(() => props.open, isOpen => {
  if (isOpen) focusInput()
})

defineExpose({ focusInput })
</script>

<style scoped>
.search-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 10000;
  display: flex;
  align-items: flex-end;
}

.search-panel {
  width: 100%;
  background: white;
  border-radius: 24px 24px 0 0;
  padding: 20px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom, 0));
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.search-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: #f3f4f6;
  border: none;
  border-radius: 50%;
  color: #6b7280;
  cursor: pointer;
}

.search-input-wrapper {
  position: relative;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-input {
  width: 100%;
  padding: 14px 14px 14px 48px;
  font-size: 16px;
  font-family: inherit;
  border: 2px solid #e5e7eb;
  border-radius: 14px;
  outline: none;
  transition: border-color 0.2s ease;
}

/* Mobile : panel plus haut pour laisser la place aux suggestions de communes */
@media (max-width: 768px) {
  .search-panel {
    padding: 12px 16px;
    padding-bottom: calc(12px + env(safe-area-inset-bottom, 0));
    max-height: 85vh;
  }

  .search-header {
    margin-bottom: 10px;
  }

  .search-header h3 {
    font-size: 15px;
  }

  .close-btn {
    width: 32px;
    height: 32px;
  }

  .search-input-wrapper {
    margin-bottom: 10px;
  }

  .search-icon {
    left: 10px;
    width: 18px;
    height: 18px;
  }

  .search-input {
    padding: 10px 10px 10px 38px;
    font-size: 15px;
    border-radius: 10px;
    border-width: 1px;
  }

  .search-result-item {
    padding: 10px 12px;
    border-radius: 10px;
  }

  .result-name {
    font-size: 14px;
  }

  .result-code {
    font-size: 11px;
    padding: 3px 6px;
  }
}

.search-input:focus {
  border-color: var(--primary-blue, #1e2972);
}

.search-no-results {
  flex-shrink: 0;
  margin: 0;
  padding: 12px 0;
  font-size: 14px;
  color: #6b7280;
  text-align: center;
}

/* Zone résultats scrollable : prend l'espace restant pour que les communes soient toujours visibles */
.search-results {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.search-result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-result-item:active {
  background: #f3f4f6;
  transform: scale(0.98);
}

.result-name {
  font-weight: 500;
  color: #1f2937;
}

.result-code {
  font-size: 12px;
  color: #6b7280;
  background: #e5e7eb;
  padding: 4px 8px;
  border-radius: 6px;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
}

.slide-up-enter-from .search-panel,
.slide-up-leave-to .search-panel {
  transform: translateY(100%);
}
</style>
