<template>
  <button
    type="button"
    class="export-btn"
    :class="[`export-${type}`, { compact }]"
    :disabled="disabled"
    :title="title"
    @click="$emit('click')"
  >
    <!-- CSV -->
    <svg v-if="type === 'csv'" class="export-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
    </svg>
    <!-- Excel -->
    <svg v-else-if="type === 'excel'" class="export-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <path d="M8 13h2l2 3 2-6 2 3h2"></path>
    </svg>
    <!-- PNG -->
    <svg v-else-if="type === 'png'" class="export-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <circle cx="8.5" cy="8.5" r="1.5"></circle>
      <polyline points="21 15 16 10 5 21"></polyline>
    </svg>
    <!-- Share -->
    <svg v-else-if="type === 'share'" class="export-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="18" cy="5" r="3"></circle>
      <circle cx="6" cy="12" r="3"></circle>
      <circle cx="18" cy="19" r="3"></circle>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
    </svg>
    <span v-if="!compact" class="btn-label">{{ exportLabel }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    type: 'csv' | 'excel' | 'png' | 'share'
    compact?: boolean
    disabled?: boolean
    title?: string
  }>(),
  { compact: false, disabled: false, title: '' }
)

defineEmits<{ (e: 'click'): void }>()

const LABELS: Record<string, string> = {
  csv: 'CSV',
  excel: 'Excel',
  png: 'PNG',
  share: 'Partager'
}

const exportLabel = computed(() => LABELS[props.type] ?? '')
</script>

<style scoped>
/* Icônes : taille lisible conservée */
.export-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  color: #4a5568;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.export-btn:hover:not(:disabled) {
  background: #f7fafc;
  border-color: #cbd5e0;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.export-btn:active:not(:disabled) {
  transform: translateY(0);
}

.export-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Mode compact : encarts plus petits (icônes inchangées) */
.export-btn.compact {
  padding: 5px 8px;
  gap: 4px;
  font-size: 11px;
}

.export-btn.compact .export-icon {
  width: 16px;
  height: 16px;
}

/* Mobile : encarts réduits pour éviter l'effet imposant sur petit écran */
@media (max-width: 768px) {
  .export-btn {
    padding: 3px 5px;
    gap: 2px;
    font-size: 10px;
    border-radius: 4px;
  }

  .export-btn.compact {
    padding: 2px 4px;
    gap: 2px;
    font-size: 10px;
    min-width: 24px;
    min-height: 24px;
  }

  /* Icônes réduites en mobile pour proportion harmonieuse avec l'encart */
  .export-btn .export-icon {
    width: 14px;
    height: 14px;
  }
}

/* Très petit écran : encarts encore plus discrets */
@media (max-width: 480px) {
  .export-btn {
    padding: 2px 4px;
    border-radius: 4px;
  }

  .export-btn.compact {
    padding: 2px 3px;
    min-width: 22px;
    min-height: 22px;
  }

  .export-btn .export-icon {
    width: 12px;
    height: 12px;
  }
}

.export-csv:hover:not(:disabled) {
  border-color: #48bb78;
  color: #2f855a;
}

.export-excel:hover:not(:disabled) {
  border-color: #38a169;
  color: #276749;
}

.export-png:hover:not(:disabled) {
  border-color: #4299e1;
  color: #2b6cb0;
}

.export-share:hover:not(:disabled) {
  border-color: #667eea;
  color: #5a67d8;
}

.btn-label {
  white-space: nowrap;
}
</style>
