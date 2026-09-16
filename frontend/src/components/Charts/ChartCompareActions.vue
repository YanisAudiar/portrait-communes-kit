<template>
  <div class="action-buttons">
    <button
      type="button"
      class="action-btn add-btn"
      :disabled="!canAdd"
      @click="$emit('add')"
    >
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 5v14M5 12h14" />
      </svg>
      Ajouter
    </button>
    <button
      type="button"
      class="action-btn remove-btn"
      :disabled="comparisonCount === 0"
      @click="$emit('remove-last')"
    >
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M5 12h14" />
      </svg>
      Supprimer
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  canAdd: boolean
  comparisonCount: number
}>()

defineEmits<{
  (e: 'add'): void
  (e: 'remove-last'): void
}>()
</script>

<style scoped>
.action-buttons {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  border-radius: 6px;
  font-size: 0.813rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn .icon {
  width: 14px;
  height: 14px;
}

.add-btn {
  background: #10b981;
  border: 1px solid #059669;
  color: white;
}

.add-btn:hover:not(:disabled) {
  background: #059669;
}

.add-btn:disabled {
  background: #d1d5db;
  border-color: #d1d5db;
  cursor: not-allowed;
}

.remove-btn {
  background: white;
  border: 1px solid #e2e8f0;
  color: #64748b;
}

.remove-btn:hover:not(:disabled) {
  background: #fee2e2;
  border-color: #fca5a5;
  color: #dc2626;
}

.remove-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .action-buttons {
    flex-direction: column;
  }

  .action-btn {
    justify-content: center;
  }
}
</style>
